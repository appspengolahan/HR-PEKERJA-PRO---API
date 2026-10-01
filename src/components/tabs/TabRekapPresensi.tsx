import React, { useState } from 'react';
import { 
  BarChart3, 
  Search, 
  Printer, 
  TrendingUp, 
  Award,
  Filter
} from 'lucide-react';
import { PekerjaData } from '../../types';
import { exportRekapPresensiToCSV } from '../../utils/exportUtils';
import { Download } from 'lucide-react';

interface TabRekapPresensiProps {
  pekerjaList: PekerjaData[];
  currentScope: string;
}

export const TabRekapPresensi: React.FC<TabRekapPresensiProps> = ({
  pekerjaList,
  currentScope
}) => {
  const [tahun, setTahun] = useState('2026');
  const [unit, setUnit] = useState('Semua');
  const [sekup, setSekup] = useState('Semua');
  const [nama, setNama] = useState('Semua');
  const [bulanAwal, setBulanAwal] = useState('1');
  const [bulanAkhir, setBulanAkhir] = useState('12');

  const filteredPekerja = pekerjaList.filter(p => {
    const matchScope = currentScope === 'ALL' || p.unitSekup === currentScope;
    const matchUnit = unit === 'Semua' || p.unit === unit;
    const matchSekup = sekup === 'Semua' || p.sekup === sekup;
    const matchNama = nama === 'Semua' || p.nama === nama;
    return matchScope && matchUnit && matchSekup && matchNama;
  });

  // Calculate synthetic baseline for visualization (using 26 days * 420 mins = 10,920 mins/month)
  const MENIT_TERSEDIA_BULAN = 10440;
  
  const rekapRows = filteredPekerja.map(p => {
    // Generate realistic simulated monthly minutes based on worker status
    const seed = p.id.toString().charCodeAt(0) || 50;
    const bulanan: number[] = [];
    let totalIjin = 0;

    for (let b = 1; b <= 12; b++) {
      if (b >= Number(bulanAwal) && b <= Number(bulanAkhir)) {
        const ijin = (seed * b * 7) % 360; // 0 to 360 mins
        bulanan.push(ijin);
        totalIjin += ijin;
      } else {
        bulanan.push(0);
      }
    }

    const jmlBulan = Number(bulanAkhir) - Number(bulanAwal) + 1;
    const totalTersedia = MENIT_TERSEDIA_BULAN * jmlBulan;
    const pctKehadiran = totalTersedia > 0 
      ? Math.max(0, Math.round((100 - (totalIjin / totalTersedia * 100)) * 100) / 100) 
      : 100;

    return {
      nama: p.nama,
      unit: p.unit,
      sekup: p.sekup,
      bulanan,
      totalIjin,
      pctKehadiran
    };
  }).sort((a, b) => a.pctKehadiran - b.pctKehadiran); // lowest first for attention

  // Calculate monthly average for line trend
  const bulanLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthlyAverages = bulanLabels.map((lbl, idx) => {
    const bNum = idx + 1;
    if (bNum < Number(bulanAwal) || bNum > Number(bulanAkhir)) return null;
    let sumPct = 0;
    rekapRows.forEach(r => {
      const menit = r.bulanan[idx] || 0;
      const pct = Math.max(0, 100 - (menit / MENIT_TERSEDIA_BULAN * 100));
      sumPct += pct;
    });
    return rekapRows.length > 0 ? (sumPct / rekapRows.length).toFixed(2) : '100';
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Filter Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Rekapitulasi Presensi Tahunan</h2>
            <p className="text-xs text-slate-500">Analisis tren kehadiran dan ranking pekerja per periode</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportRekapPresensiToCSV(rekapRows)}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200"
              title="Unduh rekap presensi tahunan ke CSV"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh CSV
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          <div>
            <label className="block text-slate-500 font-bold mb-1">Tahun</label>
            <select
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-bold"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-500 font-bold mb-1">Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50"
            >
              <option value="Semua">-- Semua Unit --</option>
              <option value="Cengkeh">Cengkeh</option>
              <option value="Blend">Blend</option>
              <option value="Tembakau">Tembakau</option>
              <option value="Krosok">Krosok</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-500 font-bold mb-1">Sekup</label>
            <select
              value={sekup}
              onChange={(e) => setSekup(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50"
            >
              <option value="Semua">-- Semua Sekup --</option>
              <option value="Proses">Proses</option>
              <option value="Persediaan">Persediaan</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-500 font-bold mb-1">Nama Pekerja</label>
            <select
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50"
            >
              <option value="Semua">-- Semua Pekerja --</option>
              {pekerjaList.map(p => (
                <option key={p.id} value={p.nama}>{p.nama}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-500 font-bold mb-1">Bulan Awal</label>
            <select
              value={bulanAwal}
              onChange={(e) => setBulanAwal(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50"
            >
              {bulanLabels.map((lbl, idx) => (
                <option key={idx} value={String(idx + 1)}>{lbl}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-500 font-bold mb-1">Bulan Akhir</label>
            <select
              value={bulanAkhir}
              onChange={(e) => setBulanAkhir(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50"
            >
              {bulanLabels.map((lbl, idx) => (
                <option key={idx} value={String(idx + 1)}>{lbl}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Card 1: Tren Rata-rata Bulanan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Tren %Kehadiran Rata-rata per Bulan</span>
          </div>
          <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-200">
            {bulanLabels.map((lbl, idx) => {
              const val = monthlyAverages[idx];
              const pct = val ? parseFloat(val) : 0;
              const heightPct = val ? Math.max(15, (pct - 70) * 3) : 0;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  {val && (
                    <span className="text-[9px] font-mono font-bold text-slate-700">
                      {Math.round(pct)}%
                    </span>
                  )}
                  <div 
                    className={`w-full rounded-t-md transition-all ${
                      val ? 'bg-blue-600 shadow-xs hover:bg-blue-700' : 'bg-slate-100'
                    }`}
                    style={{ height: val ? `${heightPct}%` : '4px' }}
                    title={`${lbl}: ${val || '-'}%`}
                  />
                  <span className="text-[10px] font-semibold text-slate-400 mt-1">{lbl}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Ranking Kehadiran (Lowest to Highest) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Ranking Kehadiran Pekerja (Diurutkan dari Terendah)</span>
            </div>
            <span className="text-[10px] text-slate-400">
              Hijau &ge;95% • Oranye 90-95% • Merah &lt;90%
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 text-xs">
            {rekapRows.slice(0, 8).map((r, idx) => {
              const color = r.pctKehadiran >= 95 
                ? 'bg-emerald-500' 
                : r.pctKehadiran >= 90 
                ? 'bg-amber-500' 
                : 'bg-red-500';

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-slate-800 truncate max-w-[200px]">{r.nama}</span>
                    <span className="font-mono font-bold">{r.pctKehadiran.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${color}`} style={{ width: `${r.pctKehadiran}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Rekap Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold text-slate-800">
            Tabel Rincian Kehadiran per Bulan ({rekapRows.length} Pekerja)
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Satuan: Menit Ijin
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Nama</th>
                <th className="py-2.5 px-3">Unit / Sekup</th>
                {bulanLabels.map((b, i) => (
                  <th key={i} className="py-2.5 px-2 text-center">{b}</th>
                ))}
                <th className="py-2.5 px-3 text-center">Total Ijin</th>
                <th className="py-2.5 px-3 text-right">%Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {rekapRows.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-bold text-slate-900">{r.nama}</td>
                  <td className="py-2 px-3 text-slate-500 text-[11px]">{r.unit} • {r.sekup}</td>
                  {r.bulanan.map((m, mIdx) => (
                    <td key={mIdx} className="py-2 px-2 text-center font-mono text-[11px]">
                      {m > 0 ? <span className="text-amber-700 font-semibold">{m}</span> : '-'}
                    </td>
                  ))}
                  <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">
                    {r.totalIjin} m
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                    <span className={r.pctKehadiran >= 95 ? 'text-emerald-700' : r.pctKehadiran >= 90 ? 'text-amber-700' : 'text-red-700'}>
                      {r.pctKehadiran.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
