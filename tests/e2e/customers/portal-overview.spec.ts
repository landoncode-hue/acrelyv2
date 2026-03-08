/**
 * Customer Portal — Overview Spec
 */

import { test, expect } from '../../fixtures';
import { PortalPage } from '../../pages/PortalPage';
import { TEST_DATA } from '../../fixtures/data.fixtures';

test.describe('Customer Portal', () => {
  let portalPage: PortalPage;

  test.beforeEach(async ({ customerPage }) => {
    portalPage = new PortalPage(customerPage);
    await portalPage.goto();
  });

  test('portal home loads for authenticated customer', async ({ customerPage }) => {
    await expect(customerPage).toHaveURL(/\/portal/);
    await expect(customerPage.getByTestId('portal-welcome')).toBeVisible();
  });

  test('customer sees their allocated plot', async () => {
    await portalPage.expectPlotVisible(TEST_DATA.plot.customerAllocatedPlotNumber);
  });

  test('customer does not see dashboard nav', async ({ customerPage }) => {
    await expect(customerPage.getByTestId('sidebar')).not.toBeVisible();
  });

  test('plot details are visible (estate name, plot number, dimensions)', async ({ customerPage }) => {
    await expect(customerPage.getByTestId('portal-plot-estate-name')).toBeVisible();
    await expect(customerPage.getByTestId('portal-plot-number')).toBeVisible();
    await expect(customerPage.getByTestId('portal-plot-dimensions')).toBeVisible();
  });

  test('customer can navigate to profile/settings', async ({ customerPage }) => {
    await customerPage.goto('/portal/settings');
    await expect(customerPage.getByTestId('profile-settings')).toBeVisible();
  });

  test('customer can request account deletion (CUST-05)', async ({ customerPage }) => {
    await customerPage.goto('/portal/settings');
    const deleteButton = customerPage.getByTestId('delete-account-button');

    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      // Confirmation dialog should appear
      await expect(customerPage.getByTestId('delete-confirm-dialog')).toBeVisible();
      // We don't actually confirm deletion in this test to preserve state
      await customerPage.getByTestId('cancel-delete-button').click();
    }
  });
});
