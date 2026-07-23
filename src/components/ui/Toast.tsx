import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info, X, ShieldAlert } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
  warning: (message: string, title?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'success', title?: string, duration = 5000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastItem = { id, message, type, title };
    
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((message: string, title?: string, duration?: number) => {
    toast(message, 'success', title, duration);
  }, [toast]);

  const error = useCallback((message: string, title?: string, duration?: number) => {
    toast(message, 'error', title, duration);
  }, [toast]);

  const info = useCallback((message: string, title?: string, duration?: number) => {
    toast(message, 'info', title, duration);
  }, [toast]);

  const warning = useCallback((message: string, title?: string, duration?: number) => {
    toast(message, 'warning', title, duration);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      <div id="toast-portal" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((item) => {
            let Icon = Info;
            let themeClass = "bg-[#0A1D37] border-l-4 border-l-[#C5A02E] text-white";
            let iconColorClass = "text-[#C5A02E]";
            
            if (item.type === 'success') {
              Icon = CheckCircle2;
              themeClass = "bg-[#0A1D37] border-l-4 border-l-emerald-500 text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)]";
              iconColorClass = "text-emerald-400";
            } else if (item.type === 'error') {
              Icon = ShieldAlert;
              themeClass = "bg-[#0A1D37] border-l-4 border-l-rose-500 text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)]";
              iconColorClass = "text-rose-400";
            } else if (item.type === 'warning') {
              Icon = AlertTriangle;
              themeClass = "bg-[#0A1D37] border-l-4 border-l-[#C5A02E] text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)]";
              iconColorClass = "text-[#C5A02E]";
            }

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`pointer-events-auto flex gap-3 p-4 border border-gray-800 rounded-none ${themeClass}`}
                role="alert"
                id={`toast-item-${item.id}`}
              >
                <div className="shrink-0 mt-0.5">
                  <Icon className={`h-5 w-5 ${iconColorClass}`} />
                </div>
                <div className="flex-1 space-y-0.5">
                  {item.title && (
                    <h5 className="font-serif font-bold text-xs tracking-wide uppercase text-gray-100">
                      {item.title}
                    </h5>
                  )}
                  <p className="text-[11px] leading-normal text-gray-300 font-sans font-medium">
                    {item.message}
                  </p>
                </div>
                <button
                  onClick={() => removeToast(item.id)}
                  className="shrink-0 h-fit p-1 text-gray-400 hover:text-white hover:bg-white/10 transition-colors rounded-none cursor-pointer"
                  aria-label="Close notification"
                  id={`toast-close-${item.id}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
