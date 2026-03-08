/**
 * Data Fixtures
 *
 * Re-exports shared test data references (IDs, slugs, etc.) that are seeded
 * by `tests/setup/seed-test-data.ts`. Tests import from here so IDs are
 * maintained in one place.
 *
 * All IDs here correspond to records with the `E2E_` name prefix in the DB.
 */

// ─── Seeded Entity References ─────────────────────────────────────────────────
// These are populated by the seed script. In a real CI environment you'd
// read these from a shared JSON file that the seed script writes to.

export const TEST_DATA = {
  estate: {
    name: 'E2E Test Estate',
    location: 'Test Location, Lagos',
    basePrice: 5_000_000,
    gridRows: 5,
    gridCols: 5,
  },
  plot: {
    // Plot that will be used for split tests — must be "available"
    splitTestPlotNumber: 'E2E_1',
    // Plot that will be used for allocation tests
    allocationTestPlotNumber: 'E2E_2',
    // Plot pre-allocated to the test customer for portal tests
    customerAllocatedPlotNumber: 'E2E_3A',
  },
  customer: {
    name: 'E2E Test Customer',
    phone: '08000000001',
  },
  lead: {
    name: 'E2E Test Lead',
    phone: '08000000002',
  },
  payment: {
    idempotencyKeyPrefix: 'e2e_pay_',
    testAmount: 1_500_000,
  },
} as const;

export type TestData = typeof TEST_DATA;
