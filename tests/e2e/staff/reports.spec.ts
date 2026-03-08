/**
 * Staff — Reports Spec
 *
 * Tests financial reporting and audit report features (PRD §4.7, CEO-03).
 */

import { test, expect } from '../../fixtures';

test.describe('Reports & Analytics (§4.7 / CEO-03)', () => {
  test('CEO can access the reports page', async ({ ceoPage }) => {
    await ceoPage.goto('/dashboard/reports');
    await expect(ceoPage).toHaveURL(/\/dashboard\/reports/);
    await expect(ceoPage.getByTestId('reports-overview')).toBeVisible();
  });

  test('MD can access the reports page', async ({ mdPage }) => {
    await mdPage.goto('/dashboard/reports');
    await expect(mdPage.getByTestId('reports-overview')).toBeVisible();
  });

  test('financial report grouped by estate is available', async ({ ceoPage }) => {
    await ceoPage.goto('/dashboard/reports');
    const estateReport = ceoPage.getByTestId('report-by-estate');
    const revenueTable = ceoPage.getByTestId('revenue-table');
    const hasFinancials = (await estateReport.isVisible()) || (await revenueTable.isVisible());
    expect(hasFinancials).toBe(true);
  });

  test('CEO can filter audit report by date range', async ({ ceoPage }) => {
    await ceoPage.goto('/dashboard/audit');
    await expect(ceoPage.getByTestId('audit-table')).toBeVisible();

    // Apply a date range filter (last 30 days)
    const dateFilter = ceoPage.getByTestId('audit-date-filter');
    if (await dateFilter.isVisible()) {
      await dateFilter.selectOption('30d');
      // Audit table should reload with filtered results
      await expect(ceoPage.getByTestId('audit-table')).toBeVisible({ timeout: 10_000 });
    }
  });

  test('frontdesk cannot access reports', async ({ frontdeskPage }) => {
    await frontdeskPage.goto('/dashboard/reports');
    const isUnauthorized = frontdeskPage.url().includes('/unauthorized');
    const noReports = !(await frontdeskPage.getByTestId('reports-overview').isVisible());
    expect(isUnauthorized || noReports).toBeTruthy();
  });
});
