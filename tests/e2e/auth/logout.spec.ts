/**
 * Auth — Logout Spec
 */

import { test, expect } from '../../fixtures';

test.describe('Logout', () => {
  test('staff can log out and is redirected to /login', async ({ frontdeskPage: page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);

    // Trigger logout
    await page.goto('/api/auth/logout');
    await expect(page).toHaveURL(/\/login/);

    // Session cookie should be cleared
    const cookies = await page.context().cookies();
    const session = cookies.find(c => c.name === 'acrely-session');
    expect(session).toBeUndefined();
  });

  test('after logout, protected routes redirect to /login', async ({ frontdeskPage: page }) => {
    await page.goto('/api/auth/logout');
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
