# Product Requirements Document: Jules UI

> **GitHub Issues**: All features are tracked as [GitHub Issues](https://github.com/sbhavani/jules-app/issues). Issue numbers are linked throughout this document.

## Vision

A powerful, self-hosted web application for managing Jules AI agent sessions with advanced developer tooling, including live code diffs, terminal output inspection, session analytics, and automated workflow orchestration.

## Current Status (v1.1)

### ✅ Implemented Features

<details>
<summary><strong>Core Functionality (P0)</strong></summary>

- **AUTH-001**: API Key Management ([#1](https://github.com/sbhavani/jules-app/issues/1)) ✅ _Closed_
  - ✅ Secure storage in localStorage
  - ✅ Input validation and error handling
  - ✅ Logout functionality

- **SESSION-001**: Session List View ([#2](https://github.com/sbhavani/jules-app/issues/2)) ✅ _Closed_
  - ✅ Display all sessions with status badges (active, completed, failed, paused)
  - ✅ Sort by last activity (newest first)
  - ✅ Session title and timestamp display
  - ✅ Click to view session details

- **SESSION-002**: Session Detail View ([#3](https://github.com/sbhavani/jules-app/issues/3)) ✅ _Closed_
  - ✅ Real-time activity feed with 5-second auto-polling
  - ✅ User messages vs agent responses
  - ✅ Scroll to latest activity
  - ✅ Activity grouping (consecutive progress updates)

- **SESSION-003**: Create New Session ([#4](https://github.com/sbhavani/jules-app/issues/4)) ✅ _Closed_
  - ✅ Repository/source selection
  - ✅ Session title (optional)
  - ✅ Initial prompt/instructions (required)

- **ACTIVITY-001**: Send Messages to Session ([#5](https://github.com/sbhavani/jules-app/issues/5)) ✅ _Closed_
  - ✅ Text input with Enter/Shift+Enter support
  - ✅ Visual feedback during sending
  - ✅ Error handling for failed messages

- **UI-001**: Mobile-Responsive Layout ([#6](https://github.com/sbhavani/jules-app/issues/6)) ✅ _Closed_
  - ✅ Mobile-first design approach
  - ✅ Sheet navigation for mobile (<768px)
  - ✅ Sidebar navigation for desktop (≥768px)
  - ✅ Touch-optimized interactions

</details>

<details>
<summary><strong>Enhanced Features (P1)</strong></summary>

- **SESSION-004**: Archive Sessions ([#7](https://github.com/sbhavani/jules-app/issues/7)) ✅ _Closed_
  - ✅ Archive completed sessions
  - ✅ Remove from active list (localStorage)

- **ACTIVITY-002**: Activity Type Indicators ([#8](https://github.com/sbhavani/jules-app/issues/8)) ✅ _Closed_
  - ✅ Visual badges (plan, progress, error, result, message)
  - ✅ Color-coded status indicators
  - ✅ Role-based avatars (user vs agent)

- **UI-002**: Dark Mode Support ([#10](https://github.com/sbhavani/jules-app/issues/10)) ✅ _Closed_
  - ✅ System preference detection
  - ✅ Manual toggle option
  - ✅ Persistent user preference

- **UI-003**: Loading States ([#11](https://github.com/sbhavani/jules-app/issues/11)) ✅ _Closed_
  - ✅ Loading indicators for activities
  - ✅ Optimistic UI updates
  - ✅ Global loading state for auth

- **SEARCH-001**: Session Search ([#12](https://github.com/sbhavani/jules-app/issues/12)) ✅ _Closed_
  - ✅ Search sessions by title
  - ✅ Filter by repository/source
  - ✅ Real-time search results

- **SOURCE-001**: Repository Management ([#9](https://github.com/sbhavani/jules-app/issues/9)) ✅ _Closed_
  - ✅ View connected GitHub repositories
  - ✅ Repository selection in new session dialog
  - ✅ Repository metadata display

- **ANALYTICS-001**: Usage Analytics Dashboard ([#17](https://github.com/sbhavani/jules-app/issues/17)) ✅ _Closed_
  - ✅ Session statistics (total, active, completed, failed)
  - ✅ Activity volume over time
  - ✅ Success rate metrics
  - ✅ Average session duration

</details>

<details>
<summary><strong>Advanced Features (P2)</strong></summary>

- **ACTIVITY-003**: Rich Message Formatting ([#15](https://github.com/sbhavani/jules-app/issues/15)) ✅ _Closed_
  - ✅ Markdown rendering with ReactMarkdown
  - ✅ Syntax highlighting for code blocks
  - ✅ JSON formatting for structured data
  - ✅ Plan step rendering

- **DIFF-001**: Code Diff Viewer ✅ _Closed_
  - ✅ Live git patch visualization
  - ✅ Unified diff format rendering
  - ✅ Syntax highlighting
  - ✅ Toggle sidebar view

- **TERMINAL-001**: Bash Output Inspector ✅ _Closed_
  - ✅ Detailed terminal output display
  - ✅ Expandable/collapsible output
  - ✅ Syntax highlighting for shell commands

- **PLAN-001**: Plan Approval Workflow ([#22](https://github.com/sbhavani/jules-app/issues/22)) ✅ _Closed_
  - ✅ Detect plan generation activities
  - ✅ Approve plan button
  - ✅ Plan approval state tracking

- **DEV-001**: Integrated Local Terminal ([#34](https://github.com/sbhavani/jules-app/issues/34)) ✅ _Closed_
  - ✅ Integrate a terminal within the Jules UI
  - ✅ Connection to local terminal server
  - ✅ Real-time output and command history
  - ✅ ✅ **v1.1**: Fixed memory leak and lifecycle management issues.

</details>

<details open>
<summary><strong>⚡ Performance Optimizations (v1.1)</strong></summary>

- **PERF-001**: Memoized Data Derivations
  - ✅ Memoized activity feed filtering and grouping logic.
  - ✅ Memoized unified diff parsing to prevent UI jank during resizing.
  - ✅ Prevents redundant O(N) operations and JSON parsing on every render frame.

- **PERF-002**: Non-Blocking I/O
  - ✅ Moved synchronous `localStorage` reads out of the React render loop in `SessionList`.
  - ✅ Eliminates main-thread blocking during session filtering and search.

- **PERF-003**: Progressive Dashboard Loading
  - ✅ Refactored `AnalyticsDashboard` to render session statistics immediately.
  - ✅ Activity breakdown data now loads in the background with contextual spinners.

</details>

## MoSCoW Prioritization (Future Work)

### SHOULD HAVE (P1 - Next Release)

- **SESSION-005**: Session Templates ([#14](https://github.com/sbhavani/jules-app/issues/14)) ✅ _Closed_
  - ✅ Save and reuse common prompts as templates
  - ✅ Template library/list view
  - ✅ Create session from template

- **SESSION-006**: Branch Selection Support ([#21](https://github.com/sbhavani/jules-app/issues/21)) ✅ _Closed_
  - ✅ Specify starting branch in New Session dialog
  - ✅ Support for non-main branches in API client
  - ✅ Branch metadata display in session details

- **SESSION-009**: Kanban Board View ([#31](https://github.com/sbhavani/jules-app/issues/31)) 🟡 _Open_
  - 🟡 'Control Tower' for parallel sessions
  - 🟡 Status columns (Running, Waiting, Done)
  - 🟡 Quick actions

- **SESSION-010**: GitHub Issue Integration ([#49](https://github.com/sbhavani/jules-app/issues/49)) 🟡 _Open_
  - 🟡 Select active GitHub issue in New Session dialog
  - 🟡 Pre-fill prompt with issue context
  - 🟡 Auto-suggest branch names

- **ANALYTICS-004**: Session Health Monitoring ([#33](https://github.com/sbhavani/jules-app/issues/33)) 🟡 _Open_
  - 🟡 Detect stalled agents
  - 🟡 Health scores

- **NOTIF-001**: Error Notifications & Toast System ([#13](https://github.com/sbhavani/jules-app/issues/13)) 🟡 _Open_
- **REFACTOR-001**: Layout Component Decoupling ([#44](https://github.com/sbhavani/jules-app/issues/44)) 🟡 _Open_
- **PERF-004**: Reactive Data Fetching ([#45](https://github.com/sbhavani/jules-app/issues/45)) 🟡 _Open_
- **CLEAN-001**: Remove Debug Logging from Proxy ([#47](https://github.com/sbhavani/jules-app/issues/47)) 🟡 _Open_

### COULD HAVE (P2 - Future Enhancements)

- **ANALYTICS-002**: Code Impact Metrics ([#32](https://github.com/sbhavani/jules-app/issues/32)) 🟡 _Open_
- **TYPE-001**: Strict API Type Safety ([#46](https://github.com/sbhavani/jules-app/issues/46)) 🟡 _Open_
- **THEME-001**: Semantic Theming System ([#48](https://github.com/sbhavani/jules-app/issues/48)) 🟡 _Open_
- **EXT-001**: Modjules Library Integration ([#27](https://github.com/sbhavani/jules-app/issues/27)) 🟡 _Open_

## Technical Architecture

### Frontend Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Terminal**: xterm.js (v1.1 fixes lifecycle management)

## GitHub Issue Tracker Summary

| Issue # | ID | Title | Status | Priority |
|---|---|---|---|---|
| [#1](https://github.com/sbhavani/jules-app/issues/1) | AUTH-001 | API Key Management | ✅ Closed | P0 Critical |
| [#2](https://github.com/sbhavani/jules-app/issues/2) | SESSION-001 | Session List View | ✅ Closed | P0 Critical |
| [#3](https://github.com/sbhavani/jules-app/issues/3) | SESSION-002 | Session Detail View | ✅ Closed | P0 Critical |
| [#4](https://github.com/sbhavani/jules-app/issues/4) | SESSION-003 | Create New Session | ✅ Closed | P0 Critical |
| [#5](https://github.com/sbhavani/jules-app/issues/5) | ACTIVITY-001 | Send Messages to Session | ✅ Closed | P0 Critical |
| [#6](https://github.com/sbhavani/jules-app/issues/6) | UI-001 | Mobile-Responsive Layout | ✅ Closed | P0 Critical |
| [#7](https://github.com/sbhavani/jules-app/issues/7) | SESSION-004 | Delete/Archive Sessions | ✅ Closed | P1 Important |
| [#8](https://github.com/sbhavani/jules-app/issues/8) | ACTIVITY-002 | Activity Type Indicators | ✅ Closed | P1 Important |
| [#9](https://github.com/sbhavani/jules-app/issues/9) | SOURCE-001 | Repository Management | ✅ Closed | P1 Important |
| [#10](https://github.com/sbhavani/jules-app/issues/10) | UI-002 | Dark Mode Support | ✅ Closed | P1 Important |
| [#11](https://github.com/sbhavani/jules-app/issues/11) | UI-003 | Loading States & Skeleton Loaders | ✅ Closed | P1 Important |
| [#12](https://github.com/sbhavani/jules-app/issues/12) | SEARCH-001 | Session Search & Filtering | ✅ Closed | P1 Important |
| [#13](https://github.com/sbhavani/jules-app/issues/13) | NOTIF-001 | Error Notifications & Toast System | 🟡 Open | P1 Important |
| [#49](https://github.com/sbhavani/jules-app/issues/49) | SESSION-010 | GitHub Issue Integration | 🟡 Open | P1 Important |
| [#14](https://github.com/sbhavani/jules-app/issues/14) | SESSION-005 | Session Templates | ✅ Closed | P2 Nice to Have |
| [#15](https://github.com/sbhavani/jules-app/issues/15) | ACTIVITY-003 | Rich Message Formatting | ✅ Closed | P2 Nice to Have |
| [#16](https://github.com/sbhavani/jules-app/issues/16) | EXPORT-001 | Export Session Data | 🟡 Open | P2 Nice to Have |
| [#17](https://github.com/sbhavani/jules-app/issues/17) | ANALYTICS-001 | Usage Analytics Dashboard | ✅ Closed | P2 Nice to Have |
| [#21](https://github.com/sbhavani/jules-app/issues/21) | SESSION-006 | Branch Selection Support | ✅ Closed | P1 Important |
| [#22](https://github.com/sbhavani/jules-app/issues/22) | SESSION-007 | Plan Approval Configuration | ✅ Closed | Feature |
| [#23](https://github.com/sbhavani/jules-app/issues/23) | NOTIF-002 | Native Browser Notifications | 🟡 Open | Feature |
| [#24](https://github.com/sbhavani/jules-app/issues/24) | SESSION-008 | Post-Session PR Review Workflow | 🟡 Open | Feature |
| [#27](https://github.com/sbhavani/jules-app/issues/27) | EXT-001 | Use modjules!? | 🟡 Open | Feature |
| [#28](https://github.com/sbhavani/jules-app/issues/28) | ORCH-001 | "The Architect" Plan Review | 🟡 Open | Feature |
| [#29](https://github.com/sbhavani/jules-app/issues/29) | ORCH-002 | "The Auditor" Security Analysis | 🟡 Open | Feature |
| [#30](https://github.com/sbhavani/jules-app/issues/30) | ORCH-003 | "The Librarian" Auto-Docs | 🟡 Open | Feature |
| [#31](https://github.com/sbhavani/jules-app/issues/31) | SESSION-009 | Kanban Board View | 🟡 Open | P1 Important |
| [#32](https://github.com/sbhavani/jules-app/issues/32) | ANALYTICS-002 | Code Impact Metrics | 🟡 Open | Feature |
| [#33](https://github.com/sbhavani/jules-app/issues/33) | ANALYTICS-004 | Session Health Monitoring | 🟡 Open | P1 Important |
| [#34](https://github.com/sbhavani/jules-app/issues/34) | DEV-001 | Integrated Local Terminal | ✅ Closed | Feature |
| [#44](https://github.com/sbhavani/jules-app/issues/44) | REFACTOR-001 | Refactor AppLayout 'God Component' | 🟡 Open | Refactor |
| [#45](https://github.com/sbhavani/jules-app/issues/45) | PERF-004 | Replace Polling with efficient Fetching | 🟡 Open | Performance |
| [#46](https://github.com/sbhavani/jules-app/issues/46) | TYPE-001 | Improve Type Safety in API Client | 🟡 Open | Type-Safety |
| [#47](https://github.com/sbhavani/jules-app/issues/47) | CLEAN-001 | Remove Debug Logging from Proxy | 🟡 Open | Cleanup |
| [#48](https://github.com/sbhavani/jules-app/issues/48) | THEME-001 | Refactor Theming System | 🟡 Open | P2 Nice to Have |

**Summary Statistics:**
- ✅ Closed: 19 issues (+1 optimization focus)
- 🟡 Open: 16 issues
- P0 Critical: 6 issues (6 closed, 0 open)
- P1 Important: 12 issues (6 closed, 6 open)
- P2 Nice to Have: 8 issues (2 closed, 6 open)
- Feature requests: 10 issues (2 closed, 8 open)