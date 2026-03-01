import React from 'react';
import { Users, TrendingDown, Target, Award, AlertTriangle, User, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { Analytics, Audit } from '../types';
import { cn } from '../lib/utils';

interface ReportsViewProps {
  analytics: Analytics | null;
  audits: Audit[];
}

export const ReportsView = ({ analytics, audits }: ReportsViewProps) => {
  if (!analytics) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
    </div>
  );

  const totalAgents = analytics.stats.length;
  const avgOverallScore = analytics.stats.reduce((acc, curr) => acc + curr.avg_score, 0) / (totalAgents || 1);

  // Identify metrics across all audits
  const aggregateMetrics = audits.reduce((acc, audit) => {
    acc.empathy += audit.empathy_score || 0;
    acc.resolution += audit.resolution_score || 0;
    acc.compliance += audit.compliance_score || 0;
    return acc;
  }, { empathy: 0, resolution: 0, compliance: 0 });

  const auditCount = audits.length || 1;
  const metricsData = [
    { subject: 'Empathy', A: Math.round(aggregateMetrics.empathy / auditCount), fullMark: 100 },
    { subject: 'Resolution', A: Math.round(aggregateMetrics.resolution / auditCount), fullMark: 100 },
    { subject: 'Compliance', A: Math.round(aggregateMetrics.compliance / auditCount), fullMark: 100 },
  ];

  const performanceBreakdown = metricsData.map(m => ({ name: m.subject, score: m.A })).sort((a, b) => a.score - b.score);
  const lowestMetric = performanceBreakdown[0];

  // Leaderboard data
  const leaderboard = [...analytics.stats].sort((a, b) => b.avg_score - a.avg_score).slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto bg-brand-bg p-4 md:p-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top Header - Glassmorphism */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-display font-black text-white tracking-tight">Intelligence <span className="text-brand-accent">Hub</span></h2>
            <p className="text-zinc-400 font-medium">Real-time performance metrics and quality insights.</p>
          </div>
          <div className="flex items-center gap-2 bg-brand-surface/50 backdrop-blur-md border border-brand-border px-4 py-2 rounded-2xl">
            <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-green">Live Feed Active</span>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="gradient-border bg-brand-surface/30 backdrop-blur-xl p-8 rounded-[2rem] space-y-3 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-accent/10 rounded-full blur-3xl group-hover:bg-brand-accent/20 transition-all"></div>
            <Users className="text-brand-accent" size={24} />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Active Agents</p>
              <p className="text-4xl font-display font-black text-white mt-1">{totalAgents}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="gradient-border bg-brand-surface/30 backdrop-blur-xl p-8 rounded-[2rem] space-y-3 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-green/10 rounded-full blur-3xl group-hover:bg-brand-green/20 transition-all"></div>
            <Zap className="text-brand-green" size={24} />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Avg Quality</p>
              <p className="text-4xl font-display font-black text-brand-green mt-1">{Math.round(avgOverallScore)}%</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="gradient-border bg-brand-surface/30 backdrop-blur-xl p-8 rounded-[2rem] space-y-3 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-red/10 rounded-full blur-3xl group-hover:bg-brand-red/20 transition-all"></div>
            <TrendingDown className="text-brand-red" size={24} />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Lagging Area</p>
              <p className="text-2xl font-display font-black text-brand-red mt-2 uppercase">{lowestMetric.name}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="gradient-border bg-brand-surface/30 backdrop-blur-xl p-8 rounded-[2rem] space-y-3 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-accent/10 rounded-full blur-3xl group-hover:bg-brand-accent/20 transition-all"></div>
            <Award className="text-brand-accent" size={24} />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Total Audits</p>
              <p className="text-4xl font-display font-black text-white mt-1">{audits.length}</p>
            </div>
          </motion.div>
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Radar Chart - Skills Distribution */}
          <div className="lg:col-span-1 bg-brand-surface/40 backdrop-blur-md border border-brand-border p-8 rounded-[2.5rem] space-y-8 flex flex-col">
            <div className="space-y-1">
              <h3 className="text-xl font-display font-bold">Skills Matrix</h3>
              <p className="text-xs text-zinc-500 font-medium">Aggregate metric distribution</p>
            </div>

            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={metricsData}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 12, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Performance"
                    dataKey="A"
                    stroke="#f27d26"
                    fill="#f27d26"
                    fillOpacity={0.5}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {metricsData.map(m => (
                <div key={m.subject} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", m.A > 80 ? "bg-brand-green" : m.A > 60 ? "bg-brand-accent" : "bg-brand-red")}></div>
                    <span className="text-xs font-bold text-zinc-400">{m.subject}</span>
                  </div>
                  <span className="text-sm font-black">{m.A}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance & Trends - 2 Columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trend Graphs */}
            <div className="bg-brand-surface/40 backdrop-blur-md border border-brand-border p-8 rounded-[2.5rem] space-y-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-xl font-display font-bold">Quality & Compliance</h3>
                  <p className="text-xs text-zinc-500 font-medium tracking-wide">Performance drift over 30 days</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-brand-accent rounded-full"></div>
                    <span className="text-[10px] font-black uppercase text-zinc-500">Quality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-brand-green rounded-full"></div>
                    <span className="text-[10px] font-black uppercase text-zinc-500">Compliance</span>
                  </div>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="date" stroke="#3f3f46" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="avg_score" stroke="#f27d26" strokeWidth={4} dot={false} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="avg_compliance" stroke="#10b981" strokeWidth={4} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Agent Analytics Bar Chart */}
              <div className="bg-brand-surface/40 backdrop-blur-md border border-brand-border p-8 rounded-[2.5rem] space-y-6">
                <h3 className="text-lg font-display font-bold">Agent Variance</h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.stats}>
                      <Bar dataKey="avg_score" radius={[8, 8, 8, 8]}>
                        {analytics.stats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.avg_score > 80 ? '#10b981' : entry.avg_score > 60 ? '#f27d26' : '#ef4444'} fillOpacity={0.8} />
                        ))}
                      </Bar>
                      <XAxis dataKey="agent_name" hide />
                      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ display: 'none' }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Leaderboard Card */}
              <div className="bg-brand-surface/40 backdrop-blur-md border border-brand-border p-8 rounded-[2.5rem] space-y-6">
                <div className="flex items-center gap-2">
                  <Award className="text-brand-accent" size={20} />
                  <h3 className="text-lg font-display font-bold">Top Performers</h3>
                </div>
                <div className="space-y-4">
                  {leaderboard.map((agent, i) => (
                    <div key={agent.agent_name} className="flex items-center justify-between p-3 rounded-2xl bg-brand-bg/50 border border-brand-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-black border border-brand-border">
                          #{i + 1}
                        </div>
                        <span className="text-sm font-bold text-zinc-200">{agent.agent_name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-brand-green">{agent.avg_score}%</p>
                        <p className="text-[10px] text-zinc-500 uppercase font-black">{agent.total_audits} Audits</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Insight Generator */}
        <div className="bg-gradient-to-r from-brand-accent/20 to-brand-green/10 border border-brand-accent/20 p-10 rounded-[3rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-brand-accent/20 rounded-full w-fit border border-brand-accent/30">
                <Target size={16} className="text-brand-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent">Strategic Insight</span>
              </div>
              <h3 className="text-3xl font-display font-black text-white leading-tight">
                Enhance <span className="text-brand-accent underline decoration-brand-accent/30 underline-offset-8">{lowestMetric.name}</span> across your team.
              </h3>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Our analysis shows that {lowestMetric.name} is currently the primary friction point. Improving this metric by <span className="text-brand-green font-bold">15%</span> could boost overall customer satisfaction by <span className="text-brand-accent font-bold">32%</span> based on current trends.
              </p>
              <button className="bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">
                Generate Training Plan
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-brand-surface/40 backdrop-blur-md border border-brand-border rounded-3xl space-y-2">
                <ShieldCheck className="text-brand-green" size={20} />
                <p className="text-2xl font-display font-black">94%</p>
                <p className="text-[10px] font-black text-zinc-500 uppercase">Compliance Stability</p>
              </div>
              <div className="p-6 bg-brand-surface/40 backdrop-blur-md border border-brand-border rounded-3xl space-y-2">
                <Zap className="text-brand-accent" size={20} />
                <p className="text-2xl font-display font-black">+12%</p>
                <p className="text-[10px] font-black text-zinc-500 uppercase">Weekly Velocity</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
