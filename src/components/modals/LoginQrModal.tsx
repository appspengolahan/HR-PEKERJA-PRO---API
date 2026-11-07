import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Download, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode, 
  ShieldCheck, 
  Sparkles,
  Smartphone,
  Info
} from 'lucide-react';

interface LoginQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginQrModal: React.FC<LoginQrModalProps> = ({
  isOpen,
  onClose
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Target Login URL: Selalu mengarah ke gerbang login resmi (?view=login)
  const loginUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?view=login`
    : 'https://ais-dev-cixlvscmjeshqnwxa26ztf-204124247767.asia-southeast1.run.app?view=login';

  // Generate QR Code Beresolusi Tinggi (Level H: 30% Error Correction, 1024x1024 px)
  useEffect(() => {
    if (isOpen) {
      setIsGenerating(true);
      QRCode.toDataURL(loginUrl, {
        width: 1024,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#0f172a', // Slate 900
          light: '#ffffff'
        }
      })
      .then((url) => {
        setQrDataUrl(url);
        setIsGenerating(false);
      })
      .catch((err) => {
        console.error('Failed to generate Login QR code:', err);
        setIsGenerating(false);
      });
    }
  }, [isOpen, loginUrl]);

  if (!isOpen) return null;

  // Handle Download File PNG Resolusi Tinggi
  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_Login_HR_Produksi_1_PT_Batu_Karang.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Handle Copy Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(loginUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      
      {/* Modal Container */}
      <div 
        className={`relative m-auto bg-white rounded-3xl shadow-2xl border border-slate-200 text-slate-800 transition-all duration-300 flex flex-col overflow-hidden ${
          isExpanded 
            ? 'w-full max-w-2xl max-h-[95vh]' 
            : 'w-full max-w-md max-h-[90vh]'
        }`}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between flex-shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shadow-inner">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  QR Code Akses Login Staf
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  HD Level H
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                PT Batu Karang &bull; Sistem Presensi &amp; HR Produksi I
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Toggle Expand / Fullscreen */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isExpanded ? 'Kecilkan Tampilan' : 'Perbesar Tampilan (Layar Penuh)'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 transition-colors cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body (Scrollable if needed) */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 flex flex-col items-center text-center">
          
          {/* Card Frame QR Code */}
          <div className={`p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-200/90 shadow-inner flex flex-col items-center justify-center transition-all ${
            isExpanded ? 'max-w-md w-full' : 'w-full max-w-[280px] sm:max-w-[320px]'
          }`}>
            <div className="bg-white p-3.5 rounded-2xl shadow-md border border-slate-200 w-full aspect-square flex items-center justify-center">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-2 text-slate-400 text-xs py-8">
                  <span className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span>Membuat QR Presisi Tinggi...</span>
                </div>
              ) : qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt="QR Code Login HR Pekerja"
                  className="w-full h-full object-contain rounded-lg select-none"
                />
              ) : (
                <div className="text-rose-500 text-xs">Gagal membuat QR Code</div>
              )}
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span>Arahkan kamera HP ke QR Code di atas</span>
            </div>
          </div>

          {/* Quick Action Buttons (Download HD, Expand, Copy Link) */}
          <div className="w-full flex flex-wrap items-center justify-center gap-2">
            
            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating || !qrDataUrl}
              className="flex-1 min-w-[130px] px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50"
              title="Unduh gambar QR Code resolusi tinggi untuk dicetak"
            >
              <Download className="w-4 h-4" />
              <span>Unduh PNG HD</span>
            </button>

            {/* Expand / Minimize Toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-all cursor-pointer"
              title={isExpanded ? 'Perkecil tampilan' : 'Perbesar agar mudah discan dari jarak jauh'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5 text-slate-600" /> : <Maximize2 className="w-3.5 h-3.5 text-slate-600" />}
              <span>{isExpanded ? 'Kecilkan' : 'Perbesar'}</span>
            </button>

            {/* Copy Link Button */}
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
              }`}
              title="Salin tautan login ke clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              <span>{copied ? 'Tersalin!' : 'Salin URL'}</span>
            </button>

            {/* Test Link Button */}
            <a
              href={loginUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              title="Uji buka halaman login di tab baru"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* URL Input Box */}
          <div className="w-full text-left space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Tautan Target Login:
            </label>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-700 truncate select-all">
              {loginUrl}
            </div>
          </div>

          {/* User Guide Card */}
          <div className="w-full p-3 bg-blue-50/70 border border-blue-200/70 rounded-2xl text-left text-xs text-blue-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-blue-800 text-[11px]">
              <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span>Petunjuk Penggunaan Lapangan:</span>
            </div>
            <ol className="text-[11px] text-slate-600 space-y-1 list-decimal list-inside leading-relaxed pl-1">
              <li>Tunjukkan layar modal ini ke staf atau tempel hasil cetak QR di pos mandor.</li>
              <li>Staf cukup membuka kamera ponsel Android / iPhone dan mengarahkan ke QR.</li>
              <li>Ketuk notifikasi tautan browser yang muncul untuk langsung membuka form Login.</li>
            </ol>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs flex-shrink-0">
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Koneksi Aman Terenkripsi HTTPS</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>

    </div>
  );
};
