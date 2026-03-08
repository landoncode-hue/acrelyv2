# E2E Test Suite — Acrely v2

## Quick Start

```bash
# 1. Seed the test user accounts and test data
npm run test:setup

# 2. Run all e2e tests (starts dev server automatically)
npm run test:e2e

# 3. Run a specific project
npm run test:e2e:auth     # Auth flows only
npm run test:e2e:staff    # Staff dashboard
npm run test:e2e:customer # Customer portal
npm run test:e2e:agent    # Agent flows
npm run test:e2e:pwa      # Offline/PWA sync

# 4. Open the HTML report
npx playwright show-report

# 5. Run with browser visible (great for debugging)
npm run test:e2e:headed

# 6. Interactive Playwright UI
npm run test:e2e:ui
```

---

## Architecture

```
tests/
├── e2e/              ← All Playwright spec files (organized by domain)
│   ├── auth/         ← Login, logout, RBAC redirects
│   ├── staff/        ← Estates, plots, splits, allocations, payments, leads, commissions, audit
│   ├── customers/    ← Customer portal, payment plan, documents
│   ├── agents/       ← Lead registration, grid share
│   └── pwa/          ← Offline sync simulation
├── fixtures/         ← Per-role authenticated page fixtures (auth.fixtures.ts)
├── helpers/          ← login.ts, seed.ts
├── pages/            ← Page Object Model classes
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   ├── EstatesPage.ts
│   ├── PlotsPage.ts
│   ├── AllocationsPage.ts
│   ├── PaymentsPage.ts
│   └── PortalPage.ts
├── global-setup.ts   ← Logs in as each role, saves .playwright/auth/{role}.json
├── global-teardown.ts← Cleans up E2E_ prefixed DB records
└── setup/
    └── seed-test-data.ts ← Seeds test users, estate, plots, allocation, commission
```

---

## How Auth Works

Global setup logs in as each role **once** and saves the browser storage state (cookie) to `.playwright/auth/{role}.json`. Tests load this state via fixtures — no login round-trip per test.

```ts
// In a spec file:
import { test, expect } from '../../fixtures';

test('CEO can approve commission', async ({ ceoPage }) => {
  await ceoPage.goto('/dashboard/commissions');
  // Already authenticated as CEO — no login needed
});
```

Available fixtures: `sysadminPage`, `ceoPage`, `mdPage`, `frontdeskPage`, `agentPage`, `customerPage`.

---

## Test Data Conventions

| Convention | Purpose |
|---|---|
| Names start with `E2E_` | Identifies test records for teardown cleanup |
| Idempotency keys start with `e2e_` | Identifies test payments |
| Emails end with `@acrely.test` | All test user accounts |

Global teardown deletes all `E2E_`-prefixed records after every run.

---

## Adding `data-testid` Attributes

E2E tests **only** select elements via `data-testid`. When building or modifying UI components, add stable IDs:

```tsx
// ✅ Good
<button data-testid="approve-commission-button">Approve</button>

// ❌ Bad — breaks if className changes
page.locator('.btn-primary')
```

---

## Environment Variables (add to `.env.local`)

```bash
# E2E test user overrides (defaults work for local dev)
E2E_SYSADMIN_EMAIL=e2e.sysadmin@acrely.test
E2E_SYSADMIN_PASSWORD=TestPass123!
E2E_CEO_EMAIL=e2e.ceo@acrely.test
E2E_CEO_PASSWORD=TestPass123!
E2E_MD_EMAIL=e2e.md@acrely.test
E2E_MD_PASSWORD=TestPass123!
E2E_FRONTDESK_EMAIL=e2e.frontdesk@acrely.test
E2E_FRONTDESK_PASSWORD=TestPass123!
E2E_AGENT_EMAIL=e2e.agent@acrely.test
E2E_AGENT_PASSWORD=TestPass123!
E2E_CUSTOMER_EMAIL=e2e.customer@acrely.test
E2E_CUSTOMER_PASSWORD=TestPass123!

# Set to 'true' to skip DB cleanup after tests (useful for debugging)
E2E_SKIP_CLEANUP=false
```

---

## CI Pipeline

```yaml
# Recommended order
- npm run test          # Vitest unit + integration
- npm run test:setup    # Seed test data (first run only, or on schema changes)
- npm run test:e2e      # Playwright e2e (auto-starts dev server)
```
