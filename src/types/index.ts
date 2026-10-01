export type UserRole = 
  | 'Super Admin'
  | 'Project Manager'
  | 'Foreman / Mandor'
  | 'Site Engineer'
  | 'Admin HR'
  | 'Staff Lapangan';

export type UserScope = string; // 'ALL' for Manajer Operasional or 'Sekup Unit' e.g. 'Proses Cengkeh'

export type PosLiniPHL = 
  | 'Sortir Gagang Cengkeh'
  | 'Grading Krosok'
  | 'Stacking Karung'
  | 'Kebersihan Area';

export type StatusKehadiran = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' | 'Libur';

export type ShiftType = 'Shift 1 (Pagi 07:00-15:00)' | 'Shift 2 (Sore 15:00-23:00)' | 'Shift 3 (Malam 23:00-07:00)' | 'Non-Shift (Office 08:00-16:00)';

export interface JamKerjaConfig {
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  istirahatMulai: string;
  istirahatSelesai: string;
  durasiKerjaMenit: number;
}

export interface PekerjaPHL {
  id: string;
  nip: string;
  nama: string;
  ktp: string;
  domisili: string;
  kontakDarurat: string;
  posLini: PosLiniPHL;
  tanggalBergabung: string;
  statusAktif: boolean;
  avatarUrl?: string;
  rekeningBank?: string;
}

export interface PresensiPHLRecord {
  id: string;
  pekerjaId: string;
  nip: string;
  nama: string;
  posLini: PosLiniPHL;
  tanggal: string;
  status: StatusKehadiran;
  jamMasuk?: string;
  jamPulang?: string;
  mandorPencatat: string;
  catatan?: string;
}

export interface OutputBoronganRecord {
  id: string;
  pekerjaId: string;
  nip: string;
  nama: string;
  posLini: PosLiniPHL;
  tanggal: string;
  satuan: 'Kg' | 'Karung' | 'Hari';
  volume: number;
  tarifPerSatuan: number;
  totalUpah: number;
  mandorVerifikator: string;
  catatanKualitas?: string;
  statusVerifikasi: 'Terverifikasi' | 'Menunggu';
}

export interface StaffPP1 {
  id: string;
  nip: string;
  nama: string;
  jabatan: 'Manajer Operasional' | 'Foreman / Mandor' | 'Teknisi Mesin' | 'Admin Lab QC' | 'Operator Senior' | 'Supervisor K3';
  divisi: string;
  telepon: string;
  email: string;
  tanggalBergabung: string;
  status: 'Tetap' | 'Kontrak';
  shiftDefault: ShiftType;
  sisaCuti: number;
  avatarUrl?: string;
}

export interface PresensiStaffRecord {
  id: string;
  staffId: string;
  nip: string;
  nama: string;
  jabatan: string;
  tanggal: string;
  shift: ShiftType;
  jamMasuk: string;
  jamPulang?: string;
  latitude: number;
  longitude: number;
  jarakMeter: number;
  isWithinGeofence: boolean;
  status: StatusKehadiran;
  tipePresensi: 'GPS Geofence' | 'Manual Bypass' | 'QR Scanner';
  catatan?: string;
}

export interface ShiftSchedule {
  id: string;
  staffId: string;
  nip: string;
  nama: string;
  jabatan: string;
  regu: 'Regu A' | 'Regu B' | 'Regu C' | 'Staf Khusus';
  tanggal: string;
  shift: ShiftType;
  liniMesin: 'Lini 1 Sortir' | 'Lini 2 Rotary' | 'Lini 3 Destem' | 'Lini 4 Silo Blend' | 'Maintenance General';
}

export interface PengajuanLembur {
  id: string;
  staffId: string;
  nip: string;
  nama: string;
  jabatan: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  totalJam: number;
  keperluan: 'Maintenance Mesin Darurat' | 'Kejar Target Tonase Blend' | 'Overhaul Rotary Tembakau' | 'QC Uji Laboratorium' | 'Lainnya';
  uraianPekerjaan: string;
  status: 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak';
  disetujuiOleh?: string;
  alasanPenolakan?: string;
  tanggalDiajukan: string;
}

export interface PengajuanCuti {
  id: string;
  staffId: string;
  nip: string;
  nama: string;
  jabatan: string;
  tipeCuti: 'Cuti Tahunan' | 'Cuti Sakit' | 'Cuti Melahirkan' | 'Izin Khusus / Takziah';
  tanggalMulai: string;
  tanggalSelesai: string;
  jumlahHari: number;
  keterangan: string;
  status: 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak';
  disetujuiOleh?: string;
  tanggalDiajukan: string;
}

