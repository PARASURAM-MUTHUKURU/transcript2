import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';

interface LoginViewProps {
    onBack?: () => void;
}

export function LoginView({ onBack }: LoginViewProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (!supabase) {
                const isProduction = window.location.hostname !== 'localhost';
                const errorMsg = isProduction 
                    ? 'Authentication server unavailable. Please ensure your Vercel VITE_API_URL environment variable is set to your Railway backend URL.'
                    : 'Authentication client not initialized. Ensure the backend is running on port 3000 and .env.local contains valid SUPABASE variables.';
                throw new Error(errorMsg);
            }

            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-brand-surface rounded-2xl shadow-xl border border-brand-border overflow-hidden relative">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="absolute top-4 left-4 p-2 text-zinc-400 hover:text-white bg-brand-bg/50 rounded-full transition-colors"
                        title="Back to Landing Page"
                    >
                        <ArrowLeft size={20} />
                    </button>
                )}
                <div className="p-8 text-center bg-brand-accent/5 border-b border-brand-border">
                    <div className="bg-brand-accent p-3 rounded-xl shadow-[0_0_20px_rgba(242,125,38,0.4)] inline-block mb-4">
                        <ShieldCheck className="text-white" size={32} />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-text-primary">GenAI-Audit</h2>
                    <p className="text-zinc-500 mt-2 text-sm">Please log in to continue</p>
                </div>

                <form onSubmit={handleLogin} className="p-8 space-y-6">
                    {error && (
                        <div className="p-3 bg-brand-red/10 border border-brand-red/30 text-brand-red rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-text-primary mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-brand-bg border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-text-primary focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                                placeholder="agent@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-text-primary mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-brand-bg border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-text-primary focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-brand-accent text-white rounded-xl font-bold uppercase tracking-wider text-sm shadow-lg hover:bg-brand-accent/90 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 focus:ring-offset-brand-surface disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}
