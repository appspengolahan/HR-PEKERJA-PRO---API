import { PekerjaData, LemburRecord } from '../types';

export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const sanitize = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(sanitize).join(','),
    ...rows.map(row => row.map(sanitize).join(','))
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportPekerjaToCSV(pekerjaList: PekerjaData[]) {
  const headers = [
    'No / ID',
    'Nama Pekerja',
    'Unit',
    'Sekup',
    'Unit Sekup',
    'Jabatan',
    'Status Kepegawaian',
    'Upah Harian (Rp)',
    'Awal PKWT',
    'Akhir PKWT',
    'Status PKWT',
    'Pendidikan Terakhir'
  ];

  const rows = pekerjaList.map(p => [
    p.id,
    p.nama,
    p.unit,
    p.sekup,
    p.unitSekup,
    p.jabatan || 'Harian',
    p.status,
    p.upahHarian,
    p.awalPKWT || '-',
    p.akhirPKWT || '-',
    p.statusPKWT || '-',
    p.pendidikanTerakhir || '-'
  ]);

  downloadCSV('Database_Master_Pekerja_PP1', headers, rows);
}

export function exportLemburToCSV(lemburList: LemburRecord[]) {
  const headers = [
    'Tanggal',
    'Nama Pekerja',
    'Unit',
    'Sekup',
    'Kategori Hari',
    'Jam Mulai',
    'Jam Selesai',
    'Jumlah Jam',
    'Nominal Upah (Rp)'
  ];

  const rows = lemburList.map(r => [
    r.tanggal,
    r.nama,
    r.unit || '-',
    r.sekup || '-',
    r.kategori,
    r.jamMulai,
    r.jamSelesai,
    r.jmlJam,
    r.nominal
  ]);

  downloadCSV('Riwayat_Lembur_Pekerja_PP1', headers, rows);
}

export function exportRekapPresensiToCSV(rekapRows: { nama: string; unit: string; sekup: string; bulanan: number[]; totalIjin: number; pctKehadiran: number }[]) {
  const headers = [
    'Nama Pekerja',
    'Unit',
    'Sekup',
    'Jan (mnt)', 'Feb (mnt)', 'Mar (mnt)', 'Apr (mnt)', 'Mei (mnt)', 'Jun (mnt)',
    'Jul (mnt)', 'Agu (mnt)', 'Sep (mnt)', 'Okt (mnt)', 'Nov (mnt)', 'Des (mnt)',
    'Total Ijin (mnt)',
    '% Kehadiran'
  ];

  const rows = rekapRows.map(r => [
    r.nama,
    r.unit,
    r.sekup,
    ...r.bulanan,
    r.totalIjin,
    `${r.pctKehadiran.toFixed(2)}%`
  ]);

  downloadCSV('Rekap_Presensi_Tahunan_PP1', headers, rows);
}
