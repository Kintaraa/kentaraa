import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  define: {
    global: 'globalThis',
    'process.env.NODE_DEBUG': JSON.stringify(''),
    'process.env.DFX_NETWORK': JSON.stringify(process.env.DFX_NETWORK),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.env.CANISTER_ID_KINTARAA_BACKEND': JSON.stringify(process.env.CANISTER_ID_KINTARAA_BACKEND),
    'process.env.CANISTER_ID_KINTARAA_FRONTEND': JSON.stringify(process.env.CANISTER_ID_KINTARAA_FRONTEND),
  },
  build: {
    rollupOptions: {
      external: ['buffer/'],
    },
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
})