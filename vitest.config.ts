// Vitest configuration for Angular
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test.ts',
    coverage: {
      reporter: ['text', 'html'],
    },
    include: ['src/**/*.spec.ts'],
  },
});
