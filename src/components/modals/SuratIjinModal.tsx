import React, { useState, useEffect } from 'react';
import { X, Printer, Edit2, RotateCcw, FileText, CheckSquare, Eye } from 'lucide-react';
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
  // Local state to allow inline editing/customization before printing
  const [formData, setFormData] = useState<SuratIjinData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isBlankForm, setIsBlankForm] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData({ ...data });
      setIsBlankForm(false);
      setIsEditMode(false);
    }
  }, [data]);

  if (!isOpen || !formData) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleToggleBlank = () => {
    if (!isBlankForm && data) {
      setIsBlankForm(true);
      setFormData({
        nama: '....................................................',
        jabatan: '....................................................',
        divisi: 'Produksi I',
        unit: '........................',
        checkbox: '',
        isBulanan: false,
        hari: '........................',
        tanggal: '........................',
        keperluan: '........................................................................................................',
        jamMasuk: '.......',
        jamKeluar: '.......',
        jamMasukKembali: '.......',
        jamBagian: 0,
        menitBagian: 0,
        tglCetak: '.... ...............',
        thnCetak: '..',
        namaTtd: '....................................'
      });
    } else if (data) {
      setIsBlankForm(false);
      setFormData({ ...data });
    }
  };

  const handleReset = () => {
    if (data) {
      setFormData({ ...data });
      setIsBlankForm(false);
    }
  };

  const currentCheckbox = formData.checkbox;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Printable styles isolated strictly to this form */}
      <style>{`
        @page {
          size: 20.5cm 16cm;
          margin: 0;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          #suratIjinPaperRoot, #suratIjinPaperRoot * {
            visibility: visible !important;
          }
          #suratIjinPaperRoot {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 20.5cm !important;
            height: 16cm !important;
            max-height: 16cm !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 0.6cm 0.8cm 0.4cm 0.8cm !important;
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
          .print-hidden-element {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[96vh] flex flex-col overflow-hidden">
        
        {/* Modal Toolbar (Screen Only) */}
        <div className="p-3 sm:p-4 bg-white border-b border-slate-300 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  Formulir Cetak Fisik: Surat Permohonan Ijin
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-200">
                  Standar Kertas 20,5 × 16 cm (GAS Lama)
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Format resmi fisik PT Batu Karang Divisi Produksi I (PP1) untuk printer dot matrix / continuous form.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                isEditMode
                  ? 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Sesuaikan isian sebelum dicetak"
            >
              {isEditMode ? <Eye className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
              {isEditMode ? 'Mode Preview' : 'Sesuaikan Data'}
            </button>

            <button
              onClick={handleToggleBlank}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                isBlankForm
                  ? 'bg-purple-100 border-purple-300 text-purple-800'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Cetak lembar formulir fisik kosong untuk diisi manual"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              {isBlankForm ? 'Isi Otomatis' : 'Blanko Kosong'}
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors border border-slate-200"
              title="Kembalikan data asal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / Simpan PDF
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Paper Preview Desk Area */}
        <div className="p-4 sm:p-8 overflow-auto flex-1 flex items-center justify-center bg-slate-300/80">
          
          {/* THE OFFICIAL 20.5cm x 16cm PAPER */}
          <div 
            id="suratIjinPaperRoot"
            className="bg-white text-black shadow-2xl p-6 text-[11px] leading-[1.3] border border-slate-300 font-sans select-text relative"
            style={{
              width: '20.5cm',
              height: '16cm',
              maxHeight: '16cm',
              boxSizing: 'border-box',
              margin: '0 auto',
              overflow: 'hidden'
            }}
          >
            {/* 1. Header Title & Worker Category */}
            <div className="text-center font-bold text-[15px] tracking-wider uppercase mb-1 font-sans text-black">
              SURAT PERMOHONAN IJIN
            </div>

            <div className="text-center text-[11px] font-bold mb-3 flex items-center justify-center gap-8">
              <label 
                className={`flex items-center gap-1.5 cursor-pointer select-none ${
                  formData.isBulanan ? 'font-bold' : 'font-normal'
                }`}
                onClick={() => setFormData({ ...formData, isBulanan: !formData.isBulanan })}
              >
                <span className="text-[13px] inline-block w-4 text-center">
                  {formData.isBulanan ? '☑' : '☐'}
                </span>
                <span>Bulanan</span>
              </label>

              <label 
                className={`flex items-center gap-1.5 cursor-pointer select-none ${
                  !formData.isBulanan ? 'font-bold' : 'font-normal'
                }`}
                onClick={() => setFormData({ ...formData, isBulanan: !formData.isBulanan })}
              >
                <span className="text-[13px] inline-block w-4 text-center font-bold">
                  {!formData.isBulanan ? '☑' : '☐'}
                </span>
                <span>Harian *</span>
              </label>
            </div>

            {/* 2. Pemohon Info */}
            <div className="mb-1 text-[11px]">Yang bertanda tangan di bawah ini :</div>

            <div className="space-y-1 mb-2 pl-2 text-[11px]">
              <div className="flex items-baseline">
                <span className="w-36 font-semibold flex-shrink-0">Nama</span>
                <span className="mr-2">:</span>
                {isEditMode ? (
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="border-b border-black outline-none px-1 py-0 text-[11px] font-bold flex-1 bg-amber-50"
                  />
                ) : (
                  <span className="font-bold border-b border-dotted border-black flex-1 min-h-[16px] text-black">
                    {formData.nama}
                  </span>
                )}
              </div>

              <div className="flex items-baseline">
                <span className="w-36 font-semibold flex-shrink-0">Jabatan / Pekerjaan</span>
                <span className="mr-2">:</span>
                {isEditMode ? (
                  <input
                    type="text"
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    className="border-b border-black outline-none px-1 py-0 text-[11px] flex-1 bg-amber-50"
                  />
                ) : (
                  <span className="border-b border-dotted border-black flex-1 min-h-[16px] text-black">
                    {formData.jabatan || 'Pekerja Harian'}
                  </span>
                )}
              </div>

              <div className="flex items-baseline">
                <span className="w-36 font-semibold flex-shrink-0">Divisi / Unit</span>
                <span className="mr-2">:</span>
                {isEditMode ? (
                  <input
                    type="text"
                    value={`${formData.divisi} / ${formData.unit}`}
                    onChange={(e) => {
                      const val = e.target.value;
                      const parts = val.split('/');
                      setFormData({
                        ...formData,
                        divisi: parts[0]?.trim() || formData.divisi,
                        unit: parts[1]?.trim() || formData.unit
                      });
                    }}
                    className="border-b border-black outline-none px-1 py-0 text-[11px] flex-1 bg-amber-50"
                  />
                ) : (
                  <span className="border-b border-dotted border-black flex-1 min-h-[16px] text-black">
                    {formData.divisi} / {formData.unit}
                  </span>
                )}
              </div>
            </div>

            {/* 3. Official Checkbox Box (Format GAS Lama) */}
            <div className="border border-black p-2 my-2 bg-white text-[10.5px] leading-tight">
              <div className="font-bold mb-1">Dengan ini mengajukan * :</div>
              
              <div className="grid grid-cols-3 gap-x-3 gap-y-1">
                <label 
                  className="flex items-center gap-1.5 cursor-pointer select-none"
                  onClick={() => setFormData({ ...formData, checkbox: 'normatif' })}
                >
                  <span className="text-[12px] w-3.5 inline-block text-center font-bold">
                    {currentCheckbox === 'normatif' ? '☑' : '☐'}
                  </span>
                  <span>Ijin Normatif</span>
                </label>

                <label 
                  className="flex items-center gap-1.5 cursor-pointer select-none"
                  onClick={() => setFormData({ ...formData, checkbox: 'tidakMasuk' })}
                >
                  <span className="text-[12px] w-3.5 inline-block text-center font-bold">
                    {currentCheckbox === 'tidakMasuk' ? '☑' : '☐'}
                  </span>
                  <span>Ijin Tidak Masuk Kerja</span>
                </label>

                <label 
                  className="flex items-center gap-1.5 cursor-pointer select-none"
                  onClick={() => setFormData({ ...formData, checkbox: 'terlambat' })}
                >
                  <span className="text-[12px] w-3.5 inline-block text-center font-bold">
                    {currentCheckbox === 'terlambat' ? '☑' : '☐'}
                  </span>
                  <span>Ijin Datang Terlambat</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1">
                <label 
                  className="flex items-center gap-1.5 cursor-pointer select-none"
                  onClick={() => setFormData({ ...formData, checkbox: 'keluarSementara' })}
                >
                  <span className="text-[12px] w-3.5 inline-block text-center font-bold">
                    {currentCheckbox === 'keluarSementara' ? '☑' : '☐'}
                  </span>
                  <span>Ijin Meninggalkan Tempat Kerja Sementara Waktu</span>
                </label>

                <label 
                  className="flex items-center gap-1.5 cursor-pointer select-none"
                  onClick={() => setFormData({ ...formData, checkbox: 'pulangCepat' })}
                >
                  <span className="text-[12px] w-3.5 inline-block text-center font-bold">
                    {currentCheckbox === 'pulangCepat' ? '☑' : '☐'}
                  </span>
                  <span>Ijin Pulang Lebih Cepat</span>
                </label>
              </div>

              <div className="mt-1">
                <label 
                  className="flex items-center gap-1.5 cursor-pointer select-none"
                  onClick={() => setFormData({ ...formData, checkbox: 'eksternal' })}
                >
                  <span className="text-[12px] w-3.5 inline-block text-center font-bold">
                    {currentCheckbox === 'eksternal' ? '☑' : '☐'}
                  </span>
                  <span>Ijin Melaksanakan Tugas Kerja Yang Bersifat Ekstern Perusahaan **</span>
                </label>
              </div>

              <div className="mt-0.5">
                <label 
                  className="flex items-center gap-1.5 cursor-pointer select-none"
                  onClick={() => setFormData({ ...formData, checkbox: 'formKehadiran' })}
                >
                  <span className="text-[12px] w-3.5 inline-block text-center font-bold">
                    {currentCheckbox === 'formKehadiran' ? '☑' : '☐'}
                  </span>
                  <span>Form Kehadiran ***</span>
                </label>
              </div>
            </div>

            {/* 4. Rincian Pelaksanaan Ijin */}
            <div className="mb-1 text-[11px]">Pada :</div>

            <div className="space-y-1 pl-2 mb-2 text-[11px]">
              <div className="flex items-baseline">
                <span className="w-36 font-semibold flex-shrink-0">Hari</span>
                <span className="mr-2">:</span>
                {isEditMode ? (
                  <input
                    type="text"
                    value={formData.hari}
                    onChange={(e) => setFormData({ ...formData, hari: e.target.value })}
                    className="border-b border-black outline-none px-1 py-0 text-[11px] font-semibold flex-1 bg-amber-50"
                  />
                ) : (
                  <span className="font-semibold text-black">
                    {formData.hari}
                    {formData.hariAkhir && formData.hariAkhir !== formData.hari && (
                      <span className="ml-1 font-normal">s/d {formData.hariAkhir}</span>
                    )}
                  </span>
                )}
              </div>

              <div className="flex items-baseline">
                <span className="w-36 font-semibold flex-shrink-0">Tanggal</span>
                <span className="mr-2">:</span>
                {isEditMode ? (
                  <input
                    type="text"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="border-b border-black outline-none px-1 py-0 text-[11px] font-semibold flex-1 bg-amber-50"
                  />
                ) : (
                  <span className="font-semibold text-black">
                    {formData.tanggal}
                    {formData.tanggalAkhir && formData.tanggalAkhir !== formData.tanggal && (
                      <span className="ml-1 font-normal">s/d {formData.tanggalAkhir}</span>
                    )}
                  </span>
                )}
              </div>

              <div className="flex items-baseline">
                <span className="w-36 font-semibold flex-shrink-0">Keterangan Ijin / Alasan</span>
                <span className="mr-2">:</span>
                {isEditMode ? (
                  <input
                    type="text"
                    value={formData.keperluan}
                    onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
                    className="border-b border-black outline-none px-1 py-0 text-[11px] flex-1 bg-amber-50"
                  />
                ) : (
                  <span className="border-b border-dotted border-black flex-1 min-h-[16px] text-black">
                    {formData.keperluan || '-'}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-baseline gap-6 text-[10.5px] pt-0.5">
                <div>
                  <span className="font-semibold">Jam Masuk :</span>{' '}
                  <span className="font-mono text-black">{formData.jamMasuk || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold">Jam Keluar :</span>{' '}
                  <span className="font-mono text-black">{formData.jamKeluar || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold">Jam Masuk Kembali :</span>{' '}
                  <span className="font-mono text-black">{formData.jamMasukKembali || '-'}</span>
                </div>
              </div>

              <div className="flex items-baseline pt-0.5">
                <span className="w-36 font-semibold flex-shrink-0">Jumlah Ijin (Jam Kerja)</span>
                <span className="mr-2">:</span>
                <span className="font-bold text-black">
                  {formData.jamBagian} Jam {formData.menitBagian} Menit
                </span>
                <span className="ml-2 text-[9.5px] text-neutral-600 italic">
                  (Diisi Hanya Jam Kerja Yang Diambil Untuk Ijin Saja)
                </span>
              </div>
            </div>

            {/* 5. Klausul Pernyataan Legal */}
            <div className="text-[9.5px] leading-tight italic my-2 text-neutral-800">
              Demikian surat ijin ini kami buat dengan sebenarnya, kami bersedia menerima sanksi administrasi apabila dikemudian hari terjadi penyalahgunaan ijin / tidak sesuai dengan ijin yang kami ajukan.
            </div>

            {/* 6. Signature & Approval Matrix Area */}
            <div className="grid grid-cols-2 gap-4 text-[10.5px] pt-1">
              {/* Left Column: Pejabat Yang Berwenang (Table Matrix) */}
              <div>
                <div className="font-bold mb-1 text-[10px]">Pejabat yang berwenang:</div>
                <table className="w-full border-collapse border border-black text-center text-[9px]">
                  <thead>
                    <tr className="bg-neutral-100/50">
                      <th className="border border-black py-0.5 font-bold w-1/4">Menyetujui</th>
                      <th className="border border-black py-0.5 font-bold w-1/4">Mengetahui 1</th>
                      <th className="border border-black py-0.5 font-bold w-1/4">Mengetahui 2</th>
                      <th className="border border-black py-0.5 font-bold w-1/4 leading-tight">
                        Mengetahui 3<br />HRD II &amp; Umum
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black h-10 align-bottom pb-0.5 text-[8.5px] text-neutral-400">
                        ( ........... )
                      </td>
                      <td className="border border-black h-10 align-bottom pb-0.5 text-[8.5px] text-neutral-400">
                        ( ........... )
                      </td>
                      <td className="border border-black h-10 align-bottom pb-0.5 text-[8.5px] text-neutral-400">
                        ( ........... )
                      </td>
                      <td className="border border-black h-10 align-bottom pb-0.5 text-[8.5px] text-neutral-400">
                        ( ........... )
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Right Column: Applicant Signature */}
              <div className="text-right flex flex-col justify-between items-end pr-3">
                <div>
                  <div className="text-[10px]">
                    Malang, {formData.tglCetak} 20{formData.thnCetak}
                  </div>
                  <div className="mt-0.5 font-bold text-[10.5px]">Diajukan oleh,</div>
                </div>
                <div className="text-center min-w-[130px] mt-6">
                  <div className="font-bold underline text-[11px] text-black">
                    {formData.namaTtd || formData.nama}
                  </div>
                  <div className="text-[9.5px] text-neutral-600">Pekerja Harian</div>
                </div>
              </div>
            </div>

            {/* 7. Footnotes */}
            <div className="mt-2 pt-1 border-t border-neutral-300 text-[8.5px] text-neutral-600 leading-snug space-y-0.2">
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
