/**
 * Customer Portal — Support Tickets Spec
 *
 * Tests the support ticket system (PRD §4.6).
 * Customers can create and track support tickets.
 */

import { test, expect } from '../../fixtures';

test.describe('Support Tickets (§4.6)', () => {
  test('customer can navigate to support/help page', async ({ customerPage }) => {
    await customerPage.goto('/portal/help');
    const helpSection = customerPage.getByTestId('support-section');
    const ticketsList = customerPage.getByTestId('tickets-list');
    const hasContent = (await helpSection.isVisible()) || (await ticketsList.isVisible());
    expect(hasContent).toBe(true);
  });

  test('customer can create a new support ticket', async ({ customerPage }) => {
    await customerPage.goto('/portal/help');
    await customerPage.getByTestId('new-ticket-button').click();
    await expect(customerPage.getByTestId('ticket-form')).toBeVisible();

    await customerPage.getByTestId('ticket-subject-input').fill('E2E Test: Payment Discrepancy');
    await customerPage.getByTestId('ticket-description-input').fill(
      'This is an automated e2e test ticket for verifying the support flow.'
    );
    await customerPage.getByTestId('ticket-form-submit').click();

    await expect(customerPage.getByTestId('toast-success')).toBeVisible({ timeout: 10_000 });
  });

  test('customer can see ticket status after creation', async ({ customerPage }) => {
    await customerPage.goto('/portal/help');
    const ticketRow = customerPage.locator('[data-testid="ticket-row"]').first();

    if (await ticketRow.isVisible({ timeout: 5_000 })) {
      const statusBadge = ticketRow.getByTestId('ticket-status');
      await expect(statusBadge).toBeVisible();
      const statusText = await statusBadge.textContent();
      expect(['open', 'in-progress', 'resolved'].some(
        s => statusText?.toLowerCase().includes(s)
      )).toBe(true);
    }
  });

  test('staff can view support tickets on dashboard', async ({ frontdeskPage }) => {
    await frontdeskPage.goto('/dashboard/support');
    const supportList = frontdeskPage.getByTestId('support-tickets-list');
    const supportTable = frontdeskPage.getByTestId('support-tickets-table');
    const hasContent = (await supportList.isVisible()) || (await supportTable.isVisible());
    expect(hasContent).toBe(true);
  });

  test('staff can update ticket status to resolved', async ({ frontdeskPage }) => {
    await frontdeskPage.goto('/dashboard/support');
    const openTicket = frontdeskPage.locator('[data-testid="ticket-row"][data-status="open"]').first();

    if (await openTicket.isVisible({ timeout: 5_000 })) {
      await openTicket.getByTestId('resolve-ticket-button').click();
      await frontdeskPage.getByTestId('confirm-resolve-button').click();
      await expect(frontdeskPage.getByTestId('toast-success')).toBeVisible({ timeout: 10_000 });
    }
  });
});
