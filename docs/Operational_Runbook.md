# Operational Runbook: Acrely Real Estate

**Version:** 4.0
**Date:** March 2026

This runbook acts as the primary operational blueprint for the management, troubleshooting, and continuous compliant operation of the Acrely platform.

---

## 1. Routine Operations

### 1.1 Managing Environments & Configuration
**Environment Variables (Vercel)**
- Critical keys (Supabase URLs, Resend, Termii) must be rotated periodically or if suspected leaked.
- Navigate to the **Vercel Project Settings > Environment Variables** to update string values.
- **Post-Action required:** Once saved, trigger a `Redeploy` on Vercel to load the new arguments into the edge environment.

**Edge Functions (Supabase)**
- If a Supabase edge function fails, it must be debugged via the **Supabase Dashboard > Edge Functions > Logs**. 
- Common failure vectors typically involve invalid payloads sent from the frontend or an expired third-party API key inside the Supabase Vault.

### 1.2 Agent Payout Approvals (CEO)
Commissions are calculated automatically upon allocation, but they remain "pending" to prevent automated fraud.
-   **Action:** The CEO must periodically navigate to the `CEO Dashboard -> Payouts` screen.
-   **Action:** Click "Approve" on validated rows. The system records the transition to `paid` and notes the approver UUID in the audit tables.

---

## 2. Emergency Response Procedures

### 2.1 Handling RLS Violations
**Trigger:** You receive an automated alert indicating an RLS violation was blocked.
**Meaning:** An authorized session attempted to read or mutate rows outside of its policy boundaries. This could be a malicious actor inspecting APIs or a UI bug.
**Immediate Actions:**
1. Check the Supabase PostgreSQL logs to identify the querying UUID.
2. Cross-reference the UUID in the `profiles` table to find the user's role and email.
3. If suspicious, immediately revoke their session and set their authentication state to disabled in the Supabase Auth Dashboard.
4. Notify the engineering team with the extracted attempted query strings.

### 2.2 Payment Webhook Failures
**Trigger:** You notice payment records stalled in a `processing` state long after a customer checkout.
**Meaning:** The automated server hook from Stripe/Paystack to your Edge Functions failed (due to network drops or function timeouts).
**Immediate Actions:**
1. Check the provider (Stripe/Paystack) Dashboard webhook logs for delivery failures or 500 status codes.
2. Manually resend the stalled webhook payload from the provider's dashboard.
3. The server action is idempotent. If it successfully fires, it will simply process and skip duplicate updates.

### 2.3 Investigating Offline Sync Failures
**Trigger:** An agent complains that the leads they collected offline have a red "Failed to Sync" tag on their mobile device.
**Meaning:** The system prevented an invalid sync upon reconnection (e.g., the plot they tried to allocate was bought by another agent while they were offline).
**Immediate Actions:**
1. Instruct the agent to review the `Pending Actions` queue on their device.
2. The UI will specify the conflict (e.g., "Plot 5A already allocated").
3. The agent must manually clear the failed action and coordinate a new plot with the customer before re-syncing.

---

## 3. Compliance Operations

### 3.1 Handling "Right to be Forgotten" (GDPR/CCPA) Data Deletion Requests
**Trigger:** A verified customer requests complete deletion of their PII from your records.
A simple row drop (`DELETE FROM profiles`) is illegal because it will break foreign-key constraints on legally binding financial ledgers.
**Action:** Connect directly via Supabase SQL Editor as `postgres` admin.
```sql
-- Replace target UUID below
UPDATE profiles 
SET 
  full_name = 'ANONYMIZED_USER_' || id,
  email = id || '@anonymized.acrely.local' 
WHERE id = 'insert-uuid-here';
```
This safely breaks the link between the person and the transaction, while satisfying all structural database requirements.

### 3.2 Rotating External API Keys (Termii / Resend)
**Action:**
1. Generate the newly provisioned key from the Provider (e.g. Resend dashboard).
2. Update the environment variables via the Vercel Dashboard.
3. Update the corresponding variable in the Supabase Vault (if accessed by edge functions).
4. Run a test email/SMS to ensure connectivity is confirmed.
5. Invalidate and delete the old key inside the Provider dashboard to minimize exposure.
