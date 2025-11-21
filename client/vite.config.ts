import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // Target the default backend port directly to ensure proxy reliability.
        target: 'http://localhost:4001',
        changeOrigin: true,
      },
    },
  },
});
