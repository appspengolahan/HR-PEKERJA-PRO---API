import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Ya, Lanjutkan'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 text-slate-800 space-y-4">
        
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Konfirmasi Tindakan</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            {confirmLabel}
          </button>
        </div>

      </div>
    </div>
  );
};
