import React, { useState } from 'react';
import { 
  CalendarCheck, 
  CheckCheck, 
  Clock, 
  Save, 
  Check, 
  AlertCircle, 
  Filter
} from 'lucide-react';
import { PekerjaPHL, PresensiPHLRecord, StatusKehadiran, PosLiniPHL } from '../../types';

interface ForemanAttendanceProps {
  pekerjaPHL: PekerjaPHL[];
  presensiPHL: PresensiPHLRecord[];
  onSavePresensi: (records: PresensiPHLRecord[]) => void;
  mandorName: string;
}

export const ForemanAttendance: React.FC<ForemanAttendanceProps> = ({
  pekerjaPHL,
  presensiPHL,
  onSavePresensi,
  mandorName
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedLini, setSelectedLini] = useState<string>('Semua');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize or map existing records for selectedDate
  const getAttendanceState = () => {
    return pekerjaPHL.filter(p => p.statusAktif).map(worker => {
      const existing = presensiPHL.find(
        r => r.pekerjaId === worker.id && r.tanggal === selectedDate
      );
      return {
        pekerjaId: worker.id,
        nip: worker.nip,
        nama: worker.nama,
        posLini: worker.posLini,
        status: (existing?.status || 'Hadir') as StatusKehadiran,
        jamMasuk: existing?.jamMasuk || '07:45',
        jamPulang: existing?.jamPulang || '16:00',
        catatan: existing?.catatan || ''
      };
    });
  };

  const [attendanceList, setAttendanceList] = useState(getAttendanceState());

  const liniOptions = [
    'Semua',
    'Sortir Gagang Cengkeh',
    'Grading Krosok',
    'Stacking Karung',
    'Kebersihan Area'
  ];

  const handleUpdateStatus = (pekerjaId: string, status: StatusKehadiran) => {
    setAttendanceList(prev => prev.map(item => {
      if (item.pekerjaId === pekerjaId) {
        return {
          ...item,
          status,
          jamMasuk: status === 'Hadir' ? '07:45' : '-',
          jamPulang: status === 'Hadir' ? '16:00' : '-'
        };
      }
      return item;
    }));
  };

  const handleMarkAllHadir = () => {
    setAttendanceList(prev => prev.map(item => {
      if (selectedLini === 'Semua' || item.posLini === selectedLini) {
        return {
          ...item,
          status: 'Hadir',
          jamMasuk: '07:45',
          jamPulang: '16:00'
        };
      }
      return item;
    }));
  };

  const handleSave = () => {
    const updatedRecords: PresensiPHLRecord[] = attendanceList.map(item => ({
      id: `pres-${item.pekerjaId}-${selectedDate}`,
      pekerjaId: item.pekerjaId,
      nip: item.nip,
      nama: item.nama,
      posLini: item.posLini,
      tanggal: selectedDate,
      status: item.status,
      jamMasuk: item.jamMasuk,
      jamPulang: item.jamPulang,
      mandorPencatat: mandorName || 'Supardi Hartono (Foreman Shift)',
      catatan: item.catatan
    }));

    onSavePresensi(updatedRecords);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const filteredItems = attendanceList.filter(item => {
    return selectedLini === 'Semua' || item.posLini === selectedLini;
  });

  const hadirCount = filteredItems.filter(i => i.status === 'Hadir').length;
  const izinCount = filteredItems.filter(i => i.status === 'Izin').length;
  const sakitCount = filteredItems.filter(i => i.status === 'Sakit').length;
  const alpaCount = filteredItems.filter(i => i.status === 'Alpa').length;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Mandor Header Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Foreman Attendance — Presensi Harian Mandor
            </h2>
            <p className="text-xs text-slate-500">
              Checklist kilat kehadiran pekerja harian lepas di pos penugasan lini
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Tanggal Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-medium">Tanggal:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none"
            />
          </div>

          {/* Quick Mark All */}
          <button
            onClick={handleMarkAllHadir}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <CheckCheck className="w-4 h-4" />
            Tandai Hadir Semua Lini
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            {saveSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            {saveSuccess ? 'Tersimpan ke Sheets!' : 'Simpan Presensi Shift'}
          </button>
        </div>

      </div>

      {/* Filter Lini & Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-center">
          <div className="text-2xl font-black text-emerald-700">{hadirCount}</div>
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">Pekerja Hadir</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-center">
          <div className="text-2xl font-black text-amber-700">{izinCount}</div>
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Izin Berita</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-center">
          <div className="text-2xl font-black text-blue-700">{sakitCount}</div>
          <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">Sakit (Dokter)</div>
        </div>
        <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-center">
          <div className="text-2xl font-black text-red-700">{alpaCount}</div>
          <div className="text-[11px] font-bold text-red-800 uppercase tracking-wide">Alpa / Mangkir</div>
        </div>
      </div>

      {/* Lini Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-2.5 rounded-xl border border-slate-200">
        <Filter className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
        <span className="text-xs font-bold text-slate-500 mr-2">Filter Lini:</span>
        {liniOptions.map(lini => (
          <button
            key={lini}
            onClick={() => setSelectedLini(lini)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedLini === lini
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            {lini}
          </button>
        ))}
      </div>

      {/* Workers Checklist Cards / Rows */}
      <div className="space-y-2.5">
        {filteredItems.map((item) => (
          <div 
            key={item.pekerjaId}
            className={`p-4 bg-white rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
              item.status === 'Hadir' 
                ? 'border-slate-200 hover:border-emerald-300' 
                : item.status === 'Alpa' 
                ? 'border-red-200 bg-red-50/20' 
                : 'border-amber-200 bg-amber-50/20'
            }`}
          >
            {/* Worker Details */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 flex-shrink-0">
                {item.nama.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900">
                  {item.nama}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                  <span className="font-mono text-blue-600 font-semibold">{item.nip}</span>
                  <span>•</span>
                  <span className="font-medium text-slate-700">{item.posLini}</span>
                </div>
              </div>
            </div>

            {/* Attendance Status Buttons (1-Tap Checklist) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['Hadir', 'Izin', 'Sakit', 'Alpa'] as StatusKehadiran[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleUpdateStatus(item.pekerjaId, st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    item.status === st
                      ? st === 'Hadir'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : st === 'Izin'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : st === 'Sakit'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Time & Notes Input */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold">IN:</span>
                <input
                  type="text"
                  value={item.jamMasuk}
                  disabled={item.status !== 'Hadir'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAttendanceList(prev => prev.map(x => x.pekerjaId === item.pekerjaId ? { ...x, jamMasuk: val } : x));
                  }}
                  className="w-12 bg-transparent text-slate-800 font-mono text-[11px] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold">OUT:</span>
                <input
                  type="text"
                  value={item.jamPulang}
                  disabled={item.status !== 'Hadir'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAttendanceList(prev => prev.map(x => x.pekerjaId === item.pekerjaId ? { ...x, jamPulang: val } : x));
                  }}
                  className="w-12 bg-transparent text-slate-800 font-mono text-[11px] focus:outline-none"
                />
              </div>

              <input
                type="text"
                placeholder="Catatan..."
                value={item.catatan}
                onChange={(e) => {
                  const val = e.target.value;
                  setAttendanceList(prev => prev.map(x => x.pekerjaId === item.pekerjaId ? { ...x, catatan: val } : x));
                }}
                className="w-32 sm:w-44 px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-700"
              />
            </div>

          </div>
        ))}
      </div>

      {/* Bottom Summary Bar */}
      <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs">
        <span className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          Mandor Pencatat: <strong>{mandorName || 'Supardi Hartono (Foreman Shift)'}</strong>
        </span>
        <button
          onClick={handleSave}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
        >
          Konfirmasi &amp; Simpan Log
        </button>
      </div>

    </div>
  );
};
