import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Edit3, 
  X,
  Search,
  Filter,
  RotateCcw
} from 'lucide-react';
import { JadwalMutasiRecord } from '../../types';
import { useSystemDialog } from '../../context/SystemDialogContext';

interface TabJadwalMutasiProps {
  jadwalList: JadwalMutasiRecord[];
  onEditMutasi: (rowNum: number, data: { tanggalEfektif: string; nilaiBaru: string; keterangan: string }) => Promise<void>;
  onCancelMutasi: (rowNum: number, nama: string) => Promise<void>;
  isLoading: boolean;
}

export const TabJadwalMutasi: React.FC<TabJadwalMutasiProps> = ({
  jadwalList,
  onEditMutasi,
  onCancelMutasi,
  isLoading
}) => {
  const [editingMutasi, setEditingMutasi] = useState<JadwalMutasiRecord | null>(null);
  const [editTanggal, setEditTanggal] = useState('');
  const [editNilaiBaru, setEditNilaiBaru] = useState('');
  const [editKeterangan, setEditKeterangan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showConfirm } = useSystemDialog();

  // Inisialisasi filter tanggal default: '' (Transaksi Terkini / Semua Tanggal)
  // Menjamin tabel tidak pernah kosong saat pertama kali dibuka
  const [filterTanggal, setFilterTanggal] = useState<string>('');
  const [filterJenis, setFilterJenis] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const jenisOptions = useMemo(() => {
    const set = new Set<string>();
    jadwalList.forEach(item => {
      if (item.jenisMutasi) set.add(item.jenisMutasi);
    });
    return Array.from(set);
  }, [jadwalList]);

  // Saring data berdasarkan filter tanggal (default: '' = transaksi terkini), jenis, dan pencarian
  const displayedList = useMemo(() => {
    return jadwalList.filter(m => {
      // 1. Filter Tanggal: default '' menampilkan seluruh riwayat/rencana mutasi terkini
      if (filterTanggal) {
        const p = m.tanggalEfektif.split('/');
        const iso = p.length === 3 ? `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}` : m.tanggalEfektif;
        if (iso !== filterTanggal && m.tanggalEfektif !== filterTanggal) {
          return false;
        }
      }

      // 2. Filter Jenis Mutasi
      if (filterJenis && m.jenisMutasi !== filterJenis) {
        return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchNama = (m.nama || '').toLowerCase().includes(q);
        const matchKet = (m.keterangan || '').toLowerCase().includes(q);
        const matchNilai = (m.nilaiBaru || '').toLowerCase().includes(q);
        if (!matchNama && !matchKet && !matchNilai) return false;
      }

      return true;
    });
  }, [jadwalList, filterTanggal, filterJenis, searchQuery]);

  const hasActiveFilters = Boolean(filterTanggal || filterJenis || searchQuery.trim());

  const handleResetFilters = () => {
    setFilterTanggal('');
    setFilterJenis('');
    setSearchQuery('');
  };

  const handleOpenEdit = (m: JadwalMutasiRecord) => {
    setEditingMutasi(m);
    setEditNilaiBaru(m.nilaiBaru);
    setEditKeterangan(m.keterangan || '');
    // Convert dd/mm/yyyy to yyyy-mm-dd
    const p = m.tanggalEfektif.split('/');
    if (p.length === 3) {
      setEditTanggal(`${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`);
    } else {
      setEditTanggal(new Date().toISOString().slice(0, 10));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMutasi) return;

    setIsSubmitting(true);
    try {
      await onEditMutasi(editingMutasi.rowNum, {
        tanggalEfektif: editTanggal,
        nilaiBaru: editNilaiBaru,
        keterangan: editKeterangan
      });
      setEditingMutasi(null);
    } catch (err) {
      alert('Gagal mengedit mutasi terjadwal: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Policy Info Banner */}
      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-950 space-y-1.5 shadow-xs">
        <div className="font-extrabold text-blue-900 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-blue-600" />
          Mekanisme Penjadwalan Mutasi Masa Depan:
        </div>
        <p className="leading-relaxed">
          Mutasi dengan tanggal efektif di masa depan otomatis berstatus <strong>Terjadwal</strong> dan belum mengubah data induk di Database Pekerja. Sistem akan menerapkannya otomatis pada tanggal efektif (via pemicu waktu harian jam 01:00 dini hari).
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Header & Filter Controls */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Daftar Mutasi Terjadwal ({displayedList.length} dari {jadwalList.length})
              </h2>
              <p className="text-[11px] text-slate-500">Mutasi yang belum diterapkan ke Database Pekerja</p>
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-1.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Kembalikan ke transaksi terkini"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Semua / Terkini</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 cursor-pointer"
              >
                Export PDF
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
            {/* Filter Tanggal (Default: '' Transaksi Terkini) */}
            <div className="relative">
              <input
                type="date"
                value={filterTanggal}
                onChange={(e) => setFilterTanggal(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                title="Pilih tanggal khusus atau biarkan kosong untuk semua transaksi terkini"
              />
              {filterTanggal ? (
                <button
                  type="button"
                  onClick={() => setFilterTanggal('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  title="Kembalikan ke semua transaksi terkini"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none">
                  Terkini
                </span>
              )}
            </div>

            {/* Filter Jenis Mutasi */}
            <div>
              <select
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Semua Jenis Mutasi --</option>
                <option value="Unit">Unit</option>
                <option value="Sekup">Sekup</option>
                <option value="Status Kepegawaian">Status Kepegawaian</option>
                <option value="Upah Harian">Upah Harian</option>
                <option value="Pendidikan Terakhir">Pendidikan Terakhir</option>
                <option value="Akhir PKWT">Akhir PKWT</option>
                {jenisOptions.filter(j => !['Unit', 'Sekup', 'Status Kepegawaian', 'Upah Harian', 'Pendidikan Terakhir', 'Akhir PKWT'].includes(j)).map(j => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>

            {/* Pencarian Nama / Keterangan */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama pekerja / keterangan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Tanggal Efektif</th>
                <th className="py-2.5 px-3">Nama Pekerja</th>
                <th className="py-2.5 px-3">Jenis Mutasi</th>
                <th className="py-2.5 px-3">Nilai Lama</th>
                <th className="py-2.5 px-3">Nilai Baru</th>
                <th className="py-2.5 px-3">Keterangan</th>
                <th className="py-2.5 px-3">Diinput Oleh</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {displayedList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    {isLoading ? (
                      'Memuat data mutasi terjadwal...'
                    ) : hasActiveFilters ? (
                      <div className="space-y-1">
                        <p>Tidak ada mutasi yang cocok dengan kriteria filter saat ini.</p>
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                        >
                          Tampilkan seluruh transaksi mutasi terkini
                        </button>
                      </div>
                    ) : (
                      'Tidak ada mutasi yang sedang terjadwal saat ini.'
                    )}
                  </td>
                </tr>
              ) : (
                displayedList.map(m => (
                  <tr key={m.rowNum} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {m.tanggalEfektif}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{m.nama}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{m.jenisMutasi}</td>
                    <td className="py-2.5 px-3 text-slate-500">{m.nilaiLama || '-'}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">{m.nilaiBaru}</td>
                    <td className="py-2.5 px-3 text-slate-600">{m.keterangan || '-'}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">{m.diinputOleh || '-'}</td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            const ok = await showConfirm({
                              message: `Batalkan mutasi terjadwal untuk ${m.nama}?\nMutasi ini tidak akan diterapkan.`,
                              type: 'danger',
                              confirmLabel: 'Ya, Batalkan'
                            });
                            if (ok) {
                              onCancelMutasi(m.rowNum, m.nama);
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-semibold cursor-pointer"
                        >
                          Batalkan
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Edit Mutasi Modal - Always Centered */}
      {editingMutasi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="relative m-auto bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-xs">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Edit Mutasi: {editingMutasi.nama}</h3>
                <p className="text-[11px] text-slate-400">Jenis: {editingMutasi.jenisMutasi}</p>
              </div>
              <button 
                onClick={() => setEditingMutasi(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Efektif *</label>
                <input
                  type="date"
                  required
                  value={editTanggal}
                  onChange={(e) => setEditTanggal(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nilai Baru *</label>
                <input
                  type="text"
                  required
                  value={editNilaiBaru}
                  onChange={(e) => setEditNilaiBaru(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan / Alasan</label>
                <input
                  type="text"
                  value={editKeterangan}
                  onChange={(e) => setEditKeterangan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMutasi(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm cursor-pointer"
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
