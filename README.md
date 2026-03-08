# Acrely Real Estate Management Platform

A high-performance, offline-first, multi-role SaaS platform designed to automate the entire land and apartment sales lifecycle for real estate developers.

## 🚀 Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4.
- **Backend/API**: Custom Server Actions & Route Handlers with JWT-based Auth (`jose`).
- **Database**: PostgreSQL (Raw client for performance).
- **Storage**: Minio (S3-compatible) for secure document storage.
- **PWA**: `@ducanh2912/next-pwa` for offline capabilities; `dexie` for local sync.
- **Infrastructure**: Vercel (Hosting), GitHub Actions (CI/CD).

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20+
- **Database**: PostgreSQL Instance
- **Storage**: Minio or S3-compatible service
- **Communications**: Termii (SMS) and Resend (Email) accounts

### Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env.local` file based on the references in `src/lib/auth/session.ts`.

3. **Database Setup**:
   ```bash
   # Initialize the schema
   psql -f db/schema.sql
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```text
├── db/                 # Database schema and migrations
├── docs/               # Technical and operational documentation
│   ├── architecture/   # System design (v5.0)
│   ├── operations/     # Runbooks and procedures
│   └── testing/        # Test strategies
├── public/             # Static assets and PWA manifest
├── scripts/            # DevOps and maintenance utilities
├── src/                # Next.js application source
│   ├── app/           # App router (RBAC protected)
│   ├── components/    # Atomic React components
│   ├── lib/           # Services, repositories, and auth logic
│   └── providers/     # React context providers
└── tests/              # Comprehensive test suites
    ├── e2e/           # Playwright E2E tests
    └── unit/          # Vitest unit tests
```

## 🛠️ Key Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run lint             # Check code quality

# Testing
npm run test              # Run unit tests (Vitest)
npm run test:e2e         # Run full E2E suite (Playwright)
npm run test:e2e:staff   # Run staff-specific E2E tests
npm run test:setup       # Seed database for E2E testing
```

## 📚 Documentation

Detailed documentation is available in the [`docs/`](docs/) directory and the core [PRD.md](PRD.md):

- **[Product Requirements (v5.0)](PRD.md)** - The primary source of truth.
- **[Architecture Overview](docs/architecture/SYSTEM_ARCHITECTURE.md)** - System design.
- **[E2E Testing Guide](tests/e2e/README.md)** - Detailed testing architecture.
- **[Operations Runbook](docs/Operational_Runbook.md)** - Maintenance and support procedures.

## 🧪 Testing Strategy

Acrely uses a dual-layered testing approach:
1. **Unit/Integration**: Powered by **Vitest**, focusing on core business services and utility logic.
2. **End-to-End (E2E)**: Powered by **Playwright**, covering role-based access control (RBAC), offline sync, and critical financial flows.

## 🚀 Deployment

The platform is optimized for **Vercel** deployment with a managed **PostgreSQL** backend. 

## 📄 License

Private Intellectual Property. All Rights Reserved.
