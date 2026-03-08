/**
 * PlotsPage — Page Object Model
 *
 * Covers the plot grid, plot detail panel, split/allocate actions.
 */

import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class PlotsPage {
  readonly page: Page;
  readonly plotGrid: Locator;
  readonly legend: Locator;

  constructor(page: Page) {
    this.page = page;
    this.plotGrid = page.getByTestId('plot-grid');
    this.legend = page.getByTestId('plot-grid-legend');
  }

  async goto(estateId?: string) {
    if (estateId) {
      await this.page.goto(`/dashboard/estates/${estateId}/plots`);
    } else {
      await this.page.goto('/dashboard/plots');
    }
    await expect(this.plotGrid).toBeVisible();
  }

  /** Click a specific plot cell by plot number (e.g. "1", "1A") */
  async clickPlot(plotNumber: string) {
    const cell = this.page.getByTestId(`plot-cell-${plotNumber}`);
    await cell.click();
  }

  /** Get the status of a specific plot cell */
  async getPlotStatus(plotNumber: string): Promise<string | null> {
    const cell = this.page.getByTestId(`plot-cell-${plotNumber}`);
    return cell.getAttribute('data-status');
  }

  /** Expect a plot cell to have a specific status */
  async expectPlotStatus(plotNumber: string, status: 'available' | 'reserved' | 'allocated' | 'split') {
    const cell = this.page.getByTestId(`plot-cell-${plotNumber}`);
    await expect(cell).toHaveAttribute('data-status', status);
  }

  /** Open the detail panel for a plot */
  async openPlotDetail(plotNumber: string) {
    await this.clickPlot(plotNumber);
    await expect(this.page.getByTestId('plot-detail-panel')).toBeVisible();
  }

  /** Click the "Split Plot" action button */
  async clickSplit() {
    await this.page.getByTestId('action-split-plot').click();
    await expect(this.page.getByTestId('split-confirm-dialog')).toBeVisible();
  }

  /** Confirm the split dialog */
  async confirmSplit() {
    await this.page.getByTestId('split-confirm-button').click();
  }

  /** Click the "Allocate" action button */
  async clickAllocate() {
    await this.page.getByTestId('action-allocate-plot').click();
  }

  /** Click the "Reserve" action button */
  async clickReserve() {
    await this.page.getByTestId('action-reserve-plot').click();
  }

  /** Check if a specific action button is visible */
  async isActionVisible(action: 'split' | 'allocate' | 'reserve'): Promise<boolean> {
    const locator = this.page.getByTestId(`action-${action}-plot`);
    return locator.isVisible();
  }
}
