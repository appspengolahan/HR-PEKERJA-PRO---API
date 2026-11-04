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
  parseTimeToMinutes
} from '../../utils/workHoursUtils';
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
  const [selectedBulan, setSelectedBulan] = useState(String(new Date().getMonth() + 1));
  const [selectedTahun, setSelectedTahun] = useState(String(new Date().getFullYear()));
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
  const [addTglAwal, setAddTglAwal] = useState(new Date().toISOString().slice(0, 10));
  const [addTglAkhir, setAddTglAkhir] = useState('');
  const [addJenisIjin, setAddJenisIjin] = useState(jenisIjinList[0] || 'Ijin Terlambat');
  const [addSehariPenuh, setAddSehariPenuh] = useState(false);
  // Jam kehadiran shift kerja (standar pabrik / jam masuk awal & pulang akhir)
  const [addMasukAwal, setAddMasukAwal] = useState('08:00');
  const [addPulangAkhir, setAddPulangAkhir] = useState('16:00');
  // Jam izin keluar sementara (yang dipotong dari jam kerja)
  const [addJamAwal, setAddJamAwal] = useState('08:00');
  const [addJamAkhir, setAddJamAkhir] = useState('16:00');
  const [addKeperluan, setAddKeperluan] = useState('');
  const [addLampiran, setAddLampiran] = useState('Tidak');
  const [addCatatan, setAddCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Edit State for Shift Context
  const [editMasukAwal, setEditMasukAwal] = useState('08:00');
  const [editPulangAkhir, setEditPulangAkhir] = useState('16:00');

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
    return calculateEffectivePermitMinutes(addTglAwal, addJamAwal, addJamAkhir, addSehariPenuh, addJenisIjin);
  }, [addTglAwal, addJamAwal, addJamAkhir, addSehariPenuh, addJenisIjin]);

  // Live preview calculation for Edit Modal
  const liveEditPermitResult = useMemo(() => {
    if (!editingRecord) return null;
    return calculateEffectivePermitMinutes(
      editingRecord.tanggalIso || editingRecord.tanggal,
      editingRecord.jamAwal,
      editingRecord.jamAkhir,
      false,
      editingRecord.jenisIjin
    );
  }, [editingRecord]);

  const addTimeLabels = useMemo(() => {
    const j = (addJenisIjin || '').toLowerCase();
    if (j.includes('sementara') || j.includes('keluar')) {
      return {
        awalLabel: 'Jam Keluar Sementara (Mulai Ijin)',
        awalHelp: 'Jam pekerja mulai meninggalkan tempat kerja (misal: 09:00)',
        akhirLabel: 'Jam Masuk Kembali (Selesai Ijin)',
        akhirHelp: 'Jam pekerja kembali & lanjut bekerja (misal: 11:00)',
        isKeluarSementara: true
      };
    }
    if (j.includes('terlambat')) {
      return {
        awalLabel: 'Jam Jadwal Masuk (Resmi)',
        awalHelp: 'Jam shift resmi dimulai (08:00)',
        akhirLabel: 'Jam Tiba di Pabrik (Jam Datang)',
        akhirHelp: 'Jam aktual pekerja tiba di tempat kerja',
        isKeluarSementara: false
      };
    }
    if (j.includes('pulang') || j.includes('cepat') || j.includes('awal')) {
      return {
        awalLabel: 'Jam Pulang Lebih Cepat',
        awalHelp: 'Jam pekerja meninggalkan tempat kerja',
        akhirLabel: 'Jam Selesai Shift Resmi',
        akhirHelp: 'Jam akhir shift resmi (16:00 / 16:30)',
        isKeluarSementara: false
      };
    }
    return {
      awalLabel: 'Jam Awal',
      awalHelp: 'Jam mulai ketidakhadiran',
      akhirLabel: 'Jam Akhir',
      akhirHelp: 'Jam selesai ketidakhadiran',
      isKeluarSementara: false
    };
  }, [addJenisIjin]);

  const editTimeLabels = useMemo(() => {
    const j = (editingRecord?.jenisIjin || '').toLowerCase();
    if (j.includes('sementara') || j.includes('keluar')) {
      return {
        awalLabel: 'Jam Keluar Sementara (Mulai Ijin)',
        awalHelp: 'Jam pekerja mulai meninggalkan tempat kerja (misal: 09:00)',
        akhirLabel: 'Jam Masuk Kembali (Selesai Ijin)',
        akhirHelp: 'Jam pekerja kembali & lanjut bekerja (misal: 11:00)',
        isKeluarSementara: true
      };
    }
    if (j.includes('terlambat')) {
      return {
        awalLabel: 'Jam Jadwal Masuk (Resmi)',
        awalHelp: 'Jam shift resmi dimulai (08:00)',
        akhirLabel: 'Jam Tiba di Pabrik (Jam Datang)',
        akhirHelp: 'Jam aktual pekerja tiba di tempat kerja',
        isKeluarSementara: false
      };
    }
    if (j.includes('pulang') || j.includes('cepat') || j.includes('awal')) {
      return {
        awalLabel: 'Jam Pulang Lebih Cepat',
        awalHelp: 'Jam pekerja meninggalkan tempat kerja',
        akhirLabel: 'Jam Selesai Shift Resmi',
        akhirHelp: 'Jam akhir shift resmi (16:00 / 16:30)',
        isKeluarSementara: false
      };
    }
    return {
      awalLabel: 'Jam Awal',
      awalHelp: 'Jam mulai ketidakhadiran',
      akhirLabel: 'Jam Akhir',
      akhirHelp: 'Jam selesai ketidakhadiran',
      isKeluarSementara: false
    };
  }, [editingRecord?.jenisIjin]);

  // Simulasi kehadiran & upah untuk Ijin Keluar Sementara (Add Modal)
  const simAddKeluarSementara = useMemo(() => {
    const isKS = (addJenisIjin || '').toLowerCase().includes('sementara') || (addJenisIjin || '').toLowerCase().includes('keluar');
    if (!isKS) return null;

    const sched = liveAddPermitResult.schedule;
    const mMasuk = parseTimeToMinutes(addMasukAwal || sched.workStart);
    const mKeluar = parseTimeToMinutes(addJamAwal || '09:00');
    const mKembali = parseTimeToMinutes(addJamAkhir || '11:00');
    const mPulang = parseTimeToMinutes(addPulangAkhir || sched.workEnd);

    // Sesi 1 Hadir Pagi: Jam Masuk s/d Jam Keluar
    const sesi1Bruto = Math.max(0, mKeluar - mMasuk);
    let sesi1Break = 0;
    if (sched.breakStartMin > 0 && sched.breakEndMin > sched.breakStartMin) {
      const oStart = Math.max(mMasuk, sched.breakStartMin);
      const oEnd = Math.min(mKeluar, sched.breakEndMin);
      if (oEnd > oStart) sesi1Break = oEnd - oStart;
    }
    const sesi1Net = Math.max(0, sesi1Bruto - sesi1Break);

    // Sesi Izin Keluar (Dipotong): Jam Keluar s/d Jam Kembali
    const izinBruto = Math.max(0, mKembali - mKeluar);
    let izinBreak = 0;
    if (sched.breakStartMin > 0 && sched.breakEndMin > sched.breakStartMin) {
      const oStart = Math.max(mKeluar, sched.breakStartMin);
      const oEnd = Math.min(mKembali, sched.breakEndMin);
      if (oEnd > oStart) izinBreak = oEnd - oStart;
    }
    const izinNet = Math.max(0, izinBruto - izinBreak);

    // Sesi 2 Hadir Siang/Sore: Jam Kembali s/d Jam Pulang
    const sesi2Bruto = Math.max(0, mPulang - mKembali);
    let sesi2Break = 0;
    if (sched.breakStartMin > 0 && sched.breakEndMin > sched.breakStartMin) {
      const oStart = Math.max(mKembali, sched.breakStartMin);
      const oEnd = Math.min(mPulang, sched.breakEndMin);
      if (oEnd > oStart) sesi2Break = oEnd - oStart;
    }
    const sesi2Net = Math.max(0, sesi2Bruto - sesi2Break);

    const totalKerjaNet = sesi1Net + sesi2Net;
    const totalTarget = sched.effectiveWorkMinutes || 420;
    const faktorPotongan = Math.min(1, Math.round((izinNet / totalTarget) * 100) / 100);
    const hakUpahFaktor = Math.max(0, Math.round((1 - faktorPotongan) * 100) / 100);

    return {
      sesi1Net,
      sesi2Net,
      izinNet,
      izinBreak,
      totalKerjaNet,
      totalTarget,
      faktorPotongan,
      hakUpahFaktor,
      workStart: addMasukAwal || sched.workStart,
      workEnd: addPulangAkhir || sched.workEnd,
      jamKeluar: addJamAwal || '09:00',
      jamKembali: addJamAkhir || '11:00'
    };
  }, [addJenisIjin, liveAddPermitResult.schedule, addMasukAwal, addJamAwal, addJamAkhir, addPulangAkhir]);

  // Simulasi kehadiran & upah untuk Ijin Keluar Sementara (Edit Modal)
  const simEditKeluarSementara = useMemo(() => {
    if (!editingRecord) return null;
    const j = (editingRecord.jenisIjin || '').toLowerCase();
    const isKS = j.includes('sementara') || j.includes('keluar');
    if (!isKS) return null;

    const dateStr = editingRecord.tanggalIso || editingRecord.tanggal;
    const sched = getWorkScheduleForDate(dateStr);
    const mMasuk = parseTimeToMinutes(editMasukAwal || sched.workStart);
    const mKeluar = parseTimeToMinutes(editingRecord.jamAwal || '09:00');
    const mKembali = parseTimeToMinutes(editingRecord.jamAkhir || '11:00');
    const mPulang = parseTimeToMinutes(editPulangAkhir || sched.workEnd);

    // Sesi 1 Hadir Pagi: Jam Masuk s/d Jam Keluar
    const sesi1Bruto = Math.max(0, mKeluar - mMasuk);
    let sesi1Break = 0;
    if (sched.breakStartMin > 0 && sched.breakEndMin > sched.breakStartMin) {
      const oStart = Math.max(mMasuk, sched.breakStartMin);
      const oEnd = Math.min(mKeluar, sched.breakEndMin);
      if (oEnd > oStart) sesi1Break = oEnd - oStart;
    }
    const sesi1Net = Math.max(0, sesi1Bruto - sesi1Break);

    // Sesi Izin Keluar (Dipotong): Jam Keluar s/d Jam Kembali
    const izinBruto = Math.max(0, mKembali - mKeluar);
    let izinBreak = 0;
    if (sched.breakStartMin > 0 && sched.breakEndMin > sched.breakStartMin) {
      const oStart = Math.max(mKeluar, sched.breakStartMin);
      const oEnd = Math.min(mKembali, sched.breakEndMin);
      if (oEnd > oStart) izinBreak = oEnd - oStart;
    }
    const izinNet = Math.max(0, izinBruto - izinBreak);

    // Sesi 2 Hadir Siang/Sore: Jam Kembali s/d Jam Pulang
    const sesi2Bruto = Math.max(0, mPulang - mKembali);
    let sesi2Break = 0;
    if (sched.breakStartMin > 0 && sched.breakEndMin > sched.breakStartMin) {
      const oStart = Math.max(mKembali, sched.breakStartMin);
      const oEnd = Math.min(mPulang, sched.breakEndMin);
      if (oEnd > oStart) sesi2Break = oEnd - oStart;
    }
    const sesi2Net = Math.max(0, sesi2Bruto - sesi2Break);

    const totalKerjaNet = sesi1Net + sesi2Net;
    const totalTarget = sched.effectiveWorkMinutes || 420;
    const faktorPotongan = Math.min(1, Math.round((izinNet / totalTarget) * 100) / 100);
    const hakUpahFaktor = Math.max(0, Math.round((1 - faktorPotongan) * 100) / 100);

    return {
      sesi1Net,
      sesi2Net,
      izinNet,
      izinBreak,
      totalKerjaNet,
      totalTarget,
      faktorPotongan,
      hakUpahFaktor,
      workStart: editMasukAwal || sched.workStart,
      workEnd: editPulangAkhir || sched.workEnd,
      jamKeluar: editingRecord.jamAwal || '09:00',
      jamKembali: editingRecord.jamAkhir || '11:00'
    };
  }, [editingRecord, editMasukAwal, editPulangAkhir]);

  const handleJenisIjinChange = (val: string) => {
    setAddJenisIjin(val);
    const vLower = val.toLowerCase();
    const sched = getWorkScheduleForDate(addTglAwal);
    if (vLower.includes('sementara') || vLower.includes('keluar')) {
      setAddSehariPenuh(false);
      setAddMasukAwal(sched.workStart || '08:00');
      setAddJamAwal('09:00');
      setAddJamAkhir('11:00');
      setAddPulangAkhir(sched.workEnd || '16:00');
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
    if (addTimeLabels.isKeluarSementara) {
      setAddMasukAwal(sched.workStart || '08:00');
      setAddPulangAkhir(sched.workEnd || '16:00');
    } else if (addSehariPenuh) {
      if (sched.isWorkDay) {
        setAddJamAwal(sched.workStart);
        setAddJamAkhir(sched.workEnd);
      }
    }
  };

  const handleOpenAdd = () => {
    if (filteredPekerja.length > 0) {
      setAddNama(filteredPekerja[0].nama);
    }
    const todayStr = new Date().toISOString().slice(0, 10);
    const sched = getWorkScheduleForDate(todayStr);
    setAddTglAwal(todayStr);
    setAddTglAkhir('');
    setAddMasukAwal(sched.workStart || '08:00');
    setAddPulangAkhir(sched.workEnd || '16:00');
    
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
    setShowAddModal(true);
  };

  const handleOpenEdit = (rec: PresensiIjinRecord) => {
    if (!canEditOrDelete) return;
    setEditingRecord(rec);
    const dateStr = rec.tanggalIso || rec.tanggal;
    const sched = getWorkScheduleForDate(dateStr);
    let masuk = sched.workStart;
    let pulang = sched.workEnd;
    if (rec.catatan) {
      const matchMasuk = rec.catatan.match(/Masuk Pagi:\s*(\d{2}:\d{2})/);
      if (matchMasuk) masuk = matchMasuk[1];
      const matchPulang = rec.catatan.match(/Pulang:\s*(\d{2}:\d{2})/);
      if (matchPulang) pulang = matchPulang[1];
    }
    setEditMasukAwal(masuk);
    setEditPulangAkhir(pulang);
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

    // Format catatan khusus jika Ijin Keluar Sementara
    let finalCatatan = addCatatan.trim();
    if (addTimeLabels.isKeluarSementara) {
      const detailNote = `Keluar: ${addJamAwal}, Kembali: ${addJamAkhir} (Masuk Pagi: ${addMasukAwal}, Pulang: ${addPulangAkhir})`;
      if (!finalCatatan) {
        finalCatatan = detailNote;
      } else if (!finalCatatan.includes('Masuk Pagi')) {
        finalCatatan = `${finalCatatan} [${detailNote}]`;
      }
    }

    setIsSubmitting(true);
    try {
      await onAddPresensi({
        nama: addNama,
        jenisIjin: addJenisIjin,
        keperluan: addKeperluan,
        lampiran: addLampiran,
        catatan: finalCatatan,
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

    let finalCatatan = (editingRecord.catatan || '').trim();
    if (editTimeLabels.isKeluarSementara) {
      const detailNote = `Keluar: ${editingRecord.jamAwal}, Kembali: ${editingRecord.jamAkhir} (Masuk Pagi: ${editMasukAwal}, Pulang: ${editPulangAkhir})`;
      if (!finalCatatan) {
        finalCatatan = detailNote;
      } else if (!finalCatatan.includes('Masuk Pagi')) {
        finalCatatan = `${finalCatatan} [${detailNote}]`;
      }
    }

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
        catatan: finalCatatan
      });
      setEditingRecord(null);
    } catch (err) {
      alert('Gagal mengupdate ijin: ' + err);
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
    const today = new Date();
    const dStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const isoStr = today.toISOString().slice(0, 10);
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
                  const faktor = Number(r.faktorPotongan);
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
                      <td className="py-3 px-4 max-w-xs truncate" title={r.keperluan}>
                        {r.keperluan || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          faktor === 0 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : faktor === 0.5 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {faktor === 0 ? '0 (Dibayar Penuh)' : faktor === 0.5 ? '0,5 (Setengah)' : '1 (Hangus)'}
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

      {/* Modal Add Ijin - Always Centered */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="relative m-auto bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden text-xs">
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

            <form onSubmit={handleAddSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
              
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

              {/* Sehari Penuh Checkbox - HANYA untuk ijin selain Keluar Sementara */}
              {!addTimeLabels.isKeluarSementara && (
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
              )}

              {/* TAMPILAN KHUSUS: IJIN KELUAR SEMENTARA DI TENGAH JAM KERJA */}
              {addTimeLabels.isKeluarSementara ? (
                <div className="space-y-3 p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl">
                  {/* Penjelasan Singkat */}
                  <div className="flex items-start gap-2 text-amber-950">
                    <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-amber-900">Ijin Meninggalkan Tempat Kerja Sementara Waktu</h4>
                      <p className="text-[11px] text-amber-800 leading-snug">
                        Pekerja hadir masuk kerja, izin keluar sementara di tengah hari, lalu <strong>kembali masuk</strong> melanjutkan kerja hingga jam pulang shift.
                      </p>
                    </div>
                  </div>

                  {/* Bagian 1: Jadwal Shift Kehadiran Hari Ini */}
                  <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200/80 space-y-1.5">
                    <span className="font-bold text-[11px] text-slate-700 block">
                      1. Shift Kehadiran Kerja Pekerja Hari Ini
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Jam Masuk Pagi</label>
                        <input
                          type="time"
                          value={addMasukAwal}
                          onChange={(e) => setAddMasukAwal(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 text-xs bg-slate-50 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Jam Pulang Shift</label>
                        <input
                          type="time"
                          value={addPulangAkhir}
                          onChange={(e) => setAddPulangAkhir(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 text-xs bg-slate-50 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bagian 2: Waktu Ijin Keluar Sementara (Waktu Yang Dipotongkan) */}
                  <div className="p-2.5 bg-white/90 rounded-xl border border-amber-300 space-y-1.5 ring-2 ring-amber-400/30">
                    <span className="font-bold text-[11px] text-amber-950 block">
                      2. Waktu Ijin Keluar Sementara (Yang Dipotongkan) *
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-amber-900 mb-0.5">Jam Keluar Sementara</label>
                        <p className="text-[9px] text-slate-500 mb-1">Mulai izin / keluar pabrik</p>
                        <input
                          type="time"
                          value={addJamAwal}
                          onChange={(e) => setAddJamAwal(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-amber-400 font-mono font-black text-amber-950 text-xs bg-amber-50/50 focus:bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-900 mb-0.5">Jam Masuk Kembali</label>
                        <p className="text-[9px] text-slate-500 mb-1">Kembali lanjut bekerja</p>
                        <input
                          type="time"
                          value={addJamAkhir}
                          onChange={(e) => setAddJamAkhir(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-400 font-mono font-black text-emerald-950 text-xs bg-emerald-50/50 focus:bg-white"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bagian 3: Simulasi Rincian Kehadiran & Upah */}
                  {simAddKeluarSementara && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-800 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-bold text-[11px] text-slate-900">📊 Simulasi Kehadiran &amp; Hak Upah:</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Hak Upah: {simAddKeluarSementara.hakUpahFaktor} Hari ({Math.round(simAddKeluarSementara.hakUpahFaktor * 100)}%)
                        </span>
                      </div>

                      {/* Visual Timeline Bar */}
                      <div className="space-y-1 text-[10px] font-mono">
                        <div className="flex items-center justify-between text-slate-600 bg-slate-50 px-2 py-1 rounded">
                          <span>🟢 Sesi Hadir Pagi ({simAddKeluarSementara.workStart} - {simAddKeluarSementara.jamKeluar}):</span>
                          <strong className="text-slate-800">{simAddKeluarSementara.sesi1Net} menit</strong>
                        </div>
                        <div className="flex items-center justify-between text-amber-900 bg-amber-50 px-2 py-1 rounded font-bold border border-amber-200">
                          <span>⚠️ Ijin Keluar ({simAddKeluarSementara.jamKeluar} - {simAddKeluarSementara.jamKembali}):</span>
                          <span className="text-amber-800 font-black">-{simAddKeluarSementara.izinNet} menit dipotong</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 bg-slate-50 px-2 py-1 rounded">
                          <span>🟢 Sesi Hadir Lanjutan ({simAddKeluarSementara.jamKembali} - {simAddKeluarSementara.workEnd}):</span>
                          <strong className="text-slate-800">{simAddKeluarSementara.sesi2Net} menit</strong>
                        </div>
                      </div>

                      {simAddKeluarSementara.izinBreak > 0 && (
                        <p className="text-[10px] text-blue-700 bg-blue-50/70 p-1.5 rounded">
                          ✓ Otomatis mengecualikan jam istirahat resmi <strong>{simAddKeluarSementara.izinBreak} menit</strong>
                        </p>
                      )}

                      {/* Ringkasan Angka */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                        <div className="bg-emerald-50/80 p-2 rounded-lg border border-emerald-200">
                          <span className="text-slate-500 block text-[10px]">Total Jam Hadir Kerja:</span>
                          <span className="font-extrabold text-emerald-900 text-xs">
                            {simAddKeluarSementara.totalKerjaNet} mnt ({Math.floor(simAddKeluarSementara.totalKerjaNet / 60)}j {simAddKeluarSementara.totalKerjaNet % 60}m)
                          </span>
                        </div>
                        <div className="bg-red-50/80 p-2 rounded-lg border border-red-200">
                          <span className="text-slate-500 block text-[10px]">Durasi Ijin Dipotong:</span>
                          <span className="font-extrabold text-red-700 text-xs">
                            {simAddKeluarSementara.izinNet} mnt (Faktor {simAddKeluarSementara.faktorPotongan})
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* TAMPILAN STANDAR (SELAIN KELUAR SEMENTARA) */
                !addSehariPenuh && (
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
                )
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

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Ijin'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Ijin - Always Centered */}
      {editingRecord && canEditOrDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="relative m-auto bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden text-xs">
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

            <form onSubmit={handleEditSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
              
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

              {/* TAMPILAN KHUSUS EDIT: IJIN KELUAR SEMENTARA DI TENGAH JAM KERJA */}
              {editTimeLabels.isKeluarSementara ? (
                <div className="space-y-3 p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl">
                  {/* Penjelasan Singkat */}
                  <div className="flex items-start gap-2 text-amber-950">
                    <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-amber-900">Ijin Meninggalkan Tempat Kerja Sementara Waktu</h4>
                      <p className="text-[11px] text-amber-800 leading-snug">
                        Pekerja hadir masuk kerja di awal shift, izin keluar sementara di tengah hari, lalu <strong>kembali masuk</strong> melanjutkan kerja hingga jam pulang.
                      </p>
                    </div>
                  </div>

                  {/* Bagian 1: Jadwal Shift Kehadiran Hari Ini */}
                  <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200/80 space-y-1.5">
                    <span className="font-bold text-[11px] text-slate-700 block">
                      1. Shift Kehadiran Kerja Pekerja Hari Ini
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Jam Masuk Pagi</label>
                        <input
                          type="time"
                          value={editMasukAwal}
                          onChange={(e) => setEditMasukAwal(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 text-xs bg-slate-50 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Jam Pulang Shift</label>
                        <input
                          type="time"
                          value={editPulangAkhir}
                          onChange={(e) => setEditPulangAkhir(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 text-xs bg-slate-50 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bagian 2: Waktu Ijin Keluar Sementara (Waktu Yang Dipotongkan) */}
                  <div className="p-2.5 bg-white/90 rounded-xl border border-amber-300 space-y-1.5 ring-2 ring-amber-400/30">
                    <span className="font-bold text-[11px] text-amber-950 block">
                      2. Waktu Ijin Keluar Sementara (Yang Dipotongkan) *
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-amber-900 mb-0.5">Jam Keluar Sementara</label>
                        <p className="text-[9px] text-slate-500 mb-1">Mulai izin / keluar pabrik</p>
                        <input
                          type="time"
                          value={editingRecord.jamAwal && editingRecord.jamAwal !== '-' ? editingRecord.jamAwal : ''}
                          onChange={(e) => setEditingRecord({ ...editingRecord, jamAwal: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-amber-400 font-mono font-black text-amber-950 text-xs bg-amber-50/50 focus:bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-900 mb-0.5">Jam Masuk Kembali</label>
                        <p className="text-[9px] text-slate-500 mb-1">Kembali lanjut bekerja</p>
                        <input
                          type="time"
                          value={editingRecord.jamAkhir && editingRecord.jamAkhir !== '-' ? editingRecord.jamAkhir : ''}
                          onChange={(e) => setEditingRecord({ ...editingRecord, jamAkhir: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-400 font-mono font-black text-emerald-950 text-xs bg-emerald-50/50 focus:bg-white"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bagian 3: Simulasi Rincian Kehadiran & Upah */}
                  {simEditKeluarSementara && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-800 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-bold text-[11px] text-slate-900">📊 Simulasi Kehadiran &amp; Hak Upah:</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Hak Upah: {simEditKeluarSementara.hakUpahFaktor} Hari ({Math.round(simEditKeluarSementara.hakUpahFaktor * 100)}%)
                        </span>
                      </div>

                      {/* Visual Timeline Bar */}
                      <div className="space-y-1 text-[10px] font-mono">
                        <div className="flex items-center justify-between text-slate-600 bg-slate-50 px-2 py-1 rounded">
                          <span>🟢 Sesi Hadir Pagi ({simEditKeluarSementara.workStart} - {simEditKeluarSementara.jamKeluar}):</span>
                          <strong className="text-slate-800">{simEditKeluarSementara.sesi1Net} menit</strong>
                        </div>
                        <div className="flex items-center justify-between text-amber-900 bg-amber-50 px-2 py-1 rounded font-bold border border-amber-200">
                          <span>⚠️ Ijin Keluar ({simEditKeluarSementara.jamKeluar} - {simEditKeluarSementara.jamKembali}):</span>
                          <span className="text-amber-800 font-black">-{simEditKeluarSementara.izinNet} menit dipotong</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 bg-slate-50 px-2 py-1 rounded">
                          <span>🟢 Sesi Hadir Lanjutan ({simEditKeluarSementara.jamKembali} - {simEditKeluarSementara.workEnd}):</span>
                          <strong className="text-slate-800">{simEditKeluarSementara.sesi2Net} menit</strong>
                        </div>
                      </div>

                      {simEditKeluarSementara.izinBreak > 0 && (
                        <p className="text-[10px] text-blue-700 bg-blue-50/70 p-1.5 rounded">
                          ✓ Otomatis mengecualikan jam istirahat resmi <strong>{simEditKeluarSementara.izinBreak} menit</strong>
                        </p>
                      )}

                      {/* Ringkasan Angka */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                        <div className="bg-emerald-50/80 p-2 rounded-lg border border-emerald-200">
                          <span className="text-slate-500 block text-[10px]">Total Jam Hadir Kerja:</span>
                          <span className="font-extrabold text-emerald-900 text-xs">
                            {simEditKeluarSementara.totalKerjaNet} mnt ({Math.floor(simEditKeluarSementara.totalKerjaNet / 60)}j {simEditKeluarSementara.totalKerjaNet % 60}m)
                          </span>
                        </div>
                        <div className="bg-red-50/80 p-2 rounded-lg border border-red-200">
                          <span className="text-slate-500 block text-[10px]">Durasi Ijin Dipotong:</span>
                          <span className="font-extrabold text-red-700 text-xs">
                            {simEditKeluarSementara.izinNet} mnt (Faktor {simEditKeluarSementara.faktorPotongan})
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* TAMPILAN STANDAR EDIT (SELAIN KELUAR SEMENTARA) */
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
                      />
                    </div>
                  </div>

                  {liveEditPermitResult && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-900 text-xs">
                      <div>
                        <div className="font-semibold text-emerald-950 flex items-center gap-1.5">
                          <span>Durasi Ijin yang Dipotong:</span>
                          <strong className="text-emerald-700 font-black text-sm">{liveEditPermitResult.durasiMenit} menit</strong>
                          <span className="text-slate-500 font-normal">({Math.floor(liveEditPermitResult.durasiMenit / 60)}j {liveEditPermitResult.durasiMenit % 60}m)</span>
                        </div>
                        {liveEditPermitResult.potonganIstirahatMenit > 0 && (
                          <p className="text-[11px] text-emerald-700 mt-0.5">
                            ✓ Dipotong istirahat resmi <strong>{liveEditPermitResult.potonganIstirahatMenit} menit</strong> ({liveEditPermitResult.schedule.breakStart}-{liveEditPermitResult.schedule.breakEnd})
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 bg-white/80 rounded-md border border-emerald-300 text-emerald-800">
                        Faktor: {liveEditPermitResult.faktorPotongan}
                      </span>
                    </div>
                  )}
                </div>
              )}

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
                  <label className="block font-bold text-slate-700 mb-1">Lampiran</label>
                  <select
                    value={editingRecord.lampiran || 'Tidak'}
                    onChange={(e) => setEditingRecord({ ...editingRecord, lampiran: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    <option value="Tidak">Tidak Ada</option>
                    <option value="Ya">Ya (Ada)</option>
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

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
