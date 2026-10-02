import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowRightLeft, 
  AlertTriangle, 
  Clock, 
  X,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { PekerjaData } from '../../types';
import { exportPekerjaToCSV } from '../../utils/exportUtils';
import { getPKWTStatusInfo } from '../../utils/pkwtUtils';
import { Download } from 'lucide-react';

interface TabDatabasePekerjaProps {
  pekerjaList: PekerjaData[];
  currentScope: string;
  onAddPekerja: (data: Partial<PekerjaData>) => Promise<void>;
  onUpdatePekerja: (data: Partial<PekerjaData>) => Promise<void>;
  onDeletePekerja: (rowNum: number, nama: string) => Promise<void>;
  onSubmitMutasi: (data: {
    nama: string;
    jenisMutasi: string;
    tanggalEfektif: string;
    nilaiBaru: string;
    keterangan: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export const TabDatabasePekerja: React.FC<TabDatabasePekerjaProps> = ({
  pekerjaList,
  currentScope,
  onAddPekerja,
  onUpdatePekerja,
  onDeletePekerja,
  onSubmitMutasi,
  isLoading
}) => {
  const [search, setSearch] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('Semua');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPekerja, setEditingPekerja] = useState<PekerjaData | null>(null);
  const [mutasiTarget, setMutasiTarget] = useState<PekerjaData | null>(null);

  // Add Form
  const [newNama, setNewNama] = useState('');
  const [newUnit, setNewUnit] = useState('Cengkeh');
  const [newSekup, setNewSekup] = useState('Proses');
  const [newStatus, setNewStatus] = useState('PKWT 1');
  const [newUpah, setNewUpah] = useState('146263.92');
  const [newPendidikan, setNewPendidikan] = useState('SMA/SMK');
  const [newAwalPKWT, setNewAwalPKWT] = useState('');
  const [newAkhirPKWT, setNewAkhirPKWT] = useState('');

  // Mutasi Form
  const [mutasiJenis, setMutasiJenis] = useState('Unit');
  const [mutasiTanggal, setMutasiTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [mutasiNilaiBaru, setMutasiNilaiBaru] = useState('Blend');
  const [mutasiKeterangan, setMutasiKeterangan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // PKWT Alerts: Akhir PKWT expiring in <= 26 days (synchronized)
  const pkwtAlerts = pekerjaList.filter(p => {
    return getPKWTStatusInfo(p.status, p.akhirPKWT).isUrgent;
  });

  const expiredAlerts = pekerjaList.filter(p => {
    return getPKWTStatusInfo(p.status, p.akhirPKWT).isExpired;
  });

  const filtered = pekerjaList.filter(p => {
    const matchScope = currentScope === 'ALL' || p.unitSekup === currentScope;
    const matchUnit = selectedUnit === 'Semua' || p.unit === selectedUnit;
    const matchSearch = !search || 
      p.nama.toLowerCase().includes(search.toLowerCase()) || 
      p.jabatan.toLowerCase().includes(search.toLowerCase()) ||
      String(p.id).includes(search);
    return matchScope && matchUnit && matchSearch;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama) {
      alert('Nama pekerja wajib diisi.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onAddPekerja({
        nama: newNama,
        unit: newUnit,
        sekup: newSekup,
        status: newStatus,
        upahHarian: parseFloat(newUpah) || 0,
        pendidikanTerakhir: newPendidikan,
        awalPKWT: newAwalPKWT,
        akhirPKWT: newAkhirPKWT
      });
      setShowAddModal(false);
      setNewNama('');
    } catch (err) {
      alert('Gagal menambah pekerja: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPekerja) return;
    setIsSubmitting(true);
    try {
      await onUpdatePekerja({
        rowNum: editingPekerja.rowNum,
        unit: editingPekerja.unit,
        sekup: editingPekerja.sekup,
        status: editingPekerja.status,
        upahHarian: Number(editingPekerja.upahHarian) || 0,
        pendidikanTerakhir: editingPekerja.pendidikanTerakhir,
        awalPKWT: editingPekerja.awalPKWT,
        akhirPKWT: editingPekerja.akhirPKWT
      });
      setEditingPekerja(null);
    } catch (err) {
      alert('Gagal mengupdate pekerja: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMutasiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mutasiTarget || !mutasiTanggal) {
      alert('Tanggal efektif wajib diisi.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmitMutasi({
        nama: mutasiTarget.nama,
        jenisMutasi: mutasiJenis,
        tanggalEfektif: mutasiTanggal,
        nilaiBaru: mutasiNilaiBaru,
        keterangan: mutasiKeterangan
      });
      setMutasiTarget(null);
      setMutasiKeterangan('');
    } catch (err) {
      alert('Gagal mengajukan mutasi: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Alert Card if PKWT <= 26 days */}
      {pkwtAlerts.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 text-xs text-amber-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Peringatan: {pkwtAlerts.length} Pekerja dengan Status PKWT Segera Berakhir (&le; 26 Hari)</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {pkwtAlerts.slice(0, 6).map(p => (
              <span key={p.id} className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 font-medium text-amber-950">
                {p.nama} ({p.unit}) — Akhir: <strong>{p.akhirPKWT}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Alert Card if PKWT Expired */}
      {expiredAlerts.length > 0 && (
        <div className="p-4 bg-red-50 rounded-2xl border border-red-300 text-xs text-red-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-red-900">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Perhatian: {expiredAlerts.length} Pekerja dengan Tanggal Akhir PKWT Telah Terlewat (Perlu Pembaruan)</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {expiredAlerts.slice(0, 6).map(p => (
              <span key={p.id} className="px-2.5 py-1 rounded-lg bg-white border border-red-300 font-medium text-red-900">
                {p.nama} ({p.unit}) — Akhir: <strong>{p.akhirPKWT}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, ID, atau jabatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none"
          >
            <option value="Semua">Semua Unit</option>
            <option value="Cengkeh">Cengkeh</option>
            <option value="Blend">Blend</option>
            <option value="Tembakau">Tembakau</option>
            <option value="Krosok">Krosok</option>
          </select>

          <button
            onClick={() => exportPekerjaToCSV(filtered)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors"
            title="Unduh seluruh data pekerja ini ke file Excel / CSV"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Unduh CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            + Pekerja Baru
          </button>
        </div>

      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold text-slate-800">
            Database Induk Pekerja Harian ({filtered.length} Terdaftar)
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Tab Sheet: MASTER_PEKERJA
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">No / ID</th>
                <th className="py-2.5 px-3">Nama Pekerja</th>
                <th className="py-2.5 px-3">Unit &amp; Sekup</th>
                <th className="py-2.5 px-3">Status Kepegawaian</th>
                <th className="py-2.5 px-3 text-right">Upah Harian</th>
                <th className="py-2.5 px-3">Akhir PKWT</th>
                <th className="py-2.5 px-3">Status Kontrak</th>
                <th className="py-2.5 px-3 text-center">Pendidikan</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map(p => {
                const pkwtInfo = getPKWTStatusInfo(p.status, p.akhirPKWT);

                return (
                  <tr key={p.rowNum} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-500">#{p.id}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-extrabold text-slate-900">{p.nama}</div>
                      <div className="text-[10px] text-slate-400">{p.jabatan || 'Harian'}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-medium text-slate-800">{p.unit}</span>
                      <span className="text-slate-400 block text-[11px]">{p.sekup}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'TETAP' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      Rp {Math.round(p.upahHarian).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {p.status === 'TETAP' ? (
                        <span className="text-slate-400 text-[11px] italic">TETAP</span>
                      ) : (
                        <span className={`font-mono font-bold ${
                          pkwtInfo.isUrgent ? 'text-amber-700' : pkwtInfo.isExpired ? 'text-red-600' : 'text-slate-700'
                        }`}>
                          {p.akhirPKWT}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border ${pkwtInfo.badgeColor}`}>
                        <span>{pkwtInfo.statusText}</span>
                        {pkwtInfo.statusText !== 'TETAP' && pkwtInfo.statusText !== '-' && (
                          <span className="font-normal opacity-85 text-[9px]">({pkwtInfo.labelDetail})</span>
                        )}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-medium">
                      {p.pendidikanTerakhir || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingPekerja(p)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setMutasiTarget(p);
                            setMutasiJenis('Unit');
                            setMutasiNilaiBaru('Blend');
                          }}
                          className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold"
                        >
                          Mutasi
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus ${p.nama} dari Database Pekerja? Data akan dikosongkan dan salinannya disimpan ke LOG_RIWAYAT_HAPUS_PEKERJA.`)) {
                              onDeletePekerja(p.rowNum, p.nama);
                            }
                          }}
                          className="p-1 rounded bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-700"
                          title="Hapus Pekerja (Arsip)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal Add Pekerja */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-xs">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Tambah Pekerja Baru</h3>
                <p className="text-[11px] text-slate-400">ID nomor urut dihitung otomatis</p>
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
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: AHMAD MAULANA"
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit *</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  >
                    <option value="Cengkeh">Cengkeh</option>
                    <option value="Blend">Blend</option>
                    <option value="Tembakau">Tembakau</option>
                    <option value="Krosok">Krosok</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sekup *</label>
                  <select
                    value={newSekup}
                    onChange={(e) => setNewSekup(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  >
                    <option value="Proses">Proses</option>
                    <option value="Persediaan">Persediaan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Kepegawaian</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  >
                    <option value="PKWT 1">PKWT 1</option>
                    <option value="PKWT 2">PKWT 2</option>
                    <option value="TETAP">TETAP</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Upah Harian (Rp)</label>
                  <input
                    type="number"
                    step="any"
                    value={newUpah}
                    onChange={(e) => setNewUpah(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pendidikan Terakhir</label>
                <select
                  value={newPendidikan}
                  onChange={(e) => setNewPendidikan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA/SMK">SMA/SMK</option>
                  <option value="D1">D1</option>
                  <option value="D2">D2</option>
                  <option value="D3">D3</option>
                  <option value="D4">D4</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                  <option value="S3">S3</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Awal PKWT</label>
                  <input
                    type="date"
                    value={newAwalPKWT}
                    onChange={(e) => setNewAwalPKWT(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Akhir PKWT</label>
                  <input
                    type="date"
                    value={newAkhirPKWT}
                    onChange={(e) => setNewAkhirPKWT(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
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
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Pekerja'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Pekerja */}
      {editingPekerja && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-xs">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Edit Pekerja: {editingPekerja.nama}</h3>
                <p className="text-[11px] text-slate-400">ID #{editingPekerja.id} • Baris ke-{editingPekerja.rowNum}</p>
              </div>
              <button 
                onClick={() => setEditingPekerja(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-3.5">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit</label>
                  <select
                    value={editingPekerja.unit}
                    onChange={(e) => setEditingPekerja({ ...editingPekerja, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  >
                    <option value="Cengkeh">Cengkeh</option>
                    <option value="Blend">Blend</option>
                    <option value="Tembakau">Tembakau</option>
                    <option value="Krosok">Krosok</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sekup</label>
                  <select
                    value={editingPekerja.sekup}
                    onChange={(e) => setEditingPekerja({ ...editingPekerja, sekup: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  >
                    <option value="Proses">Proses</option>
                    <option value="Persediaan">Persediaan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Kepegawaian</label>
                  <select
                    value={editingPekerja.status}
                    onChange={(e) => setEditingPekerja({ ...editingPekerja, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  >
                    <option value="PKWT 1">PKWT 1</option>
                    <option value="PKWT 2">PKWT 2</option>
                    <option value="TETAP">TETAP</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Upah Harian (Rp)</label>
                  <input
                    type="number"
                    step="any"
                    value={editingPekerja.upahHarian}
                    onChange={(e) => setEditingPekerja({ ...editingPekerja, upahHarian: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pendidikan Terakhir</label>
                <select
                  value={editingPekerja.pendidikanTerakhir || 'SMA/SMK'}
                  onChange={(e) => setEditingPekerja({ ...editingPekerja, pendidikanTerakhir: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA/SMK">SMA/SMK</option>
                  <option value="D1">D1</option>
                  <option value="D2">D2</option>
                  <option value="D3">D3</option>
                  <option value="D4">D4</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                  <option value="S3">S3</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Awal PKWT</label>
                  <input
                    type="date"
                    value={editingPekerja.awalPKWT || ''}
                    onChange={(e) => setEditingPekerja({ ...editingPekerja, awalPKWT: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Akhir PKWT</label>
                  <input
                    type="date"
                    value={editingPekerja.akhirPKWT || ''}
                    onChange={(e) => setEditingPekerja({ ...editingPekerja, akhirPKWT: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPekerja(null)}
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

      {/* Modal Mutasi Pekerja */}
      {mutasiTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-xs">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Mutasi / Rotasi: {mutasiTarget.nama}</h3>
                <p className="text-[11px] text-slate-400">Efektif hari ini &rarr; langsung diterapkan; Masa depan &rarr; terjadwal</p>
              </div>
              <button 
                onClick={() => setMutasiTarget(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMutasiSubmit} className="p-5 space-y-3.5">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Mutasi *</label>
                  <select
                    value={mutasiJenis}
                    onChange={(e) => {
                      setMutasiJenis(e.target.value);
                      if (e.target.value === 'Unit') setMutasiNilaiBaru('Blend');
                      else if (e.target.value === 'Sekup') setMutasiNilaiBaru('Persediaan');
                      else if (e.target.value === 'Status Kepegawaian') setMutasiNilaiBaru('TETAP');
                      else if (e.target.value === 'Pendidikan Terakhir') setMutasiNilaiBaru('S1');
                      else setMutasiNilaiBaru('');
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  >
                    <option value="Unit">Unit (Sekup tetap)</option>
                    <option value="Sekup">Sekup (Unit tetap)</option>
                    <option value="Jabatan/Lingkup">Jabatan/Lingkup</option>
                    <option value="Status Kepegawaian">Status Kepegawaian</option>
                    <option value="Upah Harian">Upah Harian</option>
                    <option value="Pendidikan Terakhir">Pendidikan Terakhir</option>
                    <option value="Awal PKWT">Awal PKWT</option>
                    <option value="Akhir PKWT">Akhir PKWT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Efektif *</label>
                  <input
                    type="date"
                    required
                    value={mutasiTanggal}
                    onChange={(e) => setMutasiTanggal(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nilai Baru *</label>
                {mutasiJenis === 'Unit' ? (
                  <select
                    value={mutasiNilaiBaru}
                    onChange={(e) => setMutasiNilaiBaru(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    <option value="Cengkeh">Cengkeh</option>
                    <option value="Blend">Blend</option>
                    <option value="Tembakau">Tembakau</option>
                    <option value="Krosok">Krosok</option>
                  </select>
                ) : mutasiJenis === 'Sekup' ? (
                  <select
                    value={mutasiNilaiBaru}
                    onChange={(e) => setMutasiNilaiBaru(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    <option value="Proses">Proses</option>
                    <option value="Persediaan">Persediaan</option>
                  </select>
                ) : mutasiJenis === 'Status Kepegawaian' ? (
                  <select
                    value={mutasiNilaiBaru}
                    onChange={(e) => setMutasiNilaiBaru(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    <option value="PKWT 1">PKWT 1</option>
                    <option value="PKWT 2">PKWT 2</option>
                    <option value="TETAP">TETAP</option>
                  </select>
                ) : mutasiJenis === 'Awal PKWT' || mutasiJenis === 'Akhir PKWT' ? (
                  <input
                    type="date"
                    required
                    value={mutasiNilaiBaru}
                    onChange={(e) => setMutasiNilaiBaru(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nilai baru..."
                    value={mutasiNilaiBaru}
                    onChange={(e) => setMutasiNilaiBaru(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan / Alasan</label>
                <input
                  type="text"
                  placeholder="Contoh: Rotasi unit produksi, promosi, dsb"
                  value={mutasiKeterangan}
                  onChange={(e) => setMutasiKeterangan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMutasiTarget(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Mutasi'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
