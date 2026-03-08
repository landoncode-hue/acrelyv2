/**
 * E2E Test Seed Script
 *
 * Seeds deterministic test data in the database before running e2e tests.
 * All records use the `E2E_` name prefix so they can be cleanly removed
 * by global-teardown.ts.
 *
 * Run: npm run test:setup
 *
 * What it creates:
 * - 6 test user accounts (one per role) if they don't already exist
 * - 1 test estate with a 5x5 grid
 * - Several plots in specific states (available, reserved, allocated)
 * - 1 test customer allocation (for portal tests)
 * - 1 test agent commission (for commission approval tests)
 */

import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  // Dynamic import after env is loaded
  const { default: sql } = await import('../../src/lib/db.js');
  const PASSWORD_HASH = await bcrypt.hash('TestPass123!', 10);
  console.log('🌱 Seeding e2e test data...\n');

// ─── 1. Test Users ────────────────────────────────────────────────────────────
const testUsers = [
  { email: 'e2e.sysadmin@acrely.test', role: 'sysadmin', full_name: 'E2E SysAdmin', is_staff: true },
  { email: 'e2e.ceo@acrely.test',      role: 'ceo',      full_name: 'E2E CEO',      is_staff: true },
  { email: 'e2e.md@acrely.test',       role: 'md',       full_name: 'E2E MD',       is_staff: true },
  { email: 'e2e.frontdesk@acrely.test',role: 'frontdesk',full_name: 'E2E Frontdesk', is_staff: true },
  { email: 'e2e.agent@acrely.test',    role: 'agent',    full_name: 'E2E Agent',    is_staff: true },
  { email: 'e2e.customer@acrely.test', role: 'customer', full_name: 'E2E Customer', is_staff: false },
];

for (const user of testUsers) {
  await sql`
    INSERT INTO profiles (email, password_hash, role, full_name, is_staff, email_verified, staff_status)
    VALUES (
      ${user.email.toLowerCase().trim()},
      ${PASSWORD_HASH},
      ${user.role},
      ${user.full_name},
      ${user.is_staff},
      true,
      ${user.is_staff ? 'active' : null}
    )
    ON CONFLICT (email) DO UPDATE SET
      password_hash = ${PASSWORD_HASH},
      role = ${user.role},
      full_name = ${user.full_name},
      is_staff = ${user.is_staff},
      staff_status = ${user.is_staff ? 'active' : null},
      email_verified = true
  `;
  console.log(`  ✅ Synced user: ${user.email} (${user.role})`);
}

// ─── 2. Test Estate ───────────────────────────────────────────────────────────
let estateId: string;

const existingEstate = await sql`SELECT id FROM estates WHERE name = 'E2E Test Estate' LIMIT 1`;
if (existingEstate.length === 0) {
  const [estate] = await sql`
    INSERT INTO estates (name, location, base_price, metadata)
    VALUES ('E2E Test Estate', 'Test Location, Lagos', 5000000, ${JSON.stringify({ grid_rows: 5, grid_cols: 5, source: 'e2e' })})
    RETURNING id
  `;
  estateId = estate.id;
  console.log(`\n  ✅ Created estate: E2E Test Estate (id: ${estateId})`);
} else {
  estateId = existingEstate[0].id;
  console.log(`\n  ⏩ Skipped (exists): E2E Test Estate`);
}

// ─── 3. Test Plots ────────────────────────────────────────────────────────────
const testPlots = [
  { plot_number: 'E2E_1', status: 'available', grid_x: 0, grid_y: 0, dimensions: '100x100' },
  { plot_number: 'E2E_2', status: 'available', grid_x: 1, grid_y: 0, dimensions: '100x100' },
  { plot_number: 'E2E_3', status: 'reserved',  grid_x: 2, grid_y: 0, dimensions: '100x100' },
  { plot_number: 'E2E_4', status: 'available', grid_x: 3, grid_y: 0, dimensions: '100x100' },
  { plot_number: 'E2E_3A', status: 'sold', grid_x: 0, grid_y: 1, dimensions: '50x100' },
  { plot_number: 'E2E_3B', status: 'available', grid_x: 0, grid_y: 1, dimensions: '50x100' },
];

