/**
 * Auth — Login Flow Spec
 *
 * Tests the login page UI, redirects, and error states.
 * Uses raw `page` (no pre-auth) to exercise the auth flow itself.
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { TEST_USERS } from '../../global-setup';

test.describe('Login', () => {
  test('staff login → redirected to /dashboard', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(TEST_USERS.frontdesk.email, TEST_USERS.frontdesk.password);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('customer login → redirected to /portal', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(TEST_USERS.customer.email, TEST_USERS.customer.password);
    await expect(page).toHaveURL(/\/portal/);
  });

  test('wrong password → shows error message', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(TEST_USERS.frontdesk.email, 'wrongpassword');
    await login.expectError('Invalid email or password');
  });

  test('empty submission → shows validation', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.submitButton.click();
    // Either HTML5 validation or form error is shown
    const hasError = (await login.errorMessage.isVisible()) ||
      (await page.locator(':invalid').count()) > 0;
    expect(hasError).toBeTruthy();
  });

  test('session cookie is set after login', async ({ page, context }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(TEST_USERS.sysadmin.email, TEST_USERS.sysadmin.password);
    await page.waitForURL(/\/dashboard/);

    const cookies = await context.cookies();
    const session = cookies.find(c => c.name === 'acrely-session');
    expect(session).toBeDefined();
    expect(session?.httpOnly).toBe(true);
  });

  test('already authenticated staff → visiting /login redirects to /dashboard', async ({ browser }) => {
    // Use the sysadmin storage state
    const context = await browser.newContext({
      storageState: '.playwright/auth/sysadmin.json',
    });
    const page = await context.newPage();
    await page.goto('/login');
    await expect(page).toHaveURL(/\/dashboard/);
    await context.close();
  });

  test('already authenticated customer → visiting /login redirects to /portal', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: '.playwright/auth/customer.json',
    });
    const page = await context.newPage();
    await page.goto('/login');
    await expect(page).toHaveURL(/\/portal/);
    await context.close();
  });
});
