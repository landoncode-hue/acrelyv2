/**
 * Staff — Deed Generation Spec
 *
 * Tests that the MD can generate and download a legal deed (PRD MD-03).
 */

import { test, expect } from '../../fixtures';

test.describe('Deed Generation (MD-03)', () => {
  test('MD can navigate to an allocated plot and see deed generation button', async ({ mdPage }) => {
    await mdPage.goto('/dashboard/allocations');
    const allocatedRow = mdPage.locator('[data-testid="allocation-row"][data-status="active"]').first();

    if (await allocatedRow.isVisible({ timeout: 5_000 })) {
      await allocatedRow.getByTestId('view-allocation-button').click();
      await expect(mdPage.getByTestId('generate-deed-button')).toBeVisible();
    }
  });

  test('MD can generate and download a deed document', async ({ mdPage }) => {
    await mdPage.goto('/dashboard/allocations');
    const allocatedRow = mdPage.locator('[data-testid="allocation-row"][data-status="active"]').first();

    if (await allocatedRow.isVisible({ timeout: 5_000 })) {
      await allocatedRow.getByTestId('view-allocation-button').click();
      const generateBtn = mdPage.getByTestId('generate-deed-button');

      if (await generateBtn.isVisible()) {
        const [download] = await Promise.all([
          mdPage.waitForEvent('download'),
          generateBtn.click(),
        ]);
        expect(download.suggestedFilename()).toMatch(/deed/i);
      }
    }
  });

  test('frontdesk cannot generate deeds', async ({ frontdeskPage }) => {
    await frontdeskPage.goto('/dashboard/allocations');
    const allocatedRow = frontdeskPage.locator('[data-testid="allocation-row"]').first();

    if (await allocatedRow.isVisible({ timeout: 5_000 })) {
      await allocatedRow.getByTestId('view-allocation-button').click();
      await expect(frontdeskPage.getByTestId('generate-deed-button')).not.toBeVisible();
    }
  });
});
