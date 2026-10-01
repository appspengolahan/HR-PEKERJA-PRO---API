import React from 'react';
import { X, Printer } from 'lucide-react';
import { SuratIjinData } from '../../types';

interface SuratIjinModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SuratIjinData | null;
}

export const SuratIjinModal: React.FC<SuratIjinModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-200 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
        
        {/* Modal Toolbar */}
        <div className="p-3 sm:p-4 bg-white border-b border-slate-300 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800">
              Preview Formulir Resmi: Surat Permohonan Ijin
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
              Ukuran Standar 20,5 × 16 cm
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Paper Container (20.5cm x 16cm) */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 flex items-center justify-center bg-slate-300/60">
          
          <div 
            id="suratIjinPaper"
            className="bg-white text-black shadow-xl font-sans p-6 text-[12px] leading-snug border border-slate-300"
            style={{
              width: '20.5cm',
              minHeight: '16cm',
              boxSizing: 'border-box'
            }}
          >
            {/* Header */}
            <div className="text-center font-bold text-base tracking-wider uppercase mb-1">
              SURAT PERMOHONAN IJIN
            </div>

            <div className="text-center text-xs font-bold mb-4 flex items-center justify-center gap-6">
              <span className="flex items-center gap-1">
                <span>☐</span> Bulanan
              </span>
              <span className="flex items-center gap-1 font-extrabold text-blue-900">
                <span>☑</span> Harian *
              </span>
            </div>

            <div className="mb-2">Yang bertanda tangan di bawah ini:</div>

            <div className="space-y-1.5 mb-3 pl-2">
              <div className="flex items-baseline">
                <span className="w-44 font-bold flex-shrink-0">Nama</span>
                <span className="mr-2">:</span>
                <span className="font-bold border-b border-dotted border-black flex-1 min-h-[18px]">
                  {data.nama}
                </span>
              </div>
              <div className="flex items-baseline">
                <span className="w-44 font-bold flex-shrink-0">Jabatan / Pekerjaan</span>
                <span className="mr-2">:</span>
                <span className="border-b border-dotted border-black flex-1 min-h-[18px]">
                  {data.jabatan || 'Harian'}
                </span>
              </div>
              <div className="flex items-baseline">
                <span className="w-44 font-bold flex-shrink-0">Divisi / Unit</span>
                <span className="mr-2">:</span>
                <span className="border-b border-dotted border-black flex-1 min-h-[18px]">
                  {data.divisi} / {data.unit}
                </span>
              </div>
            </div>

            {/* Checkboxes Block */}
            <div className="border border-slate-300 p-2.5 rounded bg-slate-50/50 mb-3 space-y-1 text-[11px]">
              <div className="font-bold text-slate-700 mb-1">Dengan ini mengajukan *:</div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span>{data.checkbox === 'normatif' ? '☑' : '☐'} Ijin Normatif</span>
                <span>{data.checkbox === 'tidakMasuk' ? '☑' : '☐'} Ijin Tidak Masuk Kerja</span>
                <span>{data.checkbox === 'terlambat' ? '☑' : '☐'} Ijin Datang Terlambat</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span>{data.checkbox === 'keluarSementara' ? '☑' : '☐'} Ijin Meninggalkan Tempat Kerja Sementara Waktu</span>
                <span>{data.checkbox === 'pulangCepat' ? '☑' : '☐'} Ijin Pulang Lebih Cepat</span>
              </div>
              <div>
                <span>{data.checkbox === 'eksternal' ? '☑' : '☐'} Ijin Melaksanakan Tugas Kerja Yang Bersifat Ekstern Perusahaan **</span>
              </div>
              <div>
                <span>{data.checkbox === 'formKehadiran' ? '☑' : '☐'} Form Kehadiran ***</span>
              </div>
            </div>

            <div className="mb-2">Pada :</div>

            <div className="space-y-1.5 pl-2 mb-3">
              <div className="flex items-baseline">
                <span className="w-44 font-bold flex-shrink-0">Hari</span>
                <span className="mr-2">:</span>
                <span className="font-semibold">{data.hari}</span>
                {data.hariAkhir && data.hariAkhir !== data.hari && (
                  <span className="ml-2 font-normal">s/d {data.hariAkhir}</span>
                )}
              </div>
              <div className="flex items-baseline">
                <span className="w-44 font-bold flex-shrink-0">Tanggal</span>
                <span className="mr-2">:</span>
                <span className="font-semibold">{data.tanggal}</span>
                {data.tanggalAkhir && data.tanggalAkhir !== data.tanggal && (
                  <span className="ml-2 font-normal">s/d {data.tanggalAkhir}</span>
                )}
              </div>
              <div className="flex items-baseline">
                <span className="w-44 font-bold flex-shrink-0">Keterangan Ijin / Keperluan</span>
                <span className="mr-2">:</span>
                <span className="border-b border-dotted border-black flex-1 min-h-[18px]">
                  {data.keperluan || '-'}
                </span>
              </div>
              <div className="flex flex-wrap items-baseline gap-4 text-[11px]">
                <div>
                  <span className="font-bold">Jam Masuk:</span> {data.jamMasuk || '-'}
                </div>
                <div>
                  <span className="font-bold">Jam Keluar:</span> {data.jamKeluar || '-'}
                </div>
                <div>
                  <span className="font-bold">Jam Masuk Kembali:</span> {data.jamMasukKembali || '-'}
                </div>
              </div>
              <div className="flex items-baseline pt-1">
                <span className="w-44 font-bold flex-shrink-0">Jumlah Ijin (Jam Kerja)</span>
                <span className="mr-2">:</span>
                <span className="font-bold">
                  {data.jamBagian} Jam {data.menitBagian} Menit
                </span>
                <span className="ml-2 text-[10px] text-slate-500 italic">
                  (Diisi Hanya Jam Kerja Yang Diambil Untuk Ijin Saja)
                </span>
              </div>
            </div>

            <div className="text-[10px] leading-relaxed italic mb-5 border-t border-slate-200 pt-2 text-slate-700">
              Demikian surat ijin ini kami buat dengan sebenarnya, kami bersedia menerima sanksi administrasi apabila dikemudian hari terjadi penyalahgunaan ijin / tidak sesuai dengan ijin yang kami ajukan.
            </div>

            {/* Signature Area */}
            <div className="grid grid-cols-2 gap-4 text-[11px] pt-2 border-t border-slate-300">
              <div>
                <div className="font-bold mb-1">Pejabat yang berwenang:</div>
                <div className="grid grid-cols-4 gap-1 text-[9px] text-center font-bold text-slate-600 mb-12">
                  <div>Mengetahui 3<br />HRD II &amp; Umum</div>
                  <div>Mengetahui 2</div>
                  <div>Mengetahui 1</div>
                  <div>Menyetujui</div>
                </div>
                <div className="grid grid-cols-4 gap-1 text-[9px] text-center font-mono text-slate-400">
                  <div>( ........... )</div>
                  <div>( ........... )</div>
                  <div>( ........... )</div>
                  <div>( ........... )</div>
                </div>
              </div>

              <div className="text-right flex flex-col justify-between items-end">
                <div>
                  <div>Malang, {data.tglCetak} 20{data.thnCetak}</div>
                  <div className="mt-1 font-bold">Diajukan oleh,</div>
                </div>
                <div className="mt-12 text-center min-w-[140px]">
                  <div className="font-bold underline text-xs">{data.namaTtd || data.nama}</div>
                  <div className="text-[10px] text-slate-500">Pekerja Harian</div>
                </div>
              </div>
            </div>

            {/* Footnotes */}
            <div className="mt-4 pt-2 border-t border-slate-200 text-[9px] text-slate-500 leading-tight space-y-0.5">
              <div>* Pilih salah satu (√).</div>
              <div>** Khusus tugas kerja yang bersifat ekstern Perusahaan tanpa dilengkapi Surat Tugas dari atasan.</div>
              <div>*** Jika salah satu dari cecklok masuk / pulang tidak terdeteksi di mesin absen sidik jari.</div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
