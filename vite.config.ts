import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    proxy: {
      '/api': { // Toutes les requêtes qui commencent par "/api"
        target: 'http://localhost:8080', // sont redirigé sur le backend java
        changeOrigin: true, // corrige les problèmes de CORS
        rewrite: (path) => path.replace(/^\/api/, ''), // enlève le "/api", car le backend java ne connaît pas le chemin
      },
      '/ollama': { // Toutes les requêtes qui commencent par "/ollama"
        target: 'http://localhost:11434', // sont redirigée sur le backend ollama
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama/, ''),
      }
    }
  },
})
