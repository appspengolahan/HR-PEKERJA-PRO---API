import { 
  JamKerjaConfig, 
  PekerjaPHL, 
  StaffPP1, 
  PresensiPHLRecord, 
  OutputBoronganRecord, 
  PresensiStaffRecord, 
  ShiftSchedule, 
  PengajuanLembur, 
  PengajuanCuti, 
  KpiScoring, 
  GasConfig, 
  UserRole 
} from '../types';
import { 
  INITIAL_JAM_KERJA, 
  INITIAL_PEKERJA_PHL, 
  INITIAL_STAFF, 
  INITIAL_PRESENSI_PHL, 
  INITIAL_OUTPUT_BORONGAN, 
  INITIAL_PRESENSI_STAFF, 
  INITIAL_SHIFT_SCHEDULE, 
  INITIAL_LEMBUR, 
  INITIAL_CUTI, 
  INITIAL_KPI 
} from '../data/initialData';
import { DEFAULT_GAS_CONFIG } from './gasService';

const KEYS = {
  JAM_KERJA: 'bk_pp1_jam_kerja',
  PEKERJA_PHL: 'bk_pp1_pekerja_phl',
  STAFF: 'bk_pp1_staff',
  PRESENSI_PHL: 'bk_pp1_presensi_phl',
  OUTPUT_BORONGAN: 'bk_pp1_output_borongan',
  PRESENSI_STAFF: 'bk_pp1_presensi_staff',
  SHIFT_SCHEDULE: 'bk_pp1_shift_schedule',
  LEMBUR: 'bk_pp1_lembur',
  CUTI: 'bk_pp1_cuti',
  KPI: 'bk_pp1_kpi',
  GAS_CONFIG: 'bk_pp1_gas_config',
  USER_ROLE: 'bk_pp1_user_role',
  SIDEBAR_COLLAPSED: 'bk_pp1_sidebar_collapsed'
};

function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (e) {
    console.warn(`Error reading key ${key} from localStorage, using fallback:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving key ${key} to localStorage:`, e);
  }
}

export const storageService = {
  // Config Jam Kerja
  getJamKerja: (): JamKerjaConfig[] => getFromStorage(KEYS.JAM_KERJA, INITIAL_JAM_KERJA),
  saveJamKerja: (data: JamKerjaConfig[]) => saveToStorage(KEYS.JAM_KERJA, data),

  // Pekerja PHL
  getPekerjaPHL: (): PekerjaPHL[] => getFromStorage(KEYS.PEKERJA_PHL, INITIAL_PEKERJA_PHL),
  savePekerjaPHL: (data: PekerjaPHL[]) => saveToStorage(KEYS.PEKERJA_PHL, data),

  // Staff PP1
  getStaff: (): StaffPP1[] => getFromStorage(KEYS.STAFF, INITIAL_STAFF),
  saveStaff: (data: StaffPP1[]) => saveToStorage(KEYS.STAFF, data),

  // Presensi PHL
  getPresensiPHL: (): PresensiPHLRecord[] => getFromStorage(KEYS.PRESENSI_PHL, INITIAL_PRESENSI_PHL),
  savePresensiPHL: (data: PresensiPHLRecord[]) => saveToStorage(KEYS.PRESENSI_PHL, data),

  // Output Borongan
  getOutputBorongan: (): OutputBoronganRecord[] => getFromStorage(KEYS.OUTPUT_BORONGAN, INITIAL_OUTPUT_BORONGAN),
  saveOutputBorongan: (data: OutputBoronganRecord[]) => saveToStorage(KEYS.OUTPUT_BORONGAN, data),

  // Presensi Staff
  getPresensiStaff: (): PresensiStaffRecord[] => getFromStorage(KEYS.PRESENSI_STAFF, INITIAL_PRESENSI_STAFF),
  savePresensiStaff: (data: PresensiStaffRecord[]) => saveToStorage(KEYS.PRESENSI_STAFF, data),

  // Shift Schedules
  getShiftSchedules: (): ShiftSchedule[] => getFromStorage(KEYS.SHIFT_SCHEDULE, INITIAL_SHIFT_SCHEDULE),
  saveShiftSchedules: (data: ShiftSchedule[]) => saveToStorage(KEYS.SHIFT_SCHEDULE, data),

  // Lembur & Cuti
  getLembur: (): PengajuanLembur[] => getFromStorage(KEYS.LEMBUR, INITIAL_LEMBUR),
  saveLembur: (data: PengajuanLembur[]) => saveToStorage(KEYS.LEMBUR, data),

  getCuti: (): PengajuanCuti[] => getFromStorage(KEYS.CUTI, INITIAL_CUTI),
  saveCuti: (data: PengajuanCuti[]) => saveToStorage(KEYS.CUTI, data),

  // KPI Scoring
  getKpi: (): KpiScoring[] => getFromStorage(KEYS.KPI, INITIAL_KPI),
  saveKpi: (data: KpiScoring[]) => saveToStorage(KEYS.KPI, data),

  // GAS Config
  getGasConfig: (): GasConfig => getFromStorage(KEYS.GAS_CONFIG, DEFAULT_GAS_CONFIG),
  saveGasConfig: (data: GasConfig) => saveToStorage(KEYS.GAS_CONFIG, data),

  // User Role & Sidebar
  getUserRole: (): UserRole => getFromStorage(KEYS.USER_ROLE, 'Super Admin'),
  saveUserRole: (role: UserRole) => saveToStorage(KEYS.USER_ROLE, role),

  getSidebarCollapsed: (): boolean => getFromStorage(KEYS.SIDEBAR_COLLAPSED, false),
  saveSidebarCollapsed: (collapsed: boolean) => saveToStorage(KEYS.SIDEBAR_COLLAPSED, collapsed),

  // Reset to Factory Default
  resetAllData: () => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  },

  // Export full JSON backup
  exportDatabaseJSON: () => {
    const backup = {
      jamKerja: storageService.getJamKerja(),
      pekerjaPHL: storageService.getPekerjaPHL(),
      staff: storageService.getStaff(),
      presensiPHL: storageService.getPresensiPHL(),
      outputBorongan: storageService.getOutputBorongan(),
      presensiStaff: storageService.getPresensiStaff(),
      shiftSchedules: storageService.getShiftSchedules(),
      lembur: storageService.getLembur(),
      cuti: storageService.getCuti(),
      kpi: storageService.getKpi(),
      exportedAt: new Date().toISOString(),
      source: 'PT Batu Karang Divisi Produksi 1 (PP1) - HR Workspace OS'
    };
    return JSON.stringify(backup, null, 2);
  }
};
