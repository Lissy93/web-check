import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import svelte from '@astrojs/svelte';
import react from '@astrojs/react';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';

// Load env vars at build-time from root
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

const env = (key, fallback) => process?.env?.[key] || fallback;
const site = env('SITE_URL', 'https://web-check.xyz');
const base = env('BASE_URL', '/');

// Main instance shoes marketing pages
const isBossServer = env('BOSS_SERVER', '') === 'true';

const redirects = { '/about': '/check/about' };
if (!isBossServer) redirects['/'] = '/check';

// Resolves the React app source so internal `web-check-live/*` imports resolve
const appSrc = fileURLToPath(new URL('../app/src', import.meta.url));

// Load .env from the monorepo root so all workspaces share one file
const envDir = fileURLToPath(new URL('../..', import.meta.url));

// Dev-only rewrite so deep /check/<target> URLs serve the SPA shell
// In production this is handled by the platform redirect rules
const checkSpaFallback = {
  name: 'check-spa-fallback',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const url = req.url || '';
      if (url.startsWith('/check/') && url !== '/check/') {
        const queryIdx = url.indexOf('?');
        req.url = '/check' + (queryIdx >= 0 ? url.slice(queryIdx) : '');
      }
      next();
    });
  },
};

export default defineConfig({
  output: 'static',
  site,
  base,
  integrations: [svelte(), react(), partytown(), sitemap()],
  redirects,
  vite: {
    envDir,
    resolve: { alias: { 'web-check-live': appSrc } },
    plugins: [checkSpaFallback],
  },
});
