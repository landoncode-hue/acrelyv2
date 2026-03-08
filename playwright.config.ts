import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

/**
 * Playwright Configuration for Acrely E2E Tests
 *
 * Architecture:
 * - global-setup.ts: Logs in as each role once, saves auth storage states
 * - global-teardown.ts: Cleans up E2E_ prefixed test data
 * - tests/e2e/: All spec files, organized by feature area
 * - tests/fixtures/: Per-role authenticated page fixtures
 * - tests/pages/: Page Object Model classes
 */

export default defineConfig({
  testDir: './tests/e2e',

  /* Maximum time one test can run for. */
  timeout: 120 * 1000,

  expect: {
    /** Maximum time expect() should wait for the condition to be met. */
    timeout: 30_000,
  },

  /* Run tests in files in parallel */
  fullyParallel: false,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,

  /* 1 worker locally for stability; CI can use more */
  workers: process.env.CI ? 2 : 1,

  /* Global setup — runs once before all tests */
  globalSetup: './tests/global-setup.ts',

  /* Global teardown — runs once after all tests */
  globalTeardown: './tests/global-teardown.ts',

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],

  // Shared settings for all projects
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

    // Collect trace on first retry to diagnose failures
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video only on failure (saves disk space)
    video: 'on-first-retry',

    // Maximum time each action can take
    actionTimeout: 30_000,

    // Maximum time for navigation
    navigationTimeout: 60_000,
  },

  // Run the local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 300 * 1000,
  },

  // Configure projects for major browsers and user roles
  projects: [
    // ── Auth tests — no pre-auth needed ──────────────────────────────────────
    {
      name: 'auth',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /tests\/e2e\/auth\/.*\.spec\.ts/,
    },

    // ── Staff dashboard — uses md/frontdesk/sysadmin/ceo auth states ─────────
    {
      name: 'staff',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /tests\/e2e\/staff\/.*\.spec\.ts/,
    },

    // ── Customer portal ───────────────────────────────────────────────────────
    {
      name: 'customer',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /tests\/e2e\/customers\/.*\.spec\.ts/,
    },

    // ── Agent flows ───────────────────────────────────────────────────────────
    {
      name: 'agent',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /tests\/e2e\/agents\/.*\.spec\.ts/,
    },

    // ── PWA / Offline — Chromium only (service worker support) ───────────────
    {
      name: 'pwa',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /tests\/e2e\/pwa\/.*\.spec\.ts/,
    },

    // ── Mobile UI consistency ─────────────────────────────────────────────────
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
      testMatch: /tests\/visual\/ui-consistency\.spec\.ts/,
    },

    // ── Performance ───────────────────────────────────────────────────────────
    {
      name: 'performance',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /tests\/performance\/.*\.spec\.ts/,
    },
  ],
});
