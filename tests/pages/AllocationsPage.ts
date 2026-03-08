/**
 * AllocationsPage — Page Object Model
 */

import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class AllocationsPage {
  readonly page: Page;
  readonly allocationsTable: Locator;
  readonly newAllocationButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.allocationsTable = page.getByTestId('allocations-table');
    this.newAllocationButton = page.getByTestId('new-allocation-button');
  }

  async goto() {
    await this.page.goto('/dashboard/allocations');
    await expect(this.allocationsTable).toBeVisible();
  }

  async openNewAllocationForm() {
    await this.newAllocationButton.click();
    await expect(this.page.getByTestId('allocation-form')).toBeVisible();
  }

  async fillAllocationForm(customerName: string, plotNumber: string) {
    await this.page.getByTestId('allocation-customer-select').fill(customerName);
    await this.page.getByTestId('allocation-plot-select').fill(plotNumber);
  }

  async submitAllocationForm() {
    await this.page.getByTestId('allocation-submit').click();
  }

  async expectAllocationInTable(customerName: string) {
    await expect(
      this.allocationsTable.getByText(customerName),
    ).toBeVisible();
  }
}
