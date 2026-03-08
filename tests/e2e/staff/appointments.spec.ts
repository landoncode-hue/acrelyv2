/**
 * Staff — Appointments Spec
 *
 * Tests viewing appointment booking / site visit scheduling (PRD §4.5).
 */

import { test, expect } from '../../fixtures';

test.describe('Appointments (§4.5)', () => {
  test('appointments page loads for frontdesk', async ({ frontdeskPage }) => {
    await frontdeskPage.goto('/dashboard/appointments');
    await expect(frontdeskPage.getByTestId('appointments-list')).toBeVisible();
  });

  test('frontdesk can create a new appointment', async ({ frontdeskPage }) => {
    await frontdeskPage.goto('/dashboard/appointments');
    await frontdeskPage.getByTestId('new-appointment-button').click();
    await expect(frontdeskPage.getByTestId('appointment-form')).toBeVisible();

    await frontdeskPage.getByTestId('appointment-customer-input').fill('E2E');
    await frontdeskPage.getByTestId('appointment-date-input').fill('2026-04-15');
    await frontdeskPage.getByTestId('appointment-form-submit').click();

    await expect(frontdeskPage.getByTestId('toast-success')).toBeVisible({ timeout: 10_000 });
  });

  test('appointments show assignee information', async ({ frontdeskPage }) => {
    await frontdeskPage.goto('/dashboard/appointments');
    const firstRow = frontdeskPage.locator('[data-testid="appointment-row"]').first();

    if (await firstRow.isVisible({ timeout: 5_000 })) {
      await expect(firstRow.getByTestId('appointment-assignee')).toBeVisible();
    }
  });

  test('MD can view all appointments', async ({ mdPage }) => {
    await mdPage.goto('/dashboard/appointments');
    await expect(mdPage.getByTestId('appointments-list')).toBeVisible();
  });

  test('agent can view their assigned appointments', async ({ agentPage }) => {
    await agentPage.goto('/dashboard/appointments');
    // Agent should see a filtered view or their own appointments
    const hasContent = (await agentPage.getByTestId('appointments-list').isVisible()) ||
      (await agentPage.getByTestId('my-appointments').isVisible());
    expect(hasContent).toBe(true);
  });
});
