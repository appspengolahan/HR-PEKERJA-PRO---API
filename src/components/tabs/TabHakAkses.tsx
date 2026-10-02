import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Users, 
  KeyRound, 
  UserPlus, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Lock, 
  Eye, 
  EyeOff, 
  Building2, 
  LayoutDashboard, 
  CalendarCheck, 
  Clock, 
  BarChart3, 
  BadgePercent, 
  ArrowRightLeft, 
  User, 
  UserCheck, 
  Info,
  Check,
  X
} from 'lucide-react';
import { MainTabType, PekerjaData } from '../../types';
import { 
  authService, 
  InternalAccount, 
  UserAccessRole, 
  AuthUser 
} from '../../services/authService';

interface TabHakAksesProps {
  currentUser: AuthUser | null;
  pekerjaList: PekerjaData[];
  onRefreshUserSession: (user: AuthUser) => void;
}

const ALL_AVAILABLE_TABS: { id: MainTabType; label: string; desc: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard Eksekutif', desc: 'Ringkasan beban upah, alert PKWT, metrik utama', icon: LayoutDashboard },
  { id: 'presensi', label: 'Presensi & Ijin Harian', desc: 'Entri perizinan, surat izin otomatis, log presensi', icon: CalendarCheck },
  { id: 'lembur', label: 'Lembur Bertingkat', desc: 'Perhitungan lembur Tier 1 & Tier 2 dan log lembur', icon: Clock },
  { id: 'rekap', label: 'Rekap Presensi & Analitik', desc: 'Rekapitulasi kehadiran tim, filter tanggal dan sekup', icon: BarChart3 },
  { id: 'slip', label: 'Slip Upah Mingguan', desc: 'Kalkulasi rincian upah, potongan, dan cetak slip', icon: BadgePercent },
  { id: 'database', label: 'Database Induk 62 Pekerja', desc: 'Data pekerja, status PKWT, upah harian, mutasi', icon: Users },
  { id: 'jadwalmutasi', label: 'Jadwal Mutasi Terencana', desc: 'Jadwal perpindahan unit & rotasi terjadwal', icon: ArrowRightLeft },
  { id: 'profil', label: 'Profil Kontrak & Riwayat', desc: 'Kartu kendali PKWT pekerja dan detail kepegawaian', icon: User },
  { id: 'calon', label: 'Calon Pekerja & Pelatihan', desc: 'Evaluasi masa pelatihan dan perpanjangan calon', icon: UserCheck },
  { id: 'hakakses', label: 'Pengaturan Hak Akses (RBAC)', desc: 'Manajemen akun staff, peran, dan modul (Admin)', icon: ShieldCheck }
];

const SCOPE_OPTIONS = [
  'ALL',
  'Proses Cengkeh',
  'Proses Tembakau',
  'Proses Blend',
  'Persediaan Blend',
  'Persediaan Tembakau',
  'Proses Krosok'
];

