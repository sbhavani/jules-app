"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useJules } from "@/lib/jules/provider";
import type { Session } from "@/types/jules";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { formatDistanceToNow, isValid, parseISO, isToday } from "date-fns";
import { getArchivedSessions } from "@/lib/archive";

function truncateText(text: string, maxLength: number) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

interface SessionListProps {
  onSelectSession: (session: Session) => void;
  selectedSessionId?: string;
}

export function SessionList({
  onSelectSession,
  selectedSessionId,
}: SessionListProps) {
  const { client } = useJules();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [archivedSessionIds, setArchivedSessionIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setArchivedSessionIds(getArchivedSessions());
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date";

    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return "Unknown date";
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Unknown date";
    }
  };

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
      // Provide helpful error messages
      if (err instanceof Error) {
        if (err.message.includes("Invalid API key")) {
          setError("Invalid API key. Please check your API key and try again.");
        } else if (err.message.includes("Resource not found")) {
          // For 404, just show empty state instead of error
          setSessions([]);
          setError(null);
        } else {
          setError(err.message);
        }
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

  const getStatusColor = (status: Session["status"]) => {
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

  const getRepoShortName = (sourceId: string) => {
    // Extract just the repo name from "owner/repo"
    const parts = sourceId.split("/");
    return parts[parts.length - 1] || sourceId;
  };

  // Filter out archived sessions and apply search
  const visibleSessions = useMemo(() => {
    return sessions
      .filter((session) => !archivedSessionIds.has(session.id))
      .filter((session) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const title = (session.title || "").toLowerCase();
        const repo = (session.sourceId || "").toLowerCase();
        return title.includes(query) || repo.includes(query);
      });
  }, [sessions, archivedSessionIds, searchQuery]);

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
        <Button
          variant="outline"
          size="sm"
          onClick={loadSessions}
          className="h-7 text-[10px] font-mono uppercase tracking-widest"
        >
          Retry
        </Button>
      </div>
    );
  }



  if (visibleSessions.length === 0) {
    return (
      <div className="flex items-center justify-center p-6">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          {searchQuery
            ? "No sessions match your search."
            : sessions.length === 0
              ? "No sessions yet. Create one to get started!"
              : "All sessions are archived."}
        </p>
      </div>
    );
  }

  const sessionLimit = 100;
  // Calculate usage based on sessions created today, regardless of search/archive status
  const dailySessionCount = sessions.filter((session) => {
    if (!session.createdAt) return false;
    try {
      return isToday(parseISO(session.createdAt));
    } catch {
      return false;
    }
  }).length;
  const percentage = Math.min((dailySessionCount / sessionLimit) * 100, 100);

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col bg-zinc-950 overflow-hidden">
        <div className="px-3 py-2 border-b border-white/[0.08] shrink-0">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for repo or sessions"
              aria-label="Search sessions"
              className="h-7 w-full bg-black/50 pl-7 pr-7 text-[10px] border-white/10 focus-visible:ring-purple-500/50 placeholder:text-muted-foreground/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-2 space-y-1">
            {visibleSessions.map((session) => (
              <CardSpotlight
                key={session.id}
                radius={250}
                color={selectedSessionId === session.id ? "#a855f7" : "#404040"}
                className={`relative ${
                  selectedSessionId === session.id ? "border-purple-500/30" : ""
                }`}
              >
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={`Select session ${session.title || "Untitled"}`}
                  className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left relative z-10 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-purple-500/50"
                  onClick={() => onSelectSession(session)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectSession(session);
                    }
                  }}
                >
                  <div
                    className={`flex-shrink-0 mt-1 w-2 h-2 rounded-full ${getStatusColor(session.status)}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 w-full min-w-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-[10px] font-bold leading-tight text-white uppercase tracking-wide flex-1 min-w-0 block overflow-hidden text-ellipsis whitespace-nowrap">
                            {truncateText(session.title || "Untitled", 30)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          align="start"
                          className="bg-zinc-900 border-white/10 text-white text-[10px] max-w-[200px] break-words z-[60]"
                        >
                          <p>{session.title || "Untitled"}</p>
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
        <div className="border-t border-white/[0.08] px-3 py-2.5 bg-black/50 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
              DAILY
            </span>
            <span className="text-[10px] font-mono font-bold text-white/60">
              {dailySessionCount}/{sessionLimit}
            </span>
          </div>
          <div className="w-full h-1 bg-white/5 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          {dailySessionCount >= sessionLimit * 0.8 && (
            <p className="text-[8px] text-white/30 mt-1 leading-tight uppercase tracking-wider font-mono">
              {dailySessionCount >= sessionLimit
                ? "LIMIT REACHED"
                : "APPROACHING LIMIT"}
            </p>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
