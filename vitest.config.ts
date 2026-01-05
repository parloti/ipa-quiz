import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: './src/test.ts',
    isolate: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
  },
});
