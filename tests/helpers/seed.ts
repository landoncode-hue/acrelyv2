/**
 * Seed Helper
 *
 * Utilities for creating test data via the app's API endpoints during e2e tests.
 * Prefer seeding through the API (rather than direct DB) so the same validation
 * and business logic is exercised.
 *
 * All seeded records use the `E2E_` name prefix.
 * Global teardown deletes them by matching this prefix.
 */

import type { APIRequestContext } from '@playwright/test';

export interface SeedEstate {
  name: string;
  location: string;
  base_price: number;
  grid_rows: number;
  grid_cols: number;
}

export interface SeedLead {
  full_name: string;
  phone: string;
  email?: string;
  source?: string;
}

/**
 * Get the auth cookie for API calls during setup.
 * Reads from the sysadmin storage state.
 */
export async function getApiAuthHeaders(
  request: APIRequestContext,
  _baseURL: string,
): Promise<Record<string, string>> {
  // In most cases, API fixtures already carry the authenticated context.
  // This helper is a placeholder for situations where you need raw fetch headers.
  return { 'Content-Type': 'application/json' };
}

/**
 * Seed a test estate via the internal API.
 * Returns the created estate ID.
 */
export async function seedEstate(
  request: APIRequestContext,
  data: Partial<SeedEstate> = {},
): Promise<string> {
  const estate: SeedEstate = {
    name: `E2E_${Date.now()} Estate`,
    location: 'Test Location, Lagos',
    base_price: 5_000_000,
    grid_rows: 5,
    grid_cols: 5,
    ...data,
  };

  const res = await request.post('/api/estates', { data: estate });
  const body = await res.json();

  if (!res.ok()) {
    throw new Error(`seedEstate failed: ${JSON.stringify(body)}`);
  }

  return body.id as string;
}

/**
 * Seed a test lead.
 * Returns the created lead ID.
 */
export async function seedLead(
  request: APIRequestContext,
  data: Partial<SeedLead> = {},
): Promise<string> {
  const lead: SeedLead = {
    full_name: `E2E_Lead_${Date.now()}`,
    phone: `080${Math.floor(Math.random() * 90000000 + 10000000)}`,
    source: 'e2e_test',
    ...data,
  };

  const res = await request.post('/api/leads', { data: lead });
  const body = await res.json();

  if (!res.ok()) {
    throw new Error(`seedLead failed: ${JSON.stringify(body)}`);
  }

  return body.id as string;
}
