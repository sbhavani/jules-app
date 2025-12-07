# Product Requirements Document: Jules UI

## Vision
A powerful, self-hosted web application for managing Jules AI agent sessions with advanced developer tooling, including live code diffs, terminal output inspection, session analytics, and automated workflow orchestration.

## Current Status (v1.0)

### ✅ Implemented Features

#### Core Functionality (P0)
- **AUTH-001**: API Key Management
  - ✅ Secure storage in localStorage
  - ✅ Input validation and error handling
  - ✅ Logout functionality

- **SESSION-001**: Session List View
  - ✅ Display all sessions with status badges (active, completed, failed, paused)
  - ✅ Sort by last activity (newest first)
  - ✅ Session title and timestamp display
  - ✅ Click to view session details

- **SESSION-002**: Session Detail View
  - ✅ Real-time activity feed with 5-second auto-polling
  - ✅ User messages vs agent responses
  - ✅ Scroll to latest activity
  - ✅ Activity grouping (consecutive progress updates)

- **SESSION-003**: Create New Session
  - ✅ Repository/source selection
  - ✅ Session title (optional)
  - ✅ Initial prompt/instructions (required)

- **ACTIVITY-001**: Send Messages to Session
  - ✅ Text input with Enter/Shift+Enter support
  - ✅ Visual feedback during sending
  - ✅ Error handling for failed messages

- **UI-001**: Mobile-Responsive Layout
  - ✅ Mobile-first design approach
  - ✅ Sheet navigation for mobile (<768px)
  - ✅ Sidebar navigation for desktop (≥768px)
  - ✅ Touch-optimized interactions

#### Enhanced Features (P1)
- **SESSION-004**: Archive Sessions
  - ✅ Archive completed sessions
  - ✅ Remove from active list (localStorage)

- **ACTIVITY-002**: Activity Type Indicators
  - ✅ Visual badges (plan, progress, error, result, message)
  - ✅ Color-coded status indicators
  - ✅ Role-based avatars (user vs agent)

- **UI-002**: Dark Mode Support
  - ✅ System preference detection
  - ✅ Manual toggle option
  - ✅ Persistent user preference

- **UI-003**: Loading States
  - ✅ Loading indicators for activities
  - ✅ Optimistic UI updates
  - ✅ Skeleton states

- **SEARCH-001**: Session Search
  - ✅ Search sessions by title
  - ✅ Filter by repository/source
  - ✅ Real-time search results

- **ANALYTICS-001**: Usage Analytics Dashboard
  - ✅ Session statistics (total, active, completed, failed)
  - ✅ Activity volume over time
  - ✅ Success rate metrics
  - ✅ Average session duration

#### Advanced Features (P2)
- **ACTIVITY-003**: Rich Message Formatting
  - ✅ Markdown rendering with ReactMarkdown
  - ✅ Syntax highlighting for code blocks
  - ✅ JSON formatting for structured data
  - ✅ Plan step rendering

- **DIFF-001**: Code Diff Viewer
  - ✅ Live git patch visualization
  - ✅ Unified diff format rendering
  - ✅ Syntax highlighting
  - ✅ Toggle sidebar view

- **TERMINAL-001**: Bash Output Inspector
  - ✅ Detailed terminal output display
  - ✅ Expandable/collapsible output
  - ✅ Syntax highlighting for shell commands

- **PLAN-001**: Plan Approval Workflow
  - ✅ Detect plan generation activities
  - ✅ Approve plan button
  - ✅ Plan approval state tracking

## MoSCoW Prioritization (Future Work)

### SHOULD HAVE (P1 - Next Release)

#### Enhanced Features
- **SESSION-005**: Delete Sessions
  - API endpoint integration for session deletion
  - Confirmation dialog with undo option
  - Batch delete for multiple sessions

- **SOURCE-001**: Repository Management
  - View connected GitHub repositories
  - Link to connect new repositories
  - Repository metadata display
  - Sync status indicators

- **NOTIF-001**: Advanced Error Notifications
  - Toast notifications for API errors
  - Contextual error messages
  - Retry mechanisms with exponential backoff
  - Error rate monitoring

- **ACTIVITY-004**: Activity Filtering
  - Filter activities by type
  - Show/hide system messages
  - Collapse/expand activity groups
  - Search within activities

### COULD HAVE (P2 - Future Enhancements)

#### Developer Tooling
- **TERMINAL-002**: Integrated Terminal
  - Full terminal emulator embedded in UI
  - Execute commands in session context
  - Command history and autocomplete
  - Multi-terminal tabs
  - Terminal sharing between sessions
  - WebSocket-based real-time updates

- **WORKFLOW-001**: Automated PR/Branch Review
  - Trigger review workflows post-Jules creation
  - Automated code quality checks
  - Linting and formatting validation
  - Security scanning integration
  - Deploy preview generation
  - Comment on PRs with review results
  - Integration with GitHub Actions

- **VM-001**: Remote Test Execution
  - RunPod MCP server integration
  - On-demand VM provisioning
  - GPU selection (H100, A100, etc.)
  - Custom container support
  - Test execution with real-time logs
  - Resource usage monitoring
  - Cost estimation and tracking
  - Test result artifacts (screenshots, videos, logs)

#### Session Management
- **SESSION-006**: Session Templates
  - Save common prompts as templates
  - Quick-start sessions from templates
  - Template management (create, edit, delete)
  - Template sharing and marketplace

- **EXPORT-001**: Export Sessions
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

## Success Metrics

### Primary KPIs
- **User Engagement**: Daily active users
- **Session Activity**: Average messages per session
- **Performance**: Time to first paint < 1s
- **Mobile Usage**: >40% traffic from mobile
- **Session Success Rate**: % of sessions completed vs failed

### Secondary KPIs
- **Error Rate**: <1% API request failures
- **Session Creation**: Average sessions created per user
- **Retention**: Weekly return rate
- **Load Time**: Lighthouse score >90
- **Code Diff Usage**: % of sessions with diff viewing
- **Analytics Views**: % of users viewing dashboard

### Future Metrics (When Features Launch)
- **Terminal Usage**: % of sessions using integrated terminal
- **Workflow Automation**: # of automated reviews per day
- **VM Usage**: # of test executions on GPU VMs
- **Cost Efficiency**: Average VM cost per test run

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

### External Services
- Vercel for hosting
- GitHub for version control
- Jules API (Google)
- RunPod (future - GPU VMs)

## Risks and Mitigations

### Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Jules API changes | High | Medium | Version API calls, monitor changelog |
| API rate limits | Medium | Low | Implement caching, request throttling |
| localStorage limits | Low | Low | Add data size monitoring |
| Browser compatibility | Medium | Low | Use progressive enhancement |
| RunPod API stability | Medium | Medium | Fallback to local execution |
| WebSocket scaling | High | Medium | Use managed WebSocket service |

### Product Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Jules API sunset | High | Low | Monitor official announcements |
| User adoption | Medium | Medium | Focus on mobile UX, marketing |
| Competing tools | Low | Medium | Differentiate with superior UX |
| GPU VM costs | Medium | High | Implement usage quotas, cost caps |
| Workflow complexity | Medium | Medium | Start with simple templates |

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

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari 14+
- Chrome Android 90+

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
