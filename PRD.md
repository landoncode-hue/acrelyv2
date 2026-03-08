### **Product Requirements Document: Acrely Real Estate Management Platform**  
**Version:** 5.0 (The Unified Truth)  
**Last Updated:** March 2026  

---

### **1. Executive Summary**
Acrely is a secure, offline-first, multi-role SaaS platform that automates the entire land and apartment sales lifecycle for real estate developers. Built on a performance-optimized stack (Next.js 16, PostgreSQL, Custom JWT Auth, and Minio), it provides a resilient infrastructure for emerging markets. Acrely solves critical industry pain points: double-bookings, lost leads from poor connectivity, manual commission calculations, and non-compliant data handling. This document serves as the definitive specification for the platform's v2 implementation.

---

### **2. Goals & Non-Goals**

#### **Goals**
- **Automate the Full Sales Cycle:** From lead capture to final payment, supporting whole plots, dynamic half-plots (`1A`/`1B`), and 72-hour reservations.
- **Enable True Offline Sales:** Field agents can register leads and allocate plots with zero internet; actions sync seamlessly when online via a PWA.
- **Guarantee Financial Integrity:** Idempotent payments, auto-commission calculations, immutable audit trails, and high-precision financial tracking using PostgreSQL’s `BIGINT` type (storing values in kobo/cents).
- **Enforce Granular Security:** Six distinct roles governed by a robust Middleware Routing & RBAC system that ensures zero-trust access control across all operations.
- **Ensure Global Compliance:** GDPR/CCPA-ready data anonymization and PCI-DSS alignment via client-side tokenization (no card data enters Acrely servers).

#### **Non-Goals**
- Direct payment processing or storage of any financial instrument data (e.g., card numbers).
- Customer-to-Customer (C2C) secondary market trading; this is a B2B primary sales tool.
- Public-facing e-commerce storefront; this is a secure, internal/portal tool for developers and their verified clients.

---

### **3. Target Personas & Comprehensive User Stories**

#### **System Admin (sysadmin)**
*   **SA-01:** As a System Admin, I want to invite new users and assign them a specific role (`sysadmin`, `ceo`, `md`, `frontdesk`, `agent`, `customer`) so that I can control their access from day one.
*   **SA-02:** As a System Admin, I want to enforce Multi-Factor Authentication (MFA) for all `sysadmin` and `ceo` accounts to protect our most privileged access.
*   **SA-03:** As a System Admin, I want to be able to rotate or revoke API keys (for Resend, Termii) from a central dashboard to maintain security without developer intervention.

#### **CEO**
*   **CEO-01:** As a CEO, I want to see a real-time executive dashboard showing total revenue, number of plots/apartments sold, and top-performing agents to make strategic decisions.
*   **CEO-02:** As a CEO, I want to be able to approve or reject large commission payouts to agents to have financial oversight.
*   **CEO-03:** As a CEO, I want to be able to run an audit report that shows every change made to any plot, apartment, or payment in the last 30 days to ensure compliance.

#### **Managing Director (md)**
*   **MD-01:** As a Managing Director, I want to define a new estate by setting its name, location, base price, and grid dimensions (rows and columns) so our inventory is accurately represented.
*   **MD-02:** As a Managing Director, I want to be able to manually override a Frontdesk officer’s action, such as canceling a reservation or refunding a payment, to handle exceptional cases.
*   **MD-03:** As a Managing Director, I want to generate and download a legal deed document for any allocated plot to provide to the customer or legal team.

#### **Frontdesk**
*   **FD-01:** As a Frontdesk officer, I want to be able to reserve an available plot for a lead for 72 hours so they have time to decide without losing the plot.
*   **FD-02:** As a Frontdesk officer, when allocating a whole plot, I want to choose between selling it as a full plot or splitting it into two halves (`XA`, `XB`) to accommodate the customer's request on the spot.
*   **FD-03:** As a Frontdesk officer, I want to record a customer's payment by entering the amount and selecting the payment method, and have the system automatically apply it to their correct installment plan.
*   **FD-04:** As a Frontdesk officer working at an estate with no internet, I want to be able to register a new lead and allocate a plot to them using my mobile phone, and have these actions sync to the main system as soon as I regain connectivity.

