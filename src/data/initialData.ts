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
  SwitchBoardApp 
} from '../types';

export const PABRIK_GEOFENCE = {
  nama: 'PT Batu Karang — Divisi Produksi 1 (PP1)',
  latitude: -7.2504,
  longitude: 112.7688,
  radiusMaksimumMeter: 150,
  alamat: 'Kawasan Industri Rungkut Industri No. 45, Surabaya, Jawa Timur'
};

export const TARIF_BORONGAN_DEFAULT = {
  'Sortir Gagang Cengkeh': 850, // Rp 850 / Kg
  'Grading Krosok': 950,        // Rp 950 / Kg
  'Stacking Karung': 1500,      // Rp 1.500 / Karung
  'Kebersihan Area': 120000,    // Rp 120.000 / Hari
};

export const INITIAL_JAM_KERJA: JamKerjaConfig[] = [
  {
    hari: 'Senin - Kamis',
    jamMulai: '08:00',
    jamSelesai: '16:00',
    istirahatMulai: '11:30',
    istirahatSelesai: '12:30',
    durasiKerjaMenit: 420
  },
  {
    hari: 'Jumat',
    jamMulai: '08:00',
    jamSelesai: '16:30',
    istirahatMulai: '11:00',
    istirahatSelesai: '12:30',
    durasiKerjaMenit: 420
  },
  {
    hari: 'Sabtu',
    jamMulai: '08:00',
    jamSelesai: '13:00',
    istirahatMulai: '-',
    istirahatSelesai: '-',
    durasiKerjaMenit: 300
  }
];

export const INITIAL_PEKERJA_PHL: PekerjaPHL[] = [
  {
    id: 'phl-1',
    nip: 'BK-PP1-PHL-001',
    nama: 'Slamet Riyadi',
    ktp: '3578011205880003',
    domisili: 'Kupang Gunung Timur, Surabaya',
    kontakDarurat: '0812-3344-9981 (Istri - Siti)',
    posLini: 'Sortir Gagang Cengkeh',
    tanggalBergabung: '2024-02-15',
    statusAktif: true,
    rekeningBank: 'BRI - 3120019284715'
  },
  {
    id: 'phl-2',
    nip: 'BK-PP1-PHL-002',
    nama: 'Budi Santoso',
    ktp: '3578022409890001',
    domisili: 'Rungkut Menanggal Harapan, Surabaya',
    kontakDarurat: '0857-4455-1234 (Adik - Joko)',
    posLini: 'Grading Krosok',
    tanggalBergabung: '2024-03-01',
    statusAktif: true,
    rekeningBank: 'BCA - 0182746351'
  },
  {
    id: 'phl-3',
    nip: 'BK-PP1-PHL-003',
    nama: 'Supriyanto',
    ktp: '3578031506920004',
    domisili: 'Waru, Sidoarjo',
    kontakDarurat: '0821-9876-5432 (Ayah - Suwardi)',
    posLini: 'Stacking Karung',
    tanggalBergabung: '2024-01-10',
    statusAktif: true,
    rekeningBank: 'Mandiri - 1420018899201'
  },
  {
    id: 'phl-4',
    nip: 'BK-PP1-PHL-004',
    nama: 'Sri Wahyuni',
    ktp: '3578045607910002',
    domisili: 'Wonokromo Gang Lebar, Surabaya',
    kontakDarurat: '0813-2233-4455 (Suami - Agus)',
    posLini: 'Sortir Gagang Cengkeh',
    tanggalBergabung: '2024-04-12',
    statusAktif: true,
    rekeningBank: 'BRI - 0019283746552'
  },
  {
    id: 'phl-5',
    nip: 'BK-PP1-PHL-005',
    nama: 'Kuswanto',
    ktp: '3578051803870005',
    domisili: 'Sedati, Sidoarjo',
    kontakDarurat: '0819-8765-4321 (Istri - Endang)',
    posLini: 'Stacking Karung',
    tanggalBergabung: '2024-02-20',
    statusAktif: true,
    rekeningBank: 'BNI - 0482910492'
  },
  {
    id: 'phl-6',
    nip: 'BK-PP1-PHL-006',
    nama: 'Nurul Hidayati',
    ktp: '3578064508930006',
    domisili: 'Kendangsari, Surabaya',
    kontakDarurat: '0878-1122-3344 (Ibu - Supartin)',
    posLini: 'Grading Krosok',
    tanggalBergabung: '2024-05-02',
    statusAktif: true,
    rekeningBank: 'BSI - 7182940291'
  },
  {
    id: 'phl-7',
    nip: 'BK-PP1-PHL-007',
    nama: 'Mat Syarif',
    ktp: '3578072111850007',
    domisili: 'Tenggilis Mejoyo, Surabaya',
    kontakDarurat: '0852-6677-8899 (Paman - Kholil)',
    posLini: 'Kebersihan Area',
    tanggalBergabung: '2023-11-01',
    statusAktif: true,
    rekeningBank: 'BRI - 3120088921102'
  },
  {
    id: 'phl-8',
    nip: 'BK-PP1-PHL-008',
    nama: 'Sulastri',
    ktp: '3578086204900008',
    domisili: 'Jemursari Selatan, Surabaya',
    kontakDarurat: '0812-4433-2211 (Suami - Marzuki)',
    posLini: 'Sortir Gagang Cengkeh',
    tanggalBergabung: '2024-06-15',
    statusAktif: true,
    rekeningBank: 'BCA - 8291048293'
  }
];

