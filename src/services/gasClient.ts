import { DEFAULT_GAS_CONFIG } from './gasService';

export interface GasApiResponse<T = unknown> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  timestamp?: string;
}

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 12000): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

/**
 * Memeriksa apakah response merupakan dokumen HTML (misal 404/200 SPA rewrite dari Cloudflare Pages)
 * dan mem-parsing JSON secara aman.
 */
async function parseResponseSafely<T = unknown>(res: Response): Promise<{ isHtml: boolean; data: GasApiResponse<T> | null }> {
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  if (contentType.includes('text/html')) {
    return { isHtml: true, data: null };
  }

  const text = await res.text();
  const trimmed = text.trim();
  if (
    trimmed.startsWith('<!DOCTYPE') || 
    trimmed.startsWith('<!doctype') || 
    trimmed.startsWith('<html') || 
    trimmed.startsWith('<head') ||
    trimmed.startsWith('<body')
  ) {
    return { isHtml: true, data: null };
  }

  try {
    const json = JSON.parse(text);
    return { isHtml: false, data: json };
  } catch {
    return { isHtml: false, data: null };
  }
}

/**
 * Fetch GET dengan auto-fallback jika endpoint proxy/lokal /api mengembalikan HTML
 */
async function fetchGasGet<T = unknown>(queryString: string, timeoutMs = 12000): Promise<GasApiResponse<T>> {
  const configuredUrl = gasClient.getEndpointUrl();
  const directGasUrl = DEFAULT_GAS_CONFIG.webAppUrl;

  const buildTarget = (baseUrl: string) => {
    const sep = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${sep}${queryString.replace(/^\?/, '')}`;
  };

  const primaryTarget = buildTarget(configuredUrl);

  try {
    const res = await fetchWithTimeout(primaryTarget, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    }, timeoutMs);

    const parsed = await parseResponseSafely<T>(res);
    if (!parsed.isHtml && parsed.data) {
      return parsed.data;
    }

    if (parsed.isHtml) {
      console.warn(`[gasClient] Endpoint ${primaryTarget} mengembalikan HTML (Cloudflare SPA fallback). Mengalihkan otomatis ke direct fetch Google Apps Script.`);
    }
  } catch (err) {
    console.warn(`[gasClient] Gagal menghubungi ${primaryTarget}:`, err);
  }

  // Jika endpoint terkonfigurasi bukan direct GAS (misal rute internal /api), lakukan direct fetch ke URL GAS
  if (configuredUrl !== directGasUrl) {
    const fallbackTarget = buildTarget(directGasUrl);
    try {
      console.info(`[gasClient] Menjalankan direct fetch GAS CORS: ${fallbackTarget}`);
      const resFallback = await fetchWithTimeout(fallbackTarget, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      }, timeoutMs);

      const parsedFallback = await parseResponseSafely<T>(resFallback);
      if (!parsedFallback.isHtml && parsedFallback.data) {
        return parsedFallback.data;
      }
    } catch (fallbackErr) {
      console.error('[gasClient] Direct fetch GAS juga gagal:', fallbackErr);
      return { status: 'error', message: String(fallbackErr) };
    }
  }

  return { status: 'error', message: 'Endpoint mengembalikan HTML dan direct GAS fallback tidak merespons JSON.' };
}

/**
 * Fetch POST dengan auto-fallback jika endpoint mengembalikan HTML
 */
async function fetchGasPost<T = unknown>(payload: unknown, timeoutMs = 15000): Promise<GasApiResponse<T>> {
  const configuredUrl = gasClient.getEndpointUrl();
  const directGasUrl = DEFAULT_GAS_CONFIG.webAppUrl;

  const tryPost = async (targetUrl: string): Promise<GasApiResponse<T> | null> => {
    try {
      const res = await fetchWithTimeout(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      }, timeoutMs);

      const parsed = await parseResponseSafely<T>(res);
      if (!parsed.isHtml && parsed.data) {
        return parsed.data;
      }
      if (parsed.isHtml) {
        console.warn(`[gasClient] POST ke ${targetUrl} mengembalikan HTML. Mencoba direct fallback...`);
      }
      return null;
    } catch (err) {
      console.warn(`[gasClient] POST ke ${targetUrl} gagal:`, err);
      return null;
    }
  };

  // 1. Coba configuredUrl terlebih dahulu
  const primaryResult = await tryPost(configuredUrl);
  if (primaryResult) return primaryResult;

  // 2. Jika bukan directGasUrl, coba directGasUrl
  if (configuredUrl !== directGasUrl) {
    console.info(`[gasClient] Menjalankan fallback POST langsung ke direct GAS: ${directGasUrl}`);
    const fallbackResult = await tryPost(directGasUrl);
    if (fallbackResult) return fallbackResult;
  }

  return { status: 'error', message: 'Gagal melakukan POST mutasi data ke Google Apps Script.' };
}

export const gasClient = {
  getEndpointUrl: () => {
    try {
      const cfg = localStorage.getItem('bk_pp1_gas_config');
      if (cfg) {
        const parsed = JSON.parse(cfg);
        if (parsed.webAppUrl) return parsed.webAppUrl;
      }
    } catch {
      // fallback
    }
    return DEFAULT_GAS_CONFIG.webAppUrl;
  },

  // Ping test with timeout
  ping: async (): Promise<{ success: boolean; latencyMs: number; message: string }> => {
    const start = performance.now();
    try {
      const data = await fetchGasGet('action=ping', 8000);
      const latencyMs = Math.round(performance.now() - start);
      if (data.status === 'success') {
        return { success: true, latencyMs, message: data.message || 'PONG' };
      }
      return { success: false, latencyMs, message: data.message || 'Error response' };
    } catch (err) {
      const latencyMs = Math.round(performance.now() - start);
      return { success: false, latencyMs, message: String(err) };
    }
  },

  // Fetch all core data from Google Sheets in 1 consolidated call
  getAllData: async (scope = 'ALL'): Promise<GasApiResponse> => {
    const safeScope = (scope && !scope.includes('&') && !scope.includes(',')) ? scope : 'ALL';
    return fetchGasGet(`action=getAllData&scope=${encodeURIComponent(safeScope)}`, 15000);
  },

  // Fetch presensi list
  getPresensi: async (bulan: string | number, tahun: string | number, nama = '', scope = 'ALL'): Promise<GasApiResponse> => {
    const safeScope = (scope && !scope.includes('&') && !scope.includes(',')) ? scope : 'ALL';
    return fetchGasGet(`action=getPresensi&bulan=${bulan}&tahun=${tahun}&nama=${encodeURIComponent(nama)}&scope=${encodeURIComponent(safeScope)}`, 12000);
  },

  // Fetch slip upah rentang bebas
  getSlipUpahRentang: async (nama: string, tglAwal: string, tglAkhir: string): Promise<GasApiResponse> => {
    return fetchGasGet(`action=getSlipUpahRentang&nama=${encodeURIComponent(nama)}&tglAwal=${tglAwal}&tglAkhir=${tglAkhir}`, 12000);
  },

  // Fetch rekap lembur
  getRekapLembur: async (tglAwal: string, tglAkhir: string, unit: string, sekup: string, scope = 'ALL'): Promise<GasApiResponse> => {
    const safeScope = (scope && !scope.includes('&') && !scope.includes(',')) ? scope : 'ALL';
    return fetchGasGet(`action=getRekapLembur&tglAwal=${tglAwal}&tglAkhir=${tglAkhir}&unit=${encodeURIComponent(unit)}&sekup=${encodeURIComponent(sekup)}&scope=${encodeURIComponent(safeScope)}`, 12000);
  },

  // Ambil daftar akun pengguna dari sheet CONFIG_USER_LOGIN
  getUserLogins: async (): Promise<GasApiResponse<any[]>> => {
    return fetchGasGet<any[]>('action=getUserLogins', 12000);
  },

  // Simpan / update akun pengguna ke sheet CONFIG_USER_LOGIN
  saveUserLogin: async (account: any, currentUser = 'Admin'): Promise<GasApiResponse> => {
    return gasClient.postMutation('saveUserLogin', account, currentUser);
  },

  // Sinkronisasi seluruh daftar akun ke sheet CONFIG_USER_LOGIN
  syncAllUserLogins: async (accounts: any[], currentUser = 'Admin'): Promise<GasApiResponse> => {
    return gasClient.postMutation('syncAllUserLogins', accounts, currentUser);
  },

  // Hapus akun dari sheet CONFIG_USER_LOGIN
  deleteUserLogin: async (email: string, currentUser = 'Admin'): Promise<GasApiResponse> => {
    return gasClient.postMutation('deleteUserLogin', { email }, currentUser);
  },

  // Inisialisasi sheet CONFIG_USER_LOGIN di spreadsheet
  initUserLoginSheet: async (currentUser = 'Admin'): Promise<GasApiResponse> => {
    return gasClient.postMutation('initUserLoginSheet', {}, currentUser);
  },

  // Merapikan baris data presensi yang melompat ke 806/807 & membersihkan duplikasi di spreadsheet
  realignPresensiRows: async (currentUser = 'Admin'): Promise<GasApiResponse> => {
    return gasClient.postMutation('realignPresensiRows', {}, currentUser);
  },

  // Post Mutation
  postMutation: async (action: string, data: unknown, currentUser = 'Web App User'): Promise<GasApiResponse> => {
    const payload = {
      action,
      data,
      currentUser,
      timestamp: new Date().toISOString()
    };
    return fetchGasPost(payload, 15000);
  }
};
