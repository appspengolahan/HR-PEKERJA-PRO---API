/**
 * workHoursUtils.ts
 * Utilitas Resmi Jam Kerja & Jam Istirahat Divisi Produksi I
 * 
 * Standar Jam Kerja Resmi:
 * 1. Senin - Kamis:
 *    - Jam Kerja: 08:00 s/d 16:00 (480 menit bruto)
 *    - Jam Istirahat: 11:30 s/d 12:30 (60 menit)
 *    - Total Jam Kerja Efektif: 420 menit (7 jam)
 * 
 * 2. Jumat:
 *    - Jam Kerja: 08:00 s/d 16:30 (510 menit bruto)
 *    - Jam Istirahat: 11:00 s/d 12:30 (90 menit - Sholat Jumat & Istirahat)
 *    - Total Jam Kerja Efektif: 420 menit (7 jam)
 * 
 * 3. Sabtu:
 *    - Jam Kerja: 08:00 s/d 13:00 (300 menit bruto)
 *    - Jam Istirahat: Tanpa Istirahat
 *    - Total Jam Kerja Efektif: 300 menit (5 jam)
 * 
 * 4. Minggu: Libur / Off (0 menit)
 * 
 * Ketentuan Khusus Pemotongan Jam Istirahat:
 * - Jika ijin parsial (keluar sementara / terlambat / pulang awal) berada pada atau
 *   memotong rentang jam istirahat resmi, maka jam istirahat otomatis dikurangkan
 *   sehingga waktu yang dicatat dan dibebankan hanya jam kerja efektif resmi.
 */

import { parseDateToMetaFast, getWibDateParts } from './dateUtils';

export interface WorkScheduleConfig {
  dayOfWeek: number; // 0: Sun, 1: Mon, ..., 6: Sat
  dayName: string;
  isWorkDay: boolean;
  workStart: string; // HH:mm
  workEnd: string;   // HH:mm
  workStartMin: number;
  workEndMin: number;
  breakStart: string | null;
  breakEnd: string | null;
  breakStartMin: number;
  breakEndMin: number;
  effectiveWorkMinutes: number;
}

