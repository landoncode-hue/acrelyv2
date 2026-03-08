# Module 1: Authentication & Sessions - Deployment Checklist

## Pre-Deployment Steps

### 1. Environment Variables Configuration

#### Development (.env.local)
```bash
# Verify these are set correctly
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email configuration
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=Acrely <noreply@pinnaclegroups.ng>

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_BASE_URL=http://localhost:3000
```

#### Production (Vercel/Environment)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Set to production Supabase URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Set to production anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - **CRITICAL**: Set securely (full DB access)
- [ ] `RESEND_API_KEY` - Set to production Resend API key
- [ ] `RESEND_FROM_EMAIL` - Set to `Acrely <noreply@pinnaclegroups.ng>`
- [ ] `NEXT_PUBLIC_APP_URL` - Set to `https://acrely.pinnaclegroups.ng`
- [ ] `APP_BASE_URL` - Set to `https://acrely.pinnaclegroups.ng`
- [ ] `TERMII_API_KEY` - Set for SMS functionality
- [ ] `TERMII_SENDER_ID` - Set to `Acrely`

---

## DNS Configuration (CRITICAL)

### Domain: pinnaclegroups.ng

#### 1. SPF Record
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600
```

#### 2. DKIM Record
**Note**: Get this from Resend dashboard after domain verification

```
Type: TXT
Name: resend._domainkey
Value: [Provided by Resend after domain verification]
TTL: 3600
```

#### 3. DMARC Record
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@pinnaclegroups.ng
TTL: 3600
```

