import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share2, MoreVertical } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [guideTab, setGuideTab] = useState<'android' | 'ios'>(isIOS ? 'ios' : 'android');

  // If already running as an installed standalone PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const handleButtonClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
        title="Pasang / Install Aplikasi ini di Handphone (Android & iPhone)"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Pasang di HP</span>
      </button>

      {/* Modal Panduan Install di Handphone */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl text-slate-800 space-y-4 text-xs border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  Pasang di Handphone
                </h3>
                <p className="text-[11px] text-slate-500">Jadikan aplikasi native di layar utama HP Anda</p>
              </div>
              <button 
                onClick={() => setShowGuide(false)} 
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Platform Selector */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl font-bold">
              <button
                type="button"
                onClick={() => setGuideTab('android')}
                className={`py-1.5 rounded-lg transition-all ${
                  guideTab === 'android' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Android / Chrome
              </button>
              <button
                type="button"
                onClick={() => setGuideTab('ios')}
                className={`py-1.5 rounded-lg transition-all ${
                  guideTab === 'ios' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                iPhone / Safari
              </button>
            </div>

            {/* Android Instructions */}
            {guideTab === 'android' && (
              <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
                  <span>Buka web ini di Google Chrome pada HP Anda.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
                  <span>Ketuk ikon <strong>Titik Tiga (&vellip;)</strong> di pojok kanan atas browser.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
                  <span>Pilih menu <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Instal Aplikasi"</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">4</span>
                  <span>Aplikasi <strong>HR Pekerja</strong> akan muncul seperti aplikasi native di menu HP Anda!</span>
                </div>
              </div>
            )}

            {/* iOS Instructions */}
            {guideTab === 'ios' && (
              <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
                  <span>Buka web ini menggunakan browser <strong>Safari</strong> di iPhone/iPad.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
                  <span>Ketuk tombol <strong>Share / Bagikan</strong> (ikon kotak dengan panah ke atas) di bar bawah Safari.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
                  <span>Gulir ke bawah dan ketuk <strong>"Add to Home Screen (Tambah ke Layar Utama)"</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">4</span>
                  <span>Ketuk <strong>Add (Tambah)</strong> di pojok kanan atas. Selesai!</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