export const INITIAL_STAFF: StaffPP1[] = [
  {
    id: 'staff-1',
    nip: 'BK-PP1-001',
    nama: 'Lalu M. Kurniawan',
    jabatan: 'Manajer Operasional',
    divisi: 'Divisi Produksi 1 (PP1)',
    telepon: '0811-3456-7890',
    email: 'lalu.kurniawan@batukarang.co.id',
    tanggalBergabung: '2020-03-01',
    status: 'Tetap',
    shiftDefault: 'Non-Shift (Office 08:00-16:00)',
    sisaCuti: 12
  },
  {
    id: 'staff-2',
    nip: 'BK-PP1-002',
    nama: 'Supardi Hartono',
    jabatan: 'Foreman / Mandor',
    divisi: 'Divisi Produksi 1 (PP1)',
    telepon: '0812-9876-1234',
    email: 'supardi.h@batukarang.co.id',
    tanggalBergabung: '2021-06-15',
    status: 'Tetap',
    shiftDefault: 'Shift 1 (Pagi 07:00-15:00)',
    sisaCuti: 9
  },
  {
    id: 'staff-3',
    nip: 'BK-PP1-003',
    nama: 'Bambang Sugiantoro',
    jabatan: 'Teknisi Mesin',
    divisi: 'Divisi Produksi 1 (PP1)',
    telepon: '0813-7766-5544',
    email: 'bambang.s@batukarang.co.id',
    tanggalBergabung: '2022-01-10',
    status: 'Tetap',
    shiftDefault: 'Shift 2 (Sore 15:00-23:00)',
    sisaCuti: 10
  },
  {
    id: 'staff-4',
    nip: 'BK-PP1-004',
    nama: 'Dewi Anggraini, S.T.',
    jabatan: 'Admin Lab QC',
    divisi: 'Divisi Produksi 1 (PP1)',
    telepon: '0857-1122-9988',
    email: 'dewi.ang@batukarang.co.id',
    tanggalBergabung: '2022-08-01',
    status: 'Tetap',
    shiftDefault: 'Shift 1 (Pagi 07:00-15:00)',
    sisaCuti: 11
  },
  {
    id: 'staff-5',
    nip: 'BK-PP1-005',
    nama: 'Heru Prasetyo',
    jabatan: 'Operator Senior',
    divisi: 'Divisi Produksi 1 (PP1)',
    telepon: '0819-3344-5566',
    email: 'heru.p@batukarang.co.id',
    tanggalBergabung: '2023-02-15',
    status: 'Kontrak',
    shiftDefault: 'Shift 3 (Malam 23:00-07:00)',
    sisaCuti: 6
  },
  {
    id: 'staff-6',
    nip: 'BK-PP1-006',
    nama: 'Rahmat Hidayatullah',
    jabatan: 'Supervisor K3',
    divisi: 'Divisi Produksi 1 (PP1)',
    telepon: '0822-4455-6677',
    email: 'rahmat.k3@batukarang.co.id',
    tanggalBergabung: '2021-11-20',
    status: 'Tetap',
    shiftDefault: 'Non-Shift (Office 08:00-16:00)',
    sisaCuti: 8
  }
];

