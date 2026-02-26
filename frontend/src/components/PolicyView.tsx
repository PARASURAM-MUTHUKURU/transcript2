import React, { useState } from 'react';
import { ShieldCheck, Upload, Search, MessageSquare, Loader2, FileText, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface PolicyViewProps {
    handlePolicyUpload: (file: File) => Promise<void>;
}

export const PolicyView = ({ handlePolicyUpload }: PolicyViewProps) => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<{ answer: string; sources: any[] } | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleQuery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: query })
            });
            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error("Query failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const onUpload = async (file: File) => {
        setUploading(true);
        await handlePolicyUpload(file);
        setUploading(false);
    };

    return (
        <div className="flex-1 p-8 overflow-y-auto bg-brand-bg">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-4xl font-display font-black tracking-tight">Policy Knowledge Base</h2>
                        <p className="text-zinc-500 mt-2 text-lg">Manage organizational documents and explore the RAG brain.</p>
                    </div>
                    <label className={cn(
                        "px-8 py-4 bg-brand-accent text-white rounded-2xl font-bold text-sm uppercase tracking-widest cursor-pointer shadow-lg shadow-brand-accent/20 hover:scale-[1.02] transition-all flex items-center gap-3",
                        uploading && "opacity-50 pointer-events-none"
                    )}>
                        {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                        {uploading ? 'Processing...' : 'Upload Policy'}
                        <input
                            type="file"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
                        />
                    </label>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Query Area */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-brand-surface border border-brand-border rounded-[2.5rem] p-4 shadow-xl">
                            <form onSubmit={handleQuery} className="flex gap-2">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Ask anything about company policy..."
                                        className="w-full bg-brand-bg/50 border border-brand-border/50 rounded-3xl py-5 pl-16 pr-6 text-lg outline-none focus:ring-2 focus:ring-brand-accent/50 transition-all font-medium"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || !query.trim()}
                                    className="bg-zinc-100 text-zinc-950 px-10 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white disabled:opacity-50 transition-all"
                                >
                                    {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Search'}
                                </button>
                            </form>
                        </div>

                        <AnimatePresence mode="wait">
                            {result ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-brand-surface border border-brand-border rounded-[2.5rem] overflow-hidden shadow-2xl"
                                >
                                    <div className="p-10 space-y-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-brand-accent">
                                                <MessageSquare size={20} />
                                                <span className="text-xs font-black uppercase tracking-widest">AI Synthesis</span>
                                            </div>
                                            <p className="text-xl leading-relaxed text-zinc-200 font-medium">
                                                {result.answer}
                                            </p>
                                        </div>

                                        {result.sources.length > 0 && (
                                            <div className="pt-8 border-t border-brand-border space-y-6">
                                                <div className="flex items-center gap-3 text-zinc-500">
                                                    <FileText size={18} />
                                                    <span className="text-xs font-black uppercase tracking-widest">Retrieved Context</span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {result.sources.map((src, i) => (
                                                        <div key={i} className="bg-brand-bg border border-brand-border p-5 rounded-2xl space-y-3 group hover:border-brand-accent/30 transition-all">
                                                            <div className="flex justify-between items-start">
                                                                <p className="text-xs font-bold text-zinc-300 truncate max-w-[150px]">{src.source}</p>
                                                                <span className="text-[10px] bg-brand-accent/10 text-brand-accent px-2 py-1 rounded-full font-black">
                                                                    {Math.round(src.top_score * 100)}% Match
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-zinc-500 line-clamp-3 leading-relaxed italic">
                                                                "{src.content}"
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-zinc-600 border-2 border-dashed border-brand-border rounded-[2.5rem]">
                                    <Search size={48} className="opacity-10 mb-4" />
                                    <p className="font-display font-bold text-xl opacity-30">Your AI explorer is ready.</p>
                                    <p className="text-sm opacity-20 mt-1">Directly query your ingested manuals and guidelines.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div className="bg-brand-surface border border-brand-border p-8 rounded-[2rem] space-y-6">
                            <div className="flex items-center gap-3 text-brand-green">
                                <ShieldCheck size={22} />
                                <h3 className="font-bold text-lg">System Status</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-brand-border/50">
                                    <span className="text-xs text-zinc-500">Vector Database</span>
                                    <span className="text-xs font-black text-brand-green uppercase">Connected</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-brand-border/50">
                                    <span className="text-xs text-zinc-500">Pipeline Type</span>
                                    <span className="text-xs font-bold text-zinc-300">LangChain + Qdrant</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-xs text-zinc-500">Embeddings</span>
                                    <span className="text-xs font-bold text-zinc-300">Gemini-001</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-brand-accent/20 to-transparent border border-brand-accent/20 p-8 rounded-[2rem] space-y-4">
                            <h4 className="font-bold text-sm">Audit Intelligence</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                The RAG pipeline automatically cross-references every customer transcript with your knowledge base to ensure 100% compliance with internal guidelines.
                            </p>
                            <button className="text-[10px] font-black uppercase text-brand-accent tracking-tighter flex items-center gap-1 group">
                                LEARN MORE <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
