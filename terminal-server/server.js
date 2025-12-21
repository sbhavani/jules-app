import http from "http";
import { Server } from "socket.io";
import pty from "node-pty";
import path from "path";
import fs from "fs";

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS || true, // Allow all origins in development
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Track active terminal sessions
const sessions = new Map();

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  const { sessionId, workingDir } = socket.handshake.query;

  // Use /workspace for Docker, or parent directory for local development
  const baseDir =
    process.env.WORKSPACE_DIR ||
    (fs.existsSync("/workspace")
      ? "/workspace"
      : path.join(__dirname, "..", "workspace"));
  const cwd = workingDir ? path.join(baseDir, workingDir) : baseDir;

  // Spawn shell process
  const shell = process.env.SHELL || "/bin/bash";
  const ptyProcess = pty.spawn(shell, [], {
    name: "xterm-256color",
    cols: 80,
    rows: 30,
    cwd: cwd,
    env: {
      ...process.env,
      TERM: "xterm-256color",
      COLORTERM: "truecolor",
    },
  });

  // Store session
  sessions.set(socket.id, {
    ptyProcess,
    sessionId,
    createdAt: Date.now(),
  });

  // Forward PTY output to client
  ptyProcess.onData((data) => {
    socket.emit("terminal.output", data);
  });

  // Handle PTY exit
  ptyProcess.onExit(({ exitCode, signal }) => {
    console.log(`PTY exited: code=${exitCode}, signal=${signal}`);
    socket.emit("terminal.exit", { exitCode, signal });
    sessions.delete(socket.id);
  });

  // Forward client input to PTY
  socket.on("terminal.input", (data) => {
    ptyProcess.write(data);
  });

  // Handle terminal resize
  socket.on("terminal.resize", ({ cols, rows }) => {
    try {
      ptyProcess.resize(cols, rows);
    } catch (err) {
      console.error("Resize error:", err);
    }
  });

  // Cleanup on disconnect
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    const session = sessions.get(socket.id);
    if (session) {
      session.ptyProcess.kill();
      sessions.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 8080;

// Determine and create workspace directory
const workspaceDir =
  process.env.WORKSPACE_DIR ||
  (fs.existsSync("/workspace")
    ? "/workspace"
    : path.join(__dirname, "..", "workspace"));
if (!fs.existsSync(workspaceDir)) {
  fs.mkdirSync(workspaceDir, { recursive: true });
}

server.listen(PORT, () => {
  console.log(`Terminal server listening on port ${PORT}`);
  console.log(`Workspace directory: ${workspaceDir}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing server...");
  sessions.forEach(({ ptyProcess }) => ptyProcess.kill());
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
