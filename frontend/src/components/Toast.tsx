'use client';

import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const borderClass = 
    type === 'success' ? 'border-l-4 border-l-emerald-500' :
    type === 'error' ? 'border-l-4 border-l-rose-500' :
    'border-l-4 border-l-cyan-500';

  const shadowClass =
    type === 'success' ? 'shadow-[0_10px_30px_-10px_rgba(16,185,129,0.2)]' :
    type === 'error' ? 'shadow-[0_10px_30px_-10px_rgba(244,63,94,0.2)]' :
    'shadow-[0_10px_30px_-10px_rgba(6,182,212,0.2)]';

  return (
    <div className={`fixed bottom-8 right-8 z-[1000] flex items-center gap-3 rounded-lg border border-white/10 bg-slate-950/95 px-6 py-4 text-sm font-medium text-slate-100 backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${borderClass} ${shadowClass}`}>
      {type === 'success' && (
        <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {type === 'error' && (
        <svg className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )}
      {type === 'info' && (
        <svg className="h-5 w-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-slate-400 hover:text-white">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
