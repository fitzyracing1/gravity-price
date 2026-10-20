export const G = 9.8;
export function gravityPrice({ weight, k = 0.10, d = 1, h = 0, h0 = 1000 }) {
  for (const [n, v] of Object.entries({ weight, k, d, h, h0 }))
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0) throw new Error(`invalid ${n}`);
  if (h0 === 0) throw new Error("invalid h0");
  return k * weight * G * d * (1 + h / h0);
}
export async function npmSizeKB(name, which = "tarball", f = fetch) {
  const r = await f(`https://registry.npmjs.org/${encodeURIComponent(name).replace("%40", "@")}/latest`);
  if (!r.ok) throw new Error(`npm lookup failed (${r.status})`);
  const meta = await r.json();
  if (which === "unpacked") {
    if (!meta.dist?.unpackedSize) throw new Error("no unpackedSize in registry");
    return meta.dist.unpackedSize / 1000;
  }
  const t = await f(meta.dist.tarball);
  if (!t.ok) throw new Error("tarball fetch failed");
  return (await t.arrayBuffer()).byteLength / 1000;
}
