/**
 * PaymentsPage — Page Object Model
 */

import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class PaymentsPage {
  readonly page: Page;
  readonly paymentsTable: Locator;
  readonly recordPaymentButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.paymentsTable = page.getByTestId('payments-table');
    this.recordPaymentButton = page.getByTestId('record-payment-button');
  }

  async goto() {
    await this.page.goto('/dashboard/payments');
    await expect(this.paymentsTable).toBeVisible();
  }

  async openRecordPaymentForm() {
    await this.recordPaymentButton.click();
    await expect(this.page.getByTestId('payment-form')).toBeVisible();
  }

  async fillPaymentForm(options: {
    allocationId?: string;
    amount: number;
    method: string;
    idempotencyKey: string;
  }) {
    if (options.allocationId) {
      await this.page.getByTestId('payment-allocation-select').fill(options.allocationId);
    }
    await this.page.getByTestId('payment-amount-input').fill(String(options.amount));
    await this.page.getByTestId('payment-method-select').selectOption(options.method);
    // Idempotency key is usually auto-generated; set it for test control
    const keyInput = this.page.getByTestId('payment-idempotency-key');
    if (await keyInput.isVisible()) {
      await keyInput.fill(options.idempotencyKey);
    }
  }

  async submitPaymentForm() {
    await this.page.getByTestId('payment-submit').click();
  }

  async expectSuccessToast() {
    await expect(this.page.getByTestId('toast-success')).toBeVisible({ timeout: 10_000 });
  }

  async expectError(msg?: string) {
    const err = this.page.getByTestId('payment-form-error');
    await expect(err).toBeVisible();
    if (msg) await expect(err).toContainText(msg);
  }
}
