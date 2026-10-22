import React, { useState } from 'react';
import { UserCheck, Shield, X, Check, Lock } from 'lucide-react';
import { UserScope } from '../../types';
import { AuthUser, getUserAuthorizedUnitSekups } from '../../services/authService';

interface ScopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScope: UserScope;
  unitSekupList: string[];
  onSelectScope: (scope: UserScope) => void;
  currentUser?: AuthUser | null;
}

export const ScopeModal: React.FC<ScopeModalProps> = ({
  isOpen,
  onClose,
  currentScope,
  unitSekupList,
  onSelectScope,
  currentUser
}) => {
  const [selected, setSelected] = useState<string>(currentScope || 'ALL');

  if (!isOpen) return null;

  const authorizedScopes = getUserAuthorizedUnitSekups(currentUser || null);
  const canAccessAll = authorizedScopes.includes('ALL');

  // Filter unitSekupList based on user role authorization
  const availableUnitSekups = canAccessAll
    ? unitSekupList
    : unitSekupList.filter(item => {
        return authorizedScopes.some(auth => 
          item.toLowerCase().includes(auth.toLowerCase()) || 
          auth.toLowerCase().includes(item.toLowerCase())
        );
      });

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
              <h3 className="text-sm font-bold">Pilih Tim / Sekup Unit</h3>
              <p className="text-[11px] text-slate-400">
                {currentUser?.role ? `Peran Anda: ${currentUser.role}` : 'Atur lingkup data yang ingin Anda kelola'}
              </p>
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
            {canAccessAll 
              ? 'Anda memiliki akses penuh. Anda dapat memilih untuk melihat seluruh pekerja atau menyaring ke tim unit tertentu.'
              : `Berdasarkan hak akses peran (${currentUser?.role}), Anda hanya dapat mengakses data pekerja pada unit yang ditugaskan.`
            }
          </p>

          <div className="space-y-2">
            {canAccessAll && (
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
                    <div className="font-bold">🔑 Akses Seluruh Unit (ALL)</div>
                    <div className="text-[10px] text-slate-500">Melihat seluruh pekerja di Divisi Produksi I</div>
                  </div>
                </div>
                {selected === 'ALL' && <Check className="w-4 h-4 text-blue-600" />}
              </button>
            )}

            <div className="pt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Unit &amp; Sekup yang Diizinkan:</span>
              {!canAccessAll && (
                <span className="text-amber-600 font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Terkunci Hak Akses
                </span>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {availableUnitSekups.map(item => (
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

              {availableUnitSekups.length === 0 && (
                <div className="p-3 text-center text-slate-400 bg-slate-50 rounded-xl">
                  Tidak ada unit sekup spesifik yang terdaftar untuk peran ini.
                </div>
              )}
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
