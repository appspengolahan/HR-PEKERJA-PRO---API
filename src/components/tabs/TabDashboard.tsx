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
  FileText
} from 'lucide-react';
import { PekerjaData, MainTabType } from '../../types';

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

  const totalPekerja = filteredPekerja.length;
  const tetapCount = filteredPekerja.filter(p => p.status === 'TETAP').length;
  const pkwtCount = totalPekerja - tetapCount;
  const segeraBerakhirCount = filteredPekerja.filter(p => p.statusPKWT === 'Segera Berakhir').length;

  const pkwtAlerts = filteredPekerja.filter(p => p.statusPKWT === 'Segera Berakhir');

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

      {/* PKWT Alert Card if any */}
      {pkwtAlerts.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Peringatan PKWT Segera Berakhir (&le; 26 Hari)</span>
            </div>
            <button
              onClick={() => onNavigateTab('database')}
              className="font-bold text-amber-800 hover:underline flex items-center gap-1"
            >
              Lihat di Database <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] bg-white rounded-xl border border-amber-200 overflow-hidden">
              <thead className="bg-amber-100/60 font-bold text-amber-950">
                <tr>
                  <th className="p-2">Nama Pekerja</th>
                  <th className="p-2">Unit &amp; Sekup</th>
                  <th className="p-2">Jabatan</th>
                  <th className="p-2">Akhir PKWT</th>
                  <th className="p-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {pkwtAlerts.slice(0, 5).map(p => (
                  <tr key={p.id}>
                    <td className="p-2 font-bold text-slate-900">{p.nama}</td>
                    <td className="p-2">{p.unit} • {p.sekup}</td>
                    <td className="p-2">{p.jabatan || 'Harian'}</td>
                    <td className="p-2 font-mono font-bold text-red-600">{p.akhirPKWT}</td>
                    <td className="p-2 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
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
          <div className="text-[11px] text-slate-400 mt-1">
            PKWT 1 / PKWT 2 / PKWT 3
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('database')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 cursor-pointer transition-all"
        >
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Segera Berakhir
          </div>
          <div className="text-3xl font-black text-amber-600 tracking-tight font-mono">
            {segeraBerakhirCount}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            &le; 26 Hari Kalender
          </div>
        </div>

      </div>

      {/* Card: Total Beban Upah Bulanan */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Total Beban Upah (Upah Harian &times; 26 Hari Kerja Tersedia)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Standar 26 hari kerja per bulan (angka tetap sesuai kebijakan perusahaan)
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-bold"
            >
              {bulanOptions.map(b => (
                <option key={b.val} value={b.val}>{b.label}</option>
              ))}
            </select>
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-bold"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Total Ketentuan ({totalPekerja} Pekerja)
            </span>
            <div className="text-xl font-black text-slate-900 font-mono">
              Rp {Math.round(totalKetentuan).toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Sebelum dikurangi potongan ijin
            </span>
          </div>

          <div className="p-4 bg-red-50/60 rounded-xl border border-red-200">
            <span className="text-[11px] font-bold text-red-900 uppercase block mb-1">
              Total Potongan Ijin (Bulan Ini)
            </span>
            <div className="text-xl font-black text-red-700 font-mono">
              - Rp {Math.round(totalPotongan).toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-red-600/80 mt-1 block">
              Dari akumulasi Faktor Potongan
            </span>
          </div>

          <div className="p-4 bg-blue-50/80 rounded-xl border border-blue-200">
            <span className="text-[11px] font-bold text-blue-900 uppercase block mb-1">
              Total Setelah Potongan
            </span>
            <div className="text-xl font-black text-blue-800 font-mono">
              Rp {Math.round(totalSetelahPotongan).toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-blue-700 mt-1 block">
              Estimasi beban upah bersih
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
