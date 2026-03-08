# Receipts Module

Official receipts system for Acrely - immutable, legally compliant, automatically generated payment receipts.

## Features

- ✅ Unique receipt numbering (PBHP-YYYYMMDD-XXXX)
- ✅ Immutable receipts (cannot be edited or deleted)
- ✅ SHA-256 checksum for integrity verification
- ✅ Professional PDF generation with company branding
- ✅ Watermark stamp of originality
- ✅ Automatic email delivery to customers
- ✅ Role-based access control
- ✅ Signed URLs for secure downloads
- ✅ Complete audit trail

## Receipt Format

```
PINNACLE BUILDERS HOMES AND PROPERTIES
Do Real Estate, The Pinnacle Way
133 Jesurobor Plaza, At 2nd East Circular at Nekpen Nekpen Junction,
Benin City, Edo State

Receipt Number: PBHP-20251214-0001
Date: 14/12/2025

Customer Information:
- Name, Phone, Email, Address

Property Information:
- Estate Name, Plot Number, Plot Size

Payment Information:
- Amount Paid, Payment Method, Remaining Balance

Support: support@pinnaclegroups.ng
Powered by Acrely®
```

## Usage

### Generate Receipt (Edge Function)

```typescript
const { data, error } = await supabase.functions.invoke('generate-receipt', {
  body: {
    payment_id: 'uuid',
    actor_user_id: 'uuid',
    actor_role: 'sysadmin', // or 'ceo', 'md', 'frontdesk'
    send_email: true,
    regenerate: false
  }
});
```

### Download Receipt (UI Component)

```tsx
import { ReceiptDownloadButton } from '@/components/receipts/receipt-download-button';

<ReceiptDownloadButton 
  paymentId={payment.id}
  receiptNumber={payment.receipt_number}
/>
```

### Receipt Actions (Staff Portal)

```tsx
import { ReceiptActions } from '@/components/receipts/receipt-actions';

<ReceiptActions
  paymentId={payment.id}
  receiptNumber={payment.receipt_number}
  receiptStatus={payment.receipt_status}
  customerEmail={customer.email}
  userRole={user.role}
/>
```

## Database Schema

### receipts table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| payment_id | uuid | Foreign key to payments |
| allocation_id | uuid | Foreign key to allocations |
| customer_id | uuid | Foreign key to customers |
| receipt_number | text | Unique receipt number (PBHP-YYYYMMDD-XXXX) |
| amount | numeric | Payment amount |
| remaining_balance | numeric | Outstanding balance at time of generation |
| payment_method | text | Payment method used |
| receipt_url | text | Storage path (receipts/{year}/{receipt_number}.pdf) |
| generated_by | uuid | Staff who generated the receipt |
| generated_at | timestamptz | Generation timestamp |
| checksum | text | SHA-256 hash for integrity |

### Key Functions

- `generate_receipt_number()` - Generates unique sequential receipt numbers
- `generate_receipt_checksum()` - Creates SHA-256 hash for integrity
- `link_payment_to_receipt()` - Links payment to generated receipt
- `mark_receipt_generation_failed()` - Handles generation failures

## Access Control

| Role | View All | Generate | Regenerate | View Own |
|------|----------|----------|------------|----------|
| SysAdmin | ✅ | ✅ | ✅ | ✅ |
| CEO | ✅ | ✅ | ✅ | ✅ |
| MD | ✅ | ✅ | ✅ | ✅ |
| Frontdesk | ✅ | ✅ | ❌ | ✅ |
| Agent | ❌ | ❌ | ❌ | ❌ |
| Customer | ❌ | ❌ | ❌ | ✅ |

## Storage

Receipts are stored in Supabase Storage:

```
receipts/
  ├── 2025/
  │   ├── PBHP-20251214-0001.pdf
  │   ├── PBHP-20251214-0002.pdf
  │   └── ...
  └── 2026/
      └── ...
```

Access via signed URLs (7-day expiration).

## Testing

### Run Automated Tests

```bash
npm run test tests/receipts.spec.ts
```

### Run RLS Policy Tests

```bash
psql -h localhost -U postgres -d postgres -f tests/rls/receipts-rls.sql
```

## Deployment

### 1. Apply Migrations

```bash
# Apply in order:
# 1. supabase/migrations/20251214093000_receipts_module.sql
# 2. supabase/migrations/20251214093100_update_payments_for_receipts.sql
```

### 2. Deploy Edge Function

```bash
supabase functions deploy generate-receipt
```

### 3. Configure Storage

Ensure `receipts` bucket exists with proper policies.

### 4. Verify

- Generate test receipt
- Download and verify PDF format
- Test email delivery
- Verify RBAC enforcement

## Troubleshooting

### Receipt Generation Fails

- Check payment data completeness (customer, allocation, plot, estate)
- Verify Supabase Storage bucket exists
- Check edge function logs

### Email Not Sent

- Verify RESEND_API_KEY environment variable
- Check customer email is valid
- Review edge function logs for email errors

### Download Fails

- Signed URLs expire after 7 days - regenerate if needed
- Check storage bucket permissions
- Verify receipt_url path is correct

## Maintenance

- Monitor receipt generation success rate
- Review audit logs for suspicious activity
- Verify checksum integrity periodically
- Archive old receipts after 7+ years

## Support

For issues or questions, contact: support@pinnaclegroups.ng
