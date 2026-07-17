import React, { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const toast = useCallback((message, opts = {}) => {
    const id = ++idCounter;
    const item = { id, message, type: opts.type || 'success', title: opts.title || null };
    setToasts(t => [...t, item]);
    setTimeout(() => dismiss(id), opts.duration || 3500);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm" data-testid="toast-region">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.28 }}
              className="bg-white border border-line rounded-2xl shadow-soft p-4 flex items-start gap-3"
              data-testid="toast-item"
            >
              <div className="mt-0.5">
                {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-status-funding" />}
                {t.type === 'info' && <Info className="w-5 h-5 text-status-verified" />}
                {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-status-pending" />}
              </div>
              <div className="flex-1 text-sm">
                {t.title && <div className="font-medium text-ink">{t.title}</div>}
                <div className="text-subtle leading-relaxed">{t.message}</div>
              </div>
              <button onClick={() => dismiss(t.id)} className="text-subtle hover:text-ink" aria-label="Dismiss">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
