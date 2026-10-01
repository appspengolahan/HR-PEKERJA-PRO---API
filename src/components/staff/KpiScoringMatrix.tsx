import React, { useState } from 'react';
import { 
  Award, 
  Plus, 
  TrendingUp, 
  Search, 
  Sliders, 
  CheckCircle2, 
  HelpCircle, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import { StaffPP1, KpiScoring } from '../../types';

interface KpiScoringMatrixProps {
  staffList: StaffPP1[];
  kpiList: KpiScoring[];
  onSaveKpi: (record: KpiScoring) => void;
  evaluatorName: string;
}

export const KpiScoringMatrix: React.FC<KpiScoringMatrixProps> = ({
  staffList,
  kpiList,
  onSaveKpi,
  evaluatorName
}) => {
  const [selectedPeriode, setSelectedPeriode] = useState('2026-09');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [staffId, setStaffId] = useState(staffList[0]?.id || '');
  const [periode, setPeriode] = useState('2026-09');
  const [disiplin, setDisiplin] = useState(90);
  const [rendemen, setRendemen] = useState(90);
  const [k3, setK3] = useState(90);
  const [inisiatif, setInisiatif] = useState(85);
  const [catatan, setCatatan] = useState('');

  // Live Formula Calculation:
  // Disiplin (30%), Rendemen (40%), K3 (20%), Inisiatif (10%)
  const calculatedScore = Math.round(
    ((0.30 * disiplin) + (0.40 * rendemen) + (0.20 * k3) + (0.10 * inisiatif)) * 10
  ) / 10;

  let calculatedGrade: 'A' | 'B' | 'C' | 'D' = 'D';
  let calculatedInsentif: KpiScoring['rekomendasiInsentif'] = 'Evaluasi Khusus';

  if (calculatedScore >= 90) {
    calculatedGrade = 'A';
    calculatedInsentif = 'Insentif Penuh (Level 1)';
  } else if (calculatedScore >= 80) {
    calculatedGrade = 'B';
    calculatedInsentif = 'Insentif Standar (Level 2)';
  } else if (calculatedScore >= 70) {
    calculatedGrade = 'C';
    calculatedInsentif = 'Tanpa Insentif';
  } else {
    calculatedGrade = 'D';
    calculatedInsentif = 'Evaluasi Khusus';
  }

  const handleOpenAdd = () => {
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = staffList.find(s => s.id === staffId);
    if (!staff) return;

    const newKpi: KpiScoring = {
      id: `kpi-${staff.id}-${periode}`,
      staffId: staff.id,
      nip: staff.nip,
      nama: staff.nama,
      jabatan: staff.jabatan,
      periodeBulan: periode,
      skorDisiplin: disiplin,
      skorRendemen: rendemen,
      skorK3: k3,
      skorInisiatif: inisiatif,
      skorAkhir: calculatedScore,
      grade: calculatedGrade,
      rekomendasiInsentif: calculatedInsentif,
      catatanEvaluator: catatan || 'Kinerja bulanan telah dinilai secara objektif',
      evaluator: evaluatorName || 'Lalu M. Kurniawan (Manajer Operasional)'
    };

    onSaveKpi(newKpi);
    setShowModal(false);
  };

  const filtered = kpiList.filter(k => {
    const matchSearch = k.nama.toLowerCase().includes(search.toLowerCase()) || k.nip.toLowerCase().includes(search.toLowerCase());
    const matchPeriode = !selectedPeriode || k.periodeBulan === selectedPeriode;
    return matchSearch && matchPeriode;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Banner with Weightage Breakdown */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between">
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900">
              Matriks Scoring KPI Bulanan Staff PP1
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            Sistem evaluasi kinerja komposit berbasis 4 indikator operasional pabrik:
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              Disiplin: 30%
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
              Capaian Rendemen: 40%
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              K3 Pabrik: 20%
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
              Inisiatif: 10%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
          <input
            type="month"
            value={selectedPeriode}
            onChange={(e) => setSelectedPeriode(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none"
          />

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Input Penilaian KPI
          </button>
        </div>

      </div>

      {/* KPI Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold text-slate-800">
            Daftar Skor KPI Periode {selectedPeriode} ({filtered.length} Karyawan)
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Tab Sheet: Scoring_KPI
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Staff &amp; NIP</th>
                <th className="py-3 px-4">Jabatan</th>
                <th className="py-3 px-4 text-center">Disiplin (30%)</th>
                <th className="py-3 px-4 text-center">Rendemen (40%)</th>
                <th className="py-3 px-4 text-center">K3 (20%)</th>
                <th className="py-3 px-4 text-center">Inisiatif (10%)</th>
                <th className="py-3 px-4 text-center">Skor Akhir</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4">Insentif &amp; Evaluasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-amber-50/20 transition-colors">
                  
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{item.nama}</div>
                    <div className="text-[11px] font-mono text-blue-600">{item.nip}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">{item.jabatan}</span>
                  </td>

                  {/* Disiplin */}
                  <td className="py-3 px-4 text-center font-mono">
                    <span className="font-bold text-blue-700">{item.skorDisiplin}</span>
                    <div className="text-[10px] text-slate-400">{(item.skorDisiplin * 0.3).toFixed(1)} pt</div>
                  </td>

                  {/* Rendemen */}
                  <td className="py-3 px-4 text-center font-mono">
                    <span className="font-bold text-indigo-700">{item.skorRendemen}</span>
                    <div className="text-[10px] text-slate-400">{(item.skorRendemen * 0.4).toFixed(1)} pt</div>
                  </td>

                  {/* K3 */}
                  <td className="py-3 px-4 text-center font-mono">
                    <span className="font-bold text-emerald-700">{item.skorK3}</span>
                    <div className="text-[10px] text-slate-400">{(item.skorK3 * 0.2).toFixed(1)} pt</div>
                  </td>

                  {/* Inisiatif */}
                  <td className="py-3 px-4 text-center font-mono">
                    <span className="font-bold text-purple-700">{item.skorInisiatif}</span>
                    <div className="text-[10px] text-slate-400">{(item.skorInisiatif * 0.1).toFixed(1)} pt</div>
                  </td>

                  {/* Skor Akhir */}
                  <td className="py-3 px-4 text-center font-mono font-black text-slate-900 text-sm">
                    {item.skorAkhir}
                  </td>

                  {/* Grade */}
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block w-8 h-8 rounded-xl font-black text-xs leading-8 ${
                      item.grade === 'A'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : item.grade === 'B'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : item.grade === 'C'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                      {item.grade}
                    </span>
                  </td>

                  {/* Rekomendasi Insentif */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800 text-[11px]">
                      {item.rekomendasiInsentif}
                    </div>
                    <div className="text-[11px] text-slate-500 italic mt-0.5 max-w-xs truncate" title={item.catatanEvaluator}>
                      &quot;{item.catatanEvaluator}&quot;
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input KPI */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Penilaian Matriks KPI Karyawan</h3>
                <p className="text-[11px] text-slate-400">Formula otomatis: (30% + 40% + 20% + 10%)</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pilih Staff *</label>
                  <select
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold"
                  >
                    {staffList.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nama} ({s.nip})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Periode Evaluasi</label>
                  <input
                    type="month"
                    required
                    value={periode}
                    onChange={(e) => setPeriode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Sliders for 4 Weights */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                
                {/* 1. Disiplin (30%) */}
                <div>
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span>1. Skor Disiplin (Bobot 30%)</span>
                    <span className="font-mono text-blue-700">{disiplin} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={disiplin}
                    onChange={(e) => setDisiplin(parseInt(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                {/* 2. Capaian Rendemen (40%) */}
                <div>
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span>2. Capaian Rendemen Komoditas (Bobot 40%)</span>
                    <span className="font-mono text-indigo-700">{rendemen} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={rendemen}
                    onChange={(e) => setRendemen(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                {/* 3. K3 Pabrik (20%) */}
                <div>
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span>3. K3 &amp; Keselamatan Kerja (Bobot 20%)</span>
                    <span className="font-mono text-emerald-700">{k3} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={k3}
                    onChange={(e) => setK3(parseInt(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                {/* 4. Inisiatif (10%) */}
                <div>
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span>4. Inisiatif &amp; Kerjasama Tim (Bobot 10%)</span>
                    <span className="font-mono text-purple-700">{inisiatif} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={inisiatif}
                    onChange={(e) => setInisiatif(parseInt(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>

              </div>

              {/* Real-time Calculation Result Box */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-amber-900 uppercase">
                    Hasil Kalkulasi Komposit:
                  </div>
                  <div className="text-xl font-black text-amber-950 font-mono">
                    {calculatedScore} <span className="text-xs font-normal text-amber-700">/ 100</span>
                  </div>
                  <div className="text-[11px] text-amber-800 font-semibold mt-0.5">
                    {calculatedInsentif}
                  </div>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 text-white font-black text-xl flex items-center justify-center shadow-md">
                    {calculatedGrade}
                  </div>
                  <div className="text-[9px] font-mono text-amber-800 mt-1 font-bold">GRADE</div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Evaluator (Manajer Operasional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pencapaian target rendemen cengkeh sangat memuaskan"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Simpan Penilaian KPI
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
