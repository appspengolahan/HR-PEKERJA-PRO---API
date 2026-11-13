import { getWibTodayIso } from './dateUtils';

/**
 * Utilitas Penghitungan dan Validasi Status Kontrak PKWT
 * Sinkronisasi antara Tanggal Akhir PKWT, Status Kepegawaian, dan Status Kontrak
 * Dilengkapi cache memori agar aman dipanggil berulang dalam loop render HP/Tablet.
 */

export interface PKWTStatusInfo {
  statusText: 'TETAP' | 'Sudah Berakhir' | 'Segera Berakhir' | 'PKWT Berjalan' | '-';
  sisaHari: number | null; // negatif = sudah lewat
  badgeColor: string;
  labelDetail: string; // misal: "Sisa 14 Hari" atau "Lewat 30 Hari"
  isUrgent: boolean;
  isExpired: boolean;
}

const pkwtStatusCache = new Map<string, PKWTStatusInfo>();

const STATIC_TETAP: PKWTStatusInfo = {
  statusText: 'TETAP',
  sisaHari: null,
  badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
  labelDetail: 'Karyawan Tetap',
  isUrgent: false,
  isExpired: false
};

const STATIC_EMPTY: PKWTStatusInfo = {
  statusText: '-',
  sisaHari: null,
  badgeColor: 'bg-slate-100 text-slate-500 border-slate-200',
  labelDetail: 'Tanpa Tanggal',
  isUrgent: false,
  isExpired: false
};

function parseDateParts(dateStr: string | undefined | null): { year: number; month: number; day: number } | null {
  if (!dateStr || dateStr === '-' || dateStr.trim() === '') return null;
  const s = dateStr.trim();

  if (s.includes('/')) {
    const parts = s.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year > 1900) {
        return { year, month, day };
      }
    }
  }

  if (s.includes('-')) {
    const parts = s.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year > 1900) {
        return { year, month, day };
      }
    }
  }

  return null;
}

export function parseIndoDate(dateStr: string | undefined | null): Date | null {
  const parts = parseDateParts(dateStr);
  if (!parts) return null;
  return new Date(parts.year, parts.month - 1, parts.day);
}

export function getPKWTStatusInfo(
  statusKepegawaian: string,
  akhirPKWTStr: string | undefined | null,
  targetDate?: Date
): PKWTStatusInfo {
  const normStatus = (statusKepegawaian || '').toUpperCase().trim();

  if (normStatus === 'TETAP') {
    return STATIC_TETAP;
  }

  if (!akhirPKWTStr || akhirPKWTStr === '-' || akhirPKWTStr.trim() === '') {
    return STATIC_EMPTY;
  }

  const todayIso = targetDate
    ? `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`
    : getWibTodayIso();

  const cacheKey = `${normStatus}|${akhirPKWTStr.trim()}|${todayIso}`;
  const cached = pkwtStatusCache.get(cacheKey);
  if (cached) return cached;

  const targetParts = parseDateParts(akhirPKWTStr);
  if (!targetParts) {
    return STATIC_EMPTY;
  }

  const todayParts = todayIso.split('-');
  const todayUtc = Date.UTC(
    parseInt(todayParts[0], 10),
    parseInt(todayParts[1], 10) - 1,
    parseInt(todayParts[2], 10)
  );
  const targetUtc = Date.UTC(targetParts.year, targetParts.month - 1, targetParts.day);
  const sisaHari = Math.round((targetUtc - todayUtc) / 86400000);

  let result: PKWTStatusInfo;
  if (sisaHari < 0) {
    result = {
      statusText: 'Sudah Berakhir',
      sisaHari,
      badgeColor: 'bg-red-100 text-red-900 border-red-300 font-bold',
      labelDetail: `Lewat ${Math.abs(sisaHari)} hari`,
      isUrgent: false,
      isExpired: true
    };
  } else if (sisaHari <= 26) {
    result = {
      statusText: 'Segera Berakhir',
      sisaHari,
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
      labelDetail: sisaHari === 0 ? 'Hari ini berakhir' : `Sisa ${sisaHari} hari`,
      isUrgent: true,
      isExpired: false
    };
  } else {
    result = {
      statusText: 'PKWT Berjalan',
      sisaHari,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-medium',
      labelDetail: `Sisa ${sisaHari} hari`,
      isUrgent: false,
      isExpired: false
    };
  }

  if (pkwtStatusCache.size > 1000) {
    pkwtStatusCache.clear();
  }
  pkwtStatusCache.set(cacheKey, result);
  return result;
}
