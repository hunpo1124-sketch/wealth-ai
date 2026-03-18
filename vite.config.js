import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          charts: ['chart.js', 'vue-chartjs'],
          icons: ['lucide-vue-next']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
})
