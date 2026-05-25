'use client';

import { useMembers } from '@/store/useMembers';
import { MOCK_STATS_HISTORY } from '@/lib/mock-data';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieIcon,
  Users,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PIE_COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

function InsightCard({
  title,
  value,
  change,
  positive,
}: {
  title: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {change} vs last month
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { members } = useMembers();

  // Demographic data for pie
  const demographicData = [
    { name: 'Adult Men', value: members.filter(m => m.gender === 'male' && m.ageGroup === 'adult').length },
    { name: 'Adult Women', value: members.filter(m => m.gender === 'female' && m.ageGroup === 'adult').length },
    { name: 'Boys', value: members.filter(m => m.gender === 'male' && m.ageGroup === 'child').length },
    { name: 'Girls', value: members.filter(m => m.gender === 'female' && m.ageGroup === 'child').length },
  ];

  // Engagement radar
  const engagementData = [
    { subject: '90-100%', A: members.filter(m => m.attendanceRate >= 90).length },
    { subject: '75-90%', A: members.filter(m => m.attendanceRate >= 75 && m.attendanceRate < 90).length },
    { subject: '60-75%', A: members.filter(m => m.attendanceRate >= 60 && m.attendanceRate < 75).length },
    { subject: '40-60%', A: members.filter(m => m.attendanceRate >= 40 && m.attendanceRate < 60).length },
    { subject: '<40%', A: members.filter(m => m.attendanceRate < 40).length },
  ];

  // Top performers
  const topPerformers = [...members]
    .sort((a, b) => b.attendanceRate - a.attendanceRate)
    .slice(0, 5);

  // At-risk members
  const atRisk = [...members]
    .filter(m => m.status === 'active' && m.attendanceRate < 60)
    .sort((a, b) => a.attendanceRate - b.attendanceRate)
    .slice(0, 5);

  // Compute trend
  const last4 = MOCK_STATS_HISTORY.slice(-4);
  const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length;
  const recentAvg = avg(last4.map(d => d.present));
  const prevAvg = avg(MOCK_STATS_HISTORY.slice(0, 4).map(d => d.present));
  const trendPct = prevAvg > 0 ? (((recentAvg - prevAvg) / prevAvg) * 100).toFixed(1) : '0.0';
  const trendPositive = Number(trendPct) >= 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Deep insights into attendance patterns and member engagement
        </p>
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <InsightCard
          title="Avg Weekly Attendance"
          value={`${Math.round(recentAvg)}`}
          change={`${Math.abs(Number(trendPct))}%`}
          positive={trendPositive}
        />
        <InsightCard
          title="Highly Engaged (≥90%)"
          value={`${members.filter(m => m.attendanceRate >= 90).length}`}
          change="2 members"
          positive={true}
        />
        <InsightCard
          title="At-Risk Members (<60%)"
          value={`${members.filter(m => m.attendanceRate < 60 && m.status === 'active').length}`}
          change="1 member"
          positive={false}
        />
        <InsightCard
          title="Retention Rate"
          value={`${Math.round((members.filter(m => m.status === 'active').length / members.length) * 100)}%`}
          change="3%"
          positive={true}
        />
      </div>

      {/* Tabbed charts */}
      <Tabs defaultValue="trend">
        <TabsList className="mb-4">
          <TabsTrigger value="trend" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" /> Attendance Trend
          </TabsTrigger>
          <TabsTrigger value="demographics" className="gap-1.5">
            <PieIcon className="h-3.5 w-3.5" /> Demographics
          </TabsTrigger>
          <TabsTrigger value="engagement" className="gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" /> Engagement
          </TabsTrigger>
        </TabsList>

        {/* Trend tab */}
        <TabsContent value="trend">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">8-Week Attendance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={MOCK_STATS_HISTORY} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="present" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#grad1)" name="Present" />
                  <Area type="monotone" dataKey="men" stroke="#3b82f6" strokeWidth={1.5} fill="transparent" strokeDasharray="4 2" name="Men" />
                  <Area type="monotone" dataKey="women" stroke="#ec4899" strokeWidth={1.5} fill="transparent" strokeDasharray="4 2" name="Women" />
                  <Area type="monotone" dataKey="children" stroke="#f59e0b" strokeWidth={1.5} fill="transparent" strokeDasharray="4 2" name="Children" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demographics tab */}
        <TabsContent value="demographics">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Congregation Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={demographicData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {demographicData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Weekly Gender Split</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={MOCK_STATS_HISTORY} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
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
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="men" stackId="a" fill="#3b82f6" name="Men" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="women" stackId="a" fill="#ec4899" name="Women" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="children" stackId="a" fill="#f59e0b" name="Children" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement tab */}
        <TabsContent value="engagement">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Attendance Rate Distribution</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={engagementData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                    <Radar name="Members" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} strokeWidth={2} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <div className="space-y-4">
              {/* Top Performers */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-500" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {topPerformers.map((m, i) => (
                    <div key={m.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                        <span className="font-medium">{m.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${m.attendanceRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 w-10 text-right">
                          {m.attendanceRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              {/* At-Risk */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4 text-rose-500" />
                    Needs Follow-up
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {atRisk.length === 0 ? (
                    <p className="text-xs text-muted-foreground">All active members are well engaged 🎉</p>
                  ) : (
                    atRisk.map((m) => (
                      <div key={m.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{m.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-rose-500"
                              style={{ width: `${m.attendanceRate}%` }}
                            />
                          </div>
                          <Badge variant="destructive" className="text-xs px-1.5">
                            {m.attendanceRate}%
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
