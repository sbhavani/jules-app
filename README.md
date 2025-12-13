# Jules UI

![Build Status](https://github.com/sbhavani/jules-app/actions/workflows/ci.yml/badge.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

![Session View](public/assets/session-screenshot.png)

**A powerful, self-hosted workspace for Google's Jules AI agent.** Transform standard agent interactions into an engineering command center with live code diffs, real-time activity monitoring, session analytics, and comprehensive terminal output inspection.

## ✨ Key Features

- 🔄 **Real-Time Updates** - Live activity feed with auto-polling
- 📊 **Code Diff Viewer** - Visualize git patches and changes instantly
- 💻 **Integrated Terminal** - Full web-based terminal with local machine access
- 📈 **Analytics Dashboard** - Track session metrics and trends
- 🔍 **Smart Search** - Find sessions by repository or title
- 📱 **Mobile-First** - Fully responsive design
- 🔒 **Secure** - Container isolation and API keys stored locally

## 🚀 Quick Start

**Prerequisites:** Node.js 18+, Jules API key from [jules.google.com](https://jules.google.com), and a connected GitHub repository.

### Standard Mode

```bash
# Clone and install
git clone <your-repo-url>
cd jules-ui
npm install

# Start development server
npm run dev
```

### With Integrated Terminal (Docker Compose)

```bash
# Clone and install
git clone <your-repo-url>
cd jules-ui

# Configure your repository path
echo "REPO_PATH=/path/to/your/repo" > .env.local

# Start all services
docker-compose up
```

Open [http://localhost:3000](http://localhost:3000) and enter your Jules API key when prompted. Your key is stored securely in browser localStorage.

**See [docs/TERMINAL.md](docs/TERMINAL.md) for terminal setup and usage.**

## 📸 More Screenshots

![Integrated Terminal](public/assets/jules-terminal.png)
*Integrated Terminal - Full web-based terminal with real-time command execution and output*

![Dashboard View](public/assets/dashboard-screenshot.png)
*Analytics Dashboard - Track session success rates, duration, and activity volume*

## 🛠️ Tech Stack

**Frontend:** [Next.js 16](https://nextjs.org/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [xterm.js](https://xtermjs.org/)

**Terminal Server:** [Node.js](https://nodejs.org/), [Socket.io](https://socket.io/), [node-pty](https://github.com/microsoft/node-pty)

**Infrastructure:** [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/)

## 🔧 Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run linter
npm test         # Run tests
```

## 📚 API Integration

Integrates with Jules API (`https://jules.googleapis.com/v1alpha`) for session management, activity streaming, and real-time updates. See [developers.google.com/jules/api](https://developers.google.com/jules/api) for full documentation.

## 🤝 Contributing

Contributions welcome! Feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ❤️ for the Jules community
