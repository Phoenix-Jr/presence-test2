'use client';

import { useAttendance } from '@/store/useAttendance';
import { useMembers } from '@/store/useMembers';
import { MOCK_STATS_HISTORY } from '@/lib/mock-data';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Activity,
  Zap,
  CalendarDays,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`rounded-xl p-3 ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${color}`} />
    </Card>
  );
}

export default function DashboardPage() {
  const { session, records } = useAttendance();
  const { members } = useMembers();

  const activeMembers = members.filter((m) => m.status === 'active').length;
  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = activeMembers - presentCount;
  const attendanceRate =
    activeMembers > 0 ? Math.round((presentCount / activeMembers) * 100) : 0;

  const recentActivity = [...records]
    .sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 5)
    .map((r) => {
      const member = members.find((m) => m.id === r.memberId);
      return { ...r, memberName: member?.name ?? 'Unknown' };
    });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <Badge
          variant={
            session.status === 'in_progress'
              ? 'default'
              : session.status === 'completed'
              ? 'secondary'
              : 'outline'
          }
          className="text-xs px-3 py-1.5 capitalize"
        >
          {session.status === 'in_progress' ? (
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Session Live
            </span>
          ) : (
            session.status.replace('_', ' ')
          )}
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Members"
          value={members.length}
          sub={`${activeMembers} active`}
          icon={Users}
          color="bg-violet-500"
        />
        <KpiCard
          title="Present Today"
          value={presentCount}
          sub={`${attendanceRate}% attendance rate`}
          icon={UserCheck}
          color="bg-emerald-500"
        />
        <KpiCard
          title="Absent"
          value={absentCount > 0 ? absentCount : '—'}
          sub="Not yet checked in"
          icon={UserX}
          color="bg-rose-500"
        />
        <KpiCard
          title="Avg Attendance"
          value={`${Math.round(
            members.reduce((sum, m) => sum + m.attendanceRate, 0) / (members.length || 1)
          )}%`}
          sub="Rolling average"
          icon={TrendingUp}
          color="bg-amber-500"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Attendance trend */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-violet-500" />
              Attendance Trend (8 Weeks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MOCK_STATS_HISTORY} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="present"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fill="url(#presentGrad)"
                  name="Present"
                />
                <Area
                  type="monotone"
                  dataKey="absent"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fill="transparent"
                  strokeDasharray="4 2"
                  name="Absent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Demographic breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-500" />
              Demographics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MOCK_STATS_HISTORY.slice(-4)} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="men" fill="#8b5cf6" radius={[3, 3, 0, 0]} name="Men" />
                <Bar dataKey="women" fill="#ec4899" radius={[3, 3, 0, 0]} name="Women" />
                <Bar dataKey="children" fill="#f59e0b" radius={[3, 3, 0, 0]} name="Children" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No activity yet — start a session to begin tracking.
            </p>
          ) : (
            <ul className="space-y-3">
              {recentActivity.map((activity) => (
                <li
                  key={activity.id}
                  className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        activity.status === 'present' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <span className="font-medium">{activity.memberName}</span>
                    <Badge variant="outline" className="text-xs">
                      {activity.detectedBy === 'ai' ? '🤖 AI' : '✏️ Manual'}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {format(new Date(activity.timestamp), 'HH:mm:ss')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
