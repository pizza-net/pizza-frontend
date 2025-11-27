import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      // 1. Ruch do autoryzacji kierujemy prosto do auth-service
      '/api/auth': {
        target: 'http://auth-service:8081', // Bezpośrednio do kontenera Auth
        changeOrigin: true,
        secure: false,
        // Usuwamy prefiks /api, bo auth-service spodziewa się /auth/...
        rewrite: (path) => path.replace(/^\/api/, '')
      },

      // 2. Ruch do pizzy kierujemy prosto do menu-service
      '/api/pizza': {
        target: 'http://menu-service:8081', // Bezpośrednio do kontenera Menu
        changeOrigin: true,
        secure: false,
      }
    }
  }
})