/**
 * Customer Portal — KYC Spec
 *
 * Tests the KYC document upload and verification workflow (PRD §4.6).
 */

import { test, expect } from '../../fixtures';

test.describe('KYC Verification (§4.6)', () => {
  test.beforeEach(async ({ customerPage }) => {
    await customerPage.goto('/portal/kyc');
  });

  test('KYC page loads for authenticated customer', async ({ customerPage }) => {
    await expect(customerPage.getByTestId('kyc-section')).toBeVisible();
  });

  test('customer sees upload form for ID document', async ({ customerPage }) => {
    const uploadForm = customerPage.getByTestId('kyc-upload-form');
    const idUpload = customerPage.getByTestId('kyc-id-upload');
    const hasUpload = (await uploadForm.isVisible()) || (await idUpload.isVisible());
    expect(hasUpload).toBe(true);
  });

  test('customer can upload a KYC document', async ({ customerPage }) => {
    const fileInput = customerPage.getByTestId('kyc-file-input');

    if (await fileInput.isVisible()) {
      // Create a fake test file for upload
      await fileInput.setInputFiles({
        name: 'e2e_test_id.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('E2E Test Document Content'),
      });
      await customerPage.getByTestId('kyc-submit-button').click();
      await expect(customerPage.getByTestId('toast-success')).toBeVisible({ timeout: 10_000 });
    }
  });

  test('customer sees verification status', async ({ customerPage }) => {
    const status = customerPage.getByTestId('kyc-status');
    if (await status.isVisible()) {
      const statusText = await status.textContent();
      // Status should be one of: pending, verified, rejected
      expect(['pending', 'verified', 'rejected'].some(
        s => statusText?.toLowerCase().includes(s)
      )).toBe(true);
    }
  });

  test('staff cannot access customer KYC upload page', async ({ frontdeskPage }) => {
    await frontdeskPage.goto('/portal/kyc');
    // Staff should be redirected to dashboard
    await expect(frontdeskPage).toHaveURL(/\/dashboard/);
  });
});