export interface KpiScoring {
  id: string;
  staffId: string;
  nip: string;
  nama: string;
  jabatan: string;
  periodeBulan: string;
  skorDisiplin: number;
  skorRendemen: number;
  skorK3: number;
  skorInisiatif: number;
  skorAkhir: number;
  grade: 'A' | 'B' | 'C' | 'D';
  rekomendasiInsentif: 'Insentif Penuh (Level 1)' | 'Insentif Standar (Level 2)' | 'Tanpa Insentif' | 'Evaluasi Khusus';
  catatanEvaluator: string;
  evaluator: string;
}

export interface SwitchBoardApp {
  id: string;
  nomor: number;
  nama: string;
  kategori: 'Supply Chain' | 'Operasional & Mesin' | 'Administrasi' | 'Kemitraan';
  deskripsi: string;
  url?: string;
  isExternal: boolean;
  isCurrentApp?: boolean;
  statusBadge: 'Live Vercel' | 'Aktif' | 'Maintenance' | 'Roadmap';
}

// -------------------------------------------------------------
// HR PEKERJA HARIAN (LIVE GAS MODELS)
// -------------------------------------------------------------

export interface PekerjaData {
  rowNum: number;
  id: number | string;
  nama: string;
  unit: string;
  sekup: string;
  unitSekup: string;
  jabatan: string;
  status: string;
  awalPKWT: string;
  akhirPKWT: string;
  statusPKWT: string;
  upahHarian: number;
  pendidikanTerakhir?: string;
  sisaHariPKWT?: number;
  alertPKWT?: boolean;
}

export interface PresensiIjinRecord {
  rowNum: number;
  tanggal: string;
  tanggalIso?: string;
  nama: string;
  unit: string;
  sekup: string;
  jamAwal: string;
  jamAkhir: string;
  durasiMenit: number | string;
  jenisIjin: string;
  keperluan: string;
  lampiran: string;
  catatan: string;
  faktorPotongan: number | string;
}

export interface LemburRecord {
  rowNum: number;
  tanggal: string;
  nama: string;
  unit?: string;
  sekup?: string;
  kategori: string;
  jamMulai: string;
  jamSelesai: string;
  jmlJam: number | string;
  nominal: number;
}

export interface SlipUpahData {
  nama: string;
  periode: string;
  unit: string;
  sekup: string;
  upahHarian: number | string;
  hariKerjaTersedia: number;
  hariTidakDibayar: number;
  hariDibayar: number;
  upahPokok: number | string;
  totalLembur: number | string;
  totalDiterima: number | string;
}

export interface JadwalMutasiRecord {
  rowNum: number;
  tanggalEfektif: string;
  nama: string;
  jenisMutasi: string;
  nilaiLama: string;
  nilaiBaru: string;
  keterangan: string;
  diinputOleh: string;
}

export interface CalonPekerjaRecord {
  rowNum: number;
  nama: string;
  unit: string;
  sekup: string;
  tanggalMulai: string;
  tanggalAkhir: string;
  durasi: number | string;
  sisaHari: number | string;
  status: string;
  jumlahPerpanjangan: number | string;
  catatan: string;
  alert?: boolean;
}

export interface LinkArsipRecord {
  row: number;
  label: string;
  url: string;
}

export interface SuratIjinData {
  nama: string;
  jabatan: string;
  divisi: string;
  unit: string;
  checkbox: string;
  hari: string;
  hariAkhir?: string;
  tanggal: string;
  tanggalAkhir?: string;
  keperluan: string;
  jamMasuk: string;
  jamKeluar: string;
  jamMasukKembali: string;
  jamBagian: number;
  menitBagian: number;
  tglCetak: string;
  thnCetak: string;
  namaTtd: string;
}

export interface JamKerjaItem {
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  istirahatMulai: string;
  istirahatSelesai: string;
  durasiKerjaMenit: number;
}

export interface GasConfig {
  webAppUrl: string;
  sheetId: string;
  isAutoSyncEnabled: boolean;
  lastSyncTimestamp: string | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
}

export type MainTabType = 
  | 'presensi'
  | 'lembur'
  | 'rekap'
  | 'slip'
  | 'database'
  | 'jadwalmutasi'
  | 'profil'
  | 'calon'
  | 'dashboard';
