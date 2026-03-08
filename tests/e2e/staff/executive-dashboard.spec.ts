/**
 * Staff — Executive Dashboard Spec
 *
 * Tests the CEO's real-time executive dashboard (PRD CEO-01).
 * Verifies revenue stats, sales counts, and top-performing agents are visible.
 */

import { test, expect } from '../../fixtures';

test.describe('Executive Dashboard (CEO-01)', () => {
  test.beforeEach(async ({ ceoPage }) => {
    await ceoPage.goto('/dashboard');
  });

  test('CEO dashboard loads successfully', async ({ ceoPage }) => {
    await expect(ceoPage).toHaveURL(/\/dashboard/);
    await expect(ceoPage.getByTestId('dashboard-overview')).toBeVisible();
  });

  test('total revenue metric is visible', async ({ ceoPage }) => {
    await expect(ceoPage.getByTestId('metric-total-revenue')).toBeVisible();
  });

  test('plots/apartments sold count is visible', async ({ ceoPage }) => {
    const plotsSold = ceoPage.getByTestId('metric-plots-sold');
    const unitsSold = ceoPage.getByTestId('metric-units-sold');
    const hasSalesMetric = (await plotsSold.isVisible()) || (await unitsSold.isVisible());
    expect(hasSalesMetric).toBe(true);
  });

  test('top-performing agents section is visible', async ({ ceoPage }) => {
    await expect(ceoPage.getByTestId('top-agents-section')).toBeVisible();
  });

  test('MD can also see the executive dashboard', async ({ mdPage }) => {
    await mdPage.goto('/dashboard');
    await expect(mdPage.getByTestId('dashboard-overview')).toBeVisible();
  });

  test('frontdesk sees a limited dashboard (no revenue)', async ({ frontdeskPage }) => {
    await frontdeskPage.goto('/dashboard');
    await expect(frontdeskPage).toHaveURL(/\/dashboard/);
    // Frontdesk should not see the executive-level revenue metric
    await expect(frontdeskPage.getByTestId('metric-total-revenue')).not.toBeVisible();
  });
});
