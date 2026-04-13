/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/capstone/',
  plugins: [react()],
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
