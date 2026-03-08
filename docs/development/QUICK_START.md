# Quick Start Guide - New Features

## 🎯 What's New

### 1. Manual Legacy Data Entry
**Access**: `/dashboard/legacy-entry`

A single-screen form to enter complete customer records including:
- ✅ Customer information
- ✅ Multiple phone numbers
- ✅ Plot details (with half-plot support)
- ✅ Payment and balance information

### 2. Half Plot Support
**Format**: Plot numbers now support A/B designation
- Full Plot: `Plot 101`
- Half Plot A: `Plot 101A`
- Half Plot B: `Plot 101B`

### 3. Multiple Phone Numbers
Each customer can now have multiple phone numbers with:
- Primary designation
- Labels (Mobile, Office, Home, Additional)
- Easy management interface

### 4. Searchable Dropdowns
Large datasets now have search functionality for easier selection.

### 5. Responsive Design Utilities
Better text handling across all screen sizes.

---

## 🚀 Quick Start

### Step 1: Run Database Migration

**Prerequisites**: Docker Desktop must be running

```bash
# Local development
npx supabase db reset --local

# OR Production
npx supabase db push
```

### Step 2: Access Legacy Data Entry

1. Navigate to `/dashboard/legacy-entry`
2. Fill in customer details
3. Add phone numbers (at least one required)
4. Select estate and enter plot information
5. Check "This is a half plot" if needed and select A or B
6. Enter payment details
7. Click "Create Record"

### Step 3: Test the Features

**Test Half Plots**:
1. Go to legacy entry
2. Create a customer
3. Check "This is a half plot"
4. Select "A (First Half)"
5. Submit
6. Verify plot shows as "101A" (or your plot number)

**Test Multiple Phones**:
1. Go to legacy entry
2. Click "Add Phone" to add multiple numbers
3. Set one as primary
4. Submit
5. View customer details to see all phones

---

## 📋 Usage Examples

### Using Searchable Select

```tsx
import { SearchableSelect } from "@/components/ui/searchable-select";

<SearchableSelect
  options={customers.map(c => ({
    value: c.id,
    label: c.full_name,
    subtitle: c.phone // Optional subtitle
  }))}
  value={selectedId}
  onValueChange={setSelectedId}
  placeholder="Select customer..."
/>
```

### Formatting Plot Numbers

```tsx
import { formatPlotNumber } from "@/lib/utils/plot";

// In your component
const displayNumber = formatPlotNumber(
  plot.plot_number,      // "101"
  plot.is_half_plot,     // true
  plot.half_plot_designation // "A"
);
// Returns: "101A"
```

### Managing Phone Numbers

```tsx
import { PhoneNumberManager } from "@/components/customers/PhoneNumberManager";

// Full editable view
<PhoneNumberManager customerId={customerId} editable={true} />

// Read-only view
<PhoneNumberManager customerId={customerId} editable={false} />

// Compact inline view
<PhoneNumberManager customerId={customerId} compact={true} />
```

### Responsive Currency

```tsx
import { formatCurrency } from "@/lib/utils/responsive-text";

// Desktop: ₦1,500,000
// Mobile: ₦1.5M
<div className="hidden sm:block">{formatCurrency(amount)}</div>
<div className="sm:hidden">{formatCurrency(amount, { compact: true })}</div>
```

---

## 🔧 Integration Checklist

### For Developers

#### Update Plot Displays
- [ ] Update all plot queries to include `is_half_plot, half_plot_designation`
- [ ] Replace `plot.plot_number` with `formatPlotNumber()`
- [ ] Test receipts show correct designation
- [ ] Test sorting works correctly

#### Update Customer Views
- [ ] Add PhoneNumberManager to customer detail pages
- [ ] Update customer list to show phone count
- [ ] Test phone number CRUD operations

#### Update Forms
- [ ] Add SearchableSelect to customer selection
- [ ] Add SearchableSelect to estate selection
- [ ] Add half-plot checkbox to plot creation forms

#### Responsive Design
- [ ] Apply responsive text utilities to tables
- [ ] Use compact currency on mobile
- [ ] Add line-clamp to long text
- [ ] Test on mobile, tablet, desktop

---

## 📊 Database Schema Changes

