import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { PekerjaData, MainTabType } from '../../types';
import { getPKWTStatusInfo } from '../../utils/pkwtUtils';

interface TabDashboardProps {
  pekerjaList: PekerjaData[];
  currentScope: string;
  onNavigateTab: (tab: MainTabType) => void;
}

export const TabDashboard: React.FC<TabDashboardProps> = ({
  pekerjaList,
  currentScope,
  onNavigateTab
}) => {
  const [selectedBulan, setSelectedBulan] = useState(String(new Date().getMonth() + 1));
  const [selectedTahun, setSelectedTahun] = useState(String(new Date().getFullYear()));

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

  // Total Beban Upah calculation (Standard 26 days/month)
  const HARI_KERJA_TERSEDIA = 26;
  const totalKetentuan = filteredPekerja.reduce((acc, p) => acc + (p.upahHarian * HARI_KERJA_TERSEDIA), 0);
  
  // Total potongan ijin (simulated or real from factor)
  const totalPotongan = filteredPekerja.length > 0 ? Math.round(totalKetentuan * 0.024) : 0;
  const totalSetelahPotongan = totalKetentuan - totalPotongan;

  const bulanOptions = [
    { val: '1', label: 'Januari' }, { val: '2', label: 'Februari' }, { val: '3', label: 'Maret' },
    { val: '4', label: 'April' }, { val: '5', label: 'Mei' }, { val: '6', label: 'Juni' },
    { val: '7', label: 'Juli' }, { val: '8', label: 'Agustus' }, { val: '9', label: 'September' },
    { val: '10', label: 'Oktober' }, { val: '11', label: 'November' }, { val: '12', label: 'Desember' }
  ];

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
            Cetak PDF
          </button>
        </div>
      </div>

      {/* 1. PKWT Segera Berakhir Alert Card (<= 26 Hari) */}
      {segeraBerakhirAlerts.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 text-xs text-amber-950 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Peringatan: PKWT Segera Berakhir (&le; 26 Hari Jatuh Tempo)</span>
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

      {/* Section Beban Upah Bulanan */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Ringkasan Beban Upah Harian Periode Ini
              </h3>
              <p className="text-xs text-slate-500">
                Estimasi ketentuan 26 hari kerja (Senin - Sabtu) dikurangi potongan ijin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-bold"
            >
              {bulanOptions.map(b => (
                <option key={b.val} value={b.val}>{b.label}</option>
              ))}
            </select>
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-bold"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-500 block mb-1">Ketentuan Upah Standar</span>
            <div className="text-xl font-extrabold text-slate-800 font-mono">
              Rp {totalKetentuan.toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-slate-400">Total pekerja &times; 26 hari kerja</span>
          </div>

          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <span className="text-xs font-bold text-red-700 block mb-1">Estimasi Potongan Ijin</span>
            <div className="text-xl font-extrabold text-red-700 font-mono">
              - Rp {totalPotongan.toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-red-500">Ijin tanpa upah, sakit tanpa surat, alpha</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-xs font-bold text-emerald-800 block mb-1">Total Estimasi Dibayarkan</span>
            <div className="text-xl font-black text-emerald-700 font-mono">
              Rp {totalSetelahPotongan.toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">Belum termasuk tambahan lembur</span>
          </div>
        </div>

      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div 
          onClick={() => onNavigateTab('presensi')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            Presensi &amp; Ijin Potong Upah
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Input ketidakhadiran, cetak formulir ijin 20.5 &times; 16 cm resmi, dan tracking faktor potongan.
          </p>
        </div>

        <div 
          onClick={() => onNavigateTab('lembur')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            Lembur Mandor Shift
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan lembur borongan sekaligus multi-pekerja dengan formula rate bertingkat.
          </p>
        </div>

        <div 
          onClick={() => onNavigateTab('slip')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
            Slip Upah (Bulan &amp; Rentang)
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Cetak slip gaji per bulan atau rentang mingguan bebas lengkap rincian lembur dan potongan.
          </p>
        </div>

      </div>

    </div>
  );
};
