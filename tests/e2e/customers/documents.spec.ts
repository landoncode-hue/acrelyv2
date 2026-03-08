/**
 * Customer Portal — Documents Spec
 */

import { test, expect } from '../../fixtures';

test.describe('Documents', () => {
  test.beforeEach(async ({ customerPage }) => {
    await customerPage.goto('/portal/documents');
  });

  test('documents section loads', async ({ customerPage }) => {
    await expect(customerPage.getByTestId('portal-documents')).toBeVisible();
  });

  test('receipt download triggers a file download', async ({ customerPage }) => {
    const downloadReceipt = customerPage.getByTestId('download-receipt').first();

    if (await downloadReceipt.isVisible()) {
      const [download] = await Promise.all([
        customerPage.waitForEvent('download'),
        downloadReceipt.click(),
      ]);
      expect(download.suggestedFilename()).toMatch(/receipt/i);
    }
  });

  test('deed download triggers a file download', async ({ customerPage }) => {
    const downloadDeed = customerPage.getByTestId('download-deed').first();

    if (await downloadDeed.isVisible()) {
      const [download] = await Promise.all([
        customerPage.waitForEvent('download'),
        downloadDeed.click(),
      ]);
      expect(download.suggestedFilename()).toMatch(/deed/i);
    }
  });
});
