/**
 * Auth — RBAC Route Guards Spec
 *
 * Tests that the middleware correctly enforces route access per role.
 * Uses pre-authenticated storage states so login is not re-tested here.
 */

import { test, expect } from '@playwright/test';
import * as path from 'path';

const authState = (role: string) => ({
  storageState: path.join('.playwright', 'auth', `${role}.json`),
});

test.describe('Unauthenticated access', () => {
  test('visiting /dashboard → redirected to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('visiting /portal → redirected to /login', async ({ page }) => {
    await page.goto('/portal');
    await expect(page).toHaveURL(/\/login/);
  });

  test('visiting /api/staff/* → 401', async ({ request }) => {
    const res = await request.get('/api/staff/list');
    expect(res.status()).toBe(401);
  });
});

test.describe('Customer accessing staff routes', () => {
  test.use(authState('customer'));

  test('/dashboard → redirected to /portal', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/portal/);
  });
});

test.describe('Frontdesk role restrictions', () => {
  test.use(authState('frontdesk'));

  test('/dashboard/staff → redirected to /unauthorized', async ({ page }) => {
    await page.goto('/dashboard/staff');
    await expect(page).toHaveURL(/\/unauthorized/);
  });

  test('/dashboard/reports → redirected to /unauthorized', async ({ page }) => {
    await page.goto('/dashboard/reports');
    await expect(page).toHaveURL(/\/unauthorized/);
  });

  test('/dashboard (index) is accessible', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page).not.toHaveURL(/unauthorized/);
  });
});

test.describe('CEO role restrictions', () => {
  test.use(authState('ceo'));

  test('/dashboard/reports is accessible', async ({ page }) => {
    await page.goto('/dashboard/reports');
    await expect(page).toHaveURL(/\/dashboard\/reports/);
    await expect(page).not.toHaveURL(/unauthorized/);
  });

  test('/dashboard/staff → redirected to /unauthorized', async ({ page }) => {
    // CEO cannot create/manage staff accounts
    await page.goto('/dashboard/staff');
    await expect(page).toHaveURL(/\/unauthorized/);
  });
});

test.describe('SysAdmin full access', () => {
  test.use(authState('sysadmin'));

  test('/dashboard/staff is accessible', async ({ page }) => {
    await page.goto('/dashboard/staff');
    await expect(page).toHaveURL(/\/dashboard\/staff/);
    await expect(page).not.toHaveURL(/unauthorized/);
  });

  test('/dashboard/reports is accessible', async ({ page }) => {
    await page.goto('/dashboard/reports');
    await expect(page).toHaveURL(/\/dashboard\/reports/);
  });
});

test.describe('Staff visiting portal', () => {
  test.use(authState('md'));

  test('/portal → redirected to /dashboard for staff', async ({ page }) => {
    await page.goto('/portal');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
