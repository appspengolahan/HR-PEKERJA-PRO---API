import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  Calendar, 
  Edit3, 
  XCircle, 
  Clock, 
  X,
  Printer
} from 'lucide-react';
import { JadwalMutasiRecord } from '../../types';

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

  const handleOpenEdit = (m: JadwalMutasiRecord) => {
    setEditingMutasi(m);
    setEditNilaiBaru(m.nilaiBaru);
    setEditKeterangan(m.keterangan || '');
    // Convert dd/mm/yyyy to yyyy-mm-dd
    const p = m.tanggalEfektif.split('/');
    if (p.length === 3) {
      setEditTanggal(`${p[2]}-${p[1]}-${p[0]}`);
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
        
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Daftar Mutasi Terjadwal ({jadwalList.length})</h2>
            <p className="text-[11px] text-slate-500">Mutasi yang belum diterapkan ke Database Pekerja</p>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200"
          >
            Export PDF
          </button>
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
              {jadwalList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    {isLoading ? 'Memuat data mutasi terjadwal...' : 'Tidak ada mutasi yang sedang terjadwal saat ini.'}
                  </td>
                </tr>
              ) : (
                jadwalList.map(m => (
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
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Batalkan mutasi terjadwal untuk ${m.nama}? Mutasi ini tidak akan diterapkan.`)) {
                              onCancelMutasi(m.rowNum, m.nama);
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-semibold"
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

      {/* Edit Mutasi Modal */}
      {editingMutasi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-xs">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Edit Mutasi: {editingMutasi.nama}</h3>
                <p className="text-[11px] text-slate-400">Jenis: {editingMutasi.jenisMutasi}</p>
              </div>
              <button 
                onClick={() => setEditingMutasi(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
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
