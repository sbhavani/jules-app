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