import React from 'react';
import { motion } from 'motion/react';
import {
    ShieldCheck,
    Target,
    Zap,
    LayoutDashboard,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    BarChart3,
    Bot
} from 'lucide-react';

interface LandingPageProps {
    onGetStarted: () => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
    const outcomes = [
        {
            icon: <CheckCircle2 className="text-brand-green" size={24} />,
            title: "Automated Analysis",
            description: "Instant evaluation of all chat and call transcripts without manual intervention."
        },
        {
            icon: <Target className="text-brand-accent" size={24} />,
            title: "LLM-Based Scoring",
            description: "Objective scoring of empathy, resolution, and compliance using advanced LLMs."
        },
        {
            icon: <AlertCircle className="text-brand-red" size={24} />,
            title: "Real-time Detection",
            description: "Identify compliance breaches and script deviations as they happen."
        },
        {
            icon: <Zap className="text-brand-blue" size={24} />,
            title: "Contextual Feedback",
            description: "RAG-powered suggestions for agents based on internal knowledge and best practices."
        },
        {
            icon: <BarChart3 className="text-white" size={24} />,
            title: "Supervisor Dashboards",
            description: "Granular agent-wise analytics to identify performance trends and training needs."
        }
    ];

    return (
        <div className="flex-1 overflow-y-auto bg-brand-bg selection:bg-brand-accent/30">
            {/* Hero Section */}
            <section className="relative pt-24 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-accent/10 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-brand-blue/5 blur-[100px] rounded-full" />
                </div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-bold uppercase tracking-widest mb-8"
                    >
                        <Bot size={14} />
                        Next-Gen Quality Auditing
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-display font-black tracking-tight mb-8 leading-[1.1]"
                    >
                        GenAI-Powered <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-orange-400">
                            Support Quality Auditor
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed"
                    >
                        Revolutionize your QA process with AI that reviews, scores, and improves
                        customer interactions in real time.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button
                            onClick={onGetStarted}
                            className="group px-8 py-4 bg-brand-accent text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(242,125,38,0.3)] hover:shadow-[0_0_30px_rgba(242,125,38,0.5)] transition-all flex items-center gap-2"
                        >
                            Get Started
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <a
                            href="#problem"
                            className="px-8 py-4 bg-brand-surface border border-brand-border text-zinc-300 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-brand-card transition-all"
                        >
                            Learn More
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Problem & Project Statement */}
            <section id="problem" className="py-24 px-6 bg-brand-surface/50 border-y border-brand-border/50">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-xs font-black uppercase tracking-widest text-brand-accent">The Challenge</h2>
                                <h3 className="text-3xl font-display font-bold leading-tight">
                                    Overcoming the QA Bottleneck
                                </h3>
                                <p className="text-zinc-400 text-lg leading-relaxed">
                                    Traditional manual auditing is slow, inconsistent, and only covers a fraction
                                    of customer interactions. High volumes of chats and calls leave businesses
                                    vulnerable to compliance breaches and missed opportunities for training.
                                </p>
                            </div>

                            <div className="space-y-4 pt-8 border-t border-brand-border/50">
                                <h2 className="text-xs font-black uppercase tracking-widest text-brand-blue">Our Mission</h2>
                                <h3 className="text-3xl font-display font-bold leading-tight">
                                    Intelligent Quality Assurance
                                </h3>
                                <p className="text-zinc-400 text-lg leading-relaxed">
                                    This project builds a platform that evaluates tone, empathy, and
                                    resolution effectiveness. Designed for BPOs and SaaS companies, it
                                    reduces manual workload while ensuring 100% coverage and real-time compliance.
                                </p>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-0 bg-brand-accent/20 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-brand-card border border-brand-border p-8 rounded-[2rem] shadow-2xl">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 p-4 bg-brand-bg rounded-2xl border border-brand-border/50">
                                        <div className="bg-brand-accent/10 p-2 rounded-lg text-brand-accent">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Compliance</p>
                                            <p className="text-sm font-bold text-zinc-200">Script Adherence Detected</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-brand-bg rounded-2xl border border-brand-border/50">
                                        <div className="bg-brand-green/10 p-2 rounded-lg text-brand-green">
                                            <Zap size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sentiment</p>
                                            <p className="text-sm font-bold text-zinc-200">High Empathy Score (94%)</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-brand-bg rounded-2xl border border-brand-border/50">
                                        <div className="bg-brand-blue/10 p-2 rounded-lg text-brand-blue">
                                            <LayoutDashboard size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Analytics</p>
                                            <p className="text-sm font-bold text-zinc-200">Real-time Trend Analysis</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Outcomes Grid */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-xs font-black uppercase tracking-widest text-brand-accent mb-4">Key Outcomes</h2>
                        <h3 className="text-4xl font-display font-bold">Everything you need to scale QA</h3>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {outcomes.map((outcome, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -5 }}
                                className="p-8 bg-brand-surface border border-brand-border rounded-[2rem] hover:border-brand-accent/30 transition-all flex flex-col gap-6"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center">
                                    {outcome.icon}
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-xl font-display font-bold">{outcome.title}</h4>
                                    <p className="text-zinc-500 text-sm leading-relaxed">
                                        {outcome.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}

                        {/* CTA Box */}
                        <div className="p-8 bg-gradient-to-br from-brand-accent to-orange-600 rounded-[2rem] flex flex-col items-center justify-center text-center gap-6 shadow-xl">
                            <h4 className="text-white text-2xl font-display font-bold">Ready to see it in action?</h4>
                            <button
                                onClick={onGetStarted}
                                className="px-8 py-3 bg-white text-brand-accent rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-transform"
                            >
                                Start Auditing Now
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-brand-border px-6">
                <div className="max-w-5xl mx-auto flex flex-col md:row items-center justify-between gap-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-brand-accent p-1.5 rounded-lg">
                            <ShieldCheck className="text-white" size={16} />
                        </div>
                        <h1 className="font-display font-bold text-lg tracking-tight">AuditAI</h1>
                    </div>
                    <p className="text-zinc-600 text-xs font-medium">
                        © 2026 GenAI Customer Support Quality Auditor. Built for Excellence.
                    </p>
                </div>
            </footer>
        </div>
    );
};
