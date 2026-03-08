# Legacy Data Import - Ready to Execute

## ✅ Status: SQL Script Generated Successfully

A pure SQL import script has been generated at: **`legacy-import.sql`**

This script bypasses the Supabase client and triggers to avoid the "stack depth limit exceeded" error.

## 📊 Import Summary

- **Total records processed**: 213
- **Successfully generated SQL for**: 161 records
- **Skipped**: 52 records (missing phone numbers or refunded transactions)
- **Unique customers**: 135

### Records by Estate:
1. **City of David Estate**: 42 rows
2. **Ehi Green Park Estate**: 25 rows
3. **Hectares of Diamond Estate**: 8 rows
4. **New Era of Wealth Estate**: 24 rows
5. **Ose Perfection Garden**: 48 rows
6. **Soar High Estate**: 56 rows
7. **Success Palace Estate**: 10 rows
8. **Wealthy Place Estate**: ⚠️ **SKIPPED** (estate not found in database)

## ⚠️ IMPORTANT: Wealthy Place Estate

The **Wealthy Place Estate** CSV file (20 records) was **NOT included** in the generated SQL because the estate doesn't exist in your database yet.

### Next Steps for Wealthy Place Estate:

1. **Create the estate** in your database (via admin UI or SQL)
2. **Re-run the SQL generation script**:
   ```bash
   npx tsx scripts/generate-sql-import.ts
   ```
3. This will regenerate the SQL file with Wealthy Place Estate data included

## 🚀 How to Execute the Import

### Step 1: Review the SQL File
Open `legacy-import.sql` and review the generated SQL statements to ensure they look correct.

### Step 2: Run in Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the entire contents of `legacy-import.sql`
5. Paste into the SQL Editor
6. Click **Run**

### Step 3: Verify the Import

After running the SQL, verify:

```sql
-- Check customer count
SELECT COUNT(*) FROM customers;

-- Check allocations
SELECT COUNT(*) FROM allocations;

-- Check payments
SELECT COUNT(*) FROM payments;

-- Check estate counters
SELECT name, occupied_plots, available_plots FROM estates ORDER BY name;
```

## 📋 What the SQL Script Does

1. **Disables triggers** to prevent recursion errors
2. **Inserts customers** with phone number deduplication
3. **Creates plots** for each allocation
4. **Creates allocations** linking customers to plots
5. **Updates plot status** to 'sold'
6. **Records payments** with proper dates
7. **Creates payment plans** for balances owed
8. **Updates estate counters** (occupied/available plots)
9. **Re-enables triggers** after import

## 🔍 Data Quality Notes

### Skipped Records (52 total):
- **No valid phone number**: Records without valid 10-14 digit phone numbers
- **Refunded transactions**: Marked as "REFUNDED" in payment column
- **Missing customer names**: Empty customer name fields

### Data Integrity:
- ✅ All dates preserved from original records
- ✅ No duplicate customers (deduplicated by phone number)
- ✅ No fake emails created (email field set to NULL)
- ✅ Half plots detected (A/B suffixes)
- ✅ Referral information preserved in notes
- ✅ Payment amounts and balances correctly parsed

## 🛠️ Scripts Available

1. **`scripts/clear-customer-data.ts`** - Clears all customer data (preserves estates)
2. **`scripts/analyze-estates.ts`** - Analyzes current database state
3. **`scripts/generate-sql-import.ts`** - Generates SQL import file
4. **`scripts/import-legacy-simple.ts`** - Direct Supabase client import (blocked by triggers)

## ⚡ Quick Commands

```bash
# Clear customer data (if needed)
npx tsx scripts/clear-customer-data.ts

# Analyze current state
npx tsx scripts/analyze-estates.ts

# Regenerate SQL (after creating Wealthy Place Estate)
npx tsx scripts/generate-sql-import.ts
```

## 📞 Support

If you encounter any issues:
1. Check the SQL syntax in the generated file
2. Verify all estates exist in the database
3. Ensure you have proper permissions in Supabase
4. Review the Supabase logs for detailed error messages

---

**Ready to import?** Once you create "Wealthy Place Estate" and regenerate the SQL, you'll be all set! 🎉
