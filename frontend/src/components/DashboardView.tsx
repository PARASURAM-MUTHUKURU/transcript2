import React from 'react';
import {
    Users,
    MessageSquare,
    ShieldCheck,
    Zap,
    TrendingUp,
    AlertTriangle,
    Award
} from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, BarChart, PieChart } from '@mui/x-charts';
import { Analytics, Audit } from '../types';
import { cn } from '../lib/utils';

interface DashboardViewProps {
    analytics: Analytics | null;
    audits: Audit[];
}

export const DashboardView = ({ analytics, audits }: DashboardViewProps) => {
    const interactionsAudited = audits.length;
    const stats = analytics?.stats || [];

    const avgQualityScore = stats.length > 0
        ? stats.reduce((acc, curr) => acc + curr.avg_score, 0) / stats.length
        : audits.length > 0
            ? audits.reduce((acc, a) => acc + (a.overall_score || 0), 0) / audits.length
            : 0;

    const complianceViolations = audits.reduce((acc, audit) => acc + (audit.violations?.length || 0), 0);
    const resolutionRate = audits.reduce((acc, audit) => acc + (audit.resolution_score || 0), 0) / (audits.length || 1);

    const trendData = (analytics?.trend || []).map(t => ({
        date: new Date(t.date),
        score: t.avg_score,
        compliance: t.avg_compliance
    }));

    const topViolations = audits.reduce((acc: any[], audit) => {
        audit.violations?.forEach((v: any) => {
            const existing = acc.find(item => item.label === v.category);
            if (existing) existing.value++;
            else acc.push({ label: v.category, value: 1 });
        });
        return acc;
    }, []).sort((a, b) => b.value - a.value).slice(0, 5);

    const leaderboardData = stats.map(s => ({
        name: s.agent_name,
        score: s.avg_score
    })).sort((a, b) => b.score - a.score).slice(0, 5);

    const scoreDistribution = [
        { label: '0-20', value: audits.filter(a => (a.overall_score || 0) < 20).length },
        { label: '21-40', value: audits.filter(a => (a.overall_score || 0) >= 20 && (a.overall_score || 0) < 40).length },
        { label: '41-60', value: audits.filter(a => (a.overall_score || 0) >= 40 && (a.overall_score || 0) < 60).length },
        { label: '61-80', value: audits.filter(a => (a.overall_score || 0) >= 60 && (a.overall_score || 0) < 80).length },
        { label: '81-100', value: audits.filter(a => (a.overall_score || 0) >= 80).length },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-brand-bg p-4 md:p-8 space-y-8">
            <motion.div
                className="max-w-7xl mx-auto space-y-12"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-accent/10 border border-brand-accent/20 rounded-full">
                            <TrendingUp className="text-brand-accent" size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent">Live Performance Intel</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight leading-tight">
                            Quality <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-orange-400 font-black">Intelligence</span>
                        </h2>
                        <p className="text-zinc-400 font-medium max-w-xl">Deep-dive into organizational quality scores, compliance health, and agent performance rankings.</p>
                    </div>
                </motion.div>

                {/* Metric Cards */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <MetricCard
                        icon={MessageSquare}
                        label="Interactions Audited"
                        value={interactionsAudited}
                        color="text-brand-accent"
                        bg="bg-brand-accent/10"
                        trend="+12% vs last week"
                    />
                    <MetricCard
                        icon={Award}
                        label="Avg Quality Score"
                        value={`${Math.round(avgQualityScore)}%`}
                        color="text-brand-green"
                        bg="bg-brand-green/10"
                        trend="Stable"
                    />
                    <MetricCard
                        icon={AlertTriangle}
                        label="Compliance Violations"
                        value={complianceViolations}
                        color="text-brand-red"
                        bg="bg-brand-red/10"
                        trend="-4% improvement"
                    />
                    <MetricCard
                        icon={Zap}
                        label="Resolution Rate"
                        value={`${Math.round(resolutionRate)}%`}
                        color="text-blue-500"
                        bg="bg-blue-500/10"
                        trend="+2.4%"
                    />
                </motion.div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Quality Score Trend */}
                    <motion.div variants={itemVariants} className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border p-10 rounded-[3rem] space-y-8 group transition-all hover:bg-brand-surface/50">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-display font-black text-white">Quality Evolution</h3>
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Recent 30 Days Trend</p>
                            </div>
                            <div className="p-3 bg-brand-surface border border-brand-border rounded-2xl group-hover:border-brand-accent/50 transition-all">
                                <TrendingUp className="text-brand-accent" size={20} />
                            </div>
                        </div>
                        <div className="h-80 w-full">
                            <LineChart
                                xAxis={[{
                                    data: trendData.map(t => t.date),
                                    scaleType: 'time',
                                    valueFormatter: (date) => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                                    tickLabelStyle: { fill: '#71717a', fontSize: 10, fontWeight: 700 }
                                }]}
                                series={[
                                    { data: trendData.map(t => t.score), label: 'Quality Score', color: '#f27d26', area: true, showMark: (v) => true, baseline: 'min' },
                                    { data: trendData.map(t => t.compliance), label: 'Compliance', color: '#10b981', area: true, showMark: false }
                                ]}
                                sx={{
                                    '.MuiLineElement-root': { strokeWidth: 3 },
                                    '.MuiAreaElement-root': { fillOpacity: 0.1 },
                                    '.MuiChartsAxis-bottom .MuiChartsAxis-line': { stroke: '#27272a' },
                                    '.MuiChartsAxis-left .MuiChartsAxis-line': { stroke: '#27272a' },
                                    '& .MuiChartsAxis-tickLabel': { fill: '#71717a' }
                                }}
                                margin={{ left: 40, right: 20, top: 20, bottom: 40 }}
                            />
                        </div>
                    </motion.div>

                    {/* Agent Leaderboard */}
                    <motion.div variants={itemVariants} className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border p-10 rounded-[3rem] space-y-8 group transition-all hover:bg-brand-surface/50">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-display font-black text-white">Top Performance</h3>
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Leading Agents by Avg Score</p>
                            </div>
                            <div className="p-3 bg-brand-surface border border-brand-border rounded-2xl group-hover:border-brand-accent/50 transition-all">
                                <Award className="text-brand-accent" size={20} />
                            </div>
                        </div>
                        <div className="h-80 w-full">
                            <BarChart
                                dataset={leaderboardData}
                                xAxis={[{ scaleType: 'band', dataKey: 'name', tickLabelStyle: { fill: '#71717a', fontSize: 10, fontWeight: 700 } }]}
                                series={[{ dataKey: 'score', label: 'Avg Score', color: '#f27d26' }]}
                                slotProps={{ legend: { hidden: true } as any }}
                                margin={{ left: 40, right: 20, top: 20, bottom: 40 }}
                                sx={{
                                    '.MuiBarElement-root': { rx: 12 },
                                    '& .MuiChartsAxis-tickLabel': { fill: '#71717a' }
                                }}
                            />
                        </div>
                    </motion.div>

                    {/* Top Violations */}
                    <motion.div variants={itemVariants} className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border p-10 rounded-[3rem] space-y-8 group transition-all hover:bg-brand-surface/50">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-display font-black text-white">Risk Analysis</h3>
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Top Violations Detected</p>
                            </div>
                            <div className="p-3 bg-brand-surface border border-brand-border rounded-2xl group-hover:border-brand-red/50 transition-all">
                                <AlertTriangle className="text-brand-red" size={20} />
                            </div>
                        </div>
                        <div className="h-80 w-full flex items-center justify-center">
                            <PieChart
                                series={[
                                    {
                                        data: topViolations.map((v, i) => ({ id: i, value: v.value, label: v.label, color: i === 0 ? '#ef4444' : i === 1 ? '#f97316' : '#71717a' })),
                                        innerRadius: 50,
                                        outerRadius: 100,
                                        paddingAngle: 8,
                                        cornerRadius: 15,
                                    },
                                ]}
                                slotProps={{ legend: { labelStyle: { fill: '#71717a', fontSize: 11, fontWeight: 700 } } }}
                                margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
                            />
                        </div>
                    </motion.div>

                    {/* Score Distribution */}
                    <motion.div variants={itemVariants} className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border p-10 rounded-[3rem] space-y-8 group transition-all hover:bg-brand-surface/50">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-display font-black text-white">Score Spread</h3>
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Volume across score ranges</p>
                            </div>
                            <div className="p-3 bg-brand-surface border border-brand-border rounded-2xl group-hover:border-brand-green/50 transition-all">
                                <Zap className="text-brand-green" size={20} />
                            </div>
                        </div>
                        <div className="h-80 w-full">
                            <BarChart
                                dataset={scoreDistribution}
                                xAxis={[{ scaleType: 'band', dataKey: 'label', tickLabelStyle: { fill: '#71717a', fontSize: 10, fontWeight: 700 } }]}
                                series={[{ dataKey: 'value', label: 'Audits', color: '#10b981' }]}
                                margin={{ left: 40, right: 20, top: 20, bottom: 40 }}
                                sx={{
                                    '.MuiBarElement-root': { rx: 12 },
                                    '& .MuiChartsAxis-tickLabel': { fill: '#71717a' }
                                }}
                            />
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

const MetricCard = ({ icon: Icon, label, value, color, bg, trend }: any) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 20, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1 }
        }}
        className="bg-brand-surface/30 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-brand-border space-y-4 relative overflow-hidden group hover:border-brand-accent/50 transition-all"
    >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full blur-3xl group-hover:bg-brand-accent/10 transition-all"></div>

        <div className={cn("inline-flex p-4 rounded-2xl border border-white/5 shadow-inner", bg)}>
            <Icon className={color} size={24} />
        </div>
        <div>
            <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{label}</p>
                {trend && <span className="text-[9px] font-bold text-brand-accent/80 border border-brand-accent/20 px-1.5 py-0.5 rounded-full">{trend}</span>}
            </div>
            <p className="text-5xl font-display font-black text-white mt-1 leading-none tracking-tighter">{value}</p>
        </div>
    </motion.div>
);
