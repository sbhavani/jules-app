'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useJules } from '@/lib/jules/provider';
import type { Session, Source, Activity } from '@/types/jules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { BorderGlow } from '@/components/ui/border-glow';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { format, subDays, isAfter, parseISO, differenceInMinutes, startOfDay } from 'date-fns';
import { Loader2, RefreshCw, BarChart3, Clock, CheckCircle2 } from 'lucide-react';

export function AnalyticsDashboard() {
  const { client } = useJules();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('30');

  const fetchData = useCallback(async () => {
    if (!client) return;

    try {
      const [sessionsData, sourcesData] = await Promise.all([
        client.listSessions(),
        client.listSources()
      ]);

      setSessions(sessionsData);
      setSources(sourcesData);

      // Fetch activities for the most recent 20 sessions to avoid rate limits
      // Sort sessions by updated date desc
      const sortedSessions = [...sessionsData].sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ).slice(0, 20);

      const activitiesPromises = sortedSessions.map(session =>
        client.listActivities(session.id).catch(() => [] as Activity[])
      );

      const activitiesResults = await Promise.all(activitiesPromises);
      const allActivities = activitiesResults.flat();
      setActivities(allActivities);

    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [client]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filteredData = useMemo(() => {
    const cutoffDate = subDays(new Date(), parseInt(dateRange));

    const filteredSessions = sessions.filter(session =>
      isAfter(parseISO(session.createdAt), cutoffDate)
    );

    // Filter activities that belong to the filtered sessions
    // Note: We only have activities for the top 20 recent sessions
    const sessionIds = new Set(filteredSessions.map(s => s.id));
    const filteredActivities = activities.filter(a => sessionIds.has(a.sessionId));

    return { sessions: filteredSessions, activities: filteredActivities };
  }, [sessions, activities, dateRange]);

  const stats = useMemo(() => {
    const { sessions: currentSessions, activities: currentActivities } = filteredData;

    const totalSessions = currentSessions.length;
    const activeSessions = currentSessions.filter(s => s.status === 'active').length;
    const completedSessions = currentSessions.filter(s => s.status === 'completed').length;
    const failedSessions = currentSessions.filter(s => s.status === 'failed').length;

    // Success rate (completed / (completed + failed))
    const finishedSessions = completedSessions + failedSessions;
    const successRate = finishedSessions > 0
      ? Math.round((completedSessions / finishedSessions) * 100)
      : 0;

    // Average duration (minutes)
    // Only for completed sessions to be accurate, or we can use updated-created for all
    const durations = currentSessions.map(s =>
      differenceInMinutes(parseISO(s.updatedAt), parseISO(s.createdAt))
    );
    const avgDuration = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

    // Activity breakdown
    const activityTypes = currentActivities.reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activityData = Object.entries(activityTypes).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    // Repository usage
    const repoCounts = currentSessions.reduce((acc, curr) => {
      // Try to match by comparing the end of the source ID (since sessions use "owner/repo" and sources use "sources/github/owner/repo")
      const source = sources.find(s =>
        s.id === curr.sourceId ||
        s.id.endsWith(curr.sourceId) ||
        s.name === curr.sourceId
      );
      const name = source ? source.name : (curr.sourceId || 'Unknown');
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const repoData = Object.entries(repoCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5

    // Re-doing timeline properly
    const timelineMap = new Map<string, number>();
    currentSessions.forEach(s => {
       const d = startOfDay(parseISO(s.createdAt)).toISOString();
       timelineMap.set(d, (timelineMap.get(d) || 0) + 1);
    });

    const timelineDataSorted = Array.from(timelineMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([isoDate, count]) => ({
        date: format(parseISO(isoDate), 'MMM dd'),
        count
      }));

    return {
      totalSessions,
      activeSessions,
      completedSessions,
      successRate,
      avgDuration,
      activityData,
      repoData,
      timelineData: timelineDataSorted
    };
  }, [filteredData, sources]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden bg-black">
      <div className="h-full overflow-y-auto overflow-x-hidden p-4 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Dashboard
            </h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Overview of your Jules sessions and activity
            </p>
          </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px] h-8 text-xs text-foreground" aria-label="Select time period">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7" className="text-xs">Last 7 days</SelectItem>
              <SelectItem value="14" className="text-xs">Last 14 days</SelectItem>
              <SelectItem value="30" className="text-xs">Last 30 days</SelectItem>
              <SelectItem value="90" className="text-xs">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing} aria-label="Refresh analytics" className="h-8 w-8 hover:bg-primary/10 hover:border-primary/50 transition-colors">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-primary' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <BorderGlow glowColor="rgba(168, 85, 247, 0.5)">
          <Card className="border-l-2 border-l-primary bg-card/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3">
              <CardTitle className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Sessions</CardTitle>
              <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-3 w-3 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-2xl font-bold tracking-tight">{stats.totalSessions}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                in selected period
              </p>
            </CardContent>
          </Card>
        </BorderGlow>
        <BorderGlow glowColor="rgba(59, 130, 246, 0.5)">
          <Card className="border-l-2 border-l-blue-500 bg-card/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3">
              <CardTitle className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Active Sessions</CardTitle>
              <div className="h-6 w-6 rounded bg-blue-500/10 flex items-center justify-center">
                <BarChart3 className="h-3 w-3 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-2xl font-bold tracking-tight">{stats.activeSessions}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                currently running
              </p>
            </CardContent>
          </Card>
        </BorderGlow>
        <BorderGlow glowColor="rgba(34, 197, 94, 0.5)">
          <Card className="border-l-2 border-l-green-500 bg-card/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3">
              <CardTitle className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Success Rate</CardTitle>
              <div className="h-6 w-6 rounded bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-2xl font-bold tracking-tight">{stats.successRate}%</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {stats.completedSessions} completed
              </p>
            </CardContent>
          </Card>
        </BorderGlow>
        <BorderGlow glowColor="rgba(234, 179, 8, 0.5)">
          <Card className="border-l-2 border-l-yellow-500 bg-card/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3">
              <CardTitle className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Avg Duration</CardTitle>
              <div className="h-6 w-6 rounded bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-3 w-3 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-2xl font-bold tracking-tight">{stats.avgDuration}m</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                per session
              </p>
            </CardContent>
          </Card>
        </BorderGlow>
        <BorderGlow glowColor="rgba(249, 115, 22, 0.5)">
          <Card className="border-l-2 border-l-orange-500 bg-card/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3">
              <CardTitle className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Repositories</CardTitle>
              <div className="h-6 w-6 rounded bg-orange-500/10 flex items-center justify-center">
                <BarChart3 className="h-3 w-3 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-2xl font-bold tracking-tight">{stats.repoData.length}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                active sources
              </p>
            </CardContent>
          </Card>
        </BorderGlow>
      </div>

      {/* Main Chart: Sessions over time */}
      <div className="relative">
        <BackgroundBeams />
        <BorderGlow glowColor="rgba(168, 85, 247, 0.6)" animated>
          <Card className="border-border/40 bg-card/95 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Sessions Overview</CardTitle>
              <CardDescription className="text-[10px]">
                New sessions created over time
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-1 pb-3">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={stats.timelineData}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#colorSessions)"
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </BorderGlow>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {/* Most Used Repositories */}
        <BorderGlow glowColor="rgba(168, 85, 247, 0.4)">
          <Card className="col-span-1 bg-card/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Top Repositories</CardTitle>
              <CardDescription className="text-[10px]">
                Most active repositories by session count
              </CardDescription>
            </CardHeader>
          <CardContent className="pb-3">
             <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.repoData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRepo" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" opacity={0.3} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10}} stroke="#888888" />
                <Tooltip
                   cursor={{fill: 'transparent'}}
                   contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                />
                <Bar dataKey="value" fill="url(#colorRepo)" stroke="#8b5cf6" strokeWidth={1.5} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        </BorderGlow>

        {/* Activity Breakdown */}
        <BorderGlow glowColor="rgba(168, 85, 247, 0.4)">
          <Card className="col-span-1 bg-card/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Activity Breakdown</CardTitle>
              <CardDescription className="text-[10px]">
                Types of activities (based on recent sessions)
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={stats.activityData}>
                  <defs>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                  <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} stroke="#888888" />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="#888888" />
                  <Tooltip
                     cursor={{fill: 'transparent'}}
                     contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  />
                  <Bar dataKey="value" fill="url(#colorActivity)" stroke="#8b5cf6" strokeWidth={1.5} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </BorderGlow>
      </div>
      </div>
    </div>
  );
}
