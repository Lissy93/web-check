import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react({ jsxImportSource: '@emotion/react' })],
  // Shared brand assets (fonts, favicons, web-check.png) are owned by the site
  // package, so the standalone app build copies them into dist from there
  publicDir: resolve(__dirname, '..', 'site', 'public'),
  resolve: {
    alias: { 'web-check-live': resolve(__dirname, 'src') },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true,
  },
  server: { port: 5173 },
});
