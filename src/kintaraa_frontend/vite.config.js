import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      {
        name: 'configure-response-headers',
        configureServer: (server) => {
          server.middlewares.use((_req, res, next) => {
            res.setHeader('Content-Security-Policy', `
              default-src 'self';
              connect-src 'self' 
                https://ic0.app
                https://*.ic0.app
                https://*.icp0.io
                https://*.raw.ic0.app
                https://icp0.io
                https://*.dfinity.network
                http://localhost:*
                http://127.0.0.1:*;
              img-src 'self' data: blob:;
              script-src 'self' 'unsafe-eval';
              style-src 'self' 'unsafe-inline';
              frame-src 'self';
            `.replace(/\s+/g, ' ').trim());
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    },
    define: {
      'process.env.II_CANISTER_ID': JSON.stringify(env.VITE_II_CANISTER_ID),
      'process.env.DFX_NETWORK': JSON.stringify(env.VITE_DFX_NETWORK),
      'process.env.BACKEND_CANISTER_ID': JSON.stringify(env.VITE_BACKEND_CANISTER_ID),
      global: 'window',
    },
    build: {
      target: 'esnext',
      chunkSizeWarningLimit: 1000,
      commonjsOptions: {
        transformMixedEsModules: true,
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis'
        }
      }
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:4943',
          changeOrigin: true,
        },
      },
    },
  };
});