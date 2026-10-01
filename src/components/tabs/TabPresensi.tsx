import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { PresensiIjinRecord, PekerjaData, SuratIjinData } from '../../types';

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
  isLoading
}) => {
  const [selectedBulan, setSelectedBulan] = useState(String(new Date().getMonth() + 1));
  const [selectedTahun, setSelectedTahun] = useState(String(new Date().getFullYear()));
  const [selectedNama, setSelectedNama] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PresensiIjinRecord | null>(null);

  // Form Add State
  const [addNama, setAddNama] = useState('');
  const [addTglAwal, setAddTglAwal] = useState(new Date().toISOString().slice(0, 10));
  const [addTglAkhir, setAddTglAkhir] = useState('');
  const [addJenisIjin, setAddJenisIjin] = useState(jenisIjinList[0] || 'Ijin Terlambat');
  const [addSehariPenuh, setAddSehariPenuh] = useState(false);
  const [addJamAwal, setAddJamAwal] = useState('08:00');
  const [addJamAkhir, setAddJamAkhir] = useState('16:00');
  const [addKeperluan, setAddKeperluan] = useState('');
  const [addLampiran, setAddLampiran] = useState('Tidak');
  const [addCatatan, setAddCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter pekerja according to current scope
  const filteredPekerja = pekerjaList.filter(p => {
    return currentScope === 'ALL' || p.unitSekup === currentScope;
  });

  const handleApplyFilter = () => {
    onFilterChange(selectedBulan, selectedTahun, selectedNama);
  };

  const handleOpenAdd = () => {
    if (filteredPekerja.length > 0) {
      setAddNama(filteredPekerja[0].nama);
    }
    setAddTglAwal(new Date().toISOString().slice(0, 10));
    setAddTglAkhir('');
    setAddSehariPenuh(false);
    setAddJamAwal('08:00');
    setAddJamAkhir('16:00');
    setAddKeperluan('');
    setAddLampiran('Tidak');
    setAddCatatan('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (rec: PresensiIjinRecord) => {
    setEditingRecord(rec);
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
          if (day === 6) { // Saturday 08:00 - 13:00
            jamAwal = '08:00';
            jamAkhir = '13:00';
          } else if (day === 5) { // Friday 08:00 - 16:30
            jamAwal = '08:00';
            jamAkhir = '16:30';
          } else { // Mon - Thu 08:00 - 16:00
            jamAwal = '08:00';
            jamAkhir = '16:00';
          }
        }

        tanggalList.push({ tanggal: dateIso, jamAwal, jamAkhir });
      }
      cur.setDate(cur.getDate() + 1);
    }

    if (tanggalList.length === 0) {
      alert('Tidak ada hari kerja dalam rentang tanggal yang dipilih (semua hari Minggu).');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddPresensi({
        nama: addNama,
        jenisIjin: addJenisIjin,
        keperluan: addKeperluan,
        lampiran: addLampiran,
        catatan: addCatatan,
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
        catatan: editingRecord.catatan
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

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Ijin
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              Export PDF
            </button>
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
        
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold text-slate-800">
            Daftar Ijin / Ketidakhadiran Tercatat ({presensiList.length} Entri)
          </span>
          <span className="text-[11px] font-mono text-slate-400">
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
              {presensiList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    {isLoading ? 'Sedang memuat data langsung dari spreadsheet...' : 'Belum ada data ijin tercatat pada filter ini.'}
                  </td>
                </tr>
              ) : (
                presensiList.map((r) => {
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
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                            title="Buka &amp; Cetak Surat Permohonan Ijin"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(r)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                            title="Edit Data Ijin"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus data ijin ${r.nama} pada tanggal ${r.tanggal}? Salinan akan disimpan ke arsip.`)) {
                                onDeletePresensi(r.rowNum);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-700 transition-colors"
                            title="Hapus Data Ijin"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Modal Add Ijin */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-xs">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Catat Ijin / Ketidakhadiran Pekerja</h3>
                <p className="text-[11px] text-slate-400">Faktor potongan otomatis terhitung di backend</p>
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
                    onChange={(e) => setAddTglAwal(e.target.value)}
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Ijin *</label>
                <select
                  value={addJenisIjin}
                  onChange={(e) => setAddJenisIjin(e.target.value)}
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
                    onChange={(e) => setAddSehariPenuh(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Sehari Penuh (Jam otomatis terisi sesuai hari, Sabtu jam lebih pendek)</span>
                </label>
              </div>

              {!addSehariPenuh && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jam Awal</label>
                    <input
                      type="time"
                      value={addJamAwal}
                      onChange={(e) => setAddJamAwal(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jam Akhir</label>
                    <input
                      type="time"
                      value={addJamAkhir}
                      onChange={(e) => setAddJamAkhir(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    />
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

      {/* Modal Edit Ijin */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-xs">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Edit Ijin: {editingRecord.nama}</h3>
                <p className="text-[11px] text-slate-400">Baris ke-{editingRecord.rowNum} di LOG_PRESENSI_IJIN</p>
              </div>
              <button 
                onClick={() => setEditingRecord(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-3.5">
              
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Awal</label>
                  <input
                    type="time"
                    value={editingRecord.jamAwal && editingRecord.jamAwal !== '-' ? editingRecord.jamAwal : ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, jamAwal: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Akhir</label>
                  <input
                    type="time"
                    value={editingRecord.jamAkhir && editingRecord.jamAkhir !== '-' ? editingRecord.jamAkhir : ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, jamAkhir: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
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
