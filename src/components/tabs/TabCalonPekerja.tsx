import React, { useState } from 'react';
import { 
  UserCheck, 
  Plus, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  X, 
  Printer 
} from 'lucide-react';
import { CalonPekerjaRecord } from '../../types';

interface TabCalonPekerjaProps {
  calonList: CalonPekerjaRecord[];
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
  currentScope,
  onAddCalon,
  onUpdateStatusCalon,
  isLoading
}) => {
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

  const filtered = calonList.filter(c => {
    return currentScope === 'ALL' || `${c.sekup} ${c.unit}` === currentScope;
  });

  const alerts = filtered.filter(c => {
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
        awalPKWT: new Date().toISOString().slice(0, 10),
        tanggalAkhirBaru: perpanjangTglBaru,
        alasan
      });
      setUpdatingCalon(null);
      setAlasan('');
    } catch (err) {
      alert('Gagal memproses status: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Policy Info Banner */}
      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1.5 shadow-xs">
        <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          Alur Masa Pelatihan &amp; Seleksi Calon Pekerja:
        </div>
        <p className="leading-relaxed">
          Setiap calon pekerja menjalani masa pelatihan. Status <strong>Lolos</strong> otomatis memindahkan data ke <code>MASTER_PEKERJA</code> dan mengosongkan baris calon untuk mencegah penambahan ganda. Status <strong>Diperpanjang</strong> menambah tanggal akhir, dan <strong>Tidak Lolos</strong> mencatat riwayat ke log arsip.
        </p>
      </div>

      {/* Alert Banner for Calon Ending Soon */}
      {alerts.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Peringatan: {alerts.length} Calon Pekerja dengan Masa Pelatihan Akan Berakhir (&lt; 10 Hari)</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {alerts.map(c => (
              <span key={c.rowNum} className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 font-medium">
                {c.nama} ({c.unit}) — Sisa: <strong>{c.sisaHari} Hari</strong> (Akhir: {c.tanggalAkhir})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Daftar Calon Pekerja ({filtered.length})</h2>
            <p className="text-[11px] text-slate-500">Masa pelatihan dan evaluasi kelulusan</p>
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

        <div className="overflow-x-auto">
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                    {isLoading ? 'Memuat daftar calon pekerja...' : 'Belum ada calon pekerja dalam masa pelatihan saat ini.'}
                  </td>
                </tr>
              ) : (
                filtered.map(c => {
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
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition-colors"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal Add Calon */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-xs">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Daftarkan Calon Pekerja Baru</h3>
                <p className="text-[11px] text-slate-400">Periode masa pelatihan seleksi</p>
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
                <label className="block font-bold text-slate-700 mb-1">Nama Calon *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: RIZKI PRATAMA"
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
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
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
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  >
                    <option value="Proses">Proses</option>
                    <option value="Persediaan">Persediaan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Mulai Pelatihan *</label>
                  <input
                    type="date"
                    required
                    value={newMulai}
                    onChange={(e) => setNewMulai(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Akhir Pelatihan *</label>
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
                <label className="block font-bold text-slate-700 mb-1">Catatan</label>
                <input
                  type="text"
                  placeholder="Catatan pelamar / pelatihan..."
                  value={newCatatan}
                  onChange={(e) => setNewCatatan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
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
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Daftarkan Calon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Update Status Calon */}
      {updatingCalon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-xs">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Evaluasi Kelulusan: {updatingCalon.nama}</h3>
                <p className="text-[11px] text-slate-400">Unit: {updatingCalon.unit} - {updatingCalon.sekup}</p>
              </div>
              <button 
                onClick={() => setUpdatingCalon(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="p-5 space-y-3.5">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">Keputusan Status *</label>
                <select
                  value={statusAction}
                  onChange={(e) => setStatusAction(e.target.value as 'Lolos' | 'Diperpanjang' | 'Tidak Lolos')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
                >
                  <option value="Lolos">Lolos (Otomatis Masuk ke Database Pekerja)</option>
                  <option value="Diperpanjang">Diperpanjang (Tambah Masa Pelatihan)</option>
                  <option value="Tidak Lolos">Tidak Lolos (Arsipkan &amp; Kosongkan Baris)</option>
                </select>
              </div>

              {statusAction === 'Lolos' && (
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
                  <div className="font-bold text-emerald-900">Parameter Tambah ke Database Pekerja:</div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-emerald-950 mb-1">Status Kepegawaian</label>
                      <select
                        value={lolosStatusKep}
                        onChange={(e) => setLolosStatusKep(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded border border-emerald-300 bg-white"
                      >
                        <option value="PKWT 1">PKWT 1</option>
                        <option value="PKWT 2">PKWT 2</option>
                        <option value="TETAP">TETAP</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-emerald-950 mb-1">Upah Harian (Rp)</label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={lolosUpah}
                        onChange={(e) => setLolosUpah(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded border border-emerald-300 bg-white font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {statusAction === 'Diperpanjang' && (
                <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 space-y-3">
                  <div>
                    <label className="block font-semibold text-blue-950 mb-1">Tanggal Akhir Pelatihan Baru *</label>
                    <input
                      type="date"
                      required
                      value={perpanjangTglBaru}
                      onChange={(e) => setPerpanjangTglBaru(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-blue-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-blue-950 mb-1">Alasan Perpanjangan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Perlu peningkatan keterampilan sortir"
                      value={alasan}
                      onChange={(e) => setAlasan(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-blue-300 bg-white"
                    />
                  </div>
                </div>
              )}

              {statusAction === 'Tidak Lolos' && (
                <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 space-y-2">
                  <div className="font-bold text-red-900">Alasan Tidak Lolos *:</div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kriteria ketepatan dan disiplin belum memenuhi standar"
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-red-300 bg-white"
                  />
                  <p className="text-[10px] text-red-700 italic">
                    * Baris calon pekerja ini akan dikosongkan dari daftar, dan catatan riwayat tersimpan di LOG_RIWAYAT_PELATIHAN.
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUpdatingCalon(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm"
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
