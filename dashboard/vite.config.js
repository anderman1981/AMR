import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3465,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3467',
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