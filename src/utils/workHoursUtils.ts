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
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return dateInput;
  
  const str = String(dateInput).trim();
  // Format DD/MM/YYYY
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      return new Date(y, m, d);
    }
  }
  
  // Format YYYY-MM-DD
  if (str.includes('-')) {
    const parts = str.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      return new Date(y, m, d);
    }
  }

  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Mendapatkan konfigurasi jadwal resmi berdasarkan tanggal
 */
export function getWorkScheduleForDate(dateInput: string | Date): WorkScheduleConfig {
  const date = parseDateSafe(dateInput);
  const day = date.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat

  if (day === 0) {
    // Minggu: Libur
    return {
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
    };
  }

  if (day === 6) {
    // Sabtu: 08:00 - 13:00 tanpa istirahat
    return {
      dayOfWeek: 6,
      dayName: 'Sabtu',
      isWorkDay: true,
      workStart: '08:00',
      workEnd: '13:00',
      workStartMin: 8 * 60,       // 480
      workEndMin: 13 * 60,       // 780
      breakStart: null,
      breakEnd: null,
      breakStartMin: 0,
      breakEndMin: 0,
      effectiveWorkMinutes: 300   // 5 jam
    };
  }

  if (day === 5) {
    // Jumat: 08:00 - 16:30, istirahat 11:00 - 12:30 (90 menit)
    return {
      dayOfWeek: 5,
      dayName: 'Jumat',
      isWorkDay: true,
      workStart: '08:00',
      workEnd: '16:30',
      workStartMin: 8 * 60,       // 480
      workEndMin: 16 * 60 + 30,  // 990
      breakStart: '11:00',
      breakEnd: '12:30',
      breakStartMin: 11 * 60,     // 660
      breakEndMin: 12 * 60 + 30, // 750
      effectiveWorkMinutes: 420   // (990 - 480) - 90 = 420 menit (7 jam)
    };
  }

  // Senin - Kamis: 08:00 - 16:00, istirahat 11:30 - 12:30 (60 menit)
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return {
    dayOfWeek: day,
    dayName: dayNames[day],
    isWorkDay: true,
    workStart: '08:00',
    workEnd: '16:00',
    workStartMin: 8 * 60,       // 480
    workEndMin: 16 * 60,       // 960
    breakStart: '11:30',
    breakEnd: '12:30',
    breakStartMin: 11 * 60 + 30, // 690
    breakEndMin: 12 * 60 + 30,  // 750
    effectiveWorkMinutes: 420   // (960 - 480) - 60 = 420 menit (7 jam)
  };
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
  jenisIjin?: string
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
    const faktor = isNormatifAtauSakitDokter ? 0 : 1; // 1 hari penuh
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
  const faktor = isNormatifAtauSakitDokter 
    ? 0 
    : Math.round((netMinutes / schedule.effectiveWorkMinutes) * 100) / 100;

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
