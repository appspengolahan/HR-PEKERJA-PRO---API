import { DEFAULT_GAS_CONFIG } from './gasService';

export interface GasApiResponse<T = unknown> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  timestamp?: string;
}

const STATIC_HOSTING_FLAG_KEY = 'bk_pp1_static_hosting_mode';
let staticHostingCached: boolean | null = null;

export function isStaticHostingMode(): boolean {
  if (staticHostingCached !== null) return staticHostingCached;
  try {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(STATIC_HOSTING_FLAG_KEY) === 'true') {
      staticHostingCached = true;
      return true;
    }
  } catch {
    // ignore storage access issues
  }
  return false;
}

export function markStaticHostingMode(): void {
  staticHostingCached = true;
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(STATIC_HOSTING_FLAG_KEY, 'true');
    }
  } catch {
    // ignore
  }
}

function isRelativeOrApiProxyUrl(url: string): boolean {
  const trimmed = (url || '').trim();
  if (!trimmed) return true;
  if (trimmed.startsWith('/api')) return true;
  try {
    const parsed = new URL(trimmed, typeof window !== 'undefined' ? window.location.origin : 'https://localhost');
    return parsed.pathname.startsWith('/api/');
  } catch {
    return trimmed.includes('/api/');
  }
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

function isHtmlPayload(contentType: string, rawText: string): boolean {
  if ((contentType || '').toLowerCase().includes('text/html')) {
    return true;
  }
  const trimmed = (rawText || '').trim();
  if (!trimmed) return false;
  return (
    trimmed.startsWith('<') ||
    trimmed.startsWith('<!DOCTYPE') ||
    trimmed.startsWith('<!doctype') ||
    trimmed.startsWith('<html') ||
    trimmed.startsWith('<head') ||
    trimmed.startsWith('<body')
  );
}

/**
 * Memeriksa apakah response merupakan dokumen HTML (misal 404/200 SPA rewrite dari Cloudflare Workers)
 * dan mem-parsing JSON secara aman.
 */
async function parseResponseSafely<T = unknown>(res: Response): Promise<{ isHtml: boolean; data: GasApiResponse<T> | null }> {
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  if (contentType.includes('text/html')) {
    return { isHtml: true, data: null };
  }

  const text = await res.text();
  if (isHtmlPayload(contentType, text)) {
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
 * Helper aman untuk menarik Google Sheets CSV secara langsung jika diperlukan,
 * memastikan respon bukan HTML SPA fallback (!rawText.trim().startsWith('<')).
 */
export async function fetchGoogleSheetCsvSafely(csvUrl: string, apiProxyUrl?: string, timeoutMs = 12000): Promise<string | null> {
  const tryFetchCsv = async (url: string): Promise<{ isHtml: boolean; text: string | null }> => {
    try {
      const res = await fetchWithTimeout(url, { method: 'GET' }, timeoutMs);
      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      if (contentType.includes('text/html')) {
        return { isHtml: true, text: null };
      }
      const rawText = await res.text();
      if (!res.ok || !rawText || rawText.trim().startsWith('<')) {
        return { isHtml: rawText.trim().startsWith('<'), text: null };
      }
      return { isHtml: false, text: rawText };
    } catch {
      return { isHtml: false, text: null };
    }
  };

  if (apiProxyUrl && !isStaticHostingMode()) {
    const proxyRes = await tryFetchCsv(apiProxyUrl);
    if (proxyRes.isHtml && isRelativeOrApiProxyUrl(apiProxyUrl)) {
      markStaticHostingMode();
    } else if (proxyRes.text !== null) {
      return proxyRes.text;
    }
  }

  const directRes = await tryFetchCsv(csvUrl);
  return directRes.text;
}

/**
 * Fetch GET dengan deteksi & cache mode static hosting agar langsung fallback
 * ke direct fetch Google Apps Script CORS tanpa mengulang request /api/* yang mengembalikan HTML.
 */
async function fetchGasGet<T = unknown>(queryString: string, timeoutMs = 12000): Promise<GasApiResponse<T>> {
  const configuredUrl = gasClient.getEndpointUrl();
  const directGasUrl = DEFAULT_GAS_CONFIG.webAppUrl;

  const buildTarget = (baseUrl: string) => {
    const sep = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${sep}${queryString.replace(/^\?/, '')}`;
  };

  const skipConfiguredProxy = isStaticHostingMode() && configuredUrl !== directGasUrl && isRelativeOrApiProxyUrl(configuredUrl);

  if (!skipConfiguredProxy) {
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
        if (isRelativeOrApiProxyUrl(configuredUrl)) {
          markStaticHostingMode();
        }
        console.warn(`[gasClient] Endpoint ${primaryTarget} mengembalikan HTML (Cloudflare Static SPA fallback). Mengalihkan ke direct fetch Google Apps Script.`);
      }
    } catch (err) {
      console.warn(`[gasClient] Gagal menghubungi ${primaryTarget}:`, err);
    }
  }

  if (configuredUrl !== directGasUrl) {
    const fallbackTarget = buildTarget(directGasUrl);
    try {
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
 * Fetch POST dengan deteksi & cache mode static hosting agar langsung fallback ke direct GAS CORS
 */
async function fetchGasPost<T = unknown>(payload: unknown, timeoutMs = 15000): Promise<GasApiResponse<T>> {
  const configuredUrl = gasClient.getEndpointUrl();
  const directGasUrl = DEFAULT_GAS_CONFIG.webAppUrl;

  const tryPost = async (targetUrl: string): Promise<{ result: GasApiResponse<T> | null; isHtml: boolean }> => {
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
        return { result: parsed.data, isHtml: false };
      }
      if (parsed.isHtml) {
        console.warn(`[gasClient] POST ke ${targetUrl} mengembalikan HTML. Mencoba direct fallback...`);
      }
      return { result: null, isHtml: parsed.isHtml };
    } catch (err) {
      console.warn(`[gasClient] POST ke ${targetUrl} gagal:`, err);
      return { result: null, isHtml: false };
    }
  };

  const skipConfiguredProxy = isStaticHostingMode() && configuredUrl !== directGasUrl && isRelativeOrApiProxyUrl(configuredUrl);

  if (!skipConfiguredProxy) {
    const primary = await tryPost(configuredUrl);
    if (primary.result) return primary.result;
    if (primary.isHtml && isRelativeOrApiProxyUrl(configuredUrl)) {
      markStaticHostingMode();
    }
  }

  if (configuredUrl !== directGasUrl) {
    const fallback = await tryPost(directGasUrl);
    if (fallback.result) return fallback.result;
  }

  return { status: 'error', message: 'Gagal melakukan POST mutasi data ke Google Apps Script.' };
}

export const gasClient = {
  getEndpointUrl: () => {
    try {
      const cfg = localStorage.getItem('bk_pp1_gas_config');
      if (cfg) {
        const parsed = JSON.parse(cfg);
        const url = typeof parsed?.webAppUrl === 'string' ? parsed.webAppUrl.trim() : '';
        if (url) {
          // Jika URL tersimpan mengarah ke /api proxy lokal saat static hosting terdeteksi, alihkan ke direct GAS
          if (isStaticHostingMode() && isRelativeOrApiProxyUrl(url)) {
            return DEFAULT_GAS_CONFIG.webAppUrl;
          }
          // Jangan gunakan domain preview/vercel usang jika masih tertinggal di localStorage
          if (url.includes('vercel.app') && url.includes('/api')) {
            return DEFAULT_GAS_CONFIG.webAppUrl;
          }
          return url;
        }
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
