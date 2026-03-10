import React, { useMemo, memo } from 'react';
import {
    Award,
    TrendingUp,
    MessageSquare,
    ShieldCheck,
    Target,
    Lightbulb,
    AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Audit } from '../types';
import { cn } from '../lib/utils';

interface AgentPortalViewProps {
    audits: Audit[];
    agentEmail?: string;
}

export const AgentPortalView = memo(({ audits, agentEmail }: AgentPortalViewProps) => {
    // Use all audits or filter by agent if backend supports it. Assuming all audits correlate to the agent for demo.
    const myAudits = audits;

    const avgQualityScore = useMemo(() => {
        return myAudits.length > 0
            ? myAudits.reduce((acc, a) => acc + (a.overall_score || 0), 0) / myAudits.length
            : 0;
    }, [myAudits]);

    const avgEmpathy = useMemo(() => {
        return myAudits.length > 0
            ? myAudits.reduce((acc, a) => acc + (a.empathy_score || 0), 0) / myAudits.length
            : 0;
    }, [myAudits]);

    const avgResolution = useMemo(() => {
        return myAudits.length > 0
            ? myAudits.reduce((acc, a) => acc + (a.resolution_score || 0), 0) / myAudits.length
            : 0;
    }, [myAudits]);

    const avgCompliance = useMemo(() => {
        return myAudits.length > 0
            ? myAudits.reduce((acc, a) => acc + (a.compliance_score || 0), 0) / myAudits.length
            : 0;
    }, [myAudits]);

    const radarData = useMemo(() => [
        { subject: 'Empathy', A: avgEmpathy, fullMark: 100 },
        { subject: 'Resolution', A: avgResolution, fullMark: 100 },
        { subject: 'Compliance', A: avgCompliance, fullMark: 100 },
        { subject: 'Efficiency', A: Math.min((avgResolution + avgQualityScore) / 2 + 5, 100), fullMark: 100 }, // Simulated metric
        { subject: 'Professionalism', A: Math.min((avgEmpathy + avgCompliance) / 2 + 10, 100), fullMark: 100 } // Simulated metric
    ], [avgEmpathy, avgResolution, avgCompliance, avgQualityScore]);

    const trendData = useMemo(() => {
        // Simulated chronological sort and extraction
        const sorted = [...myAudits].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        return sorted.map(t => ({
            date: new Date(t.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            score: t.overall_score || 0
        }));
    }, [myAudits]);

    // Aggregate suggestions from low-scoring audits
    const coachingTips = useMemo(() => {
        const tips = myAudits.filter(a => (a.overall_score || 0) < 80).flatMap(a => a.suggestions || []);
        // Deduplicate roughly
        return Array.from(new Set(tips)).slice(0, 3);
    }, [myAudits]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
                            <Target className="text-brand-accent" size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent">Personal Dashboard</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight leading-tight">
                            My <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-orange-400 font-black">Performance</span>
                        </h2>
                        <p className="text-zinc-400 font-medium max-w-xl">
                            Welcome back. Here is your live quality score and personalized coaching insights based on your recent interactions.
                        </p>
                    </div>
                </motion.div>

                {/* Metric Cards */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard
                        icon={Award}
                        label="Live Quality Score"
                        value={`${Math.round(avgQualityScore)}%`}
                        color="text-brand-accent"
                        bg="bg-brand-accent/10"
                        trend="Rolling Average"
                    />
                    <MetricCard
                        icon={MessageSquare}
                        label="Interactions Audited"
                        value={myAudits.length}
                        color="text-brand-green"
                        bg="bg-brand-green/10"
                    />
                    <MetricCard
                        icon={ShieldCheck}
                        label="Avg Compliance"
                        value={`${Math.round(avgCompliance)}%`}
                        color="text-blue-500"
                        bg="bg-blue-500/10"
                    />
                </motion.div>

                {/* Charts & Coaching Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Strength & Weakness Radar */}
                    <motion.div variants={itemVariants} className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border p-8 rounded-[3rem] space-y-6 flex flex-col items-center">
                        <div className="w-full flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-display font-black text-white">Abilities Radar</h3>
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Strengths vs Areas to Improve</p>
                            </div>
                        </div>
                        <div className="h-72 w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid stroke="#27272a" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 12, fontWeight: 700 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'transparent' }} axisLine={false} />
                                    <Radar name="Performance" dataKey="A" stroke="#f27d26" fill="#f27d26" fillOpacity={0.4} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* AI Coach */}
                    <motion.div variants={itemVariants} className="bg-gradient-to-br from-brand-surface to-brand-bg backdrop-blur-xl border border-brand-border p-8 rounded-[3rem] space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-display font-black text-white flex items-center gap-2">
                                    <Lightbulb className="text-brand-accent" /> AI Coach
                                </h3>
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Suggested Responses & Tips</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            {coachingTips.length > 0 ? coachingTips.map((tip, i) => (
                                <div key={i} className="p-4 bg-brand-surface/80 border border-brand-accent/20 rounded-2xl flex gap-4 items-start">
                                    <div className="bg-brand-accent/20 p-2 rounded-xl text-brand-accent shrink-0 mt-1">
                                        <Target size={16} />
                                    </div>
                                    <p className="text-sm text-zinc-300 leading-relaxed font-medium">{tip}</p>
                                </div>
                            )) : (
                                <div className="p-8 text-center border border-dashed border-brand-border rounded-2xl">
                                    <p className="text-zinc-500 text-sm">Great job! No pressing coaching tips at the moment.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                </div>

                {/* Performance Trend */}
                <motion.div variants={itemVariants} className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border p-8 rounded-[3rem] space-y-6">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-display font-black text-white">Score Trend</h3>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">30-Day Quality History</p>
                    </div>
                    <div className="h-64 w-full pt-4">
                        {trendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '1rem' }}
                                        itemStyle={{ color: '#f27d26', fontWeight: 'bold' }}
                                    />
                                    <Line type="monotone" dataKey="score" stroke="#f27d26" strokeWidth={3} dot={{ r: 4, fill: '#18181b', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-zinc-500 text-sm border border-dashed border-brand-border rounded-2xl">
                                Not enough data for trend analysis.
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Recent Conversations Table */}
                <motion.div variants={itemVariants} className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border rounded-[3rem] overflow-hidden">
                    <div className="p-8 border-b border-brand-border/50">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-display font-black text-white">My Conversations</h3>
                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Recent Audited Interactions</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-brand-bg/50 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                    <th className="p-4 pl-8">Date</th>
                                    <th className="p-4">Channel</th>
                                    <th className="p-4">Overall Score</th>
                                    <th className="p-4">Compliance Score</th>
                                    <th className="p-4 pr-8">Violations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/50 text-sm">
                                {myAudits.length > 0 ? myAudits.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10).map((audit) => (
                                    <tr key={audit.id} className="hover:bg-brand-accent/5 transition-colors group">
                                        <td className="p-4 pl-8 text-zinc-300 font-medium">
                                            {new Date(audit.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <span className={cn(
                                                "px-2.5 py-1 flex w-fit items-center gap-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                                audit.type === 'call' ? "bg-brand-blue/10 text-brand-blue border border-brand-blue/20" : "bg-brand-green/10 text-brand-green border border-brand-green/20"
                                            )}>
                                                {audit.type}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-brand-bg rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full rounded-full", (audit.overall_score || 0) >= 80 ? 'bg-brand-green' : (audit.overall_score || 0) >= 60 ? 'bg-brand-accent' : 'bg-brand-red')}
                                                        style={{ width: `${audit.overall_score || 0}%` }}
                                                    />
                                                </div>
                                                <span className="font-bold text-zinc-200">{audit.overall_score || 0}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold text-zinc-200">{audit.compliance_score || 0}%</span>
                                        </td>
                                        <td className="p-4 pr-8">
                                            {audit.violations && audit.violations.length > 0 ? (
                                                <span className="flex w-fit items-center gap-1.5 px-2.5 py-1 bg-brand-red/10 text-brand-red border border-brand-red/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                    <AlertCircle size={12} />
                                                    {audit.violations.length} Issues
                                                </span>
                                            ) : (
                                                <span className="flex w-fit items-center gap-1.5 px-2.5 py-1 bg-brand-green/10 text-brand-green border border-brand-green/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                    <ShieldCheck size={12} />
                                                    Perfect
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-zinc-500 font-medium">
                                            No recent conversations audited yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
});

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
