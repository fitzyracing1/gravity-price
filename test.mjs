import assert from "node:assert/strict";
import { gravityPrice } from "./gravity.js";
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
// Example data: 11.7 kB package, k=0.10, d=1 -> 11.466
close(gravityPrice({ weight: 11.7 }), 11.466);
close(gravityPrice({ weight: 2, k: 1, d: 2 }), 39.2);
close(gravityPrice({ weight: 1, k: 1, h: 1000, h0: 1000 }), 19.6);
assert.throws(() => gravityPrice({ weight: -1 }));
assert.throws(() => gravityPrice({ weight: 1, h0: 0 }));
console.log("all tests passed");
