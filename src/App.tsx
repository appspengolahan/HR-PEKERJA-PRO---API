import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { TabPresensi } from './components/tabs/TabPresensi';
import { TabLembur } from './components/tabs/TabLembur';
import { TabRekapPresensi } from './components/tabs/TabRekapPresensi';
import { TabSlipUpah } from './components/tabs/TabSlipUpah';
import { TabDatabasePekerja } from './components/tabs/TabDatabasePekerja';
import { TabJadwalMutasi } from './components/tabs/TabJadwalMutasi';
import { TabProfilPekerja } from './components/tabs/TabProfilPekerja';
import { TabCalonPekerja } from './components/tabs/TabCalonPekerja';
import { TabDashboard } from './components/tabs/TabDashboard';
import { TabHakAkses } from './components/tabs/TabHakAkses';
import { RoleSimulatorBar } from './components/common/RoleSimulatorBar';

import { SuratIjinModal } from './components/modals/SuratIjinModal';
import { HelpModal } from './components/modals/HelpModal';
import { ScopeModal } from './components/modals/ScopeModal';
import { GasCenterModal } from './components/modals/GasCenterModal';
import { SwitchBoardModal } from './components/modals/SwitchBoardModal';
import { PublicShareModal } from './components/modals/PublicShareModal';
import { PublicPortal } from './components/public/PublicPortal';

import { gasClient } from './services/gasClient';
import { storageService } from './services/storageService';
import { LoginPage } from './components/auth/LoginPage';
import { authService, AuthUser, getUserAuthorizedUnitSekups } from './services/authService';
import { 
  MainTabType, 
  UserScope, 
  PekerjaData, 
  PresensiIjinRecord, 
  LemburRecord, 
  JadwalMutasiRecord, 
  CalonPekerjaRecord, 
  SuratIjinData,
  GasConfig 
} from './types';
import { INITIAL_PRESENSI_FALLBACK } from './data/initialPresensi';

// Fallback initial workers if completely offline before first sync
const INITIAL_PEKERJA_FALLBACK: PekerjaData[] = [
  { rowNum: 42, id: 37, nama: "DEDIK IRAWAN", unit: "Tembakau", sekup: "Proses", unitSekup: "Proses Tembakau", jabatan: "Harian", status: "TETAP", awalPKWT: "-", akhirPKWT: "-", statusPKWT: "TETAP", upahHarian: 150425.96 },
  { rowNum: 43, id: 38, nama: "UDIN HARIADI", unit: "Tembakau", sekup: "Proses", unitSekup: "Proses Tembakau", jabatan: "Harian", status: "TETAP", awalPKWT: "-", akhirPKWT: "-", statusPKWT: "TETAP", upahHarian: 146675.96 },
  { rowNum: 44, id: 39, nama: "ACHMAD JAINUL ARIFIN", unit: "Tembakau", sekup: "Proses", unitSekup: "Proses Tembakau", jabatan: "Harian", status: "TETAP", awalPKWT: "-", akhirPKWT: "-", statusPKWT: "TETAP", upahHarian: 146675.96 },
  { rowNum: 45, id: 40, nama: "ADELIA ELICSA PUTRI", unit: "Tembakau", sekup: "Proses", unitSekup: "Proses Tembakau", jabatan: "Harian", status: "PKWT", awalPKWT: "04/08/2025", akhirPKWT: "04/11/2025", statusPKWT: "Sudah Berakhir", upahHarian: 146263.92 },
  { rowNum: 46, id: 41, nama: "RIOFANI RISKI", unit: "Tembakau", sekup: "Proses", unitSekup: "Proses Tembakau", jabatan: "Harian", status: "PKWT", awalPKWT: "02/06/2025", akhirPKWT: "31/05/2027", statusPKWT: "PKWT Berjalan", upahHarian: 146353.33 },
  { rowNum: 54, id: 49, nama: "AURELGA AQNASYWA ISMA", unit: "Tembakau", sekup: "Proses", unitSekup: "Proses Tembakau", jabatan: "Harian", status: "PKWT", awalPKWT: "-", akhirPKWT: "20/10/2026", statusPKWT: "Segera Berakhir", upahHarian: 146263.92 },
  { rowNum: 55, id: 50, nama: "AMANDA FITRIA DEVI", unit: "Tembakau", sekup: "Proses", unitSekup: "Proses Tembakau", jabatan: "Harian", status: "PKWT", awalPKWT: "20/01/2026", akhirPKWT: "28/02/2029", statusPKWT: "PKWT Berjalan", upahHarian: 146263.92 },
  { rowNum: 58, id: 53, nama: "YUSEP KURNIAWAN", unit: "Tembakau", sekup: "Persediaan", unitSekup: "Persediaan Tembakau", jabatan: "Harian", status: "TETAP", awalPKWT: "02/09/2024", akhirPKWT: "31/08/2026", statusPKWT: "TETAP", upahHarian: 146353.33 },
  { rowNum: 59, id: 54, nama: "BENY YULIAN PRASTIO", unit: "Tembakau", sekup: "Persediaan", unitSekup: "Persediaan Tembakau", jabatan: "Harian", status: "PKWT", awalPKWT: "02/06/2025", akhirPKWT: "31/05/2027", statusPKWT: "PKWT Berjalan", upahHarian: 146353.33 },
  { rowNum: 66, id: 61, nama: "ACHMAD NURUL HIDAYAT", unit: "Cengkeh", sekup: "Proses", unitSekup: "Proses Cengkeh", jabatan: "Harian", status: "PKWT 1", awalPKWT: "21/07/2026", akhirPKWT: "21/07/2028", statusPKWT: "PKWT Berjalan", upahHarian: 146264 },
  { rowNum: 67, id: 62, nama: "MUHAMMAD MIFTAKHUL HAMDAN", unit: "Cengkeh", sekup: "Proses", unitSekup: "Proses Cengkeh", jabatan: "Harian", status: "PKWT 1", awalPKWT: "21/09/2026", akhirPKWT: "20/09/2028", statusPKWT: "PKWT Berjalan", upahHarian: 146264 }
];

