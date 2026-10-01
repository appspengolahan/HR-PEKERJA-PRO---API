import React from 'react';
import { X, HelpCircle, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                Bantuan &amp; Ketentuan Operasional — HR Pekerja
              </h2>
              <p className="text-[11px] text-slate-400">
                Divisi Produksi I • Obeetools Standard Operating Procedure
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-1.5">
            <h3 className="font-extrabold text-blue-900 text-xs border-b border-blue-100 pb-1 uppercase tracking-wide">
              📌 Ringkasan Sistem HR Pekerja
            </h3>
            <p className="text-slate-600">
              Sistem manajemen pekerja harian (buruh lepas/PKWT) untuk presensi, lembur, perhitungan upah harian/mingguan, mutasi rotasi, dan proses rekrutmen pelatihan. Berbeda dari HR Karyawan (staf bulanan), pekerja harian tidak dipotong BPJS formal/PPh21.
            </p>
          </section>

          {/* Section 2: Jam Kerja */}
          <section className="space-y-2">
            <h3 className="font-extrabold text-blue-900 text-xs border-b border-blue-100 pb-1 uppercase tracking-wide">
              🕐 Ketentuan Jam Kerja Resmi
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border text-[11px]">
                <thead className="bg-slate-100 font-bold">
                  <tr>
                    <th className="p-2 border">Hari</th>
                    <th className="p-2 border">Jam Kerja</th>
                    <th className="p-2 border">Istirahat</th>
                    <th className="p-2 border">Efektif Kerja</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border font-medium">Senin – Kamis</td>
                    <td className="p-2 border font-mono">08:00 – 16:00</td>
                    <td className="p-2 border font-mono">11:30 – 12:30</td>
                    <td className="p-2 border font-bold text-blue-700">420 menit (7 jam)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Jumat</td>
                    <td className="p-2 border font-mono">08:00 – 16:30</td>
                    <td className="p-2 border font-mono">11:00 – 12:30</td>
                    <td className="p-2 border font-bold text-blue-700">420 menit (7 jam)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Sabtu</td>
                    <td className="p-2 border font-mono">08:00 – 13:00</td>
                    <td className="p-2 border font-mono">-</td>
                    <td className="p-2 border font-bold text-blue-700">300 menit (5 jam)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              * Standar hari kerja bulanan = <strong>26 hari kerja/bulan</strong> (angka tetap: 22 hari Senin-Jumat + 4 hari Sabtu).
            </p>
          </section>

          {/* Section 3: Lembur */}
          <section className="space-y-2">
            <h3 className="font-extrabold text-blue-900 text-xs border-b border-blue-100 pb-1 uppercase tracking-wide">
              ⏱️ Ketentuan Lembur Bertingkat
            </h3>
            <p className="text-slate-600">
              Dasar perhitungan per jam = <strong>Upah Harian ÷ 8</strong> (bukan ÷173).
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Hari Kerja Biasa (Bertingkat):</span>
                <ul className="space-y-0.5 list-disc pl-4 text-slate-700">
                  <li>Jam ke-1: Pengali <strong>1,5×</strong></li>
                  <li>Jam ke-2: Pengali <strong>2,0×</strong></li>
                  <li>Jam ke-3 dst: Pengali <strong>3,0×</strong></li>
                </ul>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Hari Libur / Tanggal Merah:</span>
                <ul className="space-y-0.5 list-disc pl-4 text-slate-700">
                  <li>Semua jam: Pengali <strong>2,0×</strong> (rate tunggal)</li>
                  <li>Minggu bukan hari kerja biasa</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: Faktor Potongan Upah */}
          <section className="space-y-2">
            <h3 className="font-extrabold text-blue-900 text-xs border-b border-blue-100 pb-1 uppercase tracking-wide">
              💸 Ketentuan Potongan Upah Akibat Ijin
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border text-[11px]">
                <thead className="bg-slate-100 font-bold">
                  <tr>
                    <th className="p-2 border">Jenis Ijin</th>
                    <th className="p-2 border">Ketentuan Durasi</th>
                    <th className="p-2 border text-center">Faktor</th>
                    <th className="p-2 border">Dampak Upah</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border">Sakit (S Dokter), Ijin Normatif</td>
                    <td className="p-2 border">-</td>
                    <td className="p-2 border text-center font-bold text-emerald-600 font-mono">0</td>
                    <td className="p-2 border font-bold text-emerald-700">Dibayar 100% (Penuh)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">Terlambat / Keluar Sementara / Pulang Awal</td>
                    <td className="p-2 border font-mono">≤ 2 jam (120 mnt)</td>
                    <td className="p-2 border text-center font-bold text-emerald-600 font-mono">0</td>
                    <td className="p-2 border font-bold text-emerald-700">Dibayar 100% (Toleransi)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">Terlambat / Keluar Sementara / Pulang Awal</td>
                    <td className="p-2 border font-mono">2 s/d 4 jam (120–240 mnt)</td>
                    <td className="p-2 border text-center font-bold text-amber-600 font-mono">0,5</td>
                    <td className="p-2 border font-bold text-amber-700">Dipotong 50% (Setengah Hari)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">Terlambat / Keluar Sementara / Pulang Awal</td>
                    <td className="p-2 border font-mono">≥ 4 jam (&gt;240 mnt)</td>
                    <td className="p-2 border text-center font-bold text-red-600 font-mono">1</td>
                    <td className="p-2 border font-bold text-red-700">Hangus Penuh (0%)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">Sakit (S Tangan), Ijin (S Tangan), Alpha</td>
                    <td className="p-2 border">-</td>
                    <td className="p-2 border text-center font-bold text-red-600 font-mono">1</td>
                    <td className="p-2 border font-bold text-red-700">Hangus Penuh (0%)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5: Do's and Don'ts */}
          <section className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-2 text-[11px]">
            <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Ketentuan Integritas &amp; Keamanan Data:
            </h4>
            <div className="space-y-1 text-amber-950">
              <p>
                ✓ <strong>Pola Hapus Data:</strong> Aplikasi ini tidak pernah menghapus baris fisik (tidak ada `deleteRow`). Semua aksi hapus menyalin salinan ke sheet arsip (`LOG_RIWAYAT_HAPUS_*`) lalu mengosongkan sel agar formula dan urutan data tetap utuh.
              </p>
              <p>
                ✓ <strong>Proteksi Formula:</strong> Kolom F (Unit Sekup) dan K (Status PKWT) di `MASTER_PEKERJA` adalah formula otomatis. Jangan pernah mengedit atau menimpa sel tersebut secara manual.
              </p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>HR Pekerja • Divisi Produksi I • Developed by Lalu Mahendra</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