export const INITIAL_PRESENSI_PHL: PresensiPHLRecord[] = [
  {
    id: 'pres-phl-1',
    pekerjaId: 'phl-1',
    nip: 'BK-PP1-PHL-001',
    nama: 'Slamet Riyadi',
    posLini: 'Sortir Gagang Cengkeh',
    tanggal: '2026-09-30',
    status: 'Hadir',
    jamMasuk: '07:45',
    jamPulang: '16:05',
    mandorPencatat: 'Supardi Hartono',
    catatan: 'Tepat waktu, alat pelindung diri lengkap'
  },
  {
    id: 'pres-phl-2',
    pekerjaId: 'phl-2',
    nip: 'BK-PP1-PHL-002',
    nama: 'Budi Santoso',
    posLini: 'Grading Krosok',
    tanggal: '2026-09-30',
    status: 'Hadir',
    jamMasuk: '07:50',
    jamPulang: '16:00',
    mandorPencatat: 'Supardi Hartono',
    catatan: 'Hasil grading bersih'
  },
  {
    id: 'pres-phl-3',
    pekerjaId: 'phl-3',
    nip: 'BK-PP1-PHL-003',
    nama: 'Supriyanto',
    posLini: 'Stacking Karung',
    tanggal: '2026-09-30',
    status: 'Hadir',
    jamMasuk: '07:40',
    jamPulang: '16:10',
    mandorPencatat: 'Supardi Hartono'
  },
  {
    id: 'pres-phl-4',
    pekerjaId: 'phl-4',
    nip: 'BK-PP1-PHL-004',
    nama: 'Sri Wahyuni',
    posLini: 'Sortir Gagang Cengkeh',
    tanggal: '2026-09-30',
    status: 'Hadir',
    jamMasuk: '07:55',
    jamPulang: '16:00',
    mandorPencatat: 'Supardi Hartono'
  },
  {
    id: 'pres-phl-5',
    pekerjaId: 'phl-5',
    nip: 'BK-PP1-PHL-005',
    nama: 'Kuswanto',
    posLini: 'Stacking Karung',
    tanggal: '2026-09-30',
    status: 'Izin',
    jamMasuk: '-',
    jamPulang: '-',
    mandorPencatat: 'Supardi Hartono',
    catatan: 'Izin ada keperluan keluarga (ada surat)'
  },
  {
    id: 'pres-phl-6',
    pekerjaId: 'phl-6',
    nip: 'BK-PP1-PHL-006',
    nama: 'Nurul Hidayati',
    posLini: 'Grading Krosok',
    tanggal: '2026-09-30',
    status: 'Hadir',
    jamMasuk: '07:48',
    jamPulang: '16:00',
    mandorPencatat: 'Supardi Hartono'
  },
  {
    id: 'pres-phl-7',
    pekerjaId: 'phl-7',
    nip: 'BK-PP1-PHL-007',
    nama: 'Mat Syarif',
    posLini: 'Kebersihan Area',
    tanggal: '2026-09-30',
    status: 'Hadir',
    jamMasuk: '07:30',
    jamPulang: '16:15',
    mandorPencatat: 'Supardi Hartono',
    catatan: 'Area pengolahan steril dan kering'
  },
  {
    id: 'pres-phl-8',
    pekerjaId: 'phl-8',
    nip: 'BK-PP1-PHL-008',
    nama: 'Sulastri',
    posLini: 'Sortir Gagang Cengkeh',
    tanggal: '2026-09-30',
    status: 'Sakit',
    jamMasuk: '-',
    jamPulang: '-',
    mandorPencatat: 'Supardi Hartono',
    catatan: 'Demam (surat dokter terlampir)'
  }
];

