import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Radio, 
  ShieldAlert, 
  Compass, 
  Save, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { StaffPP1, PresensiStaffRecord, ShiftType, StatusKehadiran } from '../../types';
import { PABRIK_GEOFENCE } from '../../data/initialData';

interface GpsGeofenceAttendanceProps {
  staffList: StaffPP1[];
  presensiStaff: PresensiStaffRecord[];
  onAddPresensi: (record: PresensiStaffRecord) => void;
}

// Haversine formula to compute great-circle distance between two points in meters
function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Radius of Earth in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const GpsGeofenceAttendance: React.FC<GpsGeofenceAttendanceProps> = ({
  staffList,
  presensiStaff,
  onAddPresensi
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staffList[0]?.id || '');
  const [selectedShift, setSelectedShift] = useState<ShiftType>('Shift 1 (Pagi 07:00-15:00)');
  const [catatan, setCatatan] = useState('');

  // Location Coordinates (default close to factory for immediate usability)
  const [currentLat, setCurrentLat] = useState<number>(-7.25048);
  const [currentLon, setCurrentLon] = useState<number>(112.76875);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [clockSuccess, setClockSuccess] = useState<string | null>(null);

  const selectedStaff = staffList.find(s => s.id === selectedStaffId);

  // Compute live distance to factory
  const distanceMeter = haversineDistanceMeters(
    currentLat,
    currentLon,
    PABRIK_GEOFENCE.latitude,
    PABRIK_GEOFENCE.longitude
  );

  const isWithinRadius = distanceMeter <= PABRIK_GEOFENCE.radiusMaksimumMeter;

  // Real GPS lookup
  const handleGetRealGps = () => {
    if (!navigator.geolocation) {
      alert('Geolokasi tidak didukung oleh browser Anda.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLat(pos.coords.latitude);
        setCurrentLon(pos.coords.longitude);
        setIsLocating(false);
      },
      (err) => {
        console.warn('GPS Error or blocked, keeping current:', err);
        setIsLocating(false);
        alert('Tidak dapat mengambil lokasi GPS riil (mungkin izin browser ditolak). Anda dapat menggunakan tombol simulasi lokasi.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSimulateAtFactory = () => {
    // Offset by roughly ~15 meters
    setCurrentLat(-7.25045);
    setCurrentLon(112.76879);
  };

  const handleSimulateOutside = () => {
    // Roughly ~850 meters outside
    setCurrentLat(-7.25800);
    setCurrentLon(112.77450);
  };

  const handleClockIn = () => {
    if (!selectedStaff) return;

    if (!isWithinRadius) {
      alert(`PRESENSI DITOLAK: Anda berada di jarak ${distanceMeter} meter dari sentral pabrik. Batas maksimum radius adalah ${PABRIK_GEOFENCE.radiusMaksimumMeter} meter.`);
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateStr = now.toISOString().slice(0, 10);

    const record: PresensiStaffRecord = {
      id: `stf-p-${Date.now()}`,
      staffId: selectedStaff.id,
      nip: selectedStaff.nip,
      nama: selectedStaff.nama,
      jabatan: selectedStaff.jabatan,
      tanggal: dateStr,
      shift: selectedShift,
      jamMasuk: timeStr,
      latitude: currentLat,
      longitude: currentLon,
      jarakMeter: distanceMeter,
      isWithinGeofence: true,
      status: 'Hadir',
      tipePresensi: 'GPS Geofence',
      catatan: catatan || 'Valid di area pabrik PP1'
    };

    onAddPresensi(record);
    setClockSuccess(`Berhasil Clock-In pukul ${timeStr} WIB (Jarak: ${distanceMeter}m)`);
    setTimeout(() => setClockSuccess(null), 3500);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Geofence Radar & Controller Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        
        {/* Left Column: Visual Radar & Distance */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-2xl border border-slate-800 relative overflow-hidden">
          
          {/* Radar Rings */}
          <div className="relative w-44 h-44 flex items-center justify-center mb-3">
            <div className="absolute inset-0 rounded-full border border-slate-700/60 animate-ping opacity-25"></div>
            <div className="absolute w-36 h-36 rounded-full border border-slate-700"></div>
            <div className="absolute w-24 h-24 rounded-full border border-slate-700"></div>
            <div className="absolute w-12 h-12 rounded-full border border-blue-500/40"></div>
            
            {/* Center Factory Marker */}
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/50 z-10" title="Sentral Pabrik (-7.2504, 112.7688)">
              <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
            </div>

            {/* User GPS Blip */}
            <div 
              className={`absolute w-4 h-4 rounded-full z-20 transition-all duration-500 shadow-md ${
                isWithinRadius ? 'bg-emerald-400 ring-4 ring-emerald-500/40' : 'bg-red-500 ring-4 ring-red-500/40'
              }`}
              style={{
                top: isWithinRadius ? '42%' : '10%',
                left: isWithinRadius ? '58%' : '88%'
              }}
              title={`Posisi Anda: ${distanceMeter} meter`}
            />
          </div>

          <div className="text-center space-y-1">
            <div className="text-[11px] font-mono text-slate-400">
              Jarak ke Sentral Pabrik:
            </div>
            <div className={`text-2xl font-black font-mono tracking-tight ${
              isWithinRadius ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {distanceMeter} <span className="text-xs font-normal text-slate-400">Meter</span>
            </div>

            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
              isWithinRadius
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-red-500/20 text-red-300 border border-red-500/40'
            }`}>
              {isWithinRadius ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  DALAM RADIUS VALID (≤ 150m)
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  DI LUAR RADIUS (&gt; 150m)
                </>
              )}
            </div>
          </div>

        </div>

        {/* Center & Right: Form Clock-In & Location Simulator */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                Presensi Mandiri Staff (GPS Geofence)
              </h3>
              <p className="text-xs text-slate-400">
                Titik Sentral: PT Batu Karang PP1 (-7.2504, 112.7688) • Toleransi Max 150m
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGetRealGps}
                disabled={isLocating}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                title="Ambil titik GPS riil dari browser/perangkat"
              >
                <Navigation className={`w-3.5 h-3.5 text-blue-400 ${isLocating ? 'animate-spin' : ''}`} />
                {isLocating ? 'Mendeteksi...' : 'GPS Riil'}
              </button>
            </div>
          </div>

          {/* Location Simulator Quick Controls for Testing */}
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              Mode Simulasi Lokasi Pengujian:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulateAtFactory}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  isWithinRadius 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ✓ Di Dalam Pabrik (15m)
              </button>
              <button
                onClick={handleSimulateOutside}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  !isWithinRadius 
                    ? 'bg-red-600 text-white shadow-xs' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ✗ Di Luar Pabrik (850m)
              </button>
            </div>
          </div>

          {/* Form Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Pilih Akun Staff
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nama} ({s.nip}) — {s.jabatan}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Shift Masuk
              </label>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value as ShiftType)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="Shift 1 (Pagi 07:00-15:00)">Shift 1 (Pagi 07:00-15:00)</option>
                <option value="Shift 2 (Sore 15:00-23:00)">Shift 2 (Sore 15:00-23:00)</option>
                <option value="Shift 3 (Malam 23:00-07:00)">Shift 3 (Malam 23:00-07:00)</option>
                <option value="Non-Shift (Office 08:00-16:00)">Non-Shift (Office 08:00-16:00)</option>
              </select>
            </div>
          </div>

          <div>
            <input
              type="text"
              placeholder="Catatan aktivitas presensi (opsional)..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] font-mono text-slate-400">
              Koordinat: {currentLat.toFixed(5)}, {currentLon.toFixed(5)}
            </div>

            <button
              onClick={handleClockIn}
              disabled={!isWithinRadius}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                isWithinRadius
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:scale-102'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              Clock-In Masuk Shift
            </button>
          </div>

          {clockSuccess && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{clockSuccess}</span>
            </div>
          )}

        </div>

      </div>

      {/* Log Presensi Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800">
              Log Riwayat Presensi Geofence Staff ({presensiStaff.length} Catatan)
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Tab Sheet: Presensi_Staff
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tanggal &amp; Waktu</th>
                <th className="py-3 px-4">Personil Staff</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4">Koordinat GPS</th>
                <th className="py-3 px-4 text-right">Jarak ke Pabrik</th>
                <th className="py-3 px-4 text-center">Status Radius</th>
                <th className="py-3 px-4">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {presensiStaff.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-slate-900">{p.tanggal}</span>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {p.jamMasuk} WIB
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{p.nama}</div>
                    <div className="text-[11px] font-mono text-blue-600">{p.nip}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-700">{p.shift}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {p.latitude.toFixed(5)}, {p.longitude.toFixed(5)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                    {p.jarakMeter} m
                  </td>
                  <td className="py-3 px-4 text-center">
                    {p.isWithinGeofence ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Valid (&lt;150m)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 text-red-600" />
                        Luar Radius
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px] max-w-[180px] truncate" title={p.catatan}>
                    {p.catatan || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
