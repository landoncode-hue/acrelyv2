# Acrely Testing Suite

Comprehensive testing infrastructure for Acrely, covering E2E, unit, integration, and RLS policy tests.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Users](#test-users)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project (local or remote)
- Test database with seeded data

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

3. Copy environment template:
```bash
cp env.test.example .env.test
```

4. Update `.env.test` with your Supabase credentials

5. Seed test data:
```bash
npm run test:setup
```

## Test Structure

```
tests/
├── setup/
│   ├── global.setup.ts       # Playwright global setup
│   ├── test-helpers.ts       # Shared test utilities
│   ├── seed-test-data.ts     # Database seeding script
│   └── vitest-setup.ts       # Vitest configuration
├── e2e/                      # End-to-end tests
│   ├── auth.spec.ts
│   ├── staff-management.spec.ts
│   ├── allocations.spec.ts
│   ├── customers.spec.ts
│   └── ...
└── rls/                      # Row-Level Security tests
    ├── customers.test.ts
    ├── allocations.test.ts
    └── ...
```

## Running Tests

### All Tests
```bash
npm run test:all
```

### Unit & Integration Tests (Vitest)
```bash
# Run all unit tests
npm run test

# Run with UI
npm run test:ui

# Run RLS tests only
npm run test:rls

# Run with coverage
npm run test -- --coverage
```

### E2E Tests (Playwright)
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (debugging)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npm run test:e2e tests/e2e/auth.spec.ts

# Run tests for specific project/role
npm run test:e2e -- --project=staff
npm run test:e2e -- --project=customer
npm run test:e2e -- --project=agent
```

### View Test Reports
```bash
# Playwright HTML report
npx playwright show-report

# Vitest coverage report
open coverage/index.html
```

## Test Users

The following test users are created by the seed script:

| Role       | Email                          | Password          |
|------------|--------------------------------|-------------------|
| SysAdmin   | sysadmin@test.acrely.com      | TestPassword123!  |
| CEO        | ceo@test.acrely.com           | TestPassword123!  |
| MD         | md@test.acrely.com            | TestPassword123!  |
| FrontDesk  | frontdesk@test.acrely.com     | TestPassword123!  |
| Agent      | agent@test.acrely.com         | TestPassword123!  |
| Customer   | customer@test.acrely.com      | TestPassword123!  |

## Writing Tests

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';
import { login, waitForToast } from '../setup/test-helpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'frontdesk');
  });

  test('should perform action', async ({ page }) => {
    await page.goto('/dashboard/feature');
    await page.click('button:has-text("Action")');
    await waitForToast(page, 'Success message');
    await expect(page.locator('text=Result')).toBeVisible();
  });
});
```

### RLS Test Example

```typescript
import { describe, test, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('Table RLS Policies', () => {
  test('user can only see own data', async () => {
    const client = createClient(url, anonKey);
    await client.auth.signInWithPassword({ email, password });
    
    const { data } = await client.from('table').select('*');
    expect(data).toHaveLength(expectedCount);
  });
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run unit tests
        run: npm run test
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Tests Failing to Login

**Issue**: Authentication tests fail with timeout

**Solution**:
1. Verify test users exist: `npm run test:setup`
2. Check `.env.test` credentials are correct
3. Ensure Supabase project is accessible

### Playwright Browser Issues

**Issue**: Browsers not installed

**Solution**:
```bash
npx playwright install --with-deps
```

### RLS Tests Failing

**Issue**: RLS policies blocking test access

**Solution**:
1. Verify you're using service role key for admin operations
2. Check RLS policies allow test user access
3. Ensure test data is properly seeded

### Flaky Tests

**Issue**: Tests pass/fail intermittently

**Solution**:
1. Increase timeouts in `playwright.config.ts`
2. Add explicit waits: `await page.waitForLoadState('networkidle')`
3. Use retry mechanism (already configured)

### Port Already in Use

**Issue**: Dev server fails to start (port 3000 in use)

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Use `afterEach` to clean up test data
3. **Selectors**: Use `data-testid` attributes for stable selectors
4. **Assertions**: Use specific assertions (avoid generic `toBeTruthy()`)
5. **Waits**: Always wait for elements/states explicitly
6. **Screenshots**: Take screenshots on failure for debugging

## Support

For issues or questions:
- Check existing test files for examples
- Review Playwright docs: https://playwright.dev
- Review Vitest docs: https://vitest.dev
