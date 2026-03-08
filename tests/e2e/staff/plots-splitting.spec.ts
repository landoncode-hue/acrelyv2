/**
 * Staff — Plot Splitting Spec  ⭐ Critical Business Flow
 *
 * Tests the dynamic plot subdivision workflow as described in PRD §4.1.
 * A whole plot is split → parent becomes `split`, children `1A` and `1B` are
 * created with statuses `allocated` and `available` respectively.
 *
 * Requires a pre-seeded estate with at least one "available" whole plot.
 */

import { test, expect } from '../../fixtures';
import { PlotsPage } from '../../pages/PlotsPage';

test.describe('Plot Splitting', () => {
  let plotsPage: PlotsPage;

  test.beforeEach(async ({ mdPage }) => {
    plotsPage = new PlotsPage(mdPage);
    await plotsPage.goto();
  });

  test('plot grid renders', async () => {
    await expect(plotsPage.plotGrid).toBeVisible();
  });

  test('available plots are visually distinct', async ({ mdPage }) => {
    // At least one cell with status "available" exists
    const availableCells = mdPage.locator('[data-testid^="plot-cell-"][data-status="available"]');
    await expect(availableCells.first()).toBeVisible();
  });

  test('split action is available on an available whole plot', async ({ mdPage }) => {
    // Click a plot that is known to be available (seeded as E2E_1)
    await plotsPage.openPlotDetail('E2E_1');
    const hasSplit = await plotsPage.isActionVisible('split');
    expect(hasSplit).toBe(true);
  });

  test('split a whole plot → parent becomes split, children created', async ({ mdPage }) => {
    await plotsPage.openPlotDetail('E2E_1');
    await plotsPage.clickSplit();

    // Dialog should appear
    await expect(mdPage.getByTestId('split-confirm-dialog')).toBeVisible();
    await plotsPage.confirmSplit();

    // Success feedback
    await expect(mdPage.getByTestId('toast-success')).toBeVisible({ timeout: 15_000 });

    // Grid should now show parent as split
    await plotsPage.expectPlotStatus('E2E_1', 'split');

    // Children should appear: E2E_1A (allocated to this customer) and E2E_1B (available)
    await plotsPage.expectPlotStatus('E2E_1A', 'allocated');
    await plotsPage.expectPlotStatus('E2E_1B', 'available');
  });

  test('split plot creates an audit log entry', async ({ mdPage }) => {
    // Navigate to audit logs and verify a plot_split entry exists
    await mdPage.goto('/dashboard/audit');
    const auditRows = mdPage.locator('[data-testid="audit-row"]');
    const splitRow = auditRows.filter({ hasText: 'plot_split' });
    await expect(splitRow.first()).toBeVisible({ timeout: 10_000 });
  });

  test('reserved plot cannot be split', async ({ mdPage }) => {
    // E2E_3 is seeded as "reserved"
    await plotsPage.openPlotDetail('E2E_3');
    const hasSplit = await plotsPage.isActionVisible('split');
    expect(hasSplit).toBe(false);
  });
});
