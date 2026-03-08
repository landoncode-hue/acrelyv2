/**
 * Playwright Global Setup
 *
 * Runs ONCE before all e2e tests. Responsibilities:
 * 1. Seed deterministic test data in the database (E2E_ prefixed records).
 * 2. Log in as each test role and save authenticated browser storage states.
 *    Subsequent tests load these states and skip the login round-trip entirely.
 *
 * Storage states are saved to: .playwright/auth/{role}.json
 */

import { chromium, type FullConfig } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// ─── Test Credentials ────────────────────────────────────────────────────────
// These accounts must exist in your dev/test database.
// Run `npm run test:setup` to seed them if they don't exist yet.

export const TEST_USERS = {
  sysadmin: {
    email: process.env.E2E_SYSADMIN_EMAIL || 'e2e.sysadmin@acrely.test',
    password: process.env.E2E_SYSADMIN_PASSWORD || 'TestPass123!',
    role: 'sysadmin',
    is_staff: true,
  },
  ceo: {
    email: process.env.E2E_CEO_EMAIL || 'e2e.ceo@acrely.test',
    password: process.env.E2E_CEO_PASSWORD || 'TestPass123!',
    role: 'ceo',
    is_staff: true,
  },
  md: {
    email: process.env.E2E_MD_EMAIL || 'e2e.md@acrely.test',
    password: process.env.E2E_MD_PASSWORD || 'TestPass123!',
    role: 'md',
    is_staff: true,
  },
  frontdesk: {
    email: process.env.E2E_FRONTDESK_EMAIL || 'e2e.frontdesk@acrely.test',
    password: process.env.E2E_FRONTDESK_PASSWORD || 'TestPass123!',
    role: 'frontdesk',
    is_staff: true,
  },
  agent: {
    email: process.env.E2E_AGENT_EMAIL || 'e2e.agent@acrely.test',
    password: process.env.E2E_AGENT_PASSWORD || 'TestPass123!',
    role: 'agent',
    is_staff: true,
  },
  customer: {
    email: process.env.E2E_CUSTOMER_EMAIL || 'e2e.customer@acrely.test',
    password: process.env.E2E_CUSTOMER_PASSWORD || 'TestPass123!',
    role: 'customer',
    is_staff: false,
  },
} as const;

export type TestRole = keyof typeof TEST_USERS;

export const AUTH_STATE_DIR = path.join(process.cwd(), '.playwright', 'auth');

// ─── Expected post-login destination per role ─────────────────────────────────
const ROLE_REDIRECT: Record<TestRole, string> = {
  sysadmin: '/dashboard',
  ceo: '/dashboard',
  md: '/dashboard',
  frontdesk: '/dashboard',
  agent: '/dashboard',
  customer: '/portal',
};

async function loginAndSaveState(
  role: TestRole,
  baseURL: string,
): Promise<void> {
  const user = TEST_USERS[role];
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`[global-setup] Logging in as ${role} (${user.email})`);

  await page.goto(`${baseURL}/login`);

  // Fill login form
  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', user.password);
  await page.click('[data-testid="login-submit"]');

  // Wait for redirect to expected destination
  const dest = ROLE_REDIRECT[role];
  await page.waitForURL(`**${dest}**`, { timeout: 30_000 });

  console.log(`[global-setup] ✅ ${role} authenticated → ${dest}`);

  // Save storage state (cookies + localStorage)
  const statePath = path.join(AUTH_STATE_DIR, `${role}.json`);
  await context.storageState({ path: statePath });

  await browser.close();
}

export default async function globalSetup(config: FullConfig) {
  const baseURL =
    config.projects[0]?.use?.baseURL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000';

  // Ensure the auth state directory exists
  fs.mkdirSync(AUTH_STATE_DIR, { recursive: true });

  console.log(`\n[global-setup] Base URL: ${baseURL}`);
  console.log('[global-setup] Seeding auth states for all roles...\n');

  const roles = Object.keys(TEST_USERS) as TestRole[];

  // Run logins sequentially to avoid race conditions on the dev server
  for (const role of roles) {
    try {
      await loginAndSaveState(role, baseURL);
    } catch (err) {
      throw new Error(
        `[global-setup] ❌ Failed to authenticate as ${role}. ` +
          `Make sure the account exists in your DB. Run: npm run test:setup\n` +
          `Original error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  console.log('\n[global-setup] Auth setup complete.\n');
}
