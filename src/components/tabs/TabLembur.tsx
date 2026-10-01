import React, { useState } from 'react';
import { 
  Clock, 
  Plus, 
  Search, 
  Printer, 
  DollarSign, 
  Filter, 
  CheckSquare, 
  Square,
  AlertCircle
} from 'lucide-react';
import { LemburRecord, PekerjaData } from '../../types';
import { exportLemburToCSV } from '../../utils/exportUtils';
import { Download } from 'lucide-react';

interface TabLemburProps {
  lemburList: LemburRecord[];
  pekerjaList: PekerjaData[];
  currentScope: string;
  onSaveLemburBatch: (data: {
    tanggal: string;
    namaList: string[];
    kategori: string;
    jamMulai: string;
    jamSelesai: string;
  }) => Promise<void>;
  onFilterRekap: (tglAwal: string, tglAkhir: string, unit: string, sekup: string) => void;
  isLoading: boolean;
}

export const TabLembur: React.FC<TabLemburProps> = ({
  lemburList,
  pekerjaList,
  currentScope,
  onSaveLemburBatch,
  onFilterRekap,
  isLoading
}) => {
  // Form State
  const [tglLembur, setTglLembur] = useState(new Date().toISOString().slice(0, 10));
  const [kategori, setKategori] = useState('Hari Kerja');
  const [jamMulai, setJamMulai] = useState('16:30');
  const [jamSelesai, setJamSelesai] = useState('19:30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Multi-select checklist with persistent Set
  const [checkedSet, setCheckedSet] = useState<Set<string>>(new Set());
  const [searchName, setSearchName] = useState('');
  const [filterUnit, setFilterUnit] = useState('Semua');
  const [filterSekup, setFilterSekup] = useState('Semua');

  // Filter Rekap State
  const [rekapTglAwal, setRekapTglAwal] = useState('');
  const [rekapTglAkhir, setRekapTglAkhir] = useState('');
  const [rekapUnit, setRekapUnit] = useState('Semua');
  const [rekapSekup, setRekapSekup] = useState('Semua');

  // Filter workers available in current scope
  const availableWorkers = pekerjaList.filter(p => {
    return currentScope === 'ALL' || p.unitSekup === currentScope;
  });

  // Filtered workers for display in the checklist
  const displayedWorkers = availableWorkers.filter(p => {
    const matchUnit = filterUnit === 'Semua' || p.unit === filterUnit;
    const matchSekup = filterSekup === 'Semua' || p.sekup === filterSekup;
    const matchSearch = !searchName || p.nama.toLowerCase().includes(searchName.toLowerCase());
    return matchUnit && matchSekup && matchSearch;
  });

  const toggleCheck = (nama: string) => {
    setCheckedSet(prev => {
      const next = new Set(prev);
      if (next.has(nama)) next.delete(nama);
      else next.add(nama);
      return next;
    });
  };

  const selectAllDisplayed = () => {
    setCheckedSet(prev => {
      const next = new Set(prev);
      displayedWorkers.forEach(p => next.add(p.nama));
      return next;
    });
  };

  const clearAllSelected = () => {
    setCheckedSet(new Set());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const namaList = Array.from(checkedSet);

    if (namaList.length === 0) {
      alert('Pilih minimal 1 pekerja pada checklist di bawah.');
      return;
    }
    if (!tglLembur || !jamMulai || !jamSelesai) {
      alert('Tanggal, Jam Mulai, dan Jam Selesai wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveLemburBatch({
        tanggal: tglLembur,
        namaList,
        kategori,
        jamMulai,
        jamSelesai
      });
      setCheckedSet(new Set());
      alert(`Berhasil menyimpan lembur untuk ${namaList.length} pekerja!`);
    } catch (err) {
      alert('Gagal mencatat lembur: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyRekapFilter = () => {
    onFilterRekap(rekapTglAwal, rekapTglAkhir, rekapUnit, rekapSekup);
  };

  const totalNominal = lemburList.reduce((acc, c) => acc + (Number(c.nominal) || 0), 0);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Overtime Policy Info Banner */}
      <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200/80 text-xs text-indigo-950 space-y-1.5 shadow-xs">
        <div className="font-extrabold text-indigo-900 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-indigo-600" />
          Ketentuan Perhitungan Lembur Pekerja Harian (Bertingkat):
        </div>
        <p className="leading-relaxed">
          Dasar upah per jam = <strong>Upah Harian ÷ 8</strong>. Khusus <strong>Hari Kerja</strong>: Jam ke-1 (1,5×), Jam ke-2 (2×), Jam ke-3 dst (3×). Kategori <strong>Hari Libur / Tanggal Merah</strong>: rate tunggal 2× untuk semua jam.
        </p>
      </div>

      {/* Input Lembur Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">Catat Lembur Multi-Pekerja Sekaligus</h2>
          <p className="text-xs text-slate-500">Centang beberapa nama sekaligus untuk penugasan lembur seragam</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal Lembur *</label>
              <input
                type="date"
                required
                value={tglLembur}
                onChange={(e) => setTglLembur(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kategori Hari *</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
              >
                <option value="Hari Kerja">Hari Kerja (Bertingkat 1,5x / 2x / 3x)</option>
                <option value="Hari Libur">Hari Libur (Rate Tunggal 2x)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Jam Mulai</label>
              <input
                type="time"
                required
                value={jamMulai}
                onChange={(e) => setJamMulai(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Jam Selesai</label>
              <input
                type="time"
                required
                value={jamSelesai}
                onChange={(e) => setJamSelesai(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
              />
            </div>
          </div>

          {/* Checklist Box Area */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/60 space-y-3">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
              <span className="font-bold text-slate-800">
                Pilih Pekerja ({checkedSet.size} terpilih):
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllDisplayed}
                  className="text-[11px] font-semibold text-blue-600 hover:underline"
                >
                  Pilih Semua yang Tampil
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={clearAllSelected}
                  className="text-[11px] font-semibold text-slate-500 hover:underline"
                >
                  Hapus Pilihan
                </button>
              </div>
            </div>

            {/* Quick Filters for checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Cari nama pekerja..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
              <select
                value={filterUnit}
                onChange={(e) => setFilterUnit(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="Semua">Semua Unit</option>
                <option value="Cengkeh">Cengkeh</option>
                <option value="Blend">Blend</option>
                <option value="Tembakau">Tembakau</option>
                <option value="Krosok">Krosok</option>
              </select>
              <select
                value={filterSekup}
                onChange={(e) => setFilterSekup(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="Semua">Semua Sekup</option>
                <option value="Proses">Proses</option>
                <option value="Persediaan">Persediaan</option>
              </select>
            </div>

            {/* Scrollable workers grid */}
            <div className="max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 pr-1">
              {displayedWorkers.map(p => {
                const isChecked = checkedSet.has(p.nama);
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleCheck(p.nama)}
                    className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                      isChecked 
                        ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold' 
                        : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                    <span className="truncate">{p.nama}</span>
                    <span className="text-[10px] text-slate-400 font-mono ml-auto flex-shrink-0">
                      {p.unit.slice(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting || checkedSet.size === 0}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? 'Menyimpan...' : `Simpan Lembur (${checkedSet.size} Pekerja)`}
            </button>
          </div>

        </form>

      </div>

      {/* Filter Rekap Lembur */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Rekapitulasi Riwayat Lembur</h2>
            <p className="text-xs text-slate-500">Filter berdasarkan rentang tanggal, unit, atau sekup</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportLemburToCSV(lemburList)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200"
              title="Unduh riwayat lembur ke CSV"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh CSV
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Rekap
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
          <div>
            <label className="block text-slate-500 font-bold mb-1">Tanggal Awal</label>
            <input
              type="date"
              value={rekapTglAwal}
              onChange={(e) => setRekapTglAwal(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-500 font-bold mb-1">Tanggal Akhir</label>
            <input
              type="date"
              value={rekapTglAkhir}
              onChange={(e) => setRekapTglAkhir(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-500 font-bold mb-1">Unit</label>
            <select
              value={rekapUnit}
              onChange={(e) => setRekapUnit(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
            >
              <option value="Semua">-- Semua Unit --</option>
              <option value="Cengkeh">Cengkeh</option>
              <option value="Blend">Blend</option>
              <option value="Tembakau">Tembakau</option>
              <option value="Krosok">Krosok</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-500 font-bold mb-1">Sekup</label>
            <select
              value={rekapSekup}
              onChange={(e) => setRekapSekup(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
            >
              <option value="Semua">-- Semua Sekup --</option>
              <option value="Proses">Proses</option>
              <option value="Persediaan">Persediaan</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleApplyRekapFilter}
              disabled={isLoading}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              {isLoading ? 'Memuat...' : 'Tampilkan'}
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase">Jumlah Kejadian Lembur:</span>
            <div className="text-xl font-black text-slate-900 font-mono">{lemburList.length} Entri</div>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Akumulasi Nominal:</span>
            <div className="text-xl font-black text-emerald-700 font-mono">
              Rp {totalNominal.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Lembur Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Nama Pekerja</th>
                <th className="py-2.5 px-3">Unit / Sekup</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3 text-center">Jam</th>
                <th className="py-2.5 px-3 text-center">Durasi</th>
                <th className="py-2.5 px-3 text-right">Nominal (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {lemburList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                    Belum ada riwayat lembur pada filter yang dipilih.
                  </td>
                </tr>
              ) : (
                lemburList.map(r => (
                  <tr key={r.rowNum} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-medium whitespace-nowrap">{r.tanggal}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{r.nama}</td>
                    <td className="py-2.5 px-3 text-slate-600">{r.unit || '-'} • {r.sekup || '-'}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{r.kategori}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-[11px]">{r.jamMulai} - {r.jamSelesai}</td>
                    <td className="py-2.5 px-3 text-center font-bold font-mono">{r.jmlJam} Jam</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                      Rp {(Number(r.nominal) || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
