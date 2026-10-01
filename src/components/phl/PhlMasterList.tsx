import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  QrCode, 
  Edit3, 
  CheckCircle, 
  XCircle, 
  Phone, 
  CreditCard, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import { PekerjaPHL, PosLiniPHL } from '../../types';

interface PhlMasterListProps {
  pekerjaPHL: PekerjaPHL[];
  onAddPHL: (newWorker: PekerjaPHL) => void;
  onUpdatePHL: (updatedWorker: PekerjaPHL) => void;
  onSelectForQr: (worker: PekerjaPHL) => void;
}

export const PhlMasterList: React.FC<PhlMasterListProps> = ({
  pekerjaPHL,
  onAddPHL,
  onUpdatePHL,
  onSelectForQr
}) => {
  const [search, setSearch] = useState('');
  const [selectedLini, setSelectedLini] = useState<string>('Semua');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<PekerjaPHL | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    ktp: '',
    domisili: '',
    kontakDarurat: '',
    posLini: 'Sortir Gagang Cengkeh' as PosLiniPHL,
    rekeningBank: '',
    statusAktif: true
  });

  const liniList = [
    'Semua',
    'Sortir Gagang Cengkeh',
    'Grading Krosok',
    'Stacking Karung',
    'Kebersihan Area'
  ];

  const filtered = pekerjaPHL.filter(p => {
    const matchSearch = 
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.nip.toLowerCase().includes(search.toLowerCase()) ||
      p.ktp.includes(search) ||
      p.domisili.toLowerCase().includes(search.toLowerCase());
    const matchLini = selectedLini === 'Semua' || p.posLini === selectedLini;
    return matchSearch && matchLini;
  });

  const handleOpenAdd = () => {
    const nextNum = pekerjaPHL.length + 1;
    const formattedNum = String(nextNum).padStart(3, '0');
    setFormData({
      nama: '',
      ktp: '',
      domisili: '',
      kontakDarurat: '',
      posLini: 'Sortir Gagang Cengkeh',
      rekeningBank: '',
      statusAktif: true
    });
    setEditingWorker(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (worker: PekerjaPHL) => {
    setEditingWorker(worker);
    setFormData({
      nama: worker.nama,
      ktp: worker.ktp,
      domisili: worker.domisili,
      kontakDarurat: worker.kontakDarurat,
      posLini: worker.posLini,
      rekeningBank: worker.rekeningBank || '',
      statusAktif: worker.statusAktif
    });
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.ktp.trim()) {
      alert('Nama lengkap dan nomor KTP wajib diisi.');
      return;
    }

    if (editingWorker) {
      onUpdatePHL({
        ...editingWorker,
        nama: formData.nama,
        ktp: formData.ktp,
        domisili: formData.domisili,
        kontakDarurat: formData.kontakDarurat,
        posLini: formData.posLini,
        rekeningBank: formData.rekeningBank,
        statusAktif: formData.statusAktif
      });
    } else {
      const nextNum = pekerjaPHL.length + 1;
      const nip = `BK-PP1-PHL-${String(nextNum).padStart(3, '0')}`;
      const newWorker: PekerjaPHL = {
        id: `phl-${Date.now()}`,
        nip,
        nama: formData.nama,
        ktp: formData.ktp,
        domisili: formData.domisili,
        kontakDarurat: formData.kontakDarurat,
        posLini: formData.posLini,
        tanggalBergabung: new Date().toISOString().slice(0, 10),
        statusAktif: formData.statusAktif,
        rekeningBank: formData.rekeningBank
      };
      onAddPHL(newWorker);
    }

    setShowAddModal(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari NIP, nama, KTP, atau domisili..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>

        {/* Lini Filter & Add Button */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {liniList.map(lini => (
              <button
                key={lini}
                onClick={() => setSelectedLini(lini)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedLini === lini 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {lini}
              </button>
            ))}
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm ml-auto md:ml-0"
          >
            <Plus className="w-4 h-4" />
            Tambah Pekerja PHL
          </button>
        </div>

      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800">
              Daftar Pekerja Harian Lepas (PHL) Terdaftar ({filtered.length} Orang)
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Tab Sheet: Data_Pekerja_PHL
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">NIP &amp; Nama</th>
                <th className="py-3 px-4">No. KTP</th>
                <th className="py-3 px-4">Pos Penugasan Lini</th>
                <th className="py-3 px-4">Domisili</th>
                <th className="py-3 px-4">Kontak Darurat</th>
                <th className="py-3 px-4">Rekening Upah</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((w) => (
                <tr key={w.id} className="hover:bg-blue-50/40 transition-colors group">
                  
                  {/* NIP & Nama */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {w.nama}
                    </div>
                    <div className="text-[11px] font-mono text-blue-600 font-semibold">
                      {w.nip}
                    </div>
                  </td>

                  {/* KTP */}
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {w.ktp}
                  </td>

                  {/* Pos Lini */}
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      w.posLini === 'Sortir Gagang Cengkeh'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : w.posLini === 'Grading Krosok'
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        : w.posLini === 'Stacking Karung'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {w.posLini}
                    </span>
                  </td>

                  {/* Domisili */}
                  <td className="py-3 px-4 text-slate-600 max-w-[150px] truncate" title={w.domisili}>
                    {w.domisili}
                  </td>

                  {/* Kontak Darurat */}
                  <td className="py-3 px-4 text-slate-600">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {w.kontakDarurat}
                    </div>
                  </td>

                  {/* Rekening Upah */}
                  <td className="py-3 px-4 text-slate-600">
                    {w.rekeningBank ? (
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        {w.rekeningBank}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Tunai / Kasir</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">
                    {w.statusAktif ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        <XCircle className="w-3 h-3 text-slate-400" />
                        Nonaktif
                      </span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectForQr(w)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 transition-colors"
                        title="Buka QR Badge & ID Card PHL"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(w)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        title="Edit Data Pekerja"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">
                  {editingWorker ? 'Edit Data Pekerja PHL' : 'Tambah Pekerja Harian Lepas (PHL)'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {editingWorker ? `NIP: ${editingWorker.nip}` : 'Sistem otomatis menetapkan format NIP BK-PP1-PHL-xxx'}
                </p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap Sesuai KTP *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor Induk Kependudukan (KTP) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={formData.ktp}
                    onChange={(e) => setFormData({ ...formData, ktp: e.target.value })}
                    placeholder="16 digit angka KTP"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Pos Penugasan Lini Pabrik *
                  </label>
                  <select
                    value={formData.posLini}
                    onChange={(e) => setFormData({ ...formData, posLini: e.target.value as PosLiniPHL })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                  >
                    <option value="Sortir Gagang Cengkeh">Sortir Gagang Cengkeh (Rp 850/kg)</option>
                    <option value="Grading Krosok">Grading Krosok (Rp 950/kg)</option>
                    <option value="Stacking Karung">Stacking Karung (Rp 1.500/karung)</option>
                    <option value="Kebersihan Area">Kebersihan Area (Rp 120.000/hari)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Alamat Domisili Tempat Tinggal
                </label>
                <input
                  type="text"
                  value={formData.domisili}
                  onChange={(e) => setFormData({ ...formData, domisili: e.target.value })}
                  placeholder="Contoh: Jl. Rungkut Industri No. 12, Surabaya"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kontak Darurat (K3)
                  </label>
                  <input
                    type="text"
                    value={formData.kontakDarurat}
                    onChange={(e) => setFormData({ ...formData, kontakDarurat: e.target.value })}
                    placeholder="0812-xxxx-xxxx (Hubungan)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Rekening Pembayaran Upah
                  </label>
                  <input
                    type="text"
                    value={formData.rekeningBank}
                    onChange={(e) => setFormData({ ...formData, rekeningBank: e.target.value })}
                    placeholder="Contoh: BCA - 12345678"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.statusAktif}
                    onChange={(e) => setFormData({ ...formData, statusAktif: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-slate-700">Pekerja Aktif Bekerja</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm"
                  >
                    {editingWorker ? 'Simpan Perubahan' : 'Daftarkan PHL'}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
