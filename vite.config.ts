import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const resolvePath = (dir: string) => path.resolve(__dirname, dir);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolvePath('src')
    }
  }
});
