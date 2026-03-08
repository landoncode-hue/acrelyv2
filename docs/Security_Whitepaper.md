# Security Whitepaper: Acrely Real Estate Management Platform

**Version:** 4.0
**Date:** March 2026

## 1. Executive Summary

Acrely provides a multi-role, offline-first Real Estate Management Platform. Security is a foundational pillar of its architecture. This whitepaper outlines the security guarantees, compliance positioning, and architectural decisions made to secure sensitive B2B and consumer data.

## 2. Shared Responsibility Model

Acrely operates on a shared responsibility model leveraging Supabase and Vercel infrastructure.

-   **Hosting Providers (Vercel & Supabase):** Responsible for the physical security of servers, network infrastructure security, and underlying operating system updates.
-   **Acrely (Platform layer):** Responsible for application-level security, Row-Level Security (RLS) enforcement, API endpoint security, and logic implementation.
-   **Client (The Developer):** Responsible for securely managing administrative access (e.g., MFA), granting appropriate roles to staff, and managing third-party API keys securely inside the provided vault.

## 3. Data Architecture and Security Posture

### 3.1. Row-Level Security (RLS) as the Source of Truth
Historically, application security has relied on the API layer enforcing access controls. Acrely adopts a Zero-Trust Database model. All access controls are implemented at the Database layer using PostgreSQL Row-Level Security (RLS). 

Even if the API layer is compromised, underlying database queries evaluate the executing user's session claims (role, UUID) against strict policies before data is returned or mutated.

### 3.2. Role Hierarchy
Access to data is restricted across six hierarchical roles defined in the `profiles` table:
-   **System Admin:** Full administrative control. Requires MFA.
-   **CEO:** Broad read access for analytics and payout approvals. Requires MFA.
-   **Manager:** Can manage estate inventory, override specific agent actions, and generate deeds.
-   **Frontdesk:** Can allocate plots, record standard payments, and reserve plots dynamically.
-   **Agent:** Limited to viewing available/reserved plots and managing only their personally assigned leads.
-   **Customer:** Limited to viewing only their own purchased plots, payment histories, and profile.

## 4. Financial Security & PCI-DSS Considerations

### 4.1. PCI-DSS Exemption Stance
Acrely guarantees that it is strictly **Out of Scope** for Payment Card Industry Data Security Standard (PCI-DSS) compliance. 
- No credit card primary account numbers (PAN), CVVs, or expiration dates are ever logged, sent to, or stored on Acrely servers.
- All payment processing logic is delegated client-side using authorized elements from payment gateways (e.g., Stripe, Paystack). The gateways handle tokenization natively.

### 4.2. Transaction Idempotency
To prevent accidental double-charges (especially relevant in offline-first synced environments), the payments architecture demands strictly enforced idempotency keys (`idempotency_key`) supplied by the client during payment attempts. The backend database uses strict `UNIQUE` constraints to enforce exactly-once processing.

## 5. Privacy Constraints & GDPR/CCPA Readiness

### 5.1. Data Anonymization Strategy
In compliance with "Right to be Forgotten" requests, Acrely provides a robust anonymization protocol:
-   Upon request, a customer profile's personally identifiable information (PII) like `full_name`, `email`, and phone numbers are stripped and replaced with deterministic anonymous hashes.
-   *Financial integrity is preserved:* The related historic `payments` and `allocations` records remain intact for taxation, auditing, and ledger continuity.

### 5.2. Audit Logging
Every mutation to critical tables (`estates`, `plots`, `allocations`, `payments`, `payouts`) generates an immutable entry in the `audit_logs` table. This log records:
1.  The specific action (e.g. `plot_split`).
2.  The UUID of the user who performed the action.
3.  Pre-mutation (`old_values`) and post-mutation (`new_values`) JSONB payloads.

These audit logs are preserved for standard compliance periods (7 years minimum configuration).

## 6. Offline-First PWA Security

Acrely enables field agents to capture leads and allocate plots while offline. 
- Local data is stored using Dexie.js (IndexedDB wrapper). 
- **Conflict Resolution (Server Wins):** Re-sync synchronization happens passively when connectivity is restored via server actions. The central PostgreSQL database evaluates these queued actions exactly as if they were live, executing RLS and duplication checks to prevent invalid offline actions from corrupting the master state.