#### **Agent**
*   **AGT-01:** As an Agent, I want to register a new lead directly from my mobile phone by entering their name and phone number, and have that lead automatically linked to my profile so I get commission credit.
*   **AGT-02:** As an Agent, I want a personal dashboard that shows me a list of all my leads, their current status (Prospect, Customer, Allocated), and the commission I’ve earned from each.
*   **AGT-03:** As an Agent, I want to be able to share a live, read-only view of the estate’s plot grid with my client from my phone so they can see what’s available.
*   **AGT-04:** As an Agent, if I’m in a remote area with no signal, I want to be able to register a lead on my phone and have it saved locally, with a clear indicator that it will sync once I’m back online.

#### **Customer**
*   **CUST-01:** As a Customer, after signing up, I want to log in and see a dashboard that lists all the plots I own (e.g., "Plot 5A") with their full details (dimensions, estate name).
*   **CUST-02:** As a Customer, I want to see a detailed, visual payment plan for my plot that shows every installment amount, its due date, its status (Paid, Pending, Overdue), and a progress bar of my total payments.
*   **CUST-03:** As a Customer, I want to be able to instantly download official documents related to my purchase, such as my payment receipts and my plot deed, from my dashboard.
*   **CUST-04:** As a Customer, I want to receive an automated SMS reminder three days before my installment is due so I don’t miss a payment.
*   **CUST-05:** As a Customer, if I ever request to delete my account, I want to be confident that all my personal information (name, email, phone number) will be permanently anonymized in the system while keeping the financial transaction history intact for legal reasons.

---

### **4. Detailed Functional Specifications**

#### **4.1. Dynamic Plot Subdivision Workflow**
- **Trigger:** A staff member selects "Buy Half Plot" for a whole plot (e.g., `1`).
- **Atomic Database Transaction:**
    1.  **Update Parent:** Set the status of the parent plot (`plot_number: '1'`) to `split`.
    2.  **Create Children:** Insert two new records into the `plots` table:
        - `plot_number: '1A'`, `dimensions: '50x100'`, `status: 'allocated'`
        - `plot_number: '1B'`, `dimensions: '50x100'`, `status: 'available'`
        - Both children inherit the parent's `grid_x` and `grid_y` coordinates.
    3.  **Create Allocation:** Link the customer to the newly created `1A` plot.
    4.  **Log Audit:** Record an entry in `audit_logs` with `action: 'plot_split'`.
- **UI Behavior:** The interactive plot grid visually splits the single cell at `(grid_x, grid_y)` into a left half (`1A`) and a right half (`1B`). `1A` is displayed as **Allocated** (red), and `1B` as **Available** (green).

#### **4.2. Offline-First Mobile Experience (PWA)**
- **Local Storage:** The frontend uses Dexie.js (an IndexedDB wrapper) to create a local database with tables for `plots`, `customers`, and a `pendingActions` queue.
- **Offline Action Flow:**
    1.  An agent registers a lead while offline.
    2.  The data is saved to the local `customers` table.
    3.  A new entry is added to the `pendingActions` queue: `{ actionType: 'CREATE_CUSTOMER', payload: { ... } }`.
- **Background Sync:**
    - On reconnect (via the `online` event), the app processes the `pendingActions` queue.
    - Each action is replayed by calling the existing, secure Server Actions.
    - On success, the local record is updated with the server-generated ID, and the action is removed from the queue.
    - On failure (e.g., a plot was sold by someone else), the action is flagged in the UI for manual review.
- **Conflict Resolution:** The system uses a "Server Wins" policy. The database state is the source of truth.

#### **4.3. Financial Engine & Compliance**
- **Idempotency:** Every payment creation request must include a client-generated `idempotency_key` (e.g., `pay_1707923400_randomstring`). The system checks for an existing payment with this key before creating a new one, preventing duplicate charges.
- **Commission Management:** When a plot/apartment is allocated, the system calculates the agent's commission. This value is logged in a `commissions` table, which requires MD/CEO approval before being marked as paid.
- **Payment Precision:** All financial amounts are stored as `BIGINT` (representing the smallest currency unit, e.g., Kobo for NGN) to ensure absolute precision and avoid floating-point errors.
- **PCI-DSS Alignment:** Acrely is out of scope for PCI compliance. All payment processing is delegated to Stripe or Paystack via their client-side tokenization.

