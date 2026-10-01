import React, { useState } from 'react';
import { 
  Printer, 
  FileText, 
  Download, 
  CheckCircle, 
  Factory, 
  Calendar,
  Layers
} from 'lucide-react';
import { 
  PekerjaPHL, 
  StaffPP1, 
  OutputBoronganRecord, 
  PresensiPHLRecord, 
  KpiScoring 
} from '../../types';

interface PrintReportsModalProps {
  pekerjaPHL: PekerjaPHL[];
  staff: StaffPP1[];
  outputBorongan: OutputBoronganRecord[];
  presensiPHL: PresensiPHLRecord[];
  kpi: KpiScoring[];
}

export const PrintReportsModal: React.FC<PrintReportsModalProps> = ({
  pekerjaPHL,
  staff,
  outputBorongan,
  presensiPHL,
  kpi
}) => {
  const [reportType, setReportType] = useState<'payroll' | 'absensi' | 'kpi'>('payroll');
  const [periode, setPeriode] = useState('September 2026');

  const totalUpah = outputBorongan.reduce((acc, c) => acc + c.totalUpah, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Control Bar (Hidden when printing) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-start md:items-center justify-between print:hidden">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Generator Dokumen Resmi &amp; Rekapitulasi Payroll
            </h2>
            <p className="text-xs text-slate-500">
              Cetak berkas bertanda tangan resmi untuk Divisi Payroll &amp; Keuangan Kantor Pusat
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as 'payroll' | 'absensi' | 'kpi')}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none"
          >
            <option value="payroll">1. Rekap Upah Borongan PHL (Payroll)</option>
            <option value="absensi">2. Rekapitulasi Presensi Lini Bulanan</option>
            <option value="kpi">3. Laporan Evaluasi Matriks KPI Staff</option>
          </select>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            Cetak / Download PDF
          </button>
        </div>

      </div>

      {/* Printable Paper Document Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 sm:p-12 max-w-4xl mx-auto text-slate-900">
        
        {/* Kop Surat Resmi */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
              <Factory className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wide text-slate-900">
                PT BATU KARANG
              </h1>
              <h2 className="text-xs font-extrabold text-blue-700 tracking-wider">
                DIVISI PRODUKSI 1 (PP1) — PABRIK PENGOLAHAN TEMBAKAU &amp; CENGKEH
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Kawasan Industri Rungkut Industri No. 45, Surabaya, Jawa Timur | Telp: (031) 843-9988 | Email: pp1@batukarang.co.id
              </p>
            </div>
          </div>
          <div className="text-right text-[10px] font-mono text-slate-400">
            <div>FORM: BK-PP1-HR-2026</div>
            <div>STATUS: TERTANDATANGANI</div>
          </div>
        </div>

        {/* Title of Document */}
        <div className="text-center mb-6">
          <h2 className="text-base font-extrabold uppercase underline tracking-wider">
            {reportType === 'payroll' && 'LEMBAR REKAPITULASI UPAH BORONGAN PEKERJA HARIAN LEPAS (PHL)'}
            {reportType === 'absensi' && 'REKAPITULASI PRESENSI & KEHADIRAN OPERASIONAL LINI PP1'}
            {reportType === 'kpi' && 'BERITA ACARA EVALUASI MATRIKS SCORING KPI STAFF PP1'}
          </h2>
          <div className="text-xs text-slate-600 mt-1 font-mono">
            Nomor: 048/PP1-BK/IX/2026 • Periode: {periode}
          </div>
        </div>

        {/* Report 1: Upah Borongan */}
        {reportType === 'payroll' && (
          <div className="space-y-4">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px] border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-300">No</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">NIP &amp; Nama Pekerja</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Pos Penugasan Lini</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-right">Volume</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-right">Tarif Satuan</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-right">Total Upah (Rp)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {outputBorongan.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono">{idx + 1}</td>
                    <td className="py-2 px-3 border-r border-slate-200 font-bold">
                      {item.nama}
                      <span className="text-[10px] font-mono text-slate-500 block">{item.nip}</span>
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200">{item.posLini}</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-bold">
                      {item.volume} {item.satuan}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-right font-mono">
                      Rp {item.tarifPerSatuan.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-black text-slate-900">
                      Rp {item.totalUpah.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-3 text-center text-[10px] font-bold text-emerald-800">
                      {item.statusVerifikasi}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-black border-t-2 border-slate-400">
                <tr>
                  <td colSpan={5} className="py-2.5 px-3 text-right uppercase tracking-wider text-xs">
                    Total Akumulasi Pembayaran Upah:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-sm text-emerald-800">
                    Rp {totalUpah.toLocaleString('id-ID')}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Report 2: Absensi */}
        {reportType === 'absensi' && (
          <div className="space-y-4">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px] border-b border-slate-300">
                <tr>
                  <th className="py-2 px-3 border-r border-slate-300">Tanggal</th>
                  <th className="py-2 px-3 border-r border-slate-300">NIP &amp; Nama</th>
                  <th className="py-2 px-3 border-r border-slate-300">Pos Lini / Divisi</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center">Status</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center">Masuk - Pulang</th>
                  <th className="py-2 px-3">Catatan Mandor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {presensiPHL.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 px-3 border-r border-slate-200 font-mono">{p.tanggal}</td>
                    <td className="py-2 px-3 border-r border-slate-200 font-bold">{p.nama} ({p.nip})</td>
                    <td className="py-2 px-3 border-r border-slate-200">{p.posLini}</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-bold">{p.status}</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono text-[11px]">
                      {p.jamMasuk} - {p.jamPulang}
                    </td>
                    <td className="py-2 px-3 text-slate-600 text-[11px]">{p.catatan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Report 3: KPI Scoring */}
        {reportType === 'kpi' && (
          <div className="space-y-4">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px] border-b border-slate-300">
                <tr>
                  <th className="py-2 px-3 border-r border-slate-300">Staff &amp; NIP</th>
                  <th className="py-2 px-3 border-r border-slate-300">Jabatan</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center">Disiplin</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center">Rendemen</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center">K3</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center">Inisiatif</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center">Skor Akhir</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center">Grade</th>
                  <th className="py-2 px-3">Rekomendasi Insentif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {kpi.map((k) => (
                  <tr key={k.id}>
                    <td className="py-2 px-3 border-r border-slate-200 font-bold">{k.nama} ({k.nip})</td>
                    <td className="py-2 px-3 border-r border-slate-200">{k.jabatan}</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono">{k.skorDisiplin}</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono">{k.skorRendemen}</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono">{k.skorK3}</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono">{k.skorInisiatif}</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono font-black">{k.skorAkhir}</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-bold">{k.grade}</td>
                    <td className="py-2 px-3 text-[11px] font-semibold">{k.rekomendasiInsentif}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Signature Box */}
        <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-center">
          <div className="space-y-16">
            <div>
              <p className="text-slate-500">Diverifikasi &amp; Dicatat Oleh:</p>
              <p className="font-bold text-slate-800">Foreman / Mandor Shift PP1</p>
            </div>
            <div>
              <div className="font-bold underline text-slate-900">Supardi Hartono</div>
              <div className="font-mono text-[10px] text-slate-500">NIP. BK-PP1-002</div>
            </div>
          </div>

          <div className="space-y-16">
            <div>
              <p className="text-slate-500">Disetujui &amp; Disahkan Oleh:</p>
              <p className="font-bold text-slate-800">Manajer Operasional PP1</p>
            </div>
            <div>
              <div className="font-bold underline text-slate-900">Lalu M. Kurniawan</div>
              <div className="font-mono text-[10px] text-slate-500">NIP. BK-PP1-001</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
