import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Global setup runs once before all test files
    globalSetup: ['./tests/setup.js'],
    // Tell vitest where to find test files
    include: ['tests/**/*.test.js'],
    // Run test files sequentially — avoids SQLite file contention
    fileParallelism: false,
    // Set test environment variables
    env: {
      NODE_ENV: 'test',
      DATABASE_PATH: './data/kaamconnect-test.sqlite',
      SESSION_SECRET: 'test-secret-at-least-16-chars-long',
    },
    // Timeout for slow async tests (argon2 hashing can be slow in CI)
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
