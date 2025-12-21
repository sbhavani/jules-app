# Jules Integrated Terminal

## Overview

The Jules Integrated Terminal provides a web-based terminal that connects to your local machine, allowing direct execution of commands in the context of your session's repository without leaving the web application.

## Features

✅ **Real-time Output** - See command results as they happen via WebSocket connection
✅ **Command History** - Full bash/shell history with arrow-up/down navigation
✅ **Repository Context** - Terminal starts in your repository directory
✅ **Multi-Session Support** - Each Jules session gets its own isolated terminal
✅ **Security** - Containerized execution with capability restrictions
✅ **Custom Scripts** - Run any command available in your PATH
✅ **Git Integration** - Access to git commands and your git config

## Quick Start

### 1. Configure Your Repository Path

Edit `.env.local` and set your repository path:

```bash
REPO_PATH=/Users/yourname/projects/myproject
```

Or use the current directory:

```bash
REPO_PATH=.
```

### 2. Start Services with Docker Compose

```bash
docker-compose up
```

This will start:

- Jules UI on http://localhost:3000
- Terminal server on ws://localhost:8080

### 3. Access the Terminal

The integrated terminal will be available in your Jules session UI. It automatically connects when the component loads.

## Architecture

```
┌────────────────────────────────────────────────────────┐
│  Docker Compose Environment (Local Machine)           │
│                                                        │
│  ┌──────────────────────┐    ┌──────────────────────┐│
│  │  Jules Frontend      │    │  Terminal Server     ││
│  │  (Next.js)           │◄──►│  (Node.js + PTY)     ││
│  │  Port: 3000          │    │  Port: 8080          ││
│  └──────────────────────┘    └──────────────────────┘│
│                                      │                 │
│                              Volume Mount              │
│                                      ↓                 │
└──────────────────────────────────────┼─────────────────┘
                                       │
                          ┌────────────┴─────────────┐
                          │  User's Repository       │
                          │  /workspace (in container)│
                          │  ./repo (on host)        │
                          └──────────────────────────┘
```

## Technology Stack

### Frontend

- **@xterm/xterm** - Terminal emulator for the browser
- **@xterm/addon-fit** - Responsive terminal sizing
- **socket.io-client** - WebSocket communication

### Backend

- **node-pty** - Pseudo-terminal for spawning shells
- **socket.io** - Real-time bidirectional communication
- **Docker** - Container isolation and security

## Usage

### Basic Terminal Usage

Once connected, the terminal works like any standard bash/shell terminal:

```bash
# Navigate directories
cd src
ls -la

# Run git commands
git status
git log --oneline

# Execute scripts
npm install
npm run build
npm test

# Any other shell commands
echo "Hello from Jules terminal!"
```

### Terminal Component Integration

To use the terminal component in your Jules UI:

```tsx
import { IntegratedTerminal } from "@/components/integrated-terminal";

function SessionView({ session }) {
  return (
    <div className="h-screen">
      <IntegratedTerminal
        sessionId={session.id}
        workingDir=""
        className="h-full"
      />
    </div>
  );
}
```

### Props

| Prop         | Type   | Default  | Description                                |
| ------------ | ------ | -------- | ------------------------------------------ |
| `sessionId`  | string | required | Unique identifier for the terminal session |
| `workingDir` | string | `""`     | Subdirectory within mounted workspace      |
| `className`  | string | `""`     | Additional CSS classes                     |

## Configuration

### Environment Variables

#### Frontend (.env.local)

```bash
# WebSocket URL for terminal server (Optional)
# Defaults to ws://<hostname>:8080
# NEXT_PUBLIC_TERMINAL_WS_URL=ws://localhost:8080

# Repository path to mount
REPO_PATH=./workspace
```

#### Terminal Server (docker-compose.yml)

```yaml
environment:
  - NODE_ENV=development
  # ALLOWED_ORIGINS defaults to allow-all in development
```

### Custom Base Image

The terminal server uses `nvcr.io/nvidia/pytorch:25.11-py3` by default. To use a different image (e.g., standard Ubuntu or a custom ML image):

1. Set the environment variable:

   ```bash
   export TERMINAL_BASE_IMAGE=ubuntu:22.04
   ```

2. Rebuild the container:
   ```bash
   docker-compose -f deploy/docker-compose.yml up -d --build
   ```

**Note:** Your custom image must use `apt-get` (Debian/Ubuntu based) to be compatible with the current Dockerfile installation steps. If you use Alpine, you'll need to modify `terminal-server/Dockerfile`.

### Docker Compose Configuration

#### Mount Custom Repository

```bash
# In .env.local
REPO_PATH=/Users/yourname/projects/myproject

# Start with custom path
docker-compose up
```

#### Mount Git Config (Optional)

Uncomment in `docker-compose.yml`:

```yaml
volumes:
  - ~/.gitconfig:/root/.gitconfig:ro
  - ~/.ssh:/root/.ssh:ro
```

**Note:** This allows git commands with your identity and SSH keys.

## Security

The terminal implementation includes several security measures:

### Container Isolation

- Runs in isolated Docker container
- Separate from Jules UI container
- No direct host system access

### Capability Restrictions

```yaml
security_opt:
  - no-new-privileges:true
cap_drop:
  - ALL
cap_add:
  - CHOWN
  - SETGID
  - SETUID
```

### Best Practices