### New Table: `customer_phone_numbers`
```sql
- id (UUID)
- customer_id (UUID) → customers.id
- phone_number (TEXT)
- is_primary (BOOLEAN)
- label (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### Updated Table: `plots`
```sql
+ is_half_plot (BOOLEAN)
+ half_plot_designation (CHAR(1)) -- 'A' or 'B'
```

---

## 🎨 UI Components

### Legacy Data Entry Form
**Location**: `/dashboard/legacy-entry`

**Sections**:
1. Customer Information
   - Name, email, address, occupation
   - Multiple phone numbers
   - Next of kin details

2. Plot Information
   - Estate selection
   - Plot number
   - Dimensions
   - Half plot checkbox
   - A/B designation selector

3. Payment Information
   - Amount paid
   - Balance
   - Payment date
   - Payment method
   - Transaction reference

### Phone Number Manager
**Component**: `PhoneNumberManager`

**Features**:
- Add/remove phone numbers
- Set primary phone
- Label each phone
- Compact and full views

### Searchable Select
**Component**: `SearchableSelect`

**Features**:
- Search functionality
- Keyboard navigation
- Subtitle support
- Responsive design

---

## 🧪 Testing Guide

### Manual Testing

**Test 1: Create Full Plot**
1. Go to `/dashboard/legacy-entry`
2. Enter customer name: "John Doe"
3. Enter phone: "08012345678"
4. Select estate
5. Enter plot number: "101"
6. Leave "This is a half plot" unchecked
7. Enter amount paid: "500000"
8. Submit
9. ✅ Verify plot shows as "Plot 101"

**Test 2: Create Half Plot A**
1. Go to `/dashboard/legacy-entry`
2. Enter customer name: "Jane Smith"
3. Enter phone: "08087654321"
4. Select estate
5. Enter plot number: "102"
6. Check "This is a half plot"
7. Select "A (First Half)"
8. Enter amount paid: "250000"
9. Submit
10. ✅ Verify plot shows as "Plot 102A"

**Test 3: Multiple Phones**
1. Go to `/dashboard/legacy-entry`
2. Enter customer name: "Bob Johnson"
3. Enter phone: "08011111111"
4. Click "Add Phone"
5. Enter second phone: "08022222222"
6. Set second phone as primary
7. Complete form and submit
8. ✅ Verify both phones saved
9. ✅ Verify second phone is primary

**Test 4: Responsive Design**
1. Open any page with tables
2. Resize browser to mobile size (< 640px)
3. ✅ Verify no text overflow
4. ✅ Verify numbers format correctly
5. ✅ Verify layout doesn't break

---

## 🐛 Troubleshooting

### "Cannot find table customer_phone_numbers"
**Solution**: Run the database migration first
```bash
npx supabase db reset --local
```

### "Plot already exists"
**Solution**: The system will update the existing plot with new information. This is expected behavior.

### Phone numbers not showing
**Solution**: 
1. Check migration ran successfully
2. Check RLS policies are correct
3. Verify customer has phone numbers in database

### Half plot designation not showing
**Solution**:
1. Ensure migration ran successfully
2. Check component is using `formatPlotNumber()` utility
3. Verify database has `is_half_plot` and `half_plot_designation` columns

---

## 📚 Documentation

- **Full Documentation**: `../reports/SYSTEM_ENHANCEMENTS.md`
- **Integration Guide**: `HALF_PLOT_INTEGRATION_GUIDE.md`
- **Implementation Summary**: `../reports/IMPLEMENTATION_SUMMARY.md`
- **This Guide**: `QUICK_START.md`

---

## ✅ Success Criteria

You'll know everything is working when:

- ✅ Legacy data entry form loads without errors
- ✅ Can create customers with multiple phone numbers
- ✅ Can create half plots with A/B designation
- ✅ Half plots display as "XA" or "XB" everywhere
- ✅ Phone numbers show in customer details
- ✅ Searchable selects work for large datasets
- ✅ No text overflow on mobile devices
- ✅ Build completes without TypeScript errors

---

## 🎯 Next Steps

1. **Run Migration**: `npx supabase db reset --local`
2. **Test Legacy Entry**: Create a few test records
3. **Update Components**: Follow integration guide
4. **Test Thoroughly**: Use testing checklist
5. **Deploy**: Push to production when ready

---

**Need Help?** Check the full documentation in `../reports/SYSTEM_ENHANCEMENTS.md`

**Last Updated**: January 16, 2026
