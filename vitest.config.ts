import path from 'node:path';
import { defineConfig } from 'vitest/config';

const resolvePath = (dir: string) => path.resolve(__dirname, dir);

export default defineConfig({
  test: {
    globals: true,
    environment: 'node'
  },
  resolve: {
    alias: {
      '@': resolvePath('src')
    }
  }
});