✅ Only mount necessary directories
✅ Use read-only mounts when possible
✅ Don't expose terminal server to public internet
✅ Use strong session authentication
✅ Monitor terminal commands for suspicious activity

## Troubleshooting

### Terminal Not Connecting

1. **Check if terminal server is running:**

   ```bash
   docker-compose ps
   ```

2. **View terminal server logs:**

   ```bash
   docker-compose logs terminal-server
   ```

3. **Verify WebSocket URL:**
   Check `.env.local` has correct `NEXT_PUBLIC_TERMINAL_WS_URL`

### Permission Errors

If you encounter permission issues accessing mounted directories:

```bash
# Rebuild containers
docker-compose down -v
docker-compose up --build
```

### Commands Not Found

The terminal container includes common tools (bash, git, curl, vim, nano, python3). To add more:

Edit `terminal-server/Dockerfile`:

```dockerfile
RUN apk add --no-cache \
    bash \
    git \
    your-additional-package
```

Then rebuild:

```bash
docker-compose up --build terminal-server
```

### Terminal Display Issues

If the terminal doesn't fit properly:

1. Resize your browser window
2. The FitAddon should auto-adjust
3. Check browser console for errors

## Development

### Running Without Docker

For development, you can run services separately:

#### Terminal Server

```bash
cd terminal-server
npm install
npm start
```

#### Jules UI

```bash
npm install
npm run dev
```

**Note:** Update `NEXT_PUBLIC_TERMINAL_WS_URL` to match your terminal server URL.

### Adding Features

The terminal server exposes events via Socket.io:

**Client → Server:**

- `terminal.input` - Send keystrokes to shell
- `terminal.resize` - Notify terminal size changes

**Server → Client:**

- `terminal.output` - Receive shell output
- `terminal.exit` - Shell process exited

Add new events in `terminal-server/server.js` and handle them in `components/integrated-terminal.tsx`.

## Advanced Usage

### Multiple Terminal Tabs

You can create multiple terminal instances:

```tsx
function MultiTerminal() {
  const [terminals, setTerminals] = useState([
    { id: "1", sessionId: "session-1" },
    { id: "2", sessionId: "session-2" },
  ]);

  return (
    <Tabs>
      {terminals.map((term) => (
        <TabPanel key={term.id}>
          <IntegratedTerminal sessionId={term.sessionId} />
        </TabPanel>
      ))}
    </Tabs>
  );
}
```

### Custom Shell Configuration

Mount custom shell config files:

```yaml
volumes:
  - ~/.bashrc:/root/.bashrc:ro
  - ~/.bash_profile:/root/.bash_profile:ro
```

### Persistent Command History

Command history is automatically persisted in a Docker volume:

```yaml
volumes:
  - terminal-history:/root/.bash_history
```

To view or backup:

```bash
docker volume inspect jules-app_terminal-history
```

## Related Issues

- [#34 - Integrated Local Terminal](https://github.com/sbhavani/jules-app/issues/34)

## Future Enhancements

- [ ] Terminal session persistence across browser refreshes
- [ ] Command autocomplete for common operations
- [ ] Terminal sharing between users
- [ ] Recording and playback of terminal sessions
- [ ] Custom themes and color schemes
- [ ] File upload/download via drag-and-drop
- [ ] Split-pane terminal support

## 🤝 The "Handover" Protocol: From Jules to Terminal

This workflow maximizes efficiency by treating **Jules as your Lead Engineer** (Planning & Architecture) and **Gemini as your Pair Programmer** (Execution & Fixes).

### Phase 1: Planning (Jules Web UI)

Ask Jules to analyze the backlog and create a plan.

**User:** "Look at the backlog. Find the top 3 'Dataset' bugs. For the hardest one, create a reproduction plan and a draft fix."

**Jules:**

1. **Plan:** "Issue #402 (race condition in `indexed_dataset`)."
2. **Repro Code:** Provides a Python script block.
3. **Draft Fix:** Suggests a patch for `dataset.py`.

### Phase 2: Context Sync (Terminal)

Create a temporary context file in your terminal to hold Jules' instructions. This acts as the source of truth for the Gemini CLI.

```bash
nano task_context.md
# Paste Jules' entire plan (Repro script + Draft logic) here
```

### Phase 3: Execution (Terminal + Gemini)

**1. Extract & Run Repro:**
Use Gemini to parse the context file and extract the code.

```bash
# Extract the script
cat task_context.md | gemini "Extract the python reproduction script from these notes and save it to repro_402.py" > repro_402.py

# Run it
python3 repro_402.py
```

**2. Apply Logic:**
Pipe the context and the target file to Gemini to apply the fix.

```bash
# Apply the fix
cat task_context.md megatron/data/indexed_dataset.py | gemini "Apply the fix suggested in the task notes to the python file. Output only the full python code." > megatron/data/indexed_dataset.py
```

### Phase 4: Verification (Terminal)

Run the repro script again.

```bash
python3 repro_402.py
```

- **Pass:** Commit and push.
- **Fail:** Pipe the error back to Gemini:
  ```bash
  python3 repro_402.py 2>&1 | gemini "The fix didn't work. Here is the error. Fix the code."
  ```

### Best Practice: Jules-Created Branches

If Jules has GitHub access:

1.  Ask Jules to **create a branch** (e.g., `fix/issue-402`) and **commit the failing test**.
2.  In your terminal:
    ```bash
    git fetch origin
    git checkout fix/issue-402
    ```
    Now you have the repro file immediately—no copy-pasting required.
