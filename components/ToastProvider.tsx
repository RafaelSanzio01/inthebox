"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

interface Toast {
    id: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

interface ToastContextType {
    showToast: (message: string, actionLabel?: string, onAction?: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toast, setToast] = useState<Toast | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showToast = useCallback((message: string, actionLabel?: string, onAction?: () => void) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        const id = Math.random().toString(36).substring(7);
        setToast({ id, message, actionLabel, onAction });

        timeoutRef.current = setTimeout(() => {
            setToast(null);
        }, 5000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <div className="fixed bottom-6 left-6 z-50 animate-toast-in">
                    <div className="bg-gray-900/95 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-2xl border border-white/10 flex items-center gap-4 min-w-[240px]">
                        <span className="text-sm">{toast.message}</span>
                        {toast.actionLabel && toast.onAction && (
                            <button
                                onClick={() => {
                                    toast.onAction?.();
                                    setToast(null);
                                }}
                                className="text-yellow-500 font-bold text-sm hover:text-yellow-400 transition-colors uppercase tracking-wider"
                            >
                                {toast.actionLabel}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
