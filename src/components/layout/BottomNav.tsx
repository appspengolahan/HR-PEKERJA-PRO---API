import React from 'react';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Clock, 
  Users, 
  BadgePercent,
  Layers
} from 'lucide-react';
import { MainTabType } from '../../types';

interface BottomNavProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  onOpenSwitchBoard: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenSwitchBoard
}) => {
  const tabs: { id: MainTabType; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'presensi', label: 'Presensi', icon: CalendarCheck },
    { id: 'lembur', label: 'Lembur', icon: Clock },
    { id: 'database', label: 'Pekerja', icon: Users },
    { id: 'slip', label: 'Slip Upah', icon: BadgePercent }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 z-30 flex items-center justify-around px-2 lg:hidden shadow-lg">
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
            <span className="truncate">{tab.label}</span>
          </button>
        );
      })}

      <button
        onClick={onOpenSwitchBoard}
        className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium text-slate-400 hover:text-amber-300"
        title="Portal PP1"
      >
        <Layers className="w-5 h-5 mb-0.5 text-amber-400" />
        <span>Portal PP1</span>
      </button>
    </nav>
  );
};
