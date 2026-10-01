import React, { useState } from 'react';
import { 
  BadgePercent, 
  Search, 
  Printer, 
  DollarSign, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { PekerjaData, SlipUpahData } from '../../types';
import { gasClient } from '../../services/gasClient';

interface TabSlipUpahProps {
  pekerjaList: PekerjaData[];
  currentScope: string;
}

export const TabSlipUpah: React.FC<TabSlipUpahProps> = ({
  pekerjaList,
  currentScope
}) => {
  const [mode, setMode] = useState<'bulan' | 'rentang'>('bulan');
  const [selectedNama, setSelectedNama] = useState(pekerjaList[0]?.nama || '');
  const [bulan, setBulan] = useState(String(new Date().getMonth() + 1));
  const [tahun, setTahun] = useState(String(new Date().getFullYear()));
  
  const [tglAwal, setTglAwal] = useState(new Date().toISOString().slice(0, 10));
  const [tglAkhir, setTglAkhir] = useState(new Date().toISOString().slice(0, 10));
  
  const [slipData, setSlipData] = useState<SlipUpahData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredPekerja = pekerjaList.filter(p => {
    return currentScope === 'ALL' || p.unitSekup === currentScope;
  });

  const handleFetchSlip = async () => {
    if (!selectedNama) {
      alert('Pilih pekerja terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    const worker = pekerjaList.find(p => p.nama === selectedNama);
    const upahHarian = worker?.upahHarian || 146675.96;

    try {
      if (mode === 'rentang') {
        const res = await gasClient.getSlipUpahRentang(selectedNama, tglAwal, tglAkhir);
        if (res.status === 'success' && res.data) {
          const d = res.data as {
            nama: string;
            periode?: string;
            unit?: string;
            sekup?: string;
            upahHarian: number;
            hariKerjaTersedia: number;
            hariTidakDibayar: number;
            hariDibayar: number;
            upahPokok: number;
            totalLembur: number;
            totalDiterima: number;
          };
          setSlipData({
            nama: d.nama,
            periode: d.periode || `${tglAwal} - ${tglAkhir}`,
            unit: d.unit || worker?.unit || '-',
            sekup: d.sekup || worker?.sekup || '-',
            upahHarian: d.upahHarian,
            hariKerjaTersedia: d.hariKerjaTersedia,
            hariTidakDibayar: d.hariTidakDibayar,
            hariDibayar: d.hariDibayar,
            upahPokok: d.upahPokok,
            totalLembur: d.totalLembur,
            totalDiterima: d.totalDiterima
          });
        } else {
          // Calculate locally based on Monday-Saturday working days in date range
          const start = new Date(tglAwal + 'T00:00:00');
          const end = new Date(tglAkhir + 'T00:00:00');
          let availableDays = 0;
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            if (d.getDay() !== 0) availableDays++; // Monday-Saturday
          }
          const hariTidakDibayar = 0;
          const hariDibayar = availableDays - hariTidakDibayar;
          const upahPokok = upahHarian * hariDibayar;
          const totalLembur = 0;

          setSlipData({
            nama: selectedNama,
            periode: `${tglAwal} s/d ${tglAkhir}`,
            unit: worker?.unit || '-',
            sekup: worker?.sekup || '-',
            upahHarian: upahHarian,
            hariKerjaTersedia: availableDays,
            hariTidakDibayar,
            hariDibayar,
            upahPokok,
            totalLembur,
            totalDiterima: upahPokok + totalLembur
          });
        }
      } else {
        // Mode Per Bulan (Standard 26 working days)
        const hariKerjaTersedia = 26;
        const hariTidakDibayar = 0;
        const hariDibayar = hariKerjaTersedia - hariTidakDibayar;
        const upahPokok = upahHarian * hariDibayar;
        const totalLembur = 0;

        const namaBulan = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ][Number(bulan) - 1] || '';

        setSlipData({
          nama: selectedNama,
          periode: `${namaBulan} ${tahun}`,
          unit: worker?.unit || '-',
          sekup: worker?.sekup || '-',
          upahHarian: upahHarian,
          hariKerjaTersedia,
          hariTidakDibayar,
          hariDibayar,
          upahPokok,
          totalLembur,
          totalDiterima: upahPokok + totalLembur
        });
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const fmtRupiah = (val: number | string) => {
    const num = Number(val);
    if (isNaN(num)) return String(val);
    return `Rp ${Math.round(num).toLocaleString('id-ID')}`;
  };

  const bulanOptions = [
    { val: '1', label: 'Januari' }, { val: '2', label: 'Februari' }, { val: '3', label: 'Maret' },
    { val: '4', label: 'April' }, { val: '5', label: 'Mei' }, { val: '6', label: 'Juni' },
    { val: '7', label: 'Juli' }, { val: '8', label: 'Agustus' }, { val: '9', label: 'September' },
    { val: '10', label: 'Oktober' }, { val: '11', label: 'November' }, { val: '12', label: 'Desember' }
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Search & Mode Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 print:hidden">
        
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">Perhitungan &amp; Cetak Slip Upah Pekerja</h2>
          <p className="text-xs text-slate-500">Pilih mode bulanan kalender atau mode rentang tanggal mingguan</p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-6 text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
            <input
              type="radio"
              name="slip_mode"
              value="bulan"
              checked={mode === 'bulan'}
              onChange={() => { setMode('bulan'); setSlipData(null); }}
              className="w-4 h-4 text-blue-600"
            />
            <span>Mode 1: Per Bulan (Standar 26 Hari)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
            <input
              type="radio"
              name="slip_mode"
              value="rentang"
              checked={mode === 'rentang'}
              onChange={() => { setMode('rentang'); setSlipData(null); }}
              className="w-4 h-4 text-blue-600"
            />
            <span>Mode 2: Rentang Tanggal Bebas (Upah Mingguan)</span>
          </label>
        </div>

        {/* Inputs based on mode */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          
          <div>
            <label className="block text-slate-500 font-bold mb-1">Nama Pekerja *</label>
            <select
              value={selectedNama}
              onChange={(e) => setSelectedNama(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold"
            >
              {filteredPekerja.map(p => (
                <option key={p.id} value={p.nama}>{p.nama}</option>
              ))}
            </select>
          </div>

          {mode === 'bulan' ? (
            <>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Bulan</label>
                <select
                  value={bulan}
                  onChange={(e) => setBulan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50"
                >
                  {bulanOptions.map(b => (
                    <option key={b.val} value={b.val}>{b.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Tahun</label>
                <select
                  value={tahun}
                  onChange={(e) => setTahun(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Tanggal Awal *</label>
                <input
                  type="date"
                  value={tglAwal}
                  onChange={(e) => setTglAwal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Tanggal Akhir *</label>
                <input
                  type="date"
                  value={tglAkhir}
                  onChange={(e) => setTglAkhir(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-mono"
                />
              </div>
            </>
          )}

          <div className="flex items-end">
            <button
              onClick={handleFetchSlip}
              disabled={isLoading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Search className="w-4 h-4" />
              {isLoading ? 'Menghitung...' : 'Tampilkan Slip'}
            </button>
          </div>

        </div>

      </div>

      {/* Slip Display Card */}
      {slipData && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 max-w-xl mx-auto space-y-4">
          
          <div className="flex justify-between items-center border-b border-slate-200 pb-3 print:hidden">
            <span className="text-[11px] font-mono text-slate-400">DIVISI PRODUKSI I</span>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Slip Upah
            </button>
          </div>

          <div className="text-center space-y-0.5">
            <div className="text-base font-black tracking-wider text-slate-900 uppercase">
              SLIP UPAH PEKERJA HARIAN
            </div>
            <div className="text-xs text-blue-700 font-bold">
              PT BATU KARANG — DIVISI PRODUKSI 1 (PP1)
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Periode: {slipData.periode}
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs py-2">
            
            <div className="py-2 flex justify-between">
              <span className="text-slate-500 font-medium">Nama Pekerja:</span>
              <span className="font-extrabold text-slate-900">{slipData.nama}</span>
            </div>

            <div className="py-2 flex justify-between">
              <span className="text-slate-500 font-medium">Unit &amp; Sekup:</span>
              <span className="font-semibold text-slate-800">{slipData.unit} • {slipData.sekup}</span>
            </div>

            <div className="py-2 flex justify-between">
              <span className="text-slate-500 font-medium">Upah Harian Standar:</span>
              <span className="font-mono font-bold text-slate-800">{fmtRupiah(slipData.upahHarian)}</span>
            </div>

            <div className="py-2 flex justify-between">
              <span className="text-slate-500 font-medium">Hari Kerja Tersedia:</span>
              <span className="font-mono font-bold text-slate-800">{slipData.hariKerjaTersedia} Hari</span>
            </div>

            <div className="py-2 flex justify-between text-red-600">
              <span>Hari Tidak Dibayar (Ijin / Sakit):</span>
              <span className="font-mono font-bold">- {slipData.hariTidakDibayar} Hari</span>
            </div>

            <div className="py-2 flex justify-between bg-slate-50 font-bold px-2 rounded">
              <span>Hari Dibayar Penuh:</span>
              <span className="font-mono text-blue-700">{slipData.hariDibayar} Hari</span>
            </div>

            <div className="py-2 flex justify-between">
              <span className="text-slate-500 font-medium">Upah Pokok (Hari Dibayar x Upah Harian):</span>
              <span className="font-mono font-bold text-slate-800">{fmtRupiah(slipData.upahPokok)}</span>
            </div>

            <div className="py-2 flex justify-between">
              <span className="text-slate-500 font-medium">Total Upah Lembur:</span>
              <span className="font-mono font-bold text-slate-800">{fmtRupiah(slipData.totalLembur)}</span>
            </div>

            <div className="pt-3 pb-1 flex justify-between items-center text-sm font-black text-slate-900 bg-blue-50/80 p-3 rounded-xl border border-blue-200 mt-2">
              <span className="uppercase tracking-wider">TOTAL UPAH DITERIMA:</span>
              <span className="font-mono text-base text-blue-800">
                {fmtRupiah(slipData.totalDiterima)}
              </span>
            </div>

          </div>

          <div className="text-[10px] text-slate-400 italic text-center pt-2 border-t border-slate-100">
            * Tidak ada potongan BPJS / PPh21 formal (sesuai kebijakan pengupahan pekerja harian saat ini).
          </div>

        </div>
      )}

    </div>
  );
};
