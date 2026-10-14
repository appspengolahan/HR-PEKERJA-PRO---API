import { MainTabType, PekerjaData } from '../types';

export type UserAccessRole = string;

export interface AuthUser {
  id: string;
  nama: string;
  email?: string;
  role: UserAccessRole;
  scope: string; // 'ALL' or 'Cengkeh & Blend' or 'Proses Cengkeh'
  units?: string[]; // Array of unit names for multi-unit assignment (e.g. ['Cengkeh', 'Blend'])
  allowedTabs: MainTabType[];
  workerRecord?: PekerjaData;
  isSimulated?: boolean;
  originalUser?: AuthUser;
}

export interface InternalAccount {
  email: string;
  password: string;
  nama: string;
  role: UserAccessRole;
  scope: string;
  units?: string[];
  allowedTabs: MainTabType[];
}

export interface RoleDefinition {
  role: UserAccessRole;
  title: string;
  subtitle: string;
  scopeDesc: string;
  badgeColor: string;
  isCustom?: boolean;
}

export type RoleMatrix = Record<UserAccessRole, MainTabType[]>;

// Konfigurasi apakah Ringkasan Beban Upah ditampilkan per peran
export type WageSummaryRoleConfig = Record<UserAccessRole, boolean>;

// Matriks Default Hak Akses Modul per Peran
export const DEFAULT_ROLE_MATRIX: RoleMatrix = {
  'Super Admin': ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon', 'hakakses'],
  'Project Manager': ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon', 'hakakses'],
  'Site Engineer': ['dashboard', 'presensi', 'lembur', 'rekap', 'database', 'jadwalmutasi', 'profil', 'hakakses'],
  'HR Admin': ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon', 'hakakses'],
  'Manajer Operasional': ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon'],
  'Kepala Pengolahan 1': ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon'],
  'Kepala Pengolahan 2': ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon'],
  'Foreman / Mandor': ['dashboard', 'presensi', 'lembur', 'rekap'],
  'Pekerja Harian': ['slip', 'profil']
};

// Default visibility 'Ringkasan Beban Upah Harian Periode Ini' per peran
export const DEFAULT_WAGE_SUMMARY_CONFIG: WageSummaryRoleConfig = {
  'Super Admin': true,
  'Project Manager': true,
  'Site Engineer': true,
  'HR Admin': true,
  'Manajer Operasional': true,
  'Kepala Pengolahan 1': true,
  'Kepala Pengolahan 2': true,
  'Foreman / Mandor': false,
  'Pekerja Harian': false
};