export const INITIAL_OUTPUT_BORONGAN: OutputBoronganRecord[] = [
  {
    id: 'bor-1',
    pekerjaId: 'phl-1',
    nip: 'BK-PP1-PHL-001',
    nama: 'Slamet Riyadi',
    posLini: 'Sortir Gagang Cengkeh',
    tanggal: '2026-09-30',
    satuan: 'Kg',
    volume: 165,
    tarifPerSatuan: 850,
    totalUpah: 140250,
    mandorVerifikator: 'Supardi Hartono',
    statusVerifikasi: 'Terverifikasi',
    catatanKualitas: 'Kadar air < 12%, gagang terpisah rapi'
  },
  {
    id: 'bor-2',
    pekerjaId: 'phl-2',
    nip: 'BK-PP1-PHL-002',
    nama: 'Budi Santoso',
    posLini: 'Grading Krosok',
    tanggal: '2026-09-30',
    satuan: 'Kg',
    volume: 180,
    tarifPerSatuan: 950,
    totalUpah: 171000,
    mandorVerifikator: 'Supardi Hartono',
    statusVerifikasi: 'Terverifikasi',
    catatanKualitas: 'Grade A 60%, Grade B 40%'
  },
  {
    id: 'bor-3',
    pekerjaId: 'phl-3',
    nip: 'BK-PP1-PHL-003',
    nama: 'Supriyanto',
    posLini: 'Stacking Karung',
    tanggal: '2026-09-30',
    satuan: 'Karung',
    volume: 110,
    tarifPerSatuan: 1500,
    totalUpah: 165000,
    mandorVerifikator: 'Supardi Hartono',
    statusVerifikasi: 'Terverifikasi',
    catatanKualitas: 'Tumpukan palet stabil 5 susun'
  },
  {
    id: 'bor-4',
    pekerjaId: 'phl-4',
    nip: 'BK-PP1-PHL-004',
    nama: 'Sri Wahyuni',
    posLini: 'Sortir Gagang Cengkeh',
    tanggal: '2026-09-30',
    satuan: 'Kg',
    volume: 155,
    tarifPerSatuan: 850,
    totalUpah: 131750,
    mandorVerifikator: 'Supardi Hartono',
    statusVerifikasi: 'Terverifikasi',
    catatanKualitas: 'Lolos uji QC visual'
  },
  {
    id: 'bor-5',
    pekerjaId: 'phl-6',
    nip: 'BK-PP1-PHL-006',
    nama: 'Nurul Hidayati',
    posLini: 'Grading Krosok',
    tanggal: '2026-09-30',
    satuan: 'Kg',
    volume: 175,
    tarifPerSatuan: 950,
    totalUpah: 166250,
    mandorVerifikator: 'Supardi Hartono',
    statusVerifikasi: 'Terverifikasi'
  },
  {
    id: 'bor-6',
    pekerjaId: 'phl-7',
    nip: 'BK-PP1-PHL-007',
    nama: 'Mat Syarif',
    posLini: 'Kebersihan Area',
    tanggal: '2026-09-30',
    satuan: 'Hari',
    volume: 1,
    tarifPerSatuan: 120000,
    totalUpah: 120000,
    mandorVerifikator: 'Supardi Hartono',
    statusVerifikasi: 'Terverifikasi',
    catatanKualitas: 'Pembersihan rotary & silo tuntas'
  }
];

