import React, { useState, useMemo, useRef } from 'react';
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
  X,
  Plus,
  Coins,
  Link,
  Copy,
  Download,
  Upload,
  Cloud,
  CloudUpload,
  CloudDownload,
  FileSpreadsheet,
  Code2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { MainTabType, PekerjaData } from '../../types';
import { 
  authService, 
  InternalAccount, 
  UserAccessRole, 
  AuthUser,
  RoleMatrix,
  RoleDefinition,
  WageSummaryRoleConfig,
  DEFAULT_ROLE_MATRIX,
  ALL_UNIT_SEKUPS
} from '../../services/authService';
import { gasClient } from '../../services/gasClient';
import { GAS_CODE_TEMPLATE, USER_LOGIN_SHEET_NAME, TARGET_SPREADSHEET_ID } from '../../services/gasService';

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
  { id: 'hakakses', label: 'Pengaturan Hak Akses (RBAC)', desc: 'Manajemen akun pekerja, peran, dan modul (Admin)', icon: ShieldCheck }
];

const SCOPE_OPTIONS = [
  'ALL',
  ...ALL_UNIT_SEKUPS
];

export const BADGE_COLOR_OPTIONS = [
  { label: 'Indigo', value: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { label: 'Biru (Blue)', value: 'bg-blue-100 text-blue-800 border-blue-200' },
  { label: 'Hijau (Emerald)', value: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { label: 'Teal (Hijau Laut)', value: 'bg-teal-100 text-teal-800 border-teal-200' },
  { label: 'Cyan (Biru Muda)', value: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  { label: 'Ungu (Purple)', value: 'bg-purple-100 text-purple-800 border-purple-200' },
  { label: 'Kuning (Amber)', value: 'bg-amber-100 text-amber-800 border-amber-200' },
  { label: 'Merah (Rose)', value: 'bg-rose-100 text-rose-800 border-rose-200' },
  { label: 'Abu-abu (Slate)', value: 'bg-slate-100 text-slate-800 border-slate-200' }
];

export const MATRIX_ROLES: { 
  role: UserAccessRole; 
  title: string; 
  subtitle: string; 
  scopeDesc: string; 
  badgeColor: string;
}[] = [
  { 
    role: 'Super Admin', 
    title: 'Developer / Super Admin', 
    subtitle: 'Lead Developer & Admin Sistem', 
    scopeDesc: 'Semua Unit (ALL)', 
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' 
  },
  { 
    role: 'Project Manager', 
    title: 'Project Manager', 
    subtitle: 'Monitoring & Operasional Proyek', 
    scopeDesc: 'Semua Unit (ALL)', 
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200' 
  },
  { 
    role: 'Site Engineer', 
    title: 'Site Engineer', 
    subtitle: 'Pengawasan Teknis Lapangan', 
    scopeDesc: 'Semua Unit (ALL)', 
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200' 
  },
  { 
    role: 'HR Admin', 
    title: 'HR Admin', 
    subtitle: 'Administrasi Kepegawaian & PKWT', 
    scopeDesc: 'Semua Unit (ALL)', 
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200' 
  },
  { 
    role: 'Manajer Operasional', 
    title: 'Manajer Operasional', 
    subtitle: 'Rekap Total Upah & Operasional', 
    scopeDesc: 'Semua Unit (ALL)', 
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200' 
  },
  { 
    role: 'Kepala Pengolahan 2', 
    title: 'Kepala Pengolahan 2', 
    subtitle: 'Monitoring & Entri 2 Unit', 
    scopeDesc: 'Unit Cengkeh & Blend', 
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200' 
  },
  { 
    role: 'Kepala Pengolahan 1', 
    title: 'Kepala Pengolahan 1', 
    subtitle: 'Monitoring & Entri 2 Unit (Lowong)', 
    scopeDesc: 'Unit Tembakau & Krosok', 
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200' 
  },
  { 
    role: 'Foreman / Mandor', 
    title: 'Foreman / Mandor', 
    subtitle: 'Mandor Khusus Unit Lapangan', 
    scopeDesc: 'Khusus Unit Terkait', 
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' 
  },
  { 
    role: 'Pekerja Harian', 
    title: 'Pekerja Harian', 
    subtitle: 'Portal Karyawan Lapangan', 
    scopeDesc: 'Data Pribadi Mandiri', 
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200' 
  }
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

  // Dynamic Role Definitions List (Bawaan + Peran Kustom Tambahan)
  const [rolesList, setRolesList] = useState<RoleDefinition[]>(() => authService.getRoleDefinitions());

  // Dynamic Role Matrix State (Checkboxes per Role & Modul)
  const [roleMatrix, setRoleMatrix] = useState<RoleMatrix>(() => authService.getRoleMatrix());

  // Konfigurasi Visibilitas "Ringkasan Beban Upah Harian Periode Ini" per peran
  const [wageSummaryConfig, setWageSummaryConfig] = useState<WageSummaryRoleConfig>(() => authService.getWageSummaryConfig());

  const [hasMatrixChanges, setHasMatrixChanges] = useState(false);

  // Modal State untuk Tambah Peran Baru
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({
    roleName: '',
    title: '',
    subtitle: '',
    scopeType: 'ALL' as 'ALL' | 'CUSTOM',
    selectedUnitSekups: [] as string[],
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    showWageSummary: true,
    selectedTabs: ['dashboard', 'presensi', 'lembur', 'rekap'] as MainTabType[]
  });

  // Modal State untuk Edit Peran
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [editRoleForm, setEditRoleForm] = useState({
    title: '',
    subtitle: '',
    scopeType: 'ALL' as 'ALL' | 'CUSTOM',
    selectedUnitSekups: [] as string[],
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    showWageSummary: true,
    selectedTabs: ['dashboard', 'presensi'] as MainTabType[]
  });

  // Cloud Sheet CONFIG_USER_LOGIN Sync States
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [isInitializingSheet, setIsInitializingSheet] = useState(false);
  const [isFetchingCloud, setIsFetchingCloud] = useState(false);
  const [isShowGasGuideModal, setIsShowGasGuideModal] = useState(false);
  const [gasCodeCopied, setGasCodeCopied] = useState(false);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // 1. Sinkronisasi seluruh daftar akun ke Google Sheet CONFIG_USER_LOGIN
  const handleSyncAllToCloud = async () => {
    setIsSyncingAll(true);
    try {
      const res = await gasClient.syncAllUserLogins(accounts, currentUser?.nama || 'Admin');
      if (res.status === 'success') {
        showNotification('success', `✅ Sukses! Seluruh ${accounts.length} akun internal berhasil disimpan & disinkronkan ke sheet "${USER_LOGIN_SHEET_NAME}" di Google Spreadsheet.`);
      } else {
        showNotification('error', `Gagal menyinkronkan akun: ${res.message || 'Periksa koneksi Google Apps Script'}`);
      }
    } catch (e) {
      showNotification('error', `Kesalahan saat menyinkronkan: ${String(e)}`);
    } finally {
      setIsSyncingAll(false);
    }
  };

  // 2. Siapkan / Buat Sheet CONFIG_USER_LOGIN di Google Spreadsheet
  const handleInitLoginSheet = async () => {
    setIsInitializingSheet(true);
    try {
      const res = await gasClient.initUserLoginSheet(currentUser?.nama || 'Admin');
      if (res.status === 'success') {
        showNotification('success', `✅ Berhasil! Sheet "${USER_LOGIN_SHEET_NAME}" telah dibuat dan disiapkan di Google Spreadsheet ID ${TARGET_SPREADSHEET_ID}.`);
      } else {
        showNotification('error', `Gagal menyiapkan sheet: ${res.message || 'Periksa Apps Script'}`);
      }
    } catch (e) {
      showNotification('error', `Kesalahan: ${String(e)}`);
    } finally {
      setIsInitializingSheet(false);
    }
  };

  // 3. Tarik data akun terbaru dari Google Sheet
  const handleFetchFromCloud = async () => {
    setIsFetchingCloud(true);
    try {
      const cloudAccounts = await authService.syncFromCloud();
      setAccounts(cloudAccounts);
      showNotification('success', `✅ Berhasil memperbarui! Mengambil ${cloudAccounts.length} akun terbaru dari Google Sheet "${USER_LOGIN_SHEET_NAME}".`);
    } catch (e) {
      showNotification('error', `Gagal memuat akun dari cloud: ${String(e)}`);
    } finally {
      setIsFetchingCloud(false);
    }
  };

  const handleToggleRoleTab = (role: UserAccessRole, tabId: MainTabType) => {
    if (role === 'Super Admin' && tabId === 'hakakses') {
      showNotification('error', 'Modul Hak Akses untuk Super Admin tidak dapat dinonaktifkan demi keamanan sistem.');
      return;
    }

    setRoleMatrix(prev => {
      const currentTabs = prev[role] || [];
      const exists = currentTabs.includes(tabId);
      const nextTabs = exists 
        ? currentTabs.filter(t => t !== tabId)
        : [...currentTabs, tabId];

      setHasMatrixChanges(true);
      return {
        ...prev,
        [role]: nextTabs
      };
    });
  };

  const handleToggleAllForRole = (role: UserAccessRole, enableAll: boolean) => {
    setRoleMatrix(prev => {
      const allTabIds = ALL_AVAILABLE_TABS.map(t => t.id);
      let nextTabs: MainTabType[] = [];

      if (enableAll) {
        nextTabs = [...allTabIds];
      } else {
        // If disabling all, keep 'hakakses' for Super Admin to prevent lockouts
        if (role === 'Super Admin') {
          nextTabs = ['hakakses'];
        } else {
          nextTabs = [];
        }
      }

      setHasMatrixChanges(true);
      return {
        ...prev,
        [role]: nextTabs
      };
    });
  };

  // Toggle visibilitas Ringkasan Beban Upah pada Dashboard untuk peran tertentu
  const handleToggleWageSummary = (role: UserAccessRole) => {
    setWageSummaryConfig(prev => {
      const currentVal = Boolean(prev[role]);
      const updated = {
        ...prev,
        [role]: !currentVal
      };
      setHasMatrixChanges(true);
      return updated;
    });
  };

  const handleSaveRoleMatrix = () => {
    authService.saveRoleMatrix(roleMatrix);
    authService.saveWageSummaryConfig(wageSummaryConfig);
    authService.saveRoleDefinitions(rolesList);
    setHasMatrixChanges(false);

    // Sync active session if currentUser role was updated
    if (currentUser && roleMatrix[currentUser.role]) {
      const updatedUser: AuthUser = {
        ...currentUser,
        allowedTabs: roleMatrix[currentUser.role]
      };
      authService.updateCurrentUserSession(updatedUser);
      onRefreshUserSession(updatedUser);
    }

    showNotification('success', 'Matriks hak akses dan preferensi beban upah berhasil disimpan!');
  };

  const handleResetRoleMatrix = () => {
    if (window.confirm('Kembalikan seluruh pengaturan matriks hak akses, peran, dan visibilitas beban upah ke setelan bawaan pabrik?')) {
      const def = authService.resetRoleMatrix();
      const defWage = authService.getWageSummaryConfig();
      const defRoles = authService.getRoleDefinitions();

      setRoleMatrix(def);
      setWageSummaryConfig(defWage);
      setRolesList(defRoles);
      setHasMatrixChanges(false);

      if (currentUser && def[currentUser.role]) {
        const updatedUser: AuthUser = {
          ...currentUser,
          allowedTabs: def[currentUser.role]
        };
        authService.updateCurrentUserSession(updatedUser);
        onRefreshUserSession(updatedUser);
      }

      showNotification('success', 'Matriks hak akses peran berhasil di-reset ke setelan standar pabrik.');
    }
  };

  // Buka Modal Edit Peran
  const handleOpenEditRole = (r: RoleDefinition) => {
    setEditingRole(r);
    const isAll = !r.allowedUnitSekups || r.allowedUnitSekups.includes('ALL');
    setEditRoleForm({
      title: r.title,
      subtitle: r.subtitle,
      scopeType: isAll ? 'ALL' : 'CUSTOM',
      selectedUnitSekups: isAll ? [] : (r.allowedUnitSekups || []),
      badgeColor: r.badgeColor,
      showWageSummary: Boolean(wageSummaryConfig[r.role]),
      selectedTabs: roleMatrix[r.role] || ['dashboard', 'presensi']
    });
    setIsEditRoleModalOpen(true);
  };

  // Simpan Perubahan Edit Peran
  const handleSaveEditRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;

    const cleanTitle = editRoleForm.title.trim() || editingRole.title;
    const cleanSubtitle = editRoleForm.subtitle.trim() || editingRole.subtitle;
    const allowedUnitSekups = editRoleForm.scopeType === 'ALL'
      ? ['ALL']
      : (editRoleForm.selectedUnitSekups.length > 0 ? editRoleForm.selectedUnitSekups : ['ALL']);

    const scopeDesc = editRoleForm.scopeType === 'ALL'
      ? 'Semua Unit (ALL)'
      : (allowedUnitSekups.length <= 2 ? allowedUnitSekups.join(' & ') : `${allowedUnitSekups.length} Unit Sekup`);

    const updatedDef: RoleDefinition = {
      ...editingRole,
      title: cleanTitle,
      subtitle: cleanSubtitle,
      scopeDesc,
      badgeColor: editRoleForm.badgeColor,
      allowedUnitSekups
    };

    const nextRoles = rolesList.map(r => r.role === editingRole.role ? updatedDef : r);
    setRolesList(nextRoles);
    authService.saveRoleDefinitions(nextRoles);

    // Update matriks tabs
    const nextMatrix = {
      ...roleMatrix,
      [editingRole.role]: editRoleForm.selectedTabs
    };
    setRoleMatrix(nextMatrix);
    authService.saveRoleMatrix(nextMatrix);

    // Update konfigurasi beban upah
    const nextWageConfig = {
      ...wageSummaryConfig,
      [editingRole.role]: editRoleForm.showWageSummary
    };
    setWageSummaryConfig(nextWageConfig);
    authService.saveWageSummaryConfig(nextWageConfig);

    setIsEditRoleModalOpen(false);
    setEditingRole(null);

    // Sinkronisasi sesi aktif jika currentUser memiliki peran ini
    if (currentUser && currentUser.role === editingRole.role) {
      const updatedUser: AuthUser = {
        ...currentUser,
        allowedTabs: editRoleForm.selectedTabs
      };
      authService.updateCurrentUserSession(updatedUser);
      onRefreshUserSession(updatedUser);
    }

    showNotification('success', `Pengaturan peran "${updatedDef.title}" berhasil diperbarui!`);
  };

  // Tambah Peran Baru
  const handleAddNewRole = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRoleName = newRoleForm.roleName.trim();
    if (!cleanRoleName) {
      showNotification('error', 'Nama singkat peran (Role Key) wajib diisi.');
      return;
    }

    if (rolesList.some(r => r.role.toLowerCase() === cleanRoleName.toLowerCase())) {
      showNotification('error', `Peran dengan nama "${cleanRoleName}" sudah ada di sistem.`);
      return;
    }

    const allowedUnitSekups = newRoleForm.scopeType === 'ALL'
      ? ['ALL']
      : (newRoleForm.selectedUnitSekups.length > 0 ? newRoleForm.selectedUnitSekups : ['ALL']);

    const scopeDesc = newRoleForm.scopeType === 'ALL'
      ? 'Semua Unit (ALL)'
      : (allowedUnitSekups.length <= 2 ? allowedUnitSekups.join(' & ') : `${allowedUnitSekups.length} Unit Sekup`);

    const newDef: RoleDefinition = {
      role: cleanRoleName,
      title: newRoleForm.title.trim() || cleanRoleName,
      subtitle: newRoleForm.subtitle.trim() || 'Peran Kustom Sistem',
      scopeDesc,
      badgeColor: newRoleForm.badgeColor || 'bg-indigo-100 text-indigo-800 border-indigo-200',
      allowedUnitSekups,
      isCustom: true
    };

    const nextRoles = [...rolesList, newDef];
    setRolesList(nextRoles);
    authService.saveRoleDefinitions(nextRoles);

    // Matriks izin modul untuk peran baru
    const nextMatrix: RoleMatrix = {
      ...roleMatrix,
      [cleanRoleName]: newRoleForm.selectedTabs
    };
    setRoleMatrix(nextMatrix);
    authService.saveRoleMatrix(nextMatrix);

    // Visibilitas beban upah untuk peran baru
    const nextWageConfig: WageSummaryRoleConfig = {
      ...wageSummaryConfig,
      [cleanRoleName]: newRoleForm.showWageSummary
    };
    setWageSummaryConfig(nextWageConfig);
    authService.saveWageSummaryConfig(nextWageConfig);

    setIsAddRoleModalOpen(false);
    setNewRoleForm({
      roleName: '',
      title: '',
      subtitle: '',
      scopeType: 'ALL',
      selectedUnitSekups: [],
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      showWageSummary: true,
      selectedTabs: ['dashboard', 'presensi', 'lembur', 'rekap']
    });

    showNotification('success', `Peran baru "${newDef.title}" berhasil ditambahkan ke matriks!`);
  };

  // Hapus Peran
  const handleDeleteRole = (roleToDelete: UserAccessRole) => {
    if (roleToDelete === 'Super Admin') {
      showNotification('error', 'Peran Super Admin dilindungi sistem dan tidak dapat dihapus.');
      return;
    }

    if (!window.confirm(`Yakin ingin menghapus peran "${roleToDelete}"? Pengguna dengan peran ini perlu dialihkan ke peran lain.`)) {
      return;
    }

    const nextRoles = rolesList.filter(r => r.role !== roleToDelete);
    setRolesList(nextRoles);
    authService.saveRoleDefinitions(nextRoles);

    const nextMatrix = { ...roleMatrix };
    delete nextMatrix[roleToDelete];
    setRoleMatrix(nextMatrix);
    authService.saveRoleMatrix(nextMatrix);

    const nextWage = { ...wageSummaryConfig };
    delete nextWage[roleToDelete];
    setWageSummaryConfig(nextWage);
    authService.saveWageSummaryConfig(nextWage);

    showNotification('success', `Peran "${roleToDelete}" telah dihapus.`);
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

  // Helper untuk menentukan daftar unit awal saat membuka akun
  const resolveAccountUnits = (acc: InternalAccount): string[] => {
    const roleDef = rolesList.find(r => r.role === acc.role);
    if (acc.units && Array.isArray(acc.units) && acc.units.length > 0) {
      if (acc.units.includes('ALL')) {
        return ['ALL', ...ALL_UNIT_SEKUPS];
      }
      const res: string[] = [];
      acc.units.forEach(u => {
        if (ALL_UNIT_SEKUPS.includes(u)) {
          if (!res.includes(u)) res.push(u);
        } else if (u === 'Cengkeh') {
          ['Proses Cengkeh', 'Persediaan Cengkeh'].forEach(item => { if (!res.includes(item)) res.push(item); });
        } else if (u === 'Tembakau') {
          ['Proses Tembakau', 'Persediaan Tembakau'].forEach(item => { if (!res.includes(item)) res.push(item); });
        } else if (u === 'Krosok') {
          ['Proses Krosok', 'Persediaan Krosok'].forEach(item => { if (!res.includes(item)) res.push(item); });
        } else if (u === 'Blend') {
          ['Proses Blend', 'Persediaan Blend'].forEach(item => { if (!res.includes(item)) res.push(item); });
        }
      });
      if (res.length > 0) return res;
    }
    if (acc.scope === 'ALL') {
      return ['ALL', ...ALL_UNIT_SEKUPS];
    }
    if (ALL_UNIT_SEKUPS.includes(acc.scope)) {
      return [acc.scope];
    }
    if (roleDef?.allowedUnitSekups && roleDef.allowedUnitSekups.length > 0) {
      if (roleDef.allowedUnitSekups.includes('ALL')) {
        return ['ALL', ...ALL_UNIT_SEKUPS];
      }
      return [...roleDef.allowedUnitSekups];
    }
    return ['ALL', ...ALL_UNIT_SEKUPS];
  };

  // Handle open modal for new account
  const handleAddNew = () => {
    setEditingIndex(null);
    setFormData({
      email: '',
      password: '',
      nama: '',
      role: 'Foreman / Mandor',
      scope: 'Proses Cengkeh',
      units: ['Proses Cengkeh'],
      allowedTabs: ['presensi', 'lembur', 'rekap', 'dashboard']
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  // Handle open modal for edit
  const handleEdit = (index: number) => {
    setEditingIndex(index);
    const acc = accounts[index];
    const initialUnits = resolveAccountUnits(acc);
    setFormData({ 
      ...acc,
      units: initialUnits
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  // Preset role change handler
  const handleRoleChange = (newRole: UserAccessRole) => {
    const roleDef = rolesList.find(r => r.role === newRole);
    const presetTabs: MainTabType[] = roleMatrix[newRole] || ['dashboard', 'presensi', 'lembur', 'rekap'];
    
    let defaultUnits: string[] = ['ALL', ...ALL_UNIT_SEKUPS];
    if (roleDef?.allowedUnitSekups && roleDef.allowedUnitSekups.length > 0) {
      if (roleDef.allowedUnitSekups.includes('ALL')) {
        defaultUnits = ['ALL', ...ALL_UNIT_SEKUPS];
      } else {
        defaultUnits = [...roleDef.allowedUnitSekups];
      }
    } else if (['Super Admin', 'HR Admin', 'Project Manager', 'Manajer Operasional', 'Site Engineer'].includes(newRole)) {
      defaultUnits = ['ALL', ...ALL_UNIT_SEKUPS];
    } else {
      defaultUnits = ['Proses Cengkeh'];
    }

    const isAll = defaultUnits.includes('ALL') || defaultUnits.length === ALL_UNIT_SEKUPS.length;
    const cleanUnits = isAll ? ['ALL', ...ALL_UNIT_SEKUPS] : defaultUnits.filter(u => u !== 'ALL');
    const scopeSummary = isAll
      ? 'ALL'
      : (cleanUnits.length <= 2 ? cleanUnits.join(' & ') : `${cleanUnits.length} Unit Sekup`);

    setFormData(prev => ({
      ...prev,
      role: newRole,
      scope: scopeSummary,
      units: cleanUnits,
      allowedTabs: presetTabs
    }));
  };

  // Toggle unit scope in checklist
  const handleToggleScopeUnit = (unitSekup: string) => {
    setFormData(prev => {
      const current = prev.units || [];
      const isAllSelected = current.includes('ALL') || ALL_UNIT_SEKUPS.every(u => current.includes(u));

      let nextUnits: string[] = [];

      if (unitSekup === 'ALL') {
        if (isAllSelected) {
          nextUnits = ['Proses Cengkeh'];
        } else {
          nextUnits = ['ALL', ...ALL_UNIT_SEKUPS];
        }
      } else {
        if (isAllSelected) {
          nextUnits = ALL_UNIT_SEKUPS.filter(u => u !== unitSekup);
        } else {
          if (current.includes(unitSekup)) {
            nextUnits = current.filter(u => u !== unitSekup && u !== 'ALL');
            if (nextUnits.length === 0) {
              nextUnits = [unitSekup]; // Jangan biarkan kosong
            }
          } else {
            nextUnits = [...current.filter(u => u !== 'ALL'), unitSekup];
            if (ALL_UNIT_SEKUPS.every(u => nextUnits.includes(u))) {
              nextUnits = ['ALL', ...ALL_UNIT_SEKUPS];
            }
          }
        }
      }

      const isNowAll = nextUnits.includes('ALL') || ALL_UNIT_SEKUPS.every(u => nextUnits.includes(u));
      const cleanUnits = isNowAll ? ['ALL', ...ALL_UNIT_SEKUPS] : nextUnits.filter(u => u !== 'ALL');
      const scopeSummary = isNowAll
        ? 'ALL'
        : (cleanUnits.length <= 2 ? cleanUnits.join(' & ') : `${cleanUnits.length} Unit Sekup`);

      return {
        ...prev,
        units: cleanUnits,
        scope: scopeSummary
      };
    });
  };

  // Reset cakupan unit ke template bawaan peran
  const handleResetScopeToRole = () => {
    const roleDef = rolesList.find(r => r.role === formData.role);
    let defaultUnits: string[] = ['ALL', ...ALL_UNIT_SEKUPS];
    if (roleDef?.allowedUnitSekups && roleDef.allowedUnitSekups.length > 0) {
      if (roleDef.allowedUnitSekups.includes('ALL')) {
        defaultUnits = ['ALL', ...ALL_UNIT_SEKUPS];
      } else {
        defaultUnits = [...roleDef.allowedUnitSekups];
      }
    } else if (['Super Admin', 'HR Admin', 'Project Manager', 'Manajer Operasional', 'Site Engineer'].includes(formData.role)) {
      defaultUnits = ['ALL', ...ALL_UNIT_SEKUPS];
    } else {
      defaultUnits = ['Proses Cengkeh'];
    }

    const isAll = defaultUnits.includes('ALL') || defaultUnits.length === ALL_UNIT_SEKUPS.length;
    const cleanUnits = isAll ? ['ALL', ...ALL_UNIT_SEKUPS] : defaultUnits.filter(u => u !== 'ALL');
    const scopeSummary = isAll
      ? 'ALL'
      : (cleanUnits.length <= 2 ? cleanUnits.join(' & ') : `${cleanUnits.length} Unit Sekup`);

    setFormData(prev => ({
      ...prev,
      units: cleanUnits,
      scope: scopeSummary
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

    const cleanUnits = (formData.units && formData.units.length > 0)
      ? (formData.units.includes('ALL') ? ['ALL', ...ALL_UNIT_SEKUPS] : formData.units.filter(u => u !== 'ALL'))
      : ['ALL', ...ALL_UNIT_SEKUPS];

    const isAll = cleanUnits.includes('ALL') || ALL_UNIT_SEKUPS.every(u => cleanUnits.includes(u));
    const scopeSummary = isAll 
      ? 'ALL' 
      : (cleanUnits.filter(u => u !== 'ALL').length <= 2 
          ? cleanUnits.filter(u => u !== 'ALL').join(' & ') 
          : `${cleanUnits.filter(u => u !== 'ALL').length} Unit Sekup`);

    let updatedList: InternalAccount[];

    if (editingIndex !== null) {
      // Update existing
      updatedList = [...accounts];
      updatedList[editingIndex] = {
        ...formData,
        nama: formData.nama.trim(),
        email: cleanEmail,
        password: formData.password.trim(),
        scope: scopeSummary,
        units: cleanUnits
      };
      showNotification('success', `Akun ${formData.nama} berhasil diperbarui.`);
    } else {
      // Add new
      updatedList = [
        ...accounts,
        {
          ...formData,
          nama: formData.nama.trim(),
          email: cleanEmail,
          password: formData.password.trim(),
          scope: scopeSummary,
          units: cleanUnits
        }
      ];
      showNotification('success', `Akun baru ${formData.nama} berhasil ditambahkan.`);
    }

    setAccounts(updatedList);
    authService.saveInternalAccounts(updatedList);
    setIsModalOpen(false);

    // Otomatis sinkronkan akun ke Google Sheet CONFIG_USER_LOGIN di latar belakang
    const targetAccount = editingIndex !== null ? updatedList[editingIndex] : updatedList[updatedList.length - 1];
    gasClient.saveUserLogin(targetAccount, currentUser?.nama || 'Admin').then(res => {
      if (res.status === 'success') {
        showNotification('success', `Akun ${targetAccount.nama} tersimpan & disinkronkan ke Google Sheet "${USER_LOGIN_SHEET_NAME}"!`);
      }
    }).catch(err => {
      console.warn('Sync to GAS background warning:', err);
    });

    // If current logged in user was modified, sync their active session immediately
    if (currentUser && currentUser.email?.toLowerCase() === cleanEmail) {
      const updatedAuthUser: AuthUser = {
        ...currentUser,
        nama: formData.nama.trim(),
        role: formData.role,
        scope: scopeSummary,
        units: cleanUnits,
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

      // Hapus juga dari Google Sheet CONFIG_USER_LOGIN
      gasClient.deleteUserLogin(acc.email, currentUser?.nama || 'Admin').then(res => {
        if (res.status === 'success') {
          console.log(`Akun ${acc.email} terhapus dari cloud.`);
        }
      }).catch(err => {
        console.warn('Delete user from GAS warning:', err);
      });

      showNotification('success', `Akun ${acc.nama} telah berhasil dihapus.`);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Salin tautan login instan yang langsung mengisi email/username & PIN
  const handleCopyLoginLink = (acc: InternalAccount) => {
    try {
      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set('login', acc.email);
      if (acc.password) {
        url.searchParams.set('pin', acc.password);
      }
      navigator.clipboard.writeText(url.toString()).then(() => {
        showNotification('success', `Tautan login cepat untuk "${acc.nama}" berhasil disalin! Silakan kirim via WhatsApp ke pekerja/mandor.`);
      }).catch(() => {
        showNotification('error', 'Gagal menyalin tautan ke papan klip.');
      });
    } catch {
      showNotification('error', 'Terjadi kesalahan saat menyalin tautan.');
    }
  };

  // Salin ringkasan kredensial akun untuk dikirim ke pekerja
  const handleCopyCredentials = (acc: InternalAccount) => {
    try {
      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set('login', acc.email);
      const text = `*AKUN RESMI HR PEKERJA PP1*\nNama: ${acc.nama}\nEmail / Username: ${acc.email}\nKata Sandi / PIN: ${acc.password} (atau PIN 'mandor')\nPeran: ${acc.role}\nCakupan Unit: ${acc.scope}\n\nTautan Akses Cepat:\n${url.toString()}`;
      navigator.clipboard.writeText(text).then(() => {
        showNotification('success', `Kredensial login "${acc.nama}" berhasil disalin.`);
      }).catch(() => {
        showNotification('error', 'Gagal menyalin kredensial.');
      });
    } catch {
      showNotification('error', 'Terjadi kesalahan saat menyalin kredensial.');
    }
  };

  // Ekspor daftar akun ke file JSON
  const handleExportAccountsJSON = () => {
    try {
      const jsonStr = JSON.stringify(accounts, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_akun_hr_pekerja_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('success', 'Cadangan akun berhasil diekspor sebagai file JSON.');
    } catch {
      showNotification('error', 'Gagal mengekspor file cadangan akun.');
    }
  };

  // Impor daftar akun dari file JSON
  const handleImportAccountsJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAccounts(parsed);
          authService.saveInternalAccounts(parsed);
          showNotification('success', `${parsed.length} akun berhasil diimpor dan disimpan ke sistem!`);
        } else {
          showNotification('error', 'Format file JSON akun tidak valid.');
        }
      } catch {
        showNotification('error', 'Gagal membaca atau mem-parsing file JSON.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      
      {/* Hidden file input for importing accounts */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportAccountsJSON}
        accept=".json"
        className="hidden"
      />

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

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAddNew}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            + Tambah Akun
          </button>
          
          <button
            onClick={handleExportAccountsJSON}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Ekspor seluruh akun ke file JSON"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor JSON
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Impor akun dari file JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            Impor JSON
          </button>

          <button
            onClick={handleResetDefault}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
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

      {/* Cloud Integration Hub Bar for CONFIG_USER_LOGIN */}
      <div className="bg-gradient-to-r from-blue-900/90 via-slate-900 to-indigo-950 p-4 sm:p-5 rounded-2xl border border-blue-700/50 shadow-md text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 flex-shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                Sheet Cloud Akun: <code className="px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800 text-cyan-300 font-mono text-[11px]">{USER_LOGIN_SHEET_NAME}</code>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                Multi-Perangkat Online
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Data login staf disimpan di Google Spreadsheet sehingga bisa login dari Handphone, Tablet &amp; PC mana saja secara terintegrasi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          <button
            type="button"
            onClick={handleSyncAllToCloud}
            disabled={isSyncingAll}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Kirim seluruh akun lokal saat ini ke Google Sheet CONFIG_USER_LOGIN"
          >
            <CloudUpload className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-bounce' : ''}`} />
            <span>{isSyncingAll ? 'Menyinkronkan...' : 'Sinkronkan ke Sheet'}</span>
          </button>

          <button
            type="button"
            onClick={handleFetchFromCloud}
            disabled={isFetchingCloud}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            title="Ambil pembaruan akun terbaru dari Google Sheet CONFIG_USER_LOGIN"
          >
            <CloudDownload className={`w-3.5 h-3.5 ${isFetchingCloud ? 'animate-spin' : ''}`} />
            <span>{isFetchingCloud ? 'Mengambil...' : 'Tarik dari Sheet'}</span>
          </button>

          <button
            type="button"
            onClick={handleInitLoginSheet}
            disabled={isInitializingSheet}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            title="Buat sheet CONFIG_USER_LOGIN baru di spreadsheet target jika belum ada"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isInitializingSheet ? 'Menyiapkan...' : 'Siapkan Sheet'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsShowGasGuideModal(true)}
            className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            title="Buka panduan skrip Code.gs dan struktur sheet"
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Skrip GAS</span>
          </button>
        </div>
      </div>

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
            Pekerja, HR, Mandor &amp; Admin
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
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block border ${
                          rolesList.find(r => r.role === acc.role)?.badgeColor || 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}>
                          {acc.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-slate-800">
                            {acc.scope === 'ALL' || acc.units?.includes('ALL') ? (
                              <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px] font-bold inline-flex items-center gap-1">
                                🔑 Seluruh Unit (ALL PP1)
                              </span>
                            ) : (
                              <span className="text-slate-800 font-medium">
                                👤 {acc.scope}
                              </span>
                            )}
                          </span>
                          {acc.units && !acc.units.includes('ALL') && acc.units.length > 1 && (
                            <span className="text-[10px] text-slate-400 truncate max-w-[220px] block" title={acc.units.join(', ')}>
                              {acc.units.join(', ')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200" title={acc.allowedTabs.join(', ')}>
                          {acc.allowedTabs.length} Modul Aktif
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleCopyLoginLink(acc)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                            title="Salin Tautan Login Cepat (Tinggal Kirim via WhatsApp ke Staf/Mandor)"
                          >
                            <Link className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleCopyCredentials(acc)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 transition-colors cursor-pointer"
                            title="Salin Rincian Akun &amp; Kredensial (Teks)"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEdit(idx)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="Edit Akun, Password &amp; Modul"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {!isPrimaryDev && (
                            <button
                              onClick={() => handleDelete(idx)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
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

      {/* TAB 3: MATRIKS IZIN MODUL (ROLE VS TAB) DENGAN CHECKBOX DINAMIS */}
      {activeSubTab === 'matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
          
          {/* Header & Action Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Pengaturan Matriks Hak Akses Peran Dinamis (Role-Based Access Control)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Atur hak akses tab modul dan opsi visibilitas <strong>Ringkasan Beban Upah</strong> untuk masing-masing peran. Anda juga dapat menambah peran baru sesuai kebutuhan.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {hasMatrixChanges && (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold animate-pulse flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Ada Perubahan Belum Disimpan
                </span>
              )}

              <button
                type="button"
                onClick={() => setIsAddRoleModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                title="Tambahkan peran baru ke dalam sistem"
              >
                <Plus className="w-4 h-4" />
                Tambah Peran Baru
              </button>

              <button
                type="button"
                onClick={handleResetRoleMatrix}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors"
                title="Reset seluruh hak akses peran ke standar bawaan pabrik"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Bawaan
              </button>

              <button
                type="button"
                onClick={handleSaveRoleMatrix}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all ${
                  hasMatrixChanges
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Simpan Matriks Peran
              </button>
            </div>
          </div>

          {/* Guidance Info Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
              <div>
                <strong className="text-slate-800 block">Kepala Pengolahan 2</strong>
                <span className="text-slate-500 text-[11px]">Monitoring &amp; Entri khusus 2 unit: <strong>Cengkeh &amp; Blend</strong>.</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-md bg-sky-100 text-sky-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
              <div>
                <strong className="text-slate-800 block">Kepala Pengolahan 1</strong>
                <span className="text-slate-500 text-[11px]">Monitoring &amp; Entri 2 unit: <strong>Tembakau &amp; Krosok</strong> (status lowong).</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">3</span>
              <div>
                <strong className="text-slate-800 block">Mandor Lapangan</strong>
                <span className="text-slate-500 text-[11px]">Mandor Cengkeh, Blend, &amp; Tembakau hanya mengakses unit kerjanya.</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">4</span>
              <div>
                <strong className="text-slate-800 block">Fitur Tambah Peran &amp; Finansial</strong>
                <span className="text-slate-500 text-[11px]">Gunakan tombol <strong>+ Tambah Peran Baru</strong> dan checkbox <strong>Ringkasan Beban Upah</strong> di bawah.</span>
              </div>
            </div>
          </div>

          {/* Interactive Checkbox Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10 select-none">
                <tr className="border-b border-slate-200">
                  <th className="p-3.5 bg-slate-100 sticky left-0 z-20 min-w-[240px] font-bold text-slate-800 border-r border-slate-200 shadow-xs">
                    Modul &amp; Otorisasi Finansial
                  </th>

                  {rolesList.map(r => {
                    return (
                      <th key={r.role} className="p-3 text-center min-w-[170px] border-r border-slate-200 last:border-r-0">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="flex items-center gap-1.5 justify-center">
                            <span className="font-bold text-slate-900 text-xs text-center leading-tight">
                              {r.title}
                            </span>
                            
                            {/* Tombol Edit Peran */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditRole(r)}
                              className="text-slate-400 hover:text-blue-600 p-1 rounded-md hover:bg-blue-50 transition-colors"
                              title={`Edit detail peran "${r.title}"`}
                            >
                              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                            </button>

                            {/* Tombol Hapus Peran (Super Admin dilindungi) */}
                            {r.role !== 'Super Admin' && (
                              <button
                                type="button"
                                onClick={() => handleDeleteRole(r.role)}
                                className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                                title={`Hapus peran "${r.title}"`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1 justify-center flex-wrap">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${r.badgeColor}`}>
                              {r.scopeDesc}
                            </span>
                            {r.isCustom && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                Kustom
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                            <button
                              type="button"
                              onClick={() => handleToggleAllForRole(r.role, true)}
                              className="text-indigo-600 hover:text-indigo-800 hover:underline font-semibold"
                              title={`Pilih semua modul untuk peran ${r.title}`}
                            >
                              Semua
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() => handleToggleAllForRole(r.role, false)}
                              className="text-slate-500 hover:text-red-600 hover:underline font-semibold"
                              title={`Kosongkan modul untuk peran ${r.title}`}
                            >
                              Kosongkan
                            </button>
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                {/* 1. Baris Modul / Tab Navigasi */}
                {ALL_AVAILABLE_TABS.map((tab) => (
                  <tr key={tab.id} className="hover:bg-indigo-50/30 transition-colors">
                    
                    {/* Sticky Module Column */}
                    <td className="p-3 bg-white sticky left-0 z-10 border-r border-slate-200 shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                          <tab.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            {tab.label}
                            {tab.id === 'slip' && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                                Slip Upah
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">{tab.desc}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role Checkboxes for Tabs */}
                    {rolesList.map(r => {
                      const isAllowed = (roleMatrix[r.role] || []).includes(tab.id);
                      const isSuperAdminLocked = r.role === 'Super Admin' && tab.id === 'hakakses';
                      const isSlipForKaPengolahan = tab.id === 'slip' && (r.role === 'Kepala Pengolahan 1' || r.role === 'Kepala Pengolahan 2');

                      return (
                        <td 
                          key={r.role} 
                          className="p-3 text-center border-r border-slate-200 last:border-r-0 cursor-pointer select-none"
                          onClick={() => {
                            if (!isSuperAdminLocked) {
                              handleToggleRoleTab(r.role, tab.id);
                            }
                          }}
                        >
                          <div className="flex flex-col items-center justify-center gap-1">
                            <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
                              <input
                                type="checkbox"
                                checked={isAllowed}
                                disabled={isSuperAdminLocked}
                                readOnly
                                className="sr-only"
                              />
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                isSuperAdminLocked
                                  ? 'bg-purple-600 border-purple-600 text-white cursor-not-allowed opacity-90'
                                  : isAllowed
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-50 border-slate-300 text-transparent hover:border-slate-400'
                              }`}>
                                {isSuperAdminLocked ? (
                                  <Lock className="w-3 h-3 text-white" />
                                ) : (
                                  <Check className={`w-3.5 h-3.5 text-white transition-transform ${isAllowed ? 'scale-100' : 'scale-0'}`} />
                                )}
                              </div>
                            </label>

                            {isSlipForKaPengolahan && (
                              <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-1 rounded border border-teal-200">
                                Checkbox Slip
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* 2. BARIS KHUSUS: CHECKBOX RINGKASAN BEBAN UPAH HARIAN PERIODE INI */}
                <tr className="bg-amber-100/60 border-t-2 border-b-2 border-amber-300">
                  <td colSpan={rolesList.length + 1} className="py-2 px-3 text-[11px] font-bold text-amber-950">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-amber-700" />
                      <span>VISIBILITAS KARTU BEBAN UPAH DI DASHBOARD</span>
                    </div>
                  </td>
                </tr>

                <tr className="bg-amber-50/40 hover:bg-amber-50/70 transition-colors">
                  {/* Sticky Feature Column */}
                  <td className="p-3 bg-amber-50/90 sticky left-0 z-10 border-r border-slate-200 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                        <Coins className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          Ringkasan Beban Upah Harian Periode Ini
                          <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[9px] font-extrabold">
                            Dashboard
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">
                          Tampilkan kartu nominal beban upah harian &amp; breakdown per unit di Dashboard
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role Checkboxes for Wage Summary */}
                  {rolesList.map(r => {
                    const isVisible = Boolean(wageSummaryConfig[r.role]);

                    return (
                      <td 
                        key={r.role} 
                        className="p-3 text-center border-r border-slate-200 last:border-r-0 cursor-pointer select-none"
                        onClick={() => handleToggleWageSummary(r.role)}
                        title={`Klik untuk ${isVisible ? 'menyembunyikan' : 'menampilkan'} Ringkasan Beban Upah bagi peran ${r.title}`}
                      >
                        <div className="flex flex-col items-center justify-center gap-1">
                          <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
                            <input
                              type="checkbox"
                              checked={isVisible}
                              readOnly
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                              isVisible
                                ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                                : 'bg-slate-50 border-slate-300 text-transparent hover:border-slate-400'
                            }`}>
                              <Check className={`w-3.5 h-3.5 text-white transition-transform ${isVisible ? 'scale-100' : 'scale-0'}`} />
                            </div>
                          </label>

                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            isVisible 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            {isVisible ? 'Ditampilkan' : 'Disembunyikan'}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>

              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-[11px] text-slate-700">
                <tr>
                  <td className="p-3 sticky left-0 bg-slate-50 border-r border-slate-200 shadow-xs">
                    Total Modul Diizinkan:
                  </td>
                  {rolesList.map(r => {
                    const count = (roleMatrix[r.role] || []).length;
                    return (
                      <td key={r.role} className="p-3 text-center border-r border-slate-200 last:border-r-0 font-mono">
                        <span className={`px-2 py-0.5 rounded-full font-bold ${
                          count >= 8 ? 'bg-emerald-100 text-emerald-800' :
                          count >= 4 ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {count} / {ALL_AVAILABLE_TABS.length}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2 pt-2">
            <p className="italic">
              * Keterangan: Centang kotak modul di atas akan menentukan tab mana yang dapat diakses peran terkait. Baris <strong>"Ringkasan Beban Upah Harian Periode Ini"</strong> menentukan apakah kartu finansial upah harian ditampilkan di Dashboard peran tersebut.
            </p>
            {hasMatrixChanges && (
              <button
                type="button"
                onClick={handleSaveRoleMatrix}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm ml-auto"
              >
                <CheckCircle2 className="w-4 h-4" />
                Simpan Perubahan Sekarang
              </button>
            )}
          </div>

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
                  {editingIndex !== null ? 'Edit Akun & Hak Akses' : 'Tambah Akun Tim Internal'}
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
                    type="text"
                    required
                    placeholder="Contoh: indahnurmala189@gmail.com atau username login"
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

              {/* Peran Jabatan (Role) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Peran Jabatan (Role) *</label>
                  <span className="text-[10px] text-slate-500">
                    Memilih peran akan menyetel preset checklist scope &amp; modul otomatis
                  </span>
                </div>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value as UserAccessRole)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-indigo-500 font-bold text-slate-800"
                >
                  {rolesList.map(r => (
                    <option key={r.role} value={r.role}>
                      {r.title} ({r.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cakupan Unit Kerja (Scope) - Format Checklist Dinamis */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <label className="font-bold text-slate-800">
                      Cakupan Unit Kerja (Scope) *
                    </label>
                    {(() => {
                      const isAll = (formData.units?.includes('ALL') || ALL_UNIT_SEKUPS.every(u => formData.units?.includes(u)));
                      const count = (formData.units || []).filter(u => u !== 'ALL').length;
                      return (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isAll
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-indigo-100 text-indigo-900 border-indigo-300'
                        }`}>
                          {isAll ? '🔑 Seluruh Unit (ALL)' : `${count} Unit Terpilih`}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="flex items-center gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleToggleScopeUnit('ALL')}
                      className="text-amber-700 hover:text-amber-900 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>🔑 Pilih Semua (ALL)</span>
                    </button>
                    <span className="text-slate-300">&bull;</span>
                    <button
                      type="button"
                      onClick={handleResetScopeToRole}
                      className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                      title="Kembalikan checklist unit ke pengaturan bawaan peran ini"
                    >
                      Reset ke Template Peran
                    </button>
                    <span className="text-slate-300">&bull;</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, units: ['Proses Cengkeh'], scope: 'Proses Cengkeh' })}
                      className="text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                    >
                      Hanya 1 Unit
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2">
                  {/* Master Checkbox: Seluruh Unit (ALL PP1) */}
                  {(() => {
                    const isAll = (formData.units?.includes('ALL') || ALL_UNIT_SEKUPS.every(u => formData.units?.includes(u)));
                    return (
                      <label 
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isAll 
                            ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold shadow-xs' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isAll}
                            onChange={() => handleToggleScopeUnit('ALL')}
                            className="rounded text-amber-600 focus:ring-0 w-4 h-4 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold block">
                              🔑 Seluruh Unit Kerja (ALL PP1)
                            </span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              Memberikan wewenang akses penuh ke seluruh 8 unit pengolahan dan persediaan
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100/80 text-amber-800 font-bold flex-shrink-0">
                          SEMUA UNIT
                        </span>
                      </label>
                    );
                  })()}

                  {/* 8 Unit Sekup Checkboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-thin">
                    {ALL_UNIT_SEKUPS.map(unitSekup => {
                      const isAll = (formData.units?.includes('ALL') || ALL_UNIT_SEKUPS.every(u => formData.units?.includes(u)));
                      const isChecked = isAll || (formData.units || []).includes(unitSekup);
                      
                      let tagColor = 'bg-slate-100 text-slate-700';
                      if (unitSekup.includes('Cengkeh')) tagColor = 'bg-amber-100 text-amber-800';
                      else if (unitSekup.includes('Tembakau')) tagColor = 'bg-emerald-100 text-emerald-800';
                      else if (unitSekup.includes('Krosok')) tagColor = 'bg-sky-100 text-sky-800';
                      else if (unitSekup.includes('Blend')) tagColor = 'bg-purple-100 text-purple-800';

                      return (
                        <label 
                          key={unitSekup}
                          className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                            isChecked 
                              ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 font-bold' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/70'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleScopeUnit(unitSekup)}
                              className="rounded text-indigo-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                            />
                            <span className="text-xs truncate">{unitSekup}</span>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${tagColor} flex-shrink-0`}>
                            {unitSekup.split(' ')[1] || unitSekup}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Dynamic Summary Label */}
                  <div className="pt-1 px-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/70">
                    <span className="truncate">
                      <strong>Cakupan Aktif:</strong>{' '}
                      {(formData.units?.includes('ALL') || ALL_UNIT_SEKUPS.every(u => formData.units?.includes(u)))
                        ? 'Seluruh 8 Unit PP1 (Akses Penuh)'
                        : ((formData.units || []).filter(u => u !== 'ALL').length > 0 
                            ? (formData.units || []).filter(u => u !== 'ALL').join(', ') 
                            : 'Belum ada unit dipilih')}
                    </span>
                  </div>
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

      {/* MODAL TAMBAH PERAN BARU */}
      {isAddRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Tambah Peran Pengguna Baru</h3>
                  <p className="text-xs text-slate-500">Buat peran / level otorisasi baru dalam sistem</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddRoleModalOpen(false)} 
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewRole} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nama Singkat Peran (Role Key) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Supervisor Produksi"
                    value={newRoleForm.roleName}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, roleName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                  <span className="text-[10px] text-slate-400">Pengenal unik peran di sistem</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Judul Jabatan (Label Tampilan) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Supervisor Pengolahan Lapangan"
                    value={newRoleForm.title}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                  <span className="text-[10px] text-slate-400">Nama lengkap pada header matriks</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Deskripsi Tanggung Jawab</label>
                  <input
                    type="text"
                    placeholder="Contoh: Pengawasan mutu dan alur kerja"
                    value={newRoleForm.subtitle}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, subtitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Cakupan Unit Kerja (Multi-Unit Checklist) */}
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl sm:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      Cakupan Unit Kerja Pekerja (Scope Data) *
                    </label>
                    <div className="flex items-center gap-3 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                        <input
                          type="radio"
                          name="newScopeType"
                          checked={newRoleForm.scopeType === 'ALL'}
                          onChange={() => setNewRoleForm({ ...newRoleForm, scopeType: 'ALL' })}
                          className="text-indigo-600 focus:ring-0"
                        />
                        <span>Akses Penuh (Semua Unit / ALL)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                        <input
                          type="radio"
                          name="newScopeType"
                          checked={newRoleForm.scopeType === 'CUSTOM'}
                          onChange={() => setNewRoleForm({ ...newRoleForm, scopeType: 'CUSTOM' })}
                          className="text-indigo-600 focus:ring-0"
                        />
                        <span>Pilih Unit Tertentu (Multi-Unit)</span>
                      </label>
                    </div>
                  </div>

                  {newRoleForm.scopeType === 'CUSTOM' ? (
                    <div className="space-y-2 pt-1 border-t border-slate-200/60 mt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">
                          Centang unit sekup yang dapat diakses oleh peran ini ({newRoleForm.selectedUnitSekups.length} dipilih):
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setNewRoleForm({ ...newRoleForm, selectedUnitSekups: [...ALL_UNIT_SEKUPS] })}
                            className="text-indigo-600 font-bold hover:underline"
                          >
                            Pilih Semua
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => setNewRoleForm({ ...newRoleForm, selectedUnitSekups: [] })}
                            className="text-slate-500 font-bold hover:underline"
                          >
                            Kosongkan
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {ALL_UNIT_SEKUPS.map(unitSekup => {
                          const isSelected = newRoleForm.selectedUnitSekups.includes(unitSekup);
                          return (
                            <label
                              key={unitSekup}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  const exists = newRoleForm.selectedUnitSekups.includes(unitSekup);
                                  setNewRoleForm({
                                    ...newRoleForm,
                                    selectedUnitSekups: exists
                                      ? newRoleForm.selectedUnitSekups.filter(u => u !== unitSekup)
                                      : [...newRoleForm.selectedUnitSekups, unitSekup]
                                  });
                                }}
                                className="rounded text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                              />
                              <span className="truncate">{unitSekup}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic pt-1">
                      Peran ini akan memiliki wewenang untuk melihat seluruh pekerja di semua unit kerja Divisi Produksi I tanpa pembatasan sekup.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Warna Badge / Label Peran</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {BADGE_COLOR_OPTIONS.map(opt => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setNewRoleForm({ ...newRoleForm, badgeColor: opt.value })}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border text-center transition-all ${opt.value} ${
                        newRoleForm.badgeColor === opt.value ? 'ring-2 ring-indigo-600 scale-102 shadow-xs' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkbox Khusus: Ringkasan Beban Upah */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1.5">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRoleForm.showWageSummary}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, showWageSummary: e.target.checked })}
                    className="mt-0.5 rounded text-amber-600 focus:ring-0 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-amber-950 block">
                      Tampilkan "Ringkasan Beban Upah Harian Periode Ini" di Dashboard
                    </span>
                    <span className="text-[11px] text-amber-800">
                      Beri tanda centang jika peran ini diizinkan melihat kartu total nominal pengeluaran upah pekerja harian.
                    </span>
                  </div>
                </label>
              </div>

              {/* Checklist Pilihan Modul Awal */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">
                    Modul yang Boleh Diakses ({newRoleForm.selectedTabs.length} Terpilih):
                  </label>
                  <div className="flex items-center gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setNewRoleForm({ ...newRoleForm, selectedTabs: ALL_AVAILABLE_TABS.map(t => t.id) })}
                      className="text-indigo-600 font-bold hover:underline"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setNewRoleForm({ ...newRoleForm, selectedTabs: [] })}
                      className="text-slate-500 font-bold hover:underline"
                    >
                      Kosongkan
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1 scrollbar-thin">
                  {ALL_AVAILABLE_TABS.map(tab => {
                    const isChecked = newRoleForm.selectedTabs.includes(tab.id);
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
                          onChange={() => {
                            const exists = newRoleForm.selectedTabs.includes(tab.id);
                            setNewRoleForm({
                              ...newRoleForm,
                              selectedTabs: exists
                                ? newRoleForm.selectedTabs.filter(t => t !== tab.id)
                                : [...newRoleForm.selectedTabs, tab.id]
                            });
                          }}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-xs">
                            <TabIcon className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                            <span className="truncate">{tab.label}</span>
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
                  onClick={() => setIsAddRoleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Simpan Peran Baru
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT DEFINISI PERAN */}
      {isEditRoleModalOpen && editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Edit Pengaturan Peran: <span className="text-blue-600">{editingRole.title}</span>
                  </h3>
                  <p className="text-xs text-slate-500">Sesuaikan nama judul, cakupan unit pekerja, modul &amp; otorisasi finansial</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsEditRoleModalOpen(false);
                  setEditingRole(null);
                }} 
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRole} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kode Peran (Sistem)</label>
                  <input
                    type="text"
                    disabled
                    value={editingRole.role}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-semibold cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400">Kode sistem unik (tidak dapat diubah)</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Judul Jabatan (Label Tampilan) *</label>
                  <input
                    type="text"
                    required
                    value={editRoleForm.title}
                    onChange={(e) => setEditRoleForm({ ...editRoleForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 font-semibold"
                  />
                  <span className="text-[10px] text-slate-400">Nama lengkap pada header tabel matriks</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Deskripsi / Subjudul Peran</label>
                <input
                  type="text"
                  value={editRoleForm.subtitle}
                  onChange={(e) => setEditRoleForm({ ...editRoleForm, subtitle: e.target.value })}
                  placeholder="Contoh: Supervisi Cengkeh & Blend"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Cakupan Unit Kerja (Multi-Unit Checklist) */}
              <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    Cakupan Unit Kerja Pekerja (Scope Data) *
                  </label>
                  <div className="flex items-center gap-3 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="editScopeType"
                        checked={editRoleForm.scopeType === 'ALL'}
                        onChange={() => setEditRoleForm({ ...editRoleForm, scopeType: 'ALL' })}
                        className="text-blue-600 focus:ring-0"
                      />
                      <span>Akses Penuh (Semua Unit / ALL)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="editScopeType"
                        checked={editRoleForm.scopeType === 'CUSTOM'}
                        onChange={() => setEditRoleForm({ ...editRoleForm, scopeType: 'CUSTOM' })}
                        className="text-blue-600 focus:ring-0"
                      />
                      <span>Pilih Unit Tertentu (Multi-Unit)</span>
                    </label>
                  </div>
                </div>

                {editRoleForm.scopeType === 'CUSTOM' ? (
                  <div className="space-y-2 pt-1 border-t border-slate-200/60 mt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">
                        Centang unit sekup yang dapat diakses oleh peran ini ({editRoleForm.selectedUnitSekups.length} dipilih):
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditRoleForm({ ...editRoleForm, selectedUnitSekups: [...ALL_UNIT_SEKUPS] })}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          Pilih Semua
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => setEditRoleForm({ ...editRoleForm, selectedUnitSekups: [] })}
                          className="text-slate-500 font-bold hover:underline"
                        >
                          Kosongkan
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {ALL_UNIT_SEKUPS.map(unitSekup => {
                        const isSelected = editRoleForm.selectedUnitSekups.includes(unitSekup);
                        return (
                          <label
                            key={unitSekup}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                const exists = editRoleForm.selectedUnitSekups.includes(unitSekup);
                                setEditRoleForm({
                                  ...editRoleForm,
                                  selectedUnitSekups: exists
                                    ? editRoleForm.selectedUnitSekups.filter(u => u !== unitSekup)
                                    : [...editRoleForm.selectedUnitSekups, unitSekup]
                                });
                              }}
                              className="rounded text-blue-600 focus:ring-0 w-3.5 h-3.5"
                            />
                            <span className="truncate">{unitSekup}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic pt-1">
                    Peran ini memiliki hak akses penuh ke seluruh pekerja di semua unit kerja Divisi Produksi I tanpa pembatasan sekup.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Warna Badge / Label Peran</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {BADGE_COLOR_OPTIONS.map(opt => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setEditRoleForm({ ...editRoleForm, badgeColor: opt.value })}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border text-center transition-all ${opt.value} ${
                        editRoleForm.badgeColor === opt.value ? 'ring-2 ring-blue-600 scale-102 shadow-xs' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkbox Khusus: Ringkasan Beban Upah */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1.5">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editRoleForm.showWageSummary}
                    onChange={(e) => setEditRoleForm({ ...editRoleForm, showWageSummary: e.target.checked })}
                    className="mt-0.5 rounded text-amber-600 focus:ring-0 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-amber-950 block">
                      Tampilkan "Ringkasan Beban Upah Harian Periode Ini" di Dashboard
                    </span>
                    <span className="text-[11px] text-amber-800">
                      Beri tanda centang jika peran ini diizinkan melihat kartu total nominal pengeluaran upah pekerja harian.
                    </span>
                  </div>
                </label>
              </div>

              {/* Checklist Pilihan Modul */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">
                    Modul yang Boleh Diakses ({editRoleForm.selectedTabs.length} Terpilih):
                  </label>
                  <div className="flex items-center gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setEditRoleForm({ ...editRoleForm, selectedTabs: ALL_AVAILABLE_TABS.map(t => t.id) })}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setEditRoleForm({ 
                        ...editRoleForm, 
                        selectedTabs: editingRole.role === 'Super Admin' ? ['hakakses'] : [] 
                      })}
                      className="text-slate-500 font-bold hover:underline"
                    >
                      Kosongkan
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1 scrollbar-thin">
                  {ALL_AVAILABLE_TABS.map(tab => {
                    const isChecked = editRoleForm.selectedTabs.includes(tab.id);
                    const TabIcon = tab.icon;

                    return (
                      <label
                        key={tab.id}
                        className={`flex items-start gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-blue-50/70 border-blue-300 text-blue-950 font-bold'
                            : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (editingRole.role === 'Super Admin' && tab.id === 'hakakses' && isChecked) {
                              showNotification('error', 'Modul Hak Akses untuk Super Admin tidak dapat dinonaktifkan.');
                              return;
                            }
                            const exists = editRoleForm.selectedTabs.includes(tab.id);
                            setEditRoleForm({
                              ...editRoleForm,
                              selectedTabs: exists
                                ? editRoleForm.selectedTabs.filter(t => t !== tab.id)
                                : [...editRoleForm.selectedTabs, tab.id]
                            });
                          }}
                          className="mt-0.5 rounded text-blue-600 focus:ring-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-xs">
                            <TabIcon className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                            <span className="truncate">{tab.label}</span>
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
                  onClick={() => {
                    setIsEditRoleModalOpen(false);
                    setEditingRole(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Simpan Perubahan Peran
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL PANDUAN INTEGRASI GOOGLE SHEET & CODE.GS */}
      {isShowGasGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800">
            
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    Panduan Sheet Khusus Login &amp; Skrip Apps Script
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Google Spreadsheet ID: {TARGET_SPREADSHEET_ID}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsShowGasGuideModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              
              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 space-y-1.5">
                <span className="font-bold text-blue-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-700" />
                  Mengapa Butuh Sheet Khusus Login?
                </span>
                <p className="text-blue-950 text-[11px] leading-relaxed">
                  Sebelumnya akun yang didaftarkan oleh Administrator hanya tersimpan pada browser laptop/PC Admin. Dengan sheet <strong>{USER_LOGIN_SHEET_NAME}</strong>, setiap akun otomatis tersimpan di Cloud Google Sheets sehingga staf dapat langsung login dari <strong>Handphone (Android/iOS), Tablet, dan Laptop manapun tanpa kendala</strong>.
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-800 text-xs">
                  Cara Kerja &amp; Struktur Kolom Sheet `{USER_LOGIN_SHEET_NAME}`:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="font-bold block text-slate-900 mb-0.5">Kolom A: No</span>
                    <span className="text-slate-500">Nomor urut akun staf</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="font-bold block text-slate-900 mb-0.5">Kolom B: Email / Username</span>
                    <span className="text-slate-500">Kunci login staf (misal: indahnurmala189@gmail.com)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="font-bold block text-slate-900 mb-0.5">Kolom C: Kata Sandi / PIN</span>
                    <span className="text-slate-500">Kata sandi akun (misal: mandor)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="font-bold block text-slate-900 mb-0.5">Kolom D: Nama Pengguna</span>
                    <span className="text-slate-500">Nama lengkap staf</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="font-bold block text-slate-900 mb-0.5">Kolom E: Peran (Role)</span>
                    <span className="text-slate-500">Jabatan peranan dalam sistem</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="font-bold block text-slate-900 mb-0.5">Kolom F &amp; G: Scope &amp; Unit</span>
                    <span className="text-slate-500">Cakupan unit kerja pekerja</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="font-bold block text-slate-900 mb-0.5">Kolom H: Modul Diizinkan</span>
                    <span className="text-slate-500">Daftar tab modul yang boleh dibuka</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="font-bold block text-slate-900 mb-0.5">Kolom I &amp; J: Status &amp; Waktu</span>
                    <span className="text-slate-500">Status "Aktif" &amp; timestamp sinkronisasi</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                <span className="font-bold text-emerald-900 block text-xs">
                  🚀 Langkah Aktivasi Cepat:
                </span>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-emerald-950">
                  <li>Klik tombol <strong>"Siapkan Sheet"</strong> di atas. Sistem akan mengirim sinyal otomatis ke Apps Script untuk membuat sheet `{USER_LOGIN_SHEET_NAME}`.</li>
                  <li>Jika Anda memperbarui skrip Apps Script, salin skrip di bawah lalu tempelkan ke <strong>Extensions &gt; Apps Script (Code.gs)</strong> di Google Spreadsheet.</li>
                  <li>Klik <strong>Deploy &gt; Manage Deployments &gt; Edit &gt; New Version &gt; Deploy</strong> di Google Apps Script.</li>
                  <li>Setelah itu, klik tombol <strong>"Sinkronkan ke Sheet"</strong> di atas untuk mem-push seluruh akun saat ini ke Google Spreadsheet.</li>
                </ol>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">
                    Kode Lengkap Google Apps Script (Code.gs):
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(GAS_CODE_TEMPLATE);
                      setGasCodeCopied(true);
                      setTimeout(() => setGasCodeCopied(false), 2000);
                    }}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {gasCodeCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{gasCodeCopied ? 'Tersalin!' : 'Salin Kode'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[10px] max-h-48 overflow-y-auto leading-relaxed">
                  {GAS_CODE_TEMPLATE}
                </pre>
              </div>

            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsShowGasGuideModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                Tutup Panduan
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
