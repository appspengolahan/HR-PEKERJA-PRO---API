import React from 'react';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Clock, 
  BarChart3, 
  BadgePercent, 
  Users, 
  ArrowRightLeft, 
  User, 
  UserCheck, 
  ChevronLeft, 
  ChevronRight, 
  Factory,
  Database,
  Printer,
  LogOut,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { MainTabType } from '../../types';
import { AuthUser } from '../../services/authService';

export type ActiveTab = MainTabType;

interface SidebarProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onOpenGasCenter: () => void;
  onOpenSwitchBoard: () => void;
  currentUser: AuthUser | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  onOpenGasCenter,
  onOpenSwitchBoard,
  currentUser,
  onLogout
}) => {
  const isWorkerRole = currentUser?.role === 'Pekerja Harian';

  const allMenuItems: { id: MainTabType; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'presensi', label: 'Presensi & Ijin', icon: CalendarCheck, badge: 'Harian' },
    { id: 'lembur', label: 'Lembur', icon: Clock, badge: 'Tier' },
    { id: 'rekap', label: 'Rekap Presensi', icon: BarChart3 },
    { id: 'slip', label: isWorkerRole ? 'Slip Upah Saya' : 'Slip Upah', icon: BadgePercent, badge: 'Mingguan' },
    { id: 'database', label: 'Database Pekerja', icon: Users, badge: '62' },
    { id: 'jadwalmutasi', label: 'Jadwal Mutasi', icon: ArrowRightLeft },
    { id: 'profil', label: isWorkerRole ? 'Profil Kontrak Saya' : 'Profil Pekerja', icon: User },
    { id: 'calon', label: 'Calon Pekerja', icon: UserCheck, badge: 'Pelatihan' }
  ];

  // Filter menu berdasarkan hak akses akun yang sedang login
  const allowedMenuItems = allMenuItems.filter(item => {
    if (!currentUser || !currentUser.allowedTabs) return false;
    return currentUser.allowedTabs.includes(item.id);
  });

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen z-30 hidden lg:flex flex-col bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 select-none ${
        collapsed ? 'w-[68px]' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-slate-800/80 bg-slate-950/40">
        <div 
          onClick={!isWorkerRole ? onOpenSwitchBoard : undefined}
          className={`flex items-center gap-3 overflow-hidden ${!isWorkerRole ? 'cursor-pointer group' : ''}`}
          title={!isWorkerRole ? 'Buka Master Switch Board PP1' : 'HR Pekerja Divisi PP1'}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md shadow-blue-900/30 group-hover:scale-105 transition-transform flex-shrink-0">
            <Factory className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="leading-tight truncate">
              <span className="font-extrabold text-sm tracking-wide text-white flex items-center gap-1.5">
                HR PEKERJA
              </span>
              <span className="text-[11px] font-semibold text-blue-400 block tracking-wider">
                DIVISI PRODUKSI I
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors flex-shrink-0"
          title={collapsed ? 'Perluas Menu (256px)' : 'Ciutkan Menu (Rail 68px)'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User Info Badge in Sidebar */}
      {!collapsed && currentUser && (
        <div className="px-3 pt-3 pb-1">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/90 text-xs flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              {currentUser.nama.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-bold text-slate-200 block truncate text-[11px]">
                {currentUser.nama}
              </span>
              <span className="text-[10px] text-blue-400 font-semibold block truncate">
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        {!collapsed && (
          <div className="px-3 text-[10px] font-bold text-slate-400 tracking-wider mb-2 uppercase">
            {isWorkerRole ? 'Akses Mandiri Anda' : `${allowedMenuItems.length} Modul Akses`}
          </div>
        )}

        {allowedMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                isActive 
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/30' 
                  : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 transition-transform ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
              
              {!collapsed && (
                <span className="truncate flex-1 text-left">
                  {item.label}
                </span>
              )}

              {!collapsed && item.badge && !isWorkerRole && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                  isActive 
                    ? 'bg-blue-700 text-blue-100 border border-blue-400/30' 
                    : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                }`}>
                  {item.badge}
                </span>
              )}

              {collapsed && isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-400 rounded-r-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Tools */}
      <div className="p-2 border-t border-slate-800/80 bg-slate-950/60 space-y-1.5">
        
        {/* Headless GAS Hub (Super Admin & HR only) */}
        {!isWorkerRole && (currentUser?.role === 'Super Admin' || currentUser?.role === 'HR Admin') && (
          <button
            onClick={onOpenGasCenter}
            className={`w-full flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl text-xs font-medium bg-emerald-950/40 border border-emerald-700/40 text-emerald-400 hover:bg-emerald-900/40 transition-colors ${
              collapsed ? 'px-0' : ''
            }`}
            title="Headless GAS Center & Sheets Sync"
          >
            <Database className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            {!collapsed && <span className="truncate font-semibold">Headless GAS Hub</span>}
          </button>
        )}

        {/* LOGOUT BUTTON IN SIDEBAR */}
        <button
          onClick={onLogout}
          className={`w-full flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl text-xs font-semibold bg-red-950/40 border border-red-800/40 text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-colors ${
            collapsed ? 'px-0' : ''
          }`}
          title="Keluar / Kunci Sesi Akun"
        >
          <LogOut className="w-4 h-4 text-red-400 flex-shrink-0" />
          {!collapsed && <span className="truncate">Keluar Akun</span>}
        </button>

        {!collapsed && (
          <div className="px-2 pt-1 pb-1 flex items-center justify-between text-[10px] text-slate-400">
            <span>PP1 Keamanan v2.0</span>
            <span className="flex items-center gap-1 text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Terenkripsi
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