export const INITIAL_PRESENSI_STAFF: PresensiStaffRecord[] = [
  {
    id: 'stf-p-1',
    staffId: 'staff-1',
    nip: 'BK-PP1-001',
    nama: 'Lalu M. Kurniawan',
    jabatan: 'Manajer Operasional',
    tanggal: '2026-09-30',
    shift: 'Non-Shift (Office 08:00-16:00)',
    jamMasuk: '07:35',
    latitude: -7.25042,
    longitude: 112.76881,
    jarakMeter: 3.5,
    isWithinGeofence: true,
    status: 'Hadir',
    tipePresensi: 'GPS Geofence',
    catatan: 'Valid di Sentral Kantor PP1'
  },
  {
    id: 'stf-p-2',
    staffId: 'staff-2',
    nip: 'BK-PP1-002',
    nama: 'Supardi Hartono',
    jabatan: 'Foreman / Mandor',
    tanggal: '2026-09-30',
    shift: 'Shift 1 (Pagi 07:00-15:00)',
    jamMasuk: '06:45',
    latitude: -7.25055,
    longitude: 112.76875,
    jarakMeter: 18.2,
    isWithinGeofence: true,
    status: 'Hadir',
    tipePresensi: 'GPS Geofence',
    catatan: 'Hadir briefing regu pagi'
  },
  {
    id: 'stf-p-3',
    staffId: 'staff-4',
    nip: 'BK-PP1-004',
    nama: 'Dewi Anggraini, S.T.',
    jabatan: 'Admin Lab QC',
    tanggal: '2026-09-30',
    shift: 'Shift 1 (Pagi 07:00-15:00)',
    jamMasuk: '06:50',
    latitude: -7.25035,
    longitude: 112.76895,
    jarakMeter: 22.8,
    isWithinGeofence: true,
    status: 'Hadir',
    tipePresensi: 'GPS Geofence'
  },
  {
    id: 'stf-p-4',
    staffId: 'staff-3',
    nip: 'BK-PP1-003',
    nama: 'Bambang Sugiantoro',
    jabatan: 'Teknisi Mesin',
    tanggal: '2026-09-30',
    shift: 'Shift 2 (Sore 15:00-23:00)',
    jamMasuk: '14:40',
    latitude: -7.25048,
    longitude: 112.76865,
    jarakMeter: 21.0,
    isWithinGeofence: true,
    status: 'Hadir',
    tipePresensi: 'GPS Geofence'
  }
];

export const INITIAL_SHIFT_SCHEDULE: ShiftSchedule[] = [
  {
    id: 'sched-1',
    staffId: 'staff-2',
    nip: 'BK-PP1-002',
    nama: 'Supardi Hartono',
    jabatan: 'Foreman / Mandor',
    regu: 'Regu A',
    tanggal: '2026-09-30',
    shift: 'Shift 1 (Pagi 07:00-15:00)',
    liniMesin: 'Lini 1 Sortir'
  },
  {
    id: 'sched-2',
    staffId: 'staff-4',
    nip: 'BK-PP1-004',
    nama: 'Dewi Anggraini, S.T.',
    jabatan: 'Admin Lab QC',
    regu: 'Regu A',
    tanggal: '2026-09-30',
    shift: 'Shift 1 (Pagi 07:00-15:00)',
    liniMesin: 'Lini 2 Rotary'
  },
  {
    id: 'sched-3',
    staffId: 'staff-3',
    nip: 'BK-PP1-003',
    nama: 'Bambang Sugiantoro',
    jabatan: 'Teknisi Mesin',
    regu: 'Regu B',
    tanggal: '2026-09-30',
    shift: 'Shift 2 (Sore 15:00-23:00)',
    liniMesin: 'Maintenance General'
  },
  {
    id: 'sched-4',
    staffId: 'staff-5',
    nip: 'BK-PP1-005',
    nama: 'Heru Prasetyo',
    jabatan: 'Operator Senior',
    regu: 'Regu C',
    tanggal: '2026-09-30',
    shift: 'Shift 3 (Malam 23:00-07:00)',
    liniMesin: 'Lini 4 Silo Blend'
  }
];

