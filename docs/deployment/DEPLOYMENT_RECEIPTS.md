# Receipts Module - Deployment Guide

## Pre-Deployment Checklist

### ✅ Completed
- [x] Database migrations created
- [x] Edge function enhanced
- [x] UI components built
- [x] Email templates integrated
- [x] Payment flow integration complete
- [x] Test infrastructure created

### ⏳ Pending
- [ ] Database migrations applied
- [ ] Edge function deployed
- [ ] Storage bucket configured
- [ ] Manual QA testing
- [ ] Production deployment

---

## Deployment Steps

### 1. Apply Database Migrations

**Order matters!** Apply migrations in sequence:

```bash
# Migration 1: Create receipts table and functions
psql -h [HOST] -U postgres -d postgres -f supabase/migrations/20251214093000_receipts_module.sql

# Migration 2: Update payments table
psql -h [HOST] -U postgres -d postgres -f supabase/migrations/20251214093100_update_payments_for_receipts.sql
```

**Verify migrations:**
```sql
-- Check receipts table exists
SELECT * FROM receipts LIMIT 1;

-- Check receipt numbering function
SELECT generate_receipt_number();

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'receipts';
```

---

### 2. Configure Storage Bucket

**Create receipts bucket** (if not exists):

```bash
# Via Supabase Dashboard:
# Storage > Create Bucket > Name: "receipts" > Public: false
```

**Set storage policies:**

```sql
-- Allow staff to upload receipts
CREATE POLICY "Staff can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts' AND
  auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('sysadmin', 'ceo', 'md', 'frontdesk')
  )
);

-- Allow staff to read all receipts
CREATE POLICY "Staff can read all receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts' AND
  auth.uid() IN (
    SELECT id FROM profiles WHERE is_staff = true
  )
);

-- Allow customers to read their own receipts (via signed URLs)
-- Note: Customers will use signed URLs, so this is handled by the edge function
```

---

### 3. Deploy Edge Function

```bash
# Deploy generate-receipt function
supabase functions deploy generate-receipt

# Verify deployment
supabase functions list
```

**Set environment variables** (if not already set):

```bash
# In Supabase Dashboard > Edge Functions > generate-receipt > Settings
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=Pinnacle Builders <noreply@pinnaclegroups.ng>
```

---

### 4. Test Receipt Generation

**Test with a verified payment:**

```javascript
// In browser console or Postman
const { data, error } = await supabase.functions.invoke('generate-receipt', {
  body: {
    payment_id: 'YOUR_PAYMENT_ID',
    actor_user_id: 'YOUR_USER_ID',
    actor_role: 'sysadmin',
    send_email: false, // Set to true to test email
    regenerate: false
  }
});

console.log(data);
```

**Expected response:**
```json
{
  "success": true,
  "signedUrl": "https://...",
  "storagePath": "receipts/2025/PBHP-20251214-0001.pdf",
  "receiptNumber": "PBHP-20251214-0001",
  "receiptId": "uuid",
  "emailStatus": "skipped",
  "isRegeneration": false
}
```

---

### 5. Manual QA Testing

#### PDF Visual Verification

Download a generated receipt and verify:

- [ ] Company name: "PINNACLE BUILDERS HOMES AND PROPERTIES"
- [ ] Tagline: "Do Real Estate, The Pinnacle Way"
- [ ] Full address displayed correctly
- [ ] Receipt number format: PBHP-YYYYMMDD-XXXX
- [ ] Watermark stamp visible but non-obtrusive
- [ ] Footer: support@pinnaclegroups.ng
- [ ] Footer: "Powered by Acrely®"
- [ ] Customer information complete
- [ ] Property information complete
- [ ] Payment information complete
- [ ] Nigerian currency formatting (₦)
- [ ] All text readable and properly aligned

#### Functional Testing

- [ ] Record a payment with "Generate receipt" checked
- [ ] Verify receipt appears in success modal
- [ ] Download receipt successfully
- [ ] Verify receipt number is unique
- [ ] Test email delivery (if customer has email)
- [ ] Regenerate receipt (verify same number)
- [ ] Test customer portal download
- [ ] Verify signed URL expires after 7 days

#### RBAC Testing

Login as different roles and verify:

- [ ] **SysAdmin**: Can generate, regenerate, download all receipts
- [ ] **CEO**: Can generate, regenerate, download all receipts
- [ ] **MD**: Can generate, regenerate, download all receipts
- [ ] **Frontdesk**: Can generate, cannot regenerate
- [ ] **Customer**: Can only download their own receipts

#### Mobile Testing

- [ ] PDF readable on mobile devices
- [ ] Download works on mobile browsers
- [ ] Email displays correctly on mobile

---

### 6. Deploy Frontend

```bash
# Build and deploy Next.js app
npm run build
vercel --prod

# Or your deployment method
```

---

## Post-Deployment Verification

### Check Receipt Generation

```sql
-- View recent receipts
SELECT 
  r.receipt_number,
  r.amount,
  r.generated_at,
  c.full_name as customer_name,
  p.full_name as generated_by_name
FROM receipts r
JOIN customers c ON r.customer_id = c.id
JOIN profiles p ON r.generated_by = p.id
ORDER BY r.generated_at DESC
LIMIT 10;
```