export default function App() {
  // Authentication & Role Gate
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  // Navigation & Shell
  const [activeTab, setActiveTab] = useState<MainTabType>('dashboard');
  const [collapsed, setCollapsed] = useState<boolean>(() => storageService.getSidebarCollapsed());
  const [currentScope, setCurrentScope] = useState<UserScope>(() => {
    return localStorage.getItem('hrPekerjaScope') || 'ALL';
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals & Public Linktree Mode
  const [isPublicMode, setIsPublicMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'public' || window.location.hash.includes('public');
  });
  const [isPublicShareModalOpen, setIsPublicShareModalOpen] = useState(false);
  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isGasCenterOpen, setIsGasCenterOpen] = useState(false);
  const [isSwitchBoardOpen, setIsSwitchBoardOpen] = useState(false);
  const [suratIjinData, setSuratIjinData] = useState<SuratIjinData | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data Store
  const [pekerjaList, setPekerjaList] = useState<PekerjaData[]>(() => {
    const cached = localStorage.getItem('hr_pekerja_master');
    return cached ? JSON.parse(cached) : INITIAL_PEKERJA_FALLBACK;
  });
  const [unitSekupList, setUnitSekupList] = useState<string[]>([
    'Persediaan Blend', 'Persediaan Tembakau', 'Proses Blend', 'Proses Cengkeh', 'Proses Krosok', 'Proses Tembakau'
  ]);
  const [jenisIjinList, setJenisIjinList] = useState<string[]>([
    'Sakit (S Dokter)', 'Sakit (S Tangan)', 'Ijin (S Tangan)', 'Ijin Terlambat', 
    'Ijin Keluar Sementara', 'Ijin Pulang Awal', 'Ijin Normatif', 'Alpha'
  ]);
  const [switchAppUrl, setSwitchAppUrl] = useState('https://appspengolahan.github.io/HR-Karyawan-PP1/');
  const [presensiList, setPresensiList] = useState<PresensiIjinRecord[]>(() => {
    const cached = localStorage.getItem('hr_presensi_cache');
    return cached ? JSON.parse(cached) : INITIAL_PRESENSI_FALLBACK;
  });
  const [lemburList, setLemburList] = useState<LemburRecord[]>([]);
  const [jadwalMutasiList, setJadwalMutasiList] = useState<JadwalMutasiRecord[]>(() => {
    const cached = localStorage.getItem('hr_jadwal_mutasi_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        rowNum: 6,
        tanggalEfektif: "01/11/2026",
        nama: "DEDIK SETIAWAN",
        jenisMutasi: "Unit",
        nilaiLama: "Cengkeh",
        nilaiBaru: "Blend",
        keterangan: "Penyelarasan rotasi unit kerja mesin Blend",
        diinputOleh: "HR Admin"
      }
    ];
  });
  const [calonList, setCalonList] = useState<CalonPekerjaRecord[]>([
    {
      rowNum: 6,
      nama: "MUHAMMAD MIFTAKHUL HAMDAN",
      unit: "Cengkeh",
      sekup: "Proses",
      tanggalMulai: "07/07/2026",
      tanggalAkhir: "19/09/2026",
      durasi: 75,
      sisaHari: 0,
      status: "Lolos",
      jumlahPerpanjangan: 1,
      catatan: "Resmi lulus pelatihan dan diangkat menjadi Pekerja Harian #62"
    }
  ]);
  const [gasConfig, setGasConfig] = useState<GasConfig>(() => storageService.getGasConfig());

  // Background fetch live data directly from Google Sheets (Consolidated Single Request)
  const syncLiveData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Single consolidated request
      const res = await gasClient.getAllData(currentScope);
      if (res.status === 'success' && res.data) {
        const d = res.data as {
          pekerja?: PekerjaData[];
          unitSekupList?: string[];
          jenisIjinList?: string[];
          switchAppUrl?: string;
          jadwalMutasi?: JadwalMutasiRecord[];
          calonPekerja?: CalonPekerjaRecord[];
          presensi?: PresensiIjinRecord[];
          lembur?: { rows?: LemburRecord[] } | LemburRecord[];
        };

        if (d.pekerja && d.pekerja.length > 0) {
          setPekerjaList(d.pekerja);
          localStorage.setItem('hr_pekerja_master', JSON.stringify(d.pekerja));
        }
        if (d.unitSekupList && d.unitSekupList.length > 0) {
          setUnitSekupList(d.unitSekupList);
        }
        if (d.jenisIjinList && d.jenisIjinList.length > 0) {
          setJenisIjinList(d.jenisIjinList);
        }
        if (d.switchAppUrl) {
          setSwitchAppUrl(d.switchAppUrl);
        }
        if (d.jadwalMutasi) {
          setJadwalMutasiList(d.jadwalMutasi);
          localStorage.setItem('hr_jadwal_mutasi_cache', JSON.stringify(d.jadwalMutasi));
        }
        if (d.calonPekerja) {
          setCalonList(d.calonPekerja);
        }
        if (d.presensi && Array.isArray(d.presensi) && d.presensi.length > 0) {
          setPresensiList(d.presensi);
          localStorage.setItem('hr_presensi_cache', JSON.stringify(d.presensi));
        }
        if (d.lembur) {
          if (Array.isArray(d.lembur)) {
            setLemburList(d.lembur);
          } else if (d.lembur.rows && Array.isArray(d.lembur.rows)) {
            setLemburList(d.lembur.rows);
          }
        }

        // Fetch complete annual presensi history to guarantee full 12-month rekap accuracy
        try {
          const presensiHistory = await gasClient.getPresensi('', '2026', '', currentScope);
          if (presensiHistory.status === 'success' && Array.isArray(presensiHistory.data) && presensiHistory.data.length > 0) {
            setPresensiList(presensiHistory.data);
            localStorage.setItem('hr_presensi_cache', JSON.stringify(presensiHistory.data));
          }
        } catch (e) {
          console.warn('Presensi history fetch note:', e);
        }
      }
    } catch (err) {
      console.warn('Sync live data fallback:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [currentScope]);

  // Initial load
  useEffect(() => {
    syncLiveData();
  }, [syncLiveData]);

  const handleSelectScope = (scope: UserScope) => {
    setCurrentScope(scope);
    localStorage.setItem('hrPekerjaScope', scope);
  };

  const handleToggleSidebar = (val: boolean) => {
    setCollapsed(val);
    storageService.saveSidebarCollapsed(val);
  };

  // Presensi Handlers
  const handleFilterPresensi = async (bulan: string, tahun: string, nama: string) => {
    setIsRefreshing(true);
    try {
      const res = await gasClient.getPresensi(bulan, tahun, nama, currentScope);
      if (res.status === 'success' && Array.isArray(res.data)) {
        setPresensiList(res.data as PresensiIjinRecord[]);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddPresensi = async (data: {
    nama: string;
    jenisIjin: string;
    keperluan: string;
    lampiran: string;
    catatan: string;
    tanggalList: { tanggal: string; jamAwal: string; jamAkhir: string }[];
  }) => {
    // Optimistic local add
    const worker = pekerjaList.find(p => p.nama === data.nama);
    const newRecords: PresensiIjinRecord[] = data.tanggalList.map((t, idx) => {
      let durasiMenit = 0;
      if (t.jamAwal && t.jamAkhir) {
        const p1 = t.jamAwal.split(':').map(Number);
        const p2 = t.jamAkhir.split(':').map(Number);
        if (p1.length === 2 && p2.length === 2) {
          durasiMenit = Math.max(0, (p2[0] * 60 + p2[1]) - (p1[0] * 60 + p1[1]));
        }
      }
      if (data.jenisIjin.startsWith('Sakit') || data.jenisIjin.startsWith('Ijin (S Tangan)') || data.jenisIjin === 'Alpha' || data.jenisIjin === 'Ijin Normatif') {
        durasiMenit = 420;
      }
      return {
        rowNum: Date.now() + idx,
        tanggal: t.tanggal,
        nama: data.nama,
        unit: worker?.unit || '-',
        sekup: worker?.sekup || '-',
        jamAwal: t.jamAwal || '-',
        jamAkhir: t.jamAkhir || '-',
        durasiMenit,
        jenisIjin: data.jenisIjin,
        keperluan: data.keperluan,
        lampiran: data.lampiran,
        catatan: data.catatan,
        faktorPotongan: 0
      };
    });

    setPresensiList(prev => {
      const next = [...newRecords, ...prev];
      localStorage.setItem('hr_presensi_cache', JSON.stringify(next));
      return next;
    });

    try {
      const res = await gasClient.postMutation('addPresensiIjin', data, currentUser?.nama);
      if (res.status === 'success') {
        await syncLiveData();
      }
    } catch (err) {
      console.warn('Sync to Google Sheets pending/offline:', err);
    }
  };

  const handleUpdatePresensi = async (data: {
    rowNum: number;
    tanggal: string;
    jenisIjin: string;
    jamAwal: string;
    jamAkhir: string;
    keperluan: string;
    lampiran: string;
    catatan: string;
  }) => {
    setPresensiList(prev => {
      const next = prev.map(r => r.rowNum === data.rowNum ? { ...r, ...data } : r);
      localStorage.setItem('hr_presensi_cache', JSON.stringify(next));
      return next;
    });

    try {
      const res = await gasClient.postMutation('updatePresensiIjin', data, currentUser?.nama);
      if (res.status === 'success') {
        await syncLiveData();
      }
    } catch (err) {
      console.warn('Sync to Google Sheets pending/offline:', err);
    }
  };

  const handleDeletePresensi = async (rowNum: number) => {
    // Optimistic local deletion
    setPresensiList(prev => {
      const next = prev.filter(r => r.rowNum !== rowNum);
      localStorage.setItem('hr_presensi_cache', JSON.stringify(next));
      return next;
    });

    try {
      const res = await gasClient.postMutation('deletePresensiIjin', { rowNum }, currentUser?.nama);
      if (res.status === 'success') {
        await syncLiveData();
      }
    } catch (err) {
      console.warn('Sync to Google Sheets pending/offline:', err);
    }
  };

  const handleOpenSuratIjin = (rec: PresensiIjinRecord) => {
    const now = new Date();
    const bulans = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const tglCetak = `${now.getDate()} ${bulans[now.getMonth() + 1]}`;
    const thnCetak = String(now.getFullYear()).slice(-2);

    // Determine Indonesian day name
    let hariIndo = 'Senin';
    try {
      let d: Date | null = null;
      if (rec.tanggalIso) {
        d = new Date(rec.tanggalIso + 'T00:00:00');
      } else if (rec.tanggal && rec.tanggal.includes('/')) {
        const p = rec.tanggal.split('/');
        if (p.length === 3) {
          d = new Date(parseInt(p[2], 10), parseInt(p[1], 10) - 1, parseInt(p[0], 10));
        }
      }
      if (d && !isNaN(d.getTime())) {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        hariIndo = days[d.getDay()];
      }
    } catch (_) {
      hariIndo = 'Senin';
    }

    // Lookup worker for exact Jabatan and Unit/Sekup
    const worker = pekerjaList.find(p => p.nama === rec.nama);
    const jabatan = worker?.jabatan && worker.jabatan !== '-' ? worker.jabatan : 'Pekerja Harian';
    const unitSekup = worker?.sekup ? `${worker.unit} (${worker.sekup})` : (rec.unit || 'Cengkeh');

    // Accurate mapping to official 7 checkboxes
    let checkbox = 'tidakMasuk';
    const jLower = (rec.jenisIjin || '').toLowerCase();
    if (jLower.includes('normatif')) {
      checkbox = 'normatif';
    } else if (jLower.includes('terlambat')) {
      checkbox = 'terlambat';
    } else if (jLower.includes('sementara') || jLower.includes('keluar')) {
      checkbox = 'keluarSementara';
    } else if (jLower.includes('pulang') || jLower.includes('awal')) {
      checkbox = 'pulangCepat';
    } else if (jLower.includes('ekstern') || jLower.includes('tugas')) {
      checkbox = 'eksternal';
    } else if (jLower.includes('hadir') || jLower.includes('absen')) {
      checkbox = 'formKehadiran';
    } else {
      checkbox = 'tidakMasuk';
    }

    const durasi = Number(rec.durasiMenit) || 0;

    // Set time fields logically based on type
    let jamMasuk = '-';
    let jamKeluar = '-';
    let jamMasukKembali = '-';

    if (checkbox === 'terlambat') {
      jamMasuk = rec.jamAkhir || '08:00';
    } else if (checkbox === 'pulangCepat') {
      jamKeluar = rec.jamAwal || '14:00';
    } else if (checkbox === 'keluarSementara') {
      jamKeluar = rec.jamAwal || '10:00';
      jamMasukKembali = rec.jamAkhir || '11:00';
    }

    setSuratIjinData({
      nama: rec.nama,
      jabatan: jabatan,
      divisi: 'Produksi I',
      unit: unitSekup,
      checkbox,
      isBulanan: false,
      hari: hariIndo,
      tanggal: rec.tanggal || `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`,
      keperluan: rec.keperluan || '-',
      jamMasuk,
      jamKeluar,
      jamMasukKembali,
      jamBagian: Math.floor(durasi / 60),
      menitBagian: durasi % 60,
      tglCetak,
      thnCetak,
      namaTtd: rec.nama
    });
  };

  // Lembur Handlers
  const handleSaveLemburBatch = async (data: {
    tanggal: string;
    namaList: string[];
    kategori: string;
    jamMulai: string;
    jamSelesai: string;
  }) => {
    const res = await gasClient.postMutation('submitLemburBatch', data);
    if (res.status === 'success') {
      await syncLiveData();
    } else {
      throw new Error(res.message || 'Gagal menyimpan lembur batch');
    }
  };

  const handleFilterRekapLembur = async (tglAwal: string, tglAkhir: string, unit: string, sekup: string) => {
    setIsRefreshing(true);
    try {
      const res = await gasClient.getRekapLembur(tglAwal, tglAkhir, unit, sekup, currentScope);
      if (res.status === 'success' && res.data) {
        setLemburList((res.data as { rows: LemburRecord[] }).rows || []);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Pekerja Database Handlers
  const handleAddPekerja = async (data: Partial<PekerjaData>) => {
    const newId = pekerjaList.length + 1;
    const newWorker: PekerjaData = {
      rowNum: Date.now(),
      id: newId,
      nama: data.nama || '',
      unit: data.unit || 'Cengkeh',
      sekup: data.sekup || 'Proses',
      unitSekup: (data.sekup && data.unit) ? `${data.sekup} ${data.unit}` : 'Proses Cengkeh',
      jabatan: data.jabatan || 'Harian',
      status: data.status || 'PKWT',
      awalPKWT: data.awalPKWT || '-',
      akhirPKWT: data.akhirPKWT || '-',
      statusPKWT: data.statusPKWT || 'PKWT Berjalan',
      upahHarian: Number(data.upahHarian) || 146675.96,
      pendidikanTerakhir: data.pendidikanTerakhir || '-'
    };

    setPekerjaList(prev => {
      const next = [...prev, newWorker];
      localStorage.setItem('hr_pekerja_master', JSON.stringify(next));
      return next;
    });

    try {
      const res = await gasClient.postMutation('addNewPekerja', data, currentUser?.nama);
      if (res.status === 'success') {
        await syncLiveData();
      }
    } catch (err) {
      console.warn('Sync new pekerja note:', err);
    }
  };

  const handleUpdatePekerja = async (data: Partial<PekerjaData>) => {
    setPekerjaList(prev => {
      const next = prev.map(p => (p.rowNum === data.rowNum || p.id === data.id) ? { ...p, ...data } : p);
      localStorage.setItem('hr_pekerja_master', JSON.stringify(next));
      return next;
    });

    try {
      const res = await gasClient.postMutation('updatePekerja', data, currentUser?.nama);
      if (res.status === 'success') {
        await syncLiveData();
      }
    } catch (err) {
      console.warn('Sync update pekerja note:', err);
    }
  };

  const handleDeletePekerja = async (rowNum: number, nama: string) => {
    setPekerjaList(prev => {
      const next = prev.filter(p => p.rowNum !== rowNum && p.nama !== nama);
      localStorage.setItem('hr_pekerja_master', JSON.stringify(next));
      return next;
    });

    try {
      const res = await gasClient.postMutation('deletePekerja', { rowNum, nama }, currentUser?.nama);
      if (res.status === 'success') {
        await syncLiveData();
      }
    } catch (err) {
      console.warn('Sync delete pekerja note:', err);
    }
  };

  const handleSubmitMutasi = async (data: {
    nama: string;
    jenisMutasi: string;
    tanggalEfektif: string;
    nilaiBaru: string;
    keterangan: string;
  }) => {
    // Format date if YYYY-MM-DD -> DD/MM/YYYY
    const parts = data.tanggalEfektif.split('-');
    const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : data.tanggalEfektif;
    
    // Find current worker for old value
    const targetWorker = pekerjaList.find(p => p.nama.trim().toUpperCase() === data.nama.trim().toUpperCase());
    let nilaiLama = '';
    if (targetWorker) {
      if (data.jenisMutasi === 'Unit') nilaiLama = targetWorker.unit;
      else if (data.jenisMutasi === 'Sekup') nilaiLama = targetWorker.sekup;
      else if (data.jenisMutasi === 'Status Kepegawaian') nilaiLama = targetWorker.status;
      else if (data.jenisMutasi === 'Upah Harian') nilaiLama = `Rp ${Math.round(targetWorker.upahHarian).toLocaleString('id-ID')}`;
      else if (data.jenisMutasi === 'Pendidikan Terakhir') nilaiLama = targetWorker.pendidikanTerakhir || '';
      else if (data.jenisMutasi === 'Akhir PKWT') nilaiLama = targetWorker.akhirPKWT;
      else nilaiLama = targetWorker.jabatan || '';
    }

    const newScheduleRecord: JadwalMutasiRecord = {
      rowNum: Date.now(),
      tanggalEfektif: formattedDate,
      nama: data.nama,
      jenisMutasi: data.jenisMutasi,
      nilaiLama,
      nilaiBaru: data.nilaiBaru,
      keterangan: data.keterangan || '',
      diinputOleh: currentUser?.nama || 'HR Admin'
    };

    setJadwalMutasiList(prev => {
      const filtered = prev.filter(m => m.nama.trim().toUpperCase() !== data.nama.trim().toUpperCase());
      const next = [newScheduleRecord, ...filtered];
      localStorage.setItem('hr_jadwal_mutasi_cache', JSON.stringify(next));
      return next;
    });

    try {
      const res = await gasClient.postMutation('submitMutasi', data, currentUser?.nama);
      if (res.status === 'success') {
        await syncLiveData();
      }
    } catch (err) {
      console.warn('Sync submit mutasi to GAS note:', err);
    }
  };

  // Jadwal Mutasi Handlers
  const handleEditMutasiTerjadwal = async (rowNum: number, data: { tanggalEfektif: string; nilaiBaru: string; keterangan: string }) => {
    const parts = data.tanggalEfektif.split('-');
    const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : data.tanggalEfektif;

    setJadwalMutasiList(prev => {
      const next = prev.map(m => m.rowNum === rowNum ? { 
        ...m, 
        tanggalEfektif: formattedDate, 
        nilaiBaru: data.nilaiBaru, 
        keterangan: data.keterangan 
      } : m);
      localStorage.setItem('hr_jadwal_mutasi_cache', JSON.stringify(next));
      return next;
    });

    try {
      const res = await gasClient.postMutation('editMutasiTerjadwal', { rowNum, ...data }, currentUser?.nama);
      if (res.status === 'success') {
        await syncLiveData();
      }
    } catch (err) {
      console.warn('Sync edit mutasi to GAS note:', err);
    }
  };

  const handleCancelMutasiTerjadwal = async (rowNum: number) => {
    setJadwalMutasiList(prev => {
      const next = prev.filter(m => m.rowNum !== rowNum);
      localStorage.setItem('hr_jadwal_mutasi_cache', JSON.stringify(next));
      return next;
    });

    try {
      const res = await gasClient.postMutation('batalkanMutasiTerjadwal', { rowNum }, currentUser?.nama);
      if (res.status === 'success') {
        await syncLiveData();
      }
    } catch (err) {
      console.warn('Sync cancel mutasi to GAS note:', err);
    }
  };

  // Calon Pekerja Handlers
  const handleAddCalon = async (data: Partial<CalonPekerjaRecord>) => {
    const res = await gasClient.postMutation('addCalonPekerja', data);
    if (res.status === 'success') {
      await syncLiveData();
    } else {
      throw new Error(res.message || 'Gagal menambah calon pekerja');
    }
  };

  const handleUpdateStatusCalon = async (data: {
    rowNum: number;
    status: 'Lolos' | 'Diperpanjang' | 'Tidak Lolos';
    unit?: string;
    sekup?: string;
    statusKepegawaian?: string;
    upahHarian?: number;
    awalPKWT?: string;
    tanggalAkhirBaru?: string;
    alasan?: string;
  }) => {
    // Optimistic update: jika lolos, langsung daftarkan ke pekerjaList lokal
    const targetCalon = calonList.find(c => c.rowNum === data.rowNum);
    if (data.status === 'Lolos' && targetCalon) {
      const alreadyInList = pekerjaList.some(p => p.nama.trim().toUpperCase() === targetCalon.nama.trim().toUpperCase());
      if (!alreadyInList) {
        const newWorker: PekerjaData = {
          rowNum: 6 + pekerjaList.length,
          id: pekerjaList.length + 1,
          nama: targetCalon.nama,
          unit: data.unit || targetCalon.unit,
          sekup: data.sekup || targetCalon.sekup,
          unitSekup: `${data.sekup || targetCalon.sekup} ${data.unit || targetCalon.unit}`,
          jabatan: 'Harian',
          status: data.statusKepegawaian || 'PKWT 1',
          awalPKWT: data.awalPKWT || new Date().toLocaleDateString('id-ID'),
          akhirPKWT: '-',
          statusPKWT: 'PKWT Berjalan',
          upahHarian: data.upahHarian || 146264,
          pendidikanTerakhir: '-'
        };
        setPekerjaList(prev => [...prev, newWorker]);
      }
      setCalonList(prev => prev.map(c => c.rowNum === data.rowNum ? { ...c, status: 'Lolos' } : c));
    }

    const res = await gasClient.postMutation('updateStatusCalon', data);
    if (res.status === 'success') {
      await syncLiveData();
    } else {
      throw new Error(res.message || 'Gagal mengupdate status calon');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // JENDELA PORTAL PUBLIK (LINKTREE / TAMU) - TANPA PERLU LOGIN
  if (isPublicMode) {
    return (
      <PublicPortal
        pekerjaList={pekerjaList}
        presensiList={presensiList}
        onExitPublic={() => {
          const url = new URL(window.location.href);
          url.searchParams.delete('view');
          window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
          setIsPublicMode(false);
        }}
        onSwitchToLogin={() => {
          const url = new URL(window.location.href);
          url.searchParams.delete('view');
          window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
          setIsPublicMode(false);
        }}
      />
    );
  }

  // GERBANG KEAMANAN UTAMA: WAJIB LOGIN
  if (!currentUser) {
    return (
      <LoginPage
        pekerjaList={pekerjaList}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          const authScopes = getUserAuthorizedUnitSekups(user);
          if (user.scope && user.scope !== 'ALL') {
            setCurrentScope(user.scope);
            localStorage.setItem('hrPekerjaScope', user.scope);
          } else if (!authScopes.includes('ALL') && authScopes.length > 0) {
            setCurrentScope(authScopes[0]);
            localStorage.setItem('hrPekerjaScope', authScopes[0]);
          } else {
            setCurrentScope('ALL');
            localStorage.setItem('hrPekerjaScope', 'ALL');
          }
          if (user.allowedTabs && user.allowedTabs.length > 0) {
            setActiveTab(user.allowedTabs[0]);
          }
        }}
        onOpenPublicPortal={() => setIsPublicMode(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex">
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={handleToggleSidebar}
        onOpenGasCenter={() => setIsGasCenterOpen(true)}
        onOpenSwitchBoard={() => setIsSwitchBoardOpen(true)}
        onOpenPublicShareModal={() => setIsPublicShareModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        mobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Workspace Area */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 pb-24 lg:pb-12 ${
          collapsed ? 'lg:ml-[68px] ml-0' : 'lg:ml-64 ml-0'
        }`}
      >
        
        {/* Header */}
        <Header
          activeTab={activeTab}
          currentScope={currentScope}
          collapsed={collapsed}
          onRefreshData={syncLiveData}
          isRefreshing={isRefreshing}
          onOpenSwitchBoard={() => setIsSwitchBoardOpen(true)}
          onOpenGasCenter={() => setIsGasCenterOpen(true)}
          onOpenScopeModal={() => setIsScopeModalOpen(true)}
          onOpenHelpModal={() => setIsHelpModalOpen(true)}
          onOpenPublicShareModal={() => setIsPublicShareModalOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          switchAppUrl={switchAppUrl}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Role Simulator Bar for Developer, PM & Site Engineer */}
        <div className="mt-16">
          <RoleSimulatorBar
            currentUser={currentUser}
            pekerjaList={pekerjaList}
            onSwitchUser={(newUser) => {
              setCurrentUser(newUser);
              const authScopes = getUserAuthorizedUnitSekups(newUser);
              if (newUser.role === 'Pekerja Harian') {
                setActiveTab('slip');
              } else if (!newUser.allowedTabs.includes(activeTab)) {
                setActiveTab(newUser.allowedTabs[0] || 'dashboard');
              }
              if (newUser.scope && newUser.scope !== 'ALL') {
                setCurrentScope(newUser.scope);
                localStorage.setItem('hrPekerjaScope', newUser.scope);
              } else if (!authScopes.includes('ALL') && authScopes.length > 0) {
                setCurrentScope(authScopes[0]);
                localStorage.setItem('hrPekerjaScope', authScopes[0]);
              } else {
                setCurrentScope('ALL');
                localStorage.setItem('hrPekerjaScope', 'ALL');
              }
            }}
          />
        </div>

        {/* Tab Panel Viewports */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          
          {activeTab === 'dashboard' && (
            <TabDashboard
              pekerjaList={pekerjaList}
              presensiList={presensiList}
              currentScope={currentScope}
              onNavigateTab={setActiveTab}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'presensi' && (
            <TabPresensi
              presensiList={presensiList}
              pekerjaList={pekerjaList}
              jenisIjinList={jenisIjinList}
              currentScope={currentScope}
              onAddPresensi={handleAddPresensi}
              onUpdatePresensi={handleUpdatePresensi}
              onDeletePresensi={handleDeletePresensi}
              onOpenSuratIjin={handleOpenSuratIjin}
              onFilterChange={handleFilterPresensi}
              isLoading={isRefreshing}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'lembur' && (
            <TabLembur
              lemburList={lemburList}
              pekerjaList={pekerjaList}
              currentScope={currentScope}
              onSaveLemburBatch={handleSaveLemburBatch}
              onFilterRekap={handleFilterRekapLembur}
              isLoading={isRefreshing}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'rekap' && (
            <TabRekapPresensi
              pekerjaList={pekerjaList}
              presensiList={presensiList}
              currentScope={currentScope}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'slip' && (
            <TabSlipUpah
              pekerjaList={pekerjaList}
              currentScope={currentScope}
              lockedNama={currentUser?.role === 'Pekerja Harian' ? currentUser.workerRecord?.nama : undefined}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'database' && (
            <TabDatabasePekerja
              pekerjaList={pekerjaList}
              jadwalMutasiList={jadwalMutasiList}
              currentScope={currentScope}
              onAddPekerja={handleAddPekerja}
              onUpdatePekerja={handleUpdatePekerja}
              onDeletePekerja={handleDeletePekerja}
              onSubmitMutasi={handleSubmitMutasi}
              isLoading={isRefreshing}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'jadwalmutasi' && (
            <TabJadwalMutasi
              jadwalList={jadwalMutasiList}
              onEditMutasi={handleEditMutasiTerjadwal}
              onCancelMutasi={handleCancelMutasiTerjadwal}
              isLoading={isRefreshing}
            />
          )}

          {activeTab === 'profil' && (
            <TabProfilPekerja
              pekerjaList={pekerjaList}
              currentScope={currentScope}
              lockedNama={currentUser?.role === 'Pekerja Harian' ? currentUser.workerRecord?.nama : undefined}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'calon' && (
            <TabCalonPekerja
              calonList={calonList}
              pekerjaList={pekerjaList}
              currentScope={currentScope}
              onAddCalon={handleAddCalon}
              onUpdateStatusCalon={handleUpdateStatusCalon}
              isLoading={isRefreshing}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'hakakses' && (
            <TabHakAkses
              currentUser={currentUser}
              pekerjaList={pekerjaList}
              onRefreshUserSession={(updatedUser) => setCurrentUser(updatedUser)}
            />
          )}

        </main>

        <footer className="text-center text-xs text-slate-400 py-6 print:hidden">
          HR Pekerja All Rights Reserved • Divisi Produksi I • Developed by Lalu Mahendra
        </footer>

      </div>

      {/* Modals */}
      <SuratIjinModal
        isOpen={!!suratIjinData}
        onClose={() => setSuratIjinData(null)}
        data={suratIjinData}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <ScopeModal
        isOpen={isScopeModalOpen}
        onClose={() => setIsScopeModalOpen(false)}
        currentScope={currentScope}
        unitSekupList={unitSekupList}
        onSelectScope={handleSelectScope}
        currentUser={currentUser}
      />

      <GasCenterModal
        isOpen={isGasCenterOpen}
        onClose={() => setIsGasCenterOpen(false)}
        config={gasConfig}
        onSaveConfig={(newCfg) => {
          setGasConfig(newCfg);
          storageService.saveGasConfig(newCfg);
        }}
      />

      <SwitchBoardModal
        isOpen={isSwitchBoardOpen}
        onClose={() => setIsSwitchBoardOpen(false)}
      />

      <PublicShareModal
        isOpen={isPublicShareModalOpen}
        onClose={() => setIsPublicShareModalOpen(false)}
        onOpenPreview={() => setIsPublicMode(true)}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSwitchBoard={() => setIsSwitchBoardOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        currentUser={currentUser}
      />

    </div>
  );
}