#### Verification Steps
- [ ] Add SPF record to DNS
- [ ] Verify domain in Resend dashboard
- [ ] Add DKIM record provided by Resend
- [ ] Add DMARC record
- [ ] Wait for DNS propagation (up to 48 hours, usually 1-2 hours)
- [ ] Test email delivery using [mail-tester.com](https://www.mail-tester.com)
- [ ] Verify SPF/DKIM pass in email headers

---

## Database Migration

### Apply Migration to Production

#### Option 1: Supabase CLI
```bash
# Login to Supabase
supabase login

# Link to production project
supabase link --project-ref your-project-ref

# Apply migration
supabase db push
```

#### Option 2: Supabase Dashboard
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20251212120000_auth_improvements.sql`
3. Paste and run in SQL Editor
4. Verify no errors

### Verification
- [ ] `auth_attempts` table exists
- [ ] `profiles` table has new columns: `mfa_enabled`, `email_verified`, `metadata`, `last_login_at`, `last_login_ip`
- [ ] RLS policies updated (check with `SELECT * FROM pg_policies WHERE tablename = 'profiles'`)
- [ ] Indexes created (check with `SELECT * FROM pg_indexes WHERE tablename = 'auth_attempts'`)
- [ ] Helper functions exist: `cleanup_auth_attempts()`, `is_email_verified()`, `update_last_login()`

---

## Code Deployment

### Build Verification
```bash
# Test build locally
npm run build

# Check for errors
# Verify no TypeScript errors
# Verify no missing dependencies
```

### Deploy to Vercel
```bash
# If using Vercel CLI
vercel --prod

# Or push to main branch for automatic deployment
git push origin main
```

### Post-Deployment Checks
- [ ] Application loads without errors
- [ ] Login page accessible
- [ ] Environment variables loaded correctly (check Vercel dashboard)
- [ ] No console errors in browser

---

## Functional Testing

### 1. Staff Invitation Flow
- [ ] Login as sysadmin
- [ ] Navigate to Staff Management
- [ ] Click "Invite Staff Member"
- [ ] Fill form with test email, name, role
- [ ] Submit invitation
- [ ] Verify success message
- [ ] Check email inbox for invitation from `noreply@pinnaclegroups.ng`
- [ ] Verify email headers show SPF/DKIM pass
- [ ] Check `communication_logs` table for email record
- [ ] Check `profiles` table for created profile
- [ ] Check `audit_logs` for `STAFF_INVITED` event

### 2. Login with Rate Limiting
- [ ] Navigate to login page
- [ ] Enter valid email but wrong password
- [ ] Submit 5 times
- [ ] Verify lockout message appears after 5th attempt
- [ ] Verify countdown timer shows
- [ ] Verify login button disabled
- [ ] Check `auth_attempts` table for record
- [ ] Wait for lockout to expire (or adjust time in code)
- [ ] Verify login works after lockout period
- [ ] Login with correct credentials
- [ ] Verify `auth_attempts` record deleted

### 3. Session Management
- [ ] Login to application
- [ ] Open browser DevTools → Application → Cookies
- [ ] Verify cookies with `HttpOnly` flag
- [ ] Verify `Secure` flag (in production)
- [ ] Verify `SameSite=lax`
- [ ] Navigate to protected route
- [ ] Verify access granted
- [ ] Manually delete cookies
- [ ] Refresh page
- [ ] Verify redirect to login

### 4. Role-Based Access Control
- [ ] Login as customer
- [ ] Verify redirect to `/portal`
- [ ] Try to access `/dashboard/staff` in URL
- [ ] Verify redirect to `/portal` or `/unauthorized`
- [ ] Logout
- [ ] Login as frontdesk
- [ ] Verify redirect to `/dashboard`
- [ ] Try to access `/dashboard/staff`
- [ ] Verify redirect to `/unauthorized`
- [ ] Logout
- [ ] Login as sysadmin
- [ ] Verify access to all routes including `/dashboard/staff`

### 5. Email Delivery
- [ ] Trigger staff invitation
- [ ] Check email inbox
- [ ] Verify "From" shows `Acrely <noreply@pinnaclegroups.ng>`
- [ ] Verify email content is branded
- [ ] Click invitation link
- [ ] Verify redirect to signup completion page
- [ ] Use [mail-tester.com](https://www.mail-tester.com) to verify SPF/DKIM
- [ ] Aim for score 8/10 or higher

---

## Monitoring & Alerts

### Setup Monitoring
- [ ] Configure error tracking (Sentry, LogRocket, etc.)
- [ ] Set up alerts for failed email sends
- [ ] Monitor `auth_attempts` table for suspicious activity
- [ ] Set up alerts for high rate of failed logins
- [ ] Monitor `audit_logs` for security events

### Metrics to Track
- Login success rate
- Failed login attempts per hour
- Email delivery rate
- Staff invitation completion rate
- Session duration
- Rate limit triggers per day

---

## Rollback Plan

If critical issues arise:

### 1. Email Issues
```bash
# Temporarily revert to previous email
# In Vercel dashboard, update:
RESEND_FROM_EMAIL=Acrely <no-reply@acrely.com.ng>
```

### 2. Session Issues
- Clear all user sessions via Supabase dashboard
- Users will need to re-login
- No data loss

### 3. Rate Limiting Issues
- Disable rate limiting by commenting out check in login handler
- Or increase limits temporarily:
  ```sql
  UPDATE auth_attempts SET locked_until = NULL;
  ```

### 4. Database Rollback
```sql
-- Only if absolutely necessary
DROP TABLE IF EXISTS auth_attempts;
ALTER TABLE profiles DROP COLUMN IF EXISTS mfa_enabled;
ALTER TABLE profiles DROP COLUMN IF EXISTS email_verified;
ALTER TABLE profiles DROP COLUMN IF EXISTS metadata;
ALTER TABLE profiles DROP COLUMN IF EXISTS last_login_at;
ALTER TABLE profiles DROP COLUMN IF EXISTS last_login_ip;
```

---

## Post-Deployment Communication

### Notify Users
**Email to all staff:**
```
Subject: System Update: Enhanced Security & Login

Hi team,

We've deployed important security improvements to Acrely:

1. You'll be logged out once and need to sign in again
2. After 5 failed login attempts, accounts are temporarily locked for 10 minutes
3. If you forget your password, use the "Forgot Password" link
4. All emails now come from noreply@pinnaclegroups.ng

If you have any issues logging in, please contact IT support.

Thank you,
Acrely Team
```

### Support Team Briefing
- Inform support team about new rate limiting policy
- Provide instructions for unlocking accounts if needed
- Share password reset process
- Provide escalation path for login issues

---

## Success Criteria Checklist

- [ ] All environment variables set in production
- [ ] DNS records configured and verified
- [ ] Database migration applied successfully
- [ ] Application deployed without errors
- [ ] Staff invitation flow works end-to-end
- [ ] Emails sent from `noreply@pinnaclegroups.ng`
- [ ] SPF/DKIM pass verification
- [ ] Rate limiting enforces 5 attempts per 10 minutes
- [ ] Session cookies are httpOnly and secure
- [ ] Role-based routing works correctly
- [ ] Audit logs capture all auth events
- [ ] No console errors in production
- [ ] Email delivery rate > 95%
- [ ] Login success rate > 90%
- [ ] Users notified of changes
- [ ] Support team briefed

---

## Maintenance

### Weekly Tasks
- [ ] Review `audit_logs` for suspicious activity
- [ ] Check `auth_attempts` for patterns
- [ ] Monitor email delivery rates
- [ ] Review failed login reports

### Monthly Tasks
- [ ] Run cleanup function: `SELECT cleanup_auth_attempts();`
- [ ] Review and update password policy if needed
- [ ] Audit staff access levels
- [ ] Review and rotate API keys if needed

### Quarterly Tasks
- [ ] Security audit of authentication system
- [ ] Review and update rate limiting thresholds
- [ ] Test disaster recovery procedures
- [ ] Update documentation

---

## Support Contacts

- **DNS Issues**: Contact domain registrar support
- **Email Delivery**: Resend support (support@resend.com)
- **Supabase Issues**: Supabase support
- **Application Issues**: Development team

---

## Completion Sign-Off

**Deployed by**: _______________  
**Date**: _______________  
**Verified by**: _______________  
**Date**: _______________  

**Notes**:
