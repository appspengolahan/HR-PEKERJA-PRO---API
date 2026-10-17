import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  HeartPulse, 
  FileText, 
  Search, 
  Printer, 
  Share2, 
  Lock, 
  Building2, 
  BarChart3, 
  TrendingUp, 
  ChevronRight, 
  ArrowLeft,
  CalendarCheck,
  Clock,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { PekerjaData, PresensiIjinRecord } from '../../types';

interface PublicPortalProps {
  pekerjaList: PekerjaData[];
  presensiList: PresensiIjinRecord[];
  onExitPublic?: () => void;
  onSwitchToLogin?: () => void;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({
  pekerjaList,
  presensiList,
  onExitPublic,
  onSwitchToLogin
}) => {
  // Navigation sub-tabs within public portal
  const [activeTab, setActiveTab] = useState<'daily' | 'rekap' | 'capacity'>('daily');

  // Format Helper: Get today in YYYY-MM-DD and DD/MM/YYYY
  const todayDateObj = new Date();
  const formatIsoDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isoToDmy = (isoStr: string) => {
    if (!isoStr || !isoStr.includes('-')) return isoStr;
    const [y, m, d] = isoStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const dmyToIso = (dmyStr: string) => {
    if (!dmyStr || !dmyStr.includes('/')) return formatIsoDate(todayDateObj);
    const [d, m, y] = dmyStr.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  };

  // State: Selected Date for daily attendance
  const [selectedIsoDate, setSelectedIsoDate] = useState<string>(() => formatIsoDate(todayDateObj));
  const selectedDmyDate = useMemo(() => isoToDmy(selectedIsoDate), [selectedIsoDate]);

  // State: Filters
  const [selectedUnit, setSelectedUnit] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // State: Rekap tab month & year filter
  const [selectedMonth, setSelectedMonth] = useState<number>(todayDateObj.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState<number>(todayDateObj.getFullYear());

  // Copy Link State
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = () => {
    const publicUrl = window.location.origin + window.location.pathname + '?view=public';
    navigator.clipboard.writeText(publicUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    });
  };

  // Quick Date Selectors
  const setDateToday = () => setSelectedIsoDate(formatIsoDate(todayDateObj));
  const setDateYesterday = () => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    setSelectedIsoDate(formatIsoDate(y));
  };

  // Human-readable date label in Indonesian
  const formattedIndonesianDate = useMemo(() => {
    try {
      const [y, m, d] = selectedIsoDate.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return selectedDmyDate;
    }
  }, [selectedIsoDate, selectedDmyDate]);

  // 1. Filtered Workers based on unit & search
  const filteredWorkers = useMemo(() => {
    return pekerjaList.filter(p => {
      const matchUnit = selectedUnit === 'Semua' || p.unit.toLowerCase() === selectedUnit.toLowerCase();
      const matchSearch = !searchQuery || p.nama.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchUnit && matchSearch;
    });
  }, [pekerjaList, selectedUnit, searchQuery]);

  // 2. Presensi / Ijin records on selected date
  const selectedDateLeaves = useMemo(() => {
    return presensiList.filter(rec => {
      if (!rec.tanggal) return false;
      const cleanDate = rec.tanggal.trim();
      return cleanDate === selectedDmyDate || cleanDate === selectedIsoDate;
    });
  }, [presensiList, selectedDmyDate, selectedIsoDate]);

  // Map worker leaves on this date
  const workerLeaveMap = useMemo(() => {
    const map = new Map<string, PresensiIjinRecord>();
    selectedDateLeaves.forEach(item => {
      if (item.nama) {
        map.set(item.nama.trim().toUpperCase(), item);
      }
    });
    return map;
  }, [selectedDateLeaves]);

  // Compute Daily Attendance Numbers
  const dailyStats = useMemo(() => {
    let hadir = 0;
    let ijin = 0;
    let sakit = 0;
    let alpa = 0;

    filteredWorkers.forEach(w => {
      const leave = workerLeaveMap.get(w.nama.trim().toUpperCase());
      if (!leave) {
        hadir += 1;
      } else {
        const j = (leave.jenisIjin || '').toLowerCase();
        if (j.includes('sakit')) {
          sakit += 1;
        } else if (j.includes('alpa') || j.includes('mangkir')) {
          alpa += 1;
        } else {
          ijin += 1;
        }
      }
    });

    const total = filteredWorkers.length;
    const persenHadir = total > 0 ? ((hadir / total) * 100).toFixed(1) : '0';

    return { total, hadir, ijin, sakit, alpa, persenHadir };
  }, [filteredWorkers, workerLeaveMap]);

  // Monthly Rekap Analytics
  const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const monthlyUnitStats = useMemo(() => {
    const units = ['Cengkeh', 'Blend', 'Tembakau', 'Krosok'];
    return units.map(unitName => {
      const unitWorkers = pekerjaList.filter(p => p.unit.toLowerCase() === unitName.toLowerCase());
      const workerNames = new Set(unitWorkers.map(p => p.nama.trim().toUpperCase()));
      
      // Count total absence records for this month
      const monthLeaves = presensiList.filter(r => {
        if (!r.tanggal || !r.nama) return false;
        if (!workerNames.has(r.nama.trim().toUpperCase())) return false;
        
        // Extract month & year from "DD/MM/YYYY" or "YYYY-MM-DD"
        let m = 0;
        let y = 0;
        if (r.tanggal.includes('/')) {
          const parts = r.tanggal.split('/');
          m = Number(parts[1]);
          y = Number(parts[2]);
        } else if (r.tanggal.includes('-')) {
          const parts = r.tanggal.split('-');
          y = Number(parts[0]);
          m = Number(parts[1]);
        }
        return m === selectedMonth && (y === selectedYear || y === 2026);
      });

      const totalHeadcount = unitWorkers.length;
      const workDays = 26; // Standard 26 working days
      const totalPossibleMandays = totalHeadcount * workDays;
      const lostMandays = monthLeaves.length;
      const actualMandays = Math.max(0, totalPossibleMandays - lostMandays);
      const percentage = totalPossibleMandays > 0 
        ? ((actualMandays / totalPossibleMandays) * 100).toFixed(1)
        : '100.0';

      return {
        unit: unitName,
        headcount: totalHeadcount,
        totalLeaves: lostMandays,
        attendanceRate: Number(percentage)
      };
    });
  }, [pekerjaList, presensiList, selectedMonth, selectedYear]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. TOP NAVBAR / BRAND HEADER */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5 shadow-sm print:hidden">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Logo & Application Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md shadow-blue-900/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                  HR Pekerja — Produksi I
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Portal Publik Linktree
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                PT Batu Karang &bull; Sistem Pemantauan Kehadiran &amp; Ketenagakerjaan Terbuka
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* Copy Public Link */}
            <button
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                isCopied 
                  ? 'bg-emerald-600 text-white border-emerald-500' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Salin tautan halaman ini untuk dipasang di Linktree"
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Tersalin!' : 'Salin Tautan'}</span>
            </button>

            {/* Print / Save PDF */}
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Cetak ringkasan halaman ini"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>

            {/* Login Staf Internal */}
            {onSwitchToLogin && (
              <button
                onClick={onSwitchToLogin}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                title="Buka gerbang login khusus tim internal"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Login Staf</span>
              </button>
            )}

          </div>

        </div>
      </header>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Banner Penjelasan Akses Publik */}
        <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 rounded-2xl border border-blue-500/30 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm print:hidden">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Informasi Terbuka Divisi Produksi I (Read-Only)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              Monitoring Kehadiran &amp; Status Operasional 4 Lini
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Halaman ini menyajikan status kehadiran pekerja harian secara transparan bagi manajemen dan mitra divisi. Data keuangan, rincian upah, dan dokumen pribadi terlindungi secara aman.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Total Pekerja Terdaftar</span>
              <span className="text-2xl font-black text-white font-mono">{pekerjaList.length} Orang</span>
            </div>
          </div>
        </div>

