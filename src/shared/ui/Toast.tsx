'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

interface AlertOptions {
  title?: string;
  message: string;
  buttonLabel?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
  showAlert: (options: AlertOptions) => Promise<void>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<(ConfirmOptions & { resolve: (val: boolean) => void }) | null>(null);
  const [alertDialog, setAlertDialog] = useState<(AlertOptions & { resolve: () => void }) | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const showConfirm = (options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmDialog({
        ...options,
        resolve
      });
    });
  };

  const showAlert = (options: AlertOptions) => {
    return new Promise<void>((resolve) => {
      setAlertDialog({
        ...options,
        resolve
      });
    });
  };

  const handleConfirmChoose = (value: boolean) => {
    if (confirmDialog) {
      confirmDialog.resolve(value);
      setConfirmDialog(null);
    }
  };

  const handleAlertDismiss = () => {
    if (alertDialog) {
      alertDialog.resolve();
      setAlertDialog(null);
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, showConfirm, showAlert }}>
      {children}

      {/* TOAST NOTIFICATIONS PORTAL */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => {
          let bgColor = 'bg-white border-zinc-200';
          let textColor = 'text-zinc-800';
          let icon = null;

          if (toast.type === 'success') {
            bgColor = 'bg-emerald-50/95 border-emerald-200';
            textColor = 'text-emerald-900';
            icon = (
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            );
          } else if (toast.type === 'error') {
            bgColor = 'bg-rose-50/95 border-rose-200';
            textColor = 'text-rose-900';
            icon = (
              <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            );
          } else {
            bgColor = 'bg-amber-50/95 border-amber-200';
            textColor = 'text-amber-900';
            icon = (
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            );
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto border backdrop-blur-md shadow-kinetic px-5 py-4 rounded-2xl flex items-center justify-between gap-4 animate-slide-in-right ${bgColor} ${textColor}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">{icon}</div>
                <p className="text-xs font-bold uppercase tracking-wider font-sans">{toast.message}</p>
              </div>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-zinc-400 hover:text-zinc-600 transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      {/* IMPERATIVE CONFIRMATION MODAL */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#F9F9F7] border border-zinc-200/80 rounded-[2rem] max-w-md w-full shadow-architectural p-8 space-y-6 animate-scale-up">
            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900">
                {confirmDialog.title}
              </h3>
              <p className="text-sm text-zinc-500 font-medium tracking-wide">
                {confirmDialog.message}
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => handleConfirmChoose(false)}
                className="h-12 px-6 rounded-full border border-zinc-300 hover:border-zinc-800 text-[10px] font-black tracking-widest uppercase transition-all duration-200 text-zinc-700 hover:text-zinc-900"
              >
                {confirmDialog.cancelLabel || 'Cancel'}
              </button>
              <button
                onClick={() => handleConfirmChoose(true)}
                className={`h-12 px-8 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-200 shadow-sm ${
                  confirmDialog.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                    : 'bg-zinc-900 hover:bg-[#C5A059] text-white hover:text-zinc-900'
                }`}
              >
                {confirmDialog.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPERATIVE ALERT MODAL */}
      {alertDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#F9F9F7] border border-zinc-200/80 rounded-[2rem] max-w-md w-full shadow-architectural p-8 space-y-6 animate-scale-up">
            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900">
                {alertDialog.title || 'Notification'}
              </h3>
              <p className="text-sm text-zinc-500 font-medium tracking-wide">
                {alertDialog.message}
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={handleAlertDismiss}
                className="h-12 px-8 rounded-full bg-zinc-900 hover:bg-[#C5A059] hover:text-zinc-900 text-white text-[10px] font-black tracking-widest uppercase transition-all duration-200 shadow-sm"
              >
                {alertDialog.buttonLabel || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
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
