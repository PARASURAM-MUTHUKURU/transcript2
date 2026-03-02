import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-brand-bg text-text-primary">
                    <div className="w-16 h-16 bg-brand-red/10 rounded-full flex items-center justify-center mb-6">
                        <AlertTriangle className="w-8 h-8 text-brand-red" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                    <p className="text-text-secondary max-w-md mb-8">
                        The application encountered an unexpected error. Don't worry, your data is safe.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand-accent text-white rounded-lg font-semibold hover:bg-brand-accent/90 transition-all active:scale-95 shadow-lg shadow-brand-accent/20"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Reload Page
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 p-4 bg-brand-card border border-brand-border rounded-lg text-left max-w-2xl overflow-auto">
                            <p className="text-brand-red font-mono text-xs mb-2">{this.state.error?.toString()}</p>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