export const INITIAL_LEMBUR: PengajuanLembur[] = [
  {
    id: 'lmb-1',
    staffId: 'staff-3',
    nip: 'BK-PP1-003',
    nama: 'Bambang Sugiantoro',
    jabatan: 'Teknisi Mesin',
    tanggal: '2026-10-01',
    jamMulai: '23:00',
    jamSelesai: '03:00',
    totalJam: 4,
    keperluan: 'Maintenance Mesin Darurat',
    uraianPekerjaan: 'Penggantian bearing dan pembersihan belt conveyor Lini 2 Rotary Tembakau',
    status: 'Disetujui',
    disetujuiOleh: 'Lalu M. Kurniawan (Manajer Operasional)',
    tanggalDiajukan: '2026-09-30 16:15'
  },
  {
    id: 'lmb-2',
    staffId: 'staff-5',
    nip: 'BK-PP1-005',
    nama: 'Heru Prasetyo',
    jabatan: 'Operator Senior',
    tanggal: '2026-10-02',
    jamMulai: '07:00',
    jamSelesai: '11:00',
    totalJam: 4,
    keperluan: 'Kejar Target Tonase Blend',
    uraianPekerjaan: 'Operasional darurat silo blending untuk penuhi kuota kirim mitra PT Djarum',
    status: 'Menunggu Persetujuan',
    tanggalDiajukan: '2026-09-30 18:30'
  }
];

export const INITIAL_CUTI: PengajuanCuti[] = [
  {
    id: 'cuti-1',
    staffId: 'staff-4',
    nip: 'BK-PP1-004',
    nama: 'Dewi Anggraini, S.T.',
    jabatan: 'Admin Lab QC',
    tipeCuti: 'Cuti Tahunan',
    tanggalMulai: '2026-10-12',
    tanggalSelesai: '2026-10-14',
    jumlahHari: 3,
    keterangan: 'Keperluan keluarga di luar kota',
    status: 'Disetujui',
    disetujuiOleh: 'Lalu M. Kurniawan (Manajer Operasional)',
    tanggalDiajukan: '2026-09-28'
  }
];

export const INITIAL_KPI: KpiScoring[] = [
  {
    id: 'kpi-1',
    staffId: 'staff-2',
    nip: 'BK-PP1-002',
    nama: 'Supardi Hartono',
    jabatan: 'Foreman / Mandor',
    periodeBulan: '2026-09',
    skorDisiplin: 95,   // 30% -> 28.5
    skorRendemen: 92,   // 40% -> 36.8
    skorK3: 90,         // 20% -> 18.0
    skorInisiatif: 88,  // 10% -> 8.8
    skorAkhir: 92.1,
    grade: 'A',
    rekomendasiInsentif: 'Insentif Penuh (Level 1)',
    catatanEvaluator: 'Manajemen shift sangat disiplin, target output sorting cengkeh terlampaui.',
    evaluator: 'Lalu M. Kurniawan'
  },
  {
    id: 'kpi-2',
    staffId: 'staff-3',
    nip: 'BK-PP1-003',
    nama: 'Bambang Sugiantoro',
    jabatan: 'Teknisi Mesin',
    periodeBulan: '2026-09',
    skorDisiplin: 90,   // 30% -> 27.0
    skorRendemen: 88,   // 40% -> 35.2
    skorK3: 95,         // 20% -> 19.0
    skorInisiatif: 85,  // 10% -> 8.5
    skorAkhir: 89.7,
    grade: 'B',
    rekomendasiInsentif: 'Insentif Standar (Level 2)',
    catatanEvaluator: 'Downtime mesin terkendali dengan baik, kepatuhan K3 sangat teladan.',
    evaluator: 'Lalu M. Kurniawan'
  },
  {
    id: 'kpi-3',
    staffId: 'staff-4',
    nip: 'BK-PP1-004',
    nama: 'Dewi Anggraini, S.T.',
    jabatan: 'Admin Lab QC',
    periodeBulan: '2026-09',
    skorDisiplin: 98,   // 30% -> 29.4
    skorRendemen: 94,   // 40% -> 37.6
    skorK3: 92,         // 20% -> 18.4
    skorInisiatif: 90,  // 10% -> 9.0
    skorAkhir: 94.4,
    grade: 'A',
    rekomendasiInsentif: 'Insentif Penuh (Level 1)',
    catatanEvaluator: 'Laporan uji kadar air dan rendemen selalu tepat waktu dan presisi tinggi.',
    evaluator: 'Lalu M. Kurniawan'
  },
  {
    id: 'kpi-4',
    staffId: 'staff-5',
    nip: 'BK-PP1-005',
    nama: 'Heru Prasetyo',
    jabatan: 'Operator Senior',
    periodeBulan: '2026-09',
    skorDisiplin: 85,   // 30% -> 25.5
    skorRendemen: 80,   // 40% -> 32.0
    skorK3: 88,         // 20% -> 17.6
    skorInisiatif: 78,  // 10% -> 7.8
    skorAkhir: 82.9,
    grade: 'B',
    rekomendasiInsentif: 'Insentif Standar (Level 2)',
    catatanEvaluator: 'Perlu peningkatan komunikasi antar shift malam dan pagi.',
    evaluator: 'Lalu M. Kurniawan'
  }
];

