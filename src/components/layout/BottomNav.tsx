import React from 'react';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Clock, 
  Users, 
  BadgePercent,
  Layers,
  User,
  ShieldCheck
} from 'lucide-react';
import { MainTabType } from '../../types';
import { AuthUser } from '../../services/authService';

interface BottomNavProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  onOpenSwitchBoard: () => void;
  currentUser: AuthUser | null;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenSwitchBoard,
  currentUser
}) => {
  const isWorker = currentUser?.role === 'Pekerja Harian';

  const workerTabs: { id: MainTabType; label: string; icon: React.ElementType }[] = [
    { id: 'slip', label: 'Slip Upah Saya', icon: BadgePercent },
    { id: 'profil', label: 'Profil Kontrak', icon: User }
  ];

  const internalTabs: { id: MainTabType; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'presensi', label: 'Presensi', icon: CalendarCheck },
    { id: 'lembur', label: 'Lembur', icon: Clock },
    { id: 'database', label: 'Pekerja', icon: Users },
    { id: 'slip', label: 'Slip Upah', icon: BadgePercent }
  ];

  const tabs = isWorker ? workerTabs : internalTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-30 flex items-center justify-around px-2 lg:hidden shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
            <span className="truncate max-w-[70px]">{tab.label}</span>
          </button>
        );
      })}

      {!isWorker && (
        <button
          onClick={onOpenSwitchBoard}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium text-slate-400 hover:text-amber-300"
          title="Master Portal PP1"
        >
          <Layers className="w-5 h-5 mb-0.5 text-amber-400" />
          <span className="truncate">Portal PP1</span>
        </button>
      )}
    </nav>
  );
};
