import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      plugins: [
        {
          name: 'copy-netlify-redirects',
          writeBundle() {
            copyFileSync(resolve(__dirname, '_redirects'), resolve(__dirname, 'dist/_redirects'));
          }
        }
      ]
    }
  }
})
