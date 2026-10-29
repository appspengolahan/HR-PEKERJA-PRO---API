import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const safeHmrPlugin = () => ({
  name: 'safe-hmr-guard',
  enforce: 'pre' as const,
  transform(code: string, id: string) {
    if (id.includes('vite/dist/client') || id.includes('@vite/client') || code.includes('ws.send(JSON.stringify(data));')) {
      return code
        .replaceAll(
          'ws.send(JSON.stringify(data));',
          'if (ws && typeof ws.send === "function" && ws.readyState === ws.OPEN) { ws.send(JSON.stringify(data)); }'
        )
        .replaceAll(
          'this.transport.send(payload).catch((err) => {',
          'if (this.transport && typeof this.transport.send === "function") { try { const _p = this.transport.send(payload); if (_p && typeof _p.catch === "function") _p.catch(() => {}); } catch {} } else return; (function(dummy){})((err) => {'
        )
        .replaceAll(
          'wsTransport.send(data);',
          'if (wsTransport && typeof wsTransport.send === "function") { wsTransport.send(data); }'
        );
    }
  },
  configureServer(server: any) {
    if (!server.ws) {
      server.ws = {
        send: () => {},
        on: () => {},
        off: () => {},
        close: () => {},
        clients: new Set(),
      };
    }
    if (server.environments) {
      for (const env of Object.values(server.environments) as any[]) {
        if (!env.hot) {
          env.hot = {
            send: () => {},
            on: () => {},
            off: () => {},
          };
        }
      }
    }
  },
  hotUpdate(this: any) {
    if (this?.environment && !this.environment.hot) {
      this.environment.hot = {
        send: () => {},
        on: () => {},
        off: () => {},
      };
    }
  }
});

export default defineConfig(() => {
  return {
    plugins: [
      safeHmrPlugin(),
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: '/',
          name: 'HR Pekerja - Produksi I',
          short_name: 'HR Produksi I',
          description: 'Sistem Manajemen HR & Ketenagakerjaan Divisi Produksi I PT Batu Karang',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}']
        },
        devOptions: {
          enabled: false
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
