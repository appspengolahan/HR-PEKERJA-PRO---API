import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Globe, 
  ShieldCheck, 
  Lock, 
  Eye, 
  Share2, 
  QrCode,
  Sparkles
} from 'lucide-react';

interface PublicShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPreview: () => void;
}

export const PublicShareModal: React.FC<PublicShareModalProps> = ({
  isOpen,
  onClose,
  onOpenPreview
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}?view=public`
    : '?view=public';

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Tautan Portal Publik (Untuk Linktree)
              </h3>
              <p className="text-xs text-slate-500">
                Informasi kehadiran operasional yang aman dibagikan ke pihak luar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* URL Box with Copy Button */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">
            Salin Link di Bawah Ini ke Tombol Linktree Anda:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-indigo-900 select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs flex-shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
            </button>
          </div>
          <span className="text-[11px] text-slate-400 block italic">
            * Pihak luar yang membuka tautan ini langsung masuk tanpa diminta kata sandi/PIN.
          </span>
        </div>

        {/* Security & Feature Matrix */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5 text-xs">
          <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
            Perlindungan Privasi &amp; Akses Data:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="space-y-1 bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Dapat Dilihat Pihak Luar:
              </span>
              <ul className="text-slate-600 space-y-0.5 list-disc list-inside">
                <li>Status Hadir / Izin / Sakit</li>
                <li>Pilihan tanggal &amp; kalender</li>
                <li>Filter unit (Cengkeh, Blend, dll)</li>
                <li>Rekapitulasi &amp; % kehadiran bulanan</li>
              </ul>
            </div>

            <div className="space-y-1 bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold text-rose-700 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-rose-600" />
                Terkunci Aman (Disembunyikan):
              </span>
              <ul className="text-slate-600 space-y-0.5 list-disc list-inside">
                <li>Nominal Gaji &amp; Beban Upah</li>
                <li>NIK KTP, Alamat &amp; Kontak HP</li>
                <li>Berkas &amp; Kontrak PKWT Pribadi</li>
                <li>Form input &amp; tombol edit data</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenPreview();
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Eye className="w-4 h-4 text-blue-400" />
            <span>Tinjau Tampilan Publik Sekarang</span>
          </button>
        </div>

      </div>
    </div>
  );
};
