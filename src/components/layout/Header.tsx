import React, { useState, useEffect, useRef } from 'react';
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
  ShieldCheck,
  ChevronDown,
  Globe,
  Menu,
  Repeat
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
  onOpenPublicShareModal: () => void;
  onOpenRoleSwitcher?: () => void;
  onOpenMobileMenu?: () => void;
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
  onOpenPublicShareModal,
  onOpenRoleSwitcher,
  onOpenMobileMenu,
  switchAppUrl,
  currentUser,
  onLogout
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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
      className={`fixed top-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 z-20 transition-all duration-300 flex items-center justify-between px-3 sm:px-4 lg:px-6 shadow-xs max-w-full overflow-hidden ${
        collapsed ? 'lg:left-[68px] left-0' : 'lg:left-64 left-0'
      }`}
    >
      {/* Title & Scope */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile / Tablet Menu Button */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 -ml-1 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors flex-shrink-0 cursor-pointer"
          title="Buka Menu Navigasi"
          aria-label="Buka Menu Navigasi"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate tracking-tight">
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
                <span className="hidden xs:inline">Portal </span>Mandiri
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 truncate hidden md:block">
            {sub}
          </p>
        </div>
      </div>

      {/* Action Controls - Clean & Minimalist Navbar */}
      <div className="flex items-center gap-2 flex-shrink-0">
        
        {/* Portal Publik (Linktree) Button */}
        <button
          onClick={onOpenPublicShareModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-700 bg-white hover:bg-indigo-50 border border-slate-200 shadow-xs transition-all cursor-pointer"
          title="Tautan Portal Publik untuk Linktree"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-600" />
          <span>Portal Publik</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800">
            Linktree
          </span>
        </button>

        {/* Quick Sync / Refresh Button */}
        <button
          onClick={onRefreshData}
          disabled={isRefreshing}
          className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-all border border-slate-200 shadow-xs relative"
          title="Segarkan &amp; Tarik Data Langsung dari Google Sheets"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          {isRefreshing && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          )}
        </button>

        {/* Quick Role Switcher Pill in Header */}
        {onOpenRoleSwitcher && (
          <button
            onClick={onOpenRoleSwitcher}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 border border-amber-300 shadow-xs transition-all text-xs font-bold cursor-pointer active:scale-95"
            title="Ganti peran jabatan cepat (Lead Dev, PM, Engineer, Manajer, Mandor, Pekerja)"
          >
            <Repeat className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">Ganti Peran</span>
          </button>
        )}

        {/* Dynamic User Profile & Ecosystem Hub Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border transition-all text-xs shadow-xs select-none active:scale-98 cursor-pointer ${
              isDropdownOpen 
                ? 'bg-blue-50 border-blue-300 text-blue-900 ring-2 ring-blue-500/20' 
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            {/* Avatar Pill */}
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {currentUser?.nama ? currentUser.nama.slice(0, 1).toUpperCase() : 'U'}
            </div>

            {/* User Title (Desktop) */}
            <div className="hidden sm:block text-left leading-tight max-w-[130px] truncate">
              <span className="font-bold text-slate-900 text-xs block truncate">
                {currentUser?.nama || 'Pengguna'}
              </span>
              <span className="text-[10px] text-blue-600 font-semibold block truncate">
                {currentUser?.role || 'Guest'}
              </span>
            </div>

            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
          </button>

          {/* Unified Dynamic Dropdown Menu Popover */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-50 p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150">
              
              {/* User Identity Card */}
              <div className="p-3 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-xl space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold">
                    Akun Aktif PP1
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    {currentUser?.role}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white truncate">
                  {currentUser?.nama}
                </h4>
                {currentUser?.email && (
                  <p className="text-[11px] text-slate-400 truncate font-mono">
                    {currentUser.email}
                  </p>
                )}
                <div className="pt-1 border-t border-slate-800 text-[10px] text-emerald-400 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Lingkup: {scopeLabel}</span>
                </div>
              </div>

              {/* Group 1: Ekosistem & Navigasi Operasional */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block">
                  Navigasi &amp; Ekosistem
                </span>
                
                {/* Ganti Peran Cepat (Semua Peran) */}
                {onOpenRoleSwitcher && (
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenRoleSwitcher();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50/80 hover:bg-amber-100 border border-amber-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-200 text-amber-800 flex items-center justify-center">
                        <Repeat className="w-4 h-4" />
                      </div>
                      <span>Ganti Peran Jabatan (Cepat)</span>
                    </div>
                    <span className="text-[10px] text-amber-800 font-bold bg-amber-200/90 px-1.5 py-0.5 rounded">
                      Switch
                    </span>
                  </button>
                )}

                {/* Ganti Tim (Internal Only) */}
                {!isWorkerRole && (
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenScopeModal();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <span>Ganti Tim / Lingkup Kerja</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Scope</span>
                  </button>
                )}

                {/* Switch App to HR Karyawan */}
                {!isWorkerRole && (
                  <a
                    href={switchAppUrl || 'https://appspengolahan.github.io/HR-Karyawan-PP1/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                      <span>Portal HR Karyawan (Staff)</span>
                    </div>
                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                      Eksternal ↗
                    </span>
                  </a>
                )}

                {/* Portal Publik Linktree Modal */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onOpenPublicShareModal();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Globe className="w-4 h-4" />
                    </div>
                    <span>Tautan Publik (Linktree)</span>
                  </div>
                  <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                    Buka
                  </span>
                </button>

                {/* SwitchBoard Modal */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onOpenSwitchBoard();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <span>Master SwitchBoard PP1</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">8 Apps</span>
                </button>

                {/* Headless GAS Hub (Super Admin / HR only) */}
                {!isWorkerRole && (currentUser?.role === 'Super Admin' || currentUser?.role === 'HR Admin') && (
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenGasCenter();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Database className="w-4 h-4" />
                      </div>
                      <span>Headless GAS Center Hub</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Sync API
                    </span>
                  </button>
                )}
              </div>

              {/* Group 2: Utilitas Sistem & Layar */}
              <div className="space-y-1 pt-1.5 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block">
                  Utilitas &amp; Bantuan
                </span>

                {/* PWA Install Prompt Item */}
                <div className="px-1 py-0.5">
                  <PWAInstallButton />
                </div>

                {/* Bantuan & SOP */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onOpenHelpModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Panduan &amp; SOP Operasional</span>
                </button>

                {/* Fullscreen Toggle */}
                <button
                  onClick={toggleFullscreen}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </div>
                    <span>{isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh (F11)'}</span>
                  </div>
                </button>
              </div>

              {/* Group 3: Sesi & Keluar */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors shadow-xs active:scale-98 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-red-600" />
                    <span>Keluar / Kunci Sesi Akun</span>
                  </div>
                  <span className="text-[10px] text-red-500 font-mono">Logout</span>
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  );
};
