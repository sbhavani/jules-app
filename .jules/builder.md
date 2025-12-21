# Builder's Journal

## 2025-12-20 - [Builder Init] **Context:** [Project Root] **Snippet:** [N/A]
Initialized Builder's Journal.

## 2025-12-20 - [DndKit] **Context:** [Kanban Board] **Snippet:** [Use DndContext, DragOverlay, SortableContext]
Using @dnd-kit for the Kanban board implementation as requested in the issue.

## 2025-01-01 - [Logging vs. Debugging Insight] **Context:** [Distinguishing between temporary debug logs and permanent event logs] **Snippet:** [If breaking: use console.log then delete; If business event: use Logger.info() and keep]
Agents often confuse temporary debugging with permanent logging. Rule:
- If you are checking why code is broken: Use `console.log` -> Run Code -> Delete `console.log`.
- If you are recording a business event: Use `Logger.info()` -> Keep it.