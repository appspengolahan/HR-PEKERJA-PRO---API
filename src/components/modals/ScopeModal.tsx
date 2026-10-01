import React, { useState } from 'react';
import { UserCheck, Shield, X, Check } from 'lucide-react';
import { UserScope } from '../../types';

interface ScopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScope: UserScope;
  unitSekupList: string[];
  onSelectScope: (scope: UserScope) => void;
}

export const ScopeModal: React.FC<ScopeModalProps> = ({
  isOpen,
  onClose,
  currentScope,
  unitSekupList,
  onSelectScope
}) => {
  const [selected, setSelected] = useState<string>(currentScope || 'ALL');

  if (!isOpen) return null;

  const handleSave = () => {
    onSelectScope(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-slate-800">
        
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Pilih Tim / Peran Anda</h3>
              <p className="text-[11px] text-slate-400">Atur lingkup data yang ingin Anda kelola</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Pilih tim (Unit + Sekup) yang Anda awasi. Jika Anda adalah <strong>Manajer Operasional</strong>, pilih opsi akses penuh untuk melihat seluruh pekerja di Divisi Produksi I.
          </p>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setSelected('ALL')}
              className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                selected === 'ALL'
                  ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="font-bold">🔑 Manajer Operasional</div>
                  <div className="text-[10px] text-slate-500">Akses Penuh Seluruh Unit &amp; Sekup</div>
                </div>
              </div>
              {selected === 'ALL' && <Check className="w-4 h-4 text-blue-600" />}
            </button>

            <div className="pt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Tim Operasional Berdasarkan Unit &amp; Sekup:
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {unitSekupList.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSelected(item)}
                  className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                    selected === item
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="font-medium">👤 {item}</span>
                  {selected === item && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm"
            >
              Terapkan Pilihan
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
