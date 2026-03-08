# 🗂️ Acrely Project Organization Guide

**Last Updated:** January 7, 2026  
**Version:** 2.0 (Post-Reorganization)

---

## 📖 Table of Contents

1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Finding Files](#finding-files)
4. [Common Tasks](#common-tasks)
5. [Documentation](#documentation)
6. [Scripts Usage](#scripts-usage)
7. [Configuration](#configuration)
8. [Best Practices](#best-practices)

---

## 🚀 Quick Start

### First Time Setup
```bash
# Clone repository
git clone <repository-url>
cd acrely

# Install dependencies
npm install

# Setup environment
cp config/env/env.example .env.local
# Edit .env.local with your credentials

# Start development server
npm run dev
```

### Daily Development
```bash
# Start dev server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

---

## 📁 Project Structure

### Overview
```
acrely/
├── config/         # All configuration files
├── docs/           # Categorized documentation
├── mobile/         # Flutter mobile app
├── public/         # Static assets
├── scripts/        # Utility scripts by category
├── src/            # Next.js application
├── supabase/       # Backend (functions & migrations)
└── tests/          # All test suites
```

### Detailed Structure

#### `config/` - Configuration Files
All build tools and framework configurations.

```
config/
├── env/                    # Environment templates
│   ├── env.example        # Main env template
│   ├── env.test.example   # Test env template
│   └── env.google-drive.example
├── eslint.config.mjs      # ESLint configuration
├── next.config.ts         # Next.js configuration
├── playwright.config.ts   # E2E test configuration
├── postcss.config.mjs     # PostCSS configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── tsconfig.scripts.json  # Scripts TypeScript config
└── vitest.config.ts       # Unit test configuration
```

**Note:** Symlinks exist in root for tool compatibility.

#### `docs/` - Documentation
Organized by category for easy navigation.

```
docs/
├── README.md              # Documentation index
├── architecture/          # System design
│   └── SYSTEM_ARCHITECTURE.md
├── compliance/            # Data governance
│   ├── COMPLIANCE_COMPLETE.md
│   ├── DATA_HYGIENE_AUDIT_GUIDE.md
│   └── ALTERNATIVE_CLEANUP_SOLUTIONS.md
├── deployment/            # Deploy guides
│   ├── DEPLOYMENT_CHECKLIST.md
│   ├── QUICK_DEPLOY.md
│   └── ... (7 files)
├── development/           # Dev guidelines
│   ├── UX_GUIDELINES.md
│   └── VERCEL_FREE_TIER_LIMITATIONS.md
├── operations/            # Runbooks
│   ├── RUNBOOKS.md
│   ├── DISASTER_RECOVERY_RUNBOOK.md
│   └── GOOGLE_DRIVE_BACKUP_SETUP.md
└── testing/               # Test guides
    ├── ANALYTICS_TESTING_GUIDE.md
    └── VERIFICATION_CHECKLIST.md
```

#### `scripts/` - Utility Scripts
Organized by purpose for easy discovery.

```
scripts/
├── README.md              # Scripts documentation
├── checks/                # Health checks & audits
├── database/              # Database operations
│   ├── inspection/       # Verify DB state
│   ├── maintenance/      # Cleanup & reset
│   └── migrations/       # Migration scripts
├── debug/                 # Debugging tools
├── deployment/            # Deploy automation
├── testing/               # Test utilities
└── utils/                 # Shared utilities
```

#### `src/` - Application Source
Next.js application code.

```
src/
├── app/                   # App router pages
├── components/            # React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
└── middleware.ts          # Next.js middleware
```

#### `supabase/` - Backend
Supabase configuration and code.

```
supabase/
├── functions/             # Edge functions
├── migrations/            # Database migrations
├── config.toml           # Supabase configuration
└── seed.sql              # Seed data
```

#### `tests/` - Test Suites
All testing code organized by type.

```
tests/
├── auth/                  # Authentication tests
├── e2e/                   # End-to-end tests
├── rls/                   # RLS policy tests
└── setup/                 # Test fixtures & setup
```

---

## 🔍 Finding Files

### Quick Reference

| What You Need | Where to Look |
|---------------|---------------|
| **Configuration** | `config/` |
| **Documentation** | `docs/` (see category subdirectories) |
| **Database scripts** | `scripts/database/` |
| **Test utilities** | `scripts/testing/` |
| **Deployment scripts** | `scripts/deployment/` |
| **Debug tools** | `scripts/debug/` |
| **React components** | `src/components/` |
| **API routes** | `src/app/api/` |
| **Database migrations** | `supabase/migrations/` |
| **Edge functions** | `supabase/functions/` |
| **E2E tests** | `tests/e2e/` |

### Search Tips

```bash
# Find a file by name
find . -name "filename.ts" -type f

# Search file contents
grep -r "search term" src/

# List all TypeScript files in a directory
find src/ -name "*.ts" -o -name "*.tsx"
```

---

## 🛠️ Common Tasks

### Development

```bash
# Start development server
npm run dev

# Start with webpack (if turbo has issues)
npm run dev:webpack

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Testing

```bash
# Run all tests
npm run test:all

# Run unit tests
npm run test

# Run unit tests with UI
npm run test:ui

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed

# Run RLS policy tests
npm run test:rls
```

### Database Operations

```bash
# Inspect database
tsx scripts/database/inspection/inspect-db.ts

# List estates
node scripts/database/inspection/list-estates.js

# List profiles
node scripts/database/inspection/list-profiles.js

# Run data hygiene audit
npm run audit:data-hygiene

# Reset database (⚠️ DESTRUCTIVE)
tsx scripts/database/maintenance/reset-database.ts
```

### Mobile Development

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
flutter pub get

# Run on device/emulator
flutter run

# Build for Android
flutter build apk

# Build for iOS
flutter build ios
```

---

## 📚 Documentation

### Finding Documentation

1. **Start with the index:** [docs/README.md](../README.md)
2. **Browse by category:**
   - Architecture → `docs/architecture/`
   - Deployment → `docs/deployment/`
   - Compliance → `docs/compliance/`
   - Operations → `docs/operations/`
   - Testing → `docs/testing/`
   - Development → `docs/development/`

### Most Used Docs

- **System Overview:** [docs/architecture/SYSTEM_ARCHITECTURE.md](../architecture/SYSTEM_ARCHITECTURE.md)
- **Deployment:** [docs/deployment/QUICK_DEPLOY.md](../deployment/QUICK_DEPLOY.md)
- **UX Guidelines:** [docs/development/UX_GUIDELINES.md](../development/UX_GUIDELINES.md)
- **Runbooks:** [docs/operations/RUNBOOKS.md](../operations/RUNBOOKS.md)
- **Testing:** [docs/testing/ANALYTICS_TESTING_GUIDE.md](../testing/ANALYTICS_TESTING_GUIDE.md)

---

## 🔧 Scripts Usage

### Finding Scripts

1. **Check the index:** [scripts/README.md](../../scripts/README.md)
2. **Browse by category:**
   - Database → `scripts/database/`
   - Testing → `scripts/testing/`
   - Deployment → `scripts/deployment/`
   - Debug → `scripts/debug/`
   - Checks → `scripts/checks/`

### Running Scripts

```bash
# TypeScript scripts
tsx scripts/path/to/script.ts

# JavaScript scripts
node scripts/path/to/script.js

# With npm (if defined in package.json)
npm run script-name
```

### Safety Guidelines

⚠️ **CAUTION:** Scripts in `scripts/database/maintenance/` are **DESTRUCTIVE**

- Always backup before running
- Never run in production without approval
- Test in development first

---

## ⚙️ Configuration

### Environment Variables

Environment templates are in `config/env/`:

```bash
# Copy template
cp config/env/env.example .env.local

# Edit with your values
nano .env.local
```

**Never commit `.env` or `.env.local` files!**

### Build Configuration

All configuration files are in `config/`:

- **Next.js:** `config/next.config.ts`
- **Tailwind:** `config/tailwind.config.ts`
- **TypeScript:** `config/tsconfig.json`
- **ESLint:** `config/eslint.config.mjs`
- **Playwright:** `config/playwright.config.ts`
- **Vitest:** `config/vitest.config.ts`

**Note:** Symlinks exist in root, but edit files in `config/`.

---

## ✅ Best Practices

### File Organization

1. **Place files in appropriate directories**
   - Configs → `config/`
   - Docs → `docs/[category]/`
   - Scripts → `scripts/[category]/`
   - Components → `src/components/`

2. **Update documentation when adding files**
   - Add to relevant README
   - Update index files
   - Add usage examples

3. **Use descriptive names**
   - Clear, self-documenting filenames
   - Consistent naming conventions
   - Avoid abbreviations

### Documentation

1. **Keep docs up to date**
   - Update when making changes
   - Add examples and usage
   - Link related documents

2. **Use proper categories**
   - Place in correct subdirectory
   - Update category README
   - Add to main index

### Scripts

1. **Add proper documentation**
   - Usage examples in comments
   - Safety warnings for destructive ops
   - Update scripts/README.md

2. **Use appropriate category**
   - Database ops → `scripts/database/`
   - Tests → `scripts/testing/`
   - Deploy → `scripts/deployment/`

3. **Handle errors gracefully**
   - Add try-catch blocks
   - Provide helpful error messages
   - Log important operations

### Git Workflow

1. **Commit related changes together**
2. **Write clear commit messages**
3. **Don't commit sensitive data**
4. **Keep .gitignore updated**

---

## 🆘 Getting Help

### Resources

1. **Documentation Index:** [docs/README.md](../README.md)
2. **Scripts Guide:** [scripts/README.md](../../scripts/README.md)
3. **Main README:** [README.md](../../README.md)
4. **Reorganization Docs:**

### Common Questions

**Q: Where are the config files?**  
A: In `config/`. Symlinks exist in root for tool compatibility.

**Q: How do I find documentation?**  
A: Check [docs/README.md](../README.md) for categorized index.

**Q: Where are database scripts?**  
A: In `scripts/database/` organized by purpose.

**Q: How do I run tests?**  
A: Use `npm run test` (unit), `npm run test:e2e` (E2E), or `npm run test:all` (all).

**Q: Where are environment templates?**  
A: In `config/env/`. Copy to `.env.local` and edit.

---

## 📝 Contributing

When contributing to the project:

1. ✅ Follow the file organization structure
2. ✅ Update relevant documentation
3. ✅ Add tests for new features
4. ✅ Follow coding standards
5. ✅ Write clear commit messages

---

**Happy coding! 🚀**

*For more information, see the [main README](../../README.md) or browse the [documentation](../README.md).*
