import React from 'react';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Clock, 
  Users, 
  BadgePercent,
  User,
  Menu,
  BarChart3
} from 'lucide-react';
import { MainTabType } from '../../types';
import { AuthUser } from '../../services/authService';

interface BottomNavProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  onOpenSwitchBoard?: () => void;
  onOpenMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  currentUser: AuthUser | null;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
  isMobileMenuOpen = false,
  currentUser
}) => {
  const isWorker = currentUser?.role === 'Pekerja Harian';

  const workerTabs: { id: MainTabType; label: string; icon: React.ElementType }[] = [
    { id: 'slip', label: 'Slip Upah', icon: BadgePercent },
    { id: 'profil', label: 'Profil Saya', icon: User }
  ];

  const internalTabs: { id: MainTabType; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'presensi', label: 'Presensi', icon: CalendarCheck },
    { id: 'lembur', label: 'Lembur', icon: Clock },
    { id: 'rekap', label: 'Rekap', icon: BarChart3 },
    { id: 'database', label: 'Pekerja', icon: Users }
  ];

  const candidateTabs = isWorker ? workerTabs : internalTabs;
  // Filter ketat: Hanya tampilkan tab yang benar-benar ada di allowedTabs akun aktif
  const tabs = candidateTabs.filter(tab => {
    if (!currentUser || !Array.isArray(currentUser.allowedTabs)) return false;
    return currentUser.allowedTabs.includes(tab.id);
  });

  const isCurrentTabInExtendedMenu = !tabs.some(t => t.id === activeTab);

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 h-[calc(4rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] bg-slate-900/98 backdrop-blur-lg border-t border-slate-800 z-50 flex items-center justify-around px-1 lg:hidden shadow-[0_-4px_25px_rgba(0,0,0,0.35)] select-none"
      aria-label="Navigasi Bawah Seluler"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transform: 'translate3d(0, 0, 0)',
        WebkitTransform: 'translate3d(0, 0, 0)',
        willChange: 'transform'
      }}
    >
      <div className="w-full max-w-md md:max-w-lg mx-auto flex items-center justify-around h-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-semibold transition-all cursor-pointer relative ${
                isActive 
                  ? 'text-blue-400 font-bold scale-105' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-blue-600/20' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400 stroke-[2.5]' : 'text-slate-400 stroke-[1.8]'}`} />
              </div>
              <span className="truncate max-w-[68px] mt-0.5 leading-tight">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-400" />
              )}
            </button>
          );
        })}

        {/* Menu / Lainnya Drawer Trigger */}
        <button
          onClick={onOpenMobileMenu}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-semibold transition-all cursor-pointer relative ${
            isMobileMenuOpen || isCurrentTabInExtendedMenu 
              ? 'text-blue-400 font-bold scale-105' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Buka Menu Lengkap &amp; Pengaturan"
        >
          <div className={`p-1 rounded-xl transition-colors relative ${isMobileMenuOpen || isCurrentTabInExtendedMenu ? 'bg-blue-600/20' : ''}`}>
            <Menu className={`w-5 h-5 ${isMobileMenuOpen || isCurrentTabInExtendedMenu ? 'text-blue-400 stroke-[2.5]' : 'text-slate-400 stroke-[1.8]'}`} />
            {isCurrentTabInExtendedMenu && !isMobileMenuOpen && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900 animate-pulse" />
            )}
          </div>
          <span className="truncate max-w-[68px] mt-0.5 leading-tight">
            {isCurrentTabInExtendedMenu ? 'Lainnya' : 'Menu'}
          </span>
          {(isMobileMenuOpen || isCurrentTabInExtendedMenu) && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-400" />
          )}
        </button>
      </div>
    </nav>
  );
};