### Check Receipt Numbering

```sql
-- Verify sequential numbering
SELECT receipt_number, generated_at
FROM receipts
WHERE receipt_number LIKE 'PBHP-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-%'
ORDER BY receipt_number;
```

### Check Storage

```sql
-- View storage usage
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  SUM(metadata->>'size')::bigint as total_bytes
FROM storage.objects
WHERE bucket_id = 'receipts'
GROUP BY bucket_id;
```

### Check Audit Logs

```sql
-- View receipt generation activity
SELECT 
  action_type,
  actor_role,
  changes->>'receipt_number' as receipt_number,
  created_at
FROM audit_logs
WHERE action_type IN ('RECEIPT_GENERATED', 'RECEIPT_REGENERATED')
ORDER BY created_at DESC
LIMIT 20;
```

---

## Troubleshooting

### Receipt Generation Fails

**Symptoms**: Error when generating receipt

**Checks**:
1. Verify payment has all required data (customer, allocation, plot, estate)
2. Check edge function logs in Supabase Dashboard
3. Verify storage bucket exists and is accessible
4. Check RESEND_API_KEY is set

**Solution**:
```sql
-- Check payment data completeness
SELECT 
  p.*,
  a.customer_id,
  a.plot_id,
  a.estate_id
FROM payments p
JOIN allocations a ON p.allocation_id = a.id
WHERE p.id = 'PAYMENT_ID';
```

### Email Not Sent

**Symptoms**: Receipt generated but email not received

**Checks**:
1. Verify customer email is valid
2. Check RESEND_API_KEY environment variable
3. Review edge function logs for email errors
4. Check spam folder

**Solution**:
- Resend email using receipt actions component
- Verify Resend API key is active
- Check Resend dashboard for delivery status

### Download Fails

**Symptoms**: "Failed to download receipt"

**Checks**:
1. Verify signed URL hasn't expired (7 days)
2. Check storage bucket permissions
3. Verify receipt file exists in storage

**Solution**:
```javascript
// Regenerate signed URL
const { data } = await supabase.storage
  .from('receipts')
  .createSignedUrl('receipts/2025/PBHP-20251214-0001.pdf', 604800);
```

### Duplicate Receipt Numbers

**Symptoms**: Unique constraint violation

**Checks**:
1. Check database function for race conditions
2. Verify transaction isolation level

**Solution**:
- The `generate_receipt_number()` function has retry logic
- If issue persists, check database logs
- May need to add database-level locking

---

## Monitoring

### Key Metrics to Track

1. **Receipt Generation Success Rate**
   ```sql
   SELECT 
     COUNT(*) FILTER (WHERE receipt_status = 'generated') * 100.0 / COUNT(*) as success_rate
   FROM payments
   WHERE created_at > NOW() - INTERVAL '7 days';
   ```

2. **Email Delivery Rate**
   ```sql
   SELECT 
     action_type,
     COUNT(*) as count
   FROM audit_logs
   WHERE action_type LIKE 'RECEIPT_%'
   AND created_at > NOW() - INTERVAL '7 days'
   GROUP BY action_type;
   ```

3. **Storage Usage**
   ```sql
   SELECT 
     COUNT(*) as total_receipts,
     SUM(metadata->>'size')::bigint / 1024 / 1024 as total_mb
   FROM storage.objects
   WHERE bucket_id = 'receipts';
   ```

### Set Up Alerts

- Alert when receipt generation fails > 5% of attempts
- Alert when storage bucket approaches quota
- Alert when email delivery fails > 10% of attempts

---

## Rollback Plan

If critical issues are discovered:

### 1. Disable Receipt Generation

```typescript
// In payment-modal.tsx, set default to false
const [generateReceipt, setGenerateReceipt] = useState(false);
```

### 2. Revert Edge Function

```bash
# Deploy previous version
supabase functions deploy generate-receipt --no-verify-jwt
```

### 3. Database Rollback (if needed)

```sql
-- Drop new tables (CAUTION: This deletes all receipts!)
DROP TABLE IF EXISTS receipts CASCADE;

-- Revert payments table changes
ALTER TABLE payments DROP COLUMN IF EXISTS receipt_id;
```

**Note**: Database rollback should be last resort. Prefer disabling features via UI/config.

---

## Success Criteria

✅ All receipts follow exact specification format  
✅ Receipt numbering is unique and sequential  
✅ Receipts are immutable  
✅ RBAC is properly enforced  
✅ Customers can download receipts easily  
✅ Email delivery works reliably  
✅ No errors in production logs  
✅ Performance is acceptable (< 5s per receipt)  

---

## Support Contacts

- **Technical Issues**: [Your dev team]
- **Business Questions**: support@pinnaclegroups.ng
- **Supabase Support**: support@supabase.com
- **Resend Support**: support@resend.com

---

## Next Steps After Deployment

1. Monitor receipt generation for first 24 hours
2. Collect user feedback from staff
3. Review analytics and metrics
4. Plan future enhancements:
   - Bulk receipt generation
   - Receipt templates customization
   - Advanced analytics
   - Receipt history export

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Verified By**: _______________  
**Status**: ⏳ Pending / ✅ Complete
