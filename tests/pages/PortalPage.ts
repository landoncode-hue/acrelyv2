/**
 * PortalPage — Page Object Model
 *
 * Covers the customer-facing portal at /portal.
 */

import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class PortalPage {
  readonly page: Page;
  readonly allocationsSection: Locator;
  readonly paymentPlanSection: Locator;
  readonly documentsSection: Locator;
  readonly navAllocations: Locator;
  readonly navPayments: Locator;
  readonly navDocuments: Locator;

  constructor(page: Page) {
    this.page = page;
    this.allocationsSection = page.getByTestId('portal-allocations');
    this.paymentPlanSection = page.getByTestId('portal-payment-plan');
    this.documentsSection = page.getByTestId('portal-documents');
    this.navAllocations = page.getByTestId('portal-nav-allocations');
    this.navPayments = page.getByTestId('portal-nav-payments');
    this.navDocuments = page.getByTestId('portal-nav-documents');
  }

  async goto() {
    await this.page.goto('/portal');
    await expect(this.page).toHaveURL(/\/portal/);
  }

  async expectPlotVisible(plotNumber: string) {
    await expect(
      this.page.getByTestId(`portal-plot-${plotNumber}`),
    ).toBeVisible();
  }

  async goToPayments() {
    await this.navPayments.click();
    await expect(this.paymentPlanSection).toBeVisible();
  }

  async goToDocuments() {
    await this.navDocuments.click();
    await expect(this.documentsSection).toBeVisible();
  }

  async downloadDocument(type: 'receipt' | 'deed') {
    const trigger = this.page.getByTestId(`download-${type}`);
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      trigger.click(),
    ]);
    return download;
  }
}
