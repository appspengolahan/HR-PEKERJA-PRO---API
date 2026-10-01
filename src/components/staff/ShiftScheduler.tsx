import React, { useState } from 'react';
import { 
  Clock, 
  Plus, 
  RotateCcw, 
  Users, 
  Check, 
  Calendar, 
  X,
  ArrowRightLeft
} from 'lucide-react';
import { StaffPP1, ShiftSchedule, ShiftType } from '../../types';

interface ShiftSchedulerProps {
  staffList: StaffPP1[];
  shiftSchedules: ShiftSchedule[];
  onAddSchedule: (schedule: ShiftSchedule) => void;
  onSwapShift: (sched1Id: string, sched2Id: string) => void;
}

export const ShiftScheduler: React.FC<ShiftSchedulerProps> = ({
  staffList,
  shiftSchedules,
  onAddSchedule,
  onSwapShift
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);

  // Form State
  const [selectedStaffId, setSelectedStaffId] = useState(staffList[0]?.id || '');
  const [selectedShift, setSelectedShift] = useState<ShiftType>('Shift 1 (Pagi 07:00-15:00)');
  const [selectedRegu, setSelectedRegu] = useState<'Regu A' | 'Regu B' | 'Regu C' | 'Staf Khusus'>('Regu A');
  const [selectedLini, setSelectedLini] = useState<ShiftSchedule['liniMesin']>('Lini 1 Sortir');

  // Swap State
  const [swap1, setSwap1] = useState('');
  const [swap2, setSwap2] = useState('');

  const shifts: { type: ShiftType; time: string; color: string; desc: string }[] = [
    { 
      type: 'Shift 1 (Pagi 07:00-15:00)', 
      time: '07:00 - 15:00 WIB', 
      color: 'border-blue-500 bg-blue-50 text-blue-900',
      desc: 'Sortir Gagang Cengkeh & Briefing Pagi'
    },
    { 
      type: 'Shift 2 (Sore 15:00-23:00)', 
      time: '15:00 - 23:00 WIB', 
      color: 'border-amber-500 bg-amber-50 text-amber-900',
      desc: 'Rotary Tembakau & Destem Krosok'
    },
    { 
      type: 'Shift 3 (Malam 23:00-07:00)', 
      time: '23:00 - 07:00 WIB', 
      color: 'border-indigo-500 bg-indigo-50 text-indigo-900',
      desc: 'Silo Blending & Maintenance Mesin'
    },
    { 
      type: 'Non-Shift (Office 08:00-16:00)', 
      time: '08:00 - 16:00 WIB', 
      color: 'border-slate-500 bg-slate-50 text-slate-900',
      desc: 'Administrasi, QC Lab & Manajerial'
    }
  ];

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = staffList.find(s => s.id === selectedStaffId);
    if (!staff) return;

    const newSched: ShiftSchedule = {
      id: `sched-${Date.now()}`,
      staffId: staff.id,
      nip: staff.nip,
      nama: staff.nama,
      jabatan: staff.jabatan,
      regu: selectedRegu,
      tanggal: selectedDate,
      shift: selectedShift,
      liniMesin: selectedLini
    };

    onAddSchedule(newSched);
    setShowAssignModal(false);
  };

  const handleExecuteSwap = () => {
    if (!swap1 || !swap2 || swap1 === swap2) {
      alert('Pilih 2 personil staff yang berbeda untuk pertukaran shift.');
      return;
    }
    onSwapShift(swap1, swap2);
    setShowSwapModal(false);
    alert('Pertukaran shift berhasil dicatat ke sistem!');
  };

  const currentDaySchedules = shiftSchedules.filter(s => s.tanggal === selectedDate);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Penjadwalan &amp; Roster 3 Shift Pabrik (PP1)
            </h2>
            <p className="text-xs text-slate-500">
              Rotasi 24 jam non-stop mesin pengolahan tembakau &amp; cengkeh
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Tanggal Picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setShowSwapModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-300"
          >
            <ArrowRightLeft className="w-4 h-4 text-slate-600" />
            Tukar Shift (Swap)
          </button>

          <button
            onClick={() => setShowAssignModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Jadwalkan Shift
          </button>
        </div>

      </div>

      {/* 3 Shift Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shifts.slice(0, 3).map((shiftInfo, idx) => {
          const workersInShift = currentDaySchedules.filter(s => s.shift === shiftInfo.type);

          return (
            <div 
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              {/* Shift Header */}
              <div className={`p-4 border-l-4 ${shiftInfo.color} border-b border-slate-100`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs tracking-wider uppercase">
                    {shiftInfo.type.split(' ')[0]} {shiftInfo.type.split(' ')[1]}
                  </span>
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white/80 shadow-xs">
                    {shiftInfo.time}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {shiftInfo.desc}
                </p>
              </div>

              {/* Workers in this shift */}
              <div className="p-4 space-y-2 flex-1 overflow-y-auto max-h-[340px]">
                {workersInShift.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs italic">
                    Belum ada personil yang dijadwalkan di shift ini.
                  </div>
                ) : (
                  workersInShift.map((item) => (
                    <div 
                      key={item.id}
                      className="p-3 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{item.nama}</span>
                        <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {item.regu}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{item.jabatan}</span>
                        <span className="text-slate-700 font-semibold">{item.liniMesin}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Shift Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Total Personil:</span>
                <span className="font-bold text-slate-900">{workersInShift.length} Orang</span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal Jadwalkan Shift */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Penugasan Roster Shift</h3>
                <p className="text-[11px] text-slate-400">Atur shift dan lini mesin personil</p>
              </div>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pilih Personil Staff
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800"
                >
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.nip}) — {s.jabatan}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Shift Kerja
                </label>
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value as ShiftType)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                >
                  <option value="Shift 1 (Pagi 07:00-15:00)">Shift 1 (Pagi 07:00 - 15:00)</option>
                  <option value="Shift 2 (Sore 15:00-23:00)">Shift 2 (Sore 15:00 - 23:00)</option>
                  <option value="Shift 3 (Malam 23:00-07:00)">Shift 3 (Malam 23:00 - 07:00)</option>
                  <option value="Non-Shift (Office 08:00-16:00)">Non-Shift (Office 08:00 - 16:00)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kelompok Regu
                  </label>
                  <select
                    value={selectedRegu}
                    onChange={(e) => setSelectedRegu(e.target.value as 'Regu A' | 'Regu B' | 'Regu C' | 'Staf Khusus')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                  >
                    <option value="Regu A">Regu A</option>
                    <option value="Regu B">Regu B</option>
                    <option value="Regu C">Regu C</option>
                    <option value="Staf Khusus">Staf Khusus</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Lini Mesin PP1
                  </label>
                  <select
                    value={selectedLini}
                    onChange={(e) => setSelectedLini(e.target.value as ShiftSchedule['liniMesin'])}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                  >
                    <option value="Lini 1 Sortir">Lini 1 Sortir</option>
                    <option value="Lini 2 Rotary">Lini 2 Rotary</option>
                    <option value="Lini 3 Destem">Lini 3 Destem</option>
                    <option value="Lini 4 Silo Blend">Lini 4 Silo Blend</option>
                    <option value="Maintenance General">Maintenance General</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Shift Swap */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Pengajuan Pertukaran Shift (Swap)</h3>
                <p className="text-[11px] text-slate-400">Tukar shift antar 2 personil pada tanggal yang sama</p>
              </div>
              <button 
                onClick={() => setShowSwapModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Personil Pemohon (1)
                </label>
                <select
                  value={swap1}
                  onChange={(e) => setSwap1(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="">Pilih Personil Pertama</option>
                  {currentDaySchedules.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.shift.split(' ')[0]}) — {s.liniMesin}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-center py-1">
                <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Personil Pengganti (2)
                </label>
                <select
                  value={swap2}
                  onChange={(e) => setSwap2(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="">Pilih Personil Kedua</option>
                  {currentDaySchedules.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.shift.split(' ')[0]}) — {s.liniMesin}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSwapModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  onClick={handleExecuteSwap}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Konfirmasi Tukar Shift
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
