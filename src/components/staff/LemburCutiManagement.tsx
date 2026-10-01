import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  FileCheck2, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  X,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { StaffPP1, PengajuanLembur, PengajuanCuti, UserRole } from '../../types';

interface LemburCutiManagementProps {
  staffList: StaffPP1[];
  lemburList: PengajuanLembur[];
  cutiList: PengajuanCuti[];
  onAddLembur: (lembur: PengajuanLembur) => void;
  onApproveLembur: (id: string, approverName: string) => void;
  onRejectLembur: (id: string, reason: string) => void;
  onAddCuti: (cuti: PengajuanCuti) => void;
  onApproveCuti: (id: string, approverName: string) => void;
  currentUserRole: UserRole;
}

export const LemburCutiManagement: React.FC<LemburCutiManagementProps> = ({
  staffList,
  lemburList,
  cutiList,
  onAddLembur,
  onApproveLembur,
  onRejectLembur,
  onAddCuti,
  onApproveCuti,
  currentUserRole
}) => {
  const [activeTab, setActiveTab] = useState<'lembur' | 'cuti'>('lembur');
  const [showAddLembur, setShowAddLembur] = useState(false);
  const [showAddCuti, setShowAddCuti] = useState(false);

  // Form Lembur State
  const [lemburStaffId, setLemburStaffId] = useState(staffList[0]?.id || '');
  const [lemburDate, setLemburDate] = useState(new Date().toISOString().slice(0, 10));
  const [lemburJamMulai, setLemburJamMulai] = useState('16:30');
  const [lemburJamSelesai, setLemburJamSelesai] = useState('20:30');
  const [lemburTotalJam, setLemburTotalJam] = useState(4);
  const [lemburKeperluan, setLemburKeperluan] = useState<PengajuanLembur['keperluan']>('Maintenance Mesin Darurat');
  const [lemburUraian, setLemburUraian] = useState('');

  // Form Cuti State
  const [cutiStaffId, setCutiStaffId] = useState(staffList[0]?.id || '');
  const [cutiTipe, setCutiTipe] = useState<PengajuanCuti['tipeCuti']>('Cuti Tahunan');
  const [cutiMulai, setCutiMulai] = useState(new Date().toISOString().slice(0, 10));
  const [cutiSelesai, setCutiSelesai] = useState(new Date().toISOString().slice(0, 10));
  const [cutiHari, setCutiHari] = useState(1);
  const [cutiKeterangan, setCutiKeterangan] = useState('');

  const canApprove = currentUserRole === 'Super Admin' || currentUserRole === 'Project Manager';

  const handleApproveWithCelebration = (id: string) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    onApproveLembur(id, 'Lalu M. Kurniawan (Manajer Operasional)');
  };

  const handleCreateLembur = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = staffList.find(s => s.id === lemburStaffId);
    if (!staff) return;

    const newRecord: PengajuanLembur = {
      id: `lmb-${Date.now()}`,
      staffId: staff.id,
      nip: staff.nip,
      nama: staff.nama,
      jabatan: staff.jabatan,
      tanggal: lemburDate,
      jamMulai: lemburJamMulai,
      jamSelesai: lemburJamSelesai,
      totalJam: lemburTotalJam,
      keperluan: lemburKeperluan,
      uraianPekerjaan: lemburUraian || 'Pekerjaan lembur operasional divisi produksi',
      status: 'Menunggu Persetujuan',
      tanggalDiajukan: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    onAddLembur(newRecord);
    setShowAddLembur(false);
    setLemburUraian('');
  };

  const handleCreateCuti = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = staffList.find(s => s.id === cutiStaffId);
    if (!staff) return;

    const newRecord: PengajuanCuti = {
      id: `cuti-${Date.now()}`,
      staffId: staff.id,
      nip: staff.nip,
      nama: staff.nama,
      jabatan: staff.jabatan,
      tipeCuti: cutiTipe,
      tanggalMulai: cutiMulai,
      tanggalSelesai: cutiSelesai,
      jumlahHari: cutiHari,
      keterangan: cutiKeterangan || 'Pengajuan cuti reguler',
      status: 'Menunggu Persetujuan',
      tanggalDiajukan: new Date().toISOString().slice(0, 10)
    };

    onAddCuti(newRecord);
    setShowAddCuti(false);
    setCutiKeterangan('');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Otorisasi Lembur &amp; Cuti Divisi Produksi 1
            </h2>
            <p className="text-xs text-slate-500">
              Alur persetujuan manajerial oleh Manajer Operasional (Bpk. Lalu M.)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch Tab */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('lembur')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'lembur' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pengajuan Lembur ({lemburList.length})
            </button>
            <button
              onClick={() => setActiveTab('cuti')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'cuti' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pengajuan Cuti ({cutiList.length})
            </button>
          </div>

          <button
            onClick={() => activeTab === 'lembur' ? setShowAddLembur(true) : setShowAddCuti(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            {activeTab === 'lembur' ? 'Ajukan Lembur' : 'Ajukan Cuti'}
          </button>
        </div>

      </div>

      {/* Permission Cue */}
      {!canApprove && (
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            Peran Anda saat ini adalah <strong>{currentUserRole}</strong>. Tombol persetujuan resmi hanya aktif untuk <strong>Project Manager / Super Admin</strong>. Anda dapat mengganti role di menu atas untuk mencoba aksi approval.
          </span>
        </div>
      )}

      {/* TAB 1: LEMBUR */}
      {activeTab === 'lembur' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-800">
              Daftar Permohonan Surat Perintah Kerja Lembur (SPKL)
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Tab Sheet: Pengajuan_Lembur
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tanggal &amp; Waktu</th>
                  <th className="py-3 px-4">Personil Staff</th>
                  <th className="py-3 px-4">Keperluan &amp; Uraian Mesin</th>
                  <th className="py-3 px-4 text-center">Durasi Jam</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Otorisasi Manajer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {lemburList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900">{item.tanggal}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {item.jamMulai} - {item.jamSelesai} WIB
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.nama}</div>
                      <div className="text-[11px] text-indigo-600 font-mono">{item.nip} • {item.jabatan}</div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-slate-800">{item.keperluan}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {item.uraianPekerjaan}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                      {item.totalJam} Jam
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Disetujui'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : item.status === 'Ditolak'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {item.status === 'Disetujui' ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {item.status === 'Menunggu Persetujuan' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApproveWithCelebration(item.id)}
                            disabled={!canApprove}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                            title="Setujui permohonan lembur"
                          >
                            <Sparkles className="w-3 h-3" />
                            Setujui
                          </button>
                          <button
                            onClick={() => onRejectLembur(item.id, 'Tidak disetujui karena kuota over')}
                            disabled={!canApprove}
                            className="px-2 py-1 bg-slate-200 hover:bg-red-100 hover:text-red-700 disabled:opacity-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          {item.disetujuiOleh || 'Terverifikasi'}
                        </span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CUTI */}
      {activeTab === 'cuti' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-800">
              Daftar Permohonan Cuti Tahunan &amp; Izin Khusus
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Tab Sheet: Pengajuan_Cuti
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Periode Tanggal Cuti</th>
                  <th className="py-3 px-4">Nama &amp; NIP Staff</th>
                  <th className="py-3 px-4">Tipe Cuti</th>
                  <th className="py-3 px-4 text-center">Durasi (Hari)</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {cutiList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {item.tanggalMulai} s/d {item.tanggalSelesai}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.nama}</div>
                      <div className="text-[11px] font-mono text-blue-600">{item.nip}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-semibold text-[11px] bg-slate-100 text-slate-800">
                        {item.tipeCuti}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold font-mono">
                      {item.jumlahHari} Hari
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {item.keterangan}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Disetujui'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status === 'Disetujui' ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {item.status === 'Menunggu Persetujuan' && (
                        <button
                          onClick={() => onApproveCuti(item.id, 'Lalu M. Kurniawan')}
                          disabled={!canApprove}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                        >
                          Setujui Cuti
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Ajukan Lembur */}
      {showAddLembur && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Surat Perintah Kerja Lembur (SPKL)</h3>
                <p className="text-[11px] text-slate-400">Pengajuan lembur maintenance &amp; produksi</p>
              </div>
              <button 
                onClick={() => setShowAddLembur(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLembur} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Personil Staff *
                </label>
                <select
                  value={lemburStaffId}
                  onChange={(e) => setLemburStaffId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold focus:ring-2 focus:ring-amber-500"
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
                  Keperluan Lembur *
                </label>
                <select
                  value={lemburKeperluan}
                  onChange={(e) => setLemburKeperluan(e.target.value as PengajuanLembur['keperluan'])}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Maintenance Mesin Darurat">Maintenance Mesin Darurat</option>
                  <option value="Kejar Target Tonase Blend">Kejar Target Tonase Blend</option>
                  <option value="Overhaul Rotary Tembakau">Overhaul Rotary Tembakau</option>
                  <option value="QC Uji Laboratorium">QC Uji Laboratorium</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={lemburDate}
                    onChange={(e) => setLemburDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mulai</label>
                  <input
                    type="text"
                    required
                    value={lemburJamMulai}
                    onChange={(e) => setLemburJamMulai(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selesai</label>
                  <input
                    type="text"
                    required
                    value={lemburJamSelesai}
                    onChange={(e) => setLemburJamSelesai(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Uraian Detail Pekerjaan
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: Penggantian bearing pompa dan pembersihan jalur corong Silo 2"
                  value={lemburUraian}
                  onChange={(e) => setLemburUraian(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLembur(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-sm"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajukan Cuti */}
      {showAddCuti && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Formulir Pengajuan Cuti Karyawan</h3>
                <p className="text-[11px] text-slate-400">Persetujuan Manajer Operasional</p>
              </div>
              <button 
                onClick={() => setShowAddCuti(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCuti} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Personil Staff *
                </label>
                <select
                  value={cutiStaffId}
                  onChange={(e) => setCutiStaffId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold"
                >
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.nip}) — Sisa Cuti: {s.sisaCuti} Hari
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jenis Cuti
                </label>
                <select
                  value={cutiTipe}
                  onChange={(e) => setCutiTipe(e.target.value as PengajuanCuti['tipeCuti'])}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                >
                  <option value="Cuti Tahunan">Cuti Tahunan</option>
                  <option value="Cuti Sakit">Cuti Sakit</option>
                  <option value="Cuti Melahirkan">Cuti Melahirkan</option>
                  <option value="Izin Khusus / Takziah">Izin Khusus / Takziah</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mulai Cuti</label>
                  <input
                    type="date"
                    required
                    value={cutiMulai}
                    onChange={(e) => setCutiMulai(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selesai Cuti</label>
                  <input
                    type="date"
                    required
                    value={cutiSelesai}
                    onChange={(e) => setCutiSelesai(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Alasan / Keterangan
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Keterangan keperluan cuti..."
                  value={cutiKeterangan}
                  onChange={(e) => setCutiKeterangan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCuti(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-sm"
                >
                  Kirim Permohonan Cuti
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
