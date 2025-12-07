# Jules UI

![Build Status](https://github.com/sbhavani/jules-app/actions/workflows/ci.yml/badge.svg)

Jules UI is a feature-rich, self-hosted workspace designed to elevate the experience of working with **Google's Jules AI agent**.

It transforms standard agent interactions into a powerful engineering platform, offering real-time visibility into code generation with live diffs, granular inspection of terminal command outputs, and comprehensive session analytics. Engineered for performance and clarity, it serves as a robust command center for managing complex AI-driven development tasks, featuring:

- **Live Code Diffs**: Visualize git patches and code changes instantly.
- **Interactive Terminal**: Inspect bash outputs and execute your own commands (Coming Soon).
- **Analytics**: Track session success rates, duration, and activity volume.
- **Enhanced Search**: Quickly find sessions by repository or title.

Built with Next.js 16, TypeScript, and shadcn/ui.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

## Features

- **Mobile-First Design** - Fully responsive interface optimized for all devices
- **Real-Time Updates** - Live activity feed for each Jules session
- **Code Diff Viewer** - View detailed code changes and git patches directly in the UI
- **Interactive Terminal** - Inspect bash outputs and execute your own commands (Coming Soon)
- **Session Management** - Create, view, search, and manage multiple Jules sessions
- **Analytics Dashboard** - Visualize session usage and activity trends
- **Secure** - API key stored locally in browser localStorage

## Screenshots

![Dashboard View](public/assets/dashboard-screenshot.png)
*Analytics Dashboard showing session statistics*

![Session View](public/assets/session-screenshot.png)
*Session view with code diff sidebar, activity feed, and search*

## Prerequisites

- Node.js 18+ installed
- Jules API key (get yours from [https://jules.google.com](https://jules.google.com) settings)
- At least one GitHub repository connected via the Jules GitHub app

## Getting Started

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd jules-ui

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in terminal) with your browser.

### Configuration

1. When you first open the app, you'll be prompted to enter your Jules API key
2. Get your API key from the Jules web app settings page
3. Enter the key and click "Continue"
4. The key will be securely stored in your browser's localStorage

## Project Structure

```
jules-app/
├── app/
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Main page component
│   └── globals.css          # Global styles
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── api-key-setup.tsx    # API key input component
│   ├── app-layout.tsx       # Main app layout with navigation
│   ├── session-list.tsx     # Session list sidebar with search
│   ├── activity-feed.tsx    # Activity feed for sessions
│   ├── code-diff-sidebar.tsx # Sidebar for viewing code changes
│   ├── diff-viewer.tsx      # Component to render git diffs
│   ├── bash-output.tsx      # Component to display terminal output
│   ├── analytics-dashboard.tsx # Usage and stats visualization
│   └── new-session-dialog.tsx # Create new session dialog
├── lib/
│   └── jules/
│       ├── client.ts        # Jules API client
│       └── provider.tsx     # React context provider
└── types/
    └── jules.ts             # TypeScript type definitions
```

## Jules API Integration

This app integrates with the official Jules API (`https://jules.googleapis.com/v1alpha`) with the following endpoints:

- **GET /sources** - List all connected GitHub repositories
- **GET /sessions** - List all Jules sessions
- **POST /sessions** - Create a new session
- **GET /sessions/:id/activities** - Get activities for a session
- **POST /sessions/:id:sendMessage** - Send a message to a session
- **POST /sessions/:id:approvePlan** - Approve a plan requiring authorization

For full API documentation, visit [developers.google.com/jules/api](https://developers.google.com/jules/api)

## Tech Stack

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful component library
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[date-fns](https://date-fns.org/)** - Date formatting

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- Jules API by Google
- shadcn/ui for the beautiful component library
- Next.js team for the amazing framework
