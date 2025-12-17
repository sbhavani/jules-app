'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useJules } from '@/lib/jules/provider';
import { Settings, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getArchivedSessions } from '@/lib/archive';

// Types for configuration
export interface SessionKeeperConfig {
  isEnabled: boolean;
  autoSwitch: boolean; // Automatically navigate to the active session
  checkIntervalSeconds: number; // How often to check sessions (in seconds)
  inactivityThresholdMinutes: number; // How long before sending a nudge (in minutes)
  activeWorkThresholdMinutes: number; // Threshold for sessions IN_PROGRESS
  messages: string[]; // Global list of messages
  customMessages: Record<string, string[]>; // Map of sessionId -> messages
}

// Default configuration
const DEFAULT_CONFIG: SessionKeeperConfig = {
  isEnabled: false,
  autoSwitch: true,
  checkIntervalSeconds: 30,
  inactivityThresholdMinutes: 1,
  activeWorkThresholdMinutes: 30, // Default 30 minutes for IN_PROGRESS
  messages: [
    "Great! Please keep going as you advise!",
    "Yes! Please continue to proceed as you recommend!",
    "This looks correct. Please proceed.",
    "Excellent plan. Go ahead.",
    "Looks good to me. Continue.",
  ],
  customMessages: {},
};

export function SessionKeeper() {
  const { client, apiKey } = useJules();
  const router = useRouter();
  const [config, setConfig] = useState<SessionKeeperConfig>(DEFAULT_CONFIG);
  const [logs, setLogs] = useState<{ time: string; message: string; type: 'info' | 'action' | 'error' | 'skip' }[]>([]);
  const [sessions, setSessions] = useState<{ id: string; title: string }[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('global');

  // Refs for interval and preventing race conditions
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef(false);

  // Load config from local storage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('jules-session-keeper-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
      } catch (e) {
        console.error('Failed to parse session keeper config', e);
      }
    }
  }, []);

  // Save config to local storage when changed
  useEffect(() => {
    localStorage.setItem('jules-session-keeper-config', JSON.stringify(config));
  }, [config]);

  // Fetch sessions for the dropdown
  useEffect(() => {
    if (client) {
      client.listSessions().then(data => {
        setSessions(data.map(s => ({ id: s.id, title: s.title || s.id })));
      }).catch(e => console.error('Failed to list sessions for config', e));
    }
  }, [client]);

  // Main Loop
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!config.isEnabled || !client || !apiKey) {
      return;
    }

    const runLoop = async () => {
      if (processingRef.current) return;
      processingRef.current = true;

      try {
        addLog('Checking sessions...', 'info');
        const currentSessions = await client.listSessions();
        const now = new Date();
        const archived = getArchivedSessions();

        for (const session of currentSessions) {
          // Skip archived sessions
          if (archived.has(session.id)) {
            continue;
          }

          // Handle Paused/Completed/Failed -> Resume
          if (session.status === 'paused' || session.status === 'completed' || session.status === 'failed') {
             addLog(`Resuming ${session.status} session ${session.id.substring(0, 8)}...`, 'action');
             if (config.autoSwitch) {
               router.push(`/sessions/${session.id}`);
             }
             await client.resumeSession(session.id);
             addLog(`Resumed ${session.id.substring(0, 8)}`, 'action');
             continue;
          }

          // 1. Check for Plan Approval
          if (session.status === 'awaiting_approval' || session.rawState === 'AWAITING_PLAN_APPROVAL') {
            addLog(`Approving plan for session ${session.id.substring(0, 8)}...`, 'action');
            if (config.autoSwitch) {
              router.push(`/sessions/${session.id}`);
            }
            await client.approvePlan(session.id);
            addLog(`Plan approved for ${session.id.substring(0, 8)}`, 'action');
            continue;
          }

          // 2. Check for Inactivity
          const lastActivityTime = session.lastActivityAt ? new Date(session.lastActivityAt) : new Date(session.updatedAt);
          const diffMs = now.getTime() - lastActivityTime.getTime();
          const diffMinutes = diffMs / 60000;

          // Determine threshold
          let threshold = config.inactivityThresholdMinutes;

          // If IN_PROGRESS, use the active work threshold (usually longer)
          if (session.rawState === 'IN_PROGRESS') {
             threshold = config.activeWorkThresholdMinutes;
             // If actively working (e.g. < 30s), always skip
             if (diffMs < 30000) {
               addLog(`Skipped ${session.id.substring(0, 8)}: Working (Active < 30s)`, 'skip');
               continue;
             }
          }

          if (diffMinutes > threshold) {
            // Select Message
            let messages = config.messages;
            if (config.customMessages && config.customMessages[session.id] && config.customMessages[session.id].length > 0) {
              messages = config.customMessages[session.id];
            }

            if (messages.length === 0) {
              addLog(`Skipped ${session.id.substring(0, 8)}: No messages configured`, 'skip');
              continue;
            }

            const message = messages[Math.floor(Math.random() * messages.length)];

            addLog(`Sending nudge to ${session.id.substring(0, 8)} (${Math.round(diffMinutes)}m inactive)`, 'action');

            if (config.autoSwitch) {
              router.push(`/sessions/${session.id}`);
            }

            await client.createActivity({
              sessionId: session.id,
              content: message,
              type: 'message'
            });
            addLog(`Nudge sent to ${session.id.substring(0, 8)}: "${message.substring(0, 20)}..."`, 'action');
          } else {
             // Log why we skipped if it's notable
             if (diffMinutes > 1) {
               addLog(`Skipped ${session.id.substring(0, 8)}: Not inactive enough (${Math.round(diffMinutes * 10) / 10}m < ${threshold}m)`, 'skip');
             }
          }
        }
      } catch (error) {
        console.error('Session Keeper Error:', error);
        addLog(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      } finally {
        processingRef.current = false;
      }
    };

    runLoop();
    intervalRef.current = setInterval(runLoop, config.checkIntervalSeconds * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [config, client, apiKey, router]);

  const addLog = (message: string, type: 'info' | 'action' | 'error' | 'skip') => {
    if (type === 'info') return;
    setLogs(prev => [{
      time: new Date().toLocaleTimeString(),
      message,
      type
    }, ...prev].slice(0, 50));
  };

  const updateMessages = (sessionId: string, newMessages: string[]) => {
    if (sessionId === 'global') {
      setConfig({ ...config, messages: newMessages });
    } else {
      setConfig({
        ...config,
        customMessages: {
          ...config.customMessages,
          [sessionId]: newMessages
        }
      });
    }
  };

  const currentMessages = selectedSessionId === 'global'
    ? config.messages
    : (config.customMessages?.[selectedSessionId] || []);

  if (!apiKey) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`fixed bottom-4 right-4 z-50 rounded-full shadow-lg h-12 w-12 border-2 ${config.isEnabled ? 'bg-green-100 dark:bg-green-900 border-green-500 animate-pulse' : 'bg-background'}`}
          title="Session Keeper Auto-Pilot"
        >
          {config.isEnabled ? <RotateCw className="h-6 w-6 animate-spin-slow" /> : <Settings className="h-6 w-6" />}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <RotateCw className={`h-5 w-5 ${config.isEnabled ? 'animate-spin' : ''}`} />
            Session Keeper Auto-Pilot
          </SheetTitle>
          <SheetDescription>
            Automatically monitors sessions to keep them active and approve plans.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 py-6">
          <div className="flex flex-col gap-4 border p-4 rounded-lg bg-muted/20">
            <div className="flex items-center justify-between">
              <Label htmlFor="keeper-enabled" className="flex flex-col">
                <span className="font-semibold text-base">Enable Auto-Pilot</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Continuously monitor active sessions
                </span>
              </Label>
              <Switch
                id="keeper-enabled"
                checked={config.isEnabled}
                onCheckedChange={(c) => setConfig({ ...config, isEnabled: c })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label htmlFor="auto-switch" className="flex flex-col">
                <span className="font-medium">Auto-Switch Session</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Navigate to the session being acted upon
                </span>
              </Label>
              <Switch
                id="auto-switch"
                checked={config.autoSwitch}
                onCheckedChange={(c) => setConfig({ ...config, autoSwitch: c })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interval">Check Frequency (s)</Label>
              <Input
                id="interval"
                type="number"
                min={10}
                value={config.checkIntervalSeconds}
                onChange={(e) => setConfig({ ...config, checkIntervalSeconds: parseInt(e.target.value) || 30 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">Inactivity Threshold (m)</Label>
              <Input
                id="threshold"
                type="number"
                min={0.5}
                step={0.5}
                value={config.inactivityThresholdMinutes}
                onChange={(e) => setConfig({ ...config, inactivityThresholdMinutes: parseFloat(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div className="space-y-2 border p-4 rounded-lg bg-muted/20">
            <Label>Working Session Threshold</Label>
             <div className="space-y-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Threshold for &quot;In Progress&quot; sessions (minutes)</span>
                <Input
                  className="w-20 h-8"
                  type="number"
                  min={1}
                  value={config.activeWorkThresholdMinutes}
                  onChange={(e) => setConfig({ ...config, activeWorkThresholdMinutes: parseFloat(e.target.value) || 30 })}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Sessions marked &quot;In Progress&quot; by the API will only be nudged after this many minutes of silence.
              </p>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-center">
               <Label>Encouragement Messages</Label>
               <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                  <SelectTrigger className="w-[180px] h-8 text-xs">
                    <SelectValue placeholder="Select context" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global Defaults</SelectItem>
                    {sessions.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.title.substring(0, 20)}...</SelectItem>
                    ))}
                  </SelectContent>
               </Select>
             </div>

             <Textarea
              className="min-h-[100px] font-mono text-xs"
              value={currentMessages.join('\n')}
              onChange={(e) => updateMessages(selectedSessionId, e.target.value.split('\n').filter(line => line.trim() !== ''))}
              placeholder={selectedSessionId === 'global' ? "Enter one message per line..." : "Enter custom messages for this session (leave empty to use global)..."}
            />
            {selectedSessionId !== 'global' && currentMessages.length === 0 && (
               <p className="text-[10px] text-muted-foreground italic">Using global messages for this session.</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Live Activity Log</Label>
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setLogs([])}>Clear</Button>
            </div>
            <Card className="h-[200px] bg-black/90 text-green-400 font-mono text-xs border-green-900/50">
              <ScrollArea className="h-full p-3">
                <div className="space-y-1.5">
                  {logs.length === 0 && <div className="text-muted-foreground italic opacity-50">Waiting for activity...</div>}
                  {logs.map((log, i) => (
                    <div key={i} className={`flex gap-2 border-b border-white/5 pb-1 last:border-0 ${
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'action' ? 'text-green-400 font-bold' :
                      log.type === 'skip' ? 'text-yellow-500/70' :
                      'text-muted-foreground'
                    }`}>
                      <span className="opacity-50 shrink-0">[{log.time}]</span>
                      <span className="break-words">{log.message}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-2 pb-6">
          <Button variant="secondary" onClick={() => setConfig(DEFAULT_CONFIG)}>Reset Defaults</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
