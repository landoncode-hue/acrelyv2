/**
 * Staff — Allocations Spec
 */

import { test, expect } from '../../fixtures';
import { AllocationsPage } from '../../pages/AllocationsPage';
import { PlotsPage } from '../../pages/PlotsPage';
import { TEST_DATA } from '../../fixtures/data.fixtures';

test.describe('Allocations', () => {
  test('allocations list is visible to frontdesk', async ({ frontdeskPage }) => {
    const allocationsPage = new AllocationsPage(frontdeskPage);
    await allocationsPage.goto();
    await expect(allocationsPage.allocationsTable).toBeVisible();
  });

  test('frondesk can open the new allocation form', async ({ frontdeskPage }) => {
    const allocationsPage = new AllocationsPage(frontdeskPage);
    await allocationsPage.goto();
    await allocationsPage.openNewAllocationForm();
    await expect(frontdeskPage.getByTestId('allocation-form')).toBeVisible();
  });

  test('allocate a whole plot to a customer', async ({ frontdeskPage }) => {
    const allocationsPage = new AllocationsPage(frontdeskPage);
    await allocationsPage.goto();
    await allocationsPage.openNewAllocationForm();
    await allocationsPage.fillAllocationForm(
      TEST_DATA.customer.name,
      TEST_DATA.plot.allocationTestPlotNumber,
    );
    await allocationsPage.submitAllocationForm();
    await expect(frontdeskPage.getByTestId('toast-success')).toBeVisible({ timeout: 15_000 });
    await allocationsPage.expectAllocationInTable(TEST_DATA.customer.name);
  });

  test('plot is marked allocated on grid after allocation', async ({ frontdeskPage }) => {
    const plotsPage = new PlotsPage(frontdeskPage);
    await plotsPage.goto();
    await plotsPage.expectPlotStatus(TEST_DATA.plot.allocationTestPlotNumber, 'allocated');
  });

  test('frontdesk can reserve a plot for 72h', async ({ frontdeskPage }) => {
    const plotsPage = new PlotsPage(frontdeskPage);
    await plotsPage.goto();
    await plotsPage.openPlotDetail('E2E_4'); // Seeded as available
    await plotsPage.clickReserve();
    await frontdeskPage.getByTestId('reserve-confirm-button').click();
    await expect(frontdeskPage.getByTestId('toast-success')).toBeVisible({ timeout: 10_000 });
    await plotsPage.expectPlotStatus('E2E_4', 'reserved');
  });
});
