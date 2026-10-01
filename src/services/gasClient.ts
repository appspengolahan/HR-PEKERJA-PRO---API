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
    const url = gasClient.getEndpointUrl();
    const start = performance.now();
    try {
      const res = await fetchWithTimeout(`${url}?action=ping`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      }, 8000);
      const data: GasApiResponse = await res.json();
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
    const url = gasClient.getEndpointUrl();
    try {
      const res = await fetchWithTimeout(`${url}?action=getAllData&scope=${encodeURIComponent(scope)}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      }, 15000);
      return await res.json();
    } catch (err) {
      return { status: 'error', message: String(err) };
    }
  },

  // Fetch presensi list
  getPresensi: async (bulan: string | number, tahun: string | number, nama = '', scope = 'ALL'): Promise<GasApiResponse> => {
    const url = gasClient.getEndpointUrl();
    try {
      const res = await fetchWithTimeout(
        `${url}?action=getPresensi&bulan=${bulan}&tahun=${tahun}&nama=${encodeURIComponent(nama)}&scope=${encodeURIComponent(scope)}`,
        { method: 'GET', headers: { 'Accept': 'application/json' } },
        12000
      );
      return await res.json();
    } catch (err) {
      return { status: 'error', message: String(err) };
    }
  },

  // Fetch slip upah rentang bebas
  getSlipUpahRentang: async (nama: string, tglAwal: string, tglAkhir: string): Promise<GasApiResponse> => {
    const url = gasClient.getEndpointUrl();
    try {
      const res = await fetchWithTimeout(
        `${url}?action=getSlipUpahRentang&nama=${encodeURIComponent(nama)}&tglAwal=${tglAwal}&tglAkhir=${tglAkhir}`,
        { method: 'GET', headers: { 'Accept': 'application/json' } },
        12000
      );
      return await res.json();
    } catch (err) {
      return { status: 'error', message: String(err) };
    }
  },

  // Fetch rekap lembur
  getRekapLembur: async (tglAwal: string, tglAkhir: string, unit: string, sekup: string, scope = 'ALL'): Promise<GasApiResponse> => {
    const url = gasClient.getEndpointUrl();
    try {
      const res = await fetchWithTimeout(
        `${url}?action=getRekapLembur&tglAwal=${tglAwal}&tglAkhir=${tglAkhir}&unit=${encodeURIComponent(unit)}&sekup=${encodeURIComponent(sekup)}&scope=${encodeURIComponent(scope)}`,
        { method: 'GET', headers: { 'Accept': 'application/json' } },
        12000
      );
      return await res.json();
    } catch (err) {
      return { status: 'error', message: String(err) };
    }
  },

  // Post Mutation
  postMutation: async (action: string, data: unknown, currentUser = 'Web App User'): Promise<GasApiResponse> => {
    const url = gasClient.getEndpointUrl();
    try {
      const payload = {
        action,
        data,
        currentUser,
        timestamp: new Date().toISOString()
      };

      const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      }, 15000);

      return await res.json();
    } catch (err) {
      return { status: 'error', message: String(err) };
    }
  }
};
