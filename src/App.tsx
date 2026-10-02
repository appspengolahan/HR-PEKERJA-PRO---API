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

import { SuratIjinModal } from './components/modals/SuratIjinModal';
import { HelpModal } from './components/modals/HelpModal';
import { ScopeModal } from './components/modals/ScopeModal';
import { GasCenterModal } from './components/modals/GasCenterModal';
import { SwitchBoardModal } from './components/modals/SwitchBoardModal';

import { gasClient } from './services/gasClient';
import { storageService } from './services/storageService';
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
  // Navigation & Shell
  const [activeTab, setActiveTab] = useState<MainTabType>('dashboard');
  const [collapsed, setCollapsed] = useState<boolean>(() => storageService.getSidebarCollapsed());
  const [currentScope, setCurrentScope] = useState<UserScope>(() => {
    return localStorage.getItem('hrPekerjaScope') || 'ALL';
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isGasCenterOpen, setIsGasCenterOpen] = useState(false);
  const [isSwitchBoardOpen, setIsSwitchBoardOpen] = useState(false);
  const [suratIjinData, setSuratIjinData] = useState<SuratIjinData | null>(null);

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
  const [presensiList, setPresensiList] = useState<PresensiIjinRecord[]>([]);
  const [lemburList, setLemburList] = useState<LemburRecord[]>([]);
  const [jadwalMutasiList, setJadwalMutasiList] = useState<JadwalMutasiRecord[]>([]);
  const [calonList, setCalonList] = useState<CalonPekerjaRecord[]>([
    {
      rowNum: 6,
      nama: "MUHAMMAD MIFTAKHUL HAMDAN",
      unit: "Cengkeh",
      sekup: "Proses",
      tanggalMulai: "07/07/2026",
      tanggalAkhir: "19/09/2026",
      durasi: 75,
      sisaHari: -12,
      status: "Sedang Berjalan",
      jumlahPerpanjangan: 1,
      catatan: "Pelatihan sortir bahan mentah"
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
        }
        if (d.calonPekerja) {
          setCalonList(d.calonPekerja);
        }
        if (d.presensi && Array.isArray(d.presensi)) {
          setPresensiList(d.presensi);
        }
        if (d.lembur) {
          if (Array.isArray(d.lembur)) {
            setLemburList(d.lembur);
          } else if (d.lembur.rows && Array.isArray(d.lembur.rows)) {
            setLemburList(d.lembur.rows);
          }
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
    const res = await gasClient.postMutation('addPresensiIjin', data);
    if (res.status === 'success') {
      await syncLiveData();
    } else {
      throw new Error(res.message || 'Gagal menyimpan ijin');
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
    const res = await gasClient.postMutation('updatePresensiIjin', data);
    if (res.status === 'success') {
      await syncLiveData();
    } else {
      throw new Error(res.message || 'Gagal mengupdate ijin');
    }
  };

  const handleDeletePresensi = async (rowNum: number) => {
    const res = await gasClient.postMutation('deletePresensiIjin', { rowNum });
    if (res.status === 'success') {
      await syncLiveData();
    } else {
      throw new Error(res.message || 'Gagal menghapus ijin');
    }
  };

  const handleOpenSuratIjin = (rec: PresensiIjinRecord) => {
    const tz = 'Asia/Jakarta';
    const now = new Date();
    const bulans = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const tglCetak = `${now.getDate()} ${bulans[now.getMonth() + 1]}`;
    const thnCetak = String(now.getFullYear()).slice(-2);

    let checkbox = 'terlambat';
    if (rec.jenisIjin === 'Ijin Normatif') checkbox = 'normatif';
    else if (rec.jenisIjin.startsWith('Sakit') || rec.jenisIjin.startsWith('Ijin (S Tangan)') || rec.jenisIjin === 'Alpha') checkbox = 'tidakMasuk';
    else if (rec.jenisIjin === 'Ijin Keluar Sementara') checkbox = 'keluarSementara';
    else if (rec.jenisIjin === 'Ijin Pulang Awal') checkbox = 'pulangCepat';

    const durasi = Number(rec.durasiMenit) || 0;

    setSuratIjinData({
      nama: rec.nama,
      jabatan: 'Harian',
      divisi: 'Produksi I',
      unit: rec.unit,
      checkbox,
      hari: 'Hari Kerja',
      tanggal: rec.tanggal,
      keperluan: rec.keperluan,
      jamMasuk: rec.jenisIjin === 'Ijin Terlambat' ? rec.jamAkhir : '-',
      jamKeluar: rec.jenisIjin === 'Ijin Pulang Awal' ? rec.jamAwal : '-',
      jamMasukKembali: rec.jenisIjin === 'Ijin Keluar Sementara' ? rec.jamAkhir : '-',
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
    const res = await gasClient.postMutation('addNewPekerja', data);
    if (res.status === 'success') {
      await syncLiveData();
    } else {
      throw new Error(res.message || 'Gagal menambah pekerja');
    }
  };

  const handleUpdatePekerja = async (data: Partial<PekerjaData>) => {
    const res = await gasClient.postMutation('updatePekerja', data);
    if (res.status === 'success') {
      await syncLiveData();
    } else {
      throw new Error(res.message || 'Gagal mengupdate pekerja');
    }
  };

  const handleDeletePekerja = async (rowNum: number, nama: string) => {
    const res = await gasClient.postMutation('deletePekerja', { rowNum, nama });
    if (res.status === 'success') {
      await syncLiveData();
    } else {
      throw new Error(res.message || 'Gagal menghapus pekerja');
    }
  };

  const handleSubmitMutasi = async (data: {
    nama: string;
    jenisMutasi: string;
    tanggalEfektif: string;
    nilaiBaru: string;
    keterangan: string;
  }) => {
    const res = await gasClient.postMutation('submitMutasi', data);
    if (res.status === 'success') {
      await syncLiveData();
    } else {
      throw new Error(res.message || 'Gagal mengajukan mutasi');
    }
  };

  // Jadwal Mutasi Handlers
  const handleEditMutasiTerjadwal = async (rowNum: number, data: { tanggalEfektif: string; nilaiBaru: string; keterangan: string }) => {
    const res = await gasClient.postMutation('editMutasiTerjadwal', { rowNum, ...data });
    if (res.status === 'success') {
      await syncLiveData();
    } else {
      throw new Error(res.message || 'Gagal mengedit mutasi');
    }
  };

  const handleCancelMutasiTerjadwal = async (rowNum: number) => {
    const res = await gasClient.postMutation('batalkanMutasiTerjadwal', { rowNum });
    if (res.status === 'success') {
      await syncLiveData();
    } else {
      throw new Error(res.message || 'Gagal membatalkan mutasi');
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
    const res = await gasClient.postMutation('updateStatusCalon', data);
    if (res.status === 'success') {
      await syncLiveData();
    } else {
      throw new Error(res.message || 'Gagal mengupdate status calon');
    }
  };

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
      />

      {/* Main Workspace Area */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 pb-12 ${
          collapsed ? 'ml-[68px]' : 'ml-64'
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
          switchAppUrl={switchAppUrl}
        />

        {/* Tab Panel Viewports */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 mt-16 max-w-7xl w-full mx-auto">
          
          {activeTab === 'dashboard' && (
            <TabDashboard
              pekerjaList={pekerjaList}
              currentScope={currentScope}
              onNavigateTab={setActiveTab}
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
            />
          )}

          {activeTab === 'rekap' && (
            <TabRekapPresensi
              pekerjaList={pekerjaList}
              currentScope={currentScope}
            />
          )}

          {activeTab === 'slip' && (
            <TabSlipUpah
              pekerjaList={pekerjaList}
              currentScope={currentScope}
            />
          )}

          {activeTab === 'database' && (
            <TabDatabasePekerja
              pekerjaList={pekerjaList}
              currentScope={currentScope}
              onAddPekerja={handleAddPekerja}
              onUpdatePekerja={handleUpdatePekerja}
              onDeletePekerja={handleDeletePekerja}
              onSubmitMutasi={handleSubmitMutasi}
              isLoading={isRefreshing}
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
            />
          )}

          {activeTab === 'calon' && (
            <TabCalonPekerja
              calonList={calonList}
              currentScope={currentScope}
              onAddCalon={handleAddCalon}
              onUpdateStatusCalon={handleUpdateStatusCalon}
              isLoading={isRefreshing}
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

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSwitchBoard={() => setIsSwitchBoardOpen(true)}
      />

    </div>
  );
}
