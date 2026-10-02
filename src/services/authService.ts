import { MainTabType, PekerjaData } from '../types';

export type UserAccessRole = 
  | 'Super Admin' 
  | 'HR Admin' 
  | 'Manajer Operasional' 
  | 'Foreman / Mandor' 
  | 'Pekerja Harian';

export interface AuthUser {
  id: string;
  nama: string;
  email?: string;
  role: UserAccessRole;
  scope: string; // 'ALL' or 'Proses Cengkeh' etc.
  allowedTabs: MainTabType[];
  workerRecord?: PekerjaData;
}

export interface InternalAccount {
  email: string;
  password: string;
  nama: string;
  role: UserAccessRole;
  scope: string;
  allowedTabs: MainTabType[];
}

// Whitelist Akun Internal PP1
export const WHITELIST_INTERNAL: InternalAccount[] = [
  {
    email: 'appspengolahan@gmail.com',
    password: 'admin',
    nama: 'Lalu Mahendra (Lead Developer)',
    role: 'Super Admin',
    scope: 'ALL',
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon', 'hakakses']
  },
  {
    email: 'admin@batukarang.com',
    password: 'admin',
    nama: 'Super Administrator',
    role: 'Super Admin',
    scope: 'ALL',
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon', 'hakakses']
  },
  {
    email: 'hr@batukarang.com',
    password: 'hr123',
    nama: 'Admin HR Divisi PP1',
    role: 'HR Admin',
    scope: 'ALL',
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon', 'hakakses']
  },
  {
    email: 'manajer@batukarang.com',
    password: 'manajer123',
    nama: 'Manajer Operasional PP1',
    role: 'Manajer Operasional',
    scope: 'ALL',
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon']
  },
  {
    email: 'mandor.cengkeh@batukarang.com',
    password: 'mandor',
    nama: 'Mandor Unit Cengkeh',
    role: 'Foreman / Mandor',
    scope: 'Proses Cengkeh',
    allowedTabs: ['presensi', 'lembur', 'rekap', 'dashboard']
  },
  {
    email: 'mandor.tembakau@batukarang.com',
    password: 'mandor',
    nama: 'Mandor Unit Tembakau',
    role: 'Foreman / Mandor',
    scope: 'Proses Tembakau',
    allowedTabs: ['presensi', 'lembur', 'rekap', 'dashboard']
  },
  {
    email: 'mandor.blend@batukarang.com',
    password: 'mandor',
    nama: 'Mandor Unit Blend',
    role: 'Foreman / Mandor',
    scope: 'Proses Blend',
    allowedTabs: ['presensi', 'lembur', 'rekap', 'dashboard']
  }
];

const AUTH_STORAGE_KEY = 'bk_pp1_auth_session';
const ACCOUNTS_STORAGE_KEY = 'bk_pp1_internal_accounts';

export const authService = {
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
      allowedTabs: ['slip', 'profil'],
      workerRecord: worker
    };

    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    return { success: true, user: authUser };
  },

  // Logout / Keluar
  logout: (): void => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};
