#!/usr/bin/env node
// Zero-dependency stdio MCP server (newline-delimited JSON-RPC 2.0) exposing gravity.js.
import { createInterface } from "node:readline";
import { gravityPrice, npmSizeKB } from "./gravity.js";

const num = { type: "number", minimum: 0 };
export const TOOLS = [
  { name: "price", description: "Gravity price: k * weight * 9.8 * d * (1 + h/h0).",
    inputSchema: { type: "object", required: ["weight"], properties: {
      weight: { ...num, description: "Weight (kB for software, kg for physical)" },
      k: { ...num, description: "Price constant, default 0.10" }, d: { ...num, description: "Distance, default 1" },
      h: { ...num, description: "Height, default 0" }, h0: { type: "number", exclusiveMinimum: 0, description: "Reference height, default 1000" } } } },
  { name: "price_npm", description: "Fetch the latest npm package size (kB) from the registry and gravity-price it.",
    inputSchema: { type: "object", required: ["package"], properties: {
      package: { type: "string", description: "npm package name, e.g. left-pad or @scope/pkg" },
      size: { type: "string", enum: ["tarball", "unpacked"], description: "Which size to use, default tarball" },
      k: { ...num }, d: { ...num } } } },
];

export async function callTool(name, a = {}, f = fetch) {
  if (name === "price") {
    const value = gravityPrice(a);
    return { value, ...a };
  }
  if (name === "price_npm") {
    if (typeof a.package !== "string" || !a.package) throw new Error("invalid package");
    const weight = await npmSizeKB(a.package, a.size ?? "tarball", f);
    const p = { weight, ...(a.k !== undefined && { k: a.k }), ...(a.d !== undefined && { d: a.d }) };
    return { package: a.package, sizeKB: weight, value: gravityPrice(p) };
  }
  throw new Error(`unknown tool ${name}`);
}

export async function handle(msg, f = fetch) {
  const { id, method, params } = msg;
  const ok = (result) => ({ jsonrpc: "2.0", id, result });
  switch (method) {
    case "initialize":
      return ok({ protocolVersion: params?.protocolVersion ?? "2025-06-18", capabilities: { tools: {} },
        serverInfo: { name: "gravity-price", version: "0.1.0" } });
    case "ping": return ok({});
    case "tools/list": return ok({ tools: TOOLS });
    case "tools/call":
      try {
        const r = await callTool(params?.name, params?.arguments, f);
        return ok({ content: [{ type: "text", text: JSON.stringify(r) }], structuredContent: r });
      } catch (e) {
        return ok({ content: [{ type: "text", text: `Error: ${e.message}` }], isError: true });
      }
    default:
      if (id === undefined) return null; // notification
      return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } };
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("mcp-server.mjs")) {
  const rl = createInterface({ input: process.stdin });
  rl.on("line", async (line) => {
    if (!line.trim()) return;
    let msg;
    try { msg = JSON.parse(line); } catch {
      return process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }) + "\n");
    }
    const res = await handle(msg);
    if (res) process.stdout.write(JSON.stringify(res) + "\n");
  });
}
