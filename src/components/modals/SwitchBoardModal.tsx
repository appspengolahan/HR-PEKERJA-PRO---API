import React, { useState } from 'react';
import { 
  X, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  Layers
} from 'lucide-react';
import { SWITCHBOARD_APPS } from '../../data/initialData';
import { SwitchBoardApp } from '../../types';

interface SwitchBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectApp?: (app: SwitchBoardApp) => void;
}

export const SwitchBoardModal: React.FC<SwitchBoardModalProps> = ({
  isOpen,
  onClose,
  onSelectApp
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  if (!isOpen) return null;

  const categories = ['Semua', 'Supply Chain', 'Operasional & Mesin', 'Administrasi', 'Kemitraan'];

  const filteredApps = SWITCHBOARD_APPS.filter(app => {
    const matchSearch = app.nama.toLowerCase().includes(search.toLowerCase()) || 
                        app.deskripsi.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'Semua' || app.kategori === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">Master Switch Board PP1</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Workspace OS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Portal Ekosistem 8 Modul Operasional PT Batu Karang — Divisi Produksi 1
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari modul operasional..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Modul Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredApps.map((app) => {
            const isCurrent = app.isCurrentApp;
            return (
              <div 
                key={app.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isCurrent 
                    ? 'bg-blue-50/50 border-blue-400/80 shadow-md ring-1 ring-blue-300' 
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {app.kategori}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      app.statusBadge === 'Live Vercel'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : app.statusBadge === 'Aktif'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {app.statusBadge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                    {app.nama}
                    {isCurrent && (
                      <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-md font-semibold">
                        Aplikasi Saat Ini
                      </span>
                    )}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {app.deskripsi}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {isCurrent ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      Sedang Aktif Digunakan
                    </div>
                  ) : app.isExternal ? (
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Buka di Vercel
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <button
                      onClick={() => {
                        if (onSelectApp) onSelectApp(app);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors border border-slate-200"
                    >
                      Buka Modul
                    </button>
                  )}

                  <span className="text-[10px] font-mono text-slate-400">
                    PP1-OS#{app.nomor}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Terhubung CI/CD GitHub & Vercel Production Environment
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition-colors"
          >
            Tutup Portal
          </button>
        </div>

      </div>
    </div>
  );
};
