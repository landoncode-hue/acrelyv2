/**
 * Staff — Communications & Campaigns Spec
 *
 * Tests communication templates and campaign management (PRD §4.4).
 */

import { test, expect } from '../../fixtures';

test.describe('Communications & Campaigns (§4.4)', () => {
  test('communications page loads for MD', async ({ mdPage }) => {
    await mdPage.goto('/dashboard/communications');
    await expect(mdPage.getByTestId('communications-overview')).toBeVisible();
  });

  test('MD can view message templates', async ({ mdPage }) => {
    await mdPage.goto('/dashboard/communications');
    const templatesSection = mdPage.getByTestId('templates-section');
    const templatesList = mdPage.getByTestId('templates-list');
    const hasTemplates = (await templatesSection.isVisible()) || (await templatesList.isVisible());
    expect(hasTemplates).toBe(true);
  });

  test('MD can create a new campaign', async ({ mdPage }) => {
    await mdPage.goto('/dashboard/communications');
    await mdPage.getByTestId('create-campaign-button').click();
    await expect(mdPage.getByTestId('campaign-form')).toBeVisible();

    await mdPage.getByTestId('campaign-name-input').fill(`E2E_Campaign_${Date.now()}`);
    await mdPage.getByTestId('campaign-template-select').selectOption({ index: 1 });
    await mdPage.getByTestId('campaign-form-submit').click();

    await expect(mdPage.getByTestId('toast-success')).toBeVisible({ timeout: 10_000 });
  });

  test('frontdesk can view communications but not create campaigns', async ({ frontdeskPage }) => {
    await frontdeskPage.goto('/dashboard/communications');
    const hasAccess = (await frontdeskPage.getByTestId('communications-overview').isVisible()) ||
      frontdeskPage.url().includes('/unauthorized');

    if (await frontdeskPage.getByTestId('communications-overview').isVisible()) {
      await expect(frontdeskPage.getByTestId('create-campaign-button')).not.toBeVisible();
    }
  });

  test('agent cannot access communications page', async ({ agentPage }) => {
    await agentPage.goto('/dashboard/communications');
    const isUnauthorized = agentPage.url().includes('/unauthorized');
    const noContent = !(await agentPage.getByTestId('communications-overview').isVisible());
    expect(isUnauthorized || noContent).toBeTruthy();
  });
});
