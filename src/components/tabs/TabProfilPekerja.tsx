import React, { useState } from 'react';
import { 
  User, 
  ExternalLink, 
  Plus, 
  Trash2, 
  TrendingUp, 
  ArrowRight, 
  Printer, 
  FileText, 
  CheckCircle2, 
  Clock,
  FolderOpen
} from 'lucide-react';
import { PekerjaData, LinkArsipRecord } from '../../types';
import { getPKWTStatusInfo } from '../../utils/pkwtUtils';

interface TabProfilPekerjaProps {
  pekerjaList: PekerjaData[];
  currentScope: string;
  lockedNama?: string;
}

export const TabProfilPekerja: React.FC<TabProfilPekerjaProps> = ({
  pekerjaList,
  currentScope,
  lockedNama
}) => {
  const filteredPekerja = pekerjaList.filter(p => {
    return currentScope === 'ALL' || p.unitSekup === currentScope;
  });

  const [selectedNama, setSelectedNama] = useState(lockedNama || filteredPekerja[0]?.nama || '');
  const [links, setLinks] = useState<LinkArsipRecord[]>([
    { row: 1, label: 'Folder Arsip Dokumen KTP & KK', url: 'https://drive.google.com' },
    { row: 2, label: 'Surat Lamaran & Pakta Integritas K3', url: 'https://drive.google.com' }
  ]);
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const currentPekerja = pekerjaList.find(p => p.nama === selectedNama) || filteredPekerja[0];

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkLabel || !newLinkUrl) return;
    setLinks([...links, { row: Date.now(), label: newLinkLabel, url: newLinkUrl }]);
    setShowAddLink(false);
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  const handleDeleteLink = (row: number) => {
    setLinks(links.filter(l => l.row !== row));
  };

  // Synthetic attendance index for preview
  const pctBulanIni = 98.2;
  const pctBulanLalu = 96.5;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Selector Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Profil Lengkap Pekerja</h2>
            <p className="text-xs text-slate-500">Data identitas, performa presensi komparatif, dan link arsip dokumen</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lockedNama ? (
            <div className="px-3 py-2 rounded-xl border border-blue-200 bg-blue-50/80 text-xs font-bold text-blue-900 flex items-center gap-2">
              <span>{lockedNama}</span>
              <span className="text-[10px] bg-blue-200 px-1.5 py-0.5 rounded text-blue-800 font-semibold">Terkunci</span>
            </div>
          ) : (
            <select
              value={selectedNama}
              onChange={(e) => setSelectedNama(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none"
            >
              {filteredPekerja.map(p => (
                <option key={p.id} value={p.nama}>{p.nama} ({p.unit})</option>
              ))}
            </select>
          )}

          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Cetak Profil
          </button>
        </div>
      </div>

      {currentPekerja && (
        <div className="space-y-5">
          
          {/* Main ID & Details Grid */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">{currentPekerja.nama}</h3>
                <span className="text-xs text-blue-600 font-mono font-bold">ID #{currentPekerja.id}</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                currentPekerja.status === 'TETAP' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
              }`}>
                {currentPekerja.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Unit Penugasan</span>
                <span className="font-bold text-slate-800 text-sm">{currentPekerja.unit}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Sekup Operasional</span>
                <span className="font-bold text-slate-800 text-sm">{currentPekerja.sekup}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Upah Harian</span>
                <span className="font-bold text-emerald-700 text-sm font-mono">
                  Rp {Math.round(currentPekerja.upahHarian).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Pendidikan Terakhir</span>
                <span className="font-bold text-slate-800 text-sm">{currentPekerja.pendidikanTerakhir || '-'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
              <div>
                <span className="text-slate-400 block">Jabatan / Lingkup:</span>
                <span className="font-bold text-slate-800">{currentPekerja.jabatan || 'Harian'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Awal PKWT:</span>
                <span className="font-mono text-slate-800">{currentPekerja.awalPKWT || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Akhir PKWT:</span>
                <span className="font-mono font-bold text-slate-800">{currentPekerja.akhirPKWT || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Status Kontrak / PKWT:</span>
                {(() => {
                  const info = getPKWTStatusInfo(currentPekerja.status, currentPekerja.akhirPKWT);
                  return (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border ${info.badgeColor}`}>
                      <span>{info.statusText}</span>
                      {info.statusText !== 'TETAP' && info.statusText !== '-' && (
                        <span className="font-normal opacity-85 text-[10px]">({info.labelDetail})</span>
                      )}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Performance Comparison (Bulan Lalu vs Bulan Ini) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Parameter Presensi (Bulan Lalu vs Bulan Ini)</span>
              </div>

              <div className="flex items-center justify-around p-4 bg-slate-50 rounded-xl text-center">
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Agustus 2026</span>
                  <div className="text-2xl font-black text-slate-800 font-mono">{pctBulanLalu}%</div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Baik
                  </span>
                </div>

                <ArrowRight className="w-6 h-6 text-slate-400" />

                <div>
                  <span className="text-xs text-slate-500 block mb-1">September 2026</span>
                  <div className="text-2xl font-black text-blue-700 font-mono">{pctBulanIni}%</div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Baik
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-500 flex justify-between items-center px-1">
                <span>Evaluasi Progres:</span>
                <span className="font-bold text-emerald-700">↗ Membaik (+1.7%)</span>
              </div>
            </div>

            {/* Link Arsip Dokumen Google Drive */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-blue-600" />
                  <span>Link Arsip Administratif (Google Drive)</span>
                </div>
                <button
                  onClick={() => setShowAddLink(true)}
                  className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {links.map(l => (
                  <div key={l.row} className="p-2.5 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50">
                    <span className="font-medium text-slate-800">{l.label}</span>
                    <div className="flex items-center gap-2">
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-[11px] font-semibold flex items-center gap-1 hover:bg-blue-100"
                      >
                        Buka ↗
                      </a>
                      <button
                        onClick={() => handleDeleteLink(l.row)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {showAddLink && (
                <form onSubmit={handleAddLink} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Label (cth: Berkas KTP & KK)"
                    value={newLinkLabel}
                    onChange={(e) => setNewLinkLabel(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/..."
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddLink(false)}
                      className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 text-[11px]"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded bg-blue-600 text-white font-bold text-[11px]"
                    >
                      Simpan Link
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
