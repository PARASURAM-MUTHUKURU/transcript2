import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    TrendingUp,
    TrendingDown,
    ChevronRight,
    Award,
    Clock,
    ShieldCheck,
    Zap,
    Target,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis
} from 'recharts';
import { Analytics, AgentAnalytics } from '../types';
import { cn } from '../lib/utils';
import { AgentSkeleton, AuditSkeleton, Skeleton } from './Skeleton';

interface AgentsDashboardProps {
    analytics: Analytics | null;
}

export const AgentsDashboard = ({ analytics }: AgentsDashboardProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
    const [agentDetails, setAgentDetails] = useState<AgentAnalytics | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        if (selectedAgentId) {
            fetchAgentDetails(selectedAgentId);
        }
    }, [selectedAgentId]);

    const fetchAgentDetails = async (id: number) => {
        setLoadingDetails(true);
        try {
            const res = await fetch(`/api/agents/${id}/analytics`);
            const data = await res.json();
            setAgentDetails(data);
        } catch (error) {
            console.error("Error fetching agent details:", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const filteredAgents = analytics?.stats.filter(a =>
        a.agent_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const selectedAgent = analytics?.stats.find(a => a.agent_id === selectedAgentId);

    const radarData = selectedAgent ? [
        { subject: 'Empathy', A: Math.round(selectedAgent.avg_empathy), fullMark: 100 },
        { subject: 'Resolution', A: Math.round(selectedAgent.avg_resolution), fullMark: 100 },
        { subject: 'Compliance', A: Math.round(selectedAgent.avg_compliance), fullMark: 100 },
    ] : [];

    return (
        <div className="flex-1 overflow-hidden bg-brand-bg flex">
            {/* Left Sidebar: Agent List */}
            <div className="w-80 border-r border-brand-border bg-brand-surface/20 flex flex-col">
                <div className="p-6 border-b border-brand-border space-y-4">
                    <h2 className="text-xl font-display font-black text-white">Agents</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search agents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-brand-bg/50 border border-brand-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-accent/50 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {filteredAgents.map(agent => (
                        <button
                            key={agent.agent_id}
                            onClick={() => setSelectedAgentId(agent.agent_id)}
                            className={cn(
                                "w-full flex items-center justify-between p-4 rounded-2xl border transition-all group",
                                selectedAgentId === agent.agent_id
                                    ? "bg-brand-accent/10 border-brand-accent/30"
                                    : "bg-brand-surface/30 border-brand-border/50 hover:border-zinc-700"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-brand-border flex items-center justify-center font-bold text-zinc-400 group-hover:text-brand-accent transition-colors">
                                    {agent.agent_name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-zinc-200">{agent.agent_name}</p>
                                    <p className="text-[10px] text-zinc-500 font-black uppercase">{agent.total_audits} Audits</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={cn(
                                    "text-sm font-black",
                                    agent.avg_score >= 80 ? "text-brand-green" : agent.avg_score >= 60 ? "text-brand-accent" : "text-brand-red"
                                )}>
                                    {Math.round(agent.avg_score)}%
                                </p>
                                <ChevronRight className={cn(
                                    "text-zinc-600 transition-transform",
                                    selectedAgentId === agent.agent_id && "rotate-90 text-brand-accent"
                                )} size={14} />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Area: Detailed Analytics */}
            <div className="flex-1 overflow-y-auto p-8 bg-brand-bg custom-scrollbar">
                <AnimatePresence mode="wait">
                    {selectedAgentId ? (
                        <motion.div
                            key={selectedAgentId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="max-w-6xl mx-auto space-y-8"
                        >
                            {loadingDetails ? (
                                <div className="space-y-8">
                                    <div className="flex items-end justify-between">
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="w-16 h-16 rounded-2xl" />
                                            <div className="space-y-2">
                                                <Skeleton className="w-48 h-8" />
                                                <Skeleton className="w-32 h-4" />
                                            </div>
                                        </div>
                                        <Skeleton className="w-24 h-16 rounded-2xl" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <Skeleton className="h-32 rounded-[2rem]" />
                                        <Skeleton className="h-32 rounded-[2rem]" />
                                        <Skeleton className="h-32 rounded-[2rem]" />
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <Skeleton className="h-80 rounded-[2.5rem]" />
                                        <Skeleton className="h-80 rounded-[2.5rem]" />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Header */}
                                    <div className="flex items-end justify-between">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-2xl bg-brand-accent/20 border-2 border-brand-accent/30 flex items-center justify-center text-2xl font-black text-brand-accent shadow-[0_0_20px_rgba(242,125,38,0.2)]">
                                                    {selectedAgent?.agent_name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <h1 className="text-3xl font-display font-black text-white">{selectedAgent?.agent_name}</h1>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-xs font-bold text-zinc-500">Employee ID: #AG{400 + (selectedAgent?.agent_id || 0)}</span>
                                                        <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
                                                        <span className="text-xs font-bold text-brand-green">Active Performer</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="bg-brand-surface border border-brand-border px-6 py-4 rounded-2xl text-center">
                                                <p className="text-[10px] font-black uppercase text-zinc-500 mb-1">Overall QAS</p>
                                                <p className="text-2xl font-display font-black text-white">{Math.round(selectedAgent?.avg_score || 0)}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-brand-surface/40 backdrop-blur-md border border-brand-border p-6 rounded-[2rem] space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Target className="text-brand-accent" size={20} />
                                                {radarData[0]?.A >= 70 ? <ArrowUpRight className="text-brand-green" size={16} /> : <ArrowDownRight className="text-brand-red" size={16} />}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Empathy Score</p>
                                                <p className="text-2xl font-display font-black text-white">{radarData[0]?.A}%</p>
                                            </div>
                                        </div>
                                        <div className="bg-brand-surface/40 backdrop-blur-md border border-brand-border p-6 rounded-[2rem] space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Zap className="text-brand-green" size={20} />
                                                {radarData[1]?.A >= 70 ? <ArrowUpRight className="text-brand-green" size={16} /> : <ArrowDownRight className="text-brand-red" size={16} />}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Resolution Rate</p>
                                                <p className="text-2xl font-display font-black text-white">{radarData[1]?.A}%</p>
                                            </div>
                                        </div>
                                        <div className="bg-brand-surface/40 backdrop-blur-md border border-brand-border p-6 rounded-[2rem] space-y-4">
                                            <div className="flex items-center justify-between">
                                                <ShieldCheck className="text-brand-blue" size={20} />
                                                {radarData[2]?.A >= 80 ? <ArrowUpRight className="text-brand-green" size={16} /> : <ArrowDownRight className="text-brand-red" size={16} />}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Compliance</p>
                                                <p className="text-2xl font-display font-black text-white">{radarData[2]?.A}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Main Charts area */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Personal Trend */}
                                        <div className="bg-brand-surface/40 backdrop-blur-md border border-brand-border p-8 rounded-[2.5rem] space-y-6">
                                            <h3 className="text-lg font-display font-bold">Performance Trend</h3>
                                            <div className="h-64 w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={agentDetails?.trend}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                                        <XAxis dataKey="date" stroke="#3f3f46" fontSize={10} axisLine={false} tickLine={false} />
                                                        <YAxis domain={[0, 100]} hide />
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                                                        />
                                                        <Line type="monotone" dataKey="avg_score" stroke="#f27d26" strokeWidth={3} dot={{ r: 4, fill: '#f27d26' }} activeDot={{ r: 6 }} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Radar Comparison */}
                                        <div className="bg-brand-surface/40 backdrop-blur-md border border-brand-border p-8 rounded-[2.5rem] flex flex-col items-center">
                                            <h3 className="text-lg font-display font-bold self-start mb-4">Competency Radar</h3>
                                            <div className="flex-1 w-full flex items-center justify-center min-h-[300px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                                        <PolarGrid stroke="#27272a" />
                                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }} />
                                                        <Radar
                                                            name={selectedAgent?.agent_name}
                                                            dataKey="A"
                                                            stroke="#f27d26"
                                                            fill="#f27d26"
                                                            fillOpacity={0.5}
                                                        />
                                                    </RadarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Audits */}
                                    <div className="bg-brand-surface/20 border border-brand-border/50 rounded-[2.5rem] p-8 space-y-6">
                                        <div className="flex items-center gap-2">
                                            <Clock className="text-zinc-500" size={20} />
                                            <h3 className="text-lg font-display font-bold">Recent Audits</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {agentDetails?.recent_audits.map(audit => (
                                                <div key={audit.id} className="flex items-center justify-between p-4 bg-brand-bg/50 border border-brand-border/50 rounded-2xl group hover:border-brand-accent/30 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center">
                                                            <Zap className={cn(
                                                                audit.overall_score >= 80 ? "text-brand-green" : audit.overall_score >= 60 ? "text-brand-accent" : "text-brand-red"
                                                            )} size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-zinc-200">Session #{audit.id + 1000}</p>
                                                            <p className="text-[10px] text-zinc-500 font-black uppercase">{new Date(audit.created_at).toLocaleDateString()} • {audit.type}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex items-center gap-6">
                                                        <div>
                                                            <p className="text-xs font-black text-zinc-500 uppercase">Score</p>
                                                            <p className={cn(
                                                                "text-lg font-display font-black",
                                                                audit.overall_score >= 80 ? "text-brand-green" : audit.overall_score >= 60 ? "text-brand-accent" : "text-brand-red"
                                                            )}>{audit.overall_score}%</p>
                                                        </div>
                                                        <ChevronRight className="text-zinc-700 group-hover:text-brand-accent transition-colors" size={20} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-24 h-24 bg-brand-surface/50 rounded-full border border-brand-border flex items-center justify-center text-zinc-700">
                                <Users size={48} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-display font-black text-zinc-400">Agent Intelligence Base</h2>
                                <p className="text-zinc-600 max-w-sm">Select an agent from the sidebar to view detailed performance metrics, skill trends, and coaching opportunities.</p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
