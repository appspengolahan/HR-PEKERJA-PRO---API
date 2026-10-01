import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  Volume2, 
  CheckCircle2, 
  User, 
  Factory,
  Sparkles
} from 'lucide-react';
import { PekerjaPHL } from '../../types';

interface QrBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: PekerjaPHL | null;
  onSimulateTapSuccess?: (worker: PekerjaPHL) => void;
}

export const QrBadgeModal: React.FC<QrBadgeModalProps> = ({
  isOpen,
  onClose,
  worker,
  onSimulateTapSuccess
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [tapStatus, setTapStatus] = useState<'idle' | 'scanning' | 'granted'>('idle');

  useEffect(() => {
    if (worker) {
      const payload = JSON.stringify({
        org: 'PT Batu Karang',
        div: 'Divisi Produksi 1 (PP1)',
        type: 'PHL',
        nip: worker.nip,
        nama: worker.nama,
        lini: worker.posLini,
        securityToken: `BK-${worker.id}-VERIFIED-2026`
      });

      QRCode.toDataURL(payload, {
        width: 240,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error(err));
    }
  }, [worker]);

  if (!isOpen || !worker) return null;

  // Synthesize security beep sound using Web Audio API
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6 note
      gain.gain.setValueAtTime(0.3, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio fallback
    }
  };

  const handleSimulateSatpamTap = () => {
    setTapStatus('scanning');
    setTimeout(() => {
      playBeep();
      setTapStatus('granted');
      if (onSimulateTapSuccess) {
        onSimulateTapSuccess(worker);
      }
      setTimeout(() => setTapStatus('idle'), 3000);
    }, 450);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              ID Badge Digital &amp; Pos Satpam Scanner
            </span>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Badge Card Container (Printable) */}
        <div className="p-6 bg-slate-100 flex flex-col items-center justify-center overflow-y-auto">
          
          <div className="w-72 bg-white rounded-2xl shadow-xl border-2 border-slate-800 overflow-hidden relative">
            
            {/* Top Factory Header */}
            <div className="bg-slate-900 p-4 text-white text-center border-b-2 border-amber-500">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <Factory className="w-4 h-4 text-amber-400" />
                <span className="font-extrabold text-xs tracking-wider">PT BATU KARANG</span>
              </div>
              <div className="text-[10px] font-bold tracking-widest text-blue-300 uppercase">
                DIVISI PRODUKSI 1 (PP1)
              </div>
              <div className="mt-1 inline-block px-2 py-0.5 bg-blue-600 text-white rounded text-[9px] font-bold tracking-wider">
                PEKERJA HARIAN LEPAS (PHL)
              </div>
            </div>

            {/* Badge Body */}
            <div className="p-5 flex flex-col items-center text-center">
              
              {/* Photo Avatar */}
              <div className="w-20 h-20 rounded-xl bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
                <User className="w-10 h-10 text-slate-500" />
              </div>

              {/* Worker Name & NIP */}
              <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                {worker.nama}
              </h3>
              <div className="font-mono text-xs font-bold text-blue-600 mt-0.5">
                {worker.nip}
              </div>

              {/* Pos Penugasan Lini */}
              <div className="mt-2 text-[11px] font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {worker.posLini}
              </div>

              {/* QR Code Container */}
              <div className="mt-4 p-2 bg-white rounded-xl border border-slate-300 shadow-xs">
                {qrDataUrl ? (
                  <img 
                    src={qrDataUrl} 
                    alt={`QR Code ${worker.nip}`} 
                    className="w-36 h-36"
                  />
                ) : (
                  <div className="w-36 h-36 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                    Membuat QR...
                  </div>
                )}
              </div>

              <div className="mt-2 text-[9px] font-mono text-slate-400">
                TAP POS SATPAM PP1 • VALID 2026
              </div>

            </div>

            {/* Bottom Footer Band */}
            <div className="bg-slate-950 p-2 text-center text-[9px] text-slate-400 font-mono border-t border-slate-800">
              KTP: {worker.ktp.slice(0, 8)}******** • K3 TERVERIFIKASI
            </div>

          </div>

          {/* Satpam Tap Scanner Feedback */}
          {tapStatus === 'granted' && (
            <div className="mt-4 w-full p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs text-center font-bold flex items-center justify-center gap-2 animate-in zoom-in-95 duration-150">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-bounce" />
              <span>BIP! AKSES DITERIMA: {worker.nama} — GERBANG PP1 TERBUKA</span>
            </div>
          )}

        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          
          <button
            onClick={handleSimulateSatpamTap}
            disabled={tapStatus !== 'idle'}
            className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            title="Simulasikan pemindaian scanner barcode di pos satpam"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            {tapStatus === 'scanning' ? 'Memindai...' : 'Uji Tap Pos Satpam'}
          </button>

          <button
            onClick={handlePrint}
            className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Cetak ID Card
          </button>

        </div>

      </div>
    </div>
  );
};
