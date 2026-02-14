"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useJules } from "@/lib/jules/provider";
import type { Session } from "@/types/jules";
import { 
  KanbanProvider, 
  KanbanBoard as KanbanBoardRoot, 
  KanbanColumnProps, 
  KanbanHeader, 
  KanbanCards, 
  KanbanCard,
  type KanbanItemProps
} from "@/components/ui/kanban";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow, parseISO, isValid, format } from "date-fns";
import { ExternalLink, GitBranch, Clock, RefreshCw, Filter, Inbox } from "lucide-react";
import { getArchivedSessions } from "@/lib/archive";

interface SessionKanbanItem extends KanbanItemProps {
  session: Session;
}

const COLUMNS: KanbanColumnProps[] = [
  { id: "active", name: "Active" },
  { id: "paused", name: "Paused" },
  { id: "completed", name: "Completed" },
  { id: "failed", name: "Failed" },
];

interface KanbanBoardProps {
  onSelectSession: (session: Session) => void;
}

export function KanbanBoard({ onSelectSession }: KanbanBoardProps) {
  const { client } = useJules();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [archivedSessionIds, setArchivedSessionIds] = useState<Set<string>>(new Set());
  const [selectedRepo, setSelectedRepo] = useState<string>("all");

  useEffect(() => {
    setArchivedSessionIds(getArchivedSessions());
  }, []);

  const loadSessions = useCallback(async () => {
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
      console.error("Failed to load sessions:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load sessions");
      }
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const availableRepos = useMemo(() => {
    const repos = new Set<string>();
    sessions.forEach(session => {
      if (session.sourceId && !archivedSessionIds.has(session.id)) {
        repos.add(session.sourceId);
      }
    });
    return Array.from(repos).sort();
  }, [sessions, archivedSessionIds]);

  const repoCountsMap = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.forEach(session => {
      if (session.sourceId && !archivedSessionIds.has(session.id)) {
        counts[session.sourceId] = (counts[session.sourceId] || 0) + 1;
      }
    });
    return counts;
  }, [sessions, archivedSessionIds]);

  const kanbanData = useMemo(() => {
    const validColumnIds = new Set(COLUMNS.map(col => col.id));
    
    return sessions
      .filter((session) => {
        const isNotArchived = !archivedSessionIds.has(session.id);
        const isValidColumn = validColumnIds.has(session.status);
        const matchesRepo = selectedRepo === "all" || session.sourceId === selectedRepo;
        
        return isNotArchived && isValidColumn && matchesRepo;
      })
      .map((session) => ({
        id: session.id,
        name: session.title || "Untitled",
        column: session.status,
        session: session,
      })) as SessionKanbanItem[];
  }, [sessions, archivedSessionIds, selectedRepo]);

  const columnCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    COLUMNS.forEach(col => {
      counts[col.id] = kanbanData.filter(d => d.column === col.id).length;
    });
    return counts;
  }, [kanbanData]);

  const handleDataChange = (newData: SessionKanbanItem[]) => {
    // Merge updated kanban items back into the full sessions list to preserve archived/filtered sessions
    setSessions(prevSessions => {
      const updatedSessions = [...prevSessions];
      
      newData.forEach(item => {
        const index = updatedSessions.findIndex(s => s.id === item.id);
        if (index !== -1) {
          // Only update if status (column) actually changed
          if (updatedSessions[index].status !== item.column) {
            updatedSessions[index] = { 
              ...updatedSessions[index], 
              status: item.column as Session["status"] 
            };
          }
        }
      });
      
      return updatedSessions;
    });
    
    // TODO: Implement backend persistence (updateSession API) here.
    // Status changes are currently local-only and will be lost on refresh.
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      case "failed":
        return "bg-red-500";
      case "paused":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusRingColor = (status: string) => {
    switch (status) {
      case "active":
        return "ring-green-500/50";
      case "completed":
        return "ring-blue-500/50";
      case "failed":
        return "ring-red-500/50";
      case "paused":
        return "ring-yellow-500/50";
      default:
        return "ring-white/20";
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full bg-black flex items-center justify-center" role="status" aria-live="polite">
        <p className="text-sm text-white/50 animate-pulse font-mono uppercase tracking-widest">
          Loading Control Tower...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full bg-black flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-destructive font-mono uppercase tracking-widest">{error}</p>
        <Button variant="outline" size="sm" onClick={loadSessions} className="font-mono uppercase tracking-widest h-8">
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-black flex flex-col overflow-hidden">
      <header className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Control Tower</h2>
            <Badge variant="outline" className="h-4 px-1.5 text-[9px] border-white/10 bg-white/5 text-white/40 font-mono">
              {sessions.filter(s => !archivedSessionIds.has(s.id)).length} TOTAL
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="h-4 px-1.5 text-[8px] border-purple-500/30 bg-purple-500/10 text-purple-400 font-mono uppercase tracking-tighter cursor-help">
                    Beta
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-zinc-900 border-white/10 text-white text-[10px] max-w-[200px]">
                  <p>Status changes are currently local-only and will be lost on page refresh. Persistence is coming soon.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">Manage session lifecycle</p>
        </div>
        <div className="flex items-center gap-2">
          {availableRepos.length > 0 && (
            <Select value={selectedRepo} onValueChange={setSelectedRepo}>
              <SelectTrigger 
                className="h-8 min-w-[180px] bg-black border-white/10 text-white/80 text-[10px] font-mono uppercase tracking-widest hover:bg-white/5 focus:ring-white/10"
                aria-label="Filter by repository"
              >
                <div className="flex items-center gap-2 truncate">
                  <Filter className="h-3 w-3 opacity-50" />
                  <SelectValue placeholder="All Repositories" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 text-white">
                <SelectItem value="all" className="text-[10px] font-mono uppercase tracking-wider focus:bg-white/10 focus:text-white">
                  <div className="flex items-center justify-between w-full gap-8">
                    <span>All Repositories</span>
                    <span className="text-[9px] opacity-40">({sessions.filter(s => !archivedSessionIds.has(s.id)).length})</span>
                  </div>
                </SelectItem>
                {availableRepos.map((repo) => (
                  <SelectItem key={repo} value={repo} className="text-[10px] font-mono uppercase tracking-wider focus:bg-white/10 focus:text-white">
                    <div className="flex items-center justify-between w-full gap-8">
                      <span>{repo}</span>
                      <span className="text-[9px] opacity-40">({repoCountsMap[repo] || 0})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadSessions} 
            className="h-8 text-[10px] font-mono uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 border border-white/10"
            aria-label="Refresh sessions"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Refresh
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden p-6">
        <TooltipProvider>
          <KanbanProvider<SessionKanbanItem>
            columns={COLUMNS}
            data={kanbanData}
            onDataChange={handleDataChange}
            className="h-full"
          >
            {(column) => (
              <KanbanBoardRoot 
                key={column.id} 
                id={column.id} 
                className="bg-zinc-950 border-white/[0.08] rounded-none"
                isOverClassName={getStatusRingColor(column.id)}
              >
                <KanbanHeader className="border-b border-white/[0.08] flex items-center justify-between px-3 py-2.5 bg-black/40">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(column.id)}`} />
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{column.name}</span>
                  </div>
                  <Badge variant="outline" className="h-4 px-1.5 text-[9px] border-white/10 bg-white/5 text-white/40">
                      {columnCounts[column.id] || 0}
                  </Badge>
                </KanbanHeader>
                <KanbanCards<SessionKanbanItem> 
                  id={column.id} 
                  className="bg-transparent gap-3 p-3"
                  emptyContent={
                    <div className="flex flex-col items-center justify-center h-24 border border-dashed border-white/5 rounded-lg opacity-20">
                      <Inbox className="h-4 w-4 mb-2 text-white" />
                      <p className="text-[9px] font-mono uppercase tracking-widest text-white">No {column.name} Sessions</p>
                    </div>
                  }
                >
                  {(item) => (
                    <KanbanCard<SessionKanbanItem> 
                      key={item.id} 
                      {...item} 
                      className="bg-zinc-900 border-white/10 hover:border-white/20 focus-visible:ring-1 focus-visible:ring-white/20 transition-all p-0 overflow-hidden group cursor-pointer"
                      onClick={() => onSelectSession(item.session)}
                    >
                      <SessionCardContent 
                        session={item.session} 
                        onSelect={onSelectSession} 
                        statusColorClass={getStatusColor(item.session.status)}
                      />
                    </KanbanCard>
                  )}
                </KanbanCards>
              </KanbanBoardRoot>
            )}
          </KanbanProvider>
        </TooltipProvider>
      </div>
    </div>
  );
}

function SessionCardContent({ 
  session, 
  onSelect,
  statusColorClass
}: { 
  session: Session; 
  onSelect: (session: Session) => void;
  statusColorClass: string;
}) {
  const getRelativeDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return "Unknown";
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  const getFullDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return "Unknown date";
      return format(date, "PPpp"); // e.g. "Apr 29, 2021, 9:30 PM"
    } catch {
      return "Unknown date";
    }
  };

  return (
    <div className="p-3.5 space-y-3">
      <div className="space-y-1.5">
        <div className="flex items-start gap-2">
          <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${statusColorClass}`} />
          <h4 className="text-[11px] font-bold text-white leading-snug line-clamp-2 uppercase tracking-wide">
            {session.title || "Untitled Session"}
          </h4>
        </div>
        {session.sourceId && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 text-[9px] text-white/40 font-mono cursor-default w-fit max-w-full">
                <GitBranch className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate uppercase tracking-tight">{session.sourceId}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-zinc-900 border-white/10 text-white text-[10px] z-[60]">
              <p>{session.sourceId}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 text-[9px] text-white/30 font-mono uppercase tracking-tighter cursor-default">
              <Clock className="h-2.5 w-2.5" />
              <span>{getRelativeDate(session.lastActivityAt || session.updatedAt)}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-zinc-900 border-white/10 text-white text-[10px] z-[60]">
            <p>{getFullDate(session.lastActivityAt || session.updatedAt)}</p>
          </TooltipContent>
        </Tooltip>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 px-2 text-[9px] font-mono uppercase tracking-widest text-white/40 group-hover:text-white group-hover:bg-white/10 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all border border-white/5"
          aria-label={`View session: ${session.title || "Untitled Session"}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(session);
          }}
        >
          View
          <ExternalLink className="ml-1.5 h-2.5 w-2.5" />
        </Button>
      </div>
    </div>
  );
}
