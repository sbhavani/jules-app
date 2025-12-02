# Jules Task Manager

A modern, mobile-friendly web application for managing multiple Jules AI agent tasks and sessions. Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui - designed to provide a better user experience than the official Jules web interface.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

## Features

- **Mobile-First Design** - Fully responsive interface optimized for all devices
- **Real-Time Updates** - Live activity feed for each Jules session
- **Session Management** - Create, view, and manage multiple Jules sessions
- **Beautiful UI** - Modern interface built with shadcn/ui components
- **Type-Safe** - Full TypeScript support throughout the application
- **Secure** - API key stored locally in browser localStorage

## Prerequisites

- Node.js 18+ installed
- Jules API key (get yours from [https://jules.google.com](https://jules.google.com) settings)
- At least one GitHub repository connected via the Jules GitHub app

## Getting Started

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd jules-app

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
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx             # Main page component
│   └── globals.css          # Global styles
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── api-key-setup.tsx    # API key input component
│   ├── app-layout.tsx       # Main app layout with navigation
│   ├── session-list.tsx     # Session list sidebar
│   ├── activity-feed.tsx    # Activity feed for sessions
│   └── new-session-dialog.tsx # Create new session dialog
├── lib/
│   └── jules/
│       ├── client.ts        # Jules API client
│       └── provider.tsx     # React context provider
└── types/
    └── jules.ts             # TypeScript type definitions
```

## Jules API Integration

This app integrates with the official Jules API (`https://julius.googleapis.com/v1alpha`) with the following endpoints:

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
```

## Mobile Features

- **Responsive Design** - Automatically adapts to screen size
- **Sheet Navigation** - Mobile-friendly slide-out menu
- **Touch-Optimized** - All interactions work great on touch devices
- **Fast Performance** - Optimized for mobile networks

## Troubleshooting

### "Unable to connect to server" Error

If you see this error, it could be due to:

1. **Invalid API Key** - Verify your API key is correct in Jules web app settings
2. **Network Issues** - Check your internet connection
3. **Server Not Running** - Make sure `npm run dev` is running
4. **API Not Available** - Verify the Jules API endpoint is accessible

Note: This app uses Next.js API routes to proxy requests to Jules API, avoiding CORS issues.

### No Sessions Showing

Make sure you have:
- Connected at least one GitHub repository in the Jules web app
- Created a session through the Jules web interface or this app
- Valid API key with proper permissions

### Other Issues

- Clear your browser's localStorage and re-enter your API key
- Check the browser console for detailed error messages
- Verify you're using a supported browser (Chrome, Firefox, Safari, Edge)

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy - it's automatic!

### Other Platforms

Build the production app:

```bash
npm run build
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- Jules API by Google
- shadcn/ui for the beautiful component library
- Next.js team for the amazing framework
