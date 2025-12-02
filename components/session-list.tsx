'use client';

import { useEffect, useState } from 'react';
import { useJules } from '@/lib/jules/provider';
import type { Session } from '@/types/jules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface SessionListProps {
  onSelectSession: (session: Session) => void;
  selectedSessionId?: string;
}

export function SessionList({ onSelectSession, selectedSessionId }: SessionListProps) {
  const { client } = useJules();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, [client]);

  const loadSessions = async () => {
    if (!client) return;

    try {
      setLoading(true);
      const data = await client.listSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading sessions...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No sessions yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-4">
        {sessions.map((session) => (
          <Card
            key={session.id}
            className={`cursor-pointer transition-colors hover:bg-accent min-h-[44px] ${
              selectedSessionId === session.id ? 'border-primary' : ''
            }`}
            onClick={() => onSelectSession(session)}
          >
            <CardHeader className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{session.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(session.status)}>
                  {session.status}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
