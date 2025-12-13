'use client';

import { useState, useCallback, useEffect } from 'react';
import { useJules } from '@/lib/jules/provider';
import type { Session, Activity } from '@/types/jules';
import { SessionList } from './session-list';
import { ActivityFeed } from './activity-feed';
import { CodeDiffSidebar } from './code-diff-sidebar';
import { AnalyticsDashboard } from './analytics-dashboard';
import { SessionBoard } from './session-board';
import { NewSessionDialog } from './new-session-dialog';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, LogOut, Settings, BarChart3, MessageSquare, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';


export function AppLayout() {
  const { clearApiKey } = useJules();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [view, setView] = useState<'sessions' | 'analytics' | 'board'>('sessions');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [codeDiffSidebarCollapsed, setCodeDiffSidebarCollapsed] = useState(false);
  const [showCodeDiffs, setShowCodeDiffs] = useState(false);
  const [currentActivities, setCurrentActivities] = useState<Activity[]>([]);
  const [codeSidebarWidth, setCodeSidebarWidth] = useState(600);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - mouseMoveEvent.clientX;
        if (newWidth > 300 && newWidth < 1200) {
          setCodeSidebarWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session);
    setView('sessions');
    setMobileMenuOpen(false);
  };

  const handleSessionCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleSessionArchived = () => {
    // Clear the selected session and refresh the session list
    setSelectedSession(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleLogout = () => {
    clearApiKey();
    setSelectedSession(null);
  };

  return (
    <div className="flex h-screen flex-col bg-black">
      {/* Header */}
      <header className="border-b border-white/[0.08] bg-zinc-950/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0 bg-zinc-950 border-white/[0.08]">
                <SheetHeader className="border-b border-white/[0.08] px-3 py-2.5">
                  <SheetTitle className="text-[10px] font-bold text-white/40 uppercase tracking-widest">SESSIONS</SheetTitle>
                </SheetHeader>
                <SessionList
                  key={refreshKey}
                  onSelectSession={handleSessionSelect}
                  selectedSessionId={selectedSession?.id}
                />
              </SheetContent>
            </Sheet>
            <h1 className="text-sm font-bold tracking-tight text-white">JULES</h1>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 hover:bg-white/5 text-white/80"
              onClick={() => setView('sessions')}
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Sessions</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 hover:bg-white/5 text-white/80"
              onClick={() => setView('board')}
            >
              <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Board</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 hover:bg-white/5 text-white/80"
              onClick={() => setView('analytics')}
            >
              <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Analytics</span>
            </Button>
            <NewSessionDialog onSessionCreated={handleSessionCreated} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5 text-white/60">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-zinc-950 border-white/[0.08]">

                <DropdownMenuItem onClick={handleLogout} className="hover:bg-white/5 text-white/80">
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  <span className="text-xs uppercase tracking-wide">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className={`hidden md:flex border-r border-white/[0.08] flex-col bg-zinc-950 transition-all duration-200 ${
          sidebarCollapsed ? 'md:w-12' : 'md:w-64'
        }`}>
          <div className="px-3 py-2 border-b border-white/[0.08] flex items-center justify-between">
            {!sidebarCollapsed && (
              <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">SESSIONS</h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 hover:bg-white/5 text-white/60 ${sidebarCollapsed ? 'mx-auto' : ''}`}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            {!sidebarCollapsed && (
              <SessionList
                key={refreshKey}
                onSelectSession={handleSessionSelect}
                selectedSessionId={selectedSession?.id}
              />
            )}
          </div>
        </aside>

        {/* Main Panel */}
        <main className="flex-1 overflow-hidden bg-black">
          {view === 'analytics' ? (
            <AnalyticsDashboard />
          ) : view === 'board' ? (
            <SessionBoard />
          ) : selectedSession ? (
            <ActivityFeed
              session={selectedSession}
              onArchive={handleSessionArchived}
              showCodeDiffs={showCodeDiffs}
              onToggleCodeDiffs={setShowCodeDiffs}
              onActivitiesChange={setCurrentActivities}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-8">
              <div className="text-center space-y-4 max-w-sm">
                <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest">
                  NO SESSION
                </h2>
                <p className="text-[11px] text-white/30 leading-relaxed uppercase tracking-wide font-mono">
                  Select session or create new
                </p>
                <div className="pt-2">
                  <NewSessionDialog onSessionCreated={handleSessionCreated} />
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Code Diff Sidebar */}
        {selectedSession && showCodeDiffs && (
          <>
            {!codeDiffSidebarCollapsed && (
              <div
                className="w-1 cursor-col-resize bg-transparent hover:bg-blue-500/50 transition-colors z-50"
                onMouseDown={startResizing}
              />
            )}
            <aside
              className={`hidden md:flex border-l border-white/[0.08] flex-col bg-zinc-950 ${
                isResizing ? 'transition-none' : 'transition-all duration-200'
              } ${codeDiffSidebarCollapsed ? 'md:w-12' : ''}`}
              style={{ width: codeDiffSidebarCollapsed ? undefined : codeSidebarWidth }}
            >
              <div className="px-3 py-2 border-b border-white/[0.08] flex items-center justify-between">
                {!codeDiffSidebarCollapsed && (
                  <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">CODE CHANGES</h2>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 hover:bg-white/5 text-white/60 ${codeDiffSidebarCollapsed ? 'mx-auto' : ''}`}
                  onClick={() => setCodeDiffSidebarCollapsed(!codeDiffSidebarCollapsed)}
                >
                  {codeDiffSidebarCollapsed ? (
                    <ChevronLeft className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                {!codeDiffSidebarCollapsed && (
                  <CodeDiffSidebar 
                    activities={currentActivities} 
                    repoUrl={selectedSession ? `https://github.com/${selectedSession.sourceId}` : undefined}
                  />
                )}
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
}
