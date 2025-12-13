'use client'

import { useState, useEffect, useCallback } from 'react'
import { IntegratedTerminal } from './integrated-terminal'
import { Button } from './ui/button'
import { Terminal, X, Minus, Maximize2, Minimize2 } from 'lucide-react'

interface TerminalPanelProps {
  sessionId: string
  repositoryPath?: string
  isOpen: boolean
  onToggle: () => void
}

export function TerminalPanel({
  sessionId,
  repositoryPath = '',
  isOpen,
  onToggle
}: TerminalPanelProps) {
  const [height, setHeight] = useState(400)
  const [isResizing, setIsResizing] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)

  // Load saved height from localStorage
  useEffect(() => {
    const savedHeight = localStorage.getItem('terminal-panel-height')
    if (savedHeight) {
      setHeight(parseInt(savedHeight, 10))
    }
  }, [])

  // Save height to localStorage
  useEffect(() => {
    if (height !== 400) {
      localStorage.setItem('terminal-panel-height', height.toString())
    }
  }, [height])

  // Keyboard shortcut: Ctrl/Cmd + `
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault()
        onToggle()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onToggle])

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
  }, [])

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newHeight = window.innerHeight - e.clientY
        if (newHeight > 100 && newHeight < window.innerHeight - 100) {
          setHeight(newHeight)
        }
      }
    },
    [isResizing]
  )

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', stopResizing)
      return () => {
        window.removeEventListener('mousemove', resize)
        window.removeEventListener('mouseup', stopResizing)
      }
    }
  }, [isResizing, resize, stopResizing])

  const handleMaximize = () => {
    if (isMaximized) {
      setHeight(400)
      setIsMaximized(false)
    } else {
      setHeight(window.innerHeight - 100)
      setIsMaximized(true)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-white/[0.08] z-40 flex flex-col"
      style={{ height: isMaximized ? 'calc(100vh - 56px)' : height }}
    >
      {/* Resize Handle */}
      <div
        className="h-1 cursor-row-resize bg-transparent hover:bg-blue-500/50 transition-colors"
        onMouseDown={startResizing}
      />

      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.08] bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-green-500" />
          <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
            Terminal
          </h3>
          <span className="text-[9px] text-white/30 font-mono">
            {repositoryPath || 'workspace'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-white/5 text-white/60"
            onClick={() => setHeight(200)}
            title="Minimize"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-white/5 text-white/60"
            onClick={handleMaximize}
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-white/5 text-white/60"
            onClick={onToggle}
            title="Close Terminal (Ctrl+`)"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-hidden">
        <IntegratedTerminal
          sessionId={sessionId}
          workingDir={repositoryPath}
          className="h-full"
        />
      </div>
    </div>
  )
}