export const TabHakAkses: React.FC<TabHakAksesProps> = ({
  currentUser,
  pekerjaList,
  onRefreshUserSession
}) => {
  const [accounts, setAccounts] = useState<InternalAccount[]>(() => authService.getInternalAccounts());
  const [activeSubTab, setActiveSubTab] = useState<'accounts' | 'workers' | 'matrix'>('accounts');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchWorker, setSearchWorker] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState<InternalAccount>({
    email: '',
    password: '',
    nama: '',
    role: 'Foreman / Mandor',
    scope: 'Proses Cengkeh',
    allowedTabs: ['presensi', 'lembur', 'rekap', 'dashboard']
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return accounts;
    return accounts.filter(acc => 
      acc.nama.toLowerCase().includes(q) ||
      acc.email.toLowerCase().includes(q) ||
      acc.role.toLowerCase().includes(q) ||
      acc.scope.toLowerCase().includes(q)
    );
  }, [accounts, searchQuery]);

  // Filtered workers
  const filteredWorkers = useMemo(() => {
    const q = searchWorker.toLowerCase().trim();
    if (!q) return pekerjaList;
    return pekerjaList.filter(p => 
      p.nama.toLowerCase().includes(q) ||
      String(p.id).includes(q) ||
      p.unitSekup.toLowerCase().includes(q)
    );
  }, [pekerjaList, searchWorker]);

  // Handle open modal for new account
  const handleAddNew = () => {
    setEditingIndex(null);
    setFormData({
      email: '',
      password: '',
      nama: '',
      role: 'Foreman / Mandor',
      scope: 'Proses Cengkeh',
      allowedTabs: ['presensi', 'lembur', 'rekap', 'dashboard']
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  // Handle open modal for edit
  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setFormData({ ...accounts[index] });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  // Preset role change handler
  const handleRoleChange = (newRole: UserAccessRole) => {
    let presetTabs: MainTabType[] = [];
    let presetScope = formData.scope;

    switch (newRole) {
      case 'Super Admin':
      case 'HR Admin':
        presetTabs = ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon', 'hakakses'];
        presetScope = 'ALL';
        break;
      case 'Manajer Operasional':
        presetTabs = ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon'];
        presetScope = 'ALL';
        break;
      case 'Foreman / Mandor':
        presetTabs = ['presensi', 'lembur', 'rekap', 'dashboard'];
        if (presetScope === 'ALL') presetScope = 'Proses Cengkeh';
        break;
      default:
        presetTabs = ['slip', 'profil'];
        break;
    }

    setFormData(prev => ({
      ...prev,
      role: newRole,
      scope: presetScope,
      allowedTabs: presetTabs
    }));
  };

  // Toggle tab in checklist
  const handleToggleTab = (tabId: MainTabType) => {
    setFormData(prev => {
      const exists = prev.allowedTabs.includes(tabId);
      if (exists) {
        return { ...prev, allowedTabs: prev.allowedTabs.filter(t => t !== tabId) };
      } else {
        return { ...prev, allowedTabs: [...prev.allowedTabs, tabId] };
      }
    });
  };

  // Save form
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama.trim() || !formData.email.trim() || !formData.password.trim()) {
      showNotification('error', 'Nama, Email, dan Kata Sandi wajib diisi lengkap!');
      return;
    }

    const cleanEmail = formData.email.trim().toLowerCase();

    // Check duplicate email
    const duplicate = accounts.some((acc, idx) => 
      idx !== editingIndex && acc.email.toLowerCase() === cleanEmail
    );

    if (duplicate) {
      showNotification('error', `Email "${cleanEmail}" sudah digunakan oleh akun lain!`);
      return;
    }

    let updatedList: InternalAccount[];

    if (editingIndex !== null) {
      // Update existing
      updatedList = [...accounts];
      updatedList[editingIndex] = {
        ...formData,
        email: cleanEmail
      };
      showNotification('success', `Akun ${formData.nama} berhasil diperbarui.`);
    } else {
      // Add new
      updatedList = [
        ...accounts,
        {
          ...formData,
          email: cleanEmail
        }
      ];
      showNotification('success', `Akun baru ${formData.nama} berhasil ditambahkan.`);
    }

    setAccounts(updatedList);
    authService.saveInternalAccounts(updatedList);
    setIsModalOpen(false);

    // If current logged in user was modified, sync their active session immediately
    if (currentUser && currentUser.email?.toLowerCase() === cleanEmail) {
      const updatedAuthUser: AuthUser = {
        ...currentUser,
        nama: formData.nama,
        role: formData.role,
        scope: formData.scope,
        allowedTabs: formData.allowedTabs
      };
      authService.updateCurrentUserSession(updatedAuthUser);
      onRefreshUserSession(updatedAuthUser);
    }
  };

  // Delete account
  const handleDelete = (index: number) => {
    const acc = accounts[index];
    if (acc.email.toLowerCase() === 'appspengolahan@gmail.com') {
      showNotification('error', 'Akun Super Admin Utama (Lead Developer) tidak dapat dihapus demi keamanan sistem!');
      return;
    }

    if (currentUser && currentUser.email?.toLowerCase() === acc.email.toLowerCase()) {
      showNotification('error', 'Anda tidak dapat menghapus akun yang sedang Anda gunakan saat ini!');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus akun "${acc.nama}" (${acc.email})?`)) {
      const updated = accounts.filter((_, idx) => idx !== index);
      setAccounts(updated);
      authService.saveInternalAccounts(updated);
      showNotification('success', `Akun ${acc.nama} telah berhasil dihapus.`);
    }
  };

  // Reset to default
  const handleResetDefault = () => {
    if (confirm('Kembalikan seluruh daftar akun ke pengaturan default bawaan sistem? Akun yang baru Anda tambahkan akan direset.')) {
      const def = authService.resetToDefaultAccounts();
      setAccounts(def);
      showNotification('success', 'Daftar akun berhasil dikembalikan ke pengaturan default.');
    }
  };

  const superAdminCount = accounts.filter(a => a.role === 'Super Admin' || a.role === 'HR Admin').length;
  const mandorCount = accounts.filter(a => a.role === 'Foreman / Mandor').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold tracking-wider text-indigo-300 uppercase">
              MODUL ADMINISTRATOR &bull; SECURITY &amp; RBAC
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            Pengaturan &amp; Manajemen Hak Akses Pengguna
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Kelola otentikasi tim internal, pemberian hak akses tab modul, pembatasan cakupan unit kerja (scope), serta panduan autentikasi 62 pekerja harian mandiri.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleAddNew}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            + Tambah Akun Internal
          </button>
          <button
            onClick={handleResetDefault}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1"
            title="Reset ke akun default bawaan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Default
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-150 ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' 
            : 'bg-red-50 text-red-900 border border-red-300'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Akun Internal
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {accounts.length} Akun
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Staf, HR, Mandor &amp; Admin
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Super Admin &amp; HR
          </span>
          <div className="text-2xl font-black text-indigo-700 font-mono">
            {superAdminCount} Akun
          </div>
          <span className="text-[10px] text-indigo-600 mt-1 block font-medium">
            Akses Penuh Semua Modul
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Foreman / Mandor
          </span>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {mandorCount} Akun
          </div>
          <span className="text-[10px] text-amber-700 mt-1 block font-medium">
            Terkunci per Unit Kerja
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Pekerja Mandiri
          </span>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {pekerjaList.length} Orang
          </div>
          <span className="text-[10px] text-emerald-600 mt-1 block font-medium">
            Login Otomatis via Database
          </span>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('accounts')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeSubTab === 'accounts'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Daftar Akun Internal ({accounts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('workers')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeSubTab === 'workers'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Portal Pekerja Harian (62 Orang)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeSubTab === 'matrix'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Matriks Izin Modul (Role vs Tab)</span>
        </button>
      </div>

      {/* TAB 1: DAFTAR AKUN INTERNAL */}
      {activeSubTab === 'accounts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Kelola Kredensial &amp; Hak Akses Tim Internal
              </h3>
              <p className="text-xs text-slate-500">
                Setiap perubahan kredensial atau batasan modul langsung aktif secara instan pada sesi login.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari akun, email, unit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 font-bold border-y border-slate-200">
                <tr>
                  <th className="p-3">Nama Pengguna</th>
                  <th className="p-3">Email / Username</th>
                  <th className="p-3">Kata Sandi</th>
                  <th className="p-3">Peran (Role)</th>
                  <th className="p-3">Cakupan Unit (Scope)</th>
                  <th className="p-3 text-center">Hak Modul</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.map((acc, idx) => {
                  const isCurrent = currentUser?.email?.toLowerCase() === acc.email.toLowerCase();
                  const isPrimaryDev = acc.email.toLowerCase() === 'appspengolahan@gmail.com';

                  return (
                    <tr key={acc.email} className={`hover:bg-slate-50/80 transition-colors ${isCurrent ? 'bg-indigo-50/40' : ''}`}>
                      <td className="p-3 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{acc.nama}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800">
                              Anda
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-slate-600">{acc.email}</td>
                      <td className="p-3 font-mono text-slate-500">
                        <span className="tracking-widest">&bull;&bull;&bull;&bull;&bull;&bull;</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                          acc.role === 'Super Admin' 
                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                            : acc.role === 'HR Admin'
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : acc.role === 'Manajer Operasional'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}>
                          {acc.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-700">
                          {acc.scope === 'ALL' ? '🔑 Seluruh Unit (ALL)' : `👤 ${acc.scope}`}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200" title={acc.allowedTabs.join(', ')}>
                          {acc.allowedTabs.length} Modul Aktif
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(idx)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors"
                            title="Edit Akun &amp; Modul"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {!isPrimaryDev && (
                            <button
                              onClick={() => handleDelete(idx)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PORTAL PEKERJA HARIAN (62 ORANG) */}
      {activeSubTab === 'workers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">Mekanisme Autentikasi Mandiri 62 Pekerja Harian</span>
                <p className="text-emerald-800 leading-relaxed text-[11px]">
                  Pekerja harian tidak memerlukan registrasi manual. Mereka dapat login mandiri di tab login <strong>"Portal Pekerja Harian"</strong> dengan mengetikkan <strong>Nama Lengkap</strong> dan <strong>Nomor ID Pekerja</strong> sesuai data master spreadsheet.
                </p>
              </div>
            </div>

            <div className="relative w-full sm:w-64 flex-shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari ID / Nama Pekerja..."
                value={searchWorker}
                onChange={(e) => setSearchWorker(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 scrollbar-thin">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="p-2.5">ID Pekerja</th>
                  <th className="p-2.5">Nama Lengkap (KTP / Master)</th>
                  <th className="p-2.5">Unit &amp; Sekup</th>
                  <th className="p-2.5">Status PKWT</th>
                  <th className="p-2.5">Kredensial Login Mandiri</th>
                  <th className="p-2.5 text-center">Hak Akses Modul</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWorkers.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2.5 font-mono font-bold text-indigo-700">#{p.id}</td>
                    <td className="p-2.5 font-bold text-slate-900">{p.nama}</td>
                    <td className="p-2.5 text-slate-600">{p.unit} &bull; {p.sekup}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'TETAP' ? 'bg-blue-100 text-blue-900' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <div className="font-mono text-[11px] text-slate-600">
                        Nama: <strong className="text-slate-900">{p.nama}</strong> | ID: <strong className="text-slate-900">{p.id}</strong>
                      </div>
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Slip Upah &amp; Profil Kontrak
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MATRIKS IZIN MODUL (ROLE VS TAB) */}
      {activeSubTab === 'matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Matriks Referensi Izin Hak Akses (*Role-Based Access Matrix*)
            </h3>
            <p className="text-xs text-slate-500">
              Tabel standar acuan izin modul untuk setiap tingkatan pengguna di lingkungan pabrik.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-3 border-b border-r border-slate-200">Modul Aplikasi</th>
                  <th className="p-3 border-b border-r border-slate-200 text-center">Super Admin</th>
                  <th className="p-3 border-b border-r border-slate-200 text-center">HR Admin</th>
                  <th className="p-3 border-b border-r border-slate-200 text-center">Manajer Operasional</th>
                  <th className="p-3 border-b border-r border-slate-200 text-center">Foreman / Mandor</th>
                  <th className="p-3 border-b border-slate-200 text-center">Pekerja Harian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ALL_AVAILABLE_TABS.map(tab => (
                  <tr key={tab.id} className="hover:bg-slate-50">
                    <td className="p-3 border-r border-slate-200 font-medium flex items-center gap-2">
                      <tab.icon className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">{tab.label}</div>
                        <div className="text-[10px] text-slate-400">{tab.desc}</div>
                      </div>
                    </td>
                    <td className="p-3 border-r border-slate-200 text-center">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    </td>
                    <td className="p-3 border-r border-slate-200 text-center">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    </td>
                    <td className="p-3 border-r border-slate-200 text-center">
                      {tab.id !== 'hakakses' ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center mx-auto">
                          -
                        </span>
                      )}
                    </td>
                    <td className="p-3 border-r border-slate-200 text-center">
                      {['presensi', 'lembur', 'rekap', 'dashboard'].includes(tab.id) ? (
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto font-bold text-[10px]" title="Khusus Unit Sekupnya">
                          &radic;*
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center mx-auto">
                          -
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {['slip', 'profil'].includes(tab.id) ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto font-bold text-[10px]" title="Hanya Data Milik Sendiri">
                          &radic;
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center mx-auto">
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            * Keterangan: Foreman / Mandor hanya dapat mengakses dan menginput data sesuai unit kerja yang ditentukan pada akunnya.
          </p>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT AKUN INTERNAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  {editingIndex !== null ? 'Edit Akun &amp; Hak Akses' : 'Tambah Akun Tim Internal'}
                </h3>
                <p className="text-xs text-slate-500">
                  Tentukan profil akun, kata sandi, peran jabatan, dan checklist modul yang boleh dibuka.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nama Lengkap Pengguna *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email / Username Login *</label>
                  <input
                    type="email"
                    required
                    placeholder="Contoh: budi.mandor@batukarang.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Kata Sandi / PIN *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata sandi baru"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Peran Jabatan (Role) *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value as UserAccessRole)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="Super Admin">Super Admin (Akses Penuh)</option>
                    <option value="HR Admin">HR Admin (Manajemen Pekerja)</option>
                    <option value="Manajer Operasional">Manajer Operasional</option>
                    <option value="Foreman / Mandor">Foreman / Mandor Lapangan</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Cakupan Unit Kerja (Scope) *</label>
                  <select
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    {SCOPE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>
                        {opt === 'ALL' ? '🔑 Seluruh Unit (ALL PP1)' : opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Checklist Pilihan Tab Modul */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">
                    Pilihan Modul yang Boleh Diakses ({formData.allowedTabs.length} Terpilih):
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, allowedTabs: ALL_AVAILABLE_TABS.map(t => t.id) })}
                      className="text-[10px] text-indigo-600 hover:underline font-bold"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-slate-300">&bull;</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, allowedTabs: ['dashboard'] })}
                      className="text-[10px] text-slate-500 hover:underline"
                    >
                      Hanya Dashboard
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-thin">
                  {ALL_AVAILABLE_TABS.map(tab => {
                    const isChecked = formData.allowedTabs.includes(tab.id);
                    const TabIcon = tab.icon;

                    return (
                      <label 
                        key={tab.id}
                        className={`flex items-start gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                          isChecked 
                            ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 font-bold' 
                            : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleTab(tab.id)}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-xs">
                            <TabIcon className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                            <span className="truncate">{tab.label}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal truncate">
                            {tab.desc}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm transition-all"
                >
                  {editingIndex !== null ? 'Simpan Perubahan' : 'Buat Akun Sekarang'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
