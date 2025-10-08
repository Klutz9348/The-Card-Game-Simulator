import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const resolvePath = (dir: string) => path.resolve(__dirname, dir);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolvePath('src')
    }
  },
  server: {
    host: true,
    port: 5173
  }
});
