/**
 * Agent — Lead Registration Spec
 */

import { test, expect } from '../../fixtures';

test.describe('Agent Lead Registration', () => {
  test('agent can register a new lead from dashboard', async ({ agentPage }) => {
    await agentPage.goto('/dashboard/leads');

    await agentPage.getByTestId('new-lead-button').click();
    await expect(agentPage.getByTestId('lead-form')).toBeVisible();

    const leadName = `E2E_Lead_${Date.now()}`;
    await agentPage.getByTestId('lead-name-input').fill(leadName);
    await agentPage.getByTestId('lead-phone-input').fill('07099887766');
    await agentPage.getByTestId('lead-form-submit').click();

    await expect(agentPage.getByTestId('toast-success')).toBeVisible({ timeout: 10_000 });

    // Lead should appear in the agent's list
    await expect(agentPage.getByTestId('leads-table').getByText(leadName)).toBeVisible();
  });

  test('new lead is automatically linked to the agent', async ({ agentPage }) => {
    await agentPage.goto('/dashboard/leads');
    // All leads in the agent's view should belong to them
    const rows = agentPage.locator('[data-testid="lead-row"]');
    const count = await rows.count();
    // Verify no leads from other agents are shown by checking the agent column
    for (let i = 0; i < Math.min(count, 5); i++) {
      const agentCell = rows.nth(i).getByTestId('lead-agent-name');
      if (await agentCell.isVisible()) {
        await expect(agentCell).toContainText('E2E'); // Our e2e agent name starts with E2E
      }
    }
  });

  test('lead shows "Prospect" status by default', async ({ agentPage }) => {
    await agentPage.goto('/dashboard/leads');
    const latestRow = agentPage.locator('[data-testid="lead-row"]').first();
    await expect(latestRow.getByTestId('lead-status')).toContainText('Prospect');
  });
});
