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
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon']
  },
  {
    email: 'admin@batukarang.com',
    password: 'admin',
    nama: 'Super Administrator',
    role: 'Super Admin',
    scope: 'ALL',
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon']
  },
  {
    email: 'hr@batukarang.com',
    password: 'hr123',
    nama: 'Admin HR Divisi PP1',
    role: 'HR Admin',
    scope: 'ALL',
    allowedTabs: ['dashboard', 'presensi', 'lembur', 'rekap', 'slip', 'database', 'jadwalmutasi', 'profil', 'calon']
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

export const authService = {
  // Mendapatkan sesi login aktif (TIDAK ADA auto-login fallback)
  getCurrentUser: (): AuthUser | null => {
    try {
      const data = sessionStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(AUTH_STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data) as AuthUser;
    } catch {
      return null;
    }
  },

  // Login Internal (Staff, HR, Mandor, Developer)
  loginInternal: (email: string, password: string): { success: boolean; user?: AuthUser; message?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const account = WHITELIST_INTERNAL.find(acc => acc.email.toLowerCase() === cleanEmail);

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