export const SWITCHBOARD_APPS: SwitchBoardApp[] = [
  {
    nomor: 1,
    id: 'mod-1',
    nama: '1. Monitoring Stock PP1',
    kategori: 'Supply Chain',
    deskripsi: 'Data stok Cengkeh, Tembakau, Krosok & Silo Blend terhubung live ke cloud Vercel.',
    url: 'https://monitoring-stock-pp-1-pro-api.vercel.app',
    isExternal: true,
    statusBadge: 'Live Vercel'
  },
  {
    nomor: 2,
    id: 'mod-2',
    nama: '2. Mutasi Stock',
    kategori: 'Supply Chain',
    deskripsi: 'Rekap arus masuk, keluar, dan transfer antar-gudang pabrik berbasis nomor batch.',
    url: '#mutasi-stock',
    isExternal: false,
    statusBadge: 'Aktif'
  },
  {
    nomor: 3,
    id: 'mod-3',
    nama: '3. General Monitoring',
    kategori: 'Operasional & Mesin',
    deskripsi: 'Telemetri OEE pabrik, status 4 lini mesin pengolahan, suhu, dan kelembaban (RH).',
    url: '#general-monitoring',
    isExternal: false,
    statusBadge: 'Aktif'
  },
  {
    nomor: 4,
    id: 'mod-4',
    nama: '4. Data Proses (4 Komoditas)',
    kategori: 'Operasional & Mesin',
    deskripsi: 'Fase 2 pengolahan: Sortasi Cengkeh, Rotary Tembakau, Destem Krosok, & Silo Blend.',
    url: '#data-proses',
    isExternal: false,
    statusBadge: 'Aktif'
  },
  {
    nomor: 5,
    id: 'mod-5',
    nama: '5. Log Surat & Arsip',
    kategori: 'Administrasi',
    deskripsi: 'Penomoran surat otomatis format [No]/PP1-BK/[Bulan]/[Tahun] & template kop resmi.',
    url: '#log-surat',
    isExternal: false,
    statusBadge: 'Aktif'
  },
  {
    nomor: 6,
    id: 'mod-6',
    nama: '6. Pengadaan SPP',
    kategori: 'Administrasi',
    deskripsi: 'Alur pengajuan digital suku cadang mesin dengan persetujuan manajerial berjenjang.',
    url: '#pengadaan-spp',
    isExternal: false,
    statusBadge: 'Aktif'
  },
  {
    nomor: 7,
    id: 'mod-7',
    nama: '7. CRM Clients Hub',
    kategori: 'Kemitraan',
    deskripsi: 'Database mitra industri rokok rekanan, jadwal kuota kirim, dan volume kontrak.',
    url: '#crm-clients',
    isExternal: false,
    statusBadge: 'Aktif'
  },
  {
    nomor: 8,
    id: 'mod-8',
    nama: '8. HR Pekerja & Staff PP1',
    kategori: 'Administrasi',
    deskripsi: 'Sistem komprehensif PHL (upah borongan, QR badge) & Staff (GPS geofence, shift, KPI).',
    url: '#hr-pekerja',
    isExternal: false,
    isCurrentApp: true,
    statusBadge: 'Aktif'
  }
];
