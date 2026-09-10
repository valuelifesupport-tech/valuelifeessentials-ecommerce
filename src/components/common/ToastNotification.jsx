import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastNotification({ toast, onClose }) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed top-5 right-5 z-[3000] animate-bounce-in max-w-md w-full px-4">
      <div className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-md transition-all ${
        isSuccess 
          ? 'bg-emerald-900/95 text-white border-emerald-500/50 shadow-emerald-900/30' 
          : isError 
          ? 'bg-rose-900/95 text-white border-rose-500/50 shadow-rose-900/30' 
          : 'bg-slate-900/95 text-white border-slate-700 shadow-slate-950/40'
      }`}>
        <div className="p-1 rounded-lg bg-white/10 flex-shrink-0 mt-0.5">
          {isSuccess ? (
            <CheckCircle size={20} className="text-emerald-400" />
          ) : isError ? (
            <AlertCircle size={20} className="text-rose-400" />
          ) : (
            <Info size={20} className="text-blue-400" />
          )}
        </div>

        <div className="flex-1">
          <h4 className="font-extrabold text-sm text-white font-['Outfit']">
            {toast.title || (isSuccess ? 'Success' : isError ? 'Attention' : 'Notice')}
          </h4>
          <p className="text-xs opacity-90 leading-snug mt-0.5">{toast.message}</p>
        </div>

        <button 
          onClick={onClose}
          className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
