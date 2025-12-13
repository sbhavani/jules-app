'use client'

import { useEffect, useRef, useState } from 'react'
import type { Terminal } from '@xterm/xterm'
import type { FitAddon } from '@xterm/addon-fit'
import type { Socket } from 'socket.io-client'

interface IntegratedTerminalProps {
  sessionId: string
  workingDir?: string
  className?: string
}

export function IntegratedTerminal({
  sessionId,
  workingDir = '',
  className = ''
}: IntegratedTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<Terminal | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const errorShownRef = useRef(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!terminalRef.current || !isMounted) return

    let terminal: Terminal
    let fitAddon: FitAddon
    let socket: Socket
    let resizeObserver: ResizeObserver

    // Dynamic imports for browser-only libraries
    const initTerminal = async () => {
      const { Terminal } = await import('@xterm/xterm')
      const { FitAddon } = await import('@xterm/addon-fit')
      const { io } = await import('socket.io-client')
      await import('@xterm/xterm/css/xterm.css')

      // Initialize xterm.js with dark theme blended for Jules app
      terminal = new Terminal({
        cursorBlink: true,
        fontSize: 12,
        fontFamily: '"Ubuntu Mono", "Courier New", Courier, monospace',
        lineHeight: 1.2,
        theme: {
          // Dark background to match Jules app (zinc-950 with subtle purple tint)
          background: '#0a0a0f',
          foreground: '#e5e5e5',
          cursor: '#ffffff',
          cursorAccent: '#0a0a0f',
          selectionBackground: 'rgba(255, 255, 255, 0.2)',

          // Ubuntu ANSI color palette (official colors)
          black: '#2e3436',
          red: '#cc0000',
          green: '#4e9a06',
          yellow: '#c4a000',
          blue: '#3465a4',
          magenta: '#75507b',
          cyan: '#06989a',
          white: '#d3d7cf',

          // Bright colors
          brightBlack: '#555753',
          brightRed: '#ef2929',
          brightGreen: '#8ae234',
          brightYellow: '#fce94f',
          brightBlue: '#729fcf',
          brightMagenta: '#ad7fa8',
          brightCyan: '#34e2e2',
          brightWhite: '#eeeeec'
        },
        scrollback: 1000,
        allowProposedApi: true,
        cursorStyle: 'block',
        cursorInactiveStyle: 'outline'
      })

      fitAddon = new FitAddon()
      terminal.loadAddon(fitAddon)
      terminal.open(terminalRef.current!)
      fitAddon.fit()

      xtermRef.current = terminal
      fitAddonRef.current = fitAddon

      // Connect to terminal server
      // Use same hostname as current page for remote access support
      const wsUrl = process.env.NEXT_PUBLIC_TERMINAL_WS_URL ||
        (typeof window !== 'undefined' ? `ws://${window.location.hostname}:8080` : 'ws://localhost:8080')

      console.log('Connecting to terminal server:', wsUrl)

      socket = io(wsUrl, {
        query: { sessionId, workingDir },
        transports: ['websocket'], // Force WebSocket to avoid HTTP polling errors
        reconnectionAttempts: 10,  // Stop trying after 10 attempts
        reconnectionDelay: 2000,   // Wait 2s between attempts
        reconnection: true
      })

      socketRef.current = socket

      socket.on('connect', () => {
        console.log('Connected to terminal server')
        setIsConnected(true)
        errorShownRef.current = false
        terminal.write('\r\n\x1b[32m*** Connected to terminal ***\x1b[0m\r\n\r\n')
      })

      socket.on('connect_error', (error) => {
        console.log('Failed to connect to terminal server:', error.message)
        setIsConnected(false)
        
        if (!errorShownRef.current) {
          errorShownRef.current = true
          terminal.write('\r\n\x1b[33m*** Terminal Server Not Available ***\x1b[0m\r\n')
          terminal.write('\x1b[90mTo enable terminal:\x1b[0m\r\n')
          terminal.write('\x1b[90m  1. Docker Compose: docker-compose up\x1b[0m\r\n')
          terminal.write('\x1b[90m  2. Standalone: cd terminal-server && npm start\x1b[0m\r\n')
          terminal.write('\x1b[90m\x1b[0m\r\n')
          terminal.write('\x1b[90mSee README.md for details.\x1b[0m\r\n')
        }
      })

      socket.on('disconnect', () => {
        console.log('Disconnected from terminal server')
        setIsConnected(false)
        terminal.write('\r\n\x1b[31m*** Disconnected from terminal ***\x1b[0m\r\n')
      })

      socket.on('terminal.output', (data: string) => {
        terminal.write(data)
      })

      socket.on('terminal.exit', ({ exitCode }: { exitCode: number }) => {
        terminal.write(`\r\n\x1b[33m*** Process exited with code ${exitCode} ***\x1b[0m\r\n`)
      })

      terminal.onData((data) => {
        socket.emit('terminal.input', data)
      })

      // Handle terminal resize
      const handleResize = () => {
        fitAddon.fit()
        socket.emit('terminal.resize', {
          cols: terminal.cols,
          rows: terminal.rows
        })
      }

      window.addEventListener('resize', handleResize)

      // Also add a resize observer to detect parent container size changes
      resizeObserver = new ResizeObserver(() => {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          fitAddon.fit()
          socket.emit('terminal.resize', {
            cols: terminal.cols,
            rows: terminal.rows
          })
        }, 0)
      })

      if (terminalRef.current) {
        resizeObserver.observe(terminalRef.current)
      }
    }

    initTerminal()

    // Cleanup
    return () => {
      const currentSocket = socketRef.current;
      const currentXterm = xtermRef.current;

      if (resizeObserver && terminalRef.current) { // eslint-disable-line react-hooks/exhaustive-deps
        resizeObserver.disconnect()
      }
      if (currentSocket) {
        currentSocket.disconnect()
      }
      if (currentXterm) {
        currentXterm.dispose()
      }
      // Note: window event listener cleanup is handled inside initTerminal
    }
  }, [sessionId, workingDir, isMounted])

  if (!isMounted) {
    return (
      <div className={`relative ${className} flex items-center justify-center bg-[#0a0a0f]`}>
        <div className="text-white/40 text-xs font-mono">Loading terminal...</div>
      </div>
    )
  }

  return (
    <div className={`relative ${className} bg-[#0a0a0f]`}>
      <div className="absolute top-2 right-2 z-10">
        <div
          className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
          title={isConnected ? 'Connected' : 'Disconnected'}
        />
      </div>
      <div ref={terminalRef} className="h-full w-full p-2" />
    </div>
  )
}
