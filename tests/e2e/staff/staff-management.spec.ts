/**
 * Staff — Staff Management Spec
 *
 * Tests user invitation and role assignment (PRD SA-01).
 * Only `sysadmin` can access /dashboard/staff.
 */

import { test, expect } from '../../fixtures';

test.describe('Staff Management (SA-01)', () => {
  test('sysadmin can access staff management page', async ({ sysadminPage }) => {
    await sysadminPage.goto('/dashboard/staff');
    await expect(sysadminPage.getByTestId('staff-list')).toBeVisible();
  });

  test('sysadmin can open the invite user form', async ({ sysadminPage }) => {
    await sysadminPage.goto('/dashboard/staff');
    await sysadminPage.getByTestId('invite-user-button').click();
    await expect(sysadminPage.getByTestId('invite-user-form')).toBeVisible();
  });

  test('sysadmin can create a new staff user with a role', async ({ sysadminPage }) => {
    await sysadminPage.goto('/dashboard/staff');
    await sysadminPage.getByTestId('invite-user-button').click();

    const timestamp = Date.now();
    await sysadminPage.getByTestId('invite-fullname-input').fill(`E2E_Staff_${timestamp}`);
    await sysadminPage.getByTestId('invite-email-input').fill(`e2e_staff_${timestamp}@test.acrely.com`);
    await sysadminPage.getByTestId('invite-role-select').selectOption('frontdesk');
    await sysadminPage.getByTestId('invite-form-submit').click();

    await expect(sysadminPage.getByTestId('toast-success')).toBeVisible({ timeout: 10_000 });
  });

  test('role selector includes all six roles', async ({ sysadminPage }) => {
    await sysadminPage.goto('/dashboard/staff');
    await sysadminPage.getByTestId('invite-user-button').click();

    const roleSelect = sysadminPage.getByTestId('invite-role-select');
    await expect(roleSelect).toBeVisible();

    const options = await roleSelect.locator('option').allTextContents();
    const expectedRoles = ['sysadmin', 'ceo', 'md', 'frontdesk', 'agent', 'customer'];
    for (const role of expectedRoles) {
      expect(options.some(o => o.toLowerCase().includes(role))).toBe(true);
    }
  });

  test('CEO cannot access staff management', async ({ ceoPage }) => {
    await ceoPage.goto('/dashboard/staff');
    const isUnauthorized = ceoPage.url().includes('/unauthorized');
    const noStaffList = !(await ceoPage.getByTestId('staff-list').isVisible());
    expect(isUnauthorized || noStaffList).toBeTruthy();
  });

  test('frontdesk cannot access staff management', async ({ frontdeskPage }) => {
    await frontdeskPage.goto('/dashboard/staff');
    const isUnauthorized = frontdeskPage.url().includes('/unauthorized');
    const noStaffList = !(await frontdeskPage.getByTestId('staff-list').isVisible());
    expect(isUnauthorized || noStaffList).toBeTruthy();
  });
});
