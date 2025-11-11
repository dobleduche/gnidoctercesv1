import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// FIX: Import the 'process' module to provide type definitions for 'process.cwd()'
// and resolve the "'cwd' does not exist on type 'Process'" error.
import process from 'process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // The dev script CWDs into `client`, so go up one level to find the root .env file.
  const root = path.resolve(process.cwd(), '..');
  const env = loadEnv(mode, root, '');
  
  return {
    // This setting is for client-side code (import.meta.env).
    envDir: '..',
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          // Use the PORT from the loaded env file, with a fallback.
          target: `http://localhost:${env.PORT || 5174}`,
          changeOrigin: true,
        }
      }
    }
  }
})