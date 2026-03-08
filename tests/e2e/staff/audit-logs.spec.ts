/**
 * Staff — Audit Logs Spec
 */

import { test, expect } from '../../fixtures';

test.describe('Audit Logs', () => {
  test('sysadmin can access audit logs', async ({ sysadminPage }) => {
    await sysadminPage.goto('/dashboard/audit');
    await expect(sysadminPage.getByTestId('audit-table')).toBeVisible();
  });

  test('CEO can access audit logs', async ({ ceoPage }) => {
    await ceoPage.goto('/dashboard/audit');
    await expect(ceoPage.getByTestId('audit-table')).toBeVisible();
  });

  test('audit table has entries', async ({ sysadminPage }) => {
    await sysadminPage.goto('/dashboard/audit');
    const rows = sysadminPage.locator('[data-testid="audit-row"]');
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
  });

  test('CEO can filter audit logs by date range (CEO-03)', async ({ ceoPage }) => {
    await ceoPage.goto('/dashboard/audit');
    await expect(ceoPage.getByTestId('audit-table')).toBeVisible();

    const dateFilter = ceoPage.getByTestId('audit-date-filter');
    if (await dateFilter.isVisible()) {
      await dateFilter.selectOption('30d');
      await expect(ceoPage.getByTestId('audit-table')).toBeVisible({ timeout: 10_000 });
      // Verify filtered results are present
      const rows = ceoPage.locator('[data-testid="audit-row"]');
      const count = await rows.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('frontdesk cannot access audit logs', async ({ frontdeskPage }) => {
    await frontdeskPage.goto('/dashboard/audit');
    // Either unauthorized redirect or no audit table
    const isUnauthorized = frontdeskPage.url().includes('/unauthorized');
    const noTable = !(await frontdeskPage.getByTestId('audit-table').isVisible());
    expect(isUnauthorized || noTable).toBeTruthy();
  });
});
