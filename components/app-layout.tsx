'use client';

import { useState } from 'react';
import { useJules } from '@/lib/jules/provider';
import type { Session } from '@/types/jules';
import { SessionList } from './session-list';
import { ActivityFeed } from './activity-feed';
import { AnalyticsDashboard } from './analytics-dashboard';
import { NewSessionDialog } from './new-session-dialog';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, LogOut, Settings, LayoutDashboard, MessageSquare } from 'lucide-react';

export function AppLayout() {
  const { clearApiKey } = useJules();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [view, setView] = useState<'sessions' | 'analytics'>('sessions');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session);
    setView('sessions');
    setMobileMenuOpen(false);
  };

  const handleSessionCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleLogout = () => {
    clearApiKey();
    setSelectedSession(null);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0">
                <SheetHeader className="border-b p-4">
                  <SheetTitle>Sessions</SheetTitle>
                </SheetHeader>
                <SessionList
                  key={refreshKey}
                  onSelectSession={handleSessionSelect}
                  selectedSessionId={selectedSession?.id}
                />
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-bold">Jules Task Manager</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView(view === 'analytics' ? 'sessions' : 'analytics')}
              title={view === 'analytics' ? "Back to Sessions" : "Analytics Dashboard"}
            >
              {view === 'analytics' ? <MessageSquare className="h-5 w-5" /> : <LayoutDashboard className="h-5 w-5" />}
            </Button>
            <NewSessionDialog onSessionCreated={handleSessionCreated} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-80 border-r flex-col">
          <div className="border-b p-4">
            <h2 className="font-semibold">Sessions</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <SessionList
              key={refreshKey}
              onSelectSession={handleSessionSelect}
              selectedSessionId={selectedSession?.id}
            />
          </div>
        </aside>

        {/* Main Panel */}
        <main className="flex-1 overflow-hidden">
          {view === 'analytics' ? (
            <AnalyticsDashboard />
          ) : selectedSession ? (
            <ActivityFeed session={selectedSession} />
          ) : (
            <div className="flex h-full items-center justify-center p-8">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-semibold text-muted-foreground">
                  No session selected
                </h2>
                <p className="text-muted-foreground">
                  Select a session from the sidebar or create a new one to get started
                </p>
                <NewSessionDialog onSessionCreated={handleSessionCreated} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
