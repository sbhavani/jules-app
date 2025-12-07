'use client';

import { useEffect, useState } from 'react';
import { useJules } from '@/lib/jules/provider';
import type { Session } from '@/types/jules';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CardSpotlight } from '@/components/ui/card-spotlight';
import { formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { getArchivedSessions } from '@/lib/archive';

interface SessionListProps {
  onSelectSession: (session: Session) => void;
  selectedSessionId?: string;
}

export function SessionList({ onSelectSession, selectedSessionId }: SessionListProps) {
  const { client } = useJules();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';

    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Unknown date';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Unknown date';
    }
  };

  useEffect(() => {
    loadSessions();
  }, [client]);

  const loadSessions = async () => {
    if (!client) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await client.listSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      // Provide helpful error messages
      if (err instanceof Error) {
        if (err.message.includes('Invalid API key')) {
          setError('Invalid API key. Please check your API key and try again.');
        } else if (err.message.includes('Resource not found')) {
          // For 404, just show empty state instead of error
          setSessions([]);
          setError(null);
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to load sessions');
      }
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      case 'paused':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRepoShortName = (sourceId: string) => {
    // Extract just the repo name from "owner/repo"
    const parts = sourceId.split('/');
    return parts[parts.length - 1] || sourceId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <p className="text-xs text-muted-foreground">Loading sessions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-6">
        <p className="text-xs text-destructive text-center">{error}</p>
        <Button variant="outline" size="sm" onClick={loadSessions} className="h-7 text-xs">
          Retry
        </Button>
      </div>
    );
  }

  // Filter out archived sessions
  const archivedSessions = getArchivedSessions();
  const visibleSessions = sessions.filter(session => !archivedSessions.has(session.id));

  if (visibleSessions.length === 0) {
    return (
      <div className="flex items-center justify-center p-6">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          {sessions.length === 0
            ? 'No sessions yet. Create one to get started!'
            : 'All sessions are archived.'}
        </p>
      </div>
    );
  }

  const sessionLimit = 100;
  const sessionCount = visibleSessions.length;
  const percentage = Math.min((sessionCount / sessionLimit) * 100, 100);

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col bg-zinc-950">
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {visibleSessions.map((session) => (
              <CardSpotlight
                key={session.id}
                radius={250}
                color={selectedSessionId === session.id ? '#a855f7' : '#404040'}
                className={`relative ${
                  selectedSessionId === session.id ? 'border-purple-500/30' : ''
                }`}
              >
                <div
                  role="button"
                  tabIndex={0}
                  className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left relative z-10 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-purple-500/50"
                  onClick={() => onSelectSession(session)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectSession(session);
                    }
                  }}
                >
                  <div className={`flex-shrink-0 mt-1 w-2 h-2 rounded-full ${getStatusColor(session.status)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 w-full min-w-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-[10px] font-bold leading-tight text-white uppercase tracking-wide flex-1 min-w-0 block overflow-hidden text-ellipsis whitespace-nowrap">
                            {session.title || 'Untitled'}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="start" className="bg-zinc-900 border-white/10 text-white text-[10px] max-w-[200px] break-words z-[60]">
                          <p>{session.title || 'Untitled'}</p>
                        </TooltipContent>
                      </Tooltip>
                      {session.sourceId && (
                        <Badge className="shrink-0 text-[9px] px-1.5 py-0 h-4 font-mono bg-white/10 text-white/70 hover:bg-white/20 border-0 rounded-sm uppercase tracking-wider">
                          {getRepoShortName(session.sourceId)}
                        </Badge>
                      )}
                    </div>
                    <div className="text-[9px] text-white/40 leading-tight font-mono tracking-wide">
                      {formatDate(session.createdAt)}
                    </div>
                  </div>
                </div>
              </CardSpotlight>
            ))}
          </div>
        </ScrollArea>

        {/* Session Limit Indicator */}
        <div className="border-t border-white/[0.08] px-3 py-2.5 bg-black/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
              DAILY
            </span>
            <span className="text-[10px] font-mono font-bold text-white/60">
              {sessionCount}/{sessionLimit}
            </span>
          </div>
          <div className="w-full h-1 bg-white/5 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          {sessionCount >= sessionLimit * 0.8 && (
            <p className="text-[8px] text-white/30 mt-1 leading-tight uppercase tracking-wider font-mono">
              {sessionCount >= sessionLimit ? 'LIMIT REACHED' : 'APPROACHING LIMIT'}
            </p>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
