import React, { useState } from 'react';
import { 
  Settings2, 
  Clock, 
  Save, 
  Check, 
  Coffee, 
  Calendar, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { JamKerjaConfig } from '../../types';

interface JamKerjaViewProps {
  jamKerja: JamKerjaConfig[];
  onSaveJamKerja: (updated: JamKerjaConfig[]) => void;
}

export const JamKerjaView: React.FC<JamKerjaViewProps> = ({
  jamKerja,
  onSaveJamKerja
}) => {
  const [configs, setConfigs] = useState<JamKerjaConfig[]>(jamKerja);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUpdate = (index: number, field: keyof JamKerjaConfig, val: string | number) => {
    setConfigs(prev => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: val
      };
      return next;
    });
  };

  const handleSave = () => {
    onSaveJamKerja(configs);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
            <Settings2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              CONFIG — KEBIJAKAN JAM KERJA PP1
            </h2>
            <p className="text-xs text-slate-500">
              Sumber: Kebijakan jam kerja Divisi Produksi I. Perubahan di sini otomatis sinkron ke seluruh sistem.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          {savedSuccess ? 'Tersimpan ke Sistem!' : 'Simpan Kebijakan'}
        </button>
      </div>

      {/* Grid of Days */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {configs.map((cfg, idx) => (
          <div 
            key={idx}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 hover:border-slate-300 transition-all"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                {cfg.hari}
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {cfg.durasiKerjaMenit} Menit ({Math.floor(cfg.durasiKerjaMenit / 60)} Jam {cfg.durasiKerjaMenit % 60 ? `${cfg.durasiKerjaMenit % 60}m` : ''})
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Jam Mulai
                  </label>
                  <input
                    type="text"
                    value={cfg.jamMulai}
                    onChange={(e) => handleUpdate(idx, 'jamMulai', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono font-bold text-slate-800 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Jam Selesai
                  </label>
                  <input
                    type="text"
                    value={cfg.jamSelesai}
                    onChange={(e) => handleUpdate(idx, 'jamSelesai', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono font-bold text-slate-800 bg-slate-50"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 space-y-2">
                <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                  <Coffee className="w-3.5 h-3.5 text-amber-700" />
                  Jadwal Waktu Istirahat:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-amber-800">Mulai Istirahat</label>
                    <input
                      type="text"
                      value={cfg.istirahatMulai}
                      onChange={(e) => handleUpdate(idx, 'istirahatMulai', e.target.value)}
                      className="w-full px-2 py-1 rounded border border-amber-200 font-mono text-[11px] bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-amber-800">Selesai Istirahat</label>
                    <input
                      type="text"
                      value={cfg.istirahatSelesai}
                      onChange={(e) => handleUpdate(idx, 'istirahatSelesai', e.target.value)}
                      className="w-full px-2 py-1 rounded border border-amber-200 font-mono text-[11px] bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Durasi Kerja Efektif (Menit)
                </label>
                <input
                  type="number"
                  value={cfg.durasiKerjaMenit}
                  onChange={(e) => handleUpdate(idx, 'durasiKerjaMenit', parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono font-bold text-slate-800 bg-slate-50"
                />
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Spreadsheet mapping cue */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Tersinkronisasi dengan Tab Google Sheets: <code>CONFIG_JamKerja</code></span>
        </div>
        <span className="font-mono text-[11px] text-slate-400">
          PT BATU KARANG PP1 • PROD
        </span>
      </div>

    </div>
  );
};
