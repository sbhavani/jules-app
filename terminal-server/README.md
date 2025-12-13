# Jules Terminal Server

WebSocket-based terminal server that provides real-time shell access for the Jules UI.

## Overview

This service spawns pseudo-terminals (PTY) using `node-pty` and streams input/output via Socket.io WebSockets.

## Features

- Real-time bidirectional communication
- Multiple concurrent sessions
- Terminal resize support
- Graceful shutdown handling
- Health check endpoint
- Session isolation

## Installation

```bash
npm install
```

## Usage

### Standalone (Development)

Run the terminal server independently:

```bash
npm install
npm start
```

The server will start on `http://localhost:8080`. The Jules UI will automatically detect and connect to it.

**Note:** When running standalone, create a `workspace` directory in the parent folder or set `WORKSPACE_DIR` environment variable.

### With Docker Compose (Recommended)

See the main project README for full Docker Compose setup.

### Production

```bash
npm start
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | WebSocket server port |
| `ALLOWED_ORIGINS` | `true` (all) | CORS allowed origins |
| `SHELL` | `/bin/bash` | Default shell to spawn |
| `NODE_ENV` | - | Node environment |

## API

### Socket.io Events

#### Client → Server

**`terminal.input`**
- Payload: `string` (keystrokes)
- Description: Send input to shell

**`terminal.resize`**
- Payload: `{ cols: number, rows: number }`
- Description: Resize terminal dimensions

#### Server → Client

**`terminal.output`**
- Payload: `string` (shell output)
- Description: Receive output from shell

**`terminal.exit`**
- Payload: `{ exitCode: number, signal?: number }`
- Description: Shell process exited

### Connection Query Parameters

- `sessionId` - Unique session identifier
- `workingDir` - Working directory path (relative to `/workspace`)

## Architecture

```
Client (Browser)
    ↓ WebSocket
Socket.io Server
    ↓
node-pty (PTY Process)
    ↓
bash/sh/zsh
```

## Security

- CORS restricted to allowed origins
- Container isolation via Docker
- Capability restrictions
- Session-based access control

## Logging

All connections, disconnections, and errors are logged to stdout.

## Health Check

Simple HTTP health check at `/health` (returns 200 if server is running).

## License

Part of Jules App
