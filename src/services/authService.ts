import { MainTabType, PekerjaData } from '../types';
import { gasClient } from './gasClient';

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

export const ALL_UNIT_SEKUPS = [
  'Proses Cengkeh',
  'Persediaan Cengkeh',
  'Proses Tembakau',
  'Persediaan Tembakau',
  'Proses Krosok',
  'Persediaan Krosok',
  'Proses Blend',
  'Persediaan Blend'
];

export interface RoleDefinition {
  role: UserAccessRole;
  title: string;
  subtitle: string;
  scopeDesc: string;
  badgeColor: string;
  isCustom?: boolean;
  allowedUnitSekups?: string[]; // e.g. ['ALL'] or specific items from ALL_UNIT_SEKUPS
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
  'Kepala Pengolahan 2': ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon'],
  'Kepala Pengolahan 1': ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon'],
  'Kepala Gudang Tembakau & Krosok': ['dashboard', 'presensi', 'lembur', 'rekap', 'database', 'profil'],
  'Mandor Proses Cengkeh': ['dashboard', 'presensi', 'lembur', 'rekap'],
  'Mandor Persediaan Cengkeh': ['dashboard', 'presensi', 'lembur', 'rekap'],
  'Mandor Proses Tembakau': ['dashboard', 'presensi', 'lembur', 'rekap'],
  'Mandor Proses Krosok': ['dashboard', 'presensi', 'lembur', 'rekap'],
  'Mandor Proses Blend': ['dashboard', 'presensi', 'lembur', 'rekap'],
  'Mandor Persediaan Blend': ['dashboard', 'presensi', 'lembur', 'rekap'],
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
  'Kepala Pengolahan 2': true,
  'Kepala Pengolahan 1': true,
  'Kepala Gudang Tembakau & Krosok': false,
  'Mandor Proses Cengkeh': false,
  'Mandor Persediaan Cengkeh': false,
  'Mandor Proses Tembakau': false,
  'Mandor Proses Krosok': false,
  'Mandor Proses Blend': false,
  'Mandor Persediaan Blend': false,
  'Foreman / Mandor': false,
  'Pekerja Harian': false
};

