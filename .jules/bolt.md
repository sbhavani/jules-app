# Bolt Journal

## 2025-12-20 - Redundant List Processing in React Render Cycle
**Learning:** Found an IIFE (Immediately Invoked Function Expression) performing expensive filtering and `JSON.parse` operations directly inside the JSX return statement, duplicating logic already present in the component body.
**Action:** Always check for heavy logic defined inline within JSX. Move data transformation logic (filtering, sorting, grouping) into `useMemo` hooks to prevent recalculation on unrelated state changes (like typing in a text input).

## 2025-12-20 - Synchronous LocalStorage in Render Loop
**Learning:** `SessionList` calls `getArchivedSessions` (which reads `localStorage` and parses JSON) on every render cycle. This blocks the main thread and causes jank, especially during interactions like typing in the search box.
**Action:** Move `localStorage` reads to `useEffect` or `useState` initialization. Treat `localStorage` as an external side effect, not a derived value for rendering.

## 2025-12-20 - Expensive Diff Parsing during Layout Resize
**Learning:** `AppLayout` updates state during drag-resizing of the sidebar. This triggers re-renders of children. `CodeDiffSidebar` and `DiffViewer` were recalculating filters and parsing text diffs on every frame of the resize, causing jank.
**Action:** Memoize expensive data derivations (`filter`, `parseDiff`) using `useMemo` to ensure they only run when data actually changes, not when unrelated parent state (layout dimensions) changes.

## 2025-12-20 - Memory Leak in Terminal Component
**Learning:** `IntegratedTerminal` added a window "resize" event listener inside an async initialization function but failed to remove it in the cleanup function. This caused a memory leak of the Terminal instance, Socket connection, and FitAddon on every unmount/remount (e.g. toggling terminal).
**Action:** Ensure all event listeners added, even in async callbacks, are accessible and removed in the `useEffect` cleanup. Use a `cancelled` flag to prevent async setup from running if the component unmounts before setup completes.

## 2025-12-20 - Waterfall Data Fetching in Dashboard
**Learning:** `AnalyticsDashboard` was waiting for *all* data (sessions + sources + detailed activities) to load before rendering anything. This created a long initial loading state.
**Action:** Implement progressive rendering. Fetch and render high-level session data immediately, then fetch detailed activity data in the background to populate the remaining charts.
