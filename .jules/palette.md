# Palette's UX Journal

## 2025-12-14 - Empty State Precision

**Learning:** Generic empty states (e.g., "No items found") are confusing when filters are active. Users may think data is lost/archived rather than just hidden.
**Action:** Always condition empty state text on active filters (e.g., "No items match your search" vs "No items yet").

## 2025-12-14 - Custom Interactive Elements

**Learning:** `div` elements with `role="button"` are invisible to screen readers without `aria-label`, unlike native `<button>` or `<input>` which often have implicit labels or associated `<label>` tags.
**Action:** Audit all `role="button"` elements for valid accessible names.

## 2025-12-14 - Dynamic ARIA States

**Learning:** Toggle buttons (expand/collapse) need more than just `aria-label`. They require `aria-expanded` to communicate state changes to screen readers.
**Action:** When implementing expanders, always pair `aria-label` (describing the action) with `aria-expanded` (describing the state).

## 2025-12-20 - Icon Button Clarity and Feedback

**Learning:** Icon-only buttons in sidebar and panels are completely opaque to screen readers without `aria-label`. Additionally, state changes (like sending or approving) without visual feedback (spinners) create a "frozen" feeling.
**Action:** Always provide `aria-label` for icon-only buttons. Use `aria-pressed` or `aria-expanded` for toggles. Add loading spinners to any action taking >200ms.

## 2025-12-20 - Visual Hierarchy with Motion

**Learning:** In complex interfaces, subtle visual cues like `BorderGlow` on AI-generated content help users instantly distinguish between system and user actions. Abrupt view changes can be jarring; `AnimatePresence` with short durations (150ms) provides a much smoother context-switching experience.
**Action:** Use glowing borders for primary AI interactions. Implement fade/scale transitions for main navigation swaps.

## 2025-12-21 - Layout Constraints in Scrollable Areas

**Learning:** Utility classes like `whitespace-nowrap` on container elements (like `ScrollArea`) forcefully inherit down to children, breaking component-level layout expectations like text wrapping in cards.
**Action:** Avoid applying text-formatting utility classes to structural containers. Let children control their own text flow.

## 2025-12-21 - Accessible Filtering

**Learning:** Using a native-like `Select` component for filtering provides better accessibility (keyboard navigation, screen reader support) out of the box compared to custom dropdowns. It also clearly communicates the current filter state without needing a separate "Active filters" display.
**Action:** Prefer `Select` or `Combobox` for list-based filters over custom buttons or toggles.

## 2025-12-21 - Contextual Sidebar Visibility

**Learning:** Dashboards and board views benefit from maximum horizontal space. Persistent sidebars that are only relevant to a specific view (like a list of chat sessions) should be hidden when navigating to global views like Analytics or Kanban to reduce visual noise and improve focus.
**Action:** Conditionally hide secondary navigation sidebars when entering primary dashboard views.

## 2025-12-21 - Progressive Disclosure for Metadata

**Learning:** While relative dates (e.g., "2 days ago") are cleaner for scanning, users often need the precision of exact timestamps. Tooltips provide the perfect mechanism for this "progressive disclosure"—keeping the interface clean while making detailed data available on demand.
**Action:** Use relative time for display and exact timestamp in tooltips.