// Default role list definitions (11 Peran Utama + Admin & Pekerja)
export const DEFAULT_ROLE_DEFINITIONS: RoleDefinition[] = [
  { 
    role: 'Super Admin', 
    title: 'Developer / Super Admin', 
    subtitle: 'Lead Developer & Admin Sistem', 
    scopeDesc: 'Semua Unit (ALL)', 
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    allowedUnitSekups: ['ALL']
  },
  { 
    role: 'Project Manager', 
    title: 'Project Manager', 
    subtitle: 'Monitoring & Operasional Proyek', 
    scopeDesc: 'Semua Unit (ALL)', 
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    allowedUnitSekups: ['ALL']
  },
  { 
    role: 'Site Engineer', 
    title: 'Site Engineer', 
    subtitle: 'Pengawasan Teknis Lapangan', 
    scopeDesc: 'Semua Unit (ALL)', 
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    allowedUnitSekups: ['ALL']
  },
  { 
    role: 'HR Admin', 
    title: 'HR Admin', 
    subtitle: 'Administrasi Kepegawaian & PKWT', 
    scopeDesc: 'Semua Unit (ALL)', 
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    allowedUnitSekups: ['ALL']
  },
  { 
    role: 'Manajer Operasional', 
    title: 'Manajer Operasional', 
    subtitle: 'Rekap Total Upah & Operasional', 
    scopeDesc: 'Semua Unit (ALL)', 
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    allowedUnitSekups: ['ALL']
  },
  { 
    role: 'Kepala Pengolahan 2', 
    title: 'Kepala Pengolahan 2', 
    subtitle: 'Supervisi Cengkeh & Blend', 
    scopeDesc: 'Cengkeh & Blend', 
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    allowedUnitSekups: ['Proses Cengkeh', 'Persediaan Cengkeh', 'Proses Blend', 'Persediaan Blend', 'Cengkeh', 'Blend']
  },
  { 
    role: 'Kepala Pengolahan 1', 
    title: 'Kepala Pengolahan 1', 
    subtitle: 'Supervisi Tembakau & Krosok', 
    scopeDesc: 'Tembakau & Krosok', 
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    allowedUnitSekups: ['Proses Tembakau', 'Persediaan Tembakau', 'Proses Krosok', 'Persediaan Krosok', 'Tembakau', 'Krosok']
  },
  { 
    role: 'Kepala Gudang Tembakau & Krosok', 
    title: 'Kepala Gudang Tembakau & Krosok', 
    subtitle: 'Gudang Persediaan', 
    scopeDesc: 'Persediaan Tembakau & Krosok', 
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    allowedUnitSekups: ['Persediaan Tembakau', 'Persediaan Krosok', 'Tembakau', 'Krosok']
  },
  { 
    role: 'Mandor Proses Cengkeh', 
    title: 'Mandor Proses Cengkeh', 
    subtitle: 'Mandor Lapangan Unit Cengkeh', 
    scopeDesc: 'Proses Cengkeh', 
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    allowedUnitSekups: ['Proses Cengkeh', 'Persediaan Cengkeh', 'Cengkeh']
  },
  { 
    role: 'Mandor Persediaan Cengkeh', 
    title: 'Mandor Persediaan Cengkeh', 
    subtitle: 'Mandor Gudang Cengkeh', 
    scopeDesc: 'Persediaan Cengkeh', 
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    allowedUnitSekups: ['Persediaan Cengkeh']
  },
  { 
    role: 'Mandor Proses Tembakau', 
    title: 'Mandor Proses Tembakau', 
    subtitle: 'Mandor Lapangan Unit Tembakau', 
    scopeDesc: 'Proses Tembakau', 
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    allowedUnitSekups: ['Proses Tembakau']
  },
  { 
    role: 'Mandor Proses Krosok', 
    title: 'Mandor Proses Krosok', 
    subtitle: 'Mandor Lapangan Unit Krosok', 
    scopeDesc: 'Proses Krosok', 
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    allowedUnitSekups: ['Proses Krosok']
  },
  { 
    role: 'Mandor Proses Blend', 
    title: 'Mandor Proses Blend', 
    subtitle: 'Mandor Lapangan Unit Blend', 
    scopeDesc: 'Proses Blend', 
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    allowedUnitSekups: ['Proses Blend']
  },
  { 
    role: 'Mandor Persediaan Blend', 
    title: 'Mandor Persediaan Blend', 
    subtitle: 'Mandor Gudang Blend', 
    scopeDesc: 'Persediaan Blend', 
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    allowedUnitSekups: ['Persediaan Blend']
  },
  { 
    role: 'Foreman / Mandor', 
    title: 'Foreman / Mandor (Umum)', 
    subtitle: 'Mandor Lapangan Khusus Unit', 
    scopeDesc: 'Khusus Unit Terkait', 
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    allowedUnitSekups: ['Proses Cengkeh']
  },
  { 
    role: 'Pekerja Harian', 
    title: 'Pekerja Harian', 
    subtitle: 'Portal Karyawan Lapangan', 
    scopeDesc: 'Data Pribadi Mandiri', 
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    allowedUnitSekups: ['ALL']
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
    nama: 'Kepala Pengolahan 1',
    role: 'Kepala Pengolahan 1',
    scope: 'Tembakau & Krosok',
    units: ['Tembakau', 'Krosok'],
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon']
  },
  {
    email: 'gudang.tembakau@batukarang.com',
    password: 'gudang123',
    nama: 'Kepala Gudang Tembakau & Krosok',
    role: 'Kepala Gudang Tembakau & Krosok',
    scope: 'Persediaan Tembakau & Krosok',
    units: ['Tembakau', 'Krosok'],
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap', 'database', 'profil']
  },
  {
    email: 'unitcengkeh.pp1@gmail.com',
    password: 'mandorCKH153',
    nama: 'Mandor Unit Cengkeh',
    role: 'Foreman / Mandor',
    scope: 'Proses Cengkeh',
    units: ['Cengkeh'],
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap']
  },
  {
    email: 'indahnurmala189@gmail.com',
    password: 'mandor',
    nama: 'Mandor Proses Cengkeh (Plt. Ka)',
    role: 'Mandor Proses Cengkeh',
    scope: 'Proses Cengkeh & Persediaan Cengkeh',
    units: ['Proses Cengkeh', 'Persediaan Cengkeh'],
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap']
  },
  {
    email: 'mandor.pcengkeh@batukarang.com',
    password: 'mandor',
    nama: 'Mandor Proses Cengkeh',
    role: 'Mandor Proses Cengkeh',
    scope: 'Proses Cengkeh',
    units: ['Proses Cengkeh'],
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap']
  },
  {
    email: 'mandor.gcengkeh@batukarang.com',
    password: 'mandor',
    nama: 'Mandor Persediaan Cengkeh',
    role: 'Mandor Persediaan Cengkeh',
    scope: 'Persediaan Cengkeh',
    units: ['Cengkeh'],
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap']
  },
  {
    email: 'mandor.ptembakau@batukarang.com',
    password: 'mandor',
    nama: 'Mandor Proses Tembakau',
    role: 'Mandor Proses Tembakau',
    scope: 'Proses Tembakau',
    units: ['Tembakau'],
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap']
  },
  {
    email: 'mandor.pkrosok@batukarang.com',
    password: 'mandor',
    nama: 'Mandor Proses Krosok',
    role: 'Mandor Proses Krosok',
    scope: 'Proses Krosok',
    units: ['Krosok'],
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap']
  },
  {
    email: 'mandor.pblend@batukarang.com',
    password: 'mandor',
    nama: 'Mandor Proses Blend',
    role: 'Mandor Proses Blend',
    scope: 'Proses Blend',
    units: ['Blend'],
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap']
  },
  {
    email: 'mandor.gblend@batukarang.com',
    password: 'mandor',
    nama: 'Mandor Persediaan Blend',
    role: 'Mandor Persediaan Blend',
    scope: 'Persediaan Blend',
    units: ['Blend'],
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap']
  },
  {
    email: 'mandor.cengkeh@batukarang.com',
    password: 'mandor',
    nama: 'Mandor Unit Cengkeh (Umum)',
    role: 'Foreman / Mandor',
    scope: 'Proses Cengkeh',
    units: ['Cengkeh'],
    allowedTabs: ['presensi', 'lembur', 'rekap', 'dashboard']
  },
  {
    email: 'mandor.tembakau@batukarang.com',
    password: 'mandor',
    nama: 'Mandor Unit Tembakau (Umum)',
    role: 'Foreman / Mandor',
    scope: 'Proses Tembakau',
    units: ['Tembakau'],
    allowedTabs: ['presensi', 'lembur', 'rekap', 'dashboard']
  },
  {
    email: 'mandor.blend@batukarang.com',
    password: 'mandor',
    nama: 'Mandor Unit Blend (Umum)',
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
          // Sinkronisasi dengan DEFAULT_ROLE_DEFINITIONS agar peran default baru selalu ada & memiliki allowedUnitSekups
          const merged: RoleDefinition[] = [...parsed];
          DEFAULT_ROLE_DEFINITIONS.forEach(def => {
            const existingIdx = merged.findIndex(r => r.role === def.role);
            if (existingIdx === -1) {
              merged.push(def);
            } else if (!merged[existingIdx].allowedUnitSekups || merged[existingIdx].allowedUnitSekups?.length === 0) {
              merged[existingIdx] = {
                ...merged[existingIdx],
                allowedUnitSekups: def.allowedUnitSekups,
                title: merged[existingIdx].title || def.title,
                subtitle: merged[existingIdx].subtitle || def.subtitle,
                scopeDesc: merged[existingIdx].scopeDesc || def.scopeDesc
              };
            }
          });
          return merged;
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

  // Mendapatkan daftar akun internal (dari localStorage jika ada, sinkronisasi dengan WHITELIST_INTERNAL)
  getInternalAccounts: (): InternalAccount[] => {
    try {
      const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sinkronisasi dengan WHITELIST_INTERNAL agar akun resmi (seperti unitcengkeh.pp1@gmail.com)
          // selalu tersedia di perangkat manapun bahkan jika browser memiliki cache lama
          const merged: InternalAccount[] = [...parsed];
          WHITELIST_INTERNAL.forEach(defAcc => {
            const existingIdx = merged.findIndex(acc => acc.email.toLowerCase().trim() === defAcc.email.toLowerCase().trim());
            if (existingIdx === -1) {
              merged.push(defAcc);
            }
          });
          return merged;
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
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
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
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      }
      return user;
    } catch {
      return null;
    }
  },

  // Login Internal (Pekerja, HR, Mandor, Developer)
  loginInternal: (identifier: string, password: string): { success: boolean; user?: AuthUser; message?: string } => {
    const rawIdentifier = (identifier || '').trim();
    const cleanQuery = rawIdentifier.toLowerCase();
    const cleanUsername = cleanQuery.includes('@') ? cleanQuery.split('@')[0] : cleanQuery;
    const cleanPassword = (password || '').trim();

    if (!cleanQuery) {
      return {
        success: false,
        message: 'Email atau Username wajib diisi untuk masuk ke sistem.'
      };
    }

    const accounts = authService.getInternalAccounts();
    
    // Cari akun berdasarkan email lengkap, username (sebelum @), atau nama lengkap
    let account = accounts.find(acc => {
      const accEmail = (acc.email || '').toLowerCase().trim();
      const accUsername = accEmail.includes('@') ? accEmail.split('@')[0] : accEmail;
      const accNama = (acc.nama || '').toLowerCase().trim();

      return accEmail === cleanQuery || 
             accUsername === cleanQuery || 
             accUsername === cleanUsername || 
             accNama === cleanQuery;
    });

    // Fallback otomatis jika akun Indah Nurmala atau Mandor Cengkeh belum tersimpan di cache browser lokal
    if (!account && (cleanQuery === 'indahnurmala189@gmail.com' || cleanQuery === 'indahnurmala189' || cleanUsername === 'indahnurmala189')) {
      account = {
        email: 'indahnurmala189@gmail.com',
        password: 'mandor',
        nama: 'Mandor Proses Cengkeh (Plt. Ka)',
        role: 'Mandor Proses Cengkeh',
        scope: 'Proses Cengkeh & Persediaan Cengkeh',
        units: ['Proses Cengkeh', 'Persediaan Cengkeh'],
        allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap']
      };
    } else if (!account && (cleanQuery === 'unitcengkeh.pp1@gmail.com' || cleanQuery === 'unitcengkeh.pp1' || cleanUsername === 'unitcengkeh.pp1')) {
      account = {
        email: 'unitcengkeh.pp1@gmail.com',
        password: 'mandorCKH153',
        nama: 'Mandor Unit Cengkeh',
        role: 'Foreman / Mandor',
        scope: 'Proses Cengkeh',
        units: ['Cengkeh'],
        allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap']
      };
    }

    if (!account) {
      return {
        success: false,
        message: `Akun "${rawIdentifier}" tidak ditemukan dalam sistem hak akses. Pastikan alamat email atau username sudah benar.`
      };
    }

    // Pengecekan kata sandi / PIN yang fleksibel dan toleran terhadap perangkat seluler:
    // 1. Cocok persis
    // 2. Cocok setelah pemangkasan spasi
    // 3. Cocok tanpa membedakan huruf besar/kecil (mencegah kegagalan auto-caps keyboard HP)
    // 4. PIN fallback universal per peranan jabatan agar staf tidak pernah terkunci
    const accPass = (account.password || '').trim();
    const isExactMatch = account.password === password || accPass === cleanPassword ||
      (cleanQuery.includes('indahnurmala189') && cleanPassword.toLowerCase() === 'mdrckh01');
    const isCaseInsensitiveMatch = accPass.toLowerCase() === cleanPassword.toLowerCase();

    const isMandorRole = account.role.toLowerCase().includes('mandor') || account.role.toLowerCase().includes('foreman');
    const isSuperAdmin = account.role === 'Super Admin' || account.email === 'appspengolahan@gmail.com';
    const isPM = account.role === 'Project Manager';
    const isEngineer = account.role === 'Site Engineer';
    const isHR = account.role === 'HR Admin';
    const isManajer = account.role === 'Manajer Operasional';
    const isKa = account.role.toLowerCase().includes('kepala');

    const matchesRoleFallback = 
      (isMandorRole && [
        'mandor', 'mandor123', 'mandorckh153', 'mdrckh01', 'cengkeh', 'cengkeh123', '12345678', '123456'
      ].includes(cleanPassword.toLowerCase())) ||
      (isSuperAdmin && ['admin', 'pp1dev', 'developer', '12345678'].includes(cleanPassword.toLowerCase())) ||
      (isPM && ['pm123', 'admin', '12345678'].includes(cleanPassword.toLowerCase())) ||
      (isEngineer && ['engineer123', 'admin', '12345678'].includes(cleanPassword.toLowerCase())) ||
      (isHR && ['hr123', 'admin', '12345678'].includes(cleanPassword.toLowerCase())) ||
      (isManajer && ['manajer123', 'admin', '12345678'].includes(cleanPassword.toLowerCase())) ||
      (isKa && ['ka1', 'ka2', 'gudang123', 'admin', '12345678'].includes(cleanPassword.toLowerCase()));

    const isPasswordValid = isExactMatch || isCaseInsensitiveMatch || matchesRoleFallback;

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Kata sandi / PIN salah. Periksa huruf besar/kecil atau gunakan PIN default peranan Anda.'
      };
    }

    const authUser: AuthUser = {
      id: account.email || cleanQuery,
      nama: account.nama,
      email: account.email,
      role: account.role,
      scope: account.scope,
      units: account.units,
      allowedTabs: account.allowedTabs
    };

    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    return { success: true, user: authUser };
  },

  // Sinkronisasi data akun dari Google Sheets (CONFIG_USER_LOGIN) ke penyimpanan lokal
  syncFromCloud: async (): Promise<InternalAccount[]> => {
    try {
      const res = await gasClient.getUserLogins();
      if (res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
        const cloudAccounts: InternalAccount[] = res.data.map(item => ({
          email: String(item.email || '').trim().toLowerCase(),
          password: String(item.password || '').trim(),
          nama: String(item.nama || item.email || '').trim(),
          role: item.role || 'Foreman / Mandor',
          scope: item.scope || 'ALL',
          units: Array.isArray(item.units) ? item.units : [item.scope || 'ALL'],
          allowedTabs: Array.isArray(item.allowedTabs) ? item.allowedTabs : ['dashboard', 'presensi', 'lembur', 'rekap']
        }));

        const merged: InternalAccount[] = [...cloudAccounts];
        WHITELIST_INTERNAL.forEach(defAcc => {
          const idx = merged.findIndex(a => a.email.toLowerCase().trim() === defAcc.email.toLowerCase().trim());
          if (idx === -1) {
            merged.push(defAcc);
          }
        });

        authService.saveInternalAccounts(merged);
        return merged;
      }
    } catch (e) {
      console.warn('Sync accounts from cloud failed/offline:', e);
    }
    return authService.getInternalAccounts();
  },

  // Login Internal Asinkron (Cek lokal terlebih dahulu, jika gagal otomatis fetch dari Cloud Google Sheets)
  loginInternalAsync: async (identifier: string, password: string): Promise<{ success: boolean; user?: AuthUser; message?: string }> => {
    const localRes = authService.loginInternal(identifier, password);
    if (localRes.success) {
      return localRes;
    }

    try {
      await authService.syncFromCloud();
      const retryRes = authService.loginInternal(identifier, password);
      if (retryRes.success) {
        return retryRes;
      }
      return retryRes;
    } catch {
      // ignore
    }

    return localRes;
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

// Helper untuk memeriksa kecocokan pekerja dengan token cakupan unit (mendukung kombinasi &, koma, nama unit, maupun sekup)
export function isWorkerMatchingScopeToken(worker: PekerjaData, token: string): boolean {
  const t = (token || '').trim().toLowerCase();
  if (!t || t === 'all') return true;

  // Jika token berupa gabungan multi-unit (misal 'Proses Cengkeh & Persediaan Cengkeh' atau 'Cengkeh & Blend')
  if (t.includes('&') || t.includes(',')) {
    const parts = t.split(/[&,]/).map(p => p.trim()).filter(Boolean);
    return parts.some(part => isWorkerMatchingScopeToken(worker, part));
  }

  const wUnit = (worker.unit || '').trim().toLowerCase();
  const wSekup = (worker.sekup || '').trim().toLowerCase();
  const wUnitSekup = (worker.unitSekup || `${worker.sekup || ''} ${worker.unit || ''}`).trim().toLowerCase();

  // 1. Kecocokan persis pada unitSekup atau unit
  if (wUnitSekup === t || wUnit === t) return true;

  // 2. Kecocokan nama unit (misal token 'cengkeh' cocok dengan worker unit 'Cengkeh')
  if (wUnit && (t === wUnit || t.includes(wUnit))) {
    // Jika token secara spesifik menyebut 'proses' atau 'persediaan', pastikan sekup cocok
    if (t.includes('proses') && !wUnitSekup.includes('proses') && !wSekup.includes('proses')) {
      return false;
    }
    if (t.includes('persediaan') && !wUnitSekup.includes('persediaan') && !wSekup.includes('persediaan')) {
      return false;
    }
    return true;
  }

  // 3. Kecocokan substring
  if (wUnitSekup.includes(t) || t.includes(wUnitSekup)) {
    return true;
  }

  return false;
}

// Helper untuk validasi apakah pekerja berada dalam lingkup hak akses pengguna (Mendukung Multi-Unit Dinamis)
export function isWorkerInUserScope(
  worker: PekerjaData, 
  user: AuthUser | null, 
  activeScopeFilter = 'ALL'
): boolean {
  if (!user) return true;

  // 1. Tingkat Pekerja Harian: hanya dapat melihat data dirinya sendiri
  if (user.role === 'Pekerja Harian') {
    if (user.workerRecord) {
      return (
        String(worker.id) === String(user.workerRecord.id) ||
        worker.nama.trim().toUpperCase() === user.workerRecord.nama.trim().toUpperCase()
      );
    }
    if (user.nama) {
      return worker.nama.trim().toUpperCase() === user.nama.trim().toUpperCase();
    }
    return false;
  }

  // 2. Cek apakah pengguna memiliki wewenang akses penuh (Super Admin, PM, Site Engineer, HR Admin, Manajer Operasional)
  const isSuperOrFullAccess = 
    user.role === 'Super Admin' ||
    user.scope === 'ALL' ||
    ['project manager', 'site engineer', 'hr admin', 'manajer operasional'].includes(user.role.toLowerCase());

  // 3. Tentukan daftar token wewenang unit untuk akun user ini
  let userAuthorizedTokens: string[] = [];

  if (isSuperOrFullAccess) {
    userAuthorizedTokens = ['ALL'];
  } else {
    // Kumpulkan dari user.units, user.scope, dan konfigurasi role definition
    if (user.units && Array.isArray(user.units) && user.units.length > 0) {
      userAuthorizedTokens.push(...user.units);
    }
    if (user.scope && user.scope !== 'ALL') {
      userAuthorizedTokens.push(user.scope);
    }
    const roleDefs = authService.getRoleDefinitions();
    const roleDef = roleDefs.find(r => r.role.toLowerCase() === user.role.toLowerCase());
    if (roleDef?.allowedUnitSekups && Array.isArray(roleDef.allowedUnitSekups)) {
      userAuthorizedTokens.push(...roleDef.allowedUnitSekups);
    }
    if (userAuthorizedTokens.length === 0) {
      userAuthorizedTokens = ['ALL'];
    }
  }

  // Cek apakah worker berada dalam cakupan wewenang akun pengguna
  const isAuthorizedForUser = userAuthorizedTokens.some(token => 
    token === 'ALL' || isWorkerMatchingScopeToken(worker, token)
  );

  if (!isAuthorizedForUser) {
    return false;
  }

  // 4. Evaluasi filter sekup aktif (activeScopeFilter)
  const filter = (activeScopeFilter || 'ALL').trim();

  // Jika filter adalah 'ALL', tampilkan semua pekerja yang diizinkan untuk peran ini
  if (filter === 'ALL') {
    return true;
  }

  // Jika activeScopeFilter sama persis dengan user.scope (misalnya 'Proses Cengkeh & Persediaan Cengkeh'),
  // maka pengguna sedang melihat seluruh lingkup tugas perannya -> loloskan!
  if (user.scope && filter.toLowerCase() === user.scope.trim().toLowerCase()) {
    return true;
  }

  // Jika filter adalah sub-cakupan spesifik (misalnya pengguna memfilter ke 'Proses Cengkeh' saja)
  return isWorkerMatchingScopeToken(worker, filter);
}

// Helper untuk mendapatkan unit-sekup yang diizinkan bagi pengguna aktif
export function getUserAuthorizedUnitSekups(user: AuthUser | null): string[] {
  if (!user) return ['ALL', ...ALL_UNIT_SEKUPS];
  if (user.role === 'Super Admin' || ['project manager', 'site engineer', 'hr admin', 'manajer operasional'].includes(user.role.toLowerCase())) {
    return ['ALL', ...ALL_UNIT_SEKUPS];
  }

  const result: string[] = [];

  // Tambahkan cakupan gabungan utama peran jika multi-unit (misal 'Proses Cengkeh & Persediaan Cengkeh')
  if (user.scope && user.scope !== 'ALL') {
    result.push(user.scope);
  }

  // Tambahkan unit-unit spesifik akun pengguna
  if (user.units && Array.isArray(user.units) && user.units.length > 0) {
    if (user.units.includes('ALL')) {
      return ['ALL', ...ALL_UNIT_SEKUPS];
    }
    user.units.forEach(u => {
      if (ALL_UNIT_SEKUPS.includes(u)) {
        if (!result.includes(u)) result.push(u);
      } else {
        const matches = ALL_UNIT_SEKUPS.filter(s => s.toLowerCase().includes(u.toLowerCase()));
        if (matches.length > 0) {
          matches.forEach(m => { if (!result.includes(m)) result.push(m); });
        } else {
          if (!result.includes(u)) result.push(u);
        }
      }
    });
  }

  // Tambahkan definisi peran
  const roleDefs = authService.getRoleDefinitions();
  const roleDef = roleDefs.find(r => r.role.toLowerCase() === user.role.toLowerCase());
  if (roleDef?.allowedUnitSekups && Array.isArray(roleDef.allowedUnitSekups)) {
    if (roleDef.allowedUnitSekups.includes('ALL')) {
      return ['ALL', ...ALL_UNIT_SEKUPS];
    }
    roleDef.allowedUnitSekups.forEach(u => {
      if (!result.includes(u)) result.push(u);
    });
  }

  if (result.length === 0) {
    return ['ALL', ...ALL_UNIT_SEKUPS];
  }

  return result;
}
