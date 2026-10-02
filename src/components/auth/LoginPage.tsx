import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Key, 
  ArrowRight, 
  AlertCircle, 
  Building2, 
  FileText, 
  CheckCircle2,
  Users
} from 'lucide-react';
import { AuthUser, authService, WHITELIST_INTERNAL } from '../../services/authService';
import { PekerjaData } from '../../types';

interface LoginPageProps {
  pekerjaList: PekerjaData[];
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  pekerjaList,
  onLoginSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'internal' | 'pekerja'>('internal');

  // Internal Form State
  const [internalEmail, setInternalEmail] = useState('');
  const [internalPassword, setInternalPassword] = useState('');
  const [internalError, setInternalError] = useState('');

  // Pekerja Form State
  const [pekerjaNama, setPekerjaNama] = useState('');
  const [pekerjaId, setPekerjaId] = useState('');
  const [pekerjaError, setPekerjaError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleInternalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInternalError('');
    setIsLoading(true);

    try {
      const res = authService.loginInternal(internalEmail, internalPassword);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setInternalError(res.message || 'Login gagal.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePekerjaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPekerjaError('');
    setIsLoading(true);

    try {
      const res = authService.loginPekerjaHarian(pekerjaNama, pekerjaId, pekerjaList);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setPekerjaError(res.message || 'Verifikasi data pekerja gagal.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/10 mb-2">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
              PT BATU KARANG • DIVISI PRODUKSI I (PP1)
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Sistem HR Pekerja
            </h1>
            <p className="text-xs text-slate-400">
              Gerbang Keamanan &amp; Kontrol Hak Akses Terpadu
            </p>
          </div>
        </div>

        {/* Card Box */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-7 space-y-6">
          
          {/* Two Gates Tab Switcher */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('internal');
                setInternalError('');
                setPekerjaError('');
              }}
              className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'internal'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Tim Internal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('pekerja');
                setInternalError('');
                setPekerjaError('');
              }}
              className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'pekerja'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Pekerja Harian</span>
            </button>
          </div>

          {/* TAB 1: TIM INTERNAL */}
          {activeTab === 'internal' && (
            <form onSubmit={handleInternalSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-300">Staff, HR &amp; Mandor Operasional</span>
                <p className="text-[11px] text-slate-400">Masuk menggunakan email terdaftar di whitelist resmi perusahaan.</p>
              </div>

              {internalError && (
                <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{internalError}</span>
                </div>
              )}

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Terdaftar</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="nama@batukarang.com"
                      value={internalEmail}
                      onChange={(e) => setInternalEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Kata Sandi / PIN Akun</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={internalPassword}
                      onChange={(e) => setInternalPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Whitelist Presets for Demo / Testing */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Pintasan Akun Whitelist Siap Pakai:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setInternalEmail('appspengolahan@gmail.com');
                      setInternalPassword('admin');
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-slate-700"
                  >
                    Super Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInternalEmail('hr@batukarang.com');
                      setInternalPassword('hr123');
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-slate-700"
                  >
                    Admin HR
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInternalEmail('mandor.cengkeh@batukarang.com');
                      setInternalPassword('mandor');
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-slate-700"
                  >
                    Mandor Cengkeh
                  </button>
                </div>
              </div>

            </form>
          )}

          {/* TAB 2: PEKERJA HARIAN (PORTAL MANDIRI) */}
          {activeTab === 'pekerja' && (
            <form onSubmit={handlePekerjaSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-300">Portal Mandiri Pekerja Harian</span>
                <p className="text-[11px] text-slate-400">Verifikasi langsung ke database untuk cek slip upah dan status kontrak Anda.</p>
              </div>

              {pekerjaError && (
                <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{pekerjaError}</span>
                </div>
              )}

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Nama Lengkap Pekerja</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: MUHAMMAD MIFTAKHUL HAMDAN"
                      value={pekerjaNama}
                      onChange={(e) => setPekerjaNama(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Nomor ID Pekerja (Opsional/Pengaman)</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Contoh: 62"
                      value={pekerjaId}
                      onChange={(e) => setPekerjaId(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* Strict Isolation Notice */}
              <div className="p-3 bg-blue-950/40 border border-blue-900/60 rounded-xl text-[11px] text-blue-300 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-blue-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  Isolasi Keamanan Ketat:
                </span>
                <p className="text-slate-400">
                  Pekerja harian hanya dapat melihat <strong>Slip Upah Saya</strong> dan <strong>Profil Kontrak Pribadi</strong>. Akses ke database, mutasi, atau konfigurasi sistem terkunci total.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isLoading ? 'Memverifikasi...' : 'Verifikasi & Masuk Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Sample Workers Helper */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Contoh Pekerja Terdaftar:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPekerjaNama('MUHAMMAD MIFTAKHUL HAMDAN');
                      setPekerjaId('62');
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-slate-700"
                  >
                    M. Miftakhul Hamdan (#62)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPekerjaNama('DEDIK IRAWAN');
                      setPekerjaId('37');
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-slate-700"
                  >
                    Dedik Irawan (#37)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPekerjaNama('UDIN HARIADI');
                      setPekerjaId('38');
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-slate-700"
                  >
                    Udin Hariadi (#38)
                  </button>
                </div>
              </div>

            </form>
          )}

        </div>

        {/* Security Footer */}
        <div className="text-center text-[11px] text-slate-500 space-y-1">
          <p>Sesi login disimpan secara aman per-perangkat.</p>
          <p className="font-mono text-slate-600">&copy; 2026 PT Batu Karang • All Rights Reserved</p>
        </div>

      </div>

    </div>
  );
};
