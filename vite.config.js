import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      // Wszystkie requesty /api/** idą przez gateway-service
      '/api': {
        target: 'http://gateway-service:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})