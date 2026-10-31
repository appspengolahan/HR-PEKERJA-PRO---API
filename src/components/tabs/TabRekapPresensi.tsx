import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Search, 
  Printer, 
  TrendingUp, 
  TrendingDown,
  Award,
  Filter,
  Download,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { PekerjaData, PresensiIjinRecord } from '../../types';
import { exportRekapPresensiToCSV } from '../../utils/exportUtils';
import { INITIAL_PRESENSI_FALLBACK } from '../../data/initialPresensi';
import { AuthUser, isWorkerInUserScope } from '../../services/authService';
import { getNormalizedPermitMinutes } from '../../utils/workHoursUtils';

interface TabRekapPresensiProps {
  pekerjaList: PekerjaData[];
  presensiList?: PresensiIjinRecord[];
  currentScope: string;
  currentUser?: AuthUser | null;
}

export const TabRekapPresensi: React.FC<TabRekapPresensiProps> = ({
  pekerjaList,
  presensiList,
  currentScope,
  currentUser
}) => {
  const [tahun, setTahun] = useState('2026');
  const [unit, setUnit] = useState('Semua');
  const [sekup, setSekup] = useState('Semua');
  const [nama, setNama] = useState('Semua');
  const [bulanAwal, setBulanAwal] = useState('1');
  const [bulanAkhir, setBulanAkhir] = useState('12');
  const [sortBy, setSortBy] = useState<'default' | 'totalIjin' | 'kehadiran' | 'nama'>('default');

  const filteredPekerja = useMemo(() => {
    return pekerjaList.filter(p => {
      const matchScope = isWorkerInUserScope(p, currentUser || null, currentScope);
      const matchUnit = unit === 'Semua' || p.unit === unit;
      const matchSekup = sekup === 'Semua' || p.sekup === sekup;
      const matchNama = nama === 'Semua' || p.nama === nama;
      return matchScope && matchUnit && matchSekup && matchNama;
    });
  }, [pekerjaList, currentScope, unit, sekup, nama, currentUser]);

  // Use presensiList if provided and non-empty, otherwise use authentic initial dataset
  const effectivePresensi = useMemo(() => {
    return (presensiList && presensiList.length > 0)
      ? presensiList
      : INITIAL_PRESENSI_FALLBACK;
  }, [presensiList]);

  // Aggregate minutes by worker name and month (0 to 11) from authentic presensi records
  const workerMonthlyMap = useMemo(() => {
    const map: Record<string, number[]> = {};
    effectivePresensi.forEach(item => {
      if (!item.nama) return;
      const cleanName = item.nama.trim().toUpperCase();
      if (!map[cleanName]) {
        map[cleanName] = Array(12).fill(0);
      }

      let m = -1;
      let yr = '';
      if (item.tanggalIso) {
        const parts = item.tanggalIso.split('-');
        yr = parts[0];
        m = parseInt(parts[1], 10) - 1;
      } else if (item.tanggal) {
        const parts = item.tanggal.split('/');
        yr = parts[2] || '';
        m = parseInt(parts[1], 10) - 1;
      }

      // Check year filter (if year is specified and matches)
      if (tahun && yr && yr !== tahun) return;

      if (m >= 0 && m < 12) {
        // Normalisasi durasi ijin bersih (potong jam istirahat resmi & sesuaikan hari Sabtu)
        const effectiveMinutes = getNormalizedPermitMinutes(
          item.tanggalIso || item.tanggal,
          item.jamAwal,
          item.jamAkhir,
          item.durasiMenit,
          item.jenisIjin
        );
        map[cleanName][m] += effectiveMinutes;
      }
    });
    return map;
  }, [effectivePresensi, tahun]);

  // Controls for Card 1 (Tren Tingkat Kehadiran Bulanan)
  const [chartMode, setChartMode] = useState<'kehadiran' | 'izin'>('kehadiran');

  // Controls for Card 2 (Grafik Balok Peringkat Kehadiran Pekerja)
  const [rankingSearch, setRankingSearch] = useState('');
  const [rankingUnit, setRankingUnit] = useState('Semua');
  const [rankingSort, setRankingSort] = useState<'perhatian' | 'tertinggi' | 'nama'>('perhatian');

  // Standard available minutes per month (26 days * 420 mins = 10,920 mins; standard 10,440 mins)
  const MENIT_TERSEDIA_BULAN = 10440;
  
  const rekapRows = useMemo(() => {
    const rows = filteredPekerja.map(p => {
      const cleanName = p.nama.trim().toUpperCase();
      const recordedMonths = workerMonthlyMap[cleanName] || Array(12).fill(0);
      const bulanan: number[] = [];
      let totalIjin = 0;

      for (let b = 1; b <= 12; b++) {
        if (b >= Number(bulanAwal) && b <= Number(bulanAkhir)) {
          const menit = recordedMonths[b - 1] || 0;
          bulanan.push(menit);
          totalIjin += menit;
        } else {
          bulanan.push(0);
        }
      }

      const jmlBulan = Number(bulanAkhir) - Number(bulanAwal) + 1;
      const totalTersedia = MENIT_TERSEDIA_BULAN * jmlBulan;
      const pctKehadiran = totalTersedia > 0 
        ? Math.max(0, Math.round((100 - (totalIjin / totalTersedia * 100)) * 100) / 100) 
        : 100;

      const rawId = p.id ?? '';
      const formattedNip = String(rawId).startsWith('BK-')
        ? String(rawId)
        : `BK-PP1-${String(rawId).padStart(3, '0')}`;
      const jabatan = p.jabatan || `${p.sekup || ''} ${p.unit || ''}`.trim() || 'Pekerja Operasional';

      return {
        id: p.id,
        nip: formattedNip,
        nama: p.nama,
        unit: p.unit,
        sekup: p.sekup,
        jabatan,
        bulanan,
        totalIjin,
        pctKehadiran
      };
    });

    if (sortBy === 'totalIjin') {
      return [...rows].sort((a, b) => b.totalIjin - a.totalIjin);
    } else if (sortBy === 'kehadiran') {
      return [...rows].sort((a, b) => a.pctKehadiran - b.pctKehadiran);
    } else if (sortBy === 'nama') {
      return [...rows].sort((a, b) => a.nama.localeCompare(b.nama));
    }
    // Default: urutan master sheet persis datasheet asli Google Sheets
    return rows;
  }, [filteredPekerja, workerMonthlyMap, bulanAwal, bulanAkhir, sortBy]);

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

  // Calculate total monthly lost minutes across active workers
  const monthlyLostMinutes = useMemo(() => {
    return bulanLabels.map((_, idx) => {
      return rekapRows.reduce((acc, r) => acc + (r.bulanan[idx] || 0), 0);
    });
  }, [rekapRows, bulanLabels]);

  // Overall average attendance & peak discipline month
  const { avgOverall, bestMonthName } = useMemo(() => {
    const activeValues: { month: string; val: number }[] = [];
    bulanLabels.forEach((lbl, idx) => {
      const bNum = idx + 1;
      if (bNum >= Number(bulanAwal) && bNum <= Number(bulanAkhir)) {
        const valStr = monthlyAverages[idx];
        if (valStr !== null) {
          activeValues.push({ month: lbl, val: parseFloat(valStr) });
        }
      }
    });

    if (activeValues.length === 0) {
      return { avgOverall: 100, bestMonthName: 'November' };
    }

    const total = activeValues.reduce((sum, item) => sum + item.val, 0);
    const avg = total / activeValues.length;

    let best = activeValues[0];
    activeValues.forEach(item => {
      if (item.val > best.val) best = item;
    });

    const fullMonthNames: Record<string, string> = {
      'Jan': 'Januari', 'Feb': 'Februari', 'Mar': 'Maret', 'Apr': 'April',
      'Mei': 'Mei', 'Jun': 'Juni', 'Jul': 'Juli', 'Agu': 'Agustus',
      'Sep': 'September', 'Okt': 'Oktober', 'Nov': 'November', 'Des': 'Desember'
    };

    return {
      avgOverall: avg,
      bestMonthName: fullMonthNames[best.month] || best.month
    };
  }, [bulanLabels, bulanAwal, bulanAkhir, monthlyAverages]);

  // Unique units list for filter dropdown in Card 2
  const uniqueUnits = useMemo(() => {
    const set = new Set<string>();
    pekerjaList.forEach(p => {
      if (p.unit) set.add(p.unit);
    });
    return Array.from(set);
  }, [pekerjaList]);

  // Ranking data with independent search, unit filter, and sorting
  const rankingRows = useMemo(() => {
    let list = rekapRows.map(r => ({ ...r }));

    if (rankingUnit !== 'Semua') {
      list = list.filter(r => r.unit === rankingUnit);
    }

    if (rankingSearch.trim()) {
      const q = rankingSearch.trim().toLowerCase();
      list = list.filter(r =>
        r.nama.toLowerCase().includes(q) ||
        r.nip.toLowerCase().includes(q) ||
        r.jabatan.toLowerCase().includes(q)
      );
    }

    if (rankingSort === 'perhatian') {
      // Perlu Perhatian Teratas: Terendah ke tertinggi (Merah -> Hijau)
      list.sort((a, b) => a.pctKehadiran - b.pctKehadiran);
    } else if (rankingSort === 'tertinggi') {
      // Tertinggi ke terendah (Hijau -> Merah)
      list.sort((a, b) => b.pctKehadiran - a.pctKehadiran);
    } else if (rankingSort === 'nama') {
      // Urut Nama A - Z
      list.sort((a, b) => a.nama.localeCompare(b.nama));
    }

    return list;
  }, [rekapRows, rankingUnit, rankingSearch, rankingSort]);

  // Cubic Bezier curve path generator
  const generateSmoothPath = (pts: { x: number; y: number }[]): string => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  // SVG Chart Geometry calculations
  const isKehadiran = chartMode === 'kehadiran';

  const chartDataPoints = useMemo(() => {
    return bulanLabels.map((lbl, idx) => {
      const avgStr = monthlyAverages[idx];
      const avgVal = avgStr !== null ? parseFloat(avgStr) : 100;
      const displayVal = isKehadiran ? avgVal : Math.max(0, 100 - avgVal);
      const lostMin = monthlyLostMinutes[idx] || 0;
      const lostHour = lostMin / 60;
      const hourLabel = lostHour === 0 ? '0j' : (lostHour % 1 === 0 ? `${lostHour}j` : `${lostHour.toFixed(1).replace('.', ',')}j`);

      return {
        month: lbl,
        value: displayVal,
        lostMin,
        hourLabel
      };
    });
  }, [bulanLabels, monthlyAverages, isKehadiran, monthlyLostMinutes]);

  const { minY, maxY, yTicks } = useMemo(() => {
    const vals = chartDataPoints.map(d => d.value);
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);

    if (isKehadiran) {
      // 5 ticks matching reference image (e.g. 93.00% to 100.50%)
      const minScale = Math.min(93, Math.floor(minVal - 0.5));
      const maxScale = 100.5;
      const step = (maxScale - minScale) / 4;
      const ticks = [0, 1, 2, 3, 4].map(i => minScale + i * step);
      return { minY: minScale, maxY: maxScale, yTicks: ticks };
    } else {
      const minScale = 0;
      const maxScale = Math.max(7, Math.ceil(maxVal + 1));
      const step = (maxScale - minScale) / 4;
      const ticks = [0, 1, 2, 3, 4].map(i => minScale + i * step);
      return { minY: minScale, maxY: maxScale, yTicks: ticks };
    }
  }, [chartDataPoints, isKehadiran]);

  const svgPadding = { left: 75, right: 45, top: 45, bottom: 65 };
  const plotWidth = 1000 - svgPadding.left - svgPadding.right; // 880
  const plotHeight = 320 - svgPadding.top - svgPadding.bottom; // 210
  const baselineY = svgPadding.top + plotHeight; // 255

  const points = chartDataPoints.map((d, i) => {
    const x = svgPadding.left + (i / (chartDataPoints.length - 1)) * plotWidth;
    const yRatio = (d.value - minY) / (maxY - minY);
    const y = baselineY - yRatio * plotHeight;
    return { x, y, ...d };
  });

  const smoothCurve = generateSmoothPath(points);
  const areaPath = points.length > 0
    ? `${smoothCurve} L ${points[points.length - 1].x.toFixed(1)} ${baselineY} L ${points[0].x.toFixed(1)} ${baselineY} Z`
    : '';

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Filter Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Rekapitulasi Presensi Tahunan</h2>
            <p className="text-xs text-slate-500">Analisis tren kehadiran dan ranking pekerja per periode</p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 text-xs">
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
          <div>
            <label className="block text-slate-500 font-bold mb-1">Urutan Baris</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium"
            >
              <option value="default">📋 Urutan Sheet Asli</option>
              <option value="totalIjin">⏳ Ijin Terbanyak</option>
              <option value="kehadiran">⚠️ Kehadiran Terendah</option>
              <option value="nama">🔤 Nama (A - Z)</option>
            </select>
          </div>
        </div>

      </div>

      {/* Visual Analytics Modules (Tren Kehadiran Garis & Evaluasi Balok Peringkat) */}
      <div className="space-y-6">
        
        {/* Card 1: Grafik Tren Tingkat Kehadiran Bulanan (Jan – Des) */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          
          {/* Header & Toggle Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Grafik Tren Tingkat Kehadiran Bulanan (Jan – Des {tahun})
                </h3>
                <p className="text-xs text-slate-500">
                  Visualisasi kurva garis persentase jam kerja efektif operasional PT Batu Karang
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto print:hidden">
              <button
                type="button"
                onClick={() => setChartMode('kehadiran')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isKehadiran
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                % Kehadiran Efektif
              </button>
              <button
                type="button"
                onClick={() => setChartMode('izin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !isKehadiran
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                % Izin / Waktu Hilang
              </button>
            </div>
          </div>

          {/* SVG Smooth Curve Canvas */}
          <div className="w-full overflow-x-auto pb-2">
            <div className="min-w-[700px] lg:min-w-0">
              <svg viewBox="0 0 1000 320" className="w-full h-auto overflow-visible select-none">
                <defs>
                  {/* Kehadiran Blue Gradient */}
                  <linearGradient id="areaGradientKehadiran" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
                  </linearGradient>

                  {/* Izin Rose Gradient */}
                  <linearGradient id="areaGradientIzin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e11d48" stopOpacity="0.20" />
                    <stop offset="100%" stopColor="#e11d48" stopOpacity="0.01" />
                  </linearGradient>

                  {/* Drop shadow for floating pills */}
                  <filter id="pillShadow" x="-10%" y="-10%" width="120%" height="130%">
                    <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.08" />
                  </filter>
                </defs>

                {/* Horizontal Dashed Gridlines & Y-axis percentage labels */}
                {yTicks.map((tick, tIdx) => {
                  const tickY = baselineY - ((tick - minY) / (maxY - minY)) * plotHeight;
                  return (
                    <g key={tIdx}>
                      <line
                        x1={svgPadding.left}
                        y1={tickY}
                        x2={1000 - svgPadding.right}
                        y2={tickY}
                        stroke="#e2e8f0"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x={svgPadding.left - 12}
                        y={tickY + 4}
                        textAnchor="end"
                        fontSize="10"
                        fontWeight="600"
                        fill="#94a3b8"
                        fontFamily="monospace"
                      >
                        {tick.toFixed(2).replace('.', ',')}%
                      </text>
                    </g>
                  );
                })}

                {/* Area Gradient Fill */}
                {areaPath && (
                  <path
                    d={areaPath}
                    fill={isKehadiran ? 'url(#areaGradientKehadiran)' : 'url(#areaGradientIzin)'}
                  />
                )}

                {/* Smooth Curve Line */}
                {smoothCurve && (
                  <path
                    d={smoothCurve}
                    fill="none"
                    stroke={isKehadiran ? '#2563eb' : '#e11d48'}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Nodes, Floating Percentage Pills, and X-axis Labels */}
                {points.map((p, pIdx) => {
                  // Ensure pill stays within SVG bounds
                  const pillY = p.y - 28 < 16 ? p.y + 12 : p.y - 28;
                  const strokePill = isKehadiran ? '#93c5fd' : '#fca5a5';
                  const textPillColor = isKehadiran ? '#1d4ed8' : '#be123c';
                  const dotColor = isKehadiran ? '#2563eb' : '#e11d48';

                  return (
                    <g key={pIdx}>
                      {/* Outer Dot Node with Halo */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="5.5"
                        fill="#ffffff"
                        stroke={dotColor}
                        strokeWidth="3"
                        className="transition-all hover:scale-125"
                      />

                      {/* Floating Data Pill Badge */}
                      <g filter="url(#pillShadow)">
                        <rect
                          x={p.x - 27}
                          y={pillY}
                          width="54"
                          height="20"
                          rx="6"
                          fill="#ffffff"
                          stroke={strokePill}
                          strokeWidth="1.2"
                        />
                        <text
                          x={p.x}
                          y={pillY + 14}
                          textAnchor="middle"
                          fontSize="9.5"
                          fontWeight="700"
                          fill={textPillColor}
                          fontFamily="monospace"
                        >
                          {p.value.toFixed(2).replace('.', ',')}%
                        </text>
                      </g>

                      {/* X-axis Month Label */}
                      <text
                        x={p.x}
                        y={baselineY + 22}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="700"
                        fill="#334155"
                      >
                        {p.month}
                      </text>

                      {/* X-axis Total Lost Hours */}
                      <text
                        x={p.x}
                        y={baselineY + 38}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="500"
                        fill="#64748b"
                      >
                        {p.hourLabel}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Bottom AI/Analytic Summary Box */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900">Analisis Tren Kehadiran Garis: </span>
              Tingkat kehadiran pekerja stabil rata-rata{' '}
              <span className="font-bold text-slate-900">
                {avgOverall.toFixed(2).replace('.', ',')}%
              </span>{' '}
              ({avgOverall >= 95 ? 'di atas batas toleransi 95%' : 'perlu perhatian karena di bawah standar 95%'}).
              Puncak disiplin tertinggi terjadi pada bulan{' '}
              <span className="font-bold text-slate-900">{bestMonthName}</span>, sementara fluktuasi
              izin dipengaruhi oleh agenda kerja dan pengajuan izin cuti/ijin pekerja.
            </p>
          </div>
        </div>

        {/* Card 2: Grafik Balok Peringkat Kehadiran Pekerja (Evaluasi Periode Jan – Des) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5 print:p-0 print:border-none print:shadow-none print:space-y-2">
          
          {/* Header, Search, Unit Filter, and Sort Order Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Grafik Balok Peringkat Kehadiran Pekerja (Evaluasi Periode Jan – Des {tahun})
                </h3>
                <p className="text-xs text-slate-500">
                  Urutan Evaluasi Pembinaan: Karyawan paling perlu perhatian (warna merah) berada di atas, menuju tingkat kehadiran sempurna (hijau) di bawah ({rankingRows.length} Pekerja)
                </p>
              </div>
            </div>

            {/* Filter and Search Bar Controls (Hidden when printed to save page space) */}
            <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto print:hidden">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari pekerja / NIP..."
                  value={rankingSearch}
                  onChange={(e) => setRankingSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 w-36 sm:w-44 focus:outline-blue-500"
                />
              </div>

              <select
                value={rankingUnit}
                onChange={(e) => setRankingUnit(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-blue-500"
              >
                <option value="Semua">Semua Unit</option>
                {uniqueUnits.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>

              <select
                value={rankingSort}
                onChange={(e) => setRankingSort(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-blue-500"
              >
                <option value="perhatian">⇅ Perlu Perhatian Teratas (Merah → Hijau)</option>
                <option value="tertinggi">⇅ Tingkat Kehadiran Tertinggi (Hijau → Merah)</option>
                <option value="nama">🔤 Urut Nama (A – Z)</option>
              </select>
            </div>
          </div>

          {/* Category Color Legend and Total Count */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs print:pt-1 print:border-slate-200">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] font-semibold">
              <span className="flex items-center gap-1.5 text-red-600">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                &lt; 95.0% (Perlu Pembinaan / Perhatian)
              </span>
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                95.0% - 97.9% (Memenuhi Baku)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                &ge; 98.0% (Sangat Baik / Sempurna)
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500">
              Total {rankingRows.length} Pekerja Ditampilkan
            </span>
          </div>

          {/* List of Evaluation Progress Cards - Compact on screen & Ultra-compact for print */}
          <div className="max-h-[500px] overflow-y-auto space-y-1.5 pr-1.5 print:max-h-none print:overflow-visible print:space-y-1 print:pr-0">
            {rankingRows.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Tidak ada data pekerja yang cocok dengan kriteria pencarian atau filter.
              </div>
            ) : (
              rankingRows.map((r, idx) => {
                // Tier criteria
                const isRed = r.pctKehadiran < 95.0;
                const isBlue = r.pctKehadiran >= 95.0 && r.pctKehadiran < 98.0;

                const rankBg = isRed
                  ? 'bg-red-500'
                  : isBlue
                  ? 'bg-blue-600'
                  : 'bg-emerald-600';

                const barGradient = isRed
                  ? 'bg-gradient-to-r from-red-600 to-red-500'
                  : isBlue
                  ? 'bg-gradient-to-r from-blue-700 to-blue-500'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-500';

                const badgeClass = isRed
                  ? 'bg-red-50 text-red-600 border-red-200'
                  : isBlue
                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-200';

                const badgeText = isRed
                  ? 'Perlu Pembinaan'
                  : isBlue
                  ? 'Memenuhi Baku'
                  : 'Sangat Baik';

                const lostHours = Math.round(r.totalIjin / 60);

                return (
                  <div
                    key={`${r.id}-${idx}`}
                    className="bg-white py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-lg sm:rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 print:py-1 print:px-2 print:my-0.5 print:border-b print:border-slate-200 print:shadow-none print:rounded-none print:flex-row print:items-center print:gap-2 break-inside-avoid"
                    style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                  >
                    {/* Left: Rank Badge + Worker Identity */}
                    <div className="flex items-center gap-2 sm:gap-2.5 sm:min-w-[190px] sm:max-w-[230px] print:min-w-[170px] print:max-w-[200px] print:gap-1.5">
                      <div
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg ${rankBg} text-white font-bold text-[10px] sm:text-[11px] flex items-center justify-center shrink-0 shadow-xs print:w-5 print:h-5 print:text-[9px] print:rounded`}
                      >
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs sm:text-[13px] text-slate-900 truncate print:text-[10px] print:leading-tight" title={r.nama}>
                          {r.nama}
                        </div>
                        <div
                          className="text-[10px] sm:text-[11px] text-slate-500 truncate print:text-[8px] print:leading-tight"
                          title={`${r.nip} • ${r.jabatan}`}
                        >
                          {r.nip} • {r.jabatan}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Horizontal Progress Bar */}
                    <div className="flex-1 sm:mx-2 print:mx-1.5">
                      <div className="w-full bg-slate-100 h-2 sm:h-2.5 rounded-full overflow-hidden p-0.5 print:h-1.5 print:p-0">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${barGradient}`}
                          style={{ width: `${Math.min(100, Math.max(5, r.pctKehadiran))}%` }}
                        />
                      </div>
                    </div>

                    {/* Right: Percentage, Lost Hours, and Status Tag Badge */}
                    <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-0.5 sm:pt-0 border-t border-slate-50 sm:border-0 print:border-0 print:pt-0 print:gap-2">
                      <div className="text-left sm:text-right print:text-right">
                        <div className="font-mono font-bold text-xs sm:text-[13px] text-slate-900 print:text-[10px]">
                          {r.pctKehadiran.toFixed(2).replace('.', ',')}%
                        </div>
                        <div className="text-[9.5px] sm:text-[10px] text-slate-400 print:text-[8px]">
                          Ijin: {lostHours}j ({r.totalIjin}m)
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9.5px] sm:text-[10px] font-bold border whitespace-nowrap print:px-1.5 print:py-0 print:text-[8px] ${badgeClass}`}
                      >
                        {badgeText}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Rekap Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">
              Tabel Rincian Kehadiran per Bulan ({rekapRows.length} Pekerja)
            </span>
            <span className="sm:hidden px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Geser ↔
            </span>
          </div>
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
                      {m > 0 ? (
                        <span className="text-amber-600 font-bold">
                          {m}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">0</span>
                      )}
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
