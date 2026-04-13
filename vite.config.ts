/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/capstone/',
  plugins: [react()],
  server: {
    proxy: {
      '/sd-api': {
        target: process.env.VITE_SD_API_URL || 'http://192.168.4.100:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sd-api/, ''),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/services/**'],
      thresholds: {
        'src/lib/**': {
          lines: 80,
        },
        'src/services/**': {
          lines: 80,
        },
      },
    },
  },
})
