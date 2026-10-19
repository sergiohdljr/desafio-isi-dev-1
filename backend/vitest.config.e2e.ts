import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['test/flows/**/*.e2e-spec.ts'],
    globalSetup: ['./test/global-setup.ts'],
    globalTeardown: ['./test/global-teardown.ts'],
    setupFiles: ['./test/setup.ts'],
    fileParallelism: false,
  },
});
