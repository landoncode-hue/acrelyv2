# Resend Email Setup Guide for Pinnaclegroups.ng

This guide explains how to configure Resend for your specific infrastructure setup.

## 🏗 Infrastructure Overview

*   **Root Domain (`pinnaclegroups.ng`)**: Hosted on **Hostinger**. This is where your DNS records live.
*   **Subdomain (`acrely.pinnaclegroups.ng`)**: Pointed to **Vercel** (for the web app).
*   **Email Service**: **Resend**.

---

## 🛑 The Golden Rule of Email
**You can ONLY send emails from the domain (or subdomain) that you verify.**

*   If you verify `acrely.pinnaclegroups.ng`, you must send as `...@acrely.pinnaclegroups.ng`.
*   If you verify `pinnaclegroups.ng`, you can send as `...@pinnaclegroups.ng`.

---

## 🚀 Scenario A: Sending as `@acrely.pinnaclegroups.ng` (Recommended for separate app identity)
**Sender Address:** `no-reply@acrely.pinnaclegroups.ng`

This keeps your app emails separate from your corporate emails.

1.  **Go to Resend:** Add Domain `acrely.pinnaclegroups.ng`.
2.  **Get Records:** Resend will give you `DKIM` (CNAME), `SPF` (TXT), and `DMARC` (TXT) records.
3.  **Go to Hostinger (DNS Zone Editor):**
    *   Since Hostinger manages the root `pinnaclegroups.ng`, you add sub-records there.
    *   **Example MX:** Name: `acrely` | Value: `feedback-smtp.us-east-1.amazonses.com`
    *   **Example TXT (SPF):** Name: `acrely` | Value: `v=spf1 include:amazonses.com ~all`
    *   **Example CNAME (DKIM):** Name: `resend._domainkey.acrely` | Value: `...`
    *   *Note: In Hostinger, for a subdomain, you usually put the subdomain (e.g., `acrely`) in the "Name" or "Host" field. Do NOT type the full `acrely.pinnaclegroups.ng` in the name field, as Hostinger often appends the root domain automatically.*
4.  **Verify:** Click verify in Resend.

---

## 🏢 Scenario B: Sending as `@pinnaclegroups.ng` (Corporate Identity)
**Sender Address:** `no-reply@pinnaclegroups.ng`

Use this if you want emails to look like they come from the main company.

1.  **Go to Resend:** Add Domain `pinnaclegroups.ng`.
2.  **Get Records:** Resend will give you specific records for the root domain.
3.  **Go to Hostinger (DNS Zone Editor):**
    *   **Warning:** You likely already have MX records for your corporate email (e.g., Google Workspace, Outlook, or Hostinger Mail). **DO NOT DELETE THEM.**
    *   **MX Records:** Resend allows you to skip the MX record if you only want to *send* emails (not receive). Or, if you need to receive, you can't have two sets of MX records easily. **Recommendation:** Do NOT add Resend's MX record for the root domain if you already use it for business email. Just add the **DKIM** and **SPF** records.
    *   **TXT (SPF):** You likely already have an SPF record (e.g., `v=spf1 include:spf.titan.email ~all`). **Do NOT create a second TXT record.** Instead, edit the existing one to include Resend:
        *   *Old:* `v=spf1 include:spf.titan.email ~all`
        *   *New:* `v=spf1 include:spf.titan.email include:amazonses.com ~all`
    *   **CNAME (DKIM):** Add the CNAME records provided by Resend. These are unique matching keys and won't conflict with your existing email.
4.  **Verify:** Click verify in Resend.

---

## ⚡ Step 3: Configure Supabase (Once Verified)

Once the domain is verified (green status in Resend), update your Supabase secrets:

1.  **Set the Sender:**
    ```bash
    # For Scenario A
    npx supabase secrets set RESEND_FROM_EMAIL="Acrely <no-reply@acrely.pinnaclegroups.ng>"

    # For Scenario B (Only after Scenario B verification is complete!)
    npx supabase secrets set RESEND_FROM_EMAIL="Acrely <no-reply@pinnaclegroups.ng>"
    ```

2.  **Redeploy Functions:**
    ```bash
    npx supabase functions deploy send-broadcast
    npx supabase functions deploy send-message
    ```
