## 2025-12-15 - Testing Browser Globals in Node

**Learning:** When unit testing code that relies on browser globals like `localStorage` in a Node-based Jest environment (default for Next.js), you must explicitly mock `global.localStorage` AND `global.window` (if the code checks for `window` existence). Merely mocking `window.localStorage` is insufficient if the code calls `localStorage` directly.
**Action:** Use `Object.defineProperty(global, ...)` for both `window` and `localStorage` in `beforeAll` blocks when testing client-side utilities in a Node environment.
