import React, { useState, useMemo } from 'react';
import { 
  CalendarCheck, 
  Plus, 
  Search, 
  Printer, 
  Edit3, 
  Trash2, 
  FileText, 
  Clock, 
  X,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { PresensiIjinRecord, PekerjaData, SuratIjinData } from '../../types';
import { AuthUser, isWorkerInUserScope, canRoleEditOrDeletePresensi } from '../../services/authService';
import { 
  calculateEffectivePermitMinutes, 
  getWorkScheduleForDate, 
  formatMinutesToTime,
  parseTimeToMinutes,
  getFaktorPotonganBadgeInfo 
} from '../../utils/workHoursUtils';
import { getWibDateParts, getWibTodayIso } from '../../utils/dateUtils';
import { useSystemDialog } from '../../context/SystemDialogContext';

interface TabPresensiProps {
  presensiList: PresensiIjinRecord[];
  pekerjaList: PekerjaData[];
  jenisIjinList: string[];
  currentScope: string;
  onAddPresensi: (data: {
    nama: string;
    jenisIjin: string;
    keperluan: string;
    lampiran: string;
    catatan: string;
    faktorPotongan?: number;
    tanggalList: { tanggal: string; jamAwal: string; jamAkhir: string }[];
  }) => Promise<void>;
  onUpdatePresensi: (data: {
    rowNum: number;
    tanggal: string;
    jenisIjin: string;
    jamAwal: string;
    jamAkhir: string;
    keperluan: string;
    lampiran: string;
    catatan: string;
    faktorPotongan?: number;
  }) => Promise<void>;
  onDeletePresensi: (rowNum: number) => Promise<void>;
  onOpenSuratIjin: (record: PresensiIjinRecord) => void;
  onFilterChange: (bulan: string, tahun: string, nama: string) => void;
  isLoading: boolean;
  currentUser?: AuthUser | null;
  onRealignPresensi?: () => Promise<any>;
}

export const TabPresensi: React.FC<TabPresensiProps> = ({
  presensiList,
  pekerjaList,
  jenisIjinList,
  currentScope,
  onAddPresensi,
  onUpdatePresensi,
  onDeletePresensi,
  onOpenSuratIjin,
  onFilterChange,
  isLoading,
  currentUser,
  onRealignPresensi
}) => {
  const [selectedBulan, setSelectedBulan] = useState(() => String(getWibDateParts().month));
  const [selectedTahun, setSelectedTahun] = useState(() => String(getWibDateParts().year));
  const [selectedNama, setSelectedNama] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PresensiIjinRecord | null>(null);
  const [isRealigning, setIsRealigning] = useState(false);
  const { showConfirm, showAlert } = useSystemDialog();

  // Wewenang Edit & Hapus HANYA untuk Developer, Site Engineer, dan Manajer Operasional
  const canEditOrDelete = useMemo(() => canRoleEditOrDeletePresensi(currentUser?.role), [currentUser?.role]);

  const handleTriggerRealign = async () => {
    if (!onRealignPresensi || !canEditOrDelete) return;
    const ok = await showConfirm({
      title: 'Rapikan Baris Spreadsheet & Hapus Duplikasi?',
      message: 'Fitur ini akan menyusun ulang baris di sheet LOG_PRESENSI_IJIN tepat berurutan mulai baris 382 (di bawah Rudiono), membersihkan baris yang terlempar ke 806/807, serta menghapus data kembar/duplikat (Andri Buang & Dadang Nurjianto). Lanjutkan?',
      confirmLabel: 'Ya, Rapikan Sekarang',
      type: 'warning'
    });
    if (!ok) return;

    setIsRealigning(true);
    try {
      const res = await onRealignPresensi();
      if (res && res.status === 'success') {
        await showAlert(res.message || 'Baris presensi berhasil ditata rapi berurutan mulai baris 382.', {
          title: 'Sukses Merapikan Spreadsheet',
          type: 'success'
        });
      } else {
        await showAlert(res?.message || 'Gagal merapikan baris data.', {
          title: 'Catatan Sinkronisasi',
          type: 'warning'
        });
      }
    } catch (err) {
      await showAlert('Gagal merapikan data: ' + String(err), {
        title: 'Error',
        type: 'danger'
      });
    } finally {
      setIsRealigning(false);
    }
  };

  // Form Add State
  const [addNama, setAddNama] = useState('');
  const [addTglAwal, setAddTglAwal] = useState(() => getWibTodayIso());
  const [addTglAkhir, setAddTglAkhir] = useState('');
  const [addJenisIjin, setAddJenisIjin] = useState(jenisIjinList[0] || 'Ijin Terlambat');
  const [addSehariPenuh, setAddSehariPenuh] = useState(false);
  const [addJamAwal, setAddJamAwal] = useState('08:00');
  const [addJamAkhir, setAddJamAkhir] = useState('16:00');
  const [addKeperluan, setAddKeperluan] = useState('');
  const [addLampiran, setAddLampiran] = useState('Tidak');
  const [addCatatan, setAddCatatan] = useState('');
  const [addManualFaktor, setAddManualFaktor] = useState<string>('auto');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter pekerja according to user role authorization and current scope
  const filteredPekerja = pekerjaList.filter(p => {
    return isWorkerInUserScope(p, currentUser || null, currentScope);
  });

  // Set nama pekerja yang diizinkan untuk menyaring riwayat presensi tabel
  const allowedWorkerNames = useMemo(() => {
    return new Set(filteredPekerja.map(p => p.nama.trim().toUpperCase()));
  }, [filteredPekerja]);

  // Daftar presensi yang ditampilkan disaring sesuai otoritas peran
  const displayedPresensiList = useMemo(() => {
    if (currentUser?.role === 'Super Admin' && currentScope === 'ALL') {
      return presensiList;
    }
    return presensiList.filter(r => {
      if (allowedWorkerNames.has((r.nama || '').trim().toUpperCase())) return true;
      const rUnitSekup = `${r.sekup || ''} ${r.unit || ''}`.trim();
      return isWorkerInUserScope({ nama: r.nama, unit: r.unit, sekup: r.sekup, unitSekup: rUnitSekup } as any, currentUser || null, currentScope);
    });
  }, [presensiList, allowedWorkerNames, currentUser, currentScope]);

  const handleApplyFilter = () => {
    onFilterChange(selectedBulan, selectedTahun, selectedNama);
  };

  // Live preview calculation for Add Modal
  const liveAddPermitResult = useMemo(() => {
    const override = addManualFaktor === 'auto' ? undefined : Number(addManualFaktor);
    return calculateEffectivePermitMinutes(addTglAwal, addJamAwal, addJamAkhir, addSehariPenuh, addJenisIjin, override);
  }, [addTglAwal, addJamAwal, addJamAkhir, addSehariPenuh, addJenisIjin, addManualFaktor]);

  // Live preview calculation for Edit Modal
  const liveEditPermitResult = useMemo(() => {
    if (!editingRecord) return null;
    return calculateEffectivePermitMinutes(
      editingRecord.tanggalIso || editingRecord.tanggal,
      editingRecord.jamAwal,
      editingRecord.jamAkhir,
      false,
      editingRecord.jenisIjin,
      editingRecord.faktorPotongan !== undefined ? Number(editingRecord.faktorPotongan) : undefined
    );
  }, [editingRecord?.tanggal, editingRecord?.tanggalIso, editingRecord?.jamAwal, editingRecord?.jamAkhir, editingRecord?.jenisIjin, editingRecord?.faktorPotongan]);

  const addTimeLabels = useMemo(() => {
    const j = (addJenisIjin || '').toLowerCase();
    if (j.includes('sementara') || j.includes('keluar')) {
      return {
        awalLabel: 'Waktu Awal',
        awalHelp: 'Waktu mulai ijin keluar (misal: 09:00)',
        akhirLabel: 'Waktu Akhir',
        akhirHelp: 'Waktu ijin selesai / masuk kembali (misal: 11:00)'
      };
    }
    if (j.includes('terlambat')) {
      return {
        awalLabel: 'Waktu Awal',
        awalHelp: 'Waktu shift resmi dimulai (08:00)',
        akhirLabel: 'Waktu Akhir',
        akhirHelp: 'Waktu aktual tiba di pabrik (misal: 08:45)'
      };
    }
    if (j.includes('pulang') || j.includes('cepat') || j.includes('awal')) {
      return {
        awalLabel: 'Waktu Awal',
        awalHelp: 'Waktu mulai pulang lebih cepat (misal: 14:00)',
        akhirLabel: 'Waktu Akhir',
        akhirHelp: 'Waktu akhir shift resmi (16:00 / 16:30)'
      };
    }
    return {
      awalLabel: 'Waktu Awal',
      awalHelp: 'Waktu mulai ijin / ketidakhadiran',
      akhirLabel: 'Waktu Akhir',
      akhirHelp: 'Waktu selesai ijin / ketidakhadiran'
    };
  }, [addJenisIjin]);

  const editTimeLabels = useMemo(() => {
    const j = (editingRecord?.jenisIjin || '').toLowerCase();
    if (j.includes('sementara') || j.includes('keluar')) {
      return {
        awalLabel: 'Waktu Awal',
        awalHelp: 'Waktu mulai ijin keluar (misal: 09:00)',
        akhirLabel: 'Waktu Akhir',
        akhirHelp: 'Waktu ijin selesai / masuk kembali (misal: 11:00)'
      };
    }
    if (j.includes('terlambat')) {
      return {
        awalLabel: 'Waktu Awal',
        awalHelp: 'Waktu shift resmi dimulai (08:00)',
        akhirLabel: 'Waktu Akhir',
        akhirHelp: 'Waktu aktual tiba di pabrik (misal: 08:45)'
      };
    }
    if (j.includes('pulang') || j.includes('cepat') || j.includes('awal')) {
      return {
        awalLabel: 'Waktu Awal',
        awalHelp: 'Waktu mulai pulang lebih cepat (misal: 14:00)',
        akhirLabel: 'Waktu Akhir',
        akhirHelp: 'Waktu akhir shift resmi (16:00 / 16:30)'
      };
    }
    return {
      awalLabel: 'Waktu Awal',
      awalHelp: 'Waktu mulai ijin / ketidakhadiran',
      akhirLabel: 'Waktu Akhir',
      akhirHelp: 'Waktu selesai ijin / ketidakhadiran'
    };
  }, [editingRecord?.jenisIjin]);

  const handleJenisIjinChange = (val: string) => {
    setAddJenisIjin(val);
    const vLower = val.toLowerCase();
    const sched = getWorkScheduleForDate(addTglAwal);
    if (vLower.includes('sementara') || vLower.includes('keluar')) {
      setAddSehariPenuh(false);
      setAddJamAwal('09:00');
      setAddJamAkhir('11:00');
    } else if (vLower.includes('terlambat')) {
      setAddSehariPenuh(false);
      setAddJamAwal(sched.workStart || '08:00');
      setAddJamAkhir('08:45');
    } else if (vLower.includes('pulang') || vLower.includes('awal') || vLower.includes('cepat')) {
      setAddSehariPenuh(false);
      setAddJamAwal('14:00');
      setAddJamAkhir(sched.workEnd || '16:00');
    } else if (vLower.includes('sakit') || vLower.includes('alpha') || vLower.includes('normatif')) {
      setAddSehariPenuh(true);
      if (sched.isWorkDay) {
        setAddJamAwal(sched.workStart);
        setAddJamAkhir(sched.workEnd);
      }
    }
  };

  const handleToggleSehariPenuh = (checked: boolean) => {
    setAddSehariPenuh(checked);
    if (checked) {
      const sched = getWorkScheduleForDate(addTglAwal);
      if (sched.isWorkDay) {
        setAddJamAwal(sched.workStart);
        setAddJamAkhir(sched.workEnd);
      }
    }
  };

  const handleTglAwalChange = (val: string) => {
    setAddTglAwal(val);
    const sched = getWorkScheduleForDate(val);
    if (addSehariPenuh && sched.isWorkDay) {
      setAddJamAwal(sched.workStart);
      setAddJamAkhir(sched.workEnd);
    }
  };

  const handleOpenAdd = () => {
    if (filteredPekerja.length > 0) {
      setAddNama(filteredPekerja[0].nama);
    }
    const todayStr = getWibTodayIso();
    const sched = getWorkScheduleForDate(todayStr);
    setAddTglAwal(todayStr);
    setAddTglAkhir('');
    
    const isKS = (addJenisIjin || '').toLowerCase().includes('sementara') || (addJenisIjin || '').toLowerCase().includes('keluar');
    if (isKS) {
      setAddSehariPenuh(false);
      setAddJamAwal('09:00');
      setAddJamAkhir('11:00');
    } else {
      setAddSehariPenuh(false);
      setAddJamAwal(sched.workStart);
      setAddJamAkhir(sched.workEnd);
    }
    setAddKeperluan('');
    setAddLampiran('Tidak');
    setAddCatatan('');
    setAddManualFaktor('auto');
    setShowAddModal(true);
  };

  const handleOpenEdit = (rec: PresensiIjinRecord) => {
    if (!canEditOrDelete) return;
    setEditingRecord({ 
      ...rec, 
      faktorPotongan: rec.faktorPotongan !== undefined ? Number(rec.faktorPotongan) : 0 
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addNama || !addTglAwal || !addJenisIjin) {
      alert('Nama, Tanggal Awal, dan Jenis Ijin wajib diisi.');
      return;
    }

    const tglAwalObj = new Date(addTglAwal + 'T00:00:00');
    const tglAkhirObj = addTglAkhir ? new Date(addTglAkhir + 'T00:00:00') : tglAwalObj;

    if (tglAkhirObj < tglAwalObj) {
      alert('Tanggal Akhir tidak boleh sebelum Tanggal Awal.');
      return;
    }

    // Build dates list, skipping Sunday, and applying accurate Saturday hours if Sehari Penuh
    const tanggalList: { tanggal: string; jamAwal: string; jamAkhir: string }[] = [];
    const cur = new Date(tglAwalObj);

    while (cur <= tglAkhirObj) {
      const day = cur.getDay(); // 0 is Sunday, 6 is Saturday
      if (day !== 0) { // skip Sunday
        const dateIso = cur.getFullYear() + '-' + 
          String(cur.getMonth() + 1).padStart(2, '0') + '-' + 
          String(cur.getDate()).padStart(2, '0');

        let jamAwal = addJamAwal;
        let jamAkhir = addJamAkhir;

        if (addSehariPenuh) {
          const daySched = getWorkScheduleForDate(dateIso);
          jamAwal = daySched.workStart;
          jamAkhir = daySched.workEnd;
        }

        tanggalList.push({ tanggal: dateIso, jamAwal, jamAkhir });
      }
      cur.setDate(cur.getDate() + 1);
    }

    if (tanggalList.length === 0) {
      alert('Tidak ada hari kerja dalam rentang tanggal yang dipilih (semua hari Minggu).');
      return;
    }

    const finalFaktor = addManualFaktor === 'auto' ? liveAddPermitResult.faktorPotongan : Number(addManualFaktor);
    setIsSubmitting(true);
    try {
      await onAddPresensi({
        nama: addNama,
        jenisIjin: addJenisIjin,
        keperluan: addKeperluan,
        lampiran: addLampiran,
        catatan: addCatatan.trim(),
        faktorPotongan: finalFaktor,
        tanggalList
      });
      setShowAddModal(false);
    } catch (err) {
      alert('Gagal menyimpan ijin: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const finalFaktor = editingRecord.faktorPotongan !== undefined ? Number(editingRecord.faktorPotongan) : (liveEditPermitResult?.faktorPotongan ?? 0);
    setIsSubmitting(true);
    try {
      await onUpdatePresensi({
        rowNum: editingRecord.rowNum,
        tanggal: editingRecord.tanggalIso || editingRecord.tanggal,
        jenisIjin: editingRecord.jenisIjin,
        jamAwal: editingRecord.jamAwal,
        jamAkhir: editingRecord.jamAkhir,
        keperluan: editingRecord.keperluan,
        lampiran: editingRecord.lampiran,
        catatan: (editingRecord.catatan || '').trim(),
        faktorPotongan: finalFaktor
      });
      setEditingRecord(null);
    } catch (err) {
      alert('Gagal memperbarui ijin: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const bulanOptions = [
    { val: '1', label: 'Januari' }, { val: '2', label: 'Februari' }, { val: '3', label: 'Maret' },
    { val: '4', label: 'April' }, { val: '5', label: 'Mei' }, { val: '6', label: 'Juni' },
    { val: '7', label: 'Juli' }, { val: '8', label: 'Agustus' }, { val: '9', label: 'September' },
    { val: '10', label: 'Oktober' }, { val: '11', label: 'November' }, { val: '12', label: 'Desember' }
  ];

  const handleOpenBlankOrSelectedSuratIjin = () => {
    const p = getWibDateParts();
    const dStr = p.dmy;
    const isoStr = p.iso;
    const worker = selectedNama ? filteredPekerja.find(p => p.nama === selectedNama) : filteredPekerja[0];
    
    const todaySched = getWorkScheduleForDate(isoStr);
    onOpenSuratIjin({
      rowNum: 0,
      tanggal: dStr,
      tanggalIso: isoStr,
      nama: worker?.nama || selectedNama || 'Pekerja Harian',
      unit: worker?.unit || 'Produksi',
      sekup: worker?.sekup || '',
      jamAwal: todaySched.workStart,
      jamAkhir: todaySched.workEnd,
      durasiMenit: todaySched.effectiveWorkMinutes,
      jenisIjin: 'Ijin Tidak Masuk Kerja',
      keperluan: '',
      lampiran: 'Tidak',
      catatan: '',
      faktorPotongan: 1
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Banner / Filter Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Presensi &amp; Pengecualian Ijin / Ketidakhadiran
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Semua pekerja otomatis dianggap Hadir penuh. Catat hanya jika ada pengecualian ijin atau sakit.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Ijin
            </button>
            <button
              onClick={handleOpenBlankOrSelectedSuratIjin}
              className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-indigo-200 transition-colors"
              title="Buka / Cetak Formulir Fisik Resmi (Standar Kertas 20,5 × 16 cm - GAS Lama)"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              Formulir Fisik (20,5×16)
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              Export PDF
            </button>
            {canEditOrDelete && onRealignPresensi && (
              <button
                onClick={handleTriggerRealign}
                disabled={isRealigning}
                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-amber-200 transition-colors cursor-pointer"
                title="Menata ulang baris spreadsheet tepat di bawah baris 381 Rudiono & membersihkan duplikasi tanggal pekerja"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isRealigning ? 'animate-spin' : ''}`} />
                {isRealigning ? 'Merapikan...' : 'Rapikan & Hapus Duplikat'}
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 font-bold mb-1">Bulan</label>
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium"
            >
              {bulanOptions.map(b => (
                <option key={b.val} value={b.val}>{b.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Tahun</label>
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Nama Pekerja (Opsional)</label>
            <select
              value={selectedNama}
              onChange={(e) => setSelectedNama(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium"
            >
              <option value="">-- Semua Pekerja di Tim --</option>
              {filteredPekerja.map(p => (
                <option key={p.id} value={p.nama}>{p.nama}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleApplyFilter}
              disabled={isLoading}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Search className="w-4 h-4" />
              {isLoading ? 'Memuat...' : 'Tampilkan Data'}
            </button>
          </div>
        </div>

      </div>

      {/* Presensi Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">
              Daftar Ijin / Ketidakhadiran Tercatat ({presensiList.length} Entri)
            </span>
            <span className="sm:hidden px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Geser Tabel ↔
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 hidden xs:inline">
            Tab Sheet: LOG_PRESENSI_IJIN
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Nama Pekerja</th>
                <th className="py-3 px-4">Jenis Ijin</th>
                <th className="py-3 px-4 text-center">Jam</th>
                <th className="py-3 px-4">Keperluan</th>
                <th className="py-3 px-4 text-center">Faktor Potongan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {displayedPresensiList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    {isLoading ? 'Sedang memuat data langsung dari spreadsheet...' : 'Belum ada data ijin tercatat pada filter ini.'}
                  </td>
                </tr>
              ) : (
                displayedPresensiList.map((r) => {
                  const badge = getFaktorPotonganBadgeInfo(r.faktorPotongan);
                  const jam = (r.jamAwal && r.jamAwal !== '-' && r.jamAkhir && r.jamAkhir !== '-') 
                    ? `${r.jamAwal} - ${r.jamAkhir}` : '-';

                  return (
                    <tr key={r.rowNum} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium whitespace-nowrap text-slate-900">
                        {r.tanggal}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {r.nama}
                        <span className="text-[10px] text-slate-400 font-normal block">
                          {r.unit} • {r.sekup}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800">
                          {r.jenisIjin}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[11px]">
                        {jam}
                      </td>
                      <td className="py-3 px-4 max-w-xs" title={r.keperluan}>
                        <div className="truncate font-medium">{r.keperluan || '-'}</div>
                        {r.lampiran && r.lampiran !== 'Tidak' && (
                          <div className="mt-0.5">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              r.lampiran === 'Form Izin Perusahaan'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {r.lampiran === 'Form Izin Perusahaan' ? '📄 Form Izin Perusahaan' : '📎 Surat Lampiran'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenSuratIjin(r)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
                            title="Buka &amp; Cetak Surat Permohonan Ijin"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          {canEditOrDelete && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(r)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                                title="Edit Data Ijin"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  const ok = await showConfirm({
                                    message: `Hapus data ijin ${r.nama} pada tanggal ${r.tanggal}?\nSalinan akan disimpan ke arsip.`,
                                    type: 'danger',
                                    confirmLabel: 'Ya, Hapus'
                                  });
                                  if (ok) {
                                    onDeletePresensi(r.rowNum);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-700 transition-colors cursor-pointer"
                                title="Hapus Data Ijin"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal Add Ijin - Always Centered with Docked Footer & Safe Bottom Margin */}
      {showAddModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 pb-24 sm:pb-6 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="relative m-auto bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden text-xs">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-sm font-bold">Catat Ijin / Ketidakhadiran Pekerja</h3>
                <p className="text-[11px] text-slate-400">Faktor potongan otomatis terhitung di backend</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pekerja *</label>
                <select
                  value={addNama}
                  onChange={(e) => setAddNama(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold"
                >
                  {filteredPekerja.map(p => (
                    <option key={p.id} value={p.nama}>{p.nama} ({p.unit} - {p.sekup})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Awal *</label>
                  <input
                    type="date"
                    required
                    value={addTglAwal}
                    onChange={(e) => handleTglAwalChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tanggal Akhir <span className="font-normal text-slate-400">(Opsional jika 1 hari)</span>
                  </label>
                  <input
                    type="date"
                    value={addTglAkhir}
                    onChange={(e) => setAddTglAkhir(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              {/* Schedule Info Box */}
              <div className="p-2.5 bg-blue-50/70 border border-blue-200/60 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 text-blue-800 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Jadwal Resmi Divisi: {liveAddPermitResult.schedule.dayName}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600">
                  <span>Jam Resmi: <strong className="text-slate-800">{liveAddPermitResult.schedule.workStart} - {liveAddPermitResult.schedule.workEnd}</strong></span>
                  {liveAddPermitResult.schedule.breakStart && (
                    <span>Istirahat: <strong className="text-slate-800">{liveAddPermitResult.schedule.breakStart} - {liveAddPermitResult.schedule.breakEnd}</strong> ({liveAddPermitResult.schedule.breakEndMin - liveAddPermitResult.schedule.breakStartMin} mnt)</span>
                  )}
                  <span>Efektif Penuh: <strong className="text-blue-700">{liveAddPermitResult.schedule.effectiveWorkMinutes} menit</strong></span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Ijin *</label>
                <select
                  value={addJenisIjin}
                  onChange={(e) => handleJenisIjinChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                >
                  {jenisIjinList.map(j => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>

              {/* Sehari Penuh Checkbox */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={addSehariPenuh}
                    onChange={(e) => handleToggleSehariPenuh(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Sehari Penuh (Otomatis {liveAddPermitResult.schedule.effectiveWorkMinutes} menit: {liveAddPermitResult.schedule.workStart} s/d {liveAddPermitResult.schedule.workEnd})</span>
                </label>
              </div>

              {/* Input Waktu Awal & Waktu Akhir Ijin */}
              {!addSehariPenuh && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5">{addTimeLabels.awalLabel}</label>
                      <p className="text-[10px] text-slate-400 mb-1">{addTimeLabels.awalHelp}</p>
                      <input
                        type="time"
                        value={addJamAwal}
                        onChange={(e) => setAddJamAwal(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5">{addTimeLabels.akhirLabel}</label>
                      <p className="text-[10px] text-slate-400 mb-1">{addTimeLabels.akhirHelp}</p>
                      <input
                        type="time"
                        value={addJamAkhir}
                        onChange={(e) => setAddJamAkhir(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900"
                        required
                      />
                    </div>
                  </div>

                  {/* Live Calculation Preview Card */}
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-900 text-xs">
                    <div>
                      <div className="font-semibold text-emerald-950 flex items-center gap-1.5">
                        <span>Durasi Ijin yang Dipotong:</span>
                        <strong className="text-emerald-700 font-black text-sm">{liveAddPermitResult.durasiMenit} menit</strong>
                        <span className="text-slate-500 font-normal">({Math.floor(liveAddPermitResult.durasiMenit / 60)}j {liveAddPermitResult.durasiMenit % 60}m)</span>
                      </div>
                      {liveAddPermitResult.potonganIstirahatMenit > 0 && (
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          ✓ Otomatis memotong jam istirahat resmi <strong>{liveAddPermitResult.potonganIstirahatMenit} menit</strong> ({liveAddPermitResult.schedule.breakStart}-{liveAddPermitResult.schedule.breakEnd})
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 bg-white/80 rounded-md border border-emerald-300 text-emerald-800">
                      Faktor: {liveAddPermitResult.faktorPotongan}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keperluan</label>
                <input
                  type="text"
                  placeholder="Contoh: Mengantar keluarga ke rumah sakit"
                  value={addKeperluan}
                  onChange={(e) => setAddKeperluan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lampiran Surat</label>
                  <select
                    value={addLampiran}
                    onChange={(e) => setAddLampiran(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    <option value="Tidak">Tidak Ada</option>
                    <option value="Ya">Ada (Surat Dokter/Keterangan)</option>
                    <option value="Form Izin Perusahaan">Form Izin Perusahaan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catatan</label>
                  <input
                    type="text"
                    value={addCatatan}
                    onChange={(e) => setAddCatatan(e.target.value)}
                    placeholder="Opsional..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              {/* Kontrol Faktor Potongan Upah */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 text-xs">
                    Faktor Potongan Upah
                  </label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    liveAddPermitResult.faktorPotongan === 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : liveAddPermitResult.faktorPotongan === 0.5
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {liveAddPermitResult.faktorPotongan === 0 ? '0 (Dibayar Penuh)' : liveAddPermitResult.faktorPotongan === 0.5 ? '0,5 (Setengah Hari)' : '1 (Hangus)'}
                  </span>
                </div>
                <select
                  value={addManualFaktor}
                  onChange={(e) => setAddManualFaktor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium text-slate-800 bg-white"
                >
                  <option value="auto">
                    Otomatis Sistem ({liveAddPermitResult.faktorPotongan === 0 ? '0 - Dibayar Penuh (Bebas Potongan)' : liveAddPermitResult.faktorPotongan === 0.5 ? '0,5 - Potong Setengah Hari' : '1 - Hangus'})
                  </option>
                  <option value="0">0 (Dibayar Penuh / Tidak Kena Potongan)</option>
                  <option value="0.5">0,5 (Potong Setengah Hari Kerja)</option>
                  <option value="1">1 (Hangus / Potong 1 Hari Penuh)</option>
                </select>
                <p className="text-[10px] text-slate-500">
                  {liveAddPermitResult.faktorPotongan === 0
                    ? '✓ Izin terlambat/normatif/sakit dokter resmi tidak memotong upah harian.'
                    : liveAddPermitResult.faktorPotongan === 0.5
                    ? '⚠️ Izin setengah hari kerja memotong upah 0,5 hari.'
                    : '⚠️ Memotong upah 1 hari kerja penuh (hangus).'}
                </p>
              </div>

              </div>

              {/* Fixed / Docked Action Footer with generous bottom margin & padding */}
              <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 flex-shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl font-bold shadow-md shadow-blue-600/25 transition-all cursor-pointer text-xs flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Ijin</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Ijin - Always Centered with Docked Footer & Safe Bottom Margin */}
      {editingRecord && canEditOrDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 pb-24 sm:pb-6 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="relative m-auto bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden text-xs">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-sm font-bold">Edit Ijin: {editingRecord.nama}</h3>
                <p className="text-[11px] text-slate-400">Baris ke-{editingRecord.rowNum} di LOG_PRESENSI_IJIN</p>
              </div>
              <button 
                onClick={() => setEditingRecord(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={editingRecord.tanggalIso || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, tanggalIso: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Ijin</label>
                <select
                  value={editingRecord.jenisIjin}
                  onChange={(e) => setEditingRecord({ ...editingRecord, jenisIjin: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                >
                  {jenisIjinList.map(j => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>

              {/* Input Waktu Awal & Waktu Akhir Ijin */}
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">{editTimeLabels.awalLabel}</label>
                    <p className="text-[10px] text-slate-400 mb-1">{editTimeLabels.awalHelp}</p>
                    <input
                      type="time"
                      value={editingRecord.jamAwal && editingRecord.jamAwal !== '-' ? editingRecord.jamAwal : ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, jamAwal: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">{editTimeLabels.akhirLabel}</label>
                    <p className="text-[10px] text-slate-400 mb-1">{editTimeLabels.akhirHelp}</p>
                    <input
                      type="time"
                      value={editingRecord.jamAkhir && editingRecord.jamAkhir !== '-' ? editingRecord.jamAkhir : ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, jamAkhir: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900"
                      required
                    />
                  </div>
                </div>

                {liveEditPermitResult && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-900 text-xs">
                    <div>
                      <div className="font-semibold text-emerald-950 flex items-center gap-1.5">
                        <span>Durasi Ijin Efektif:</span>
                        <strong className="text-emerald-700 font-black text-sm">{liveEditPermitResult.durasiMenit} menit</strong>
                        <span className="text-slate-500 font-normal">({Math.floor(liveEditPermitResult.durasiMenit / 60)}j {liveEditPermitResult.durasiMenit % 60}m)</span>
                      </div>
                      {liveEditPermitResult.potonganIstirahatMenit > 0 && (
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          ✓ Otomatis memotong jam istirahat resmi <strong>{liveEditPermitResult.potonganIstirahatMenit} menit</strong> ({liveEditPermitResult.schedule.breakStart}-{liveEditPermitResult.schedule.breakEnd})
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 bg-white/80 rounded-md border border-emerald-300 text-emerald-800">
                      Faktor: {liveEditPermitResult.faktorPotongan}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keperluan</label>
                <input
                  type="text"
                  value={editingRecord.keperluan || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, keperluan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lampiran Surat</label>
                  <select
                    value={editingRecord.lampiran || 'Tidak'}
                    onChange={(e) => setEditingRecord({ ...editingRecord, lampiran: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    <option value="Tidak">Tidak Ada</option>
                    <option value="Ya">Ada (Surat Dokter/Keterangan)</option>
                    <option value="Form Izin Perusahaan">Form Izin Perusahaan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catatan</label>
                  <input
                    type="text"
                    value={editingRecord.catatan || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, catatan: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              {/* Kontrol Faktor Potongan Upah */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 text-xs">
                    Faktor Potongan Upah
                  </label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    Number(editingRecord.faktorPotongan) === 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : Number(editingRecord.faktorPotongan) === 0.5
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {Number(editingRecord.faktorPotongan) === 0 ? '0 (Dibayar Penuh)' : Number(editingRecord.faktorPotongan) === 0.5 ? '0,5 (Setengah Hari)' : '1 (Hangus)'}
                  </span>
                </div>
                <select
                  value={editingRecord.faktorPotongan !== undefined ? String(editingRecord.faktorPotongan) : '0'}
                  onChange={(e) => setEditingRecord({ ...editingRecord, faktorPotongan: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium text-slate-800 bg-white"
                >
                  <option value="0">0 (Dibayar Penuh / Tidak Kena Potongan)</option>
                  <option value="0.5">0,5 (Potong Setengah Hari Kerja)</option>
                  <option value="1">1 (Hangus / Potong 1 Hari Penuh)</option>
                </select>
                <p className="text-[10px] text-slate-500">
                  {Number(editingRecord.faktorPotongan) === 0
                    ? '✓ Izin tidak memotong upah harian pekerja.'
                    : Number(editingRecord.faktorPotongan) === 0.5
                    ? '⚠️ Izin setengah hari memotong upah harian 0,5 hari.'
                    : '⚠️ Memotong upah 1 hari kerja penuh (hangus).'}
                </p>
              </div>

              </div>

              {/* Fixed / Docked Action Footer with generous bottom margin & padding */}
              <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 flex-shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl font-bold shadow-md shadow-blue-600/25 transition-all cursor-pointer text-xs flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
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
