import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Generate gzip compressed versions of assets
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Only compress files larger than 10kb
      deleteOriginFile: false,
    }),
    // Generate brotli compressed versions of assets (better compression than gzip)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false,
    }),
  ],
  server: {
    proxy: {
      '/api': {
        // Target the default backend port directly to ensure proxy reliability.
        target: 'http://localhost:4001',
        changeOrigin: true,
      }
    }
  },
  build: {
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunks for better code splitting
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom'],
          // Animation library
          'framer-motion': ['framer-motion'],
          // Firebase and auth
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          // Payment libraries
          'payment': ['@stripe/stripe-js', 'stripe'],
          // State management
          'state': ['zustand'],
        },
        // Optimize asset file names for better caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.');
          const ext = info?.[info.length - 1];
          // Guard: if no extension (no dot in filename), use default asset path
          if (!ext || !assetInfo.name || !info || info.length < 2) {
            return `assets/[name]-[hash][extname]`;
          }
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff2?|ttf|otf|eot/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    // Enable minification with esbuild (faster than terser)
    minify: 'esbuild',
    // Optimize CSS
    cssCodeSplit: true,
    // Increase the warning limit for chunks
    reportCompressedSize: true,
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Set asset inline limit (assets smaller than this will be inlined as base64)
    assetsInlineLimit: 4096, // 4kb
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'zustand'],
    exclude: ['firebase'],
  },
})
