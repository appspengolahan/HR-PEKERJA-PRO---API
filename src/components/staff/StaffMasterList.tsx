import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Clock, 
  Edit3, 
  CheckCircle2, 
  X,
  Calendar,
  Briefcase
} from 'lucide-react';
import { StaffPP1, ShiftType } from '../../types';

interface StaffMasterListProps {
  staffList: StaffPP1[];
  onAddStaff: (newStaff: StaffPP1) => void;
  onUpdateStaff: (updatedStaff: StaffPP1) => void;
}

export const StaffMasterList: React.FC<StaffMasterListProps> = ({
  staffList,
  onAddStaff,
  onUpdateStaff
}) => {
  const [search, setSearch] = useState('');
  const [selectedJabatan, setSelectedJabatan] = useState<string>('Semua');
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffPP1 | null>(null);

  const [formData, setFormData] = useState({
    nama: '',
    jabatan: 'Teknisi Mesin' as StaffPP1['jabatan'],
    telepon: '',
    email: '',
    status: 'Tetap' as 'Tetap' | 'Kontrak',
    shiftDefault: 'Shift 1 (Pagi 07:00-15:00)' as ShiftType,
    sisaCuti: 12
  });

  const jabatanList = [
    'Semua',
    'Manajer Operasional',
    'Foreman / Mandor',
    'Teknisi Mesin',
    'Admin Lab QC',
    'Operator Senior',
    'Supervisor K3'
  ];

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      nama: '',
      jabatan: 'Teknisi Mesin',
      telepon: '',
      email: '',
      status: 'Tetap',
      shiftDefault: 'Shift 1 (Pagi 07:00-15:00)',
      sisaCuti: 12
    });
    setShowModal(true);
  };

  const handleOpenEdit = (s: StaffPP1) => {
    setEditingStaff(s);
    setFormData({
      nama: s.nama,
      jabatan: s.jabatan,
      telepon: s.telepon,
      email: s.email,
      status: s.status,
      shiftDefault: s.shiftDefault,
      sisaCuti: s.sisaCuti
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) return;

    if (editingStaff) {
      onUpdateStaff({
        ...editingStaff,
        nama: formData.nama,
        jabatan: formData.jabatan,
        telepon: formData.telepon,
        email: formData.email,
        status: formData.status,
        shiftDefault: formData.shiftDefault,
        sisaCuti: formData.sisaCuti
      });
    } else {
      const nextNum = staffList.length + 1;
      const nip = `BK-PP1-${String(nextNum).padStart(3, '0')}`;
      const newStaff: StaffPP1 = {
        id: `staff-${Date.now()}`,
        nip,
        nama: formData.nama,
        jabatan: formData.jabatan,
        divisi: 'Divisi Produksi 1 (PP1)',
        telepon: formData.telepon,
        email: formData.email,
        tanggalBergabung: new Date().toISOString().slice(0, 10),
        status: formData.status,
        shiftDefault: formData.shiftDefault,
        sisaCuti: formData.sisaCuti
      };
      onAddStaff(newStaff);
    }

    setShowModal(false);
  };

  const filtered = staffList.filter(s => {
    const matchSearch = 
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.nip.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchJabatan = selectedJabatan === 'Semua' || s.jabatan === selectedJabatan;
    return matchSearch && matchJabatan;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Action Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari NIP, nama, atau email staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <select
            value={selectedJabatan}
            onChange={(e) => setSelectedJabatan(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none"
          >
            {jabatanList.map(j => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm ml-auto md:ml-0"
          >
            <Plus className="w-4 h-4" />
            Tambah Staff PP1
          </button>
        </div>

      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800">
              Data Karyawan Struktural Tetap &amp; Kontrak ({filtered.length} Staff)
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Tab Sheet: Data_Staff_PP1
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">NIP &amp; Nama Lengkap</th>
                <th className="py-3 px-4">Jabatan Struktural</th>
                <th className="py-3 px-4">Shift Standar</th>
                <th className="py-3 px-4">Kontak (Telp &amp; Email)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Sisa Cuti</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors">
                  
                  {/* NIP & Nama */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{s.nama}</div>
                    <div className="text-[11px] font-mono font-semibold text-indigo-600">
                      {s.nip}
                    </div>
                  </td>

                  {/* Jabatan */}
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">{s.jabatan}</span>
                    <div className="text-[11px] text-slate-400">{s.divisi}</div>
                  </td>

                  {/* Shift Default */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {s.shiftDefault}
                    </div>
                  </td>

                  {/* Kontak */}
                  <td className="py-3 px-4">
                    <div className="text-[11px] text-slate-600 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {s.telepon}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {s.email}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.status === 'Tetap'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {s.status}
                    </span>
                  </td>

                  {/* Sisa Cuti */}
                  <td className="py-3 px-4 text-center font-bold text-slate-700 font-mono">
                    {s.sisaCuti} Hari
                  </td>

                  {/* Aksi */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                      title="Edit Data Staff"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">
                  {editingStaff ? 'Edit Data Staff' : 'Daftarkan Staff PP1 Baru'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Format NIP otomatis BK-PP1-xxx
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap &amp; Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Ir. Bambang Sugiantoro"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jabatan Struktural PP1 *
                </label>
                <select
                  value={formData.jabatan}
                  onChange={(e) => setFormData({ ...formData, jabatan: e.target.value as StaffPP1['jabatan'] })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                >
                  <option value="Manajer Operasional">Manajer Operasional</option>
                  <option value="Foreman / Mandor">Foreman / Mandor</option>
                  <option value="Teknisi Mesin">Teknisi Mesin</option>
                  <option value="Admin Lab QC">Admin Lab QC</option>
                  <option value="Operator Senior">Operator Senior</option>
                  <option value="Supervisor K3">Supervisor K3</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Resmi
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@batukarang.co.id"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Status Karyawan
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Tetap' | 'Kontrak' })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                  >
                    <option value="Tetap">Karyawan Tetap</option>
                    <option value="Kontrak">Kontrak Kerja</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Hak Cuti Tahunan (Hari)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={formData.sisaCuti}
                    onChange={(e) => setFormData({ ...formData, sisaCuti: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Shift Kerja Rutin
                </label>
                <select
                  value={formData.shiftDefault}
                  onChange={(e) => setFormData({ ...formData, shiftDefault: e.target.value as ShiftType })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                >
                  <option value="Shift 1 (Pagi 07:00-15:00)">Shift 1 (Pagi 07:00 - 15:00)</option>
                  <option value="Shift 2 (Sore 15:00-23:00)">Shift 2 (Sore 15:00 - 23:00)</option>
                  <option value="Shift 3 (Malam 23:00-07:00)">Shift 3 (Malam 23:00 - 07:00)</option>
                  <option value="Non-Shift (Office 08:00-16:00)">Non-Shift (Office 08:00 - 16:00)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Simpan Data Staff
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
