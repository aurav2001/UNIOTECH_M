import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    target: 'es2015',
    // Core Web Vitals optimizations
    rollupOptions: {
      output: {
        // Code splitting for better caching
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-quill': ['react-quill-new'],
        }
      }
    },
    // Use default esbuild minification (faster and built-in)
    minify: 'esbuild',
    // Better chunk size warnings
    chunkSizeWarningLimit: 500
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
