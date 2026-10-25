import React, { useState } from 'react';
import { 
  Eye, 
  RotateCcw, 
  ChevronDown, 
  ShieldCheck, 
  Users, 
  Building2, 
  UserCheck, 
  Check, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { AuthUser, UserAccessRole, authService } from '../../services/authService';
import { PekerjaData } from '../../types';

interface RoleSimulatorBarProps {
  currentUser: AuthUser | null;
  pekerjaList: PekerjaData[];
  onSwitchUser: (newUser: AuthUser) => void;
  onOpenRoleSwitcherModal?: () => void;
}

export const RoleSimulatorBar: React.FC<RoleSimulatorBarProps> = ({
  currentUser,
  pekerjaList,
  onSwitchUser,
  onOpenRoleSwitcherModal
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Check if current user is Developer, PM, Site Engineer, Manajer Operasional, or is currently simulating a role
  const isSupervisoryUser = 
    currentUser?.isSimulated ||
    currentUser?.role === 'Super Admin' ||
    currentUser?.role === 'Project Manager' ||
    currentUser?.role === 'Site Engineer' ||
    currentUser?.role === 'Manajer Operasional' ||
    currentUser?.role === 'HR Admin' ||
    currentUser?.email === 'appspengolahan@gmail.com' ||
    sessionStorage.getItem('bk_dev_sim_unlocked') === 'true' ||
    sessionStorage.getItem('bk_supervisor_session') === 'true';

  if (!isSupervisoryUser) return null;

  // Retrieve original developer user if in simulation
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

  const handleSwitchToInternal = (
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
    setIsOpen(false);
  };

  const handleSwitchToWorker = (worker: PekerjaData) => {
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
    setIsOpen(false);
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
      setIsOpen(false);
    }
  };

  // Sample workers for simulation
  const sampleWorker1 = pekerjaList.find(p => p.nama.toUpperCase().includes('DEDIK')) || pekerjaList[0];
  const sampleWorker2 = pekerjaList.find(p => p.nama.toUpperCase().includes('MIFTAKHUL')) || pekerjaList[1];

  // Custom roles from storage
  const customRoles = authService.getRoleDefinitions().filter(r => r.isCustom);

  return (
    <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-amber-200 border-b border-amber-500/30 px-3 sm:px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-md z-40 relative print:hidden">
      
      {/* Active Role Indicator */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="flex h-2 w-2 relative flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <div className="flex items-center gap-1.5 font-bold min-w-0">
          <Eye className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="text-amber-100 hidden sm:inline">Supervisi &amp; Simulasi Peran:</span>
          <span className="text-amber-100 sm:hidden">Simulasi:</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono text-[11px] truncate max-w-[140px] sm:max-w-none">
            {currentUser?.role} {currentUser?.scope !== 'ALL' ? `(${currentUser?.scope})` : ''}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2 relative">
        
        {/* Dropdown Menu Toggle */}
        <div className="relative">
          <button
            onClick={() => {
              if (onOpenRoleSwitcherModal) {
                onOpenRoleSwitcherModal();
              } else {
                setIsOpen(!isOpen);
              }
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold border border-amber-400/30 transition-all flex items-center gap-1.5 text-xs shadow-xs cursor-pointer active:scale-95"
          >
            <span className="hidden xs:inline">Ganti Peran Tampilan</span>
            <span className="xs:hidden">Ganti Peran</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Role Switcher Menu Popup */}
          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-24px)] max-h-[75vh] overflow-y-auto bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-3 z-50 text-slate-200 space-y-3 animate-in fade-in zoom-in-95 duration-150 scrollbar-thin scrollbar-thumb-slate-800">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
                  Pilih Peran untuk Dipantau:
                </span>
                <span className="text-[9px] text-slate-400 font-mono">Dev Sandbox</span>
              </div>

              {/* Management & Engineering */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                  Level Manajemen &amp; Proyek:
                </span>
                <div className="grid grid-cols-1 gap-1">
                  <button
                    onClick={() => handleSwitchToInternal('Super Admin', 'Lead Developer', 'ALL', ['Cengkeh', 'Blend', 'Tembakau', 'Krosok'])}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs font-semibold flex items-center justify-between text-purple-300"
                  >
                    <span>👑 Super Admin / Lead Dev</span>
                    {currentUser?.role === 'Super Admin' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </button>

                  <button
                    onClick={() => handleSwitchToInternal('Project Manager', 'Project Manager', 'ALL', ['Cengkeh', 'Blend', 'Tembakau', 'Krosok'])}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs font-semibold flex items-center justify-between text-indigo-300"
                  >
                    <span>🏗️ Project Manager</span>
                    {currentUser?.role === 'Project Manager' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>

                  <button
                    onClick={() => handleSwitchToInternal('Site Engineer', 'Site Engineer', 'ALL', ['Cengkeh', 'Blend', 'Tembakau', 'Krosok'])}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs font-semibold flex items-center justify-between text-cyan-300"
                  >
                    <span>📐 Site Engineer</span>
                    {currentUser?.role === 'Site Engineer' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>

                  <button
                    onClick={() => handleSwitchToInternal('HR Admin', 'Admin HR', 'ALL', ['Cengkeh', 'Blend', 'Tembakau', 'Krosok'])}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs font-semibold flex items-center justify-between text-blue-300"
                  >
                    <span>📋 Admin HR PP1</span>
                    {currentUser?.role === 'HR Admin' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </button>

                  <button
                    onClick={() => handleSwitchToInternal('Manajer Operasional', 'Manajer Operasional', 'ALL', ['Cengkeh', 'Blend', 'Tembakau', 'Krosok'])}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs font-semibold flex items-center justify-between text-emerald-300"
                  >
                    <span>💼 Manajer Operasional (Rekap Upah)</span>
                    {currentUser?.role === 'Manajer Operasional' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                </div>
              </div>

              {/* Kepala Pengolahan & Kepala Gudang (Multi-Unit) */}
              <div className="space-y-1 pt-1 border-t border-slate-800">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                  Kepala Pengolahan &amp; Gudang (Multi-Unit):
                </span>
                <div className="grid grid-cols-1 gap-1">
                  <button
                    onClick={() => handleSwitchToInternal('Kepala Pengolahan 2', 'Kepala Pengolahan 2', 'Cengkeh & Blend', ['Cengkeh', 'Blend'])}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs font-semibold flex items-center justify-between text-teal-300"
                  >
                    <div>
                      <span className="block">🌿 Kepala Pengolahan 2</span>
                      <span className="text-[10px] text-teal-400/80">Proses &amp; Persediaan Cengkeh + Blend</span>
                    </div>
                    {currentUser?.role === 'Kepala Pengolahan 2' && <Check className="w-3.5 h-3.5 text-teal-400" />}
                  </button>

                  <button
                    onClick={() => handleSwitchToInternal('Kepala Pengolahan 1', 'Kepala Pengolahan 1', 'Tembakau & Krosok', ['Tembakau', 'Krosok'])}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs font-semibold flex items-center justify-between text-sky-300"
                  >
                    <div>
                      <span className="block">🍂 Kepala Pengolahan 1</span>
                      <span className="text-[10px] text-sky-400/80">Proses &amp; Persediaan Tembakau + Krosok</span>
                    </div>
                    {currentUser?.role === 'Kepala Pengolahan 1' && <Check className="w-3.5 h-3.5 text-sky-400" />}
                  </button>

                  <button
                    onClick={() => handleSwitchToInternal('Kepala Gudang Tembakau & Krosok', 'Kepala Gudang', 'Persediaan Tembakau & Krosok', ['Tembakau', 'Krosok'])}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs font-semibold flex items-center justify-between text-orange-300"
                  >
                    <div>
                      <span className="block">📦 Kepala Gudang Tembakau &amp; Krosok</span>
                      <span className="text-[10px] text-orange-400/80">Persediaan Tembakau &amp; Krosok</span>
                    </div>
                    {currentUser?.role === 'Kepala Gudang Tembakau & Krosok' && <Check className="w-3.5 h-3.5 text-orange-400" />}
                  </button>
                </div>
              </div>

              {/* Mandor / Foreman Field Units */}
              <div className="space-y-1 pt-1 border-t border-slate-800">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                  Mandor Lapangan (Terkunci Unit):
                </span>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => handleSwitchToInternal('Mandor Proses Cengkeh', 'Mandor Proses Cengkeh', 'Proses Cengkeh', ['Cengkeh'])}
                    className="text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 text-[11px] font-semibold flex items-center justify-between text-amber-300"
                  >
                    <span className="truncate">🌱 Proses Cengkeh</span>
                    {currentUser?.role === 'Mandor Proses Cengkeh' && <Check className="w-3 h-3 text-amber-400" />}
                  </button>

                  <button
                    onClick={() => handleSwitchToInternal('Mandor Persediaan Cengkeh', 'Mandor Persediaan Cengkeh', 'Persediaan Cengkeh', ['Cengkeh'])}
                    className="text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 text-[11px] font-semibold flex items-center justify-between text-amber-300"
                  >
                    <span className="truncate">📦 Gudang Cengkeh</span>
                    {currentUser?.role === 'Mandor Persediaan Cengkeh' && <Check className="w-3 h-3 text-amber-400" />}
                  </button>

                  <button
                    onClick={() => handleSwitchToInternal('Mandor Proses Tembakau', 'Mandor Proses Tembakau', 'Proses Tembakau', ['Tembakau'])}
                    className="text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 text-[11px] font-semibold flex items-center justify-between text-amber-300"
                  >
                    <span className="truncate">🍂 Proses Tembakau</span>
                    {currentUser?.role === 'Mandor Proses Tembakau' && <Check className="w-3 h-3 text-amber-400" />}
                  </button>

                  <button
                    onClick={() => handleSwitchToInternal('Mandor Proses Krosok', 'Mandor Proses Krosok', 'Proses Krosok', ['Krosok'])}
                    className="text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 text-[11px] font-semibold flex items-center justify-between text-amber-300"
                  >
                    <span className="truncate">🌾 Proses Krosok</span>
                    {currentUser?.role === 'Mandor Proses Krosok' && <Check className="w-3 h-3 text-amber-400" />}
                  </button>

                  <button
                    onClick={() => handleSwitchToInternal('Mandor Proses Blend', 'Mandor Proses Blend', 'Proses Blend', ['Blend'])}
                    className="text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 text-[11px] font-semibold flex items-center justify-between text-amber-300"
                  >
                    <span className="truncate">🍃 Proses Blend</span>
                    {currentUser?.role === 'Mandor Proses Blend' && <Check className="w-3 h-3 text-amber-400" />}
                  </button>

                  <button
                    onClick={() => handleSwitchToInternal('Mandor Persediaan Blend', 'Mandor Persediaan Blend', 'Persediaan Blend', ['Blend'])}
                    className="text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 text-[11px] font-semibold flex items-center justify-between text-amber-300"
                  >
                    <span className="truncate">📦 Gudang Blend</span>
                    {currentUser?.role === 'Mandor Persediaan Blend' && <Check className="w-3 h-3 text-amber-400" />}
                  </button>
                </div>
              </div>

              {/* Workers Portal */}
              <div className="space-y-1 pt-1 border-t border-slate-800">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                  Pekerja Harian (Sandbox Pribadi):
                </span>
                <div className="grid grid-cols-1 gap-1">
                  {sampleWorker1 && (
                    <button
                      onClick={() => handleSwitchToWorker(sampleWorker1)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs font-semibold flex items-center justify-between text-emerald-400"
                    >
                      <span className="truncate">👷 {sampleWorker1.nama} (#{sampleWorker1.id})</span>
                      {currentUser?.role === 'Pekerja Harian' && currentUser?.workerRecord?.id === sampleWorker1.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  )}
                  {sampleWorker2 && (
                    <button
                      onClick={() => handleSwitchToWorker(sampleWorker2)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs font-semibold flex items-center justify-between text-emerald-400"
                    >
                      <span className="truncate">👷 {sampleWorker2.nama} (#{sampleWorker2.id})</span>
                      {currentUser?.role === 'Pekerja Harian' && currentUser?.workerRecord?.id === sampleWorker2.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Custom Added Roles */}
              {customRoles.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-slate-800">
                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">
                    Peran Tambahan (Kustom):
                  </span>
                  <div className="grid grid-cols-1 gap-1">
                    {customRoles.map(cr => (
                      <button
                        key={cr.role}
                        onClick={() => handleSwitchToInternal(cr.role, cr.title, cr.scopeDesc?.includes('ALL') ? 'ALL' : 'Proses Cengkeh', ['Cengkeh', 'Blend', 'Tembakau', 'Krosok'])}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs font-semibold flex items-center justify-between text-indigo-300"
                      >
                        <span className="truncate">✨ {cr.title} ({cr.role})</span>
                        {currentUser?.role === cr.role && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Restore to Lead Developer */}
        {currentUser?.isSimulated && (
          <button
            onClick={handleRestoreDeveloper}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Kembali ke akun penuh Lead Developer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Kembali ke Developer</span>
          </button>
        )}

      </div>

    </div>
  );
};
