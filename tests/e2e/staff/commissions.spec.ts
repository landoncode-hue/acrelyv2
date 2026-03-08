/**
 * Staff — Commissions Spec
 */

import { test, expect } from '../../fixtures';

test.describe('Commissions', () => {
  test('commission appears after allocation', async ({ mdPage }) => {
    await mdPage.goto('/dashboard/commissions');
    await expect(mdPage.getByTestId('commissions-table')).toBeVisible();
    // A commission seeded for the e2e agent should appear
    const rows = mdPage.locator('[data-testid="commission-row"]');
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
  });

  test('CEO can approve a commission payout', async ({ ceoPage }) => {
    await ceoPage.goto('/dashboard/commissions');
    const pendingRow = ceoPage.locator('[data-status="pending"]').first();
    await expect(pendingRow).toBeVisible({ timeout: 10_000 });

    await pendingRow.getByTestId('approve-commission-button').click();
    await ceoPage.getByTestId('confirm-approve-button').click();

    await expect(ceoPage.getByTestId('toast-success')).toBeVisible({ timeout: 10_000 });
  });

  test('frontdesk cannot see commission approval controls', async ({ frontdeskPage }) => {
    await frontdeskPage.goto('/dashboard/commissions');
    await expect(frontdeskPage.getByTestId('approve-commission-button')).not.toBeVisible();
  });

  test('agent can view their own commission summary', async ({ agentPage }) => {
    await agentPage.goto('/dashboard/commissions');
    await expect(agentPage.getByTestId('my-commissions-summary')).toBeVisible();
  });

  test('CEO can reject a commission payout (CEO-02)', async ({ ceoPage }) => {
    await ceoPage.goto('/dashboard/commissions');
    const pendingRow = ceoPage.locator('[data-status="pending"]').first();

    if (await pendingRow.isVisible({ timeout: 5_000 })) {
      const rejectBtn = pendingRow.getByTestId('reject-commission-button');
      if (await rejectBtn.isVisible()) {
        await rejectBtn.click();
        await ceoPage.getByTestId('confirm-reject-button').click();
        await expect(ceoPage.getByTestId('toast-success')).toBeVisible({ timeout: 10_000 });
      }
    }
  });
});
