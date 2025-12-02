'use client';

import { useEffect, useState } from 'react';
import { useJules } from '@/lib/jules/provider';
import type { Activity, Session } from '@/types/jules';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { Send } from 'lucide-react';

interface ActivityFeedProps {
  session: Session;
}

export function ActivityFeed({ session }: ActivityFeedProps) {
  const { client } = useJules();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

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

  const formatContent = (content: string) => {
    // Try to parse as JSON and format nicely
    try {
      const parsed = JSON.parse(content);

      // If it's an array (like plan steps), format as list
      if (Array.isArray(parsed)) {
        return (
          <div className="space-y-2">
            {parsed.map((item: any, index: number) => (
              <div key={index} className="pl-4 border-l-2 border-muted">
                {item.title && <div className="font-medium">{item.title}</div>}
                {item.description && <div className="text-muted-foreground text-xs mt-1">{item.description}</div>}
                {!item.title && !item.description && <div>{typeof item === 'string' ? item : JSON.stringify(item)}</div>}
              </div>
            ))}
          </div>
        );
      }

      // If it's an object with steps, format specially
      if (parsed.steps && Array.isArray(parsed.steps)) {
        return (
          <div className="space-y-2">
            {parsed.description && <div className="mb-3">{parsed.description}</div>}
            {parsed.steps.map((step: any, index: number) => (
              <div key={index} className="pl-4 border-l-2 border-muted">
                <div className="font-medium">Step {index + 1}: {step.title || step}</div>
                {step.description && <div className="text-muted-foreground text-xs mt-1">{step.description}</div>}
              </div>
            ))}
          </div>
        );
      }

      // Otherwise return formatted JSON
      return <pre className="text-xs overflow-x-auto">{JSON.stringify(parsed, null, 2)}</pre>;
    } catch {
      // Not JSON, return as plain text
      return <p className="text-sm whitespace-pre-wrap break-words">{content}</p>;
    }
  };

  useEffect(() => {
    loadActivities();
  }, [session.id, client]);

  const loadActivities = async () => {
    if (!client) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await client.listActivities(session.id);
      setActivities(data);
    } catch (err) {
      console.error('Failed to load activities:', err);
      // For 404, just show empty state instead of error (session may not have activities yet)
      if (err instanceof Error && err.message.includes('Resource not found')) {
        setActivities([]);
        setError(null);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load activities';
        setError(errorMessage);
        setActivities([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !client || sending) return;

    try {
      setSending(true);
      setError(null);
      const newActivity = await client.createActivity({
        sessionId: session.id,
        content: message.trim(),
      });
      setActivities([...activities, newActivity]);
      setMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const getActivityIcon = (activity: Activity) => {
    if (activity.role === 'user') {
      return <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>;
    }
    return <AvatarFallback className="bg-secondary text-secondary-foreground">J</AvatarFallback>;
  };

  const getActivityTypeColor = (type: Activity['type']) => {
    switch (type) {
      case 'message':
        return 'bg-blue-500';
      case 'plan':
        return 'bg-purple-500';
      case 'progress':
        return 'bg-yellow-500';
      case 'result':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading activities...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <h2 className="font-semibold truncate">{session.title}</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDate(session.createdAt)}
        </p>
      </div>

      {error && (
        <div className="border-b bg-destructive/10 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={loadActivities}>
              Retry
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {activities.length === 0 && !loading && !error && (
              <div className="flex items-center justify-center min-h-[200px]">
                <p className="text-muted-foreground text-center">
                  No activities yet.
                  {session.status !== 'completed' && session.status !== 'failed' &&
                    <span className="block mt-1">This session may be queued or in progress.</span>
                  }
                </p>
              </div>
            )}
            {activities.filter((activity) => {
              // Filter out activities with empty or meaningless content
              const content = activity.content?.trim();
              if (!content) return false;
              if (content === '{}') return false;
              if (content === '[]') return false;
              // Filter out fallback messages like [agentMessaged], [userMessaged], etc.
              if (/^\[[\w,\s]+\]$/.test(content)) return false;
              try {
                const parsed = JSON.parse(content);
                // Hide empty objects or arrays
                if (typeof parsed === 'object' && Object.keys(parsed).length === 0) return false;
                if (Array.isArray(parsed) && parsed.length === 0) return false;
              } catch {
                // Not JSON, keep it
              }
              return true;
            }).map((activity) => (
              <div
                key={activity.id}
                className={`flex gap-3 ${activity.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  {getActivityIcon(activity)}
                </Avatar>
                <Card className={`flex-1 ${activity.role === 'user' ? 'bg-primary/5' : ''}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={`text-xs ${getActivityTypeColor(activity.type)}`}>
                        {activity.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(activity.createdAt)}
                      </span>
                    </div>
                    <div className="text-sm">{formatContent(activity.content)}</div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <Button type="submit" size="icon" disabled={!message.trim() || sending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
