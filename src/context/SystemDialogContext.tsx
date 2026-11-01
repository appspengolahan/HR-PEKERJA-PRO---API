import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { AlertTriangle, Info, CheckCircle2, Trash2, X } from 'lucide-react';

export type DialogType = 'confirm' | 'danger' | 'alert' | 'success' | 'warning';

export interface DialogOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: DialogType;
}

interface DialogState extends DialogOptions {
  isOpen: boolean;
  resolve?: (value: boolean) => void;
}

interface SystemDialogContextValue {
  showConfirm: (options: DialogOptions | string) => Promise<boolean>;
  showAlert: (message: string, options?: Partial<DialogOptions>) => Promise<void>;
}

const SystemDialogContext = createContext<SystemDialogContextValue | null>(null);

export const SystemDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    message: '',
    title: 'hr pekerja System Says',
    type: 'alert'
  });

  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);

  const showConfirm = useCallback((options: DialogOptions | string): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      const opts: DialogOptions = typeof options === 'string'
        ? { message: options, type: 'confirm' }
        : options;

      setDialogState({
        isOpen: true,
        title: opts.title || 'hr pekerja System Says',
        message: opts.message,
        confirmLabel: opts.confirmLabel || (opts.type === 'danger' ? 'Ya, Hapus' : 'Ya, Lanjutkan'),
        cancelLabel: opts.cancelLabel || 'Batal',
        type: opts.type || 'confirm',
        resolve
      });
    });
  }, []);

  const showAlert = useCallback((message: string, options?: Partial<DialogOptions>): Promise<void> => {
    return new Promise<void>((resolve) => {
      setDialogState({
        isOpen: true,
        title: options?.title || 'hr pekerja System Says',
        message,
        confirmLabel: options?.confirmLabel || 'OK, Mengerti',
        type: options?.type || 'alert',
        resolve: () => resolve()
      });
    });
  }, []);

  const handleClose = (result: boolean) => {
    if (dialogState.resolve) {
      dialogState.resolve(result);
    }
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  // Auto-focus on confirm button when dialog opens
  useEffect(() => {
    if (dialogState.isOpen) {
      const timer = setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [dialogState.isOpen]);

  // Handle keyboard Escape and Enter
  useEffect(() => {
    if (!dialogState.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose(false);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleClose(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialogState.isOpen, dialogState.resolve]);

  // Intercept window.alert so that any unexpected alert calls also display custom centered modal
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg?: any) => {
      showAlert(String(msg ?? ''));
    };
    return () => {
      window.alert = originalAlert;
    };
  }, [showAlert]);

  const isConfirmType = dialogState.type === 'confirm' || dialogState.type === 'danger';

  const renderIcon = () => {
    switch (dialogState.type) {
      case 'danger':
        return (
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 shadow-xs">
            <Trash2 className="w-5 h-5" />
          </div>
        );
      case 'warning':
      case 'confirm':
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      case 'success':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-xs">
            <Info className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <SystemDialogContext.Provider value={{ showConfirm, showAlert }}>
      {children}

      {/* Global Centered Pop-up Modal */}
      {dialogState.isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="relative m-auto w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-150"
          >
            {/* Header: Exact branding text required by user */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold text-xs sm:text-sm tracking-wide text-slate-100">
                  {dialogState.title || 'hr pekerja System Says'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Tutup (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-start gap-3.5">
                {renderIcon()}
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                    {dialogState.message}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                {isConfirmType && (
                  <button
                    type="button"
                    onClick={() => handleClose(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {dialogState.cancelLabel || 'Batal'}
                  </button>
                )}

                <button
                  type="button"
                  ref={confirmButtonRef}
                  onClick={() => handleClose(true)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                    dialogState.type === 'danger'
                      ? 'bg-red-600 hover:bg-red-700 text-white hover:shadow-red-500/20'
                      : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/20'
                  }`}
                >
                  {dialogState.confirmLabel || (isConfirmType ? 'Ya, Lanjutkan' : 'OK')}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </SystemDialogContext.Provider>
  );
};

export const useSystemDialog = (): SystemDialogContextValue => {
  const context = useContext(SystemDialogContext);
  if (!context) {
    throw new Error('useSystemDialog must be used within a SystemDialogProvider');
  }
  return context;
};
