/**
 * dateUtils.ts
 * Utilitas tanggal & waktu performa tinggi dengan aritmatika permanen WIB (UTC+7).
 * Menghindari pembuatan instance `new Intl.DateTimeFormat(...)` di dalam loop data
 * agar browser tidak membeku (freeze) saat memuat ratusan/ribuan entri.
 */

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

export const HARI_INDO = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const;
export const BULAN_INDO = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
] as const;

// Singleton formatter (dibuat 1x saja di level modul, tidak pernah di dalam loop)
const timeIdSingleton = new Intl.DateTimeFormat('id-ID', {
  timeZone: 'Asia/Jakarta',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
});

export interface WibDateParts {
  year: number;
  month: number; // 1-12
  day: number;   // 1-31
  dayOfWeek: number; // 0-6 (0 = Minggu)
  iso: string;   // YYYY-MM-DD
  dmy: string;   // DD/MM/YYYY
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Mengambil komponen tanggal & waktu saat ini secara deterministik di zona WIB (UTC+7)
 * menggunakan aritmatika epoch tanpa overhead Intl timezone lookup.
 */
export function getWibDateParts(date: Date = new Date()): WibDateParts {
  const wibEpoch = date.getTime() + WIB_OFFSET_MS;
  const wibDate = new Date(wibEpoch);
  const year = wibDate.getUTCFullYear();
  const month = wibDate.getUTCMonth() + 1;
  const day = wibDate.getUTCDate();
  const dayOfWeek = wibDate.getUTCDay();
  const hours = wibDate.getUTCHours();
  const minutes = wibDate.getUTCMinutes();
  const seconds = wibDate.getUTCSeconds();

  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');

  return {
    year,
    month,
    day,
    dayOfWeek,
    iso: `${year}-${mm}-${dd}`,
    dmy: `${dd}/${mm}/${year}`,
    hours,
    minutes,
    seconds
  };
}

/**
 * Mengembalikan tanggal hari ini dalam format YYYY-MM-DD sesuai WIB (UTC+7).
 */
export function getWibTodayIso(): string {
  return getWibDateParts().iso;
}

/**
 * Mengembalikan tanggal hari ini dalam format DD/MM/YYYY sesuai WIB (UTC+7).
 */
export function getWibTodayDmy(): string {
  return getWibDateParts().dmy;
}

/**
 * Mengembalikan tanggal offset N hari dari hari ini (WIB UTC+7) dalam format YYYY-MM-DD.
 */
export function getWibIsoOffsetDays(offsetDays: number): string {
  const target = new Date(Date.now() + offsetDays * 86400000);
  return getWibDateParts(target).iso;
}

/**
 * Memformat jam WIB (HH:mm:ss) menggunakan singleton formatter.
 */
export function formatWibTime(date: Date = new Date()): string {
  try {
    return timeIdSingleton.format(date);
  } catch {
    const p = getWibDateParts(date);
    return `${String(p.hours).padStart(2, '0')}:${String(p.minutes).padStart(2, '0')}:${String(p.seconds).padStart(2, '0')}`;
  }
}

// Cache hasil parsing & dayOfWeek agar aman dipanggil ribuan kali di dalam loop
const parsedDateMetaCache = new Map<string, { year: number; month: number; day: number; dayOfWeek: number; iso: string; dmy: string }>();

function computeDayOfWeekUtc(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function parseDateToMetaFast(dateInput: string | Date | null | undefined): {
  year: number;
  month: number;
  day: number;
  dayOfWeek: number;
  iso: string;
  dmy: string;
} | null {
  if (!dateInput) return null;

  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return null;
    const p = getWibDateParts(dateInput);
    return {
      year: p.year,
      month: p.month,
      day: p.day,
      dayOfWeek: p.dayOfWeek,
      iso: p.iso,
      dmy: p.dmy
    };
  }

  const s = String(dateInput).trim();
  if (!s || s === '-') return null;

  const cached = parsedDateMetaCache.get(s);
  if (cached) return cached;

  let year = 0;
  let month = 0;
  let day = 0;

  // ISO timestamp: e.g. 2026-11-10T00:00:00.000Z or YYYY-MM-DD
  const cleanIso = s.includes('T') ? s.split('T')[0] : s;

  if (cleanIso.includes('-')) {
    const parts = cleanIso.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
      } else {
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
      }
    }
  } else if (cleanIso.includes('/')) {
    const parts = cleanIso.split('/');
    if (parts.length === 3) {
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    }
  }

  if (!year || !month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
    const fallback = new Date(s);
    if (isNaN(fallback.getTime())) return null;
    const p = getWibDateParts(fallback);
    const meta = { year: p.year, month: p.month, day: p.day, dayOfWeek: p.dayOfWeek, iso: p.iso, dmy: p.dmy };
    if (parsedDateMetaCache.size < 2000) parsedDateMetaCache.set(s, meta);
    return meta;
  }

  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  const meta = {
    year,
    month,
    day,
    dayOfWeek: computeDayOfWeekUtc(year, month, day),
    iso: `${year}-${mm}-${dd}`,
    dmy: `${dd}/${mm}/${year}`
  };

  if (parsedDateMetaCache.size < 2000) {
    parsedDateMetaCache.set(s, meta);
  }
  return meta;
}

/**
 * Format tanggal panjang Indonesia tanpa `new Intl.DateTimeFormat` di loop,
 * contoh: "Selasa, 10 November 2026".
 */
export function formatIndoDateLong(dateInput: string | Date = new Date()): string {
  const meta = parseDateToMetaFast(dateInput);
  if (!meta) return String(dateInput || '-');
  const hari = HARI_INDO[meta.dayOfWeek] || 'Senin';
  const bulan = BULAN_INDO[meta.month - 1] || '';
  return `${hari}, ${meta.day} ${bulan} ${meta.year}`;
}
