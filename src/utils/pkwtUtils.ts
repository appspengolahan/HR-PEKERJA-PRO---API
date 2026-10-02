/**
 * Utilitas Penghitungan dan Validasi Status Kontrak PKWT
 * Sinkronisasi antara Tanggal Akhir PKWT, Status Kepegawaian, dan Status Kontrak
 */

export interface PKWTStatusInfo {
  statusText: 'TETAP' | 'Sudah Berakhir' | 'Segera Berakhir' | 'PKWT Berjalan' | '-';
  sisaHari: number | null; // negatif = sudah lewat
  badgeColor: string;
  labelDetail: string; // misal: "Sisa 14 Hari" atau "Lewat 30 Hari"
  isUrgent: boolean;
  isExpired: boolean;
}

export function parseIndoDate(dateStr: string | undefined | null): Date | null {
  if (!dateStr || dateStr === '-' || dateStr.trim() === '') return null;
  
  // Format dd/MM/yyyy
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
  } 
  
  // Format yyyy-MM-dd
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
  }

  return null;
}

export function getPKWTStatusInfo(
  statusKepegawaian: string, 
  akhirPKWTStr: string | undefined | null, 
  targetDate = new Date()
): PKWTStatusInfo {
  const normStatus = (statusKepegawaian || '').toUpperCase().trim();

  // Karyawan Tetap tidak memiliki masa berlaku PKWT
  if (normStatus === 'TETAP') {
    return {
      statusText: 'TETAP',
      sisaHari: null,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      labelDetail: 'Karyawan Tetap',
      isUrgent: false,
      isExpired: false
    };
  }

  const dAkhir = parseIndoDate(akhirPKWTStr);
  if (!dAkhir) {
    return {
      statusText: '-',
      sisaHari: null,
      badgeColor: 'bg-slate-100 text-slate-500 border-slate-200',
      labelDetail: 'Tanpa Tanggal',
      isUrgent: false,
      isExpired: false
    };
  }

  // Hitung selisih hari tepat pada tengah malam
  const today = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const target = new Date(dAkhir.getFullYear(), dAkhir.getMonth(), dAkhir.getDate());

  const diffTime = target.getTime() - today.getTime();
  const sisaHari = Math.round(diffTime / (1000 * 60 * 60 * 24));

  // 1. Sudah Berakhir (Expired)
  if (sisaHari < 0) {
    return {
      statusText: 'Sudah Berakhir',
      sisaHari: sisaHari,
      badgeColor: 'bg-red-100 text-red-900 border-red-300 font-bold',
      labelDetail: `Lewat ${Math.abs(sisaHari)} hari`,
      isUrgent: false,
      isExpired: true
    };
  }

  // 2. Segera Berakhir (<= 26 hari kerja / kalender)
  if (sisaHari <= 26) {
    return {
      statusText: 'Segera Berakhir',
      sisaHari: sisaHari,
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
      labelDetail: sisaHari === 0 ? 'Hari ini berakhir' : `Sisa ${sisaHari} hari`,
      isUrgent: true,
      isExpired: false
    };
  }

  // 3. Masih Berjalan Normal (> 26 hari)
  return {
    statusText: 'PKWT Berjalan',
    sisaHari: sisaHari,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-medium',
    labelDetail: `Sisa ${sisaHari} hari`,
    isUrgent: false,
    isExpired: false
  };
}
