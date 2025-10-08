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
