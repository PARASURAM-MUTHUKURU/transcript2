import React from 'react';
import { Users, TrendingDown, Target, Award, AlertTriangle } from 'lucide-react';
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
  Cell
} from 'recharts';
import { Analytics, Audit } from '../types';
import { cn } from '../lib/utils';
import descriptions from '../config/descriptions.json';

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
  const avgScore = analytics.stats.reduce((acc, curr) => acc + curr.avg_score, 0) / (totalAgents || 1);

  // Identify lagging areas across all audits
  const laggingMetrics = audits.reduce((acc, audit) => {
    acc.empathy += audit.empathy_score;
    acc.resolution += audit.resolution_score;
    acc.compliance += audit.compliance_score;
    return acc;
  }, { empathy: 0, resolution: 0, compliance: 0 });

  const auditCount = audits.length || 1;
  const performanceBreakdown = [
    { name: 'Empathy', score: Math.round(laggingMetrics.empathy / auditCount) },
    { name: 'Resolution', score: Math.round(laggingMetrics.resolution / auditCount) },
    { name: 'Compliance', score: Math.round(laggingMetrics.compliance / auditCount) },
  ].sort((a, b) => a.score - b.score);

  const lowestMetric = performanceBreakdown[0];

  return (
    <div className="flex-1 overflow-y-auto bg-brand-bg p-8 space-y-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-surface border border-brand-border p-6 rounded-3xl space-y-2"
          >
            <div className="flex items-center gap-3 text-zinc-500">
              <Users size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Total Agents</span>
            </div>
            <p className="text-3xl font-display font-bold">{totalAgents}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-brand-surface border border-brand-border p-6 rounded-3xl space-y-2"
          >
            <div className="flex items-center gap-3 text-zinc-500">
              <Target size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Avg Quality Score</span>
            </div>
            <p className="text-3xl font-display font-bold text-brand-green">{Math.round(avgScore)}%</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-brand-surface border border-brand-border p-6 rounded-3xl space-y-2"
          >
            <div className="flex items-center gap-3 text-zinc-500">
              <TrendingDown size={18} className="text-brand-red" />
              <span className="text-[10px] font-black uppercase tracking-widest">Lagging Area</span>
            </div>
            <p className="text-xl font-display font-bold text-brand-red truncate">{lowestMetric.name}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-brand-surface border border-brand-border p-6 rounded-3xl space-y-2"
          >
            <div className="flex items-center gap-3 text-zinc-500">
              <Award size={18} className="text-brand-accent" />
              <span className="text-[10px] font-black uppercase tracking-widest">Total Audits</span>
            </div>
            <p className="text-3xl font-display font-bold">{audits.length}</p>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Agent Performance Bar Chart */}
          <div className="bg-brand-surface border border-brand-border p-8 rounded-3xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-display font-bold">Agent Performance</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Avg Score per Agent</p>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.stats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="agent_name"
                    stroke="#71717a"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    cursor={{ fill: '#18181b' }}
                    contentStyle={{
                      backgroundColor: '#09090b',
                      border: '1px solid #27272a',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="avg_score" radius={[4, 4, 0, 0]}>
                    {analytics.stats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.avg_score > 80 ? '#10b981' : entry.avg_score > 60 ? '#f27d26' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quality Trend Line Chart */}
          <div className="bg-brand-surface border border-brand-border p-8 rounded-3xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-display font-bold">Quality Trend</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Last 30 Days</p>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#09090b',
                      border: '1px solid #27272a',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avg_score"
                    stroke="#f27d26"
                    strokeWidth={3}
                    dot={{ fill: '#f27d26', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Lagging Analysis */}
        <div className="bg-brand-surface border border-brand-border p-8 rounded-3xl space-y-8">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-brand-accent" size={24} />
            <h3 className="text-xl font-display font-bold">Critical Lagging Analysis</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {performanceBreakdown.map((metric, i) => (
              <div key={metric.name} className="space-y-4">
                <div className="flex justify-between items-end">
                  <p className="text-sm font-bold text-zinc-200">{metric.name}</p>
                  <p className={cn(
                    "text-xl font-display font-black",
                    metric.score > 80 ? "text-brand-green" : metric.score > 60 ? "text-brand-accent" : "text-brand-red"
                  )}>
                    {metric.score}%
                  </p>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.score}%` }}
                    className={cn(
                      "h-full rounded-full",
                      metric.score > 80 ? "bg-brand-green" : metric.score > 60 ? "bg-brand-accent" : "bg-brand-red"
                    )}
                  />
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  {metric.score < 70
                    ? descriptions.performance.action_required
                    : descriptions.performance.maintaining_standards}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
