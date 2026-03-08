/**
 * Login Helper
 *
 * Provides a procedural `loginAs` function for tests that explicitly need
 * to exercise the authentication flow (e.g. wrong password, session expiry).
 *
 * For tests that just need to start authenticated, use the role fixtures in
 * `tests/fixtures` instead — they are much faster.
 */

import type { Page } from '@playwright/test';
import { TEST_USERS, type TestRole } from '../global-setup';

/**
 * Navigate to /login and authenticate as the given role.
 * Waits for the post-login redirect to complete.
 */
export async function loginAs(page: Page, role: TestRole): Promise<void> {
  const user = TEST_USERS[role];

  await page.goto('/login');

  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', user.password);
  await page.click('[data-testid="login-submit"]');

  // Staff/agents go to /dashboard; customers go to /portal
  const dest = user.is_staff ? '/dashboard' : '/portal';
  await page.waitForURL(`**${dest}**`, { timeout: 30_000 });
}

/**
 * Navigate to /login and submit with arbitrary credentials.
 * Does NOT wait for a redirect — useful for testing invalid login scenarios.
 */
export async function submitLoginForm(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-submit"]');
}

/**
 * Log out the current user by navigating to the logout endpoint.
 */
export async function logout(page: Page): Promise<void> {
  await page.goto('/api/auth/logout');
  await page.waitForURL('**/login**', { timeout: 10_000 });
}
