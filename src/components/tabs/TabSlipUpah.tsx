import React, { useState, useMemo } from 'react';
import { 
  BadgePercent, 
  Search, 
  Printer, 
  DollarSign, 
  Calendar,
  AlertCircle,
  Building2,
  Download,
  CheckCircle2,
  Users,
  FileText
} from 'lucide-react';
import { PekerjaData, SlipUpahData } from '../../types';
import { gasClient } from '../../services/gasClient';
import { AuthUser, authService, isWorkerInUserScope } from '../../services/authService';

interface TabSlipUpahProps {
  pekerjaList: PekerjaData[];
  currentScope: string;
  lockedNama?: string;
  currentUser?: AuthUser | null;
}

export const TabSlipUpah: React.FC<TabSlipUpahProps> = ({
  pekerjaList,
  currentScope,
  lockedNama,
  currentUser
}) => {
  const [activeTabSub, setActiveTabSub] = useState<'individu' | 'rekap_total'>('individu');
  const [rekapFilterUnit, setRekapFilterUnit] = useState<string>('Semua');
  const [rekapSearch, setRekapSearch] = useState<string>('');

  const [mode, setMode] = useState<'bulan' | 'rentang'>('bulan');
  const [selectedNama, setSelectedNama] = useState(lockedNama || pekerjaList[0]?.nama || '');
  const [bulan, setBulan] = useState(String(new Date().getMonth() + 1));
  const [tahun, setTahun] = useState(String(new Date().getFullYear()));
  
  const [tglAwal, setTglAwal] = useState(new Date().toISOString().slice(0, 10));
  const [tglAkhir, setTglAkhir] = useState(new Date().toISOString().slice(0, 10));
  
  const [slipData, setSlipData] = useState<SlipUpahData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canViewRekapTotal = 
    authService.canRoleViewWageSummary(currentUser?.role || '') ||
    currentUser?.role === 'Manajer Operasional' ||
    currentUser?.role === 'Super Admin' ||
    currentUser?.role === 'Project Manager' ||
    currentUser?.role === 'HR Admin' ||
    currentUser?.role === 'Site Engineer' ||
    currentUser?.role === 'Kepala Pengolahan 1' ||
    currentUser?.role === 'Kepala Pengolahan 2';

  const filteredPekerja = useMemo(() => {
    return pekerjaList.filter(p => {
      return isWorkerInUserScope(p, currentUser || null, currentScope);
    });
  }, [pekerjaList, currentScope, currentUser]);

  // Data Rekapitulasi Beban Upah Seluruh Tim / Divisi
  const rekapWorkers = useMemo(() => {
    return pekerjaList.filter(p => {
      const matchScope = isWorkerInUserScope(p, currentUser || null, currentScope);
      const matchUnit = rekapFilterUnit === 'Semua' || p.unit === rekapFilterUnit;
      const matchSearch = !rekapSearch || 
        p.nama.toLowerCase().includes(rekapSearch.toLowerCase()) || 
        String(p.id).includes(rekapSearch);
      return matchScope && matchUnit && matchSearch;
    });
  }, [pekerjaList, currentScope, rekapFilterUnit, rekapSearch, currentUser]);

  const rekapSummary = useMemo(() => {
    let totalHariKerja = 0;
    let totalUpahPokok = 0;
    const unitBreakdown: Record<string, { count: number; totalUpah: number }> = {};

    rekapWorkers.forEach(p => {
      const daily = Number(p.upahHarian) || 146675.96;
      const days = 26; // Standar 26 hari kerja per bulan
      const pokok = daily * days;

      totalHariKerja += days;
      totalUpahPokok += pokok;

      if (!unitBreakdown[p.unit]) {
        unitBreakdown[p.unit] = { count: 0, totalUpah: 0 };
      }
      unitBreakdown[p.unit].count += 1;
      unitBreakdown[p.unit].totalUpah += pokok;
    });

    return {
      totalPekerja: rekapWorkers.length,
      totalHariKerja,
      totalUpahPokok,
      rataRataUpah: rekapWorkers.length > 0 ? totalUpahPokok / rekapWorkers.length : 0,
      unitBreakdown
    };
  }, [rekapWorkers]);

  const handleFetchSlip = async () => {
    if (!selectedNama) {
      alert('Pilih pekerja terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    const worker = pekerjaList.find(p => p.nama === selectedNama);
    const upahHarian = worker?.upahHarian || 146675.96;

    try {
      if (mode === 'rentang') {
        const res = await gasClient.getSlipUpahRentang(selectedNama, tglAwal, tglAkhir);
        if (res.status === 'success' && res.data) {
          const d = res.data as {
            nama: string;
            periode?: string;
            unit?: string;
            sekup?: string;
            upahHarian: number;
            hariKerjaTersedia: number;
            hariTidakDibayar: number;
            hariDibayar: number;
            upahPokok: number;
            totalLembur: number;
            totalDiterima: number;
          };
          setSlipData({
            nama: d.nama,
            periode: d.periode || `${tglAwal} - ${tglAkhir}`,
            unit: d.unit || worker?.unit || '-',
            sekup: d.sekup || worker?.sekup || '-',
            upahHarian: d.upahHarian,
            hariKerjaTersedia: d.hariKerjaTersedia,
            hariTidakDibayar: d.hariTidakDibayar,
            hariDibayar: d.hariDibayar,
            upahPokok: d.upahPokok,
            totalLembur: d.totalLembur,
            totalDiterima: d.totalDiterima
          });
        } else {
          // Calculate locally based on Monday-Saturday working days in date range
          const start = new Date(tglAwal + 'T00:00:00');
          const end = new Date(tglAkhir + 'T00:00:00');
          let availableDays = 0;
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            if (d.getDay() !== 0) availableDays++; // Monday-Saturday
          }
          const hariTidakDibayar = 0;
          const hariDibayar = availableDays - hariTidakDibayar;
          const upahPokok = upahHarian * hariDibayar;
          const totalLembur = 0;

          setSlipData({
            nama: selectedNama,
            periode: `${tglAwal} s/d ${tglAkhir}`,
            unit: worker?.unit || '-',
            sekup: worker?.sekup || '-',
            upahHarian: upahHarian,
            hariKerjaTersedia: availableDays,
            hariTidakDibayar,
            hariDibayar,
            upahPokok,
            totalLembur,
            totalDiterima: upahPokok + totalLembur
          });
        }
      } else {
        // Mode Per Bulan (Standard 26 working days)
        const hariKerjaTersedia = 26;
        const hariTidakDibayar = 0;
        const hariDibayar = hariKerjaTersedia - hariTidakDibayar;
        const upahPokok = upahHarian * hariDibayar;
        const totalLembur = 0;

        const namaBulan = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ][Number(bulan) - 1] || '';

        setSlipData({
          nama: selectedNama,
          periode: `${namaBulan} ${tahun}`,
          unit: worker?.unit || '-',
          sekup: worker?.sekup || '-',
          upahHarian: upahHarian,
          hariKerjaTersedia,
          hariTidakDibayar,
          hariDibayar,
          upahPokok,
          totalLembur,
          totalDiterima: upahPokok + totalLembur
        });
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const fmtRupiah = (val: number | string) => {
    const num = Number(val);
    if (isNaN(num)) return String(val);
    return `Rp ${Math.round(num).toLocaleString('id-ID')}`;
  };

  const bulanOptions = [
    { val: '1', label: 'Januari' }, { val: '2', label: 'Februari' }, { val: '3', label: 'Maret' },
    { val: '4', label: 'April' }, { val: '5', label: 'Mei' }, { val: '6', label: 'Juni' },
    { val: '7', label: 'Juli' }, { val: '8', label: 'Agustus' }, { val: '9', label: 'September' },
    { val: '10', label: 'Oktober' }, { val: '11', label: 'November' }, { val: '12', label: 'Desember' }
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Subtab Switcher: Slip Individu vs Rekap Total Upah Divisi */}
      {!lockedNama && canViewRekapTotal && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 print:hidden">
          <button
            type="button"
            onClick={() => setActiveTabSub('individu')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTabSub === 'individu'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BadgePercent className="w-4 h-4" />
            <span>Slip Upah Perorangan (Individu)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSub('rekap_total')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTabSub === 'rekap_total'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Rekap Total Beban Upah Divisi (Manajer Operasional)</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 text-[10px] font-bold">
              {rekapWorkers.length} Pekerja
            </span>
          </button>
        </div>
      )}

      {/* MODE 1 & 2: SLIP PERORANGAN INDIVIDU */}
      {activeTabSub === 'individu' && (
        <>
          {/* Search & Mode Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 print:hidden">
        
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">Perhitungan &amp; Cetak Slip Upah Pekerja</h2>
          <p className="text-xs text-slate-500">Pilih mode bulanan kalender atau mode rentang tanggal mingguan</p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-6 text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
            <input
              type="radio"
              name="slip_mode"
              value="bulan"
              checked={mode === 'bulan'}
              onChange={() => { setMode('bulan'); setSlipData(null); }}
              className="w-4 h-4 text-blue-600"
            />
            <span>Mode 1: Per Bulan (Standar 26 Hari)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
            <input
              type="radio"
              name="slip_mode"
              value="rentang"
              checked={mode === 'rentang'}
              onChange={() => { setMode('rentang'); setSlipData(null); }}
              className="w-4 h-4 text-blue-600"
            />
            <span>Mode 2: Rentang Tanggal Bebas (Upah Mingguan)</span>
          </label>
        </div>

        {/* Inputs based on mode */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          
          <div>
            <label className="block text-slate-500 font-bold mb-1">Nama Pekerja *</label>
            {lockedNama ? (
              <div className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-blue-50/80 font-bold text-blue-900 flex items-center justify-between">
                <span className="truncate">{lockedNama}</span>
                <span className="text-[10px] bg-blue-200 px-1.5 py-0.5 rounded text-blue-800 font-semibold flex-shrink-0">Terkunci</span>
              </div>
            ) : (
              <select
                value={selectedNama}
                onChange={(e) => setSelectedNama(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold"
              >
                {filteredPekerja.map(p => (
                  <option key={p.id} value={p.nama}>{p.nama}</option>
                ))}
              </select>
            )}
          </div>

          {mode === 'bulan' ? (
            <>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Bulan</label>
                <select
                  value={bulan}
                  onChange={(e) => setBulan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50"
                >
                  {bulanOptions.map(b => (
                    <option key={b.val} value={b.val}>{b.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Tahun</label>
                <select
                  value={tahun}
                  onChange={(e) => setTahun(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Tanggal Awal *</label>
                <input
                  type="date"
                  value={tglAwal}
                  onChange={(e) => setTglAwal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Tanggal Akhir *</label>
                <input
                  type="date"
                  value={tglAkhir}
                  onChange={(e) => setTglAkhir(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-mono"
                />
              </div>
            </>
          )}

          <div className="flex items-end">
            <button
              onClick={handleFetchSlip}
              disabled={isLoading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Search className="w-4 h-4" />
              {isLoading ? 'Menghitung...' : 'Tampilkan Slip'}
            </button>
          </div>

        </div>

      </div>

      {/* Slip Display Card */}
      {slipData && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-4 sm:p-8 max-w-xl mx-auto space-y-4">
          
          <div className="flex justify-between items-center border-b border-slate-200 pb-3 print:hidden">
            <span className="text-[11px] font-mono text-slate-400">DIVISI PRODUKSI I</span>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Slip Upah
            </button>
          </div>

          <div className="text-center space-y-0.5">
            <div className="text-base font-black tracking-wider text-slate-900 uppercase">
              SLIP UPAH PEKERJA HARIAN
            </div>
            <div className="text-xs text-blue-700 font-bold">
              PT BATU KARANG — DIVISI PRODUKSI 1 (PP1)
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Periode: {slipData.periode}
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs py-2">
            
            <div className="py-2 flex justify-between">
              <span className="text-slate-500 font-medium">Nama Pekerja:</span>
              <span className="font-extrabold text-slate-900">{slipData.nama}</span>
            </div>

            <div className="py-2 flex justify-between">
              <span className="text-slate-500 font-medium">Unit &amp; Sekup:</span>
              <span className="font-semibold text-slate-800">{slipData.unit} • {slipData.sekup}</span>
            </div>

            <div className="py-2 flex justify-between">
              <span className="text-slate-500 font-medium">Upah Harian Standar:</span>
              <span className="font-mono font-bold text-slate-800">{fmtRupiah(slipData.upahHarian)}</span>
            </div>

            <div className="py-2 flex justify-between">
              <span className="text-slate-500 font-medium">Hari Kerja Tersedia:</span>
              <span className="font-mono font-bold text-slate-800">{slipData.hariKerjaTersedia} Hari</span>
            </div>

            <div className="py-2 flex justify-between text-red-600">
              <span>Hari Tidak Dibayar (Ijin / Sakit):</span>
              <span className="font-mono font-bold">- {slipData.hariTidakDibayar} Hari</span>
            </div>

            <div className="py-2 flex justify-between bg-slate-50 font-bold px-2 rounded">
              <span>Hari Dibayar Penuh:</span>
              <span className="font-mono text-blue-700">{slipData.hariDibayar} Hari</span>
            </div>

            <div className="py-2 flex justify-between">
              <span className="text-slate-500 font-medium">Upah Pokok (Hari Dibayar x Upah Harian):</span>
              <span className="font-mono font-bold text-slate-800">{fmtRupiah(slipData.upahPokok)}</span>
            </div>

            <div className="py-2 flex justify-between">
              <span className="text-slate-500 font-medium">Total Upah Lembur:</span>
              <span className="font-mono font-bold text-slate-800">{fmtRupiah(slipData.totalLembur)}</span>
            </div>

            <div className="pt-3 pb-1 flex justify-between items-center text-sm font-black text-slate-900 bg-blue-50/80 p-3 rounded-xl border border-blue-200 mt-2">
              <span className="uppercase tracking-wider">TOTAL UPAH DITERIMA:</span>
              <span className="font-mono text-base text-blue-800">
                {fmtRupiah(slipData.totalDiterima)}
              </span>
            </div>

          </div>

          <div className="text-[10px] text-slate-400 italic text-center pt-2 border-t border-slate-100">
            * Tidak ada potongan BPJS / PPh21 formal (sesuai kebijakan pengupahan pekerja harian saat ini).
          </div>

        </div>
      )}
        </>
      )}

      {/* MODE 3: REKAP TOTAL UPAH DIVISI (UNTUK MANAJER OPERASIONAL & MANAJEMEN) */}
      {activeTabSub === 'rekap_total' && canViewRekapTotal && (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          {/* Filter & Export Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Rekapitulasi Total Beban Upah Divisi PP1
                </h2>
                <p className="text-xs text-slate-500">
                  Ringkasan beban upah seluruh pekerja harian berdasarkan unit dan periode kerja standar 26 hari
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak Rekap
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Filter Unit</label>
                <select
                  value={rekapFilterUnit}
                  onChange={(e) => setRekapFilterUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold"
                >
                  <option value="Semua">-- Semua Unit ({pekerjaList.length} Pekerja) --</option>
                  <option value="Cengkeh">Unit Cengkeh</option>
                  <option value="Blend">Unit Blend</option>
                  <option value="Tembakau">Unit Tembakau</option>
                  <option value="Krosok">Unit Krosok</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-500 font-bold mb-1">Cari Nama / ID Pekerja</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={rekapSearch}
                    onChange={(e) => setRekapSearch(e.target.value)}
                    placeholder="Ketik nama pekerja atau nomor ID..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Pekerja</span>
              <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-1.5">
                {rekapSummary.totalPekerja} <span className="text-xs font-normal text-slate-500">orang</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Tercatat aktif di master</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Hari Kerja Kolektif</span>
              <div className="text-2xl font-black text-blue-700 mt-1 flex items-baseline gap-1.5">
                {rekapSummary.totalHariKerja.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">hari</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">26 hari kerja per orang</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs sm:col-span-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Estimasi Beban Upah Bulanan</span>
              <div className="text-2xl font-black text-emerald-700 mt-1 flex items-baseline gap-2">
                {fmtRupiah(rekapSummary.totalUpahPokok)}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Rata-rata: {fmtRupiah(rekapSummary.rataRataUpah)} / pekerja / bulan
              </span>
            </div>
          </div>

          {/* Unit Breakdown Pill Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Cengkeh', 'Blend', 'Tembakau', 'Krosok'].map(u => {
              const info = rekapSummary.unitBreakdown[u] || { count: 0, totalUpah: 0 };
              return (
                <div key={u} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div className="font-bold text-slate-800 flex items-center justify-between">
                    <span>Unit {u}</span>
                    <span className="text-[11px] font-mono text-slate-500">{info.count} org</span>
                  </div>
                  <div className="font-mono font-bold text-slate-900 mt-1">
                    {fmtRupiah(info.totalUpah)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Workers Detailed Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-bold text-slate-800">
                Tabel Rincian Upah ({rekapWorkers.length} Pekerja)
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Standar Periode: 26 Hari Kerja
              </span>
            </div>

            <div className="overflow-x-auto max-h-[500px] scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Nama Pekerja</th>
                    <th className="py-2.5 px-3">Unit &amp; Sekup</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Upah Harian</th>
                    <th className="py-2.5 px-3 text-center">Hari Kerja</th>
                    <th className="py-2.5 px-3 text-right">Total Upah Bulanan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {rekapWorkers.map((p, idx) => {
                    const daily = Number(p.upahHarian) || 146675.96;
                    const days = 26;
                    const total = daily * days;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-indigo-700">#{p.id}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{p.nama}</td>
                        <td className="py-2 px-3 text-slate-500 text-[11px]">{p.unit} • {p.sekup}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'TETAP' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-medium">{fmtRupiah(daily)}</td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-700">{days} hr</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">{fmtRupiah(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-bold text-xs text-slate-900 sticky bottom-0">
                  <tr>
                    <td colSpan={6} className="py-3 px-3 text-right uppercase tracking-wider">
                      GRAND TOTAL BEBAN UPAH ({rekapWorkers.length} PEKERJA):
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {rekapSummary.totalHariKerja.toLocaleString('id-ID')} hr
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-800 text-sm font-black">
                      {fmtRupiah(rekapSummary.totalUpahPokok)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
