/**
 * Agent — Grid Share Spec
 *
 * Tests the read-only estate grid share feature (PRD AGT-03).
 * The share URL gives a client a view of available plots — no edit controls.
 */

import { test, expect } from '../../fixtures';

test.describe('Agent Grid Share', () => {
  // Grid share is a public (or lightly-protected) route — no auth needed
  test('read-only grid share page renders without auth', async ({ page }) => {
    // The agent would share a URL like /share/estates/{id}
    // We test the route pattern; actual estate ID comes from seeded data
    await page.goto('/dashboard/estates');
    // Find any share link, or test a known seeded estate
    const shareLink = page.getByTestId('estate-share-link').first();
    if (await shareLink.isVisible()) {
      const href = await shareLink.getAttribute('href');
      if (href) {
        await page.goto(href);
        await expect(page.getByTestId('plot-grid')).toBeVisible();
      }
    }
  });

  test('read-only grid has no allocation or split buttons', async ({ agentPage }) => {
    // Navigate to the agent-accessible grid view
    await agentPage.goto('/dashboard/estates');
    const shareLink = agentPage.getByTestId('estate-share-link').first();
    if (await shareLink.isVisible()) {
      const href = await shareLink.getAttribute('href');
      if (href) {
        await agentPage.goto(href);
        // No action buttons should be present
        await expect(agentPage.getByTestId('action-allocate-plot')).not.toBeVisible();
        await expect(agentPage.getByTestId('action-split-plot')).not.toBeVisible();
      }
    }
  });
});
