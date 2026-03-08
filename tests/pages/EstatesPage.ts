/**
 * EstatesPage — Page Object Model
 */

import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class EstatesPage {
  readonly page: Page;
  readonly estatesList: Locator;
  readonly createEstateButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.estatesList = page.getByTestId('estates-list');
    this.createEstateButton = page.getByTestId('create-estate-button');
  }

  async goto() {
    await this.page.goto('/dashboard/estates');
    await expect(this.estatesList).toBeVisible();
  }

  async openCreateForm() {
    await this.createEstateButton.click();
    await expect(this.page.getByTestId('estate-form')).toBeVisible();
  }

  async fillCreateForm(options: {
    name: string;
    location: string;
    basePrice: number;
    gridRows: number;
    gridCols: number;
  }) {
    await this.page.getByTestId('estate-name-input').fill(options.name);
    await this.page.getByTestId('estate-location-input').fill(options.location);
    await this.page.getByTestId('estate-price-input').fill(String(options.basePrice));
    await this.page.getByTestId('estate-rows-input').fill(String(options.gridRows));
    await this.page.getByTestId('estate-cols-input').fill(String(options.gridCols));
  }

  async submitCreateForm() {
    await this.page.getByTestId('estate-form-submit').click();
  }

  async expectEstateInList(name: string) {
    await expect(this.estatesList.getByText(name)).toBeVisible();
  }

  async clickEstate(name: string) {
    await this.estatesList.getByText(name).click();
  }
}
