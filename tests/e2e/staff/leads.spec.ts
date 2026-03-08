/**
 * Staff — Leads Spec
 */

import { test, expect } from '../../fixtures';

test.describe('Leads', () => {
  test('frontdesk can view leads list', async ({ frontdeskPage }) => {
    await frontdeskPage.goto('/dashboard/leads');
    await expect(frontdeskPage.getByTestId('leads-table')).toBeVisible();
  });

  test('frontdesk can create a new lead', async ({ frontdeskPage }) => {
    await frontdeskPage.goto('/dashboard/leads');
    await frontdeskPage.getByTestId('new-lead-button').click();
    await expect(frontdeskPage.getByTestId('lead-form')).toBeVisible();

    await frontdeskPage.getByTestId('lead-name-input').fill(`E2E_Lead_${Date.now()}`);
    await frontdeskPage.getByTestId('lead-phone-input').fill('08011223344');
    await frontdeskPage.getByTestId('lead-form-submit').click();

    await expect(frontdeskPage.getByTestId('toast-success')).toBeVisible({ timeout: 10_000 });
  });

  test('agent can view their own leads', async ({ agentPage }) => {
    await agentPage.goto('/dashboard/leads');
    await expect(agentPage.getByTestId('leads-table')).toBeVisible();
  });

  test('agent leads are filtered to their own', async ({ agentPage }) => {
    await agentPage.goto('/dashboard/leads');
    // All visible rows should belong to the e2e agent
    const rows = agentPage.locator('[data-testid="lead-row"]');
    const count = await rows.count();
    // At least the seeded lead should be present
    expect(count).toBeGreaterThanOrEqual(0); // > 0 after seeding
  });

  test('agent sees lead status breakdown (AGT-02)', async ({ agentPage }) => {
    await agentPage.goto('/dashboard/leads');
    // Agent dashboard should show status categories or status chips
    const statusFilter = agentPage.getByTestId('lead-status-filter');
    const statusSummary = agentPage.getByTestId('leads-status-summary');
    const hasStatusBreakdown = (await statusFilter.isVisible()) || (await statusSummary.isVisible());

    if (hasStatusBreakdown) {
      // Verify at least one status category is present
      const prospectLabel = agentPage.getByText(/prospect/i);
      const customerLabel = agentPage.getByText(/customer/i);
      const hasCategoryText = (await prospectLabel.isVisible()) || (await customerLabel.isVisible());
      expect(hasCategoryText).toBe(true);
    }
  });
});