for (const plot of testPlots) {
  const existing = await sql`
    SELECT id FROM plots WHERE estate_id = ${estateId} AND plot_number = ${plot.plot_number} LIMIT 1
  `;
  if (existing.length === 0) {
    await sql`
      INSERT INTO plots (estate_id, plot_number, status, dimensions, metadata)
      VALUES (${estateId}, ${plot.plot_number}, ${plot.status}, ${plot.dimensions}, ${JSON.stringify({ grid_x: plot.grid_x, grid_y: plot.grid_y, source: 'e2e' })})
    `;
    console.log(`  ✅ Created plot: ${plot.plot_number} (${plot.status})`);
  }
}

// ─── 4. Test Customer Record ─────────────────────────────────────────────────
let customerId: string;
const customerProfile = await sql`SELECT * FROM profiles WHERE email = 'e2e.customer@acrely.test' LIMIT 1`;
const existingCustomer = await sql`SELECT id FROM customers WHERE email = 'e2e.customer@acrely.test' LIMIT 1`;

if (existingCustomer.length === 0 && customerProfile.length) {
  const [customer] = await sql`
    INSERT INTO customers (full_name, email, phone, status, kyc_status)
    VALUES (${customerProfile[0].fullName}, ${customerProfile[0].email}, '08000000001', 'active', 'verified')
    RETURNING id
  `;
  customerId = customer.id;
  console.log(`  ✅ Created customer record for: ${customerProfile[0].email}`);
} else {
  customerId = existingCustomer[0]?.id;
}

// ─── 5. Test Agent Record ────────────────────────────────────────────────────
let agentId: string;
const agentProfile = await sql`SELECT * FROM profiles WHERE email = 'e2e.agent@acrely.test' LIMIT 1`;
const existingAgent = await sql`SELECT id FROM agents WHERE profile_id = ${agentProfile[0].id} LIMIT 1`;

if (existingAgent.length === 0 && agentProfile.length) {
  const [agent] = await sql`
    INSERT INTO agents (profile_id, status, commission_rate)
    VALUES (${agentProfile[0].id}, 'active', 5.0)
    RETURNING id
  `;
  agentId = agent.id;
  console.log(`  ✅ Created agent record for: ${agentProfile[0].email}`);
} else {
  agentId = existingAgent[0]?.id;
}

// ─── 6. Test Customer Allocation ─────────────────────────────────────────────
const allocatedPlot = await sql`
  SELECT id FROM plots WHERE estate_id = ${estateId} AND plot_number = 'E2E_3A' LIMIT 1
`;

if (customerId && allocatedPlot.length) {
  const existing = await sql`
    SELECT id FROM allocations WHERE plot_id = ${allocatedPlot[0].id} LIMIT 1
  `;
  if (existing.length === 0) {
    await sql`
      INSERT INTO allocations (plot_id, customer_id, estate_id, metadata, status, total_price)
      VALUES (${allocatedPlot[0].id}, ${customerId}, ${estateId}, ${JSON.stringify({ notes: '[E2E] test allocation', source: 'e2e' })}, 'active', 5000000)
    `;
    console.log(`\n  ✅ Created allocation for E2E Customer on plot E2E_3A`);
  }
}

// ─── 7. Test Commission ───────────────────────────────────────────────────────
if (agentId) {
  const existing = await sql`
    SELECT id FROM commissions WHERE metadata->>'notes' = '[E2E] test commission' LIMIT 1
  `;
  if (existing.length === 0) {
    await sql`
      INSERT INTO commissions (agent_id, amount, status, metadata)
      VALUES (${agentId}, 250000, 'pending', ${JSON.stringify({ notes: '[E2E] test commission', source: 'e2e' })})
    `;
    console.log(`  ✅ Created pending commission for E2E Agent`);
  }
}

  await sql.end();
  console.log('\n✅ Seed complete.\n');
}

main().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
