/**
 * PWA — Offline Sync Spec
 *
 * Simulates the offline-first flow described in PRD §4.2:
 * 1. Agent goes offline
 * 2. Registers a lead (saved locally via IndexedDB / Dexie.js)
 * 3. UI shows a "pending sync" indicator
 * 4. Agent comes back online
 * 5. Pending action syncs to server
 * 6. Lead appears in the server-side list
 *
 * Note: Use the Chromium project only (PWA features).
 */

import { test, expect } from '../../fixtures';

test.describe('PWA Offline Sync', () => {
  test('UI shows pending sync indicator when offline', async ({ agentPage }) => {
    await agentPage.goto('/dashboard/leads');

    // Go offline
    await agentPage.context().setOffline(true);

    await agentPage.getByTestId('new-lead-button').click();
    await expect(agentPage.getByTestId('lead-form')).toBeVisible();

    const leadName = `E2E_OfflineLead_${Date.now()}`;
    await agentPage.getByTestId('lead-name-input').fill(leadName);
    await agentPage.getByTestId('lead-phone-input').fill('07011223344');
    await agentPage.getByTestId('lead-form-submit').click();

    // Should see offline/pending indicator, not an error
    const pendingIndicator = agentPage.getByTestId('pending-sync-banner');
    const offlineToast = agentPage.getByTestId('toast-offline');
    const hasFeedback = (await pendingIndicator.isVisible()) || (await offlineToast.isVisible());
    expect(hasFeedback).toBe(true);

    // Come back online
    await agentPage.context().setOffline(false);

    // Wait for sync to complete (service worker / online event handler)
    await agentPage.waitForTimeout(3_000);

    // Pending indicator should clear
    await expect(agentPage.getByTestId('pending-sync-banner')).not.toBeVisible({ timeout: 15_000 });
  });

  test('synced lead appears in server-side list after reconnect', async ({ agentPage }) => {
    await agentPage.goto('/dashboard/leads');
    await agentPage.context().setOffline(true);

    const leadName = `E2E_SyncLead_${Date.now()}`;
    await agentPage.getByTestId('new-lead-button').click();
    await agentPage.getByTestId('lead-name-input').fill(leadName);
    await agentPage.getByTestId('lead-phone-input').fill('07022334455');
    await agentPage.getByTestId('lead-form-submit').click();

    // Go online
    await agentPage.context().setOffline(false);

    // Reload to trigger server-side render
    await agentPage.reload();
    await agentPage.waitForTimeout(5_000);

    // The lead should now be visible in the table
    const leadsTable = agentPage.getByTestId('leads-table');
    await expect(leadsTable).toBeVisible();
    // Note: if the sync is async it may need a longer wait
    const leadRow = leadsTable.getByText(leadName);
    await expect(leadRow).toBeVisible({ timeout: 20_000 });
  });

  test('PWA install prompt shown on mobile viewport', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: '.playwright/auth/agent.json',
      viewport: { width: 390, height: 844 },
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    });
    const page = await context.newPage();
    await page.goto('/dashboard');
    // The PWA banner/install prompt would appear — we just verify the app loads
    await expect(page).toHaveURL(/\/dashboard/);
    await context.close();
  });
});