#### **4.4. Communication & Marketing**
- **SMS (Termii):** Used for OTPs, payment reminders, and reservation expiry.
- **Email (Resend):** Used for welcome packets, receipts, and legal documents.
- **Campaigns:** The system supports scheduled marketing campaigns and templates for mass notification of leads and customers.

#### **4.5. Apartment & Asset Management**
- **Asset Types:** Supports both Land (Plots) and Built Assets (Apartments/Units).
- **Viewing Appointments:** Customers can book site visits directly from the portal, which are assigned to agents or frontdesk officers.
- **Direct Sales:** Unlike plots which may require subdivision, apartments are sold as atomic units with specific floor plans.

#### **4.6. Support & KYC Workflow**
- **KYC Verification:** Customers must upload government-issued ID and proof of address. Staff (Frontdesk/MD) review and "Verify" these documents before final deed generation.
- **Support Tickets:** A built-in ticketing system allows customers to log issues (e.g., payment discrepancies, document requests) which are tracked with status (`Open`, `In-Progress`, `Resolved`).

#### **4.7. Staff Dashboard & Reports**
- **Unified Inventory:** A single view for all land and apartment stocks.
- **Financial Reporting:** Monthly revenue reports grouped by estate and payment method.
- **Audit Logs:** Every mutation (Insert/Update/Delete) is captured in `audit_logs` including `old_values` and `new_values`.

---

### **5. Technical Architecture**

#### **5.1. Technology Stack**
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Radix UI.
- **Backend/API**: Custom Server Actions & Route Handlers with `jose` for JWT management.
- **Database**: PostgreSQL (managed), accessed via a high-performance raw client.
- **Storage**: Minio (S3-compatible) for secure document storage (KYC, Deeds).
- **Cache/PWA**: `@ducanh2912/next-pwa` for service workers; `dexie` for local IndexedDB sync.
- **Infrastructure**: Vercel (Hosting), GitHub Actions (CI/CD).

#### **5.2. Core Data Model (Principal Tables)**

| **Table: `users`** |
|---|
| `id` (UUID, PK) |
| `email` (TEXT, UNIQUE) |
| `password_hash` (TEXT) |
| `full_name` (TEXT) |
| `role` (role_enum: `sysadmin`, `ceo`, `md`, `frontdesk`, `agent`, `customer`) |
| `is_staff` (BOOLEAN) |

| **Table: `estates`** |
|---|
| `id` (UUID, PK) |
| `name` (TEXT) |
| `location` (TEXT) |
| `base_price` (BIGINT) |
| `type` (TEXT: `land`, `apartment`) |

| **Table: `plots`** |
|---|
| `id` (UUID, PK) |
| `estate_id` (UUID, FK) |
| `plot_number` (TEXT) |
| `status` (plot_status: `available`, `reserved`, `allocated`, `split`) |
| `price_override` (BIGINT) |

| **Table: `allocations`** |
|---|
| `id` (UUID, PK) |
| `customer_id` (UUID, FK) |
| `plot_id` (UUID, FK) |
| `total_amount` (BIGINT) |
| `status` (allocation_status: `pending`, `active`, `completed`, `cancelled`) |

| **Table: `payments`** |
|---|
| `id` (UUID, PK) |
| `allocation_id` (UUID, FK) |
| `amount` (BIGINT) |
| `idempotency_key` (TEXT, UNIQUE) |
| `status` (payment_status: `pending`, `completed`, `failed`) |

| **Table: `commissions`** |
|---|
| `id` (UUID, PK) |
| `agent_id` (UUID, FK) |
| `allocation_id` (UUID, FK) |
| `amount` (BIGINT) |
| `status` (commission_status: `earned`, `approved`, `paid`) |

