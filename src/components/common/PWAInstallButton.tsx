import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
        title="Pasang Aplikasi di Layar Utama HP / Desktop"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
          title="Petunjuk Install di iPhone/iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-slate-800 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-bold text-sm text-slate-900">Install di iPhone / iPad</h3>
                <button onClick={() => setShowIOSGuide(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                1. Ketuk tombol <strong>Share</strong> (ikon kotak panah ke atas) di menu Safari bawah.<br />
                2. Gulir ke bawah dan pilih <strong>Add to Home Screen (Tambahkan ke Layar Utama)</strong>.<br />
                3. Ketuk <strong>Add</strong> di pojok kanan atas.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full mt-2 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
