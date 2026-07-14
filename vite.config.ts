import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The Vite dev server proxies /api to the local Express proxy (src/server/index.ts)
// so the browser never holds an API key. In production (Vercel), /api is a serverless fn.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8788',
    },
  },
});
