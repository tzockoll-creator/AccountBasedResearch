import React, { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const COLORS = {
  success: 'bg-emerald-900/90 border-emerald-700 text-emerald-200',
  error: 'bg-red-900/90 border-red-700 text-red-200',
  info: 'bg-slate-800/90 border-slate-600 text-slate-200',
};

function ToastItem({ toast, onDismiss }) {
  const Icon = ICONS[toast.type] || ICONS.info;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slide-in ${COLORS[toast.type] || COLORS.info}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="text-sm flex-1">{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className="opacity-60 hover:opacity-100">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
