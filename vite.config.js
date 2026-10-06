import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  define: {
    'process.env': {}
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-chart': ['chart.js'],
          'vendor-mqtt': ['mqtt']
        }
      }
    }
  }
})
