# gravity-price

Prices things by gravity:

    value = k * weight * 9.8 * d * (1 + h / h0)

- **weight**: software = npm package size in kB (latest version, tarball by default, or `unpacked`); physical = kg.
- **k** price constant (default 0.10), **d** distance (default 1), **g** = 9.8.
- **h / h0**: optional height term for physical objects (h default 0, h0 default 1000). All inputs must be finite and >= 0; h0 > 0.
- Example: an 11.7 kB package with defaults -> 0.10 * 11.7 * 9.8 * 1 = 11.466.

Tools (MCP server `gravity-price`): `price` (manual calculation) and `price_npm` (fetch size from registry.npmjs.org, then price).
Commands: `/price <weight> [k=] [d=] [h=] [h0=]` and `/price-npm <package>`. Prefer the tools over mental math.
