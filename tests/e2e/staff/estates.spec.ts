/**
 * Staff — Estates Spec
 */

import { test, expect } from '../../fixtures';
import { EstatesPage } from '../../pages/EstatesPage';
import { TEST_DATA } from '../../fixtures/data.fixtures';

test.describe('Estates Management', () => {
  test.describe('MD can create an estate', () => {
    let estatesPage: EstatesPage;

    test.beforeEach(async ({ mdPage }) => {
      estatesPage = new EstatesPage(mdPage);
      await estatesPage.goto();
    });

    test('estates list loads', async ({ mdPage }) => {
      await expect(mdPage.getByTestId('estates-list')).toBeVisible();
    });

    test('can open the create estate form', async () => {
      await estatesPage.openCreateForm();
      await expect(estatesPage.page.getByTestId('estate-form')).toBeVisible();
    });

    test('creates a new estate successfully', async () => {
      await estatesPage.openCreateForm();
      await estatesPage.fillCreateForm({
        name: `E2E_${Date.now()} Meadow Estate`,
        location: TEST_DATA.estate.location,
        basePrice: TEST_DATA.estate.basePrice,
        gridRows: TEST_DATA.estate.gridRows,
        gridCols: TEST_DATA.estate.gridCols,
      });
      await estatesPage.submitCreateForm();
      // Should redirect to the new estate or show in list
      await expect(estatesPage.page.getByTestId('toast-success')).toBeVisible({ timeout: 10_000 });
    });
  });

  test('frontdesk cannot see create estate button', async ({ frontdeskPage }) => {
    const estatesPage = new EstatesPage(frontdeskPage);
    await estatesPage.goto();
    await expect(frontdeskPage.getByTestId('create-estate-button')).not.toBeVisible();
  });

  test('sysadmin can view all estates', async ({ sysadminPage }) => {
    const estatesPage = new EstatesPage(sysadminPage);
    await estatesPage.goto();
    await expect(sysadminPage.getByTestId('estates-list')).toBeVisible();
  });
});
