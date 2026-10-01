import React from 'react';
import { 
  Users, 
  ShieldCheck, 
  CalendarCheck, 
  BadgePercent, 
  MapPin, 
  Award, 
  Clock, 
  ArrowUpRight, 
  TrendingUp, 
  Plus, 
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import { 
  PekerjaPHL, 
  StaffPP1, 
  PresensiPHLRecord, 
  OutputBoronganRecord, 
  PresensiStaffRecord, 
  KpiScoring, 
  PengajuanLembur 
} from '../../types';
import { PABRIK_GEOFENCE } from '../../data/initialData';
import { ActiveTab } from '../layout/Sidebar';

interface OverviewDashboardProps {
  pekerjaPHL: PekerjaPHL[];
  staff: StaffPP1[];
  presensiPHL: PresensiPHLRecord[];
  outputBorongan: OutputBoronganRecord[];
  presensiStaff: PresensiStaffRecord[];
  kpi: KpiScoring[];
  lembur: PengajuanLembur[];
  onNavigate: (tab: any) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  pekerjaPHL,
  staff,
  presensiPHL,
  outputBorongan,
  presensiStaff,
  kpi,
  lembur,
  onNavigate
}) => {
  const activePHLCount = pekerjaPHL.filter(p => p.statusAktif).length;
  const staffCount = staff.length;
  
  // Kehadiran PHL Hari Ini
  const todayPHL = presensiPHL.filter(p => p.status === 'Hadir').length;
  const phlAttendanceRate = activePHLCount > 0 ? Math.round((todayPHL / activePHLCount) * 100) : 0;

  // Akumulasi Upah Borongan
  const totalUpahBorongan = outputBorongan.reduce((acc, curr) => acc + curr.totalUpah, 0);

  // Rata-rata Skor KPI
  const avgKpi = kpi.length > 0
    ? (kpi.reduce((acc, curr) => acc + curr.skorAkhir, 0) / kpi.length).toFixed(1)
    : '0';

  // Lembur Menunggu Persetujuan
  const pendingLembur = lembur.filter(l => l.status === 'Menunggu Persetujuan').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner Alert / Status */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-700/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold tracking-wider text-emerald-300 uppercase">
              Operasional Lini Shift Aktif
            </span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            PT Batu Karang — Divisi Produksi 1 (PP1)
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Sistem terintegrasi HR Pekerja Harian Lepas (PHL) 4 lini komoditas dan HR Staff Struktural dengan validasi Geofence 150 meter dari sentral pabrik.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('phl-attendance')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm"
          >
            <CalendarCheck className="w-4 h-4" />
            Presensi Mandor
          </button>
          <button
            onClick={() => onNavigate('staff-gps')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm"
          >
            <MapPin className="w-4 h-4" />
            Clock-In GPS
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: PHL Aktif */}
        <div 
          onClick={() => onNavigate('phl-master')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pekerja PHL</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {activePHLCount} <span className="text-xs font-normal text-slate-400">Orang</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {todayPHL} Hadir Hari Ini
            </span>
            <span className="text-slate-400 font-mono text-[11px]">{phlAttendanceRate}% Rasio</span>
          </div>
        </div>

        {/* Card 2: Staff PP1 & Geofence */}
        <div 
          onClick={() => onNavigate('staff-master')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Staff Struktural</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {staffCount} <span className="text-xs font-normal text-slate-400">Karyawan</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-indigo-600 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              3 Rotasi Shift
            </span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
              {presensiStaff.length} Clocked
            </span>
          </div>
        </div>

        {/* Card 3: Upah Borongan Minggu Berjalan */}
        <div 
          onClick={() => onNavigate('phl-borongan')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Borongan</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BadgePercent className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 tracking-tight">
            Rp {totalUpahBorongan.toLocaleString('id-ID')}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              {outputBorongan.length} Laporan Tonase
            </span>
            <span className="text-emerald-600 font-bold text-[11px] flex items-center">
              Siap Payroll <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 4: Matriks KPI Rata-Rata */}
        <div 
          onClick={() => onNavigate('staff-kpi')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rata-rata KPI</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {avgKpi} <span className="text-xs font-semibold text-amber-600">/ 100</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Grade Rata-rata</span>
            <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-100 text-amber-800 text-[10px]">
              Grade A - Prima
            </span>
          </div>
        </div>

      </div>

      {/* Grid: 4 Lini Produksi Status & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: 4 Lini Produksi Status */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Status 4 Lini Penugasan Pekerja Borongan (PHL)
              </h3>
              <p className="text-xs text-slate-500">
                Alokasi tenaga kerja dan tarif standar Divisi Produksi 1
              </p>
            </div>
            <button
              onClick={() => onNavigate('phl-borongan')}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              Lihat Rincian <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Lini 1: Sortir Cengkeh */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-xs transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-800">1. Sortir Gagang Cengkeh</span>
                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                  Rp 850 / Kg
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Pemisahan gagang cengkeh dari bunga &amp; benda asing dengan kadar air &lt; 12%.
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium pt-2 border-t border-slate-200/60">
                <span>Pekerja Terdaftar: 3 Orang</span>
                <span className="text-emerald-600 font-semibold">Aktif Produksi</span>
              </div>
            </div>

            {/* Lini 2: Grading Krosok */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-xs transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-800">2. Grading Krosok</span>
                <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">
                  Rp 950 / Kg
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Klasifikasi daun tembakau krosok berdasarkan warna, aroma, dan keutuhan helai.
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium pt-2 border-t border-slate-200/60">
                <span>Pekerja Terdaftar: 2 Orang</span>
                <span className="text-emerald-600 font-semibold">Aktif Produksi</span>
              </div>
            </div>

            {/* Lini 3: Stacking Karung */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-xs transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-800">3. Stacking Karung</span>
                <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                  Rp 1.500 / Karung
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Penyusunan karung bahan mentah ke palet standar gudang tinggi maksimum 5 susun.
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium pt-2 border-t border-slate-200/60">
                <span>Pekerja Terdaftar: 2 Orang</span>
                <span className="text-emerald-600 font-semibold">Aktif Produksi</span>
              </div>
            </div>

            {/* Lini 4: Kebersihan Area */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-xs transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-800">4. Kebersihan Area &amp; Mesin</span>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  Rp 120.000 / Hari
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Sanitasi harian lantai lini pengolahan, rotary dryer, dan sterilisasi corong silo.
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium pt-2 border-t border-slate-200/60">
                <span>Pekerja Terdaftar: 1 Orang</span>
                <span className="text-emerald-600 font-semibold">Aktif Sanitasi</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right: GPS Geofence & Quick Notifications */}
        <div className="space-y-4">
          
          {/* Geofence Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Sentral Geofence Pabrik
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Radius 150m
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-1.5 mb-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Koordinat:</span>
                <span className="font-mono font-semibold text-slate-800">{PABRIK_GEOFENCE.latitude}, {PABRIK_GEOFENCE.longitude}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Radius Maksimal:</span>
                <span className="font-semibold text-slate-800">{PABRIK_GEOFENCE.radiusMaksimumMeter} Meter</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Alamat:</span>
                <span className="text-right text-[11px] text-slate-700 max-w-[180px] truncate">{PABRIK_GEOFENCE.alamat}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('staff-gps')}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Buka Modul Presensi GPS
            </button>
          </div>

          {/* Pending Approval Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {pendingLembur} Pengajuan Lembur
                </div>
                <div className="text-[11px] text-slate-500">
                  Memerlukan otorisasi Manajer
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigate('staff-lembur')}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
            >
              Review
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
