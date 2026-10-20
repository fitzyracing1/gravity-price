import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { handle, callTool } from "./mcp-server.mjs";

// manifest checks against documented fields
const m = JSON.parse(readFileSync("gemini-extension.json", "utf8"));
assert.match(m.name, /^[a-z0-9-]+$/); assert.equal(m.name, "gravity-price");
assert.equal(typeof m.version, "string"); assert.equal(typeof m.description, "string");
assert.ok(existsSync(m.contextFileName));
for (const s of Object.values(m.mcpServers)) { assert.equal(s.command, "node"); assert.ok(existsSync(s.args[0].replace("${extensionPath}${/}", ""))); }
for (const f of readdirSync("commands")) {
  const t = readFileSync(`commands/${f}`, "utf8");
  assert.match(t, /^description = "/m); assert.match(t, /^prompt = """/m); assert.match(t, /\{\{args\}\}/);
}

// unit: handler
const fakeFetch = async (url) => url.includes("registry")
  ? { ok: true, json: async () => ({ dist: { tarball: "t", unpackedSize: 50000 } }) }
  : { ok: true, arrayBuffer: async () => new ArrayBuffer(11700) };
const init = await handle({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18" } });
assert.equal(init.result.serverInfo.name, "gravity-price");
const list = await handle({ jsonrpc: "2.0", id: 2, method: "tools/list" });
assert.deepEqual(list.result.tools.map((t) => t.name), ["price", "price_npm"]);
assert.ok(Math.abs((await callTool("price", { weight: 11.7 })).value - 11.466) < 1e-9);
const n = await callTool("price_npm", { package: "x" }, fakeFetch);
assert.equal(n.sizeKB, 11.7); assert.ok(Math.abs(n.value - 11.466) < 1e-9);
assert.equal((await callTool("price_npm", { package: "x", size: "unpacked", k: 1 }, fakeFetch)).sizeKB, 50);
const bad = await handle({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "price", arguments: { weight: -1 } } });
assert.equal(bad.result.isError, true);
assert.equal((await handle({ jsonrpc: "2.0", id: 4, method: "nope" })).error.code, -32601);
assert.equal(await handle({ jsonrpc: "2.0", method: "notifications/initialized" }), null);

// e2e: stdio handshake
const p = spawn(process.execPath, ["mcp-server.mjs"]);
let out = ""; p.stdout.on("data", (d) => (out += d));
const send = (o) => p.stdin.write(JSON.stringify(o) + "\n");
send({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "0" } } });
send({ jsonrpc: "2.0", method: "notifications/initialized" });
send({ jsonrpc: "2.0", id: 2, method: "tools/list" });
send({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "price", arguments: { weight: 2, k: 1, d: 2 } } });
await new Promise((r) => { const i = setInterval(() => { if (out.split("\n").filter(Boolean).length >= 3) { clearInterval(i); r(); } }, 20); });
p.kill();
const rs = out.trim().split("\n").map((l) => JSON.parse(l));
assert.deepEqual(rs.map((r) => r.id), [1, 2, 3]);
assert.ok(Math.abs(rs[2].result.structuredContent.value - 39.2) < 1e-9);
console.log("extension tests passed");