        {/* 3. SEGMENTED TAB BUTTONS (NAVIGATION BAR) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-2 flex-wrap print:hidden">
          <div className="inline-flex p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-semibold gap-1">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'daily'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Kehadiran &amp; Izin Hari Ini</span>
            </button>

            <button
              onClick={() => setActiveTab('rekap')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'rekap'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Rekapitulasi Presensi Bulanan</span>
            </button>

            <button
              onClick={() => setActiveTab('capacity')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'capacity'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Kapasitas Tim per Unit</span>
            </button>
          </div>

          {/* Tanggal Aktif Header Tampilan */}
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Terpilih: <strong className="text-white">{formattedIndonesianDate}</strong></span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: KEHADIRAN & STATUS IZIN HARIAN (INTERAKTIF)             */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'daily' && (
          <div className="space-y-5">
            
            {/* Control Bar: Date Selector, Unit Filter, Search */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3.5 shadow-xs print:hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                
                {/* Date Picker & Quick Date Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    Pilih Tanggal:
                  </span>

                  <button
                    type="button"
                    onClick={setDateToday}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      selectedIsoDate === formatIsoDate(todayDateObj)
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Hari Ini
                  </button>

                  <button
                    type="button"
                    onClick={setDateYesterday}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      selectedIsoDate !== formatIsoDate(todayDateObj) && selectedIsoDate === (() => {
                        const y = new Date(); y.setDate(y.getDate() - 1); return formatIsoDate(y);
                      })()
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Kemarin
                  </button>

                  {/* Native HTML Date Picker */}
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedIsoDate}
                      onChange={(e) => {
                        if (e.target.value) setSelectedIsoDate(e.target.value);
                      }}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari nama pekerja..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

              </div>

              {/* Unit Filter Buttons */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/80 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 mr-1">Filter Unit:</span>
                {['Semua', 'Cengkeh', 'Blend', 'Tembakau', 'Krosok'].map((u) => (
                  <button
                    key={u}
                    onClick={() => setSelectedUnit(u)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedUnit === u
                        ? 'bg-slate-200 text-slate-950 font-bold shadow-xs'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {u === 'Semua' ? '🏢 Semua Unit' : `🌿 Unit ${u}`}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Summary Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <span>Pekerja Terjadwal</span>
                  <Users className="w-4 h-4 text-slate-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {dailyStats.total} <span className="text-xs font-normal text-slate-400">Orang</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {selectedUnit === 'Semua' ? '4 Lini Komoditas' : `Unit ${selectedUnit}`}
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-900/60 bg-emerald-950/20 shadow-xs">
                <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <span>Hadir Masuk</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  {dailyStats.hadir} <span className="text-xs font-normal text-emerald-500/80">Orang</span>
                </div>
                <div className="text-[11px] text-emerald-300 font-semibold mt-1">
                  Tingkat Kehadiran: {dailyStats.persenHadir}%
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-amber-900/60 bg-amber-950/20 shadow-xs">
                <div className="flex items-center justify-between text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <span>Izin / Cuti</span>
                  <CalendarCheck className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  {dailyStats.ijin} <span className="text-xs font-normal text-amber-500/80">Orang</span>
                </div>
                <div className="text-[11px] text-amber-300 mt-1">
                  Izin pribadi / tugas resmi
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-rose-900/60 bg-rose-950/20 shadow-xs">
                <div className="flex items-center justify-between text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <span>Sakit</span>
                  <HeartPulse className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
                  {dailyStats.sakit} <span className="text-xs font-normal text-rose-500/80">Orang</span>
                </div>
                <div className="text-[11px] text-rose-300 mt-1">
                  Surat keterangan dokter
                </div>
              </div>

            </div>

            {/* Panel Khusus: Daftar Pekerja yang Sedang Izin / Sakit pada Tanggal Ini */}
            {selectedDateLeaves.length > 0 && (
              <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-amber-500/30 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs sm:text-sm font-bold text-amber-200">
                      Daftar Pekerja Izin / Sakit pada {formattedIndonesianDate}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                    {selectedDateLeaves.length} Pekerja
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {selectedDateLeaves.map((item, idx) => (
                    <div 
                      key={`${item.nama}-${idx}`}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white truncate">{item.nama}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          (item.jenisIjin || '').toLowerCase().includes('sakit')
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {item.jenisIjin}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Unit {item.unit}</span>
                        {item.jamAwal && item.jamAkhir && (
                          <span className="font-mono text-slate-300">{item.jamAwal} - {item.jamAkhir}</span>
                        )}
                      </div>
                      {item.keperluan && (
                        <p className="text-[10px] text-slate-400 italic line-clamp-1 border-t border-slate-800/80 pt-1">
                          "{item.keperluan}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabel Status Kehadiran Detail (Sanitized - Data Pribadi & Gaji Disembunyikan) */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>Daftar Presensi Tenaga Kerja ({filteredWorkers.length} Pekerja)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Menampilkan status kehadiran terverifikasi pada tanggal {formattedIndonesianDate}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3 w-12 text-center">No</th>
                      <th className="p-3">Nama Pekerja</th>
                      <th className="p-3">Unit Komoditas</th>
                      <th className="p-3">Jabatan / Lini</th>
                      <th className="p-3 text-center">Status Kehadiran</th>
                      <th className="p-3">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filteredWorkers.map((worker, idx) => {
                      const leave = workerLeaveMap.get(worker.nama.trim().toUpperCase());
                      const isAbsent = Boolean(leave);
                      const isSakit = leave ? (leave.jenisIjin || '').toLowerCase().includes('sakit') : false;

                      return (
                        <tr key={worker.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-3 text-center text-slate-500 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="p-3 font-semibold text-white">
                            {worker.nama}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                              {worker.unit}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 text-[11px]">
                            {worker.sekup ? `Proses ${worker.unit}` : worker.jabatan}
                          </td>
                          <td className="p-3 text-center">
                            {!isAbsent ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                <CheckCircle2 className="w-3 h-3" />
                                Hadir Kerja
                              </span>
                            ) : isSakit ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                <HeartPulse className="w-3 h-3" />
                                Sakit
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                <AlertCircle className="w-3 h-3" />
                                {leave?.jenisIjin || 'Izin'}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-400 text-[11px]">
                            {leave ? (
                              <span className="text-slate-300">
                                {leave.keperluan ? `"${leave.keperluan}"` : leave.jenisIjin}
                                {leave.jamAwal && leave.jamAkhir ? ` (${leave.jamAwal} - ${leave.jamAkhir})` : ''}
                              </span>
                            ) : (
                              <span className="text-slate-500">Masuk jadwal normal</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: REKAPITULASI PRESENSI BULANAN                          */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'rekap' && (
          <div className="space-y-5">
            
            {/* Filter Bulan Rekapitulasi */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white">Pilih Periode Bulan Rekapitulasi:</span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                >
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      Bulan {m}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value={2026}>Tahun 2026</option>
                  <option value={2025}>Tahun 2025</option>
                </select>
              </div>
            </div>

            {/* Performance per Unit Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {monthlyUnitStats.map((item) => (
                <div 
                  key={item.unit}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">Unit {item.unit}</span>
                    <span className="text-xs font-mono font-bold text-blue-400">
                      {item.headcount} Pekerja
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Tingkat Kehadiran:</span>
                      <strong className={`font-mono ${item.attendanceRate >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {item.attendanceRate}%
                      </strong>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          item.attendanceRate >= 95 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${item.attendanceRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 flex justify-between">
                    <span>Total Izin/Sakit:</span>
                    <strong className="text-slate-200 font-mono">{item.totalLeaves} Kejadian</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Guidance Box for External Viewers */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 leading-relaxed">
                <span className="font-bold text-white block">Standar Perhitungan Tingkat Kehadiran</span>
                <p>
                  Persentase dihitung berdasarkan rasio hari hadir kerja terhadap standar 26 hari kerja efektif bulanan per pekerja. Nilai di atas 95% menunjukkan tingkat disiplin operasional yang sangat baik sesuai standar industri pengolahan tembakau &amp; cengkeh PT Batu Karang.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: KAPASITAS TIM PER UNIT                                  */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'capacity' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-teal-500" />
                    <h3 className="font-bold text-white text-sm">Unit Proses Cengkeh</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Operasional Aktif
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fokus pada pemisahan gagang, pembersihan, dan perajangan cengkeh berkualitas prima untuk bahan baku utama.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Tenaga Kerja Aktif</span>
                    <strong className="text-white text-sm font-mono">
                      {pekerjaList.filter(p => p.unit.toLowerCase().includes('cengkeh')).length} Orang
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Mandor Lapangan</span>
                    <strong className="text-white text-xs">Mandor Unit Cengkeh</strong>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-500" />
                    <h3 className="font-bold text-white text-sm">Unit Proses Blend</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Operasional Aktif
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Bertanggung jawab atas pencampuran proporsional (*blending*) formula racikan tembakau dan saus aroma.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Tenaga Kerja Aktif</span>
                    <strong className="text-white text-sm font-mono">
                      {pekerjaList.filter(p => p.unit.toLowerCase().includes('blend')).length} Orang
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Mandor Lapangan</span>
                    <strong className="text-white text-xs">Mandor Unit Blend</strong>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <h3 className="font-bold text-white text-sm">Unit Proses Tembakau</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Operasional Aktif
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pengolahan daun tembakau rajangan, pengeringan terukur (*rotary drying*), dan penyimpanan baku mutu.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Tenaga Kerja Aktif</span>
                    <strong className="text-white text-sm font-mono">
                      {pekerjaList.filter(p => p.unit.toLowerCase().includes('tembakau')).length} Orang
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Mandor Lapangan</span>
                    <strong className="text-white text-xs">Mandor Unit Tembakau</strong>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-sky-500" />
                    <h3 className="font-bold text-white text-sm">Unit Proses Krosok</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    Operasional Aktif
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sortasi daun krosok, grading kualitas daun, dan penimbangan awal bahan baku hasil panen petani mitra.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Tenaga Kerja Aktif</span>
                    <strong className="text-white text-sm font-mono">
                      {pekerjaList.filter(p => p.unit.toLowerCase().includes('krosok')).length} Orang
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Mandor Lapangan</span>
                    <strong className="text-white text-xs">Mandor Unit Krosok</strong>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* 4. PUBLIC FOOTER */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 px-4 py-4 text-xs text-slate-500 text-center print:hidden">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 Divisi Produksi I PT Batu Karang &bull; Portal Informasi Publik Read-Only</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-3 h-3" />
              <span>Bagikan Halaman Ini</span>
            </button>
            <span>&bull;</span>
            <span className="text-slate-400 font-mono text-[10px]">Live GAS Sync</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
