import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  Layers, 
  Database, 
  HelpCircle, 
  ExternalLink,
  Users,
  LogOut,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import { MainTabType, UserScope } from '../../types';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { AuthUser } from '../../services/authService';

interface HeaderProps {
  activeTab: MainTabType;
  currentScope: UserScope;
  collapsed: boolean;
  onRefreshData: () => void;
  isRefreshing: boolean;
  onOpenSwitchBoard: () => void;
  onOpenGasCenter: () => void;
  onOpenScopeModal: () => void;
  onOpenHelpModal: () => void;
  switchAppUrl: string;
  currentUser: AuthUser | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  currentScope,
  collapsed,
  onRefreshData,
  isRefreshing,
  onOpenSwitchBoard,
  onOpenGasCenter,
  onOpenScopeModal,
  onOpenHelpModal,
  switchAppUrl,
  currentUser,
  onLogout
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.warn(err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.warn(err));
      }
    }
  };

  const getPageTitle = (tab: MainTabType) => {
    switch (tab) {
      case 'dashboard': return { title: 'Dashboard Ringkasan', sub: 'Ringkasan Ketenagakerjaan & Beban Upah Divisi Produksi I' };
      case 'presensi': return { title: 'Presensi & Ijin', sub: 'Pencatatan Pengecualian Kehadiran & Surat Permohonan Ijin' };
      case 'lembur': return { title: 'Lembur Pekerja', sub: 'Perhitungan Lembur Bertingkat & Checklist Multi-Pekerja' };
      case 'rekap': return { title: 'Rekap Presensi Tahunan', sub: 'Tren %Kehadiran Rata-rata & Ranking Kehadiran' };
      case 'slip': return { title: 'Slip Upah Pekerja', sub: 'Mode Bulanan & Mode Rentang Tanggal Bebas (Upah Mingguan)' };
      case 'database': return { title: 'Database Pekerja', sub: 'Data Induk 62 Pekerja, Status PKWT, Pendidikan & Mutasi' };
      case 'jadwalmutasi': return { title: 'Jadwal Mutasi Terjadwal', sub: 'Mutasi Masa Depan yang Diterapkan Otomatis' };
      case 'profil': return { title: 'Profil Pekerja', sub: 'Parameter Presensi Komparatif & Link Arsip Google Drive' };
      case 'calon': return { title: 'Calon Pekerja (Pelatihan)', sub: 'Pelatihan Seleksi, Evaluasi Lolos & Audit Riwayat' };
      case 'hakakses': return { title: 'Pengaturan Hak Akses', sub: 'Manajemen Akun Internal, Role-Based Access Control & Scope Unit' };
      default: return { title: 'HR Pekerja', sub: 'Divisi Produksi I' };
    }
  };

  const { title, sub } = getPageTitle(activeTab);

  const scopeLabel = currentScope === 'ALL' 
    ? '🔑 Seluruh Tim PP1' 
    : `👤 ${currentScope}`;

  const isWorkerRole = currentUser?.role === 'Pekerja Harian';

  return (
    <header 
      className={`fixed top-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 z-20 transition-all duration-300 flex items-center justify-between px-3 sm:px-4 lg:px-6 shadow-xs ${
        collapsed ? 'lg:left-[68px] left-0' : 'lg:left-64 left-0'
      }`}
    >
      {/* Title & Scope */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 truncate tracking-tight">
              {title}
            </h1>
            {!isWorkerRole && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 truncate">
                {scopeLabel}
              </span>
            )}
            {isWorkerRole && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Portal Pekerja Mandiri
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 truncate hidden md:block">
            {sub}
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
        
        {/* PWA In-App Install Prompt */}
        <PWAInstallButton />

        {/* User Profile Pill */}
        {currentUser && (
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]">
              {currentUser.nama.slice(0, 1).toUpperCase()}
            </div>
            <div className="leading-tight text-left max-w-[130px] truncate">
              <span className="font-bold text-slate-800 text-[11px] block truncate">
                {currentUser.nama}
              </span>
              <span className="text-[9px] text-blue-600 font-semibold block truncate">
                {currentUser.role}
              </span>
            </div>
          </div>
        )}

        {/* Scope Switcher Button (Internal Tim Only) */}
        {!isWorkerRole && (
          <button
            onClick={onOpenScopeModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
            title="Ganti Tim / Lingkup Akses Anda"
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Ganti Tim</span>
          </button>
        )}

        {/* Switch App to HR Karyawan (Internal Tim Only) */}
        {!isWorkerRole && (
          <a
            href={switchAppUrl || 'https://appspengolahan.github.io/HR-Karyawan-PP1/'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors border border-indigo-200"
            title="Buka Aplikasi HR Karyawan (Staff Bulanan)"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">HR Karyawan</span>
          </a>
        )}

        {/* Headless GAS Hub Button (Super Admin / HR only) */}
        {!isWorkerRole && (currentUser?.role === 'Super Admin' || currentUser?.role === 'HR Admin') && (
          <button
            onClick={onOpenGasCenter}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors border border-emerald-300"
            title="Headless GAS Center Hub"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden lg:inline">GAS Hub</span>
          </button>
        )}

        {/* Refresh Button */}
        <button
          onClick={onRefreshData}
          disabled={isRefreshing}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
          title="Segarkan &amp; Tarik Data Langsung dari Google Sheets"
        >
          <RefreshCw className={`w-4 h-4 text-slate-600 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
        </button>

        {/* Help & SOP Button */}
        <button
          onClick={onOpenHelpModal}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
          title="Bantuan &amp; Ketentuan Operasional"
        >
          <HelpCircle className="w-4 h-4 text-blue-600" />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200 hidden sm:flex"
          title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh (F11)'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* LOGOUT BUTTON */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 transition-colors border border-red-200 shadow-xs"
          title="Keluar / Kunci Sesi Akun"
        >
          <LogOut className="w-3.5 h-3.5 text-red-600" />
          <span className="hidden sm:inline">Keluar</span>
        </button>

      </div>
    </header>
  );
};
