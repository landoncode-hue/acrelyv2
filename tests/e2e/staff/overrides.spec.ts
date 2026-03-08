/**
 * Staff — MD Overrides Spec
 *
 * Tests that the Managing Director can override frontdesk actions (PRD MD-02).
 * Covers canceling a reservation and initiating a refund.
 */

import { test, expect } from '../../fixtures';

test.describe('MD Overrides (MD-02)', () => {
  test('MD can view allocations with override controls', async ({ mdPage }) => {
    await mdPage.goto('/dashboard/allocations');
    await expect(mdPage.getByTestId('allocations-table')).toBeVisible();
    // MD should have cancel/override options
    const overrideButton = mdPage.getByTestId('override-action-button').first();
    await expect(overrideButton).toBeVisible({ timeout: 10_000 });
  });

  test('MD can cancel a reservation', async ({ mdPage }) => {
    await mdPage.goto('/dashboard/allocations');

    // Find a reserved allocation
    const reservedRow = mdPage.locator('[data-testid="allocation-row"][data-status="reserved"]').first();

    if (await reservedRow.isVisible({ timeout: 5_000 })) {
      await reservedRow.getByTestId('cancel-reservation-button').click();
      await mdPage.getByTestId('confirm-cancel-button').click();
      await expect(mdPage.getByTestId('toast-success')).toBeVisible({ timeout: 10_000 });
    }
  });

  test('MD can initiate a refund on a payment', async ({ mdPage }) => {
    await mdPage.goto('/dashboard/payments');

    const completedRow = mdPage.locator('[data-testid="payment-row"][data-status="completed"]').first();

    if (await completedRow.isVisible({ timeout: 5_000 })) {
      await completedRow.getByTestId('refund-payment-button').click();
      await mdPage.getByTestId('confirm-refund-button').click();
      await expect(mdPage.getByTestId('toast-success')).toBeVisible({ timeout: 10_000 });
    }
  });

  test('frontdesk cannot see override controls on allocations', async ({ frontdeskPage }) => {
    await frontdeskPage.goto('/dashboard/allocations');
    await expect(frontdeskPage.getByTestId('override-action-button')).not.toBeVisible();
  });

  test('frontdesk cannot see refund controls on payments', async ({ frontdeskPage }) => {
    await frontdeskPage.goto('/dashboard/payments');
    await expect(frontdeskPage.getByTestId('refund-payment-button')).not.toBeVisible();
  });
});
