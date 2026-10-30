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
  CONFIG_USER_LOGIN: 'CONFIG_USER_LOGIN',
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
  MUTASI_START: 6, MUTASI_LAST: 505,
  USER_LOGIN_START: 4, USER_LOGIN_LAST: 200
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
          lembur: getRekapLembur_('', '', 'Semua', 'Semua', scope),
          userLogins: getUserLogins_()
        }
      });
    }

    if (action === 'getUserLogins') {
      return jsonResponse_({ status: 'success', data: getUserLogins_() });
    }

    if (action === 'initUserLoginSheet') {
      return jsonResponse_(initUserLoginSheet_());
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
    const currentUser = payload.currentUser || 'Web App User';
    const rowNum = (payload.data && payload.data.rowNum) || payload.rowNum;

    if (action === 'saveUserLogin') {
      return jsonResponse_(saveUserLogin_(payload.data, currentUser));
    }
    if (action === 'deleteUserLogin') {
      const email = (payload.data && payload.data.email) || payload.email;
      return jsonResponse_(deleteUserLogin_(email, currentUser));
    }
    if (action === 'syncAllUserLogins') {
      return jsonResponse_(syncAllUserLogins_(payload.data, currentUser));
    }
    if (action === 'initUserLoginSheet') {
      return jsonResponse_(initUserLoginSheet_());
    }
    if (action === 'addPresensiIjin') {
      return jsonResponse_(addPresensiIjin_(payload.data, currentUser));
    }
    if (action === 'updatePresensiIjin') {
      return jsonResponse_(updatePresensiIjin_(payload.data, currentUser));
    }
    if (action === 'deletePresensiIjin') {
      return jsonResponse_(deletePresensiIjin_(rowNum, currentUser));
    }
    if (action === 'submitLemburBatch') {
      return jsonResponse_(submitLemburBatch_(payload.data, currentUser));
    }
    if (action === 'addNewPekerja') {
      return jsonResponse_(addNewPekerja_(payload.data, currentUser));
    }
    if (action === 'updatePekerja') {
      return jsonResponse_(updatePekerja_(payload.data, currentUser));
    }
    if (action === 'deletePekerja') {
      return jsonResponse_(deletePekerja_(rowNum, currentUser));
    }
    if (action === 'submitMutasi') {
      return jsonResponse_(submitMutasi_(payload.data, currentUser));
    }
    if (action === 'updateStatusCalon') {
      return jsonResponse_(updateStatusCalon_(payload.data, currentUser));
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

// =========================================================================
// MUTASI DATA DUA ARAH (TWO-WAY SPREADSHEET CRUD ENGINE)
// =========================================================================

function addPresensiIjin_(data, currentUser) {
  const sh = getSheet_(SHEET.PRESENSI);
  if (!sh) throw new Error('Sheet ' + SHEET.PRESENSI + ' tidak ditemukan.');
  
  const shMaster = getSheet_(SHEET.MASTER);
  let unit = '', sekup = '';
  if (shMaster) {
    const lastM = shMaster.getLastRow();
    if (lastM >= ROWS.MASTER_START) {
      const mData = shMaster.getRange(ROWS.MASTER_START, 3, Math.min(lastM, ROWS.MASTER_LAST) - ROWS.MASTER_START + 1, 3).getValues();
      for (let i = 0; i < mData.length; i++) {
        if (mData[i][0] === data.nama) {
          unit = mData[i][1];
          sekup = mData[i][2];
          break;
        }
      }
    }
  }

  const tanggalList = Array.isArray(data.tanggalList) && data.tanggalList.length > 0
    ? data.tanggalList
    : [{ tanggal: data.tanggal, jamAwal: data.jamAwal, jamAkhir: data.jamAkhir }];

  const rowsToAdd = [];
  tanggalList.forEach(t => {
    const tglObj = toDateValue_(t.tanggal);
    let durasiMenit = 0;
    if (t.jamAwal && t.jamAkhir) {
      const p1 = String(t.jamAwal).split(':').map(Number);
      const p2 = String(t.jamAkhir).split(':').map(Number);
      if (p1.length === 2 && p2.length === 2) {
        durasiMenit = Math.max(0, (p2[0] * 60 + p2[1]) - (p1[0] * 60 + p1[1]));
      }
    }
    if (data.jenisIjin && (data.jenisIjin.startsWith('Sakit') || data.jenisIjin.startsWith('Ijin (S Tangan)') || data.jenisIjin === 'Alpha' || data.jenisIjin === 'Ijin Normatif')) {
      durasiMenit = 420; // 1 hari kerja normal
    }

    const bulan = tglObj ? (tglObj.getMonth() + 1) : '';
    const tahun = tglObj ? tglObj.getFullYear() : '';
    
    let faktorPotongan = 0;
    if (data.jenisIjin && (data.jenisIjin.startsWith('Sakit (S Dokter)') || data.jenisIjin === 'Ijin Normatif')) {
      faktorPotongan = 0;
    } else if (data.jenisIjin && (data.jenisIjin.startsWith('Sakit (S Tangan)') || data.jenisIjin.startsWith('Ijin (S Tangan)') || data.jenisIjin === 'Alpha')) {
      faktorPotongan = 1;
    } else {
      faktorPotongan = Math.round((durasiMenit / 420) * 100) / 100;
    }

    // Col C..P (14 cols)
    rowsToAdd.push([
      tglObj || t.tanggal,
      data.nama,
      unit,
      sekup,
      t.jamAwal || '-',
      t.jamAkhir || '-',
      durasiMenit,
      data.jenisIjin,
      data.keperluan || '-',
      data.lampiran || 'Tidak',
      data.catatan || '',
      bulan,
      tahun,
      faktorPotongan
    ]);
  });

  if (rowsToAdd.length > 0) {
    const nextRow = sh.getLastRow() + 1;
    sh.getRange(nextRow, 3, rowsToAdd.length, 14).setValues(rowsToAdd);
  }

  return { status: 'success', message: 'Berhasil mencatat ' + rowsToAdd.length + ' presensi/ijin ke spreadsheet.' };
}

function updatePresensiIjin_(data, currentUser) {
  const sh = getSheet_(SHEET.PRESENSI);
  if (!sh) throw new Error('Sheet ' + SHEET.PRESENSI + ' tidak ditemukan.');
  const rowNum = Number(data.rowNum);
  if (!rowNum || rowNum < ROWS.PRESENSI_START) throw new Error('Nomor baris tidak valid.');

  let durasiMenit = 0;
  if (data.jamAwal && data.jamAkhir) {
    const p1 = String(data.jamAwal).split(':').map(Number);
    const p2 = String(data.jamAkhir).split(':').map(Number);
    if (p1.length === 2 && p2.length === 2) {
      durasiMenit = Math.max(0, (p2[0] * 60 + p2[1]) - (p1[0] * 60 + p1[1]));
    }
  }

  const tglObj = toDateValue_(data.tanggal);
  const bulan = tglObj ? (tglObj.getMonth() + 1) : '';
  const tahun = tglObj ? tglObj.getFullYear() : '';

  let faktorPotongan = 0;
  if (data.jenisIjin && (data.jenisIjin.startsWith('Sakit (S Dokter)') || data.jenisIjin === 'Ijin Normatif')) {
    faktorPotongan = 0;
  } else if (data.jenisIjin && (data.jenisIjin.startsWith('Sakit (S Tangan)') || data.jenisIjin.startsWith('Ijin (S Tangan)') || data.jenisIjin === 'Alpha')) {
    faktorPotongan = 1;
  } else {
    faktorPotongan = Math.round((durasiMenit / 420) * 100) / 100;
  }

  sh.getRange(rowNum, 7).setValue(data.jamAwal || '-');
  sh.getRange(rowNum, 8).setValue(data.jamAkhir || '-');
  sh.getRange(rowNum, 9).setValue(durasiMenit);
  sh.getRange(rowNum, 10).setValue(data.jenisIjin);
  sh.getRange(rowNum, 11).setValue(data.keperluan || '-');
  sh.getRange(rowNum, 12).setValue(data.lampiran || 'Tidak');
  sh.getRange(rowNum, 13).setValue(data.catatan || '');
  sh.getRange(rowNum, 14).setValue(bulan);
  sh.getRange(rowNum, 15).setValue(tahun);
  sh.getRange(rowNum, 16).setValue(faktorPotongan);

  return { status: 'success', message: 'Data presensi baris #' + rowNum + ' berhasil diperbarui di spreadsheet.' };
}

function deletePresensiIjin_(rowNum, currentUser) {
  const sh = getSheet_(SHEET.PRESENSI);
  if (!sh) throw new Error('Sheet ' + SHEET.PRESENSI + ' tidak ditemukan.');
  const r = Number(rowNum);
  if (!r || r < ROWS.PRESENSI_START || r > sh.getLastRow()) {
    throw new Error('Baris #' + rowNum + ' tidak ditemukan atau di luar rentang.');
  }

  const rowVals = sh.getRange(r, 3, 1, 14).getValues()[0];
  const shArsip = getSheet_(SHEET.ARSIP_HAPUS_PRESENSI);
  if (shArsip) {
    const nextA = shArsip.getLastRow() + 1;
    shArsip.getRange(nextA, 1, 1, 16).setValues([[
      new Date(),
      currentUser || 'Web App User',
      ...rowVals
    ]]);
  }

  sh.deleteRow(r);
  return { status: 'success', message: 'Baris presensi #' + r + ' berhasil dihapus dari spreadsheet.' };
}

function submitLemburBatch_(data, currentUser) {
  const sh = getSheet_(SHEET.LEMBUR);
  if (!sh) throw new Error('Sheet ' + SHEET.LEMBUR + ' tidak ditemukan.');
  
  const shMaster = getSheet_(SHEET.MASTER);
  const workerMap = {};
  if (shMaster) {
    const lastM = shMaster.getLastRow();
    if (lastM >= ROWS.MASTER_START) {
      const mData = shMaster.getRange(ROWS.MASTER_START, 3, Math.min(lastM, ROWS.MASTER_LAST) - ROWS.MASTER_START + 1, 10).getValues();
      mData.forEach(m => {
        workerMap[m[0]] = { unit: m[1], sekup: m[2], upahHarian: Number(m[9]) || 146675.96 };
      });
    }
  }

  const p1 = String(data.jamMulai || '').split(':').map(Number);
  const p2 = String(data.jamSelesai || '').split(':').map(Number);
  let jmlJam = 0;
  if (p1.length === 2 && p2.length === 2) {
    jmlJam = Math.max(0, Math.round(((p2[0] * 60 + p2[1]) - (p1[0] * 60 + p1[1])) / 60 * 100) / 100);
  }

  const tglObj = toDateValue_(data.tanggal);
  const rows = [];
  (data.namaList || []).forEach(nama => {
    const w = workerMap[nama] || { unit: '-', sekup: '-', upahHarian: 146675.96 };
    const upahPerJam = Math.round(w.upahHarian / 7);
    const nominal = Math.round(jmlJam * upahPerJam * 1.5);

    rows.push([
      tglObj || data.tanggal,
      nama,
      w.unit,
      w.sekup,
      data.kategori || 'Hari Kerja',
      data.jamMulai || '-',
      data.jamSelesai || '-',
      jmlJam,
      1.5,
      w.upahHarian,
      'Lembur Harian',
      nominal,
      currentUser || 'Mandor'
    ]);
  });

  if (rows.length > 0) {
    const nextRow = sh.getLastRow() + 1;
    sh.getRange(nextRow, 3, rows.length, 13).setValues(rows);
  }

  return { status: 'success', message: 'Berhasil mencatat lembur untuk ' + rows.length + ' pekerja di spreadsheet.' };
}

function addNewPekerja_(data, currentUser) {
  const sh = getSheet_(SHEET.MASTER);
  if (!sh) throw new Error('Sheet ' + SHEET.MASTER + ' tidak ditemukan.');
  
  const nextRow = sh.getLastRow() + 1;
  const newId = nextRow - ROWS.MASTER_START + 1;
  const unitSekup = (data.sekup && data.unit) ? (data.sekup + ' ' + data.unit) : '';

  const newRow = [
    newId,
    data.nama,
    data.unit,
    data.sekup,
    unitSekup,
    data.jabatan || 'Harian',
    data.status || 'PKWT',
    toDateValue_(data.awalPKWT) || data.awalPKWT || '-',
    toDateValue_(data.akhirPKWT) || data.akhirPKWT || '-',
    data.statusPKWT || 'PKWT Berjalan',
    Number(data.upahHarian) || 146675.96,
    data.pendidikanTerakhir || '-'
  ];

  sh.getRange(nextRow, 2, 1, 12).setValues([newRow]);
  return { status: 'success', message: 'Pekerja ' + data.nama + ' berhasil ditambahkan ke spreadsheet.' };
}

function updatePekerja_(data, currentUser) {
  const sh = getSheet_(SHEET.MASTER);
  if (!sh) throw new Error('Sheet ' + SHEET.MASTER + ' tidak ditemukan.');
  const r = Number(data.rowNum);
  if (!r || r < ROWS.MASTER_START) throw new Error('Nomor baris pekerja tidak valid.');

  const unitSekup = (data.sekup && data.unit) ? (data.sekup + ' ' + data.unit) : '';
  sh.getRange(r, 3).setValue(data.nama);
  sh.getRange(r, 4).setValue(data.unit);
  sh.getRange(r, 5).setValue(data.sekup);
  sh.getRange(r, 6).setValue(unitSekup);
  sh.getRange(r, 7).setValue(data.jabatan || 'Harian');
  sh.getRange(r, 8).setValue(data.status || 'PKWT');
  sh.getRange(r, 9).setValue(toDateValue_(data.awalPKWT) || data.awalPKWT || '-');
  sh.getRange(r, 10).setValue(toDateValue_(data.akhirPKWT) || data.akhirPKWT || '-');
  sh.getRange(r, 11).setValue(data.statusPKWT || '-');
  sh.getRange(r, 12).setValue(Number(data.upahHarian) || 146675.96);
  sh.getRange(r, 13).setValue(data.pendidikanTerakhir || '-');

  return { status: 'success', message: 'Data pekerja ' + data.nama + ' berhasil diperbarui di spreadsheet.' };
}

function deletePekerja_(rowNum, currentUser) {
  const sh = getSheet_(SHEET.MASTER);
  if (!sh) throw new Error('Sheet ' + SHEET.MASTER + ' tidak ditemukan.');
  const r = Number(rowNum);
  if (!r || r < ROWS.MASTER_START) throw new Error('Nomor baris pekerja tidak valid.');

  const rowVals = sh.getRange(r, 2, 1, 12).getValues()[0];
  const shArsip = getSheet_(SHEET.ARSIP_HAPUS_PEKERJA);
  if (shArsip) {
    const nextA = shArsip.getLastRow() + 1;
    shArsip.getRange(nextA, 1, 1, 14).setValues([[
      new Date(),
      currentUser || 'Web App User',
      ...rowVals
    ]]);
  }

  sh.deleteRow(r);
  return { status: 'success', message: 'Data pekerja baris #' + r + ' berhasil dihapus dari spreadsheet.' };
}

function submitMutasi_(data, currentUser) {
  const sh = getSheet_(SHEET.MUTASI);
  if (!sh) throw new Error('Sheet ' + SHEET.MUTASI + ' tidak ditemukan.');

  const nextRow = sh.getLastRow() + 1;
  const newRow = [
    toDateValue_(data.tanggalEfektif) || data.tanggalEfektif,
    data.nama,
    data.jenisMutasi,
    data.nilaiLama || '-',
    data.nilaiBaru || '-',
    data.keterangan || '-',
    currentUser || 'Admin HR',
    '',
    '',
    'Terjadwal'
  ];

  sh.getRange(nextRow, 3, 1, 10).setValues([newRow]);
  return { status: 'success', message: 'Jadwal mutasi berhasil dicatat di spreadsheet.' };
}

function updateStatusCalon_(data, currentUser) {
  const sh = getSheet_(SHEET.CALON);
  if (!sh) throw new Error('Sheet ' + SHEET.CALON + ' tidak ditemukan.');
  const r = Number(data.rowNum);
  if (!r || r < ROWS.CALON_START) throw new Error('Nomor baris calon pekerja tidak valid.');

  sh.getRange(r, 10).setValue(data.status);
  if (data.catatan) sh.getRange(r, 12).setValue(data.catatan);

  return { status: 'success', message: 'Status calon pekerja baris #' + r + ' berhasil diperbarui di spreadsheet.' };
}

// =========================================================================
// MODUL HAK AKSES & AKUN LOGIN PENGGUNA (CONFIG_USER_LOGIN)
// =========================================================================

function initUserLoginSheet_() {
  const ss = getSpreadsheet_();
  let sh = ss.getSheetByName(SHEET.CONFIG_USER_LOGIN);
  
  if (!sh) {
    sh = ss.insertSheet(SHEET.CONFIG_USER_LOGIN);
    
    // Header title & branding
    sh.getRange('A1:J1').merge()
      .setValue('PT BATU KARANG — DIVISI PRODUKSI I (PP1) | MASTER AKUN PENGGUNA & HAK AKSES')
      .setBackground('#0f172a')
      .setFontColor('#38bdf8')
      .setFontWeight('bold')
      .setFontSize(12)
      .setHorizontalAlignment('center');
      
    sh.getRange('A2:J2').merge()
      .setValue('Catatan: Sumber data resmi akun login tim internal. Terkoneksi otomatis dengan Web Apps. Jangan ubah struktur kolom.')
      .setBackground('#1e293b')
      .setFontColor('#94a3b8')
      .setFontSize(9)
      .setHorizontalAlignment('center');

    // Kolom Header Baris 3
    const headers = [
      'No', 
      'Email / Username', 
      'Kata Sandi / PIN', 
      'Nama Pengguna', 
      'Peran (Role)', 
      'Cakupan Unit (Scope)', 
      'Daftar Unit (Koma)', 
      'Modul Diizinkan (Koma)', 
      'Status Akun', 
      'Terakhir Diperbarui'
    ];
    sh.getRange(3, 1, 1, headers.length).setValues([headers])
      .setBackground('#1e3a8a')
      .setFontColor('#ffffff')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');

    sh.setFrozenRows(3);

    // Initial Default Seed Data
    const defaultAccounts = [
      [1, 'appspengolahan@gmail.com', 'admin', 'Lalu Mahendra (Lead Developer)', 'Super Admin', 'ALL', 'Cengkeh, Blend, Tembakau, Krosok', 'dashboard, presensi, lembur, rekap, slip, database, jadwalmutasi, profil, calon, hakakses', 'Aktif', new Date()],
      [2, 'indahnurmala189@gmail.com', 'mandor', 'Mandor Proses Cengkeh (Plt. Ka)', 'Mandor Proses Cengkeh', 'Proses Cengkeh & Persediaan Cengkeh', 'Proses Cengkeh, Persediaan Cengkeh', 'dashboard, presensi, lembur, rekap', 'Aktif', new Date()],
      [3, 'unitcengkeh.pp1@gmail.com', 'mandorCKH153', 'Mandor Unit Cengkeh', 'Foreman / Mandor', 'Proses Cengkeh', 'Cengkeh', 'dashboard, presensi, lembur, rekap', 'Aktif', new Date()],
      [4, 'pm@batukarang.com', 'pm123', 'Project Manager (Monitoring Lapangan)', 'Project Manager', 'ALL', 'Cengkeh, Blend, Tembakau, Krosok', 'dashboard, presensi, lembur, rekap, slip, database, jadwalmutasi, profil, calon, hakakses', 'Aktif', new Date()],
      [5, 'engineer@batukarang.com', 'engineer123', 'Site Engineer PP1', 'Site Engineer', 'ALL', 'Cengkeh, Blend, Tembakau, Krosok', 'dashboard, presensi, lembur, rekap, database, jadwalmutasi, profil, hakakses', 'Aktif', new Date()],
      [6, 'hr@batukarang.com', 'hr123', 'Admin HR Divisi PP1', 'HR Admin', 'ALL', 'Cengkeh, Blend, Tembakau, Krosok', 'dashboard, presensi, lembur, rekap, slip, database, jadwalmutasi, profil, calon, hakakses', 'Aktif', new Date()],
      [7, 'manajer@batukarang.com', 'manajer123', 'Manajer Operasional PP1', 'Manajer Operasional', 'ALL', 'Cengkeh, Blend, Tembakau, Krosok', 'dashboard, presensi, lembur, rekap, slip, database, jadwalmutasi, profil, calon', 'Aktif', new Date()],
      [8, 'ka.pengolahan2@batukarang.com', 'ka2', 'Kepala Pengolahan 2', 'Kepala Pengolahan 2', 'Cengkeh & Blend', 'Cengkeh, Blend', 'dashboard, presensi, lembur, rekap, slip, database, jadwalmutasi, profil, calon', 'Aktif', new Date()],
      [9, 'ka.pengolahan1@batukarang.com', 'ka1', 'Kepala Pengolahan 1', 'Kepala Pengolahan 1', 'Tembakau & Krosok', 'Tembakau, Krosok', 'dashboard, presensi, lembur, rekap, slip, database, jadwalmutasi, profil, calon', 'Aktif', new Date()],
      [10, 'gudang.tembakau@batukarang.com', 'gudang123', 'Kepala Gudang Tembakau & Krosok', 'Kepala Gudang Tembakau & Krosok', 'Persediaan Tembakau & Krosok', 'Tembakau, Krosok', 'dashboard, presensi, lembur, rekap, database, profil', 'Aktif', new Date()],
      [11, 'mandor.pcengkeh@batukarang.com', 'mandor', 'Mandor Proses Cengkeh', 'Mandor Proses Cengkeh', 'Proses Cengkeh', 'Proses Cengkeh', 'dashboard, presensi, lembur, rekap', 'Aktif', new Date()],
      [12, 'mandor.gcengkeh@batukarang.com', 'mandor', 'Mandor Persediaan Cengkeh', 'Mandor Persediaan Cengkeh', 'Persediaan Cengkeh', 'Persediaan Cengkeh', 'dashboard, presensi, lembur, rekap', 'Aktif', new Date()],
      [13, 'mandor.ptembakau@batukarang.com', 'mandor', 'Mandor Proses Tembakau', 'Mandor Proses Tembakau', 'Proses Tembakau', 'Proses Tembakau', 'dashboard, presensi, lembur, rekap', 'Aktif', new Date()],
      [14, 'mandor.pkrosok@batukarang.com', 'mandor', 'Mandor Proses Krosok', 'Mandor Proses Krosok', 'Proses Krosok', 'Proses Krosok', 'dashboard, presensi, lembur, rekap', 'Aktif', new Date()],
      [15, 'mandor.pblend@batukarang.com', 'mandor', 'Mandor Proses Blend', 'Mandor Proses Blend', 'Proses Blend', 'Proses Blend', 'dashboard, presensi, lembur, rekap', 'Aktif', new Date()],
      [16, 'mandor.gblend@batukarang.com', 'mandor', 'Mandor Persediaan Blend', 'Mandor Persediaan Blend', 'Persediaan Blend', 'Persediaan Blend', 'dashboard, presensi, lembur, rekap', 'Aktif', new Date()]
    ];

    sh.getRange(4, 1, defaultAccounts.length, 10).setValues(defaultAccounts);
    
    // Auto fit column widths
    for (let c = 1; c <= 10; c++) {
      sh.autoResizeColumn(c);
    }
  }

  return { 
    status: 'success', 
    message: 'Sheet ' + SHEET.CONFIG_USER_LOGIN + ' berhasil diinisialisasi dengan struktur akun resmi.' 
  };
}

function getLoginHeaderRow_(sh) {
  const last = Math.min(sh.getLastRow(), 10);
  for (let r = 1; r <= last; r++) {
    const val = String(sh.getRange(r, 2).getValue() || '').toLowerCase();
    if (val.indexOf('email') !== -1 || val.indexOf('username') !== -1) {
      return r;
    }
  }
  return 4; // default header row sesuai yang dibuat user
}

function getUserLogins_() {
  const sh = getSheet_(SHEET.CONFIG_USER_LOGIN);
  if (!sh) return [];

  const lastRow = sh.getLastRow();
  const headerRow = getLoginHeaderRow_(sh);
  const dataStart = headerRow + 1;
  if (lastRow < dataStart) return [];

  const data = sh.getRange(dataStart, 1, lastRow - headerRow, 10).getValues();
  const res = [];

  data.forEach((r, idx) => {
    const email = String(r[1] || '').trim();
    if (!email) return;
    if (email.toLowerCase().indexOf('email') !== -1 || email.toLowerCase().indexOf('username') !== -1) return;

    const password = String(r[2] || '').trim();
    const nama = String(r[3] || '').trim();
    const role = String(r[4] || 'Foreman / Mandor').trim();
    const scope = String(r[5] || 'ALL').trim();
    const rawUnits = String(r[6] || '').trim();
    const rawTabs = String(r[7] || '').trim();
    const status = String(r[8] || 'Aktif').trim();

    if (status.toLowerCase() === 'nonaktif' || status.toLowerCase() === 'ditolak') {
      return;
    }

    const units = rawUnits ? rawUnits.split(',').map(u => u.trim()).filter(Boolean) : [scope];
    const allowedTabs = rawTabs ? rawTabs.split(',').map(t => t.trim()).filter(Boolean) : ['dashboard', 'presensi', 'lembur', 'rekap'];

    res.push({
      rowNum: dataStart + idx,
      no: r[0],
      email: email,
      password: password,
      nama: nama || email,
      role: role,
      scope: scope,
      units: units,
      allowedTabs: allowedTabs,
      status: status
    });
  });

  return res;
}

function saveUserLogin_(data, currentUser) {
  const sh = getSheet_(SHEET.CONFIG_USER_LOGIN);
  if (!sh) throw new Error('Sheet ' + SHEET.CONFIG_USER_LOGIN + ' tidak dapat diakses.');

  const emailClean = String(data.email || '').trim().toLowerCase();
  if (!emailClean) throw new Error('Email atau username login wajib diisi.');

  const lastRow = sh.getLastRow();
  const headerRow = getLoginHeaderRow_(sh);
  const dataStart = headerRow + 1;
  let existingRowNum = -1;

  if (lastRow >= dataStart) {
    const emails = sh.getRange(dataStart, 2, lastRow - headerRow, 1).getValues().flat();
    for (let i = 0; i < emails.length; i++) {
      if (String(emails[i] || '').trim().toLowerCase() === emailClean) {
        existingRowNum = dataStart + i;
        break;
      }
    }
  }

  const unitsStr = Array.isArray(data.units) ? data.units.join(', ') : (data.units || data.scope || 'ALL');
  const tabsStr = Array.isArray(data.allowedTabs) ? data.allowedTabs.join(', ') : (data.allowedTabs || 'dashboard, presensi');
  const now = new Date();

  if (existingRowNum !== -1) {
    sh.getRange(existingRowNum, 2).setValue(data.email.trim());
    if (data.password) sh.getRange(existingRowNum, 3).setValue(String(data.password).trim());
    sh.getRange(existingRowNum, 4).setValue(data.nama.trim());
    sh.getRange(existingRowNum, 5).setValue(data.role);
    sh.getRange(existingRowNum, 6).setValue(data.scope);
    sh.getRange(existingRowNum, 7).setValue(unitsStr);
    sh.getRange(existingRowNum, 8).setValue(tabsStr);
    sh.getRange(existingRowNum, 9).setValue('Aktif');
    sh.getRange(existingRowNum, 10).setValue(now);

    return { 
      status: 'success', 
      message: 'Akun ' + data.email + ' berhasil diperbarui di spreadsheet baris #' + existingRowNum 
    };
  } else {
    const nextRow = Math.max(dataStart, lastRow + 1);
    const newNo = nextRow - headerRow;
    const rowData = [
      newNo,
      data.email.trim(),
      String(data.password || 'mandor').trim(),
      data.nama.trim(),
      data.role || 'Foreman / Mandor',
      data.scope || 'ALL',
      unitsStr,
      tabsStr,
      'Aktif',
      now
    ];

    sh.getRange(nextRow, 1, 1, 10).setValues([rowData]);
    return { 
      status: 'success', 
      message: 'Akun baru ' + data.email + ' berhasil ditambahkan ke spreadsheet.' 
    };
  }
}

function syncAllUserLogins_(accountsList, currentUser) {
  const sh = getSheet_(SHEET.CONFIG_USER_LOGIN);
  if (!sh) throw new Error('Sheet ' + SHEET.CONFIG_USER_LOGIN + ' tidak dapat diakses.');

  if (!Array.isArray(accountsList) || accountsList.length === 0) {
    return { status: 'error', message: 'Daftar akun kosong.' };
  }

  const lastRow = sh.getLastRow();
  const headerRow = getLoginHeaderRow_(sh);
  const dataStart = headerRow + 1;
  if (lastRow >= dataStart) {
    sh.getRange(dataStart, 1, lastRow - headerRow, 10).clearContent();
  }

  const now = new Date();
  const rows = accountsList.map((acc, idx) => {
    const unitsStr = Array.isArray(acc.units) ? acc.units.join(', ') : (acc.units || acc.scope || 'ALL');
    const tabsStr = Array.isArray(acc.allowedTabs) ? acc.allowedTabs.join(', ') : (acc.allowedTabs || 'dashboard, presensi');

    return [
      idx + 1,
      String(acc.email || '').trim(),
      String(acc.password || '').trim(),
      String(acc.nama || '').trim(),
      acc.role || 'Foreman / Mandor',
      acc.scope || 'ALL',
      unitsStr,
      tabsStr,
      'Aktif',
      now
    ];
  });

  sh.getRange(dataStart, 1, rows.length, 10).setValues(rows);
  return { 
    status: 'success', 
    message: 'Berhasil menyinkronkan ' + rows.length + ' akun internal ke sheet ' + SHEET.CONFIG_USER_LOGIN + '.' 
  };
}

function deleteUserLogin_(email, currentUser) {
  const sh = getSheet_(SHEET.CONFIG_USER_LOGIN);
  if (!sh) throw new Error('Sheet ' + SHEET.CONFIG_USER_LOGIN + ' tidak ditemukan.');

  const emailClean = String(email || '').trim().toLowerCase();
  const lastRow = sh.getLastRow();
  if (lastRow < 4) return { status: 'error', message: 'Tidak ada akun untuk dihapus.' };

  const emails = sh.getRange(4, 2, lastRow - 3, 1).getValues().flat();
  for (let i = 0; i < emails.length; i++) {
    if (String(emails[i] || '').trim().toLowerCase() === emailClean) {
      const targetRow = 4 + i;
      sh.deleteRow(targetRow);
      return { status: 'success', message: 'Akun ' + email + ' berhasil dihapus dari spreadsheet.' };
    }
  }

  return { status: 'error', message: 'Akun ' + email + ' tidak ditemukan di sheet ' + SHEET.CONFIG_USER_LOGIN + '.' };
}
`;

export const USER_LOGIN_SHEET_NAME = 'CONFIG_USER_LOGIN';

export const GAS_LOGIN_MODULAR_SNIPPET = `/**
 * =========================================================================
 * MODUL TAMBAHAN KHUSUS AKUN LOGIN (SHEET: CONFIG_USER_LOGIN)
 * 100% TERISOLASI — TIDAK AKAN MENGUBAH / MENYENTUH SHEET LAIN
 * =========================================================================
 * 
 * CARA PAKAI:
 * 1. Di dalam fungsi doPost(e) Anda, tambahkan baris berikut:
 *    if (action === 'saveUserLogin') return jsonResponse_(saveUserLogin_(payload.data, currentUser));
 *    if (action === 'deleteUserLogin') return jsonResponse_(deleteUserLogin_((payload.data && payload.data.email) || payload.email, currentUser));
 *    if (action === 'syncAllUserLogins') return jsonResponse_(syncAllUserLogins_(payload.data, currentUser));
 *    if (action === 'initUserLoginSheet') return jsonResponse_(initUserLoginSheet_());
 * 
 * 2. Di dalam fungsi doGet(e) Anda, tambahkan baris berikut:
 *    if (action === 'getUserLogins') return jsonResponse_({ status: 'success', data: getUserLogins_() });
 *    if (action === 'initUserLoginSheet') return jsonResponse_(initUserLoginSheet_());
 * 
 * 3. Tempel fungsi-fungsi di bawah ini pada baris paling akhir file Code.gs Anda.
 */

function getLoginHeaderRow_(sh) {
  var last = Math.min(sh.getLastRow(), 10);
  for (var r = 1; r <= last; r++) {
    var val = String(sh.getRange(r, 2).getValue() || '').toLowerCase();
    if (val.indexOf('email') !== -1 || val.indexOf('username') !== -1) {
      return r;
    }
  }
  return 4;
}

function initUserLoginSheet_() {
  var ss = SpreadsheetApp.openById('11NpDyRTepu4upwXwN1zoWAuymtYdvd3VARfcKklQf0Y');
  var sh = ss.getSheetByName('CONFIG_USER_LOGIN');
  if (!sh) {
    sh = ss.insertSheet('CONFIG_USER_LOGIN');
    sh.getRange('A1:J1').merge()
      .setValue('PT BATU KARANG — DIVISI PRODUKSI I (PP1) | MASTER AKUN PENGGUNA & HAK AKSES')
      .setBackground('#0f172a').setFontColor('#38bdf8').setFontWeight('bold').setFontSize(12).setHorizontalAlignment('center');
    sh.getRange('A2:J2').merge()
      .setValue('Catatan: Sumber data resmi akun login tim internal. Terkoneksi otomatis dengan Web Apps. Jangan ubah struktur kolom.')
      .setBackground('#1e293b').setFontColor('#94a3b8').setFontSize(9).setHorizontalAlignment('center');
    var headers = ['No', 'Email / Username', 'Kata Sandi / PIN', 'Nama Pengguna', 'Peran (Role)', 'Cakupan Unit (Scope)', 'Daftar Unit (Koma)', 'Modul Diizinkan (Koma)', 'Status Akun', 'Terakhir Diperbarui'];
    sh.getRange(3, 1, 1, headers.length).setValues([headers])
      .setBackground('#1e3a8a').setFontColor('#ffffff').setFontWeight('bold').setHorizontalAlignment('center');
    sh.setFrozenRows(3);
  }
  return { status: 'success', message: 'Sheet CONFIG_USER_LOGIN siap digunakan.' };
}

function getUserLogins_() {
  var ss = SpreadsheetApp.openById('11NpDyRTepu4upwXwN1zoWAuymtYdvd3VARfcKklQf0Y');
  var sh = ss.getSheetByName('CONFIG_USER_LOGIN');
  if (!sh) return [];
  var lastRow = sh.getLastRow();
  var headerRow = getLoginHeaderRow_(sh);
  var dataStart = headerRow + 1;
  if (lastRow < dataStart) return [];
  var data = sh.getRange(dataStart, 1, lastRow - headerRow, 10).getValues();
  var res = [];
  data.forEach(function(r, idx) {
    var email = String(r[1] || '').trim();
    if (!email) return;
    if (email.toLowerCase().indexOf('email') !== -1 || email.toLowerCase().indexOf('username') !== -1) return;
    var status = String(r[8] || 'Aktif').trim();
    if (status.toLowerCase() === 'nonaktif') return;
    res.push({
      rowNum: dataStart + idx,
      no: r[0],
      email: email,
      password: String(r[2] || '').trim(),
      nama: String(r[3] || email).trim(),
      role: String(r[4] || 'Foreman / Mandor').trim(),
      scope: String(r[5] || 'ALL').trim(),
      units: String(r[6] || '').split(',').map(function(s){return s.trim();}).filter(Boolean),
      allowedTabs: String(r[7] || '').split(',').map(function(s){return s.trim();}).filter(Boolean),
      status: status
    });
  });
  return res;
}

function syncAllUserLogins_(accountsList, currentUser) {
  var ss = SpreadsheetApp.openById('11NpDyRTepu4upwXwN1zoWAuymtYdvd3VARfcKklQf0Y');
  var sh = ss.getSheetByName('CONFIG_USER_LOGIN');
  if (!sh) throw new Error('Sheet CONFIG_USER_LOGIN tidak ditemukan.');
  var lastRow = sh.getLastRow();
  var headerRow = getLoginHeaderRow_(sh);
  var dataStart = headerRow + 1;
  if (lastRow >= dataStart) {
    sh.getRange(dataStart, 1, lastRow - headerRow, 10).clearContent();
  }
  var now = new Date();
  var rows = accountsList.map(function(acc, idx) {
    var unitsStr = Array.isArray(acc.units) ? acc.units.join(', ') : (acc.units || acc.scope || 'ALL');
    var tabsStr = Array.isArray(acc.allowedTabs) ? acc.allowedTabs.join(', ') : 'dashboard, presensi';
    return [
      idx + 1,
      String(acc.email || '').trim(),
      String(acc.password || 'mandor').trim(),
      String(acc.nama || '').trim(),
      acc.role || 'Foreman / Mandor',
      acc.scope || 'ALL',
      unitsStr,
      tabsStr,
      'Aktif',
      now
    ];
  });
  if (rows.length > 0) {
    sh.getRange(dataStart, 1, rows.length, 10).setValues(rows);
  }
  return { status: 'success', message: 'Berhasil menyinkronkan ' + rows.length + ' akun ke sheet CONFIG_USER_LOGIN.' };
}

function saveUserLogin_(data, currentUser) {
  var ss = SpreadsheetApp.openById('11NpDyRTepu4upwXwN1zoWAuymtYdvd3VARfcKklQf0Y');
  var sh = ss.getSheetByName('CONFIG_USER_LOGIN');
  if (!sh) throw new Error('Sheet CONFIG_USER_LOGIN tidak ditemukan.');
  var emailClean = String(data.email || '').trim().toLowerCase();
  var lastRow = sh.getLastRow();
  var headerRow = getLoginHeaderRow_(sh);
  var dataStart = headerRow + 1;
  var existingRowNum = -1;
  if (lastRow >= dataStart) {
    var emails = sh.getRange(dataStart, 2, lastRow - headerRow, 1).getValues().flat();
    for (var i = 0; i < emails.length; i++) {
      if (String(emails[i] || '').trim().toLowerCase() === emailClean) {
        existingRowNum = dataStart + i;
        break;
      }
    }
  }
  var unitsStr = Array.isArray(data.units) ? data.units.join(', ') : (data.units || data.scope || 'ALL');
  var tabsStr = Array.isArray(data.allowedTabs) ? data.allowedTabs.join(', ') : (data.allowedTabs || 'dashboard, presensi');
  var now = new Date();
  if (existingRowNum !== -1) {
    sh.getRange(existingRowNum, 2).setValue(data.email.trim());
    if (data.password) sh.getRange(existingRowNum, 3).setValue(String(data.password).trim());
    sh.getRange(existingRowNum, 4).setValue(data.nama.trim());
    sh.getRange(existingRowNum, 5).setValue(data.role);
    sh.getRange(existingRowNum, 6).setValue(data.scope);
    sh.getRange(existingRowNum, 7).setValue(unitsStr);
    sh.getRange(existingRowNum, 8).setValue(tabsStr);
    sh.getRange(existingRowNum, 9).setValue('Aktif');
    sh.getRange(existingRowNum, 10).setValue(now);
  } else {
    var nextRow = Math.max(dataStart, lastRow + 1);
    var newNo = nextRow - headerRow;
    sh.getRange(nextRow, 1, 1, 10).setValues([[
      newNo, data.email.trim(), String(data.password || 'mandor').trim(), data.nama.trim(),
      data.role || 'Foreman / Mandor', data.scope || 'ALL', unitsStr, tabsStr, 'Aktif', now
    ]]);
  }
  return { status: 'success', message: 'Akun ' + data.email + ' berhasil disimpan.' };
}
`;



