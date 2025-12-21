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

## 2025-12-21 - [Visual Consistency in Kanban]
**Learning:** Visual cues like status colors and icons shouldn't just be in list views. Bringing status-colored dots and consistent typography to Kanban cards and column headers creates a unified "system" feeling. Also, using dynamic drag-over highlights that match the column's status reinforces the user's action and the data's destination.
**Action:** Synchronize status colors across all views (Lists, Kanban, Dashboards) and use them for interactive feedback (drag-over highlights).

## 2025-12-21 - [Kanban Empty States & Filter Context]
**Learning:** Kanban columns without an explicit empty state can look broken or "unfinished" to users. Additionally, providing counts within filter dropdowns (e.g., repository counts) offers valuable context before the user even makes a selection, reducing trial-and-error filtering.
**Action:** Implement dashed-border empty states for list/grid containers and include counts in data-dense filters.

## 2025-12-21 - [Search Reset Accessibility]
**Learning:** Search inputs without a clear button force users to perform multiple backspace actions, which is a friction point, especially on mobile or for long queries. Providing a one-click reset improves the fluidity of list filtering.
**Action:** Add a clear (X) button to all primary search inputs.

## 2025-12-21 - [API Key Visibility & Input Accessibility]
**Learning:** Sensitive inputs like API keys should always include a visibility toggle. This reduces user anxiety and prevents errors during setup by allowing them to verify the pasted content without exposing it permanently. Additionally, icon-only interactive elements or inputs using placeholders as labels (like chat textareas) must have explicit ARIA labels for screen reader compatibility.
**Action:** Always wrap password/key inputs with a show/hide toggle and ensure all form inputs have associated labels or `aria-label` attributes.
