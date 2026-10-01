import React, { useState } from 'react';
import { 
  BadgePercent, 
  Plus, 
  CheckCircle, 
  Clock, 
  Search, 
  Calendar, 
  Calculator, 
  X,
  FileCheck2,
  DollarSign
} from 'lucide-react';
import { PekerjaPHL, OutputBoronganRecord, PosLiniPHL } from '../../types';
import { TARIF_BORONGAN_DEFAULT } from '../../data/initialData';

interface BoronganCalculatorProps {
  pekerjaPHL: PekerjaPHL[];
  outputBorongan: OutputBoronganRecord[];
  onAddOutput: (record: OutputBoronganRecord) => void;
  onVerifyOutput: (id: string) => void;
  mandorName: string;
}

export const BoronganCalculator: React.FC<BoronganCalculatorProps> = ({
  pekerjaPHL,
  outputBorongan,
  onAddOutput,
  onVerifyOutput,
  mandorName
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedLini, setSelectedLini] = useState<string>('Semua');

  // Form State
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(
    pekerjaPHL[0]?.id || ''
  );
  const [tanggal, setTanggal] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [volume, setVolume] = useState<number>(150);
  const [catatanKualitas, setCatatanKualitas] = useState<string>('');

  const currentWorker = pekerjaPHL.find(p => p.id === selectedWorkerId);
  const currentLini: PosLiniPHL = currentWorker ? currentWorker.posLini : 'Sortir Gagang Cengkeh';
  
  const currentSatuan = 
    currentLini === 'Stacking Karung' ? 'Karung' :
    currentLini === 'Kebersihan Area' ? 'Hari' : 'Kg';

  const currentTarif = TARIF_BORONGAN_DEFAULT[currentLini] || 850;
  const calculatedTotal = volume * currentTarif;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorker) return;

    const newRecord: OutputBoronganRecord = {
      id: `bor-${Date.now()}`,
      pekerjaId: currentWorker.id,
      nip: currentWorker.nip,
      nama: currentWorker.nama,
      posLini: currentLini,
      tanggal,
      satuan: currentSatuan,
      volume,
      tarifPerSatuan: currentTarif,
      totalUpah: calculatedTotal,
      mandorVerifikator: mandorName || 'Supardi Hartono',
      catatanKualitas: catatanKualitas || 'Lolos verifikasi QC Mandor',
      statusVerifikasi: 'Terverifikasi'
    };

    onAddOutput(newRecord);
    setShowAddModal(false);
    setVolume(150);
    setCatatanKualitas('');
  };

  // Metrics
  const totalUpah = outputBorongan.reduce((acc, c) => acc + c.totalUpah, 0);
  const totalVolumeKg = outputBorongan
    .filter(o => o.satuan === 'Kg')
    .reduce((acc, c) => acc + c.volume, 0);
  const totalKarung = outputBorongan
    .filter(o => o.satuan === 'Karung')
    .reduce((acc, c) => acc + c.volume, 0);

  const filtered = outputBorongan.filter(item => {
    const matchSearch = 
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.nip.toLowerCase().includes(search.toLowerCase());
    const matchLini = selectedLini === 'Semua' || item.posLini === selectedLini;
    return matchSearch && matchLini;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Upah Borongan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Akumulasi Upah Minggu Ini
            </div>
            <div className="text-2xl font-black text-emerald-700 tracking-tight">
              Rp {totalUpah.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {outputBorongan.length} Catatan kerja tervalidasi
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Tonase Sortir & Grading */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Total Tonase (Cengkeh &amp; Krosok)
            </div>
            <div className="text-2xl font-black text-blue-700 tracking-tight">
              {totalVolumeKg.toLocaleString('id-ID')} <span className="text-xs font-bold text-slate-400">Kg</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {(totalVolumeKg / 1000).toFixed(2)} Ton Bahan Terolah
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calculator className="w-6 h-6" />
          </div>
        </div>

        {/* Total Karung Stacking */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Total Karung Di-Stacking
            </div>
            <div className="text-2xl font-black text-amber-700 tracking-tight">
              {totalKarung.toLocaleString('id-ID')} <span className="text-xs font-bold text-slate-400">Karung</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Palet standar gudang PP1
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <BadgePercent className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama pekerja, NIP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>

        {/* Filter Lini & Input Output Button */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <select
            value={selectedLini}
            onChange={(e) => setSelectedLini(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none"
          >
            <option value="Semua">Semua Pos Lini</option>
            <option value="Sortir Gagang Cengkeh">Sortir Gagang Cengkeh</option>
            <option value="Grading Krosok">Grading Krosok</option>
            <option value="Stacking Karung">Stacking Karung</option>
            <option value="Kebersihan Area">Kebersihan Area</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm ml-auto md:ml-0"
          >
            <Plus className="w-4 h-4" />
            Catat Tonase Harian
          </button>
        </div>

      </div>

      {/* Table Output Borongan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <BadgePercent className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">
              Rekapitulasi Output &amp; Upah Borongan ({filtered.length} Entri)
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Tab Sheet: Output_Borongan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Pekerja &amp; NIP</th>
                <th className="py-3 px-4">Pos Penugasan</th>
                <th className="py-3 px-4 text-right">Volume / Tonase</th>
                <th className="py-3 px-4 text-right">Tarif Satuan</th>
                <th className="py-3 px-4 text-right">Total Upah (Rp)</th>
                <th className="py-3 px-4">Catatan Kualitas QC</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Tanggal */}
                  <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                    {item.tanggal}
                  </td>

                  {/* Pekerja & NIP */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{item.nama}</div>
                    <div className="text-[11px] font-mono text-blue-600">{item.nip}</div>
                  </td>

                  {/* Pos Penugasan */}
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800">{item.posLini}</span>
                  </td>

                  {/* Volume */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {item.volume.toLocaleString('id-ID')} {item.satuan}
                  </td>

                  {/* Tarif Satuan */}
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    Rp {item.tarifPerSatuan.toLocaleString('id-ID')}
                  </td>

                  {/* Total Upah */}
                  <td className="py-3 px-4 text-right font-mono font-black text-emerald-700 text-sm">
                    Rp {item.totalUpah.toLocaleString('id-ID')}
                  </td>

                  {/* Catatan Kualitas */}
                  <td className="py-3 px-4 text-slate-500 text-[11px] max-w-[180px] truncate" title={item.catatanKualitas}>
                    {item.catatanKualitas || '-'}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">
                    {item.statusVerifikasi === 'Terverifikasi' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Terverifikasi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Menunggu
                      </span>
                    )}
                  </td>

                  {/* Aksi */}
                  <td className="py-3 px-4 text-right">
                    {item.statusVerifikasi === 'Menunggu' && (
                      <button
                        onClick={() => onVerifyOutput(item.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors"
                      >
                        Verifikasi
                      </button>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input Output Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Catat Output Tonase &amp; Upah Borongan</h3>
                <p className="text-[11px] text-slate-400">Formula otomatis: Tonase x Tarif Pos Lini</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pilih Pekerja PHL *
                </label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
                >
                  {pekerjaPHL.filter(p => p.statusAktif).map(worker => (
                    <option key={worker.id} value={worker.id}>
                      {worker.nama} ({worker.nip}) — {worker.posLini}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tanggal Pengerjaan
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Volume / Tonase ({currentSatuan}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    required
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Automatic Calculation Card */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5">
                <div className="flex justify-between text-emerald-900">
                  <span>Pos Penugasan:</span>
                  <span className="font-bold">{currentLini}</span>
                </div>
                <div className="flex justify-between text-emerald-900">
                  <span>Tarif Standar PP1:</span>
                  <span className="font-mono font-bold">
                    Rp {currentTarif.toLocaleString('id-ID')} / {currentSatuan}
                  </span>
                </div>
                <div className="pt-2 border-t border-emerald-200 flex justify-between items-center text-sm font-black text-emerald-900">
                  <span>Total Upah Diterima:</span>
                  <span className="text-base text-emerald-700">
                    Rp {calculatedTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Kualitas QC / Mandor
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kadar air < 12%, sortir bersih tanpa gagang patah"
                  value={catatanKualitas}
                  onChange={(e) => setCatatanKualitas(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Simpan &amp; Verifikasi Tonase
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
