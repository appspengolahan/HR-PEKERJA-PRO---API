import React, { useState } from 'react';
import { 
  UserCheck, 
  Plus, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  X, 
  Printer,
  Check,
  Search,
  ArrowRight,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { CalonPekerjaRecord, PekerjaData } from '../../types';

interface TabCalonPekerjaProps {
  calonList: CalonPekerjaRecord[];
  pekerjaList: PekerjaData[];
  currentScope: string;
  onAddCalon: (data: Partial<CalonPekerjaRecord>) => Promise<void>;
  onUpdateStatusCalon: (data: {
    rowNum: number;
    status: 'Lolos' | 'Diperpanjang' | 'Tidak Lolos';
    unit?: string;
    sekup?: string;
    statusKepegawaian?: string;
    upahHarian?: number;
    awalPKWT?: string;
    tanggalAkhirBaru?: string;
    alasan?: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export const TabCalonPekerja: React.FC<TabCalonPekerjaProps> = ({
  calonList,
  pekerjaList,
  currentScope,
  onAddCalon,
  onUpdateStatusCalon,
  isLoading
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'aktif' | 'riwayat'>('aktif');
  const [showAddModal, setShowAddModal] = useState(false);
  const [updatingCalon, setUpdatingCalon] = useState<CalonPekerjaRecord | null>(null);

  // Add Form State
  const [newNama, setNewNama] = useState('');
  const [newUnit, setNewUnit] = useState('Cengkeh');
  const [newSekup, setNewSekup] = useState('Proses');
  const [newMulai, setNewMulai] = useState(new Date().toISOString().slice(0, 10));
  const [newAkhir, setNewAkhir] = useState(new Date().toISOString().slice(0, 10));
  const [newCatatan, setNewCatatan] = useState('');

  // Status Form State
  const [statusAction, setStatusAction] = useState<'Lolos' | 'Diperpanjang' | 'Tidak Lolos'>('Lolos');
  const [lolosUpah, setLolosUpah] = useState('146264');
  const [lolosStatusKep, setLolosStatusKep] = useState('PKWT 1');
  const [perpanjangTglBaru, setPerpanjangTglBaru] = useState('');
  const [alasan, setAlasan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map nama pekerja yang sudah resmi terdaftar di MASTER_PEKERJA
  const registeredWorkerMap = new Map<string, PekerjaData>();
  pekerjaList.forEach(p => {
    registeredWorkerMap.set(p.nama.trim().toUpperCase(), p);
  });

  const filtered = calonList.filter(c => {
    return currentScope === 'ALL' || `${c.sekup} ${c.unit}` === currentScope;
  });

  // Calon Aktif: HANYA yang masih dalam masa pelatihan DAN namanya BELUM ada di Database Pekerja serta belum berstatus 'Lolos'
  const calonAktif = filtered.filter(c => {
    const isAlreadyInMaster = registeredWorkerMap.has(c.nama.trim().toUpperCase());
    const isGraduated = c.status === 'Lolos';
    return !isAlreadyInMaster && !isGraduated;
  });

  // Riwayat Kelulusan: Calon yang sudah Lolos / resmi masuk ke Database Pekerja atau Tidak Lolos
  const calonRiwayat = filtered.filter(c => {
    const isAlreadyInMaster = registeredWorkerMap.has(c.nama.trim().toUpperCase());
    const isGraduated = c.status === 'Lolos';
    return isAlreadyInMaster || isGraduated || c.status === 'Tidak Lolos';
  });

  // Alert HANYA untuk calon pelatihan aktif yang sisa harinya < 10
  const alerts = calonAktif.filter(c => {
    const sisa = Number(c.sisaHari);
    return c.status === 'Sedang Berjalan' && !isNaN(sisa) && sisa < 10;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama || !newMulai || !newAkhir) {
      alert('Nama, Tanggal Mulai, dan Tanggal Akhir wajib diisi.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onAddCalon({
        nama: newNama,
        unit: newUnit,
        sekup: newSekup,
        tanggalMulai: newMulai,
        tanggalAkhir: newAkhir,
        catatan: newCatatan
      });
      setShowAddModal(false);
      setNewNama('');
    } catch (err) {
      alert('Gagal menambah calon: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingCalon) return;

    setIsSubmitting(true);
    try {
      await onUpdateStatusCalon({
        rowNum: updatingCalon.rowNum,
        status: statusAction,
        unit: updatingCalon.unit,
        sekup: updatingCalon.sekup,
        statusKepegawaian: lolosStatusKep,
        upahHarian: parseFloat(lolosUpah) || 146264,
        awalPKWT: updatingCalon.tanggalAkhir,
        tanggalAkhirBaru: perpanjangTglBaru,
        alasan: alasan
      });
      setUpdatingCalon(null);
      setAlasan('');
    } catch (err) {
      alert('Gagal mengupdate status calon: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setActiveSubTab('aktif')}
          className={`p-5 bg-white rounded-2xl border shadow-xs cursor-pointer transition-all ${
            activeSubTab === 'aktif' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Calon Pelatihan Aktif
            </span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2 font-mono">
            {calonAktif.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Sedang menjalani masa evaluasi &amp; seleksi
          </span>
        </div>

        <div 
          onClick={() => setActiveSubTab('riwayat')}
          className={`p-5 bg-white rounded-2xl border shadow-xs cursor-pointer transition-all ${
            activeSubTab === 'riwayat' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Lulus &amp; Masuk Database
            </span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-blue-700 mt-2 font-mono">
            {calonRiwayat.length}
          </div>
          <span className="text-[11px] text-blue-600 mt-1 block font-semibold">
            Otomatis terdaftar di MASTER_PEKERJA
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Peringatan Jatuh Tempo
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-700 mt-2 font-mono">
            {alerts.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Sisa masa pelatihan &lt; 10 hari
          </span>
        </div>
      </div>

      {/* Alert Banner for Calon Ending Soon (Hanya Calon Aktif) */}
      {alerts.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 text-xs text-amber-950 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Peringatan: {alerts.length} Calon Pekerja dengan Masa Pelatihan Akan Berakhir (&lt; 10 Hari)</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {alerts.map(c => (
              <span key={c.rowNum} className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 font-medium text-amber-950">
                {c.nama} ({c.unit}) — Sisa: <strong>{c.sisaHari} Hari</strong> (Akhir: {c.tanggalAkhir})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Table Card with Sub-Tab Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          
          {/* Sub-Tab Navigation */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl">
            <button
              onClick={() => setActiveSubTab('aktif')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'aktif' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pelatihan Aktif</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 font-mono">
                {calonAktif.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('riwayat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'riwayat' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Riwayat Lulus &amp; Database</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-mono">
                {calonRiwayat.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              + Calon Baru
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              Export PDF
            </button>
          </div>
        </div>

        {/* View 1: Pelatihan Aktif */}
        {activeSubTab === 'aktif' && (
          <div className="overflow-x-auto">
            {calonAktif.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    Tidak Ada Calon Pekerja dalam Masa Pelatihan Aktif
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Kandidat yang telah dinyatakan <strong>Lolos</strong> (seperti <em>MUHAMMAD MIFTAKHUL HAMDAN</em>) otomatis terdaftar di Database Pekerja (#62) dan tidak ditampilkan lagi pada daftar aktif ini.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveSubTab('riwayat')}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1"
                  >
                    Buka Riwayat Kelulusan <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Nama Calon</th>
                    <th className="py-2.5 px-3">Proyeksi Unit</th>
                    <th className="py-2.5 px-3">Proyeksi Sekup</th>
                    <th className="py-2.5 px-3">Mulai</th>
                    <th className="py-2.5 px-3">Akhir</th>
                    <th className="py-2.5 px-3 text-center">Durasi</th>
                    <th className="py-2.5 px-3 text-center">Sisa Hari</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {calonAktif.map(c => {
                    const sisa = Number(c.sisaHari);
                    const isUrgent = c.status === 'Sedang Berjalan' && !isNaN(sisa) && sisa < 10;

                    return (
                      <tr key={c.rowNum} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-extrabold text-slate-900">{c.nama}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{c.unit}</td>
                        <td className="py-2.5 px-3 text-slate-600">{c.sekup}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">{c.tanggalMulai}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">{c.tanggalAkhir}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{c.durasi} Hari</td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            isUrgent ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {c.sisaHari} Hari
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            {c.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => {
                              setUpdatingCalon(c);
                              setStatusAction('Lolos');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-colors border border-emerald-200"
                          >
                            Evaluasi
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* View 2: Riwayat Lolos & Masuk Database */}
        {activeSubTab === 'riwayat' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Nama Pekerja</th>
                  <th className="py-2.5 px-3">Unit &amp; Sekup</th>
                  <th className="py-2.5 px-3">Periode Pelatihan</th>
                  <th className="py-2.5 px-3 text-center">Durasi</th>
                  <th className="py-2.5 px-3 text-center">Status Kelulusan</th>
                  <th className="py-2.5 px-3 text-center">Integrasi Database</th>
                  <th className="py-2.5 px-3">Catatan Evaluasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {calonRiwayat.map(c => {
                  const masterRecord = registeredWorkerMap.get(c.nama.trim().toUpperCase());

                  return (
                    <tr key={c.rowNum} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <div className="font-extrabold text-slate-900">{c.nama}</div>
                        {masterRecord && (
                          <div className="text-[10px] font-mono font-bold text-blue-600">ID #{masterRecord.id}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-slate-800">{c.unit}</span> • <span className="text-slate-500">{c.sekup}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        {c.tanggalMulai} s/d {c.tanggalAkhir}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">{c.durasi} Hari</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <Check className="w-3 h-3 text-emerald-600" />
                          Lolos Seleksi
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {masterRecord ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            <ShieldCheck className="w-3 h-3 text-blue-600" />
                            Aktif di Database (#{masterRecord.id})
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Telah Disetujui</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 italic text-[11px]">
                        {c.catatan || 'Resmi lulus seleksi dan diangkat menjadi Pekerja Harian'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Modal Add Calon */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-xs">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Pendaftaran Calon Pekerja Baru</h3>
                <p className="text-[11px] text-slate-400">Pencatatan awal masa pelatihan &amp; orientasi</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Calon *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BAGUS KURNIAWAN"
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Proyeksi Unit</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Cengkeh">Cengkeh</option>
                    <option value="Blend">Blend</option>
                    <option value="Tembakau">Tembakau</option>
                    <option value="Krosok">Krosok</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Proyeksi Sekup</label>
                  <select
                    value={newSekup}
                    onChange={(e) => setNewSekup(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Proses">Proses</option>
                    <option value="Persediaan">Persediaan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={newMulai}
                    onChange={(e) => setNewMulai(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Akhir (Target)</label>
                  <input
                    type="date"
                    required
                    value={newAkhir}
                    onChange={(e) => setNewAkhir(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan / Rencana Penugasan</label>
                <textarea
                  rows={2}
                  placeholder="Misal: Pelatihan sortir daun tembakau / blender"
                  value={newCatatan}
                  onChange={(e) => setNewCatatan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Daftarkan Calon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Evaluasi Kelulusan */}
      {updatingCalon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-xs">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Evaluasi Kelulusan Calon Pekerja</h3>
                <p className="text-[11px] text-slate-400">Tentukan status akhir masa pelatihan</p>
              </div>
              <button 
                onClick={() => setUpdatingCalon(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="p-5 space-y-3.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-400 block">Nama Calon Pekerja:</span>
                <span className="text-sm font-extrabold text-slate-900">{updatingCalon.nama}</span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Unit: {updatingCalon.unit} • Sekup: {updatingCalon.sekup}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keputusan Evaluasi *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Lolos', 'Diperpanjang', 'Tidak Lolos'] as const).map(act => (
                    <button
                      key={act}
                      type="button"
                      onClick={() => setStatusAction(act)}
                      className={`py-2 px-1 rounded-xl font-bold text-xs border text-center transition-all ${
                        statusAction === act
                          ? act === 'Lolos' 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                            : act === 'Diperpanjang' 
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs' 
                              : 'bg-red-600 text-white border-red-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {act}
                    </button>
                  ))}
                </div>
              </div>

              {statusAction === 'Lolos' && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Otomatis Masuk ke Database Pekerja</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Pekerja akan otomatis mendapatkan nomor ID baru di <strong>MASTER_PEKERJA</strong> dan keluar dari daftar aktif calon pekerja.
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-900 mb-1">Status Kepegawaian</label>
                      <select
                        value={lolosStatusKep}
                        onChange={(e) => setLolosStatusKep(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white text-xs font-bold text-slate-800"
                      >
                        <option value="PKWT 1">PKWT 1</option>
                        <option value="PKWT 2">PKWT 2</option>
                        <option value="TETAP">TETAP</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-900 mb-1">Upah Harian (Rp)</label>
                      <input
                        type="number"
                        value={lolosUpah}
                        onChange={(e) => setLolosUpah(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white font-mono text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {statusAction === 'Diperpanjang' && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                  <label className="block font-bold text-amber-900">Tanggal Selesai Pelatihan Baru</label>
                  <input
                    type="date"
                    required
                    value={perpanjangTglBaru}
                    onChange={(e) => setPerpanjangTglBaru(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alasan / Catatan Penilaian</label>
                <textarea
                  rows={2}
                  placeholder="Catatan keaktifan, kedisiplinan, atau pertimbangan pengangkatan..."
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUpdatingCalon(null)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold disabled:opacity-50"
                >
                  {isSubmitting ? 'Memproses...' : 'Simpan Keputusan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
