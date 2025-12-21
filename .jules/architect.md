## 2025-12-20 - Issue Tracking Synchronization

**Insight:** Some features marked as "Planned" or "Open" in the PRD (like Session Templates and Branch Selection) are already implemented and closed in GitHub. The PRD summary table had some ID mismatches (e.g., Session Templates as SESSION-006 instead of SESSION-005).

**Guideline:** Always verify the actual implementation in the codebase and the status in GitHub Issues before relying on the PRD status markers. Ensure ID consistency between the issue title and the PRD entry.

## 2025-12-20 - Workflow Integration Strategy

**Insight:** The "Jules Sandbox" model is insufficient for professional workflows. Developers need to pull context *from* their existing tools (GitHub Issues) into Jules, rather than just pushing code *to* them.

**Guideline:** Prioritize features that reduce context switching. "Import Issue" (SESSION-010) is a key enabler for this "Pick & Fix" workflow. Future features should follow this pattern (e.g., "Import PR comments").

## 2025-12-20 - The "Control Tower" Shift

**Insight:** With the introduction of "Pick & Fix" (SESSION-010), users will likely have multiple sessions running in parallel (one per bug). The current "List View" is inadequate for managing this concurrency.

**Guideline:** Elevated "Kanban Board" (SESSION-009) and "Session Health" (ANALYTICS-004) to P1. These are no longer "nice to have" visualizations; they are essential infrastructure for managing the new multi-session workflow. Visualizing *flow* is now as important as the *code* itself.