| **Table: `audit_logs`** |
|---|
| `id` (UUID, PK) |
| `action` (TEXT) |
| `table_name` (TEXT) |
| `record_id` (UUID) |
| `performed_by` (UUID, FK) |
| `old_values` (JSONB) |
| `new_values` (JSONB) |

#### **5.3. Security & Access Control**
- **Authentication**: Custom JWT-based session management using `httpOnly` secure cookies.
- **Authorization (RBAC)**: Enforced at the **Middleware level** and **Service layer**.
    - **Middleware**: Intercepts requests and redirects based on the `role` and `is_staff` properties in the decrypted JWT.
    - **Service Layer**: Functions explicitly check `hasRole()` before executing sensitive logic.
- **Data Integrity**: Foreign key constraints and `CHECK` constraints (e.g., roles check) are enforced at the database level.
- **Auditability**: A global `audit_logs` table records every critical state change across the system.

#### **5.4. Deployment & CI/CD**
- **Frontend/API**: Deployed to Vercel with automatic builds from the `main` branch.
- **Database**: PostgreSQL migrations are managed via SQL scripts and applied through a secure CI pipeline.
- **Environment Variables**: Managed via Vercel Project Settings for the frontend/API and secure environment configuration for the database.

---

### **6. Non-Functional Requirements**

| **Category** | **Requirement** |
|--------------|-----------------|
| **Security** | Middleware RBAC enabled on all routes; PII anonymizable on request; MFA for admin roles; annual third-party penetration test. |
| **Performance** | Plot grid with 500 plots loads in < 1 second; payment processing completes in < 2 seconds; API p95 latency < 500ms. |
| **Reliability** | 99.9% uptime for core APIs; >98% success rate for offline-to-online sync; nightly backups with 7-day retention. |
| **Compliance** | Full GDPR/CCPA compliance for data subject requests; audit logs retained for a minimum of 7 years; PCI-DSS out of scope. |
| **Scalability** | Architecture supports up to 10,000 concurrent users and 1 million+ plot records without modification. |

---

### **7. Monitoring, Operations & Client Handover**

#### **7.1. Enterprise-Grade Monitoring**
- **Health Endpoint:** A public endpoint `/api/health` returns the status of the database, email service, and SMS service. This is monitored by UptimeRobot with 5-minute checks.
- **Critical Alerts:**
    - **API Failures:** >1% error rate on critical endpoints (auth, payment) triggers a Slack alert.
    - **Payment Failures:** >2% failure rate triggers an SMS to the finance manager (MD).
    - **Authorization Failures:** Repeated blocked access attempts trigger an email to the Security Lead (sysadmin).
- **Business Metrics:** Custom dashboards track the offline sync success rate and commission discrepancy rates to ensure operational health.

#### **7.2. Operational Deliverables for Client**
Before handover, the following three documents must be provided:
1.  **Security Whitepaper:** A detailed document explaining the data flow, RBAC logic for each role, and the PCI-DSS scope statement.
2.  **Operational Runbook:** A step-by-step guide for common tasks: how to respond to a data deletion request, how to rotate an API key, and how to debug a failed payment webhook.
3.  **Data Migration Script:** A tested script (Python/Node.js) that can import legacy customer and plot data from a CSV into the Acrely schema, including validation and transformation logic.

#### **7.3. Go/No-Go Checklist for Final Handover**
The system is ready for production handover to the client only when **all** of the following are complete:
- [ ] **UAT Sign-off:** The client has tested all user stories in a staging environment and provided formal sign-off.
- [ ] **RBAC Test Coverage:** 100% of RBAC permissions are covered by automated Playwright and Vitest tests.
- [ ] **Offline Validation:** The PWA workflow has been validated in a simulated low-connectivity environment (e.g., using Chrome DevTools).
- [ ] **Compliance Docs:** The Security Whitepaper, Operational Runbook, and Data Migration Script are finalized and delivered.
- [ ] **Monitoring Live:** All critical alerts and the health endpoint are active and reporting to the correct channels.

---

This V5 PRD is the definitive, complete, and absolute blueprint for the Acrely platform. It contains every single detail, nuance, and requirement necessary for a development team to maintain and scale a perfect, production-ready system.