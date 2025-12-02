'use client';

import { useEffect, useState, useMemo } from 'react';
import { useJules } from '@/lib/jules/provider';
import type { Session, Source, Activity } from '@/types/jules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { format, subDays, isAfter, parseISO, differenceInMinutes, startOfDay } from 'date-fns';
import { Loader2, RefreshCw, BarChart3, Clock, CheckCircle2, XCircle } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const STATUS_COLORS = {
  active: '#22c55e', // green-500
  completed: '#3b82f6', // blue-500
  failed: '#ef4444', // red-500
  paused: '#eab308', // yellow-500
};

export function AnalyticsDashboard() {
  const { client } = useJules();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('30');

  const fetchData = async () => {
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
  };

  useEffect(() => {
    fetchData();
  }, [client]);

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

    // Status distribution
    const statusData = [
      { name: 'Active', value: activeSessions, color: STATUS_COLORS.active },
      { name: 'Completed', value: completedSessions, color: STATUS_COLORS.completed },
      { name: 'Failed', value: failedSessions, color: STATUS_COLORS.failed },
    ].filter(d => d.value > 0);

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
      const source = sources.find(s => s.id === curr.sourceId);
      const name = source ? source.repository : 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const repoData = Object.entries(repoCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5

    // Sessions over time
    const sessionsByDate = currentSessions.reduce((acc, curr) => {
      const date = format(parseISO(curr.createdAt), 'MMM dd');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Ensure chronologically sorted
    const timelineData = Object.entries(sessionsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => {
         // This simple sort might fail across years or if format changes,
         // but for 'MMM dd' within last 30 days it works if we map back to date objects.
         // Better way: use the actual date object as key then format later
         return 0;
      });

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
      statusData,
      activityData,
      repoData,
      timelineData: timelineDataSorted
    };
  }, [filteredData, sources]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSessions} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              Based on completed sessions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDuration}m</div>
            <p className="text-xs text-muted-foreground">
              Per session
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repositories</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.repoData.length}</div>
            <p className="text-xs text-muted-foreground">
              Active sources
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart: Sessions over time */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sessions Overview</CardTitle>
            <CardDescription>
              New sessions created over time
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={stats.timelineData}>
                <XAxis
                  dataKey="date"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Session Status</CardTitle>
            <CardDescription>
              Distribution of session statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={stats.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                   contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Most Used Repositories */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Top Repositories</CardTitle>
            <CardDescription>
              Most active repositories by session count
            </CardDescription>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.repoData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip
                   cursor={{fill: 'transparent'}}
                   contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
                <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Breakdown */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Activity Breakdown</CardTitle>
            <CardDescription>
              Types of activities (based on recent sessions)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                   cursor={{fill: 'transparent'}}
                   contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
                <Bar dataKey="value" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
