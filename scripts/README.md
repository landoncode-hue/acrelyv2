# Acrely Scripts

Utility scripts for database management, testing, deployment, and maintenance.

## 📁 Directory Structure

```
scripts/
├── database/           # Database operations
│   ├── migrations/    # Database migration scripts
│   ├── maintenance/   # DB cleanup and reset scripts
│   └── inspection/    # DB inspection and verification
├── deployment/         # Deployment automation
├── testing/           # Test utilities and helpers
├── debug/             # Debugging tools
├── checks/            # Health checks and audits
└── utils/             # Shared utility functions
```

## 🗄️ Database Scripts

### Migrations (`database/migrations/`)
Scripts for applying database schema changes and data migrations.

**Usage:**
```bash
# Apply a specific migration
tsx scripts/database/migrations/<migration-name>.ts
```

### Maintenance (`database/maintenance/`)
Scripts for database cleanup, reset, and maintenance operations.

- `reset-database.ts` - Complete database reset (⚠️ DESTRUCTIVE)
- `clear-inventory.ts` - Clear inventory data
- `clear-audit-logs.ts` - Clear audit log entries
- `mass-clear.ts` - Bulk data cleanup operations
- `reset-plots.ts` - Reset plot data to initial state

**Usage:**
```bash
# Reset entire database (CAUTION!)
tsx scripts/database/maintenance/reset-database.ts

# Clear specific data
tsx scripts/database/maintenance/clear-inventory.ts
```

### Inspection (`database/inspection/`)
Scripts for inspecting and verifying database state.

- `inspect-db.ts` - General database inspection
- `list-estates.js` - List all estates
- `list-profiles.js` - List user profiles
- `verify-customer.js` - Verify customer data integrity
- `verify-logs.ts` - Verify logging functionality

**Usage:**
```bash
# Inspect database state
tsx scripts/database/inspection/inspect-db.ts

# List estates
node scripts/database/inspection/list-estates.js
```

## 🧪 Testing Scripts (`testing/`)

Test utilities, fixtures, and test data management.

**Usage:**
```bash
# Run test utilities
tsx scripts/testing/<script-name>.ts
```

## 🚀 Deployment Scripts (`deployment/`)

Automation scripts for deployment processes.

**Usage:**
```bash
# Run deployment script
tsx scripts/deployment/<script-name>.ts
```

## 🐛 Debug Scripts (`debug/`)

Debugging tools for troubleshooting issues.

**Usage:**
```bash
# Run debug script
tsx scripts/debug/<script-name>.ts
```

## ✅ Health Checks (`checks/`)

System health checks and audit scripts.

**Usage:**
```bash
# Run health check
tsx scripts/checks/<script-name>.ts
```

## 🛠️ Utilities (`utils/`)

Shared utility functions used across multiple scripts.

## ⚙️ Configuration

Scripts use TypeScript configuration from `tsconfig.scripts.json`.

## 🔐 Environment Variables

Most scripts require environment variables. Ensure you have:

- `.env` or `.env.local` configured
- Supabase credentials set
- Appropriate permissions for the operations

## ⚠️ Safety Guidelines

### Destructive Operations
Scripts marked with ⚠️ are **DESTRUCTIVE** and will delete data:

- Always backup before running destructive scripts
- Never run in production without explicit approval
- Test in development environment first

### Production Usage
When running scripts in production:

1. ✅ Review the script code
2. ✅ Backup relevant data
3. ✅ Test in staging first
4. ✅ Have rollback plan ready
5. ✅ Monitor execution closely

## 📝 Adding New Scripts

When adding a new script:

1. Place it in the appropriate category directory
2. Add TypeScript types and proper error handling
3. Include usage documentation in comments
4. Update this README with script description
5. Add to package.json scripts if frequently used

## 🔗 Related Documentation

- [Database Migrations](../supabase/migrations/) - SQL migration files
- [Testing Guide](../docs/testing/ANALYTICS_TESTING_GUIDE.md) - Testing procedures
- [Deployment Guide](../docs/deployment/QUICK_DEPLOY.md) - Deployment process
- [Runbooks](../docs/operations/RUNBOOKS.md) - Operational procedures
