/**
 * =========================================================================
 * GOOGLE APPS SCRIPT BACKEND CODE (V2 HIGH-PERFORMANCE OPTIMIZED)
 * PT BATU KARANG — DIVISI PRODUKSI I (PP1)
 * HEADLESS REST API V2 — HR PEKERJA HARIAN
 * Sumber Data: Spreadsheet ID: 11NpDyRTepu4upwXwN1zoWAuymtYdvd3VARfcKklQf0Y
 * =========================================================================
 */

export const TARGET_SPREADSHEET_ID = '11NpDyRTepu4upwXwN1zoWAuymtYdvd3VARfcKklQf0Y';

export const DEFAULT_GAS_CONFIG = {
  webAppUrl: 'https://script.google.com/macros/s/AKfycbzGZsSs2ZviyLMM0csjmMDXZDMpC9ZhuvheEb97g9KM1AZW8mlhSUPBc8o8YJp_9zg/exec',
  sheetId: TARGET_SPREADSHEET_ID,
  isAutoSyncEnabled: true,
  lastSyncTimestamp: null,
  syncStatus: 'idle' as const
};

export const GAS_CODE_TEMPLATE = `/**
 * =========================================================================
 * PT BATU KARANG — DIVISI PRODUKSI I (PP1)
 * HEADLESS REST API V2 — HIGH-PERFORMANCE & FAST READ ENGINE
 * =========================================================================
 */

const TARGET_SPREADSHEET_ID = '11NpDyRTepu4upwXwN1zoWAuymtYdvd3VARfcKklQf0Y';

const SHEET = {
  MASTER: 'MASTER_PEKERJA',
  CONFIG_APP: 'CONFIG_APP',
  PRESENSI: 'LOG_PRESENSI_IJIN',
  REKAP: 'REKAP_PRESENSI',
  LEMBUR: 'LOG_LEMBUR',
  UPAH: 'LOG_UPAH',
  SLIP: 'SLIP_UPAH',
  CFG_JENIS_IJIN: 'CONFIG_JENIS_IJIN',
  CFG_JAM_KERJA: 'CONFIG_JAM_KERJA',
  CFG_RATE_LEMBUR: 'CONFIG_RATE_LEMBUR',
  CFG_KALENDER: 'CONFIG_KALENDER_KERJA',
  CFG_GAJI: 'CONFIG_KOMPONEN_GAJI',
  CALON: 'CALON_PEKERJA',
  LOG_PELATIHAN: 'LOG_RIWAYAT_PELATIHAN',
  LINK_ARSIP: 'LOG_LINK_ARSIP',
  MUTASI: 'LOG_MUTASI_PEKERJA',
  ARSIP_HAPUS_PRESENSI: 'LOG_RIWAYAT_HAPUS_PRESENSI',
  ARSIP_HAPUS_PEKERJA: 'LOG_RIWAYAT_HAPUS_PEKERJA'
};

const ROWS = {
  MASTER_START: 6, MASTER_LAST: 106,
  PRESENSI_START: 6, PRESENSI_LAST: 805,
  REKAP_START: 8, REKAP_LAST: 68,
  LEMBUR_START: 6, LEMBUR_LAST: 505,
  UPAH_START: 6, UPAH_LAST: 805,
  CALON_START: 6, CALON_LAST: 105,
  LOGPELATIHAN_START: 6, LOGPELATIHAN_LAST: 305,
  LINK_ARSIP_START: 6, LINK_ARSIP_LAST: 305,
  MUTASI_START: 6, MUTASI_LAST: 505
};

// Singleton cache agar tidak membuka spreadsheet berulang-ulang
let _ssCache = null;
function getSpreadsheet_() {
  if (!_ssCache) {
    _ssCache = SpreadsheetApp.openById(TARGET_SPREADSHEET_ID);
  }
  return _ssCache;
}

function getSheet_(name) {
  return getSpreadsheet_().getSheetByName(name);
}

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'ping';

    if (action === 'ping') {
      return jsonResponse_({
        status: 'success',
        message: 'PONG - Headless GAS REST API V2 HR Pekerja Siap & Terhubung.',
        spreadsheetId: TARGET_SPREADSHEET_ID,
        timestamp: new Date().toISOString()
      });
    }

    // Consolidated single-trip data loader
    if (action === 'getAllData') {
      const scope = (e && e.parameter && e.parameter.scope) || 'ALL';
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const pekerjaList = getAllPekerja_(scope);
      const unitSekupSet = {};
      pekerjaList.forEach(p => {
        if (p.unitSekup) unitSekupSet[p.unitSekup] = true;
      });

      return jsonResponse_({
        status: 'success',
        data: {
          pekerja: pekerjaList,
          unitSekupList: Object.keys(unitSekupSet).sort(),
          jenisIjinList: getJenisIjinList_(),
          switchAppUrl: getSwitchAppUrl_(),
          configJamKerja: getConfigJamKerja_(),
          jadwalMutasi: getJadwalMutasi_(),
          calonPekerja: getCalonPekerjaList_(scope),
          presensi: getPresensiList_('', '', '', scope),
          lembur: getRekapLembur_('', '', 'Semua', 'Semua', scope)
        }
      });
    }

    if (action === 'getPresensi') {
      const bulan = e.parameter.bulan;
      const tahun = e.parameter.tahun;
      const nama = e.parameter.nama;
      const scope = e.parameter.scope || 'ALL';
      return jsonResponse_({ status: 'success', data: getPresensiList_(bulan, tahun, nama, scope) });
    }

    if (action === 'getSlipUpahRentang') {
      const nama = e.parameter.nama;
      const tglAwal = e.parameter.tglAwal;
      const tglAkhir = e.parameter.tglAkhir;
      return jsonResponse_({ status: 'success', data: getSlipUpahRentang_(nama, tglAwal, tglAkhir) });
    }

    if (action === 'getRekapLembur') {
      const tglAwal = e.parameter.tglAwal;
      const tglAkhir = e.parameter.tglAkhir;
      const unit = e.parameter.unit;
      const sekup = e.parameter.sekup;
      const scope = e.parameter.scope || 'ALL';
      return jsonResponse_({ status: 'success', data: getRekapLembur_(tglAwal, tglAkhir, unit, sekup, scope) });
    }

    return jsonResponse_({ status: 'error', message: 'Action doGet tidak dikenali: ' + action });
  } catch (err) {
    return jsonResponse_({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  try {
    const raw = e.postData ? e.postData.contents : '{}';
    const payload = JSON.parse(raw);
    const action = payload.action;

    if (action === 'addPresensiIjin') {
      return jsonResponse_(addPresensiIjin_(payload.data));
    }
    if (action === 'deletePresensiIjin') {
      return jsonResponse_(deletePresensiIjin_(payload.rowNum, payload.currentUser));
    }
    if (action === 'submitLemburBatch') {
      return jsonResponse_(submitLemburBatch_(payload.data));
    }
    if (action === 'addNewPekerja') {
      return jsonResponse_(addNewPekerja_(payload.data));
    }
    if (action === 'updatePekerja') {
      return jsonResponse_(updatePekerja_(payload.data));
    }
    if (action === 'deletePekerja') {
      return jsonResponse_(deletePekerja_(payload.rowNum, payload.currentUser));
    }
    if (action === 'submitMutasi') {
      return jsonResponse_(submitMutasi_(payload.data, payload.currentUser));
    }
    if (action === 'updateStatusCalon') {
      return jsonResponse_(updateStatusCalon_(payload.data, payload.currentUser));
    }

    return jsonResponse_({ status: 'error', message: 'Action doPost tidak dikenali: ' + action });
  } catch (err) {
    return jsonResponse_({ status: 'error', message: err.toString() });
  }
}

function getJenisIjinList_() {
  const sh = getSheet_(SHEET.CFG_JENIS_IJIN);
  if (!sh) return ['Sakit (S Dokter)', 'Sakit (S Tangan)', 'Ijin Normatif', 'Ijin (S Tangan)', 'Ijin Terlambat', 'Ijin Keluar Sementara', 'Ijin Pulang Awal', 'Alpha'];
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return ['Sakit (S Dokter)', 'Sakit (S Tangan)', 'Ijin Normatif', 'Ijin (S Tangan)', 'Ijin Terlambat', 'Ijin Keluar Sementara', 'Ijin Pulang Awal', 'Alpha'];
  const jenisCol = sh.getRange(1, 2, lastRow, 1).getValues().flat();
  const kategoriCol = sh.getRange(1, 3, lastRow, 1).getValues().flat();
  const KATEGORI_VALID = ['Sakit', 'Ijin', 'Alpha'];
  const res = [];
  for (let i = 0; i < jenisCol.length; i++) {
    if (jenisCol[i] && KATEGORI_VALID.indexOf(kategoriCol[i]) !== -1) res.push(jenisCol[i]);
  }
  return res;
}

function getSwitchAppUrl_() {
  const sh = getSheet_(SHEET.CONFIG_APP);
  if (!sh) return 'https://appspengolahan.github.io/HR-Karyawan-PP1/';
  return String(sh.getRange('C4').getValue() || '').trim();
}

function getConfigJamKerja_() {
  const sh = getSheet_(SHEET.CFG_JAM_KERJA);
  if (!sh) return [];
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];
  return sh.getRange(2, 1, lastRow - 1, 6).getValues();
}

function getAllPekerja_(scope) {
  const sh = getSheet_(SHEET.MASTER);
  if (!sh) return [];
  const lastRow = sh.getLastRow();
  if (lastRow < ROWS.MASTER_START) return [];
  const numRows = Math.min(lastRow, ROWS.MASTER_LAST) - ROWS.MASTER_START + 1;
  const data = sh.getRange(ROWS.MASTER_START, 2, numRows, 12).getValues(); // B:M
  const res = [];
  data.forEach((r, i) => {
    const nama = r[1];
    if (!nama) return;
    const unitSekup = r[4];
    if (scope && scope !== 'ALL' && unitSekup !== scope) return;
    const rawStatus = String(r[6] || '').trim();
    let computedStatusPKWT = r[9] || '';
    if (rawStatus.toUpperCase() === 'TETAP') {
      computedStatusPKWT = 'TETAP';
    } else if (r[8] instanceof Date) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const dAkhir = new Date(r[8]); dAkhir.setHours(0, 0, 0, 0);
      const diffDays = Math.round((dAkhir - today) / 86400000);
      if (diffDays < 0) {
        computedStatusPKWT = 'Sudah Berakhir';
      } else if (diffDays <= 26) {
        computedStatusPKWT = 'Segera Berakhir';
      } else {
        computedStatusPKWT = 'PKWT Berjalan';
      }
    }

    res.push({
      rowNum: ROWS.MASTER_START + i,
      id: r[0],
      nama: nama,
      unit: r[2],
      sekup: r[3],
      unitSekup: unitSekup,
      jabatan: r[5] || '-',
      status: rawStatus || '-',
      awalPKWT: fmtTgl_(r[7]),
      akhirPKWT: fmtTgl_(r[8]),
      statusPKWT: computedStatusPKWT,
      upahHarian: Number(r[10]) || 0,
      pendidikanTerakhir: r[11] || ''
    });
  });
  return res;
}

function getJadwalMutasi_() {
  const sh = getSheet_(SHEET.MUTASI);
  if (!sh) return [];
  const lastRow = sh.getLastRow();
  if (lastRow < ROWS.MUTASI_START) return [];
  const numRows = Math.min(lastRow, ROWS.MUTASI_LAST) - ROWS.MUTASI_START + 1;
  const data = sh.getRange(ROWS.MUTASI_START, 3, numRows, 10).getValues(); // C..L
  const res = [];
  data.forEach((r, i) => {
    const nama = r[1];
    if (!nama || r[9] !== 'Terjadwal') return;
    res.push({
      rowNum: ROWS.MUTASI_START + i,
      tanggalEfektif: fmtTgl_(r[0]),
      nama: nama,
      jenisMutasi: r[2],
      nilaiLama: r[3],
      nilaiBaru: r[4],
      keterangan: r[5] || '',
      diinputOleh: r[6] || ''
    });
  });
  return res;
}

function getCalonPekerjaList_(scope) {
  const sh = getSheet_(SHEET.CALON);
  if (!sh) return [];
  const lastRow = sh.getLastRow();
  if (lastRow < ROWS.CALON_START) return [];
  const numRows = Math.min(lastRow, ROWS.CALON_LAST) - ROWS.CALON_START + 1;
  const data = sh.getRange(ROWS.CALON_START, 3, numRows, 11).getValues(); // C..M
  const today = new Date(); today.setHours(0, 0, 0, 0);

  // Ambil daftar nama pekerja yang sudah resmi terdaftar di MASTER_PEKERJA
  let masterNames = [];
  const shMaster = getSheet_(SHEET.MASTER);
  if (shMaster) {
    const lastM = shMaster.getLastRow();
    if (lastM >= ROWS.MASTER_START) {
      masterNames = shMaster.getRange(ROWS.MASTER_START, 3, Math.min(lastM, ROWS.MASTER_LAST) - ROWS.MASTER_START + 1, 1)
        .getValues()
        .flat()
        .map(n => String(n || '').trim().toUpperCase());
    }
  }

  const res = [];
  data.forEach((r, i) => {
    const nama = r[0];
    if (!nama) return;
    const unit = r[1], sekup = r[2];
    const unitSekup = (sekup && unit) ? (sekup + ' ' + unit) : '';
    if (scope && scope !== 'ALL' && unitSekup !== scope) return;

    let status = String(r[7] || 'Sedang Berjalan');
    // Jika nama sudah ada di MASTER_PEKERJA, status otomatis diakui sebagai 'Lolos'
    if (masterNames.indexOf(String(nama).trim().toUpperCase()) !== -1) {
      status = 'Lolos';
    }

    const tglMulai = r[3], tglAkhir = r[4];
    let durasi = '', sisaHari = '';
    if (tglMulai instanceof Date && tglAkhir instanceof Date) {
      const tm = new Date(tglMulai); tm.setHours(0, 0, 0, 0);
      const ta = new Date(tglAkhir); ta.setHours(0, 0, 0, 0);
      durasi = Math.round((ta - tm) / 86400000) + 1;
      if (status === 'Sedang Berjalan') sisaHari = Math.round((ta - today) / 86400000);
    }
    res.push({
      rowNum: ROWS.CALON_START + i,
      nama: nama,
      unit: unit,
      sekup: sekup,
      tanggalMulai: fmtTgl_(tglMulai),
      tanggalAkhir: fmtTgl_(tglAkhir),
      durasi: durasi,
      sisaHari: sisaHari,
      status: status,
      jumlahPerpanjangan: r[8] || 0,
      catatan: r[9] || ''
    });
  });
  return res;
}

function getPresensiList_(bulan, tahun, nama, scope) {
  const sh = getSheet_(SHEET.PRESENSI);
  if (!sh) return [];
  const lastRow = sh.getLastRow();
  if (lastRow < ROWS.PRESENSI_START) return [];
  const numRows = Math.min(lastRow, ROWS.PRESENSI_LAST) - ROWS.PRESENSI_START + 1;
  const data = sh.getRange(ROWS.PRESENSI_START, 3, numRows, 14).getValues(); // C..P
  const res = [];
  data.forEach((r, i) => {
    const tgl = r[0];
    if (!tgl) return;
    const rNama = r[1];
    const rUnit = r[2];
    const rSekup = r[3];
    const rBulan = r[11];
    const rTahun = r[12];
    const unitSekup = (rSekup && rUnit) ? (rSekup + ' ' + rUnit) : '';

    if (scope && scope !== 'ALL' && unitSekup !== scope) return;
    if (nama && rNama !== nama) return;
    if (bulan && String(rBulan) !== String(bulan)) return;
    if (tahun && String(rTahun) !== String(tahun)) return;

    res.push({
      rowNum: ROWS.PRESENSI_START + i,
      tanggal: fmtTgl_(tgl),
      tanggalIso: (tgl instanceof Date) ? Utilities.formatDate(tgl, Session.getScriptTimeZone(), 'yyyy-MM-dd') : '',
      nama: rNama,
      unit: rUnit,
      sekup: rSekup,
      jamAwal: fmtJam_(r[4]),
      jamAkhir: fmtJam_(r[5]),
      durasiMenit: r[6],
      jenisIjin: r[7],
      keperluan: r[8],
      lampiran: r[9],
      catatan: r[10],
      faktorPotongan: r[13] === '' ? 0 : r[13]
    });
  });
  return res.reverse();
}

function getSlipUpahRentang_(nama, tglAwal, tglAkhir) {
  const shMaster = getSheet_(SHEET.MASTER);
  if (!shMaster) return null;
  const lastRowMaster = shMaster.getLastRow();
  const masterData = shMaster.getRange(ROWS.MASTER_START, 3, Math.min(lastRowMaster, ROWS.MASTER_LAST) - ROWS.MASTER_START + 1, 10).getValues();
  let worker = null;
  for (let i = 0; i < masterData.length; i++) {
    if (masterData[i][0] === nama) {
      worker = {
        nama: masterData[i][0],
        unit: masterData[i][1],
        sekup: masterData[i][2],
        upahHarian: Number(masterData[i][9]) || 0
      };
      break;
    }
  }

  const upahHarian = worker ? worker.upahHarian : 146675.96;
  const unit = worker ? worker.unit : '-';
  const sekup = worker ? worker.sekup : '-';

  const dStart = toDateValue_(tglAwal);
  const dEnd = toDateValue_(tglAkhir);

  let hariKerjaTersedia = 0;
  if (dStart && dEnd) {
    const cur = new Date(dStart.getTime());
    while (cur <= dEnd) {
      if (cur.getDay() !== 0) hariKerjaTersedia++;
      cur.setDate(cur.getDate() + 1);
    }
  }

  let totalPotonganFaktor = 0;
  const shPresensi = getSheet_(SHEET.PRESENSI);
  if (shPresensi && dStart && dEnd) {
    const pLast = shPresensi.getLastRow();
    if (pLast >= ROWS.PRESENSI_START) {
      const pRows = shPresensi.getRange(ROWS.PRESENSI_START, 3, Math.min(pLast, ROWS.PRESENSI_LAST) - ROWS.PRESENSI_START + 1, 14).getValues();
      pRows.forEach(r => {
        const tgl = r[0];
        const pNama = r[1];
        if (pNama === nama && tgl instanceof Date && tgl >= dStart && tgl <= dEnd) {
          totalPotonganFaktor += (Number(r[13]) || 0);
        }
      });
    }
  }

  let totalLembur = 0;
  const shLembur = getSheet_(SHEET.LEMBUR);
  if (shLembur && dStart && dEnd) {
    const lLast = shLembur.getLastRow();
    if (lLast >= ROWS.LEMBUR_START) {
      const lRows = shLembur.getRange(ROWS.LEMBUR_START, 3, Math.min(lLast, ROWS.LEMBUR_LAST) - ROWS.LEMBUR_START + 1, 13).getValues();
      lRows.forEach(r => {
        const tgl = r[0];
        const lNama = r[1];
        if (lNama === nama && tgl instanceof Date && tgl >= dStart && tgl <= dEnd) {
          totalLembur += (Number(r[12]) || 0);
        }
      });
    }
  }

  const hariTidakDibayar = totalPotonganFaktor;
  const hariDibayar = Math.max(0, hariKerjaTersedia - hariTidakDibayar);
  const upahPokok = hariDibayar * upahHarian;

  return {
    nama: nama,
    unit: unit,
    sekup: sekup,
    upahHarian: upahHarian,
    hariKerjaTersedia: hariKerjaTersedia,
    hariTidakDibayar: hariTidakDibayar,
    hariDibayar: hariDibayar,
    upahPokok: upahPokok,
    totalLembur: totalLembur,
    totalDiterima: upahPokok + totalLembur
  };
}

function getRekapLembur_(tglAwal, tglAkhir, unit, sekup, scope) {
  const sh = getSheet_(SHEET.LEMBUR);
  if (!sh) return { jumlahKejadian: 0, totalNominal: 0, rows: [] };
  const lastRow = sh.getLastRow();
  if (lastRow < ROWS.LEMBUR_START) return { jumlahKejadian: 0, totalNominal: 0, rows: [] };
  const numRows = Math.min(lastRow, ROWS.LEMBUR_LAST) - ROWS.LEMBUR_START + 1;
  const data = sh.getRange(ROWS.LEMBUR_START, 3, numRows, 13).getValues();
  const awalDate = tglAwal ? toDateValue_(tglAwal) : null;
  let akhirDate = tglAkhir ? toDateValue_(tglAkhir) : null;
  if (akhirDate) akhirDate = new Date(akhirDate.getFullYear(), akhirDate.getMonth(), akhirDate.getDate(), 23, 59, 59);

  let jml = 0, total = 0;
  const rows = [];
  data.forEach((r, i) => {
    const tanggal = r[0];
    if (!tanggal) return;
    const rUnit = r[2], rSekup = r[3];
    const unitSekup = (rSekup && rUnit) ? (rSekup + ' ' + rUnit) : '';
    if (scope && scope !== 'ALL' && unitSekup !== scope) return;
    if (unit && unit !== 'Semua' && rUnit !== unit) return;
    if (sekup && sekup !== 'Semua' && rSekup !== sekup) return;
    if (awalDate && tanggal < awalDate) return;
    if (akhirDate && tanggal > akhirDate) return;

    jml++;
    const nominal = Number(r[12]) || 0;
    total += nominal;
    rows.push({
      rowNum: ROWS.LEMBUR_START + i,
      tanggal: fmtTgl_(tanggal),
      nama: r[1],
      unit: rUnit,
      sekup: rSekup,
      kategori: r[5],
      jamMulai: fmtJam_(r[6]),
      jamSelesai: fmtJam_(r[7]),
      jmlJam: r[8] === '' ? '' : Math.round(r[8] * 100) / 100,
      nominal: nominal
    });
  });
  return { jumlahKejadian: jml, totalNominal: total, rows: rows.reverse() };
}

function toDateValue_(str) {
  if (!str) return null;
  const p = String(str).split('-');
  return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
}

function fmtTgl_(v) {
  if (!v) return '-';
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  return String(v);
}

function fmtJam_(v) {
  if (!v) return '-';
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'HH:mm');
  return String(v);
}

function jalankanPemicuHarian_() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const shMutasi = getSheet_(SHEET.MUTASI);
  const shMaster = getSheet_(SHEET.MASTER);
  if (shMutasi && shMaster) {
    const numRows = ROWS.MUTASI_LAST - ROWS.MUTASI_START + 1;
    const mutasiData = shMutasi.getRange(ROWS.MUTASI_START, 3, numRows, 10).getValues();
    const masterData = shMaster.getRange(ROWS.MASTER_START, 3, ROWS.MASTER_LAST - ROWS.MASTER_START + 1, 1).getValues().flat();

    mutasiData.forEach((r, i) => {
      const tglEfektif = r[0];
      const nama = r[1];
      const jenis = r[2];
      const nilaiBaru = r[4];
      const status = r[9];

      if (status === 'Terjadwal' && tglEfektif instanceof Date && tglEfektif <= today) {
        const masterIdx = masterData.indexOf(nama);
        if (masterIdx !== -1) {
          const targetRow = ROWS.MASTER_START + masterIdx;
          if (jenis === 'Unit') shMaster.getRange(targetRow, 4).setValue(nilaiBaru);
          else if (jenis === 'Sekup') shMaster.getRange(targetRow, 5).setValue(nilaiBaru);
          else if (jenis === 'Status Kepegawaian') shMaster.getRange(targetRow, 8).setValue(nilaiBaru);
          else if (jenis === 'Awal PKWT') shMaster.getRange(targetRow, 9).setValue(toDateValue_(nilaiBaru));
          else if (jenis === 'Akhir PKWT') shMaster.getRange(targetRow, 10).setValue(toDateValue_(nilaiBaru));
          else if (jenis === 'Upah Harian') shMaster.getRange(targetRow, 12).setValue(Number(nilaiBaru));
          else if (jenis === 'Pendidikan Terakhir') shMaster.getRange(targetRow, 13).setValue(nilaiBaru);
          
          shMutasi.getRange(ROWS.MUTASI_START + i, 12).setValue('Selesai');
        }
      }
    });
  }
}

function pasangPemicuOtomatisHarian_() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'jalankanPemicuHarian_') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger('jalankanPemicuHarian_')
    .timeBased()
    .everyDays(1)
    .atHour(1)
    .create();
}
`;
