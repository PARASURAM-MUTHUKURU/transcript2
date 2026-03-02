import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            layout
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className="pointer-events-auto"
                        >
                            <div className={`
                flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl min-w-[300px] max-w-md
                ${toast.type === 'success' ? 'bg-brand-green/10 border-brand-green/20 text-brand-green' :
                                    toast.type === 'error' ? 'bg-brand-red/10 border-brand-red/20 text-brand-red' :
                                        'bg-brand-blue/10 border-brand-blue/20 text-brand-blue'}
                backdrop-blur-md
              `}>
                                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
                                {toast.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                                {toast.type === 'info' && <Info className="w-5 h-5 flex-shrink-0" />}

                                <p className="text-sm font-medium flex-grow">{toast.message}</p>

                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="p-1 hover:bg-black/10 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
