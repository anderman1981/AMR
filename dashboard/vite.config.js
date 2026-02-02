import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.PORT) || 4127,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.API_URL || 'http://localhost:3464',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 3466,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})