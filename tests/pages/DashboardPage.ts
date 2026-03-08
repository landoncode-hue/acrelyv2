/**
 * DashboardPage — Page Object Model
 *
 * Covers the main staff dashboard shell (nav, header, sidebar).
 */

import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly sidebar: Locator;
  readonly navEstates: Locator;
  readonly navPlots: Locator;
  readonly navAllocations: Locator;
  readonly navPayments: Locator;
  readonly navLeads: Locator;
  readonly navAgents: Locator;
  readonly navCommissions: Locator;
  readonly navReports: Locator;
  readonly navStaff: Locator;
  readonly navAudit: Locator;
  readonly userMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.getByTestId('sidebar');
    this.navEstates = page.getByTestId('nav-estates');
    this.navPlots = page.getByTestId('nav-plots');
    this.navAllocations = page.getByTestId('nav-allocations');
    this.navPayments = page.getByTestId('nav-payments');
    this.navLeads = page.getByTestId('nav-leads');
    this.navAgents = page.getByTestId('nav-agents');
    this.navCommissions = page.getByTestId('nav-commissions');
    this.navReports = page.getByTestId('nav-reports');
    this.navStaff = page.getByTestId('nav-staff');
    this.navAudit = page.getByTestId('nav-audit');
    this.userMenu = page.getByTestId('user-menu');
  }

  async goto() {
    await this.page.goto('/dashboard');
    await expect(this.sidebar).toBeVisible();
  }

  async isAt() {
    await this.page.waitForURL('**/dashboard**');
  }

  async navigateTo(section: keyof Pick<
    DashboardPage,
    'navEstates' | 'navPlots' | 'navAllocations' | 'navPayments' |
    'navLeads' | 'navAgents' | 'navCommissions' | 'navReports' | 'navStaff' | 'navAudit'
  >) {
    await this[section].click();
  }
}
