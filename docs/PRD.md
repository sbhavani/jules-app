# Product Requirements Document: Jules UI

> **GitHub Issues**: All features are tracked as [GitHub Issues](https://github.com/sbhavani/jules-app/issues). Issue numbers are linked throughout this document.

## Vision
A powerful, self-hosted web application for managing Jules AI agent sessions with advanced developer tooling, including live code diffs, terminal output inspection, session analytics, and automated workflow orchestration.

## Current Status (v1.0)

<details>
<summary><strong>✅ Implemented Features</strong> (Click to expand)</summary>

#### Core Functionality (P0)
- **AUTH-001**: API Key Management ([#1](https://github.com/sbhavani/jules-app/issues/1)) 🟡 _In Progress_
  - ✅ Secure storage in localStorage
  - ✅ Input validation and error handling
  - ✅ Logout functionality

- **SESSION-001**: Session List View ([#2](https://github.com/sbhavani/jules-app/issues/2)) 🟡 _In Progress_
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

#### Enhanced Features (P1)
- **SESSION-004**: Archive Sessions ([#7](https://github.com/sbhavani/jules-app/issues/7)) 🟡 _In Progress_
  - ✅ Archive completed sessions
  - ✅ Remove from active list (localStorage)
  - ⏳ API integration for permanent deletion

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

- **SEARCH-001**: Session Search ([#12](https://github.com/sbhavani/jules-app/issues/12)) 🟡 _In Progress_
  - ✅ Search sessions by title
  - ✅ Filter by repository/source
  - ✅ Real-time search results
  - ⏳ Filter by status (active, completed, failed)

- **SOURCE-001**: Repository Management ([#9](https://github.com/sbhavani/jules-app/issues/9)) ✅ _Closed_
  - ✅ View connected GitHub repositories
  - ✅ Repository selection in new session dialog
  - ✅ Repository metadata display

- **ANALYTICS-001**: Usage Analytics Dashboard ([#17](https://github.com/sbhavani/jules-app/issues/17)) ✅ _Closed_
  - ✅ Session statistics (total, active, completed, failed)
  - ✅ Activity volume over time
  - ✅ Success rate metrics
  - ✅ Average session duration

- **ANALYTICS-002**: Code Impact Metrics ([#32](https://github.com/sbhavani/jules-app/issues/32)) 🟡 _Open_
  - Analyze activity diffs to calculate lines added/removed/modified.
  - Visualize "Code Churn" per session and repository.
  - Track complexity trends over time.

- **ANALYTICS-004**: Session Health Monitoring ([#33](https://github.com/sbhavani/jules-app/issues/33)) 🟡 _Open_
  - Detect "stalled" sessions (active but no recent updates).
  - Calculate session health scores based on error rate vs. progress.
  - Alert users to interventions needed for stuck agents.

#### AI Orchestration (P2 - Future)
- **ORCH-001**: "The Architect" - Pre-implementation Plan Review ([#28](https://github.com/sbhavani/jules-app/issues/28)) 🟡 _Open_
  - Leverage a high-reasoning model (e.g., Gemini 1.5 Pro) to critique proposed plans.
  - Checks against architectural constraints and best practices before code generation.
  - Reduces wasted iterations by catching structural flaws early.

- **ORCH-002**: "The Auditor" - Automated Security & Logic Analysis ([#29](https://github.com/sbhavani/jules-app/issues/29)) 🟡 _Open_
  - specific post-generation analysis workflow using security-focused prompts.
  - Scans generated diffs for common vulnerabilities (OWASP) and edge cases.
  - Auto-comments on PRs with security warnings.

- **ORCH-003**: "The Librarian" - Dynamic Context & Auto-Documentation ([#30](https://github.com/sbhavani/jules-app/issues/30)) 🟡 _Open_
  - Use large-context models to dynamically select the most relevant files (Smart RAG).
  - Automatically generates and updates `README.md`, API docs, and inline comments based on changes.
  - Semantic commit message generation.

#### Advanced Features (P2)
- **SESSION-009**: Kanban Board View ([#31](https://github.com/sbhavani/jules-app/issues/31)) 🟡 _Open_
  - Visualize sessions as cards on a board, grouped by status (Active, Paused, Completed).
  - Drag-and-drop interface for managing session lifecycle.
  - Modern, fluid animations inspired by Vibe Kanban.

- **ACTIVITY-003**: Rich Message Formatting ([#15](https://github.com/sbhavani/jules-app/issues/15)) 🟡 _In Progress_
  - ✅ Markdown rendering with ReactMarkdown
  - ✅ Syntax highlighting for code blocks
  - ✅ JSON formatting for structured data
  - ✅ Plan step rendering
  - ⏳ Link previews

- **DIFF-001**: Code Diff Viewer _(Not tracked as issue)_
  - ✅ Live git patch visualization
  - ✅ Unified diff format rendering
  - ✅ Syntax highlighting
  - ✅ Toggle sidebar view

- **TERMINAL-001**: Bash Output Inspector _(Not tracked as issue)_
  - ✅ Detailed terminal output display
  - ✅ Expandable/collapsible output
  - ✅ Syntax highlighting for shell commands

- **PLAN-001**: Plan Approval Workflow ([#22](https://github.com/sbhavani/jules-app/issues/22)) 🟡 _In Progress_
  - ✅ Detect plan generation activities
  - ✅ Approve plan button
  - ✅ Plan approval state tracking
  - ⏳ Plan configuration options

</details>

## MoSCoW Prioritization (Future Work)

### SHOULD HAVE (P1 - Next Release)

#### Enhanced Features
- **SESSION-005**: Delete Sessions _(Partially implemented via #7)_
  - API endpoint integration for session deletion
  - Confirmation dialog with undo option
  - Batch delete for multiple sessions

- **SESSION-006**: Branch Selection Support ([#21](https://github.com/sbhavani/jules-app/issues/21)) ⏳ _Planned_
  - Select specific branch when creating session
  - Branch switching for existing sessions
  - Branch status indicators

- **NOTIF-001**: Error Notifications & Toast System ([#13](https://github.com/sbhavani/jules-app/issues/13)) ⏳ _Planned_
  - Toast notifications for API errors
  - Contextual error messages
  - Retry mechanisms with exponential backoff
  - Error rate monitoring

- **NOTIF-002**: Native Browser Notifications ([#23](https://github.com/sbhavani/jules-app/issues/23)) ⏳ _Planned_
  - Desktop notifications for session updates
  - Notification preferences
  - Do-not-disturb mode

- **ACTIVITY-004**: Activity Filtering _(Not tracked as issue)_
  - Filter activities by type
  - Show/hide system messages
  - Collapse/expand activity groups
  - Search within activities

### COULD HAVE (P2 - Future Enhancements)

#### Developer Tooling
- **DEV-001**: Integrated Local Terminal ([#34](https://github.com/sbhavani/jules-app/issues/34)) 🟡 _Open_
  - Integrate a terminal within the Jules UI that connects to the user's local machine.
  - Allows direct execution of commands in the context of the session's repository.
  - Real-time output, command history, and ability to run custom scripts.
  - Enhances developer workflow by providing immediate access to local development tools.

- **TERMINAL-002**: Integrated Terminal _(Not tracked as issue)_
  - Full terminal emulator embedded in UI
  - Execute commands in session context
  - Command history and autocomplete
  - Multi-terminal tabs
  - Terminal sharing between sessions
  - WebSocket-based real-time updates

- **WORKFLOW-001**: Automated PR/Branch Review _(Partially tracked via #24)_
  - Trigger review workflows post-Jules creation
  - Automated code quality checks
  - Linting and formatting validation
  - Security scanning integration
  - Deploy preview generation
  - Comment on PRs with review results
  - Integration with GitHub Actions

- **SESSION-008**: Post-Session PR Review Workflow ([#24](https://github.com/sbhavani/jules-app/issues/24)) ⏳ _Planned_
  - Automated PR review after Jules session completes
  - Code quality analysis
  - Test coverage reporting
  - Deployment preview links

- **VM-001**: Remote Test Execution _(Not tracked as issue)_
  - RunPod MCP server integration
  - On-demand VM provisioning
  - GPU selection (H100, A100, etc.)
  - Custom container support
  - Test execution with real-time logs
  - Resource usage monitoring
  - Cost estimation and tracking
  - Test result artifacts (screenshots, videos, logs)

#### Session Management
- **SESSION-006**: Session Templates ([#14](https://github.com/sbhavani/jules-app/issues/14)) ⏳ _Planned_
  - Save common prompts as templates
  - Quick-start sessions from templates
  - Template management (create, edit, delete)
  - Template sharing and marketplace

- **EXPORT-001**: Export Session Data ([#16](https://github.com/sbhavani/jules-app/issues/16)) ⏳ _Planned_
  - Export session history as JSON
  - Export as Markdown report
  - Export diffs as patch files
  - Copy activities to clipboard
  - Export to PDF

- **COLLAB-001**: Session Sharing
  - Generate shareable session links
  - Read-only view for shared sessions
  - Permission management
  - Real-time collaborative sessions

#### UI/UX Improvements
- **UI-004**: Customization Options
  - Theme customization (custom colors)
  - Font size adjustments
  - Layout preferences (compact/comfortable)
  - Custom activity filters
  - Keyboard shortcuts

- **OFFLINE-001**: Offline Support
  - Service worker for offline access
  - Queue messages when offline
  - Sync when connection restored
  - Offline-first architecture

### WON'T HAVE (Out of Scope for Now)

#### Explicitly Excluded
- **Native mobile apps** - Web app only (PWA support instead)
- **Video/audio integration** - Text-based only
- **Custom AI models** - Jules API only
- **SSO/OAuth integration** - API key auth only
- **Billing/payment features** - Free tier only
- **Admin panel** - User-facing app only
- **Multi-tenancy** - Single user per deployment
- **Self-hosted Jules** - Cloud API only

## Technical Architecture

### Frontend Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **HTTP Client**: Native fetch API
- **Markdown**: ReactMarkdown + remark-gfm
- **Diff Viewer**: Custom implementation

### API Integration
- **Jules API**: v1alpha
- **Authentication**: X-Goog-Api-Key header
- **Base URL**: https://jules.googleapis.com/v1alpha
- **Proxy**: Next.js API routes for CORS handling

### Component Architecture
```
app/
├── layout.tsx           # Root layout with providers
├── page.tsx             # Main page component
└── api/
    └── jules/
        └── route.ts     # API proxy for Jules requests

components/
├── ui/                  # shadcn/ui base components
├── api-key-setup.tsx    # API key input
├── app-layout.tsx       # Main app layout
├── session-list.tsx     # Session sidebar with search
├── activity-feed.tsx    # Real-time activity stream
├── code-diff-sidebar.tsx # Git diff viewer
├── diff-viewer.tsx      # Unified diff renderer
├── bash-output.tsx      # Terminal output display
├── analytics-dashboard.tsx # Analytics charts
├── new-session-dialog.tsx # Create session dialog
└── theme-provider.tsx   # Dark mode provider

lib/
└── jules/
    ├── client.ts        # Jules API client
    └── provider.tsx     # React context provider
```

### Data Flow
1. User authenticates with API key (stored in localStorage)
2. App proxies requests through `/api/jules` route
3. Jules API returns sessions and activities
4. Activities auto-poll every 5 seconds for active sessions
5. UI updates reactively with new data
6. User sends messages via API proxy
7. Artifacts (diffs, bash output) extracted and displayed

## User Flows

### First-Time User
1. Land on app → API key prompt
2. Enter API key → Store in localStorage
3. See empty analytics dashboard
4. Click "New Session" → Select repository
5. Enter prompt → Create session
6. View activity feed → Send first message

### Returning User
1. Land on app → Auto-authenticated
2. See analytics dashboard or last viewed session
3. Click session → View activities and diffs
4. Send message or create new session

### Mobile User
1. Open app on mobile device
2. Tap menu icon → Session sheet opens
3. Select session → View activity feed
4. Scroll through activities
5. Expand bash outputs
6. Type message → Send via button

### Developer Workflow (Future)
1. Jules creates PR → Webhook triggers review workflow
2. Workflow provisions H100 VM via RunPod
3. Tests execute with GPU acceleration
4. Results posted to PR comments
5. Developer reviews in integrated terminal
6. Approve or request changes

## Future Roadmap

### Phase 2 - Developer Tooling (Q1 2026)
- **Integrated Terminal**
  - Full xterm.js integration
  - WebSocket communication
  - Command execution in session context
  - Terminal persistence across sessions

- **Workflow Automation**
  - GitHub App for webhook integration
  - Workflow configuration UI
  - Custom review pipelines
  - Notification system

### Phase 3 - Cloud Infrastructure (Q2 2026)
- **RunPod MCP Integration**
  - VM provisioning API
  - GPU selection interface
  - Test execution framework
  - Cost monitoring dashboard
  - Resource scheduling

- **Advanced Analytics**
  - Test performance trends
  - Resource utilization charts
  - Cost optimization recommendations

### Phase 4 - Collaboration (Q3 2026)
- **Team Features**
  - Multi-user support
  - Session sharing
  - Team workspaces
  - Usage quotas

- **Platform Integrations**
  - GitHub Actions
  - GitLab CI
  - Slack notifications
  - Jira integration

### Phase 5 - Enterprise (Q4 2026)
- **Self-Hosted Option**
  - Docker deployment
  - Kubernetes manifests
  - SSO/SAML support
  - Audit logging
  - Role-based access control

## Dependencies

### Critical Dependencies
- Jules API availability and stability
- GitHub app installation for sources
- Modern browser support (ES6+)
- Next.js API routes for CORS handling

### Future Dependencies
- RunPod API (for VM execution)
- GitHub App (for workflow automation)
- WebSocket server (for terminal integration)
- Redis (for session persistence and caching)

## Open Questions

### Current Questions
1. Should we support multiple API keys (team accounts)?
2. What's the ideal session refresh interval? (Currently 5s)
3. Should we implement activity pagination or infinite scroll?
4. What analytics platform should we integrate?

### Future Questions
1. Which cloud providers should we support beyond RunPod?
2. How do we handle long-running test executions (hours)?
3. Should we cache VM instances or provision on-demand?
4. What's the pricing model for VM/GPU usage?
5. How do we secure terminal access to prevent abuse?
6. Should workflow definitions be YAML-based or UI-configured?

## Appendix

### API Endpoints Used
- `GET /sources` - List repositories
- `GET /sessions` - List sessions
- `POST /sessions` - Create session
- `DELETE /sessions/:id` - Delete session
- `GET /sessions/:id/activities` - List activities
- `POST /sessions/:id:sendMessage` - Send message
- `POST /sessions/:id:approvePlan` - Approve plan

### Future API Endpoints
- `POST /workflows` - Trigger automated workflow
- `GET /workflows/:id` - Get workflow status
- `POST /vms` - Provision VM
- `GET /vms/:id` - Get VM status
- `POST /vms/:id/execute` - Execute command
- `DELETE /vms/:id` - Terminate VM

### GitHub Issue Tracker Summary

All features are tracked as GitHub issues. Use this table for quick reference:

| Issue # | Feature ID | Title | Status | Priority |
|---------|------------|-------|--------|----------|
| [#1](https://github.com/sbhavani/jules-app/issues/1) | AUTH-001 | API Key Management | 🟡 Open | P0 Critical |
| [#2](https://github.com/sbhavani/jules-app/issues/2) | SESSION-001 | Session List View | 🟡 Open | P0 Critical |
| [#3](https://github.com/sbhavani/jules-app/issues/3) | SESSION-002 | Session Detail View | ✅ Closed | P0 Critical |
| [#4](https://github.com/sbhavani/jules-app/issues/4) | SESSION-003 | Create New Session | ✅ Closed | P0 Critical |
| [#5](https://github.com/sbhavani/jules-app/issues/5) | ACTIVITY-001 | Send Messages to Session | ✅ Closed | P0 Critical |
| [#6](https://github.com/sbhavani/jules-app/issues/6) | UI-001 | Mobile-Responsive Layout | ✅ Closed | P0 Critical |
| [#7](https://github.com/sbhavani/jules-app/issues/7) | SESSION-004 | Delete/Archive Sessions | 🟡 Open | P1 Important |
| [#8](https://github.com/sbhavani/jules-app/issues/8) | ACTIVITY-002 | Activity Type Indicators | ✅ Closed | P1 Important |
| [#9](https://github.com/sbhavani/jules-app/issues/9) | SOURCE-001 | Repository Management | ✅ Closed | P1 Important |
| [#10](https://github.com/sbhavani/jules-app/issues/10) | UI-002 | Dark Mode Support | ✅ Closed | P1 Important |
| [#11](https://github.com/sbhavani/jules-app/issues/11) | UI-003 | Loading States & Skeleton Loaders | ✅ Closed | P1 Important |
| [#12](https://github.com/sbhavani/jules-app/issues/12) | SEARCH-001 | Session Search & Filtering | 🟡 Open | P1 Important |
| [#13](https://github.com/sbhavani/jules-app/issues/13) | NOTIF-001 | Error Notifications & Toast System | 🟡 Open | P1 Important |
| [#14](https://github.com/sbhavani/jules-app/issues/14) | SESSION-006 | Session Templates | 🟡 Open | P2 Nice to Have |
| [#15](https://github.com/sbhavani/jules-app/issues/15) | ACTIVITY-003 | Rich Message Formatting | 🟡 Open | P2 Nice to Have |
| [#16](https://github.com/sbhavani/jules-app/issues/16) | EXPORT-001 | Export Session Data | 🟡 Open | P2 Nice to Have |
| [#17](https://github.com/sbhavani/jules-app/issues/17) | ANALYTICS-001 | Usage Analytics Dashboard | ✅ Closed | P2 Nice to Have |
| [#21](https://github.com/sbhavani/jules-app/issues/21) | SESSION-006 | Branch Selection Support | 🟡 Open | Feature |
| [#22](https://github.com/sbhavani/jules-app/issues/22) | SESSION-007 | Plan Approval Configuration | 🟡 Open | Feature |
| [#23](https://github.com/sbhavani/jules-app/issues/23) | NOTIF-002 | Native Browser Notifications | 🟡 Open | Feature |
| [#24](https://github.com/sbhavani/jules-app/issues/24) | SESSION-008 | Post-Session PR Review Workflow | 🟡 Open | Feature |
| [#28](https://github.com/sbhavani/jules-app/issues/28) | ORCH-001 | "The Architect" Plan Review | 🟡 Open | Feature |
| [#29](https://github.com/sbhavani/jules-app/issues/29) | ORCH-002 | "The Auditor" Security Analysis | 🟡 Open | Feature |
| [#30](https://github.com/sbhavani/jules-app/issues/30) | ORCH-003 | "The Librarian" Auto-Docs | 🟡 Open | Feature |
| [#31](https://github.com/sbhavani/jules-app/issues/31) | SESSION-009 | Kanban Board View | 🟡 Open | Feature |
| [#32](https://github.com/sbhavani/jules-app/issues/32) | ANALYTICS-002 | Code Impact Metrics | 🟡 Open | Feature |
| [#33](https://github.com/sbhavani/jules-app/issues/33) | ANALYTICS-004 | Session Health Monitoring | 🟡 Open | Feature |
| [#34](https://github.com/sbhavani/jules-app/issues/34) | DEV-001 | Integrated Local Terminal | 🟡 Open | Feature |

**Summary Statistics:**
- ✅ Closed: 9 issues (29%)
- 🟡 Open: 22 issues (71%)
- P0 Critical: 6 issues (4 closed, 2 open)
- P1 Important: 6 issues (4 closed, 2 open)
- P2 Nice to Have: 4 issues (1 closed, 3 open)
- Feature requests: 11 issues (0 closed, 11 open)

### Technology Evaluations

#### Terminal Integration
- **xterm.js** (Recommended) - Full-featured, widely used
- **ttyd** - Lightweight, WebSocket-based
- **gotty** - Simple, Go-based

#### VM Providers
- **RunPod** (Primary) - GPU-focused, cost-effective
- **Lambda Labs** (Secondary) - H100 availability
- **Vast.ai** (Tertiary) - Spot pricing

#### Workflow Engine
- **GitHub Actions** (Integration) - Existing ecosystem
- **Custom** (Recommended) - Full control, Jules-specific
- **Temporal** (Future) - Durable execution
