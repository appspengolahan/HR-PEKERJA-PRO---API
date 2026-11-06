import React, { useState, useMemo, useEffect } from 'react';
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
  TrendingDown,
  ChevronRight, 
  ChevronDown,
  ArrowLeft,
  CalendarCheck,
  Clock,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Info,
  Award,
  AlertTriangle,
  Plus,
  X,
  LayoutGrid,
  List
} from 'lucide-react';
import { PekerjaData, PresensiIjinRecord } from '../../types';
import { 
  normalizeDateToIso, 
  normalizeDateToDmy, 
  calculateEffectivePermitMinutes, 
  getWorkScheduleForDate,
  getNormalizedPermitMinutes
} from '../../utils/workHoursUtils';
import { INITIAL_PRESENSI_FALLBACK } from '../../data/initialPresensi';

interface PublicPortalProps {
  pekerjaList: PekerjaData[];
  presensiList: PresensiIjinRecord[];
  onExitPublic?: () => void;
  onSwitchToLogin?: () => void;
  onAddPresensi?: (data: {
    nama: string;
    jenisIjin: string;
    keperluan: string;
    lampiran: string;
    catatan: string;
    tanggalList: { tanggal: string; jamAwal: string; jamAkhir: string }[];
  }) => Promise<void>;
  currentUser?: any;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({
  pekerjaList,
  presensiList,
  onExitPublic,
  onSwitchToLogin,
  onAddPresensi,
  currentUser
}) => {
  // Deteksi unit default dari currentUser (jika ada peran yang aktif, misal Mandor Tembakau -> Tembakau)
  const defaultUnitFromUser = useMemo(() => {
    if (!currentUser) return 'Cengkeh';
    const s = `${currentUser.role || ''} ${currentUser.scope || ''} ${(currentUser.units || []).join(' ')}`.toLowerCase();
    if (s.includes('tembakau')) return 'Tembakau';
    if (s.includes('blend')) return 'Blend';
    if (s.includes('krosok')) return 'Krosok';
    if (s.includes('cengkeh')) return 'Cengkeh';
    return 'Cengkeh';
  }, [currentUser]);

  // Navigation sub-tabs within public portal: daily, rekap, yearly (BARU), capacity, lowest
  const [activeTab, setActiveTab] = useState<'daily' | 'rekap' | 'yearly' | 'capacity' | 'lowest'>('daily');

  // Layout mode for dual bar charts: 'grid' (2 Kolom Bersandingan) or 'stack' (1 Kolom Penuh)
  const [layoutMode, setLayoutMode] = useState<'grid' | 'stack'>('grid');

  // State: Tab Rekapitulasi Presensi Bulanan (2 Grafik Balok)
  const [selectedMonthlyUnit, setSelectedMonthlyUnit] = useState<string>(() => defaultUnitFromUser);
  const [monthlySearchUnit, setMonthlySearchUnit] = useState<string>('');
  const [monthlySortUnit, setMonthlySortUnit] = useState<'perhatian' | 'tertinggi' | 'nama'>('perhatian');
  const [monthlySearchAll, setMonthlySearchAll] = useState<string>('');
  const [monthlySortAll, setMonthlySortAll] = useState<'perhatian' | 'tertinggi' | 'nama'>('perhatian');

  // State: Tab Rekapitulasi Presensi Tahunan (2 Grafik Balok)
  const [yearlyYear, setYearlyYear] = useState<number>(2026);
  const [selectedYearlyUnit, setSelectedYearlyUnit] = useState<string>(() => defaultUnitFromUser);
  const [yearlySearchUnit, setYearlySearchUnit] = useState<string>('');
  const [yearlySortUnit, setYearlySortUnit] = useState<'perhatian' | 'tertinggi' | 'nama'>('perhatian');
  const [yearlySearchAll, setYearlySearchAll] = useState<string>('');
  const [yearlySortAll, setYearlySortAll] = useState<'perhatian' | 'tertinggi' | 'nama'>('perhatian');

  // Sinkronkan unit otomatis jika peran currentUser berubah
  useEffect(() => {
    if (defaultUnitFromUser) {
      setSelectedMonthlyUnit(defaultUnitFromUser);
      setSelectedYearlyUnit(defaultUnitFromUser);
    }
  }, [defaultUnitFromUser]);

  // Accordion toggle to hide/show the 63-workers list on daily view (Item 1)
  const [showAllWorkersTable, setShowAllWorkersTable] = useState(false);

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

  // Input Ijin Modal State (fitur input ijin langsung dari portal publik)
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputNama, setInputNama] = useState(pekerjaList[0]?.nama || '');
  const [inputTanggal, setInputTanggal] = useState(() => formatIsoDate(todayDateObj));
  const [inputJenisIjin, setInputJenisIjin] = useState('Ijin Terlambat');
  const [inputSehariPenuh, setInputSehariPenuh] = useState(false);
  const [inputJamAwal, setInputJamAwal] = useState('08:00');
  const [inputJamAkhir, setInputJamAkhir] = useState('16:00');
  const [inputKeperluan, setInputKeperluan] = useState('');
  const [inputPelapor, setInputPelapor] = useState('Mandor Lapangan');
  const [isSubmittingIjin, setIsSubmittingIjin] = useState(false);
  const [inputStatusMessage, setInputStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleToggleSehariPenuh = (checked: boolean) => {
    setInputSehariPenuh(checked);
    if (checked) {
      const sched = getWorkScheduleForDate(inputTanggal);
      if (sched.isWorkDay) {
        setInputJamAwal(sched.workStart);
        setInputJamAkhir(sched.workEnd);
      }
    }
  };

  const handleInputTanggalChange = (val: string) => {
    setInputTanggal(val);
    if (inputSehariPenuh) {
      const sched = getWorkScheduleForDate(val);
      if (sched.isWorkDay) {
        setInputJamAwal(sched.workStart);
        setInputJamAkhir(sched.workEnd);
      }
    }
  };

  const handleAddIjinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNama || !inputTanggal || !inputJenisIjin) {
      setInputStatusMessage({ type: 'error', text: 'Nama, Tanggal, dan Jenis Izin wajib diisi.' });
      return;
    }

    if (!onAddPresensi) {
      setInputStatusMessage({ type: 'error', text: 'Fungsi input presensi tidak tersedia di sesi ini.' });
      return;
    }

    setIsSubmittingIjin(true);
    setInputStatusMessage(null);

