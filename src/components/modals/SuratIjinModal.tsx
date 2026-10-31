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
        nama: '',
        jabatan: '',
        divisi: 'Produksi I',
        unit: '',
        checkbox: '',
        isBulanan: false,
        hari: '',
        hariAkhir: '',
        tanggal: '',
        tanggalAkhir: '',
        keperluan: '',
        jamMasuk: '-',
        jamKeluar: '-',
        jamMasukKembali: '-',
        jamBagian: 0,
        menitBagian: 0,
        tglCetak: '',
        thnCetak: '',
        namaTtd: ''
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

  const formatCetakDate = () => {
    if (formData.tglCetak && formData.tglCetak.trim() !== '') {
      if (formData.tglCetak.includes('20')) {
        return formData.tglCetak;
      }
      return `${formData.tglCetak} 20${formData.thnCetak || '26'}`;
    }
    const now = new Date();
    const bulans = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${now.getDate()} ${bulans[now.getMonth() + 1]} ${now.getFullYear()}`;
  };

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
            padding: 0.8cm 1.2cm 0.6cm 1.2cm !important;
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
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
                  Formulir Cetak Fisik: Surat Permohonan Ijin Resmi
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-200">
                  Standar Perusahaan 20,5 × 16 cm
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Format resmi fisik PT Batu Karang Divisi Produksi I (PP1) sesuai standar dokumen perusahaan.
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
            className="bg-white text-black shadow-2xl p-7 text-[11px] leading-[1.35] border border-slate-300 select-text relative"
            style={{
              width: '20.5cm',
              height: '16cm',
              maxHeight: '16cm',
              boxSizing: 'border-box',
              margin: '0 auto',
              overflow: 'hidden',
              fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif'
            }}
          >
            {/* 1. Header Title & Worker Category */}
            <div className="text-center font-bold text-[15px] tracking-wide uppercase mb-1 font-sans text-black">
              SURAT PERMOHONAN IJIN
            </div>

            <div className="text-center text-[11px] font-bold mb-3.5 flex items-center justify-center gap-7 text-black">
              <label 
                className={`flex items-center gap-1.5 cursor-pointer select-none ${
                  formData.isBulanan ? 'font-bold' : 'font-normal'
                }`}
                onClick={() => setFormData({ ...formData, isBulanan: !formData.isBulanan })}
              >
                <span className="text-[13px] inline-block w-4 text-center font-bold">
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
            <div className="mb-1 text-[11px] text-black">Yang bertanda tangan di bawah ini;</div>

            <div className="space-y-1 mb-2.5 text-[11px] text-black">
              <div className="flex items-baseline">
                <span className="w-40 font-bold flex-shrink-0">Nama</span>
                <span className="mr-2">:</span>
                {isEditMode ? (
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="border-b border-black outline-none px-1 py-0 text-[11px] font-bold flex-1 bg-amber-50"
                  />
                ) : (
                  <span className="font-bold border-b border-dotted border-black inline-block min-w-[280px] text-black">
                    {formData.nama || '....................................................'}
                  </span>
                )}
              </div>

              <div className="flex items-baseline">
                <span className="w-40 font-bold flex-shrink-0">Jabatan / Pekerjaan</span>
                <span className="mr-2">:</span>
                {isEditMode ? (
                  <input
                    type="text"
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    className="border-b border-black outline-none px-1 py-0 text-[11px] flex-1 bg-amber-50"
                  />
                ) : (
                  <span className="border-b border-dotted border-black inline-block min-w-[280px] text-black">
                    {formData.jabatan || 'Harian'}
                  </span>
                )}
              </div>

              <div className="flex items-baseline">
                <span className="w-40 font-bold flex-shrink-0">Divisi / Unit</span>
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
                  <span className="border-b border-dotted border-black inline-block min-w-[280px] text-black">
                    {formData.divisi} / {formData.unit || '........................'}
                  </span>
                )}
              </div>
            </div>

            {/* 3. Official Checkbox Options (Direct list layout matching company format) */}
            <div className="mb-2.5 text-[11px] leading-[1.4] text-black">
              <div className="font-bold mb-1.5">Dengan ini mengajukan*</div>
              
              <div className="space-y-1">
                {/* Row 1: Normatif, Tidak Masuk, Terlambat */}
                <div className="flex flex-wrap items-center gap-x-2">
                  <label 
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => setFormData({ ...formData, checkbox: 'normatif' })}
                  >
                    <span className="text-[12px] inline-block font-bold">
                      {currentCheckbox === 'normatif' ? '☑' : '☐'}
                    </span>
                    <span>Ijin Normatif,</span>
                  </label>

                  <label 
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => setFormData({ ...formData, checkbox: 'tidakMasuk' })}
                  >
                    <span className="text-[12px] inline-block font-bold">
                      {currentCheckbox === 'tidakMasuk' ? '☑' : '☐'}
                    </span>
                    <span>Ijin Tidak Masuk Kerja,</span>
                  </label>

                  <label 
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => setFormData({ ...formData, checkbox: 'terlambat' })}
                  >
                    <span className="text-[12px] inline-block font-bold">
                      {currentCheckbox === 'terlambat' ? '☑' : '☐'}
                    </span>
                    <span>Ijin Datang Terlambat,</span>
                  </label>
                </div>

                {/* Row 2: Keluar Sementara, Pulang Cepat */}
                <div className="flex flex-wrap items-center gap-x-2">
                  <label 
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => setFormData({ ...formData, checkbox: 'keluarSementara' })}
                  >
                    <span className="text-[12px] inline-block font-bold">
                      {currentCheckbox === 'keluarSementara' ? '☑' : '☐'}
                    </span>
                    <span>Ijin Meninggalkan Tempat Kerja Sementara Waktu,</span>
                  </label>

                  <label 
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => setFormData({ ...formData, checkbox: 'pulangCepat' })}
                  >
                    <span className="text-[12px] inline-block font-bold">
                      {currentCheckbox === 'pulangCepat' ? '☑' : '☐'}
                    </span>
                    <span>Ijin Pulang Lebih Cepat,</span>
                  </label>
                </div>

                {/* Row 3: Tugas Eksternal */}
                <div>
                  <label 
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => setFormData({ ...formData, checkbox: 'eksternal' })}
                  >
                    <span className="text-[12px] inline-block font-bold">
                      {currentCheckbox === 'eksternal' ? '☑' : '☐'}
                    </span>
                    <span>Ijin Melaksanakan Tugas Kerja Yang Bersifat Ekstern Perusahaan**</span>
                  </label>
                </div>

                {/* Row 4: Form Kehadiran */}
                <div>
                  <label 
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => setFormData({ ...formData, checkbox: 'formKehadiran' })}
                  >
                    <span className="text-[12px] inline-block font-bold">
                      {currentCheckbox === 'formKehadiran' ? '☑' : '☐'}
                    </span>
                    <span>Form Kehadiran***</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 4. Rincian Pelaksanaan Ijin */}
            <div className="mb-1 text-[11px] text-black">pada :</div>

            <div className="space-y-1 mb-2 text-[11px] text-black">
              {/* Hari */}
              <div className="flex items-baseline">
                <span className="w-40 font-bold flex-shrink-0">Hari</span>
                <span className="mr-2">:</span>
                {isEditMode ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={formData.hari}
                      onChange={(e) => setFormData({ ...formData, hari: e.target.value })}
                      className="border-b border-black outline-none px-1 py-0 text-[11px] font-bold w-28 bg-amber-50"
                    />
                    <span>s/d</span>
                    <input
                      type="text"
                      value={formData.hariAkhir || formData.hari}
                      onChange={(e) => setFormData({ ...formData, hariAkhir: e.target.value })}
                      className="border-b border-black outline-none px-1 py-0 text-[11px] font-bold w-28 bg-amber-50"
                    />
                  </div>
                ) : (
                  <div className="flex items-baseline flex-1">
                    <span className="font-bold border-b border-dotted border-black inline-block min-w-[90px] text-black">
                      {formData.hari || '..................'}
                    </span>
                    <span className="mx-2">s/d</span>
                    <span className="font-bold border-b border-dotted border-black inline-block min-w-[90px] text-black">
                      {formData.hariAkhir || formData.hari || '..................'}
                    </span>
                  </div>
                )}
              </div>

              {/* Tanggal */}
              <div className="flex items-baseline">
                <span className="w-40 font-bold flex-shrink-0">Tanggal</span>
                <span className="mr-2">:</span>
                {isEditMode ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={formData.tanggal}
                      onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                      className="border-b border-black outline-none px-1 py-0 text-[11px] font-bold w-28 bg-amber-50"
                    />
                    <span>s/d</span>
                    <input
                      type="text"
                      value={formData.tanggalAkhir || formData.tanggal}
                      onChange={(e) => setFormData({ ...formData, tanggalAkhir: e.target.value })}
                      className="border-b border-black outline-none px-1 py-0 text-[11px] font-bold w-28 bg-amber-50"
                    />
                  </div>
                ) : (
                  <div className="flex items-baseline flex-1">
                    <span className="font-bold border-b border-dotted border-black inline-block min-w-[90px] text-black">
                      {formData.tanggal || '..................'}
                    </span>
                    <span className="mx-2">s/d</span>
                    <span className="font-bold border-b border-dotted border-black inline-block min-w-[90px] text-black">
                      {formData.tanggalAkhir || formData.tanggal || '..................'}
                    </span>
                  </div>
                )}
              </div>

              {/* Keterangan ijin / Form*** */}
              <div className="flex items-baseline">
                <span className="w-40 font-bold flex-shrink-0">Keterangan ijin / Form***</span>
                <span className="mr-2">:</span>
                {isEditMode ? (
                  <input
                    type="text"
                    value={formData.keperluan}
                    onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
                    className="border-b border-black outline-none px-1 py-0 text-[11px] flex-1 bg-amber-50 font-bold"
                  />
                ) : (
                  <span className="border-b border-dotted border-black flex-1 min-h-[16px] text-black font-bold">
                    {formData.keperluan || '...............................................................................'}
                  </span>
                )}
              </div>

              {/* Jam masuk, Jam keluar, Jam masuk kembali */}
              <div className="flex items-baseline flex-wrap gap-y-1">
                <span className="w-40 font-bold flex-shrink-0">Jam masuk</span>
                <span className="mr-2">:</span>
                <span className="border-b border-dotted border-black inline-block min-w-[80px] text-black mr-4">
                  {formData.jamMasuk || '-'}
                </span>

                <span className="font-semibold mr-1">Jam keluar:</span>
                <span className="border-b border-dotted border-black inline-block min-w-[80px] text-black mr-4">
                  {formData.jamKeluar || '-'}
                </span>

                <span className="font-semibold mr-1">Jam masuk kembali:</span>
                <span className="border-b border-dotted border-black inline-block min-w-[80px] text-black">
                  {formData.jamMasukKembali || '-'}
                </span>
              </div>

              {/* Jumlah Ijin (Jam Kerja) */}
              <div className="flex items-baseline">
                <span className="w-40 font-bold flex-shrink-0">Jumlah Ijin (Jam Kerja)</span>
                <span className="mr-2">:</span>
                <span className="font-bold border-b border-dotted border-black inline-block min-w-[45px] text-center text-black">
                  {formData.jamBagian}
                </span>
                <span className="mx-1.5 font-bold">Jam</span>
                <span className="font-bold border-b border-dotted border-black inline-block min-w-[45px] text-center text-black">
                  {formData.menitBagian}
                </span>
                <span className="ml-1.5 font-bold">Menit</span>
              </div>
              <div className="text-[10px] text-black pl-[170px] italic">
                (Diisi Hanya Jam Kerja Yang Diambil Untuk Ijin Saja)
              </div>
            </div>

            {/* 5. Klausul Pernyataan Legal */}
            <div className="text-[10.5px] leading-snug my-2.5 text-black">
              Demikian surat ijin ini kami buat dengan sebenarnya, kami bersedia menerima sanksi administrasi apabila dikemudian hari terjadi penyalahgunaan ijin / tidak sesuai dengan ijin yang kami ajukan.
            </div>

            {/* 6. Signature & Approval Matrix Area (Clean open layout matching official image) */}
            <div className="grid grid-cols-12 gap-2 text-[10.5px] pt-1 text-black">
              {/* Left Side: Pejabat Yang Berwenang (Cols 8) */}
              <div className="col-span-8 flex flex-col justify-between">
                <div>
                  <div className="font-bold mb-1">Pejabat yang berwenang</div>
                  <div className="grid grid-cols-4 gap-1 text-[10px]">
                    <div>
                      <div>Mengetahui 3,</div>
                      <div className="text-[9.5px]">HRD II &amp; Umum II</div>
                    </div>
                    <div>
                      <div>Mengetahui 2,</div>
                    </div>
                    <div>
                      <div>Mengetahui 1,</div>
                    </div>
                    <div>
                      <div>Menyetujui</div>
                    </div>
                  </div>
                </div>

                {/* Signature blank brackets */}
                <div className="grid grid-cols-4 gap-1 text-[10px] mt-9">
                  <div>( ................ )</div>
                  <div>( ................ )</div>
                  <div>( ................ )</div>
                  <div>( ................ )</div>
                </div>
              </div>

              {/* Right Side: Applicant Submission (Cols 4) */}
              <div className="col-span-4 text-center flex flex-col justify-between items-center pl-2">
                <div>
                  <div className="font-bold text-[10.5px]">
                    Malang, {formatCetakDate()}
                  </div>
                  <div className="mt-0.5">Diajukan oleh,</div>
                </div>

                <div className="mt-9 font-bold text-[11px] text-black tracking-wide">
                  ( {formData.namaTtd || formData.nama || '....................................'} )
                </div>
              </div>
            </div>

            {/* 7. Footnotes with dotted underline matching official paper */}
            <div className="mt-3 pt-1 text-[9px] text-black leading-tight space-y-0.5">
              <div className="underline decoration-dotted">* pilih salah satu (√).</div>
              <div className="underline decoration-dotted">** Khusus tugas kerja yang bersifat ekstern Perusahaan tanpa dilengkapi Surat Tugas dari atasan.</div>
              <div className="underline decoration-dotted">*** Jika salah satu dari cecklok masuk / pulang tidak terdeteksi di mesin absen sidik jari</div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
