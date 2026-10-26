# gravity-price

A zero-dependency static calculator for a "gravity-based market":

```
price = k × weight × g × d          g = 9.8 m/s²
physical: price = k × mass_kg × g × d × (1 + h/h0)   (default h = 0, h0 = 1000 m)
software: weight = package size in kB (1 kB = 1000 bytes)
```

- **k** — price per weight unit (default 0.10)
- **d** — demand multiplier (default 1)
- **h / h0** — optional height/distance term for physical shipments

Software mode can fetch a package's tarball or unpacked size from the public npm registry.

## Example (example data)

> **Example data:** a 11.7 kB package, k = $0.10, d = 1 → 0.10 × 11.7 × 9.8 × 1 = **$11.47** per buyer (11.466).

## Use

Live: https://fitzyracing1.github.io/gravity-price/ — or open `index.html` via any static server.
Tests: `npm test` (Node 18+, no dependencies). CI shows lit when tests pass, dark when they fail.

MIT © 2026 Joshua Almeida

## Gemini CLI extension

```sh
gemini extensions install https://github.com/fitzyracing1/gravity-price
```

Adds:
- `/price <weight> [k=0.10] [d=1] [h=0] [h0=1000]` — manual calculation
- `/price-npm <package> [k=] [d=] [unpacked]` — fetch the npm package size (kB) from the registry and price it
- A zero-dependency stdio MCP server (`mcp-server.mjs`) with `price` and `price_npm` tools, reusing `gravity.js`
- `GEMINI.md` context explaining the formula

## Plans

This project is free, and its license stays as is. Support it through [GitHub Sponsors](https://github.com/sponsors/fitzyracing1):

- **Free**: use the code, community support.
- **Pro ($49/month)**: priority issues and support.
- **Team ($199/month)**: priority support for your team plus early access.
