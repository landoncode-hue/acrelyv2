/**
 * Auth Fixtures
 *
 * Extends Playwright `test` with per-role `page` fixtures.
 * Each fixture loads a pre-saved storage state (from global-setup.ts),
 * so tests start fully authenticated with zero login overhead.
 *
 * Usage:
 *   import { test } from '@/tests/fixtures';
 *   test('CEO sees reports', async ({ ceoPage }) => { ... });
 */

import { test as base, type Page } from '@playwright/test';
import * as path from 'path';
import { AUTH_STATE_DIR } from '../global-setup';

type RoleFixtures = {
  sysadminPage: Page;
  ceoPage: Page;
  mdPage: Page;
  frontdeskPage: Page;
  agentPage: Page;
  customerPage: Page;
};

/**
 * Creates a fixture that loads the auth state for the given role.
 * The browser context is fresh per test, but has the saved cookie injected.
 */
function createRoleFixture(role: string) {
  return async (
    { browser }: { browser: import('@playwright/test').Browser },
    use: (page: Page) => Promise<void>,
  ) => {
    const statePath = path.join(AUTH_STATE_DIR, `${role}.json`);
    const context = await browser.newContext({ storageState: statePath });
    const page = await context.newPage();
    await use(page);
    await context.close();
  };
}

export const test = base.extend<RoleFixtures>({
  sysadminPage: createRoleFixture('sysadmin'),
  ceoPage: createRoleFixture('ceo'),
  mdPage: createRoleFixture('md'),
  frontdeskPage: createRoleFixture('frontdesk'),
  agentPage: createRoleFixture('agent'),
  customerPage: createRoleFixture('customer'),
});

export { expect } from '@playwright/test';