// Default role list definitions
export const DEFAULT_ROLE_DEFINITIONS: RoleDefinition[] = [
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

// Whitelist Akun Internal PP1
export const WHITELIST_INTERNAL: InternalAccount[] = [
  {
    email: 'appspengolahan@gmail.com',
    password: 'admin',
    nama: 'Lalu Mahendra (Lead Developer)',
    role: 'Super Admin',
    scope: 'ALL',
    units: ['Cengkeh', 'Blend', 'Tembakau', 'Krosok'],
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon', 'hakakses']
  },
  {
    email: 'pm@batukarang.com',
    password: 'pm123',
    nama: 'Project Manager (Monitoring Lapangan)',
    role: 'Project Manager',
    scope: 'ALL',
    units: ['Cengkeh', 'Blend', 'Tembakau', 'Krosok'],
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon', 'hakakses']
  },
  {
    email: 'engineer@batukarang.com',
    password: 'engineer123',
    nama: 'Site Engineer PP1',
    role: 'Site Engineer',
    scope: 'ALL',
    units: ['Cengkeh', 'Blend', 'Tembakau', 'Krosok'],
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap', 'database', 'jadwalmutasi', 'profil', 'hakakses']
  },
  {
    email: 'admin@batukarang.com',
    password: 'admin',
    nama: 'Super Administrator',
    role: 'Super Admin',
    scope: 'ALL',
    units: ['Cengkeh', 'Blend', 'Tembakau', 'Krosok'],
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon', 'hakakses']
  },
  {
    email: 'hr@batukarang.com',
    password: 'hr123',
    nama: 'Admin HR Divisi PP1',
    role: 'HR Admin',
    scope: 'ALL',
    units: ['Cengkeh', 'Blend', 'Tembakau', 'Krosok'],
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon', 'hakakses']
  },
  {
    email: 'manajer@batukarang.com',
    password: 'manajer123',
    nama: 'Manajer Operasional PP1',
    role: 'Manajer Operasional',
    scope: 'ALL',
    units: ['Cengkeh', 'Blend', 'Tembakau', 'Krosok'],
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon']
  },
  {
    email: 'ka.pengolahan2@batukarang.com',
    password: 'ka2',
    nama: 'Kepala Pengolahan 2',
    role: 'Kepala Pengolahan 2',
    scope: 'Cengkeh & Blend',
    units: ['Cengkeh', 'Blend'],
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon']
  },
  {
    email: 'ka.pengolahan1@batukarang.com',
    password: 'ka1',
    nama: 'Kepala Pengolahan 1 (Lowong)',
    role: 'Kepala Pengolahan 1',
    scope: 'Tembakau & Krosok',
    units: ['Tembakau', 'Krosok'],
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon']
  },
  {
    email: 'mandor.cengkeh@batukarang.com',
    password: 'mandor',
    nama: 'Mandor Unit Cengkeh',
    role: 'Foreman / Mandor',
    scope: 'Proses Cengkeh',
    units: ['Cengkeh'],
    allowedTabs: ['presensi', 'lembur', 'rekap', 'dashboard']
  },
  {
    email: 'mandor.tembakau@batukarang.com',
    password: 'mandor',
    nama: 'Mandor Unit Tembakau',
    role: 'Foreman / Mandor',
    scope: 'Proses Tembakau',
    units: ['Tembakau'],
    allowedTabs: ['presensi', 'lembur', 'rekap', 'dashboard']
  },
  {
    email: 'mandor.blend@batukarang.com',
    password: 'mandor',
    nama: 'Mandor Unit Blend',
    role: 'Foreman / Mandor',
    scope: 'Proses Blend',
    units: ['Blend'],
    allowedTabs: ['presensi', 'lembur', 'rekap', 'dashboard']
  }
];

const AUTH_STORAGE_KEY = 'bk_pp1_auth_session';
const ACCOUNTS_STORAGE_KEY = 'bk_pp1_internal_accounts';
const ROLE_MATRIX_STORAGE_KEY = 'bk_pp1_role_permissions_matrix';
const ROLE_DEFINITIONS_STORAGE_KEY = 'bk_pp1_role_definitions_list';
const WAGE_SUMMARY_CONFIG_STORAGE_KEY = 'bk_pp1_wage_summary_visibility_per_role';

export const authService = {
  // Mendapatkan daftar peran terdaftar (bawaan + peran baru yang ditambahkan)
  getRoleDefinitions: (): RoleDefinition[] => {
    try {
      const raw = localStorage.getItem(ROLE_DEFINITIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_ROLE_DEFINITIONS;
  },

  // Menyimpan daftar definisi peran
  saveRoleDefinitions: (definitions: RoleDefinition[]): void => {
    localStorage.setItem(ROLE_DEFINITIONS_STORAGE_KEY, JSON.stringify(definitions));
  },

  // Reset daftar peran ke bawaan
  resetRoleDefinitions: (): RoleDefinition[] => {
    localStorage.removeItem(ROLE_DEFINITIONS_STORAGE_KEY);
    return DEFAULT_ROLE_DEFINITIONS;
  },

  // Mendapatkan konfigurasi visibilitas Ringkasan Beban Upah per peran
  getWageSummaryConfig: (): WageSummaryRoleConfig => {
    try {
      const raw = localStorage.getItem(WAGE_SUMMARY_CONFIG_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_WAGE_SUMMARY_CONFIG, ...parsed };
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_WAGE_SUMMARY_CONFIG;
  },

  // Menyimpan konfigurasi visibilitas Ringkasan Beban Upah per peran
  saveWageSummaryConfig: (config: WageSummaryRoleConfig): void => {
    localStorage.setItem(WAGE_SUMMARY_CONFIG_STORAGE_KEY, JSON.stringify(config));
  },

  // Memeriksa apakah suatu peran berhak melihat Ringkasan Beban Upah
  canRoleViewWageSummary: (roleName: string): boolean => {
    const config = authService.getWageSummaryConfig();
    if (roleName in config) {
      return Boolean(config[roleName]);
    }
    // Default fallback: Super Admin, HR, Manager true, others false
    return roleName.toLowerCase().includes('admin') || roleName.toLowerCase().includes('manajer');
  },

  // Mendapatkan daftar akun internal (dari localStorage jika ada, fallback ke WHITELIST_INTERNAL)
  getInternalAccounts: (): InternalAccount[] => {
    try {
      const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return WHITELIST_INTERNAL;
  },

  // Menyimpan daftar akun internal ke localStorage
  saveInternalAccounts: (accounts: InternalAccount[]): void => {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  },

  // Reset daftar akun ke bawaan pabrik
  resetToDefaultAccounts: (): InternalAccount[] => {
    localStorage.removeItem(ACCOUNTS_STORAGE_KEY);
    return WHITELIST_INTERNAL;
  },

  // Memperbarui sesi akun aktif jika data akunnya diubah
  updateCurrentUserSession: (updatedUser: AuthUser): void => {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
  },

  // Mendapatkan sesi login aktif (TIDAK ADA auto-login fallback)
  getCurrentUser: (): AuthUser | null => {
    try {
      const data = sessionStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(AUTH_STORAGE_KEY);
      if (!data) return null;
      const user = JSON.parse(data) as AuthUser;
      // Auto-migrate Super Admin & HR Admin to include 'hakakses' if missing
      if ((user.role === 'Super Admin' || user.role === 'HR Admin') && Array.isArray(user.allowedTabs) && !user.allowedTabs.includes('hakakses')) {
        user.allowedTabs.push('hakakses');
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      }
      return user;
    } catch {
      return null;
    }
  },

  // Login Internal (Staff, HR, Mandor, Developer)
  loginInternal: (email: string, password: string): { success: boolean; user?: AuthUser; message?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const accounts = authService.getInternalAccounts();
    const account = accounts.find(acc => acc.email.toLowerCase() === cleanEmail);

    if (!account) {
      return {
        success: false,
        message: 'Email tidak terdaftar dalam whitelist tim internal. Silakan hubungi HR/Administrator.'
      };
    }

    if (account.password !== password) {
      return {
        success: false,
        message: 'Kata sandi / PIN yang Anda masukkan salah.'
      };
    }

    const authUser: AuthUser = {
      id: cleanEmail,
      nama: account.nama,
      email: account.email,
      role: account.role,
      scope: account.scope,
      units: account.units,
      allowedTabs: account.allowedTabs
    };

    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    return { success: true, user: authUser };
  },

  // Login Pekerja Harian (Verifikasi Database Spreadsheet)
  loginPekerjaHarian: (
    namaPekerja: string, 
    idOrNip: string, 
    databasePekerja: PekerjaData[]
  ): { success: boolean; user?: AuthUser; message?: string } => {
    const cleanNama = namaPekerja.trim().toUpperCase();
    const cleanId = idOrNip.trim().replace('#', '');

    if (!cleanNama) {
      return { success: false, message: 'Nama lengkap pekerja wajib diisi.' };
    }

    // Cari di database master pekerja
    const worker = databasePekerja.find(p => {
      const matchNama = p.nama.trim().toUpperCase() === cleanNama;
      const matchId = cleanId ? String(p.id).trim() === cleanId : true;
      return matchNama && matchId;
    });

    if (!worker) {
      return {
        success: false,
        message: `Data pekerja "${namaPekerja}" ${cleanId ? `dengan ID #${cleanId}` : ''} tidak ditemukan di database resmi. Pastikan ejaan nama sesuai KTP.`
      };
    }

    // Hak akses pekerja terisolasi ketat: HANYA Slip Upah & Profil Saya
    const authUser: AuthUser = {
      id: String(worker.id),
      nama: worker.nama,
      role: 'Pekerja Harian',
      scope: worker.unitSekup || 'ALL',
      units: [worker.unit],
      allowedTabs: ['slip', 'profil'],
      workerRecord: worker
    };

    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    return { success: true, user: authUser };
  },

  // Mendapatkan matriks hak akses peran dinamis
  getRoleMatrix: (): RoleMatrix => {
    try {
      const raw = localStorage.getItem(ROLE_MATRIX_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_ROLE_MATRIX, ...parsed };
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_ROLE_MATRIX;
  },

  // Menyimpan matriks hak akses peran dinamis
  saveRoleMatrix: (matrix: RoleMatrix): void => {
    localStorage.setItem(ROLE_MATRIX_STORAGE_KEY, JSON.stringify(matrix));
  },

  // Reset matriks hak akses peran ke bawaan
  resetRoleMatrix: (): RoleMatrix => {
    localStorage.removeItem(ROLE_MATRIX_STORAGE_KEY);
    localStorage.removeItem(WAGE_SUMMARY_CONFIG_STORAGE_KEY);
    localStorage.removeItem(ROLE_DEFINITIONS_STORAGE_KEY);
    return DEFAULT_ROLE_MATRIX;
  },

  // Logout / Keluar
  logout: (): void => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};

// Helper untuk validasi apakah pekerja berada dalam lingkup hak akses pengguna (Mendukung Multi-Unit)
export function isWorkerInUserScope(
  worker: PekerjaData, 
  user: AuthUser | null, 
  activeScopeFilter = 'ALL'
): boolean {
  if (!user) return true;

  // Level Manajemen Puncak memiliki akses seluruh pekerja
  const isAllAccessRole = 
    user.role === 'Super Admin' || 
    user.role === 'Project Manager' || 
    user.role === 'HR Admin' || 
    user.role === 'Site Engineer' || 
    user.role === 'Manajer Operasional';

  if (isAllAccessRole) {
    if (activeScopeFilter && activeScopeFilter !== 'ALL') {
      return worker.unitSekup === activeScopeFilter || worker.unit === activeScopeFilter;
    }
    return true;
  }

  // Jika user memiliki penugasan multi-unit spesifik (misal Kepala Pengolahan 2: ['Cengkeh', 'Blend'])
  if (Array.isArray(user.units) && user.units.length > 0) {
    const unitMatch = user.units.includes(worker.unit);
    if (!unitMatch) return false;
    if (activeScopeFilter && activeScopeFilter !== 'ALL') {
      return worker.unitSekup === activeScopeFilter || worker.unit === activeScopeFilter;
    }
    return true;
  }

  // Fallback berdasarkan string scope akun
  if (user.scope && user.scope !== 'ALL') {
    if (user.scope.includes('&')) {
      const units = user.scope.split('&').map(u => u.trim().toLowerCase());
      return units.some(u => worker.unit.toLowerCase().includes(u));
    }
    return worker.unitSekup === user.scope || worker.unit === user.scope;
  }

  return true;
}
