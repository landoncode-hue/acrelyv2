/**
 * Staff — Apartments Spec
 *
 * Tests apartment/asset management (PRD §4.5).
 * Covers listing, creating, and allocating apartment units.
 */

import { test, expect } from '../../fixtures';

test.describe('Apartment Management (§4.5)', () => {
  test('apartment listing page loads for MD', async ({ mdPage }) => {
    await mdPage.goto('/dashboard/apartments');
    await expect(mdPage.getByTestId('apartments-list')).toBeVisible();
  });

  test('MD can open the create apartment form', async ({ mdPage }) => {
    await mdPage.goto('/dashboard/apartments');
    await mdPage.getByTestId('create-apartment-button').click();
    await expect(mdPage.getByTestId('apartment-form')).toBeVisible();
  });

  test('MD can create a new apartment listing', async ({ mdPage }) => {
    await mdPage.goto('/dashboard/apartments');
    await mdPage.getByTestId('create-apartment-button').click();

    await mdPage.getByTestId('apartment-name-input').fill(`E2E_Apt_${Date.now()}`);
    await mdPage.getByTestId('apartment-estate-select').selectOption({ index: 1 });
    await mdPage.getByTestId('apartment-price-input').fill('15000000');
    await mdPage.getByTestId('apartment-form-submit').click();

    await expect(mdPage.getByTestId('toast-success')).toBeVisible({ timeout: 10_000 });
  });

  test('frontdesk can view apartments but not create', async ({ frontdeskPage }) => {
    await frontdeskPage.goto('/dashboard/apartments');
    await expect(frontdeskPage.getByTestId('apartments-list')).toBeVisible();
    await expect(frontdeskPage.getByTestId('create-apartment-button')).not.toBeVisible();
  });

  test('frontdesk can allocate an apartment to a customer', async ({ frontdeskPage }) => {
    await frontdeskPage.goto('/dashboard/apartments');
    const availableApt = frontdeskPage.locator('[data-testid="apartment-row"][data-status="available"]').first();

    if (await availableApt.isVisible({ timeout: 5_000 })) {
      await availableApt.getByTestId('allocate-apartment-button').click();
      await expect(frontdeskPage.getByTestId('allocation-form')).toBeVisible();
    }
  });

  test('agent cannot access apartments page', async ({ agentPage }) => {
    await agentPage.goto('/dashboard/apartments');
    const isUnauthorized = agentPage.url().includes('/unauthorized');
    const noContent = !(await agentPage.getByTestId('apartments-list').isVisible());
    expect(isUnauthorized || noContent).toBeTruthy();
  });
});
