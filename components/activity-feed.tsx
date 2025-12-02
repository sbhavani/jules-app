'use client';

import { useEffect, useState, useRef } from 'react';
import { useJules } from '@/lib/jules/provider';
import type { Activity, Session } from '@/types/jules';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Send } from 'lucide-react';

interface ActivityFeedProps {
  session: Session;
}

export function ActivityFeed({ session }: ActivityFeedProps) {
  const { client } = useJules();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadActivities();
  }, [session.id, client]);

  useEffect(() => {
    scrollToBottom();
  }, [activities]);

  const loadActivities = async () => {
    if (!client) return;

    try {
      setLoading(true);
      const data = await client.listActivities(session.id);
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !client || sending) return;

    try {
      setSending(true);
      const newActivity = await client.createActivity({
        sessionId: session.id,
        content: message.trim(),
      });
      setActivities([...activities, newActivity]);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
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
          {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
        </p>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {activities.map((activity) => (
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
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{activity.content}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>

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
          <Button type="submit" size="icon" disabled={!message.trim() || sending} className="h-11 w-11 md:h-9 md:w-9">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