export function parseTimeToMinutes(timeStr: string | null | undefined): number {
  if (!timeStr) return 0;
  const parts = String(timeStr).trim().split(':');
  if (parts.length < 2) return 0;
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

export function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function parseDateSafe(dateInput: string | Date | null | undefined): Date {
  const meta = parseDateToMetaFast(dateInput);
  if (meta) {
    return new Date(meta.year, meta.month - 1, meta.day);
  }
  const p = getWibDateParts();
  return new Date(p.year, p.month - 1, p.day);
}

/**
 * Normalisasi string tanggal apapun (DD/MM/YYYY, D/M/YYYY, ISO YYYY-MM-DD, atau Date object)
 * ke format ISO standar: YYYY-MM-DD (menggunakan cache & aritmatika WIB permanen)
 */
export function normalizeDateToIso(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  const meta = parseDateToMetaFast(dateInput);
  if (meta) return meta.iso;
  return String(dateInput).trim();
}

/**
 * Normalisasi string tanggal apapun ke format DD/MM/YYYY
 */
export function normalizeDateToDmy(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  const meta = parseDateToMetaFast(dateInput);
  if (meta) return meta.dmy;
  return String(dateInput || '');
}

const DAY_NAMES_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// Singleton cache untuk 7 hari jadwal kerja agar tidak mengalokasikan objek baru di dalam loop
const WORK_SCHEDULE_BY_DAY: Record<number, WorkScheduleConfig> = {
  0: {
    dayOfWeek: 0,
    dayName: 'Minggu',
    isWorkDay: false,
    workStart: '00:00',
    workEnd: '00:00',
    workStartMin: 0,
    workEndMin: 0,
    breakStart: null,
    breakEnd: null,
    breakStartMin: 0,
    breakEndMin: 0,
    effectiveWorkMinutes: 0
  },
  5: {
    dayOfWeek: 5,
    dayName: 'Jumat',
    isWorkDay: true,
    workStart: '08:00',
    workEnd: '16:30',
    workStartMin: 480,
    workEndMin: 990,
    breakStart: '11:00',
    breakEnd: '12:30',
    breakStartMin: 660,
    breakEndMin: 750,
    effectiveWorkMinutes: 420
  },
  6: {
    dayOfWeek: 6,
    dayName: 'Sabtu',
    isWorkDay: true,
    workStart: '08:00',
    workEnd: '13:00',
    workStartMin: 480,
    workEndMin: 780,
    breakStart: null,
    breakEnd: null,
    breakStartMin: 0,
    breakEndMin: 0,
    effectiveWorkMinutes: 300
  }
};

for (let d = 1; d <= 4; d++) {
  WORK_SCHEDULE_BY_DAY[d] = {
    dayOfWeek: d,
    dayName: DAY_NAMES_ID[d],
    isWorkDay: true,
    workStart: '08:00',
    workEnd: '16:00',
    workStartMin: 480,
    workEndMin: 960,
    breakStart: '11:30',
    breakEnd: '12:30',
    breakStartMin: 690,
    breakEndMin: 750,
    effectiveWorkMinutes: 420
  };
}

/**
 * Mendapatkan konfigurasi jadwal resmi berdasarkan tanggal (O(1) cached lookup)
 */
export function getWorkScheduleForDate(dateInput: string | Date): WorkScheduleConfig {
  const meta = parseDateToMetaFast(dateInput);
  const day = meta ? meta.dayOfWeek : getWibDateParts().dayOfWeek;
  return WORK_SCHEDULE_BY_DAY[day] || WORK_SCHEDULE_BY_DAY[1];
}

export interface EffectivePermitResult {
  durasiMenit: number;
  jamAwal: string;
  jamAkhir: string;
  brutoMenit: number;
  potonganIstirahatMenit: number;
  isFullDay: boolean;
  schedule: WorkScheduleConfig;
  faktorPotongan: number;
}

/**
 * Menghitung durasi ijin efektif dengan memperhitungkan pemotongan jam istirahat resmi
 */
export function calculateEffectivePermitMinutes(
  dateInput: string | Date,
  jamAwalInput: string,
  jamAkhirInput: string,
  isFullDayParam?: boolean,
  jenisIjin?: string,
  manualFaktorParam?: number | string
): EffectivePermitResult {
  const schedule = getWorkScheduleForDate(dateInput);

  if (!schedule.isWorkDay) {
    return {
      durasiMenit: 0,
      jamAwal: jamAwalInput || '00:00',
      jamAkhir: jamAkhirInput || '00:00',
      brutoMenit: 0,
      potonganIstirahatMenit: 0,
      isFullDay: Boolean(isFullDayParam),
      schedule,
      faktorPotongan: 0
    };
  }

  // Cek apakah jenis ijin adalah izin normatif / sakit dokter yang tidak memotong upah
  const isNormatifAtauSakitDokter = jenisIjin && (
    jenisIjin.startsWith('Sakit (S Dokter)') || 
    jenisIjin === 'Ijin Normatif'
  );

  // Jika sehari penuh atau jenis izin sehari penuh otomatis
  const isAutoFullDayType = jenisIjin && (
    jenisIjin.startsWith('Sakit') || 
    jenisIjin.startsWith('Ijin (S Tangan)') || 
    jenisIjin === 'Alpha' || 
    jenisIjin === 'Ijin Normatif'
  );

  const isFullDay = Boolean(isFullDayParam || isAutoFullDayType);

  if (isFullDay) {
    const durasi = schedule.effectiveWorkMinutes;
    let faktor = 1;
    if (manualFaktorParam !== undefined && manualFaktorParam !== null && manualFaktorParam !== '' && !isNaN(Number(manualFaktorParam))) {
      faktor = Number(manualFaktorParam);
    } else {
      faktor = isNormatifAtauSakitDokter ? 0 : 1; // 1 hari penuh
    }
    return {
      durasiMenit: durasi,
      jamAwal: schedule.workStart,
      jamAkhir: schedule.workEnd,
      brutoMenit: schedule.workEndMin - schedule.workStartMin,
      potonganIstirahatMenit: schedule.breakEndMin ? (schedule.breakEndMin - schedule.breakStartMin) : 0,
      isFullDay: true,
      schedule,
      faktorPotongan: faktor
    };
  }

  // Hitung ijin parsial (jamAwal s/d jamAkhir)
  const userStartMin = parseTimeToMinutes(jamAwalInput);
  const userEndMin = parseTimeToMinutes(jamAkhirInput);

  if (userEndMin <= userStartMin) {
    return {
      durasiMenit: 0,
      jamAwal: jamAwalInput,
      jamAkhir: jamAkhirInput,
      brutoMenit: 0,
      potonganIstirahatMenit: 0,
      isFullDay: false,
      schedule,
      faktorPotongan: 0
    };
  }

  // Batasi rentang dalam jam kerja resmi (08:00 s/d jam selesai hari bersangkutan)
  const effStart = Math.max(userStartMin, schedule.workStartMin);
  const effEnd = Math.min(userEndMin, schedule.workEndMin);

  if (effEnd <= effStart) {
    return {
      durasiMenit: 0,
      jamAwal: jamAwalInput,
      jamAkhir: jamAkhirInput,
      brutoMenit: 0,
      potonganIstirahatMenit: 0,
      isFullDay: false,
      schedule,
      faktorPotongan: 0
    };
  }

  const brutoMenit = effEnd - effStart;
  let potonganIstirahatMenit = 0;

  // Jika hari tersebut memiliki jam istirahat, hitung irisan (overlap) dengan jam istirahat
  if (schedule.breakStartMin > 0 && schedule.breakEndMin > schedule.breakStartMin) {
    const overlapStart = Math.max(effStart, schedule.breakStartMin);
    const overlapEnd = Math.min(effEnd, schedule.breakEndMin);
    if (overlapEnd > overlapStart) {
      potonganIstirahatMenit = overlapEnd - overlapStart;
    }
  }

  const netMinutes = Math.max(0, brutoMenit - potonganIstirahatMenit);
  
  // Penentuan faktor potongan diskret (0 = Dibayar Penuh, 0.5 = Setengah Hari, 1 = Hangus)
  let faktor = 0;
  if (manualFaktorParam !== undefined && manualFaktorParam !== null && manualFaktorParam !== '' && !isNaN(Number(manualFaktorParam))) {
    faktor = Number(manualFaktorParam);
  } else if (isNormatifAtauSakitDokter) {
    faktor = 0;
  } else {
    const normJenis = (jenisIjin || '').trim();
    if (normJenis === 'Ijin Terlambat') {
      // Izin datang terlambat resmi: tidak kena potongan upah jika keterlambatan wajar (<= 210 menit / setengah hari)
      if (netMinutes <= 210) {
        faktor = 0;
      } else if (netMinutes <= 330) {
        faktor = 0.5;
      } else {
        faktor = 1;
      }
    } else if (normJenis === 'Ijin Pulang Awal' || normJenis === 'Ijin Keluar Sementara') {
      // Izin pulang awal / keluar sementara sampai 2 jam (<= 120 menit) tidak memotong upah harian
      if (netMinutes <= 120) {
        faktor = 0;
      } else if (netMinutes <= 240) {
        faktor = 0.5;
      } else {
        faktor = 1;
      }
    } else {
      // Default izin parsial lainnya
      if (netMinutes <= 120) {
        faktor = 0;
      } else if (netMinutes <= 240) {
        faktor = 0.5;
      } else {
        faktor = 1;
      }
    }
  }

  return {
    durasiMenit: netMinutes,
    jamAwal: jamAwalInput,
    jamAkhir: jamAkhirInput,
    brutoMenit,
    potonganIstirahatMenit,
    isFullDay: false,
    schedule,
    faktorPotongan: faktor
  };
}

/**
 * Normalisasi satu baris rekaman presensi (baik baru maupun historis)
 * Jika data memiliki jamAwal & jamAkhir, hitung durasi efektif akurat.
 */
export function getNormalizedPermitMinutes(
  tanggal: string,
  jamAwal: string,
  jamAkhir: string,
  durasiTersimpan?: number | string,
  jenisIjin?: string
): number {
  // Jika jenis ijin sehari penuh
  const isAutoFullDayType = jenisIjin && (
    jenisIjin.startsWith('Sakit') || 
    jenisIjin.startsWith('Ijin (S Tangan)') || 
    jenisIjin === 'Alpha' || 
    jenisIjin === 'Ijin Normatif'
  );

  const schedule = getWorkScheduleForDate(tanggal);

  // Jika izin sehari penuh atau jika hari Sabtu
  if (isAutoFullDayType) {
    return schedule.effectiveWorkMinutes;
  }

  // Jika ada jamAwal dan jamAkhir yang valid
  if (jamAwal && jamAkhir && jamAwal.includes(':') && jamAkhir.includes(':')) {
    const res = calculateEffectivePermitMinutes(tanggal, jamAwal, jamAkhir, false, jenisIjin);
    return res.durasiMenit;
  }

  // Fallback ke durasi tersimpan jika valid
  const rawDur = Number(durasiTersimpan) || 0;
  if (rawDur > 0) {
    // Jika hari Sabtu dan durasi tercatat 420, sesuaikan menjadi max 300 menit
    if (schedule.dayOfWeek === 6 && rawDur >= 420) {
      return 300;
    }
    return rawDur;
  }

  return 0;
}

/**
 * Mendapatkan label dan styling badge untuk nilai faktorPotongan
 */
export function getFaktorPotonganBadgeInfo(faktor: number | string): {
  label: string;
  className: string;
} {
  const f = Number(faktor);
  if (f === 0 || isNaN(f)) {
    return {
      label: '0 (Dibayar Penuh)',
      className: 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    };
  }
  if (f === 0.5) {
    return {
      label: '0,5 (Setengah)',
      className: 'bg-amber-100 text-amber-800 border border-amber-200'
    };
  }
  if (f === 1) {
    return {
      label: '1 (Hangus)',
      className: 'bg-red-100 text-red-800 border border-red-200'
    };
  }
  return {
    label: `${f} (Parsial)`,
    className: 'bg-amber-100 text-amber-800 border border-amber-200'
  };
}

/**
 * Normalisasi data presensi untuk memastikan faktorPotongan konsisten dengan aturan
 */
export function sanitizePresensiFaktor<T extends { jenisIjin?: string; durasiMenit?: number | string; faktorPotongan?: number | string }>(record: T): T {
  let f = Number(record.faktorPotongan);
  const jenis = (record.jenisIjin || '').trim();
  const durasi = Number(record.durasiMenit) || 0;

  if (jenis.startsWith('Sakit (S Dokter)') || jenis === 'Ijin Normatif') {
    f = 0;
  } else if (jenis === 'Ijin Terlambat') {
    if (durasi <= 210 || (f > 0 && f < 0.5)) {
      f = 0;
    }
  } else if (jenis === 'Ijin Pulang Awal' || jenis === 'Ijin Keluar Sementara') {
    if (durasi <= 120 || (f > 0 && f < 0.5)) {
      f = 0;
    }
  }
  return {
    ...record,
    faktorPotongan: f
  };
}
