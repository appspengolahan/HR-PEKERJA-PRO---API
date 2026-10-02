import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  ShieldCheck, 
  CalendarCheck, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  Printer, 
  ArrowRight, 
  TrendingUp, 
  FileText, 
  AlertOctagon, 
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Receipt
} from 'lucide-react';
import { PekerjaData, MainTabType, PresensiIjinRecord } from '../../types';
import { getPKWTStatusInfo } from '../../utils/pkwtUtils';
import { gasClient } from '../../services/gasClient';

interface TabDashboardProps {
  pekerjaList: PekerjaData[];
  presensiList?: PresensiIjinRecord[];
  currentScope: string;
  onNavigateTab: (tab: MainTabType) => void;
}

export const TabDashboard: React.FC<TabDashboardProps> = ({
  pekerjaList,
  presensiList = [],
  currentScope,
  onNavigateTab
}) => {
  const [selectedBulan, setSelectedBulan] = useState(String(new Date().getMonth() + 1));
  const [selectedTahun, setSelectedTahun] = useState(String(new Date().getFullYear()));
  
  const [summaryPresensi, setSummaryPresensi] = useState<PresensiIjinRecord[]>(presensiList);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [lastLoadedAt, setLastLoadedAt] = useState<string | null>(null);

  const filteredPekerja = pekerjaList.filter(p => {
    return currentScope === 'ALL' || p.unitSekup === currentScope;
  });

  // Sinkronisasi status PKWT dengan tanggal akhir nyata
  const enrichedPekerja = filteredPekerja.map(p => ({
    ...p,
    pkwtInfo: getPKWTStatusInfo(p.status, p.akhirPKWT)
  }));

  const totalPekerja = enrichedPekerja.length;
  const tetapCount = enrichedPekerja.filter(p => p.status === 'TETAP').length;
  const pkwtCount = totalPekerja - tetapCount;
  
  // 1. Segera Berakhir (0 <= sisaHari <= 26)
  const segeraBerakhirAlerts = enrichedPekerja.filter(p => p.pkwtInfo.isUrgent);
  
  // 2. Sudah Berakhir / Kadaluarsa (sisaHari < 0 dan bukan TETAP)
  const expiredAlerts = enrichedPekerja.filter(p => p.pkwtInfo.isExpired);

  // Map upah harian pekerja
  const workerWageMap = new Map<string, number>();
  filteredPekerja.forEach(p => {
    workerWageMap.set(p.nama.trim().toUpperCase(), Number(p.upahHarian) || 146675.96);
  });

  // Fungsi memuat data ringkasan asli dari Google Sheets
  const loadRingkasanData = useCallback(async (b = selectedBulan, t = selectedTahun) => {
    setIsLoadingSummary(true);
    try {
      const res = await gasClient.getPresensi(b, t, '', currentScope);
      if (res.status === 'success' && Array.isArray(res.data)) {
        setSummaryPresensi(res.data as PresensiIjinRecord[]);
        setLastLoadedAt(new Date().toLocaleTimeString('id-ID'));
      }
    } catch (err) {
      console.error('Gagal mengambil data ringkasan:', err);
    } finally {
      setIsLoadingSummary(false);
    }
  }, [selectedBulan, selectedTahun, currentScope]);

  // Load awal saat komponen aktif
  useEffect(() => {
    loadRingkasanData(selectedBulan, selectedTahun);
  }, [loadRingkasanData]);

  // Filter presensi yang menyebabkan potongan upah (faktorPotongan > 0)
  const deductionRecords = summaryPresensi.filter(r => {
    const f = Number(r.faktorPotongan);
    return !isNaN(f) && f > 0;
  });

  let totalPotonganNominal = 0;
  let totalHariPotong = 0;
  const deductionDetailList: Array<{
    tanggal: string;
    nama: string;
    unit: string;
    sekup: string;
    jenisIjin: string;
    keperluan: string;
    upahHarian: number;
    faktor: number;
    subtotal: number;
  }> = [];

  deductionRecords.forEach(r => {
    const f = Number(r.faktorPotongan) || 0;
    const upah = workerWageMap.get(r.nama.trim().toUpperCase()) || 146263.92;
    const sub = upah * f;
    totalPotonganNominal += sub;
    totalHariPotong += f;

    deductionDetailList.push({
      tanggal: r.tanggal,
      nama: r.nama,
      unit: r.unit,
      sekup: r.sekup,
      jenisIjin: r.jenisIjin,
      keperluan: r.keperluan,
      upahHarian: upah,
      faktor: f,
      subtotal: sub
    });
  });

  // Total Beban Upah calculation (Standard 26 hari kerja/bulan)
  const HARI_KERJA_TERSEDIA = 26;
  const totalKetentuan = filteredPekerja.reduce((acc, p) => acc + (p.upahHarian * HARI_KERJA_TERSEDIA), 0);
  const totalSetelahPotongan = totalKetentuan - totalPotonganNominal;

  const bulanOptions = [
    { val: '1', label: 'Januari' }, { val: '2', label: 'Februari' }, { val: '3', label: 'Maret' },
    { val: '4', label: 'April' }, { val: '5', label: 'Mei' }, { val: '6', label: 'Juni' },
    { val: '7', label: 'Juli' }, { val: '8', label: 'Agustus' }, { val: '9', label: 'September' },
    { val: '10', label: 'Oktober' }, { val: '11', label: 'November' }, { val: '12', label: 'Desember' }
  ];

  const namaBulanTerpilih = bulanOptions.find(b => b.val === selectedBulan)?.label || 'September';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner with Entri Terkini Badge */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white p-6 rounded-2xl shadow-md border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold tracking-wider text-emerald-300 uppercase">
              DIVISI PRODUKSI I — PEKERJA HARIAN
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight">
            Dashboard Eksekutif HR Pekerja
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Sistem terintegrasi presensi, lembur bertingkat, slip upah mingguan, database 62 pekerja, mutasi rotasi, dan evaluasi masa pelatihan.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onNavigateTab('presensi')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <CalendarCheck className="w-4 h-4" />
            + Catat Ijin
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Cetak Ringkasan
          </button>
        </div>
      </div>

      {/* 1. PKWT Segera Berakhir Alert Card (Jatuh Tempo <= 26 Hari) */}
      {segeraBerakhirAlerts.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 text-xs text-amber-950 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Peringatan: Masa Berlaku PKWT Segera Berakhir (&le; 26 Hari)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-200 text-amber-900 font-bold">
                {segeraBerakhirAlerts.length} Pekerja
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('database')}
              className="font-bold text-amber-800 hover:underline flex items-center gap-1 text-[11px]"
            >
              Buka di Database Pekerja <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] bg-white rounded-xl border border-amber-200 overflow-hidden">
              <thead className="bg-amber-100/70 font-bold text-amber-950">
                <tr>
                  <th className="p-2.5">Nama Pekerja</th>
                  <th className="p-2.5">Unit &amp; Sekup</th>
                  <th className="p-2.5">Status Kepegawaian</th>
                  <th className="p-2.5">Akhir PKWT</th>
                  <th className="p-2.5">Sisa Waktu</th>
                  <th className="p-2.5 text-center">Status Kontrak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {segeraBerakhirAlerts.map(p => (
                  <tr key={p.id} className="hover:bg-amber-50/50">
                    <td className="p-2.5 font-bold text-slate-900">{p.nama}</td>
                    <td className="p-2.5 text-slate-700">{p.unit} • {p.sekup}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono font-bold text-amber-700">{p.akhirPKWT}</td>
                    <td className="p-2.5 font-bold text-amber-800">
                      {p.pkwtInfo.labelDetail}
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        Segera Berakhir
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. PKWT Sudah Berakhir Alert Card (Tanggal Lewat) */}
      {expiredAlerts.length > 0 && (
        <div className="p-4 bg-red-50 rounded-2xl border border-red-300 text-xs text-red-950 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-red-900">
              <AlertOctagon className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>Perhatian: Masa Berlaku PKWT Telah Berakhir (Perlu Tindakan / Pembaruan)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-200 text-red-900 font-bold">
                {expiredAlerts.length} Pekerja
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('database')}
              className="font-bold text-red-800 hover:underline flex items-center gap-1 text-[11px]"
            >
              Perbarui Kontrak di Database <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] bg-white rounded-xl border border-red-200 overflow-hidden">
              <thead className="bg-red-100/70 font-bold text-red-950">
                <tr>
                  <th className="p-2.5">Nama Pekerja</th>
                  <th className="p-2.5">Unit &amp; Sekup</th>
                  <th className="p-2.5">Status Kepegawaian</th>
                  <th className="p-2.5">Akhir PKWT</th>
                  <th className="p-2.5">Keterangan Waktu</th>
                  <th className="p-2.5 text-center">Status Kontrak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {expiredAlerts.slice(0, 6).map(p => (
                  <tr key={p.id} className="hover:bg-red-50/50">
                    <td className="p-2.5 font-bold text-slate-900">{p.nama}</td>
                    <td className="p-2.5 text-slate-700">{p.unit} • {p.sekup}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono font-bold text-red-600">{p.akhirPKWT}</td>
                    <td className="p-2.5 font-semibold text-red-700">
                      {p.pkwtInfo.labelDetail}
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                        Sudah Berakhir
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div 
          onClick={() => onNavigateTab('database')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer transition-all"
        >
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Total Pekerja (Tim Ini)
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight font-mono">
            {totalPekerja}
          </div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">
            {currentScope === 'ALL' ? 'Seluruh Unit PP1' : currentScope}
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('database')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer transition-all"
        >
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Karyawan TETAP
          </div>
          <div className="text-3xl font-black text-blue-700 tracking-tight font-mono">
            {tetapCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Tanpa batas waktu PKWT
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('database')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer transition-all"
        >
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Pekerja PKWT
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight font-mono">
            {pkwtCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Kontrak berkala (1, 2, atau 3)
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('database')}
          className="bg-white p-5 rounded-2xl border border-amber-300 bg-amber-50/30 shadow-xs hover:border-amber-400 cursor-pointer transition-all"
        >
          <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
            PKWT Segera Berakhir
          </div>
          <div className="text-3xl font-black text-amber-700 tracking-tight font-mono">
            {segeraBerakhirAlerts.length}
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-semibold">
            {expiredAlerts.length > 0 ? `+ ${expiredAlerts.length} sudah berakhir` : '&le; 26 hari jatuh tempo'}
          </div>
        </div>

      </div>

      {/* Section Beban Upah Bulanan (Sinkron Langsung dari Google Sheets Asli) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Ringkasan Beban Upah Harian Periode Ini
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Live Spreadsheet
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Ketentuan 26 hari kerja (Senin - Sabtu) dikurangi potongan ijin sah dari <code>LOG_PRESENSI_IJIN</code>
              </p>
            </div>
          </div>

          {/* Controls: Bulan, Tahun & Tombol Muat Data Ringkasan */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={selectedBulan}
              onChange={(e) => {
                const b = e.target.value;
                setSelectedBulan(b);
                loadRingkasanData(b, selectedTahun);
              }}
              className="px-2.5 py-2 rounded-xl border border-slate-300 bg-slate-50 font-bold text-slate-800 focus:outline-none"
            >
              {bulanOptions.map(b => (
                <option key={b.val} value={b.val}>{b.label}</option>
              ))}
            </select>
            
            <select
              value={selectedTahun}
              onChange={(e) => {
                const t = e.target.value;
                setSelectedTahun(t);
                loadRingkasanData(selectedBulan, t);
              }}
              className="px-2.5 py-2 rounded-xl border border-slate-300 bg-slate-50 font-bold text-slate-800 focus:outline-none"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>

            {/* TOMBOL MEMUAT DATA RINGKASAN */}
            <button
              onClick={() => loadRingkasanData(selectedBulan, selectedTahun)}
              disabled={isLoadingSummary}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              title="Tarik &amp; hitung ulang data presensi dari Google Sheets asli"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSummary ? 'animate-spin' : ''}`} />
              <span>{isLoadingSummary ? 'Memuat Data...' : 'Muat Data Ringkasan'}</span>
            </button>
          </div>
        </div>

        {/* 3 Kartu Beban Upah dengan Angka Presisi dari Sheet Asli */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-500 block mb-1">Ketentuan Upah Standar</span>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              Rp {totalKetentuan.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {totalPekerja} pekerja &times; 26 hari kerja ({namaBulanTerpilih} {selectedTahun})
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-red-700">Estimasi Potongan Ijin</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-200 text-red-900">
                {totalHariPotong} Hari Terpotong
              </span>
            </div>
            <div className="text-2xl font-black text-red-700 font-mono tracking-tight">
              - Rp {totalPotonganNominal.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-red-600 mt-0.5 block">
              Berdasarkan {deductionRecords.length} entri potongan ijin di spreadsheet
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-xs font-bold text-emerald-800 block mb-1">Total Estimasi Dibayarkan</span>
            <div className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
              Rp {totalSetelahPotongan.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
              Belum termasuk tambahan lembur
            </span>
          </div>
        </div>

        {/* Footer Bar Ringkasan & Toggle Rincian */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Status Data:</span>
            <span className="font-semibold text-slate-700">
              {isLoadingSummary ? 'Menghitung dari spreadsheet...' : `Terverifikasi ${namaBulanTerpilih} ${selectedTahun} (${summaryPresensi.length} log presensi dibaca)`}
            </span>
            {lastLoadedAt && (
              <span className="text-[10px] text-slate-400 font-mono">Pukul {lastLoadedAt}</span>
            )}
          </div>

          <button
            onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
            className="font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>{isBreakdownOpen ? 'Tutup Rincian Potongan' : `Lihat Rincian Potongan (${totalHariPotong} Hari)`}</span>
            {isBreakdownOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable Breakdown Table (Transparansi Penuh Potongan Sheet) */}
        {isBreakdownOpen && (
          <div className="pt-3 border-t border-slate-100 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Daftar Rincian Ijin Terpotong Upah ({namaBulanTerpilih} {selectedTahun})
              </span>
              <span className="text-[11px] text-slate-500">
                Sumber: Tab Sheet <code>LOG_PRESENSI_IJIN</code>
              </span>
            </div>

            {deductionDetailList.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400 italic">
                Tidak ada pemotongan ijin pada periode bulan ini.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-64 scrollbar-thin">
                <table className="w-full text-left text-[11px] bg-slate-50/60 rounded-xl border border-slate-200 overflow-hidden">
                  <thead className="bg-slate-200/70 font-bold text-slate-700 sticky top-0">
                    <tr>
                      <th className="p-2">Tanggal</th>
                      <th className="p-2">Nama Pekerja</th>
                      <th className="p-2">Unit &amp; Sekup</th>
                      <th className="p-2">Jenis Ijin</th>
                      <th className="p-2">Keperluan</th>
                      <th className="p-2 text-right">Upah Harian</th>
                      <th className="p-2 text-center">Faktor</th>
                      <th className="p-2 text-right">Potongan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {deductionDetailList.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-100/70">
                        <td className="p-2 font-mono">{item.tanggal}</td>
                        <td className="p-2 font-bold text-slate-900">{item.nama}</td>
                        <td className="p-2 text-slate-600">{item.unit} • {item.sekup}</td>
                        <td className="p-2">
                          <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-semibold text-[10px]">
                            {item.jenisIjin}
                          </span>
                        </td>
                        <td className="p-2 text-slate-500 italic max-w-[150px] truncate">{item.keperluan}</td>
                        <td className="p-2 text-right font-mono">Rp {Math.round(item.upahHarian).toLocaleString('id-ID')}</td>
                        <td className="p-2 text-center font-mono font-bold">{item.faktor}</td>
                        <td className="p-2 text-right font-mono font-bold text-red-600">
                          - Rp {Math.round(item.subtotal).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-200/80 font-bold text-slate-900 sticky bottom-0">
                    <tr>
                      <td colSpan={6} className="p-2 text-right">Total Keseluruhan Potongan:</td>
                      <td className="p-2 text-center font-mono">{totalHariPotong} Hari</td>
                      <td className="p-2 text-right font-mono text-red-700">
                        - Rp {Math.round(totalPotonganNominal).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div 
          onClick={() => onNavigateTab('presensi')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            Presensi &amp; Ijin Harian
          </h4>
          <p className="text-xs text-slate-500">
            Form ijin sakit, surat dokter, ijin dinas, alpha, dan pembuatan surat ijin otomatis.
          </p>
        </div>

        <div 
          onClick={() => onNavigateTab('slip')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            Slip Upah Mingguan / Bulanan
          </h4>
          <p className="text-xs text-slate-500">
            Hitung rincian upah pokok, total lembur, dan potongan per rentang tanggal bebas.
          </p>
        </div>

        <div 
          onClick={() => onNavigateTab('database')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            Database Induk Pekerja
          </h4>
          <p className="text-xs text-slate-500">
            Kelola data 62 pekerja, status PKWT, upah harian, riwayat mutasi dan rotasi sekup.
          </p>
        </div>

      </div>

    </div>
  );
};
