import React, { useState, useMemo } from 'react';
import { 
  X, 
  Repeat, 
  RotateCcw, 
  Check, 
  Search, 
  ShieldCheck, 
  Users, 
  Building2, 
  UserCheck, 
  User, 
  Sparkles,
  Layers,
  ChevronRight,
  BadgePercent,
  CheckCircle2
} from 'lucide-react';
import { AuthUser, UserAccessRole, authService } from '../../services/authService';
import { PekerjaData } from '../../types';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  pekerjaList: PekerjaData[];
  onSwitchUser: (newUser: AuthUser) => void;
}

type RoleCategory = 'all' | 'management' | 'kepala' | 'mandor' | 'pekerja' | 'custom';

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  pekerjaList,
  onSwitchUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<RoleCategory>('all');
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | string>('');

  if (!isOpen) return null;

  // Retrieve original supervisor / developer user if in simulation
  const originalUser = currentUser?.originalUser || (
    currentUser?.email === 'appspengolahan@gmail.com' ? currentUser : {
      id: 'appspengolahan@gmail.com',
      nama: 'Lalu Mahendra (Lead Developer)',
      email: 'appspengolahan@gmail.com',
      role: 'Super Admin' as UserAccessRole,
      scope: 'ALL',
      allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon', 'hakakses']
    }
  );

  const handleSelectRole = (
    role: UserAccessRole,
    nama: string,
    scope: string,
    units?: string[],
    fallbackTabs?: any[]
  ) => {
    const roleMatrix = authService.getRoleMatrix();
    const allowedTabs = roleMatrix[role] || fallbackTabs || ['dashboard'];

    const newUser: AuthUser = {
      id: `sim_${role.toLowerCase().replace(/\s+/g, '_')}`,
      nama: `${nama} (Simulasi)`,
      email: `${role.toLowerCase().replace(/\s+/g, '')}@simulasi.local`,
      role,
      scope,
      units,
      allowedTabs,
      isSimulated: true,
      originalUser
    };

    authService.updateCurrentUserSession(newUser);
    onSwitchUser(newUser);
    onClose();
  };

  const handleSelectWorker = (worker: PekerjaData) => {
    const newUser: AuthUser = {
      id: `worker_${worker.id}`,
      nama: `${worker.nama} (Simulasi)`,
      role: 'Pekerja Harian',
      scope: worker.unitSekup || worker.unit,
      allowedTabs: ['slip', 'profil'],
      workerRecord: worker,
      isSimulated: true,
      originalUser
    };

    authService.updateCurrentUserSession(newUser);
    onSwitchUser(newUser);
    onClose();
  };

  const handleRestoreDeveloper = () => {
    if (originalUser) {
      const restoredUser: AuthUser = {
        ...originalUser,
        isSimulated: false,
        originalUser: undefined
      };
      authService.updateCurrentUserSession(restoredUser);
      onSwitchUser(restoredUser);
      onClose();
    }
  };

  // Structured roles list
  const managementRoles = [
    {
      role: 'Super Admin',
      title: '👑 Super Admin / Lead Dev',
      nama: 'Lead Developer',
      subtitle: 'Akses Penuh Seluruh Sistem & Konfigurasi',
      scope: 'ALL',
      units: ['Cengkeh', 'Blend', 'Tembakau', 'Krosok'],
      badgeColor: 'border-purple-300 bg-purple-50 text-purple-900',
      iconColor: 'bg-purple-600 text-white'
    },
    {
      role: 'Project Manager',
      title: '🏗️ Project Manager',
      nama: 'Project Manager',
      subtitle: 'Monitoring Lapangan, Progres & Kehadiran',
      scope: 'ALL',
      units: ['Cengkeh', 'Blend', 'Tembakau', 'Krosok'],
      badgeColor: 'border-indigo-300 bg-indigo-50 text-indigo-900',
      iconColor: 'bg-indigo-600 text-white'
    },
    {
      role: 'Site Engineer',
      title: '📐 Site Engineer',
      nama: 'Site Engineer',
      subtitle: 'Engineering, Jadwal Mutasi & Hak Akses',
      scope: 'ALL',
      units: ['Cengkeh', 'Blend', 'Tembakau', 'Krosok'],
      badgeColor: 'border-cyan-300 bg-cyan-50 text-cyan-900',
      iconColor: 'bg-cyan-600 text-white'
    },
    {
      role: 'HR Admin',
      title: '📋 Admin HR PP1',
      nama: 'Admin HR Divisi PP1',
      subtitle: 'Database Pekerja, Rekap Upah & Ijin',
      scope: 'ALL',
      units: ['Cengkeh', 'Blend', 'Tembakau', 'Krosok'],
      badgeColor: 'border-blue-300 bg-blue-50 text-blue-900',
      iconColor: 'bg-blue-600 text-white'
    },
    {
      role: 'Manajer Operasional',
      title: '💼 Manajer Operasional',
      nama: 'Manajer Operasional PP1',
      subtitle: 'Monitoring Beban Upah Harian & Eksekutif',
      scope: 'ALL',
      units: ['Cengkeh', 'Blend', 'Tembakau', 'Krosok'],
      badgeColor: 'border-emerald-300 bg-emerald-50 text-emerald-900',
      iconColor: 'bg-emerald-600 text-white'
    }
  ];

  const kepalaRoles = [
    {
      role: 'Kepala Pengolahan 2',
      title: '🌿 Kepala Pengolahan 2',
      nama: 'Kepala Pengolahan 2',
      subtitle: 'Unit Cengkeh & Blend (Proses + Persediaan)',
      scope: 'Cengkeh & Blend',
      units: ['Cengkeh', 'Blend'],
      badgeColor: 'border-teal-300 bg-teal-50 text-teal-900',
      iconColor: 'bg-teal-600 text-white'
    },
    {
      role: 'Kepala Pengolahan 1',
      title: '🍂 Kepala Pengolahan 1',
      nama: 'Kepala Pengolahan 1',
      subtitle: 'Unit Tembakau & Krosok (Proses + Persediaan)',
      scope: 'Tembakau & Krosok',
      units: ['Tembakau', 'Krosok'],
      badgeColor: 'border-sky-300 bg-sky-50 text-sky-900',
      iconColor: 'bg-sky-600 text-white'
    },
    {
      role: 'Kepala Gudang Tembakau & Krosok',
      title: '📦 Kepala Gudang Tembakau & Krosok',
      nama: 'Kepala Gudang',
      subtitle: 'Persediaan Bahan Baku Tembakau & Krosok',
      scope: 'Persediaan Tembakau & Krosok',
      units: ['Tembakau', 'Krosok'],
      badgeColor: 'border-orange-300 bg-orange-50 text-orange-900',
      iconColor: 'bg-orange-600 text-white'
    }
  ];

  const mandorRoles = [
    {
      role: 'Mandor Proses Cengkeh',
      title: '🌱 Mandor Proses Cengkeh (Plt. Ka)',
      nama: 'Mandor Proses Cengkeh (Plt. Ka)',
      subtitle: 'Mandor Cengkeh & Persediaan (Indah Nurmala)',
      scope: 'Proses Cengkeh & Persediaan Cengkeh',
      units: ['Proses Cengkeh', 'Persediaan Cengkeh'],
      badgeColor: 'border-amber-300 bg-amber-50 text-amber-900',
      iconColor: 'bg-amber-600 text-white'
    },
    {
      role: 'Mandor Proses Cengkeh',
      title: '🌱 Mandor Proses Cengkeh',
      nama: 'Mandor Proses Cengkeh',
      subtitle: 'Mandor Lapangan Unit Proses Cengkeh',
      scope: 'Proses Cengkeh',
      units: ['Proses Cengkeh'],
      badgeColor: 'border-amber-300 bg-amber-50 text-amber-900',
      iconColor: 'bg-amber-600 text-white'
    },
    {
      role: 'Mandor Persediaan Cengkeh',
      title: '📦 Mandor Persediaan Cengkeh',
      nama: 'Mandor Persediaan Cengkeh',
      subtitle: 'Mandor Gudang Penyimpanan Cengkeh',
      scope: 'Persediaan Cengkeh',
      units: ['Cengkeh'],
      badgeColor: 'border-amber-300 bg-amber-50 text-amber-900',
      iconColor: 'bg-amber-600 text-white'
    },
    {
      role: 'Mandor Proses Tembakau',
      title: '🍂 Mandor Proses Tembakau',
      nama: 'Mandor Proses Tembakau',
      subtitle: 'Mandor Lapangan Unit Proses Tembakau',
      scope: 'Proses Tembakau',
      units: ['Tembakau'],
      badgeColor: 'border-amber-300 bg-amber-50 text-amber-900',
      iconColor: 'bg-amber-600 text-white'
    },
    {
      role: 'Mandor Proses Krosok',
      title: '🌾 Mandor Proses Krosok',
      nama: 'Mandor Proses Krosok',
      subtitle: 'Mandor Lapangan Unit Proses Krosok',
      scope: 'Proses Krosok',
      units: ['Krosok'],
      badgeColor: 'border-amber-300 bg-amber-50 text-amber-900',
      iconColor: 'bg-amber-600 text-white'
    },
    {
      role: 'Mandor Proses Blend',
      title: '🍃 Mandor Proses Blend',
      nama: 'Mandor Proses Blend',
      subtitle: 'Mandor Lapangan Unit Proses Blend',
      scope: 'Proses Blend',
      units: ['Blend'],
      badgeColor: 'border-amber-300 bg-amber-50 text-amber-900',
      iconColor: 'bg-amber-600 text-white'
    },
    {
      role: 'Mandor Persediaan Blend',
      title: '📦 Mandor Persediaan Blend',
      nama: 'Mandor Persediaan Blend',
      subtitle: 'Mandor Gudang Penyimpanan Blend',
      scope: 'Persediaan Blend',
      units: ['Blend'],
      badgeColor: 'border-amber-300 bg-amber-50 text-amber-900',
      iconColor: 'bg-amber-600 text-white'
    },
    {
      role: 'Foreman / Mandor',
      title: '👷 Foreman / Mandor (Umum)',
      nama: 'Mandor Unit Cengkeh',
      subtitle: 'Akun Lapangan Default Unit Cengkeh',
      scope: 'Proses Cengkeh',
      units: ['Cengkeh'],
      badgeColor: 'border-amber-300 bg-amber-50 text-amber-900',
      iconColor: 'bg-amber-600 text-white'
    }
  ];

  // Custom roles from storage
  const customRoles = authService.getRoleDefinitions().filter(r => r.isCustom).map(r => ({
    role: r.role,
    title: `✨ ${r.title}`,
    nama: r.title,
    subtitle: r.subtitle || 'Peran Kustom Sistem',
    scope: r.scopeDesc?.includes('ALL') ? 'ALL' : 'Proses Cengkeh',
    units: ['Cengkeh', 'Blend', 'Tembakau', 'Krosok'],
    badgeColor: 'border-indigo-300 bg-indigo-50 text-indigo-900',
    iconColor: 'bg-indigo-600 text-white'
  }));

  // Sample Workers
  const sampleWorker1 = pekerjaList.find(p => p.nama.toUpperCase().includes('DEDIK')) || pekerjaList[0];
  const sampleWorker2 = pekerjaList.find(p => p.nama.toUpperCase().includes('MIFTAKHUL')) || pekerjaList[1];

  // Filter roles based on active category and search
  const filterList = (list: typeof managementRoles) => {
    return list.filter(item => {
      const matchSearch = 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.scope.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  };

  const filteredManagement = filterList(managementRoles);
  const filteredKepala = filterList(kepalaRoles);
  const filteredMandor = filterList(mandorRoles);
  const filteredCustom = filterList(customRoles);

  const roleMatrix = authService.getRoleMatrix();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-xs">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white flex items-center justify-between flex-shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-sm">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Pusat Ganti Peran Cepat
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Dev &amp; Supervisor
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Beralih simulasi peran instan tanpa perlu login ulang
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            title="Tutup Jendela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active User Status Bar */}
        <div className="p-3 bg-amber-50 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-amber-900">Peran Aktif Saat Ini:</span>
            <span className="px-2 py-0.5 rounded-lg bg-amber-200/80 text-amber-900 font-bold border border-amber-300 text-[11px]">
              {currentUser?.role} {currentUser?.scope !== 'ALL' ? `(${currentUser?.scope})` : '(Seluruh Unit)'}
            </span>
            {currentUser?.isSimulated && (
              <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 font-bold text-[10px] border border-purple-200">
                Mode Simulasi
              </span>
            )}
          </div>

          {currentUser?.isSimulated && (
            <button
              onClick={handleRestoreDeveloper}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              title="Kembalikan ke akun master pengembang"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kembali ke Lead Dev</span>
            </button>
          )}
        </div>

        {/* Search & Category Filter */}
        <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50 space-y-2.5 flex-shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari peran jabatan (contoh: mandor cengkeh, engineer, manajer)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Hapus
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              Semua Peran
            </button>
            <button
              onClick={() => setActiveCategory('management')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'management'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              Manajemen &amp; Proyek ({managementRoles.length})
            </button>
            <button
              onClick={() => setActiveCategory('kepala')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'kepala'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              Kepala / Gudang ({kepalaRoles.length})
            </button>
            <button
              onClick={() => setActiveCategory('mandor')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'mandor'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              Mandor Lapangan ({mandorRoles.length})
            </button>
            <button
              onClick={() => setActiveCategory('pekerja')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'pekerja'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              Pekerja Harian
            </button>
            {customRoles.length > 0 && (
              <button
                onClick={() => setActiveCategory('custom')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === 'custom'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                Kustom ({customRoles.length})
              </button>
            )}
          </div>
        </div>

        {/* Roles List Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 divide-y divide-slate-100">
          
          {/* Section 1: Manajemen & Proyek */}
          {(activeCategory === 'all' || activeCategory === 'management') && filteredManagement.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <span>Level Manajemen, Enjiner &amp; Administrator</span>
                <span>Akses Penuh Seluruh Unit (ALL)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredManagement.map((item) => {
                  const isCurrent = currentUser?.role === item.role;
                  const tabs = roleMatrix[item.role] || [];
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => handleSelectRole(item.role, item.nama, item.scope, item.units)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 active:scale-98 relative group ${
                        isCurrent 
                          ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/30' 
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 text-xs block group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </span>
                          <p className="text-[10px] text-slate-500 line-clamp-1">
                            {item.subtitle}
                          </p>
                        </div>
                        {isCurrent ? (
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-1 text-[10px] pt-1 border-t border-slate-100">
                        <span className="font-semibold text-slate-600 font-mono">
                          {tabs.length} Modul Akses
                        </span>
                        <span className="px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                          {item.scope}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Kepala Pengolahan & Gudang */}
          {(activeCategory === 'all' || activeCategory === 'kepala') && filteredKepala.length > 0 && (
            <div className="space-y-2.5 pt-4">
              <div className="flex items-center justify-between text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <span>Kepala Pengolahan &amp; Kepala Gudang</span>
                <span>Otoritas Multi-Unit</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredKepala.map((item) => {
                  const isCurrent = currentUser?.role === item.role;
                  const tabs = roleMatrix[item.role] || [];
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => handleSelectRole(item.role, item.nama, item.scope, item.units)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 active:scale-98 relative group ${
                        isCurrent 
                          ? 'border-teal-500 bg-teal-50/70 ring-2 ring-teal-500/30' 
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 text-xs block group-hover:text-teal-600 transition-colors">
                            {item.title}
                          </span>
                          <p className="text-[10px] text-slate-500 line-clamp-1">
                            {item.subtitle}
                          </p>
                        </div>
                        {isCurrent ? (
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-1 text-[10px] pt-1 border-t border-slate-100">
                        <span className="font-semibold text-slate-600 font-mono">
                          {tabs.length} Modul Akses
                        </span>
                        <span className="px-2 py-0.5 rounded font-bold bg-teal-100 text-teal-800">
                          {item.scope}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Mandor Lapangan (Terkunci Unit) */}
          {(activeCategory === 'all' || activeCategory === 'mandor') && filteredMandor.length > 0 && (
            <div className="space-y-2.5 pt-4">
              <div className="flex items-center justify-between text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <span>Mandor Lapangan &amp; Gudang (Field Units)</span>
                <span>Terkunci Unit Spesifik</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredMandor.map((item) => {
                  const isCurrent = currentUser?.role === item.role;
                  const tabs = roleMatrix[item.role] || [];
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => handleSelectRole(item.role, item.nama, item.scope, item.units)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 active:scale-98 relative group ${
                        isCurrent 
                          ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/30' 
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 text-xs block group-hover:text-amber-600 transition-colors">
                            {item.title}
                          </span>
                          <p className="text-[10px] text-slate-500 line-clamp-1">
                            {item.subtitle}
                          </p>
                        </div>
                        {isCurrent ? (
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-1 text-[10px] pt-1 border-t border-slate-100">
                        <span className="font-semibold text-slate-600 font-mono">
                          {tabs.length} Modul Akses
                        </span>
                        <span className="px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800">
                          {item.scope}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 4: Pekerja Harian Portal */}
          {(activeCategory === 'all' || activeCategory === 'pekerja') && (
            <div className="space-y-2.5 pt-4">
              <div className="flex items-center justify-between text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <span>Pekerja Harian (Portal Mandiri Pekerja)</span>
                <span>Slip Upah &amp; Profil Kontrak</span>
              </div>
              
              <div className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50/50 space-y-3">
                <div className="flex items-center gap-2">
                  <BadgePercent className="w-4 h-4 text-rose-600" />
                  <span className="font-bold text-slate-800 text-xs">Simulasi Akses Pekerja Harian</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sampleWorker1 && (
                    <button
                      type="button"
                      onClick={() => handleSelectWorker(sampleWorker1)}
                      className="p-2.5 rounded-xl border border-rose-300 bg-white hover:bg-rose-50/80 text-left transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block truncate text-xs">
                          👷 {sampleWorker1.nama}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ID: #{sampleWorker1.id} • {sampleWorker1.unit}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-rose-400" />
                    </button>
                  )}

                  {sampleWorker2 && (
                    <button
                      type="button"
                      onClick={() => handleSelectWorker(sampleWorker2)}
                      className="p-2.5 rounded-xl border border-rose-300 bg-white hover:bg-rose-50/80 text-left transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block truncate text-xs">
                          👷 {sampleWorker2.nama}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ID: #{sampleWorker2.id} • {sampleWorker2.unit}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-rose-400" />
                    </button>
                  )}
                </div>

                {/* Dropdown 62 Pekerja */}
                <div className="pt-2 border-t border-rose-200/80 flex items-center gap-2">
                  <select
                    value={selectedWorkerId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedWorkerId(val);
                      const w = pekerjaList.find(p => String(p.id) === String(val));
                      if (w) handleSelectWorker(w);
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 font-medium"
                  >
                    <option value="">-- Pilih Pekerja Lain ({pekerjaList.length} Terdaftar) --</option>
                    {pekerjaList.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nama} (#{p.id} - {p.unit})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Peran Kustom */}
          {(activeCategory === 'all' || activeCategory === 'custom') && filteredCustom.length > 0 && (
            <div className="space-y-2.5 pt-4">
              <div className="flex items-center justify-between text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <span>Peran Kustom Tambahan</span>
                <span>Dikonfigurasi di Tab Hak Akses</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredCustom.map((item) => {
                  const isCurrent = currentUser?.role === item.role;
                  const tabs = roleMatrix[item.role] || [];
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => handleSelectRole(item.role, item.nama, item.scope, item.units)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 active:scale-98 relative group ${
                        isCurrent 
                          ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-500/30' 
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 text-xs block group-hover:text-indigo-600 transition-colors">
                            {item.title}
                          </span>
                          <p className="text-[10px] text-slate-500 line-clamp-1">
                            {item.subtitle}
                          </p>
                        </div>
                        {isCurrent ? (
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-1 text-[10px] pt-1 border-t border-slate-100">
                        <span className="font-semibold text-slate-600 font-mono">
                          {tabs.length} Modul Akses
                        </span>
                        <span className="px-2 py-0.5 rounded font-bold bg-indigo-100 text-indigo-800">
                          {item.scope}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500 font-medium">
            💡 Klik pada salah satu kartu peran untuk beralih secara langsung.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
