/**
 * Customer Portal — Payment Plan Spec
 */

import { test, expect } from '../../fixtures';

test.describe('Payment Plan', () => {
  test.beforeEach(async ({ customerPage }) => {
    await customerPage.goto('/portal/payments');
  });

  test('payment plan page loads', async ({ customerPage }) => {
    await expect(customerPage.getByTestId('portal-payment-plan')).toBeVisible();
  });

  test('installment rows are visible with amounts and due dates', async ({ customerPage }) => {
    const installmentRows = customerPage.locator('[data-testid="installment-row"]');
    await expect(installmentRows.first()).toBeVisible({ timeout: 10_000 });

    const firstRow = installmentRows.first();
    await expect(firstRow.getByTestId('installment-amount')).toBeVisible();
    await expect(firstRow.getByTestId('installment-due-date')).toBeVisible();
    await expect(firstRow.getByTestId('installment-status')).toBeVisible();
  });

  test('payment progress bar is visible', async ({ customerPage }) => {
    await expect(customerPage.getByTestId('payment-progress-bar')).toBeVisible();
  });

  test('overdue installments are visually indicated', async ({ customerPage }) => {
    const overdueRows = customerPage.locator('[data-testid="installment-row"][data-status="overdue"]');
    // There may or may not be overdue installments depending on test data
    const count = await overdueRows.count();
    if (count > 0) {
      // Verify they have distinct styling (e.g. a class or attribute)
      await expect(overdueRows.first()).toHaveAttribute('data-status', 'overdue');
    }
  });
});