    try {
      let jamAwal = inputJamAwal;
      let jamAkhir = inputJamAkhir;

      if (inputSehariPenuh) {
        const sched = getWorkScheduleForDate(inputTanggal);
        jamAwal = sched.workStart;
        jamAkhir = sched.workEnd;
      }

      await onAddPresensi({
        nama: inputNama,
        jenisIjin: inputJenisIjin,
        keperluan: inputKeperluan || 'Izin Lapangan (Portal Publik)',
        lampiran: 'Tidak',
        catatan: `Dicatat dari Portal Publik oleh: ${inputPelapor || 'Mandor'}`,
        tanggalList: [{
          tanggal: inputTanggal,
          jamAwal,
          jamAkhir
        }]
      });

      // Sinkronkan selected date ke tanggal yang baru diinput agar pengguna langsung melihat perubahannya
      setSelectedIsoDate(inputTanggal);

      setInputStatusMessage({
        type: 'success',
        text: `Sukses! Data ijin "${inputNama}" pada ${normalizeDateToDmy(inputTanggal)} berhasil dicatat & disinkronkan ke spreadsheet.`
      });

      setTimeout(() => {
        setShowInputModal(false);
        setInputStatusMessage(null);
        setInputKeperluan('');
      }, 1500);
    } catch (err) {
      setInputStatusMessage({
        type: 'error',
        text: `Gagal menyimpan: ${String(err)}`
      });
    } finally {
      setIsSubmittingIjin(false);
    }
  };

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

  // 2. Presensi / Ijin records on selected date (menggunakan normalisasi ISO yang tahan segala format)
  const selectedDateLeaves = useMemo(() => {
    return presensiList.filter(rec => {
      const recIso = normalizeDateToIso(rec.tanggalIso || rec.tanggal);
      return recIso === selectedIsoDate;
    });
  }, [presensiList, selectedIsoDate]);

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

  // Filtered leaves according to unit and search
  const filteredDateLeaves = useMemo(() => {
    return selectedDateLeaves.filter(rec => {
      const worker = pekerjaList.find(p => p.nama.trim().toUpperCase() === (rec.nama || '').trim().toUpperCase());
      const unit = worker ? worker.unit : (rec.unit || '');
      const matchUnit = selectedUnit === 'Semua' || unit.toLowerCase() === selectedUnit.toLowerCase();
      const matchSearch = !searchQuery || (rec.nama || '').toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchUnit && matchSearch;
    });
  }, [selectedDateLeaves, pekerjaList, selectedUnit, searchQuery]);

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
        } else if (j.includes('alpa') || j.includes('alpha') || j.includes('mangkir')) {
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
        
        const rIso = normalizeDateToIso(r.tanggalIso || r.tanggal);
        if (!rIso || !rIso.includes('-')) return false;
        const [yStr, mStr] = rIso.split('-');
        const m = Number(mStr);
        const y = Number(yStr);
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

  // 10 Pekerja dengan Kehadiran Terendah pada Bulan Terpilih (Item 2)
  const lowestAttendanceStats = useMemo(() => {
    const workDays = 26; // Hari kerja standar sebulan
    
    // Inisialisasi statistik untuk setiap pekerja
    const workerStatsMap = new Map<string, {
      worker: PekerjaData;
      sakit: number;
      ijin: number;
      alpa: number;
      totalLeaves: number;
      totalMenit: number;
    }>();

    pekerjaList.forEach(p => {
      workerStatsMap.set(p.nama.trim().toUpperCase(), {
        worker: p,
        sakit: 0,
        ijin: 0,
        alpa: 0,
        totalLeaves: 0,
        totalMenit: 0
      });
    });

    // Hitung seluruh riwayat ketidakhadiran di bulan terpilih
    presensiList.forEach(r => {
      if (!r.tanggal || !r.nama) return;
      const cleanName = r.nama.trim().toUpperCase();
      const stats = workerStatsMap.get(cleanName);
      if (!stats) return;

      const rIso = normalizeDateToIso(r.tanggalIso || r.tanggal);
      if (!rIso || !rIso.includes('-')) return;
      const [yStr, mStr] = rIso.split('-');
      const m = Number(mStr);
      const y = Number(yStr);

      if (m === selectedMonth && (y === selectedYear || y === 2026)) {
        stats.totalLeaves += 1;
        stats.totalMenit += Number(r.durasiMenit) || 0;
        const j = (r.jenisIjin || '').toLowerCase();
        if (j.includes('sakit')) {
          stats.sakit += 1;
        } else if (j.includes('alpa') || j.includes('alpha') || j.includes('mangkir')) {
          stats.alpa += 1;
        } else {
          stats.ijin += 1;
        }
      }
    });

    // Hitung persentase kehadiran masing-masing
    const allCalculated = Array.from(workerStatsMap.values()).map(item => {
      const hadirDays = Math.max(0, workDays - item.totalLeaves);
      const rate = Number(((hadirDays / workDays) * 100).toFixed(1));
      return {
        ...item,
        hadirDays,
        attendanceRate: rate
      };
    });

    // Urutkan: tingkat kehadiran paling rendah duluan
    allCalculated.sort((a, b) => {
      if (a.attendanceRate !== b.attendanceRate) {
        return a.attendanceRate - b.attendanceRate; // ascending (paling rendah di atas)
      }
      return b.totalLeaves - a.totalLeaves; // descending leaves
    });

    // Ambil top 10
    const top10 = allCalculated.slice(0, 10);
    const workersWithLeavesCount = allCalculated.filter(w => w.totalLeaves > 0).length;
    const totalAbsentDays = allCalculated.reduce((acc, cur) => acc + cur.totalLeaves, 0);

    return {
      top10,
      workersWithLeavesCount,
      totalAbsentDays,
      totalWorkers: pekerjaList.length
    };
  }, [pekerjaList, presensiList, selectedMonth, selectedYear]);

  // =========================================================================
  // LOGIKA REKAPITULASI DUA GRAFIK BALOK (BULANAN & TAHUNAN PORTAL PUBLIK)
  // =========================================================================
  const UNITS_LIST = ['Cengkeh', 'Blend', 'Tembakau', 'Krosok'];
  const MENIT_TERSEDIA_BULAN = 10440; // 26 hari kerja x 420 menit

  const effectivePresensi = useMemo(() => {
    return (presensiList && presensiList.length > 0)
      ? presensiList
      : INITIAL_PRESENSI_FALLBACK;
  }, [presensiList]);

  // Helper sorting list pekerja
  const sortWorkerList = (
    list: {
      id: string | number;
      nip: string;
      nama: string;
      unit: string;
      sekup: string;
      jabatan: string;
      totalIjin: number;
      totalKejadian: number;
      pctKehadiran: number;
    }[],
    sortBy: 'perhatian' | 'tertinggi' | 'nama'
  ) => {
    const copy = [...list];
    if (sortBy === 'perhatian') {
      return copy.sort((a, b) => a.pctKehadiran - b.pctKehadiran);
    }
    if (sortBy === 'tertinggi') {
      return copy.sort((a, b) => b.pctKehadiran - a.pctKehadiran);
    }
    if (sortBy === 'nama') {
      return copy.sort((a, b) => a.nama.localeCompare(b.nama));
    }
    return copy;
  };

  // 1. DATA REKAP BULANAN PEKERJA (UNTUK BULAN & TAHUN TERPILIH)
  const monthlyWorkersData = useMemo(() => {
    return pekerjaList.map(p => {
      const cleanName = p.nama.trim().toUpperCase();
      let totalIjinMenit = 0;
      let totalKejadian = 0;

      effectivePresensi.forEach(r => {
        if (!r.nama || r.nama.trim().toUpperCase() !== cleanName) return;
        const rIso = normalizeDateToIso(r.tanggalIso || r.tanggal);
        if (!rIso || !rIso.includes('-')) return;
        const [yStr, mStr] = rIso.split('-');
        const y = Number(yStr);
        const m = Number(mStr);

        if (m === selectedMonth && (y === selectedYear || (!yStr && selectedYear === 2026))) {
          const menit = getNormalizedPermitMinutes(
            r.tanggalIso || r.tanggal,
            r.jamAwal,
            r.jamAkhir,
            r.durasiMenit,
            r.jenisIjin
          );
          totalIjinMenit += menit;
          totalKejadian += 1;
        }
      });

      const totalTersedia = MENIT_TERSEDIA_BULAN;
      const pctKehadiran = totalTersedia > 0
        ? Math.max(0, Math.round((100 - (totalIjinMenit / totalTersedia * 100)) * 100) / 100)
        : 100;

      const rawId = p.id ?? '';
      const formattedNip = String(rawId).startsWith('BK-')
        ? String(rawId)
        : `BK-PP1-${String(rawId).padStart(3, '0')}`;

      return {
        id: p.id,
        nip: formattedNip,
        nama: p.nama,
        unit: p.unit,
        sekup: p.sekup,
        jabatan: p.jabatan || `${p.sekup || ''} ${p.unit || ''}`.trim() || 'Pekerja Operasional',
        totalIjin: totalIjinMenit,
        totalKejadian,
        pctKehadiran
      };
    });
  }, [pekerjaList, effectivePresensi, selectedMonth, selectedYear]);

  // Monthly Unit Workers (Grafik Balok 1 Bulanan: Khusus Unit / Sesuai Peran)
  const monthlyUnitWorkers = useMemo(() => {
    let list = monthlyWorkersData.filter(
      p => p.unit.toLowerCase() === selectedMonthlyUnit.toLowerCase()
    );
    if (monthlySearchUnit.trim()) {
      const q = monthlySearchUnit.trim().toLowerCase();
      list = list.filter(p =>
        p.nama.toLowerCase().includes(q) ||
        p.nip.toLowerCase().includes(q) ||
        p.sekup.toLowerCase().includes(q)
      );
    }
    return sortWorkerList(list, monthlySortUnit);
  }, [monthlyWorkersData, selectedMonthlyUnit, monthlySearchUnit, monthlySortUnit]);

  // Monthly All Workers (Grafik Balok 2 Bulanan: Seluruh 63 Pekerja)
  const monthlyAllWorkers = useMemo(() => {
    let list = monthlyWorkersData;
    if (monthlySearchAll.trim()) {
      const q = monthlySearchAll.trim().toLowerCase();
      list = list.filter(p =>
        p.nama.toLowerCase().includes(q) ||
        p.nip.toLowerCase().includes(q) ||
        p.unit.toLowerCase().includes(q) ||
        p.sekup.toLowerCase().includes(q)
      );
    }
    return sortWorkerList(list, monthlySortAll);
  }, [monthlyWorkersData, monthlySearchAll, monthlySortAll]);

  const monthlyUnitAvg = useMemo(() => {
    if (monthlyUnitWorkers.length === 0) return '100.00';
    const sum = monthlyUnitWorkers.reduce((acc, w) => acc + w.pctKehadiran, 0);
    return (sum / monthlyUnitWorkers.length).toFixed(2);
  }, [monthlyUnitWorkers]);

  const monthlyAllAvg = useMemo(() => {
    if (monthlyWorkersData.length === 0) return '100.00';
    const sum = monthlyWorkersData.reduce((acc, w) => acc + w.pctKehadiran, 0);
    return (sum / monthlyWorkersData.length).toFixed(2);
  }, [monthlyWorkersData]);

  // 2. DATA REKAP TAHUNAN PEKERJA (UNTUK TAHUN BERJALAN)
  const yearlyWorkersData = useMemo(() => {
    const jmlBulan = 12;
    const totalTersedia = MENIT_TERSEDIA_BULAN * jmlBulan;

    return pekerjaList.map(p => {
      const cleanName = p.nama.trim().toUpperCase();
      let totalIjinMenit = 0;
      let totalKejadian = 0;

      effectivePresensi.forEach(r => {
        if (!r.nama || r.nama.trim().toUpperCase() !== cleanName) return;
        const rIso = normalizeDateToIso(r.tanggalIso || r.tanggal);
        if (!rIso || !rIso.includes('-')) return;
        const [yStr] = rIso.split('-');
        const y = Number(yStr);

        if (y === yearlyYear || (!yStr && yearlyYear === 2026)) {
          const menit = getNormalizedPermitMinutes(
            r.tanggalIso || r.tanggal,
            r.jamAwal,
            r.jamAkhir,
            r.durasiMenit,
            r.jenisIjin
          );
          totalIjinMenit += menit;
          totalKejadian += 1;
        }
      });

      const pctKehadiran = totalTersedia > 0
        ? Math.max(0, Math.round((100 - (totalIjinMenit / totalTersedia * 100)) * 100) / 100)
        : 100;

      const rawId = p.id ?? '';
      const formattedNip = String(rawId).startsWith('BK-')
        ? String(rawId)
        : `BK-PP1-${String(rawId).padStart(3, '0')}`;

      return {
        id: p.id,
        nip: formattedNip,
        nama: p.nama,
        unit: p.unit,
        sekup: p.sekup,
        jabatan: p.jabatan || `${p.sekup || ''} ${p.unit || ''}`.trim() || 'Pekerja Operasional',
        totalIjin: totalIjinMenit,
        totalKejadian,
        pctKehadiran
      };
    });
  }, [pekerjaList, effectivePresensi, yearlyYear]);

  // Yearly Unit Workers (Grafik Balok 1 Tahunan: Khusus Unit / Sesuai Peran)
  const yearlyUnitWorkers = useMemo(() => {
    let list = yearlyWorkersData.filter(
      p => p.unit.toLowerCase() === selectedYearlyUnit.toLowerCase()
    );
    if (yearlySearchUnit.trim()) {
      const q = yearlySearchUnit.trim().toLowerCase();
      list = list.filter(p =>
        p.nama.toLowerCase().includes(q) ||
        p.nip.toLowerCase().includes(q) ||
        p.sekup.toLowerCase().includes(q)
      );
    }
    return sortWorkerList(list, yearlySortUnit);
  }, [yearlyWorkersData, selectedYearlyUnit, yearlySearchUnit, yearlySortUnit]);

  // Yearly All Workers (Grafik Balok 2 Tahunan: Seluruh 63 Pekerja)
  const yearlyAllWorkers = useMemo(() => {
    let list = yearlyWorkersData;
    if (yearlySearchAll.trim()) {
      const q = yearlySearchAll.trim().toLowerCase();
      list = list.filter(p =>
        p.nama.toLowerCase().includes(q) ||
        p.nip.toLowerCase().includes(q) ||
        p.unit.toLowerCase().includes(q) ||
        p.sekup.toLowerCase().includes(q)
      );
    }
    return sortWorkerList(list, yearlySortAll);
  }, [yearlyWorkersData, yearlySearchAll, yearlySortAll]);

  const yearlyUnitAvg = useMemo(() => {
    if (yearlyUnitWorkers.length === 0) return '100.00';
    const sum = yearlyUnitWorkers.reduce((acc, w) => acc + w.pctKehadiran, 0);
    return (sum / yearlyUnitWorkers.length).toFixed(2);
  }, [yearlyUnitWorkers]);

  const yearlyAllAvg = useMemo(() => {
    if (yearlyWorkersData.length === 0) return '100.00';
    const sum = yearlyWorkersData.reduce((acc, w) => acc + w.pctKehadiran, 0);
    return (sum / yearlyWorkersData.length).toFixed(2);
  }, [yearlyWorkersData]);

  // Yearly 4 Units Summary Cards
  const yearlyUnitStats = useMemo(() => {
    return UNITS_LIST.map(unitName => {
      const unitWorkers = pekerjaList.filter(p => p.unit.toLowerCase() === unitName.toLowerCase());
      const workerNames = new Set(unitWorkers.map(p => p.nama.trim().toUpperCase()));
      
      const yearLeaves = effectivePresensi.filter(r => {
        if (!r.tanggal || !r.nama) return false;
        if (!workerNames.has(r.nama.trim().toUpperCase())) return false;
        const rIso = normalizeDateToIso(r.tanggalIso || r.tanggal);
        if (!rIso || !rIso.includes('-')) return false;
        const [yStr] = rIso.split('-');
        const y = Number(yStr);
        return y === yearlyYear || (!yStr && yearlyYear === 2026);
      });

      const totalHeadcount = unitWorkers.length;
      const totalPossibleMandays = totalHeadcount * 26 * 12;
      const lostMandays = yearLeaves.length;
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
  }, [pekerjaList, effectivePresensi, yearlyYear]);

  // Helper render kartu baris grafik balok ranking (Bebas slider & ramah cetak/export PDF)
  const renderRankingBarList = (
    items: {
      id: string | number;
      nip: string;
      nama: string;
      unit: string;
      sekup: string;
      jabatan: string;
      totalIjin: number;
      totalKejadian: number;
      pctKehadiran: number;
    }[],
    emptyMessage: string = 'Tidak ada data pekerja yang cocok dengan kriteria.'
  ) => {
    if (items.length === 0) {
      return (
        <div className="p-8 text-center text-slate-400 text-xs bg-slate-950/40 rounded-2xl border border-slate-800">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="space-y-1.5 print:space-y-1 overflow-visible">
        {items.map((r, idx) => {
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
            ? 'bg-red-500/20 text-red-300 border-red-500/30'
            : isBlue
            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

          const badgeText = isRed
            ? 'Perlu Pembinaan'
            : isBlue
            ? 'Memenuhi Baku'
            : 'Sangat Baik';

          const lostHours = Math.round(r.totalIjin / 60);

          return (
            <div
              key={`${r.id}-${idx}`}
              className="bg-slate-900/90 py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-xl border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 print:bg-white print:border print:border-slate-300 print:text-slate-900 print:py-1 print:px-2.5 print:my-0.5 print:rounded-md print:shadow-none print:flex-row print:items-center break-inside-avoid"
              style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            >
              {/* Left: Rank Badge + Worker Identity */}
              <div className="flex items-center gap-2 sm:gap-2.5 sm:min-w-[180px] sm:max-w-[230px] print:min-w-[160px] print:max-w-[190px] print:gap-1.5">
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg ${rankBg} text-white font-black text-[10px] sm:text-[11px] flex items-center justify-center shrink-0 shadow-xs font-mono print:w-5 print:h-5 print:text-[9px] print:rounded`}
                  style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                >
                  #{idx + 1}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-[13px] text-white truncate print:text-slate-900 print:text-[10px] print:leading-tight" title={r.nama}>
                    {r.nama}
                  </div>
                  <div
                    className="text-[10px] sm:text-[11px] text-slate-400 truncate print:text-slate-600 print:text-[8px] print:leading-tight"
                    title={`${r.nip} • ${r.unit} (${r.sekup})`}
                  >
                    {r.nip} &bull; {r.unit} ({r.sekup})
                  </div>
                </div>
              </div>

              {/* Middle: Horizontal Progress Bar */}
              <div className="flex-1 sm:mx-2 print:mx-2">
                <div className="w-full bg-slate-950 h-2 sm:h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800 print:h-2 print:bg-slate-200 print:border print:border-slate-300">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${barGradient}`}
                    style={{
                      width: `${Math.min(100, Math.max(5, r.pctKehadiran))}%`,
                      WebkitPrintColorAdjust: 'exact',
                      printColorAdjust: 'exact'
                    }}
                  />
                </div>
              </div>

              {/* Right: Percentage, Lost Hours, and Status Tag Badge */}
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-0.5 sm:pt-0 border-t border-slate-800/60 sm:border-0 print:border-0 print:pt-0">
                <div className="text-left sm:text-right print:text-right">
                  <div className="font-mono font-bold text-xs sm:text-[13px] text-white print:text-slate-900 print:text-[10px]">
                    {r.pctKehadiran.toFixed(2).replace('.', ',')}%
                  </div>
                  <div className="text-[9.5px] sm:text-[10px] text-slate-400 print:text-slate-500 print:text-[8px]">
                    Izin: {lostHours}j ({r.totalIjin}m)
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[9.5px] font-bold border whitespace-nowrap print:px-1.5 print:py-0 print:text-[8px] ${badgeClass}`}
                  style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                >
                  {badgeText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

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

            {/* Input Izin Pekerja Langsung */}
            {onAddPresensi && (
              <button
                type="button"
                onClick={() => {
                  setShowInputModal(true);
                  setInputStatusMessage(null);
                  if (filteredWorkers.length > 0 && !inputNama) {
                    setInputNama(filteredWorkers[0].nama);
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                title="Input atau laporkan ketidakhadiran / izin pekerja hari ini"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Input Izin</span>
              </button>
            )}

            {/* Login Pekerja Internal */}
            {onSwitchToLogin && (
              <button
                onClick={onSwitchToLogin}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                title="Buka gerbang login khusus tim internal"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Login Pekerja</span>
              </button>
            )}

            {/* Exit Public Mode */}
            {onExitPublic && (
              <button
                onClick={onExitPublic}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
                title="Tutup mode portal publik"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            )}

          </div>

        </div>
      </header>

      {/* 2. HERO / PUBLIC BANNER */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Kop Resmi Dokumen Cetak / Export PDF (Hanya Muncul Saat Print) */}
        <div className="hidden print:block pb-3 mb-4 border-b-2 border-slate-800 text-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                PT Batu Karang — Divisi Produksi I
              </div>
              <h1 className="text-base font-black text-slate-900 tracking-tight">
                {activeTab === 'yearly'
                  ? `REKAPITULASI PRESENSI TAHUNAN — TAHUN ${yearlyYear}`
                  : activeTab === 'rekap'
                  ? `REKAPITULASI PRESENSI BULANAN — ${MONTH_NAMES[selectedMonth - 1]?.toUpperCase()} ${selectedYear}`
                  : activeTab === 'lowest'
                  ? `10 KEHADIRAN TERENDAH — ${MONTH_NAMES[selectedMonth - 1]?.toUpperCase()} ${selectedYear}`
                  : 'LAPORAN REKAPITULASI PRESENSI HARIAN'}
              </h1>
              <p className="text-[10px] text-slate-600 mt-0.5">
                Portal Publik Sistem HR &bull; Total {pekerjaList.length} Pekerja Harian &bull; Dicetak: {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-slate-100 border border-slate-300 rounded text-[9px] font-bold text-slate-800">
                Dokumen Resmi HR
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/60 p-5 sm:p-6 rounded-3xl border border-blue-900/40 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                Informasi Terbuka Divisi Produksi I (Read-Only)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Monitoring Kehadiran &amp; Status Operasional 4 Lini
            </h1>
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
          <div className="inline-flex p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-semibold gap-1 flex-wrap">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
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
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'rekap'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Rekapitulasi Presensi Bulanan</span>
            </button>

            <button
              onClick={() => setActiveTab('yearly')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'yearly'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Rekapitulasi Presensi Tahunan</span>
            </button>

            <button
              onClick={() => setActiveTab('capacity')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'capacity'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Kapasitas Tim per Unit</span>
            </button>

            <button
              onClick={() => setActiveTab('lowest')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'lowest'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>10 Kehadiran Terendah</span>
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
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              
              <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-900/60 bg-emerald-950/20 shadow-xs">
                <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <span>Hadir Kerja</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  {dailyStats.hadir} <span className="text-xs font-normal text-emerald-500/80">/ {dailyStats.total}</span>
                </div>
                <div className="text-[11px] text-emerald-300 mt-1 font-medium">
                  {dailyStats.persenHadir}% Terpenuhi
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-amber-900/60 bg-amber-950/20 shadow-xs">
                <div className="flex items-center justify-between text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <span>Izin Resmi</span>
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  {dailyStats.ijin} <span className="text-xs font-normal text-amber-500/80">Orang</span>
                </div>
                <div className="text-[11px] text-amber-300 mt-1">
                  Terdaftar dengan surat
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

              <div className="bg-slate-950 p-4 rounded-2xl border border-purple-900/60 bg-purple-950/20 shadow-xs">
                <div className="flex items-center justify-between text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <span>Alpa / Lainnya</span>
                  <FileText className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">
                  {dailyStats.alpa} <span className="text-xs font-normal text-purple-500/80">Orang</span>
                </div>
                <div className="text-[11px] text-purple-300 mt-1">
                  Tanpa keterangan
                </div>
              </div>

            </div>

            {/* ITEM 1: Panel Khusus Pekerja yang Sedang Tidak Hadir / Izin / Sakit */}
            {filteredDateLeaves.length > 0 ? (
              <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-amber-500/40 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-amber-200">
                        Daftar Pekerja Tidak Hadir (Izin / Sakit) pada {formattedIndonesianDate}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Data verifikasi pengecualian ketidakhadiran divisi produksi
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 font-mono">
                    {filteredDateLeaves.length} Pekerja
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {filteredDateLeaves.map((item, idx) => {
                    const isSakit = (item.jenisIjin || '').toLowerCase().includes('sakit');
                    const isAlpa = (item.jenisIjin || '').toLowerCase().includes('alpa') || (item.jenisIjin || '').toLowerCase().includes('alpha');

                    return (
                      <div 
                        key={`${item.nama}-${idx}`}
                        className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2 shadow-xs hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white text-sm truncate">{item.nama}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${
                            isSakit
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : isAlpa
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                            {item.jenisIjin}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                            Unit {item.unit || 'Produksi'}
                          </span>
                          {item.jamAwal && item.jamAkhir && (
                            <span className="font-mono text-slate-300 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {item.jamAwal} - {item.jamAkhir}
                            </span>
                          )}
                        </div>

                        {item.keperluan && (
                          <p className="text-[11px] text-slate-300 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800/50">
                            "{item.keperluan}"
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Status jika seluruh pekerja hadir 100% tanpa ada izin/sakit */
              <div className="bg-slate-950 p-6 rounded-2xl border border-emerald-500/30 text-center space-y-2 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-emerald-300">
                  Seluruh Tenaga Kerja Hadir Lengkap (100%)
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Tidak ada catatan pekerja yang izin, sakit, atau mangkir pada tanggal <strong className="text-white">{formattedIndonesianDate}</strong>. Semua {filteredWorkers.length} pekerja hadir bertugas sesuai jadwal normal.
                </p>
              </div>
            )}

            {/* ITEM 1: Accordion Toggle untuk Sembunyikan/Tampilkan Tabel 63 Pekerja */}
            <div className="flex flex-col items-center pt-2">
              <button
                type="button"
                onClick={() => setShowAllWorkersTable(prev => !prev)}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>{showAllWorkersTable ? 'Sembunyikan' : 'Tampilkan'} Semua Pekerja Hadir ({filteredWorkers.length} Orang)</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showAllWorkersTable ? 'rotate-180' : ''}`} />
              </button>
              <span className="text-[10px] text-slate-500 mt-1">
                {showAllWorkersTable ? 'Klik untuk menciutkan tabel agar hemat ruang' : 'Default disembunyikan untuk menghemat space tampilan'}
              </span>
            </div>

            {/* Tabel Detail 63 Pekerja: Hanya Muncul Jika Toggle Ditekan */}
            {showAllWorkersTable && (
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span>Daftar Lengkap Presensi Tenaga Kerja ({filteredWorkers.length} Pekerja)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Menampilkan status seluruh pekerja pada tanggal {formattedIndonesianDate}
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
            )}

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: REKAPITULASI PRESENSI BULANAN                          */}
        {/* ------------------------------------------------------------- */}
        {/* ------------------------------------------------------------- */}
        {/* TAB 2: REKAPITULASI PRESENSI BULANAN (DENGAN 2 GRAFIK BALOK)  */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'rekap' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            
            {/* Filter Bulan & Kontrol Cetak */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white">Periode Rekapitulasi Presensi Bulanan:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
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

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs print:hidden"
                  title="Cetak seluruh rekapitulasi bulanan atau simpan ke PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cetak / Export PDF</span>
                </button>
              </div>
            </div>

            {/* Performance per Unit Cards (Bulanan) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {monthlyUnitStats.map((item) => (
                <div 
                  key={item.unit}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-xs print:bg-white print:border-slate-300 print:text-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white print:text-slate-900">Unit {item.unit}</span>
                    <span className="text-xs font-mono font-bold text-blue-400 print:text-blue-700">
                      {item.headcount} Pekerja
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 print:text-slate-600">Tingkat Kehadiran:</span>
                      <strong className={`font-mono ${item.attendanceRate >= 95 ? 'text-emerald-400 print:text-emerald-700' : 'text-amber-400 print:text-amber-700'}`}>
                        {item.attendanceRate}%
                      </strong>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800 print:bg-slate-200 print:border-slate-300">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          item.attendanceRate >= 95 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${item.attendanceRate}%`, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 print:text-slate-600 border-t border-slate-800 print:border-slate-200 pt-2 flex justify-between">
                    <span>Total Izin/Sakit:</span>
                    <strong className="text-slate-200 print:text-slate-800 font-mono">{item.totalLeaves} Kejadian</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* BAGIAN DUA GRAFIK BALOK REKAP BULANAN */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Grafik Balok Peringkat Kehadiran Bulanan ({MONTH_NAMES[selectedMonth - 1]} {selectedYear})
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Grafik 1 khusus unit kerja peran Anda vs Grafik 2 komparasi seluruh 63 pekerja divisi
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 print:hidden">
                  {/* Layout Mode Toggle */}
                  <div className="inline-flex p-0.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setLayoutMode('grid')}
                      className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        layoutMode === 'grid'
                          ? 'bg-blue-600 text-white shadow-xs font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Tampilan 2 Kolom Bersandingan"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">2 Kolom</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLayoutMode('stack')}
                      className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        layoutMode === 'stack'
                          ? 'bg-blue-600 text-white shadow-xs font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Tampilan Bertingkat (1 Kolom Penuh)"
                    >
                      <List className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">1 Kolom</span>
                    </button>
                  </div>

                  {/* Print Button */}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    title="Cetak seluruh grafik balok bulanan atau simpan ke PDF"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cetak / Export PDF</span>
                  </button>
                </div>
              </div>

              {/* Grid 2 Kolom / Stacked */}
              <div className={layoutMode === 'grid' ? 'grid grid-cols-1 xl:grid-cols-2 gap-5' : 'space-y-5'}>
                
                {/* GRAFIK BALOK 1: KHUSUS UNIT / SESUAI PERAN */}
                <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3.5 shadow-xs print:bg-white print:border-slate-300 print:p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3 print:border-slate-300">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 print:bg-blue-100 print:text-blue-800">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-white print:text-slate-900">
                            Grafik Peringkat Unit {selectedMonthlyUnit}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 print:bg-blue-50 print:text-blue-800">
                            {currentUser?.role?.includes(selectedMonthlyUnit) ? 'Peran Anda' : 'Unit Terpilih'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 print:text-slate-600">
                          {monthlyUnitWorkers.length} Pekerja &bull; Rerata Unit: <strong className="text-white print:text-slate-900 font-mono">{monthlyUnitAvg}%</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 print:hidden">
                      {/* Unit Switcher */}
                      <select
                        value={selectedMonthlyUnit}
                        onChange={(e) => setSelectedMonthlyUnit(e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-lg text-xs font-bold focus:outline-none focus:border-blue-500"
                      >
                        {UNITS_LIST.map(u => (
                          <option key={u} value={u}>Unit {u}</option>
                        ))}
                      </select>

                      {/* Search */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Cari..."
                          value={monthlySearchUnit}
                          onChange={(e) => setMonthlySearchUnit(e.target.value)}
                          className="pl-8 pr-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-lg text-xs w-28 sm:w-32 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Sort */}
                      <select
                        value={monthlySortUnit}
                        onChange={(e) => setMonthlySortUnit(e.target.value as any)}
                        className="px-2 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                      >
                        <option value="perhatian">⇅ Perhatian (Merah → Hijau)</option>
                        <option value="tertinggi">⇅ Tertinggi (Hijau → Merah)</option>
                        <option value="nama">🔤 Nama A - Z</option>
                      </select>
                    </div>
                  </div>

                  {/* Legend & Total */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-semibold text-slate-400 pt-0.5 print:text-slate-600">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-red-400 print:text-red-600">
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></span> &lt;95%
                      </span>
                      <span className="flex items-center gap-1 text-blue-400 print:text-blue-600">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></span> 95-97.9%
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400 print:text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></span> &ge;98%
                      </span>
                    </div>
                    <span className="text-slate-400 print:text-slate-600">
                      Total {monthlyUnitWorkers.length} Pekerja (Tanpa Slider)
                    </span>
                  </div>

                  {/* List Balok Ranking - Bebas Slider */}
                  {renderRankingBarList(
                    monthlyUnitWorkers,
                    `Tidak ada pekerja di Unit ${selectedMonthlyUnit} yang sesuai filter.`
                  )}
                </div>

                {/* GRAFIK BALOK 2: SELURUH PEKERJA DIVISI (63 PEKERJA) */}
                <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3.5 shadow-xs print:bg-white print:border-slate-300 print:p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3 print:border-slate-300">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 print:bg-indigo-100 print:text-indigo-800">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-white print:text-slate-900">
                            Grafik Peringkat Seluruh Pekerja
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 print:bg-indigo-50 print:text-indigo-800">
                            Lintas 4 Lini
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 print:text-slate-600">
                          Total {monthlyAllWorkers.length} Pekerja &bull; Rerata Divisi: <strong className="text-white print:text-slate-900 font-mono">{monthlyAllAvg}%</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 print:hidden">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Cari nama / unit..."
                          value={monthlySearchAll}
                          onChange={(e) => setMonthlySearchAll(e.target.value)}
                          className="pl-8 pr-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-lg text-xs w-32 sm:w-40 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <select
                        value={monthlySortAll}
                        onChange={(e) => setMonthlySortAll(e.target.value as any)}
                        className="px-2 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                      >
                        <option value="perhatian">⇅ Perhatian (Merah → Hijau)</option>
                        <option value="tertinggi">⇅ Tertinggi (Hijau → Merah)</option>
                        <option value="nama">🔤 Nama A - Z</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-semibold text-slate-400 pt-0.5 print:text-slate-600">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-red-400 print:text-red-600">
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></span> &lt;95%
                      </span>
                      <span className="flex items-center gap-1 text-blue-400 print:text-blue-600">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></span> 95-97.9%
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400 print:text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></span> &ge;98%
                      </span>
                    </div>
                    <span className="text-slate-400 print:text-slate-600">
                      {monthlyAllWorkers.length} Pekerja Ditampilkan Penuh (Tanpa Slider)
                    </span>
                  </div>

                  {renderRankingBarList(
                    monthlyAllWorkers,
                    'Tidak ada pekerja yang cocok dengan filter.'
                  )}
                </div>

              </div>
            </div>

            {/* Guidance Box for External Viewers */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 flex items-start gap-3 print:hidden">
              <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 leading-relaxed">
                <span className="font-bold text-white block">Standar Perhitungan Tingkat Kehadiran Bulanan</span>
                <p>
                  Persentase dihitung berdasarkan rasio jam hadir kerja terhadap standar jam kerja efektif bulanan per pekerja (26 hari x 420 menit). Nilai di atas 95% menunjukkan tingkat disiplin operasional yang sangat baik sesuai standar industri pengolahan tembakau &amp; cengkeh PT Batu Karang.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: REKAPITULASI PRESENSI TAHUNAN (TAHUN BERJALAN) - BARU  */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'yearly' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            
            {/* Filter Tahun Rekapitulasi */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-xs font-bold text-white block">
                    Periode Rekapitulasi Presensi Tahunan (Tahun Berjalan):
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Akumulasi jam kerja dan riwayat izin kumulatif dari Januari s/d Desember {yearlyYear}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={yearlyYear}
                  onChange={(e) => setYearlyYear(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value={2026}>Tahun 2026 (Tahun Berjalan)</option>
                  <option value={2025}>Tahun 2025</option>
                </select>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs print:hidden"
                  title="Cetak seluruh rekapitulasi tahunan atau simpan ke PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cetak / Export PDF</span>
                </button>
              </div>
            </div>

            {/* Performance per Unit Cards (Tahunan) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {yearlyUnitStats.map((item) => (
                <div 
                  key={item.unit}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-xs print:bg-white print:border-slate-300 print:text-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white print:text-slate-900">Unit {item.unit}</span>
                    <span className="text-xs font-mono font-bold text-blue-400 print:text-blue-700">
                      {item.headcount} Pekerja
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 print:text-slate-600">Rerata Tahunan:</span>
                      <strong className={`font-mono ${item.attendanceRate >= 95 ? 'text-emerald-400 print:text-emerald-700' : 'text-amber-400 print:text-amber-700'}`}>
                        {item.attendanceRate}%
                      </strong>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800 print:bg-slate-200 print:border-slate-300">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          item.attendanceRate >= 95 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${item.attendanceRate}%`, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 print:text-slate-600 border-t border-slate-800 print:border-slate-200 pt-2 flex justify-between">
                    <span>Total Izin/Sakit:</span>
                    <strong className="text-slate-200 print:text-slate-800 font-mono">{item.totalLeaves} Kejadian</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* BAGIAN DUA GRAFIK BALOK REKAP TAHUNAN */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Grafik Balok Evaluasi Peringkat Kehadiran Tahunan (Tahun {yearlyYear})
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Grafik 1 khusus unit kerja peran Anda vs Grafik 2 komparasi kumulatif seluruh 63 pekerja divisi
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 print:hidden">
                  {/* Layout Mode Toggle */}
                  <div className="inline-flex p-0.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setLayoutMode('grid')}
                      className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        layoutMode === 'grid'
                          ? 'bg-blue-600 text-white shadow-xs font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Tampilan 2 Kolom Bersandingan"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">2 Kolom</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLayoutMode('stack')}
                      className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        layoutMode === 'stack'
                          ? 'bg-blue-600 text-white shadow-xs font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Tampilan Bertingkat (1 Kolom Penuh)"
                    >
                      <List className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">1 Kolom</span>
                    </button>
                  </div>

                  {/* Print Button */}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    title="Cetak seluruh grafik balok tahunan atau simpan ke PDF"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cetak / Export PDF</span>
                  </button>
                </div>
              </div>

              {/* Grid 2 Kolom / Stacked Tahunan */}
              <div className={layoutMode === 'grid' ? 'grid grid-cols-1 xl:grid-cols-2 gap-5' : 'space-y-5'}>
                
                {/* GRAFIK BALOK 1 TAHUNAN: KHUSUS UNIT / SESUAI PERAN */}
                <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3.5 shadow-xs print:bg-white print:border-slate-300 print:p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3 print:border-slate-300">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 print:bg-emerald-100 print:text-emerald-800">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-white print:text-slate-900">
                            Grafik Peringkat Tahunan Unit {selectedYearlyUnit}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 print:bg-emerald-50 print:text-emerald-800">
                            {currentUser?.role?.includes(selectedYearlyUnit) ? 'Peran Anda' : 'Unit Terpilih'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 print:text-slate-600">
                          {yearlyUnitWorkers.length} Pekerja &bull; Rerata Tahunan: <strong className="text-white print:text-slate-900 font-mono">{yearlyUnitAvg}%</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 print:hidden">
                      <select
                        value={selectedYearlyUnit}
                        onChange={(e) => setSelectedYearlyUnit(e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-lg text-xs font-bold focus:outline-none focus:border-blue-500"
                      >
                        {UNITS_LIST.map(u => (
                          <option key={u} value={u}>Unit {u}</option>
                        ))}
                      </select>

                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Cari..."
                          value={yearlySearchUnit}
                          onChange={(e) => setYearlySearchUnit(e.target.value)}
                          className="pl-8 pr-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-lg text-xs w-28 sm:w-32 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <select
                        value={yearlySortUnit}
                        onChange={(e) => setYearlySortUnit(e.target.value as any)}
                        className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                      >
                        <option value="perhatian">⇅ Perhatian (Merah → Hijau)</option>
                        <option value="tertinggi">⇅ Tertinggi (Hijau → Merah)</option>
                        <option value="nama">🔤 Nama A - Z</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-semibold text-slate-400 pt-0.5 print:text-slate-600">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-red-400 print:text-red-600">
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></span> &lt;95%
                      </span>
                      <span className="flex items-center gap-1 text-blue-400 print:text-blue-600">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></span> 95-97.9%
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400 print:text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></span> &ge;98%
                      </span>
                    </div>
                    <span className="text-slate-400 print:text-slate-600">
                      Total {yearlyUnitWorkers.length} Pekerja (Tanpa Slider)
                    </span>
                  </div>

                  {renderRankingBarList(
                    yearlyUnitWorkers,
                    `Tidak ada pekerja di Unit ${selectedYearlyUnit} yang sesuai filter.`
                  )}
                </div>

                {/* GRAFIK BALOK 2 TAHUNAN: SELURUH PEKERJA DIVISI (63 PEKERJA) */}
                <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3.5 shadow-xs print:bg-white print:border-slate-300 print:p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3 print:border-slate-300">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 print:bg-cyan-100 print:text-cyan-800">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-white print:text-slate-900">
                            Grafik Peringkat Tahunan Seluruh Pekerja
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 print:bg-cyan-50 print:text-cyan-800">
                            Lintas 4 Lini
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 print:text-slate-600">
                          Total {yearlyAllWorkers.length} Pekerja &bull; Rerata Divisi: <strong className="text-white print:text-slate-900 font-mono">{yearlyAllAvg}%</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 print:hidden">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Cari nama / unit..."
                          value={yearlySearchAll}
                          onChange={(e) => setYearlySearchAll(e.target.value)}
                          className="pl-8 pr-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-lg text-xs w-32 sm:w-40 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <select
                        value={yearlySortAll}
                        onChange={(e) => setYearlySortAll(e.target.value as any)}
                        className="px-2 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                      >
                        <option value="perhatian">⇅ Perhatian (Merah → Hijau)</option>
                        <option value="tertinggi">⇅ Tertinggi (Hijau → Merah)</option>
                        <option value="nama">🔤 Nama A - Z</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-semibold text-slate-400 pt-0.5 print:text-slate-600">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-red-400 print:text-red-600">
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></span> &lt;95%
                      </span>
                      <span className="flex items-center gap-1 text-blue-400 print:text-blue-600">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></span> 95-97.9%
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400 print:text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></span> &ge;98%
                      </span>
                    </div>
                    <span className="text-slate-400 print:text-slate-600">
                      Total {yearlyAllWorkers.length} Pekerja Ditampilkan Penuh (Tanpa Slider)
                    </span>
                  </div>

                  {renderRankingBarList(
                    yearlyAllWorkers,
                    'Tidak ada pekerja yang cocok dengan filter.'
                  )}
                </div>

              </div>
            </div>

            {/* Guidance Box Tahunan */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 flex items-start gap-3 print:hidden">
              <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 leading-relaxed">
                <span className="font-bold text-white block">Standar Evaluasi Kehadiran Tahunan</span>
                <p>
                  Evaluasi tahunan dihitung secara kumulatif atas total jam kerja resmi tahun berjalan. Standar operasional PT Batu Karang menetapkan batas kehadiran minimal 95% per pekerja. Nilai di bawah 95% ditandai dengan warna merah untuk mempermudah pembinaan ketenagakerjaan dan penilaian perpanjangan kontrak PKWT.
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
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <h3 className="font-bold text-white text-sm">Unit Proses Cengkeh</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Operasional Aktif
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pekerjaan perajangan cengkeh, pengayakan cengkeh rajangan, dan penimbangan akurat sesuai spesifikasi blend.
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
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <h3 className="font-bold text-white text-sm">Unit Proses Blend</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Operasional Aktif
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pencampuran tembakau dan cengkeh rajangan (blending) serta proses casing dan flavor sesuai formula racikan PP1.
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

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: 10 PEKERJA DENGAN KEHADIRAN TERENDAH (GRAFIK) (ITEM 2) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'lowest' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            
            {/* Filter Periode Bulan & Tahun */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    Peringkat 10 Pekerja dengan Tingkat Kehadiran Terendah
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Data dianalisis dari riwayat izin, sakit, dan ketidakhadiran resmi
                  </p>
                </div>
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

            {/* Quick KPI Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Pekerja Memiliki Izin / Sakit
                </span>
                <div className="text-2xl font-black text-rose-400 font-mono">
                  {lowestAttendanceStats.workersWithLeavesCount} <span className="text-xs font-normal text-slate-400">/ {lowestAttendanceStats.totalWorkers} Orang</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {lowestAttendanceStats.workersWithLeavesCount === 0 
                    ? '100% pekerja hadir penuh' 
                    : `${((lowestAttendanceStats.workersWithLeavesCount / (lowestAttendanceStats.totalWorkers || 1)) * 100).toFixed(1)}% dari total tenaga kerja`}
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Total Hari Ketidakhadiran
                </span>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  {lowestAttendanceStats.totalAbsentDays} <span className="text-xs font-normal text-slate-400">Hari Kerja</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Akumulasi izin, sakit, dan mangkir pada periode ini
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Standar Hari Kerja Bulanan
                </span>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  26 <span className="text-xs font-normal text-slate-400">Hari / Pekerja</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Basis kalkulasi rasio kehadiran resmi PP1
                </p>
              </div>
            </div>

            {/* GRAFIK BATANG HORIZONTAL 10 KEHADIRAN TERENDAH */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-rose-400" />
                  <h4 className="font-bold text-sm text-white">
                    Grafik Peringkat Kehadiran Terendah — Periode {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">
                  Diurutkan dari persentase kehadiran terendah
                </span>
              </div>

              {lowestAttendanceStats.workersWithLeavesCount === 0 ? (
                /* Jika tidak ada ketidakhadiran sama sekali */
                <div className="p-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                    <Award className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-white text-sm">
                    Tingkat Kehadiran 100% Sempurna!
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Pada bulan {MONTH_NAMES[selectedMonth - 1]} {selectedYear}, tidak ada satu pun tenaga kerja yang tercatat izin, sakit, maupun mangkir.
                  </p>
                </div>
              ) : (
                /* Daftar Grafik Batang 10 Pekerja */
                <div className="space-y-3.5 pt-1">
                  {lowestAttendanceStats.top10.map((item, idx) => {
                    const rank = idx + 1;
                    const isRank1 = rank === 1;
                    const isRank2 = rank === 2;
                    const isRank3 = rank === 3;

                    // Tentukan warna progress bar berdasarkan persentase kehadiran
                    let barColor = 'bg-rose-500';
                    let textColor = 'text-rose-400';
                    let badgeBg = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                    let statusLabel = 'Perhatian Khusus';

                    if (item.attendanceRate >= 92) {
                      barColor = 'bg-blue-500';
                      textColor = 'text-blue-400';
                      badgeBg = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
                      statusLabel = 'Izin Wajar';
                    } else if (item.attendanceRate >= 85) {
                      barColor = 'bg-amber-500';
                      textColor = 'text-amber-400';
                      badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                      statusLabel = 'Tingkat Izin Sedang';
                    }

                    return (
                      <div 
                        key={item.worker.id}
                        className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-2.5 hover:border-slate-700 transition-all"
                      >
                        {/* Baris Atas: Peringkat, Nama, Unit, Persentase */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            {/* Peringkat Badge */}
                            <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center font-mono ${
                              isRank1 
                                ? 'bg-red-500 text-white shadow-xs shadow-red-500/30' 
                                : isRank2
                                ? 'bg-amber-500 text-slate-950 font-bold'
                                : isRank3
                                ? 'bg-yellow-500 text-slate-950 font-bold'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              #{rank}
                            </span>

                            {/* Nama Pekerja */}
                            <span className="font-bold text-sm text-white">
                              {item.worker.nama}
                            </span>

                            {/* Unit Tag */}
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                              Unit {item.worker.unit} {item.worker.sekup ? `(${item.worker.sekup})` : ''}
                            </span>
                          </div>

                          {/* Persentase Kehadiran & Status Pill */}
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeBg}`}>
                              {statusLabel}
                            </span>
                            <span className={`text-base font-black font-mono ${textColor}`}>
                              {item.attendanceRate}%
                            </span>
                          </div>
                        </div>

                        {/* Grafik Batang Horisontal (Progress Bar) */}
                        <div className="space-y-1">
                          <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800/80 p-0.5">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                              style={{ width: `${Math.max(8, item.attendanceRate)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono px-0.5">
                            <span>0%</span>
                            <span>Hadir {item.hadirDays} dari 26 hari</span>
                            <span>100% Target</span>
                          </div>
                        </div>

                        {/* Rincian Alasan Izin / Sakit / Alpa */}
                        <div className="flex flex-wrap items-center justify-between text-[11px] pt-1.5 border-t border-slate-800/60 gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-slate-400 font-medium">Rincian:</span>
                            {item.sakit > 0 && (
                              <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                                Sakit: {item.sakit} Hari
                              </span>
                            )}
                            {item.ijin > 0 && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                                Izin: {item.ijin} Hari
                              </span>
                            )}
                            {item.alpa > 0 && (
                              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold">
                                Alpa: {item.alpa} Hari
                              </span>
                            )}
                            {item.totalMenit > 0 && (
                              <span className="text-slate-400 font-mono text-[10px]">
                                ({item.totalMenit} menit)
                              </span>
                            )}
                          </div>

                          <div className="text-slate-400 font-medium text-[11px]">
                            Total Tidak Hadir: <strong className="text-white font-mono">{item.totalLeaves} Hari</strong>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

              {/* Catatan Analitik Bawah */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  Pekerja yang memiliki persentase kehadiran di bawah 85% dievaluasi oleh Foreman/Mandor Unit terkait untuk peninjauan disiplin kerja, kompensasi shift cadangan, dan pertimbangan perpanjangan kontrak PKWT.
                </p>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* 4. PUBLIC FOOTER - Dilengkapi Ikon Kunci Login seperti Gambar 3 (Item 3) */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 px-4 py-4 text-xs text-slate-500 text-center print:hidden">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          
          {/* Copyright & Ikon Kunci Login Sesuai Referensi Gambar 3 */}
          <div className="flex items-center gap-1.5 justify-center sm:justify-start flex-wrap">
            <span>&copy; 2026 Monitoring HR Pekerja PP1 &bull; Divisi Produksi I &bull; PT Batu Karang</span>
            {onSwitchToLogin && (
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-slate-500 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center ml-0.5 group"
                title="Login Pengguna Berwenang (Staf / Mandor / Admin)"
                aria-label="Login Pengguna Berwenang"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 justify-center sm:justify-end">
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

      {/* 5. MODAL INPUT IZIN PEKERJA LANGSUNG DARI PORTAL PUBLIK */}
      {showInputModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Input Izin / Ketidakhadiran Pekerja</h3>
                  <p className="text-[11px] text-slate-400">Tercatat langsung ke sistem dan database Google Sheets</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowInputModal(false);
                  setInputStatusMessage(null);
                }}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleAddIjinSubmit} className="p-5 space-y-4 text-xs">
              
              {inputStatusMessage && (
                <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  inputStatusMessage.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                    : 'bg-red-950/60 border-red-800/80 text-red-300'
                }`}>
                  {inputStatusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{inputStatusMessage.text}</span>
                </div>
              )}

              {/* Pilih Pekerja */}
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Pilih Nama Pekerja (Total {pekerjaList.length} Orang)</label>
                <select
                  value={inputNama}
                  onChange={(e) => setInputNama(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white font-medium focus:outline-none focus:border-blue-500"
                  required
                >
                  {pekerjaList.map((p) => (
                    <option key={p.id} value={p.nama} className="bg-slate-900 text-white">
                      {p.nama} — ({p.unit} &bull; {p.sekup})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tanggal & Jenis Ijin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">Tanggal Izin</label>
                  <input
                    type="date"
                    value={inputTanggal}
                    onChange={(e) => handleInputTanggalChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white font-medium focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">Jenis Izin</label>
                  <select
                    value={inputJenisIjin}
                    onChange={(e) => setInputJenisIjin(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white font-medium focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="Ijin Terlambat" className="bg-slate-900">Ijin Terlambat</option>
                    <option value="Ijin Pulang Awal" className="bg-slate-900">Ijin Pulang Awal</option>
                    <option value="Ijin Keluar Sementara" className="bg-slate-900">Ijin Keluar Sementara</option>
                    <option value="Sakit (S Dokter)" className="bg-slate-900">Sakit (S Dokter)</option>
                    <option value="Sakit (S Tangan)" className="bg-slate-900">Sakit (S Tangan)</option>
                    <option value="Ijin (S Tangan)" className="bg-slate-900">Ijin (S Tangan)</option>
                    <option value="Ijin Normatif" className="bg-slate-900">Ijin Normatif</option>
                    <option value="Alpha" className="bg-slate-900">Alpha</option>
                  </select>
                </div>
              </div>

              {/* Jam Kerja / Sehari Penuh */}
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-300">Waktu Ijin / Ketidakhadiran</span>
                    <p className="text-[11px] text-slate-500">Rentang jam mulai dan selesai ijin</p>
                  </div>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inputSehariPenuh}
                      onChange={(e) => handleToggleSehariPenuh(e.target.checked)}
                      className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-xs text-blue-400 font-semibold select-none">Sehari Penuh</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Waktu Awal
                    </label>
                    <input
                      type="time"
                      value={inputJamAwal}
                      onChange={(e) => setInputJamAwal(e.target.value)}
                      disabled={inputSehariPenuh}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white font-medium disabled:opacity-50"
                      required
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">Waktu awal ijin</span>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Waktu Akhir
                    </label>
                    <input
                      type="time"
                      value={inputJamAkhir}
                      onChange={(e) => setInputJamAkhir(e.target.value)}
                      disabled={inputSehariPenuh}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white font-medium disabled:opacity-50"
                      required
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">Waktu selesai ijin</span>
                  </div>
                </div>
              </div>

              {/* Alasan / Keperluan */}
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Alasan / Keperluan</label>
                <input
                  type="text"
                  value={inputKeperluan}
                  onChange={(e) => setInputKeperluan(e.target.value)}
                  placeholder="Contoh: Mengurus SIM di Polres, Keperluan Keluarga, Sakit Demam"
                  className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white font-medium focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                  required
                />
              </div>

              {/* Identitas Pelapor */}
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Dicatat / Dilaporkan Oleh</label>
                <input
                  type="text"
                  value={inputPelapor}
                  onChange={(e) => setInputPelapor(e.target.value)}
                  placeholder="Nama Mandor / Petugas Lapangan"
                  className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white font-medium focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInputModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingIjin}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-blue-900/30 transition-all disabled:opacity-50"
                >
                  {isSubmittingIjin ? (
                    <>
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan &amp; Sinkronkan</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
