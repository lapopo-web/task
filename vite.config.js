import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      external: ['bcrypt', '@mapbox/node-pre-gyp', 'mock-aws-s3', 'aws-sdk', 'nock'],
    },
  },
  optimizeDeps: {
    exclude: ['bcrypt', '@mapbox/node-pre-gyp', 'mock-aws-s3', 'aws-sdk', 'nock'],
  },
});
