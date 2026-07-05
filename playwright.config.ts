import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,
  use: {
    baseURL: process.env.EMBER_BASE_URL ?? 'http://localhost:5000',
    trace: 'on-first-retry',
  },
  webServer: process.env.CI
    ? undefined
    : {
        command: 'echo "Start api-server + ember dev manually"',
        url: 'http://localhost:5000',
        reuseExistingServer: true,
      },
});
