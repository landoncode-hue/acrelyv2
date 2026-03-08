# System Enhancements - January 2026

This document outlines the major enhancements made to the Acrely system to support legacy data entry, half plots, multiple phone numbers, and improved responsive design.

## 1. Manual Legacy Data Entry Screen

### Location
`/dashboard/legacy-entry`

### Features
- **Single-screen form** for entering complete customer records
- **Customer Information**: Name, email, address, occupation, next of kin
- **Multiple Phone Numbers**: Support for adding multiple phone numbers with labels
- **Plot Information**: Estate selection, plot number, dimensions, half-plot designation
- **Payment Information**: Amount paid, balance, payment date, method, transaction reference
- **Automatic Record Creation**: Creates customer, plot, allocation, payment, and payment plan records in one transaction

### Usage
1. Navigate to `/dashboard/legacy-entry`
2. Fill in customer details
3. Add one or more phone numbers (at least one required)
4. Select estate and enter plot information
5. Check "This is a half plot" if applicable and select A or B designation
6. Enter payment details (amount paid and/or balance)
7. Click "Create Record" to save

### Validation
- Customer name is required
- At least one phone number is required
- Estate and plot number are required
- Half plot designation (A or B) is required if "This is a half plot" is checked
- Either amount paid or balance must be greater than 0

## 2. Half Plot Support

### Database Changes
**Migration**: `20260116100000_half_plot_and_multi_phone_support.sql`

#### New Columns in `plots` table:
- `is_half_plot` (BOOLEAN): Indicates if this is a half plot
- `half_plot_designation` (CHAR(1)): 'A' or 'B' for half plots, NULL for full plots

#### Utility Functions:
- `get_formatted_plot_number()`: Returns formatted plot number with designation (e.g., "101A")

### Implementation
Half plots are now fully integrated into the system:

1. **Plot Creation**: When creating a plot, you can mark it as a half plot and assign A or B
2. **Display Format**: Half plots display as "Plot XA" or "Plot XB" everywhere
3. **Receipts**: Half plot designation is included in all receipts
4. **System-wide**: The designation is stored in the database and used throughout the application

### Usage in Code
```typescript
import { formatPlotNumber, getPlotDisplayLabel } from "@/lib/utils/plot";

// Format a plot number
const formatted = formatPlotNumber("101", true, "A"); // Returns "101A"

// Get display label
const label = getPlotDisplayLabel("101", true, "A", "City of David Estate");
// Returns "Plot 101A - City of David Estate"
```

## 3. Multiple Phone Numbers Support

### Database Changes
**New Table**: `customer_phone_numbers`

#### Schema:
```sql
CREATE TABLE customer_phone_numbers (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  label TEXT, -- 'Mobile', 'Office', 'Home', 'Additional'
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(customer_id, phone_number)
);
```

#### Features:
- **Primary Phone**: One phone number can be marked as primary
- **Labels**: Each phone can have a label (Mobile, Office, Home, Additional)
- **Auto-migration**: Existing phone numbers in the `customers` table are automatically migrated
- **Trigger**: New customers automatically get their phone added to `customer_phone_numbers`

### Components

#### PhoneNumberManager
**Location**: `src/components/customers/PhoneNumberManager.tsx`

**Variants**:
1. **Full View** (`PhoneNumberManager`): Editable with add/delete/set primary
2. **Display Only** (`PhoneNumberDisplay`): Read-only full view
3. **Compact** (`PhoneNumberCompact`): Inline compact display

**Usage**:
```tsx
import { PhoneNumberManager, PhoneNumberDisplay, PhoneNumberCompact } from "@/components/customers/PhoneNumberManager";

// Editable
<PhoneNumberManager customerId={customerId} editable={true} />

// Read-only
<PhoneNumberDisplay customerId={customerId} />

// Compact inline
<PhoneNumberCompact customerId={customerId} />
```

### Utility Functions
**Location**: `src/lib/utils/customer-phone.ts`

```typescript
import {
  getCustomerPhoneNumbers,
  addCustomerPhoneNumber,
  updateCustomerPhoneNumber,
  deleteCustomerPhoneNumber,
  setPrimaryPhoneNumber,
  getPrimaryPhoneNumber,
} from "@/lib/utils/customer-phone";

// Get all phone numbers for a customer
const phones = await getCustomerPhoneNumbers(customerId);

// Add a new phone number
await addCustomerPhoneNumber(customerId, "08012345678", "Mobile", true);

// Set a phone as primary
await setPrimaryPhoneNumber(phoneId, customerId);
```

## 4. Searchable Select Component

### Location
`src/components/ui/searchable-select.tsx`

### Features
- **Search functionality** for large datasets
- **Keyboard navigation**
- **Subtitle support** for additional context
- **Responsive design**

### Usage
```tsx
import { SearchableSelect } from "@/components/ui/searchable-select";

<SearchableSelect
  options={[
    { value: "1", label: "John Doe", subtitle: "john@example.com" },
    { value: "2", label: "Jane Smith", subtitle: "jane@example.com" },
  ]}
  value={selectedValue}
  onValueChange={setSelectedValue}
  placeholder="Select customer..."
  searchPlaceholder="Search customers..."
  emptyText="No customers found"
/>
```

### Use Cases
- Customer selection in forms
- Estate selection with many options
- Agent assignment
- Any dropdown with >10 options

## 5. Responsive Design Improvements

### Utility Functions
**Location**: `src/lib/utils/responsive-text.ts`

#### Features:
- **Currency formatting** with compact mode (e.g., "₦1.5M" instead of "₦1,500,000")
- **Number formatting** with K/M suffixes
- **Text truncation** utilities
- **Responsive class helpers**

#### Usage:
```typescript
import { formatCurrency, formatNumber, truncateText } from "@/lib/utils/responsive-text";

// Format currency
formatCurrency(1500000); // "₦1,500,000"
formatCurrency(1500000, { compact: true }); // "₦1.5M"

// Format numbers
formatNumber(1500, { compact: true }); // "1.5K"

// Truncate text
truncateText("Very long text here", 20); // "Very long text he..."
```

### CSS Utilities
Add these classes to prevent text overflow:

```tsx
// Truncate with ellipsis
<div className="truncate">Long text here</div>

// Line clamp (show only N lines)
<div className="line-clamp-2">Multi-line text that will be clamped to 2 lines</div>

// Break long words
<div className="break-words">verylongwordwithoutspaces</div>

// Tabular numbers (for aligning numbers in tables)
<div className="tabular-nums">1,234.56</div>
```

### Responsive Best Practices

1. **Use responsive grid classes**:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

2. **Use responsive text sizes**:
```tsx
<h1 className="text-2xl sm:text-3xl lg:text-4xl">
```

3. **Use responsive padding/margin**:
```tsx
<div className="p-4 sm:p-6 lg:p-8">
```

4. **Truncate long text in tables**:
```tsx
<td className="max-w-[200px] truncate">{longText}</td>
```

5. **Use min-w-0 to allow flex items to shrink**:
```tsx
<div className="flex gap-2">
  <div className="flex-1 min-w-0 truncate">{text}</div>
  <Button>Action</Button>
</div>
```

## 6. Database Migration

### Running the Migration

**Local Development** (requires Docker):
```bash
npx supabase db reset --local
```

**Production**:
```bash
# Push migration to Supabase
npx supabase db push

# Or apply via Supabase Dashboard:
# 1. Go to Database > Migrations
# 2. Upload the migration file
# 3. Run migration
```

### Migration File
`supabase/migrations/20260116100000_half_plot_and_multi_phone_support.sql`

This migration:
1. Adds `is_half_plot` and `half_plot_designation` columns to `plots` table
2. Creates `customer_phone_numbers` table
3. Creates indexes for performance
4. Sets up RLS policies
5. Creates utility functions
6. Migrates existing phone numbers
7. Sets up triggers for auto-creating phone records

## 7. Integration Points

### Updating Existing Forms

#### Customer Creation Form
Add phone number management:
```tsx
import { PhoneNumberManager } from "@/components/customers/PhoneNumberManager";

// After customer is created
<PhoneNumberManager customerId={customer.id} editable={true} />
```

#### Plot Creation/Edit Forms
Add half plot support:
```tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";

const [isHalfPlot, setIsHalfPlot] = useState(false);
const [designation, setDesignation] = useState<"A" | "B" | "">("");

<Checkbox
  checked={isHalfPlot}
  onCheckedChange={setIsHalfPlot}
  label="This is a half plot"
/>

{isHalfPlot && (
  <Select value={designation} onValueChange={setDesignation}>
    <SelectItem value="A">A (First Half)</SelectItem>
    <SelectItem value="B">B (Second Half)</SelectItem>
  </Select>
)}
```

#### Receipt Generation
Update receipt templates to use formatted plot numbers:
```tsx
import { formatPlotNumber } from "@/lib/utils/plot";

const plotNumber = formatPlotNumber(
  plot.plot_number,
  plot.is_half_plot,
  plot.half_plot_designation
);
```

### Updating Existing Queries

#### Fetching Plots with Formatted Numbers
```typescript
const { data: plots } = await supabase
  .from("plots")
  .select("id, plot_number, is_half_plot, half_plot_designation, estates(name)");

// Format for display
const formattedPlots = plots.map(plot => ({
  ...plot,
  display_number: formatPlotNumber(
    plot.plot_number,
    plot.is_half_plot,
    plot.half_plot_designation
  )
}));
```

#### Fetching Customers with Phone Numbers
```typescript
const { data: customer } = await supabase
  .from("customers")
  .select(`
    *,
    customer_phone_numbers(*)
  `)
  .eq("id", customerId)
  .single();

// Get primary phone
const primaryPhone = customer.customer_phone_numbers.find(p => p.is_primary);
```

## 8. Testing Checklist

### Manual Legacy Data Entry
- [ ] Create a customer with single phone number
- [ ] Create a customer with multiple phone numbers
- [ ] Create a full plot allocation
- [ ] Create a half plot (A) allocation
- [ ] Create a half plot (B) allocation
- [ ] Create with payment only
- [ ] Create with balance only
- [ ] Create with both payment and balance
- [ ] Verify all records are created correctly
- [ ] Verify form resets after successful submission

### Half Plot Support
- [ ] Create a half plot via legacy entry
- [ ] Verify plot displays as "XA" or "XB" in listings
- [ ] Verify plot displays correctly in customer details
- [ ] Verify plot displays correctly in receipts
- [ ] Verify plot displays correctly in allocations
- [ ] Create allocation for half plot
- [ ] Verify both halves (A and B) can exist for same plot number

### Multiple Phone Numbers
- [ ] Add phone number to existing customer
- [ ] Set a phone as primary
- [ ] Delete a non-primary phone
- [ ] Verify cannot delete the only phone
- [ ] Verify primary phone is used in communications
- [ ] Verify phone numbers display in customer list
- [ ] Verify phone numbers display in customer details

### Responsive Design
- [ ] Test on mobile (< 640px)
- [ ] Test on tablet (640px - 1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Verify no text overflow in tables
- [ ] Verify numbers format correctly
- [ ] Verify long customer names truncate properly
- [ ] Verify long addresses don't break layout

## 9. Known Issues and Limitations

### Current Limitations
1. **Phone Number Validation**: Basic validation only - doesn't verify if number is actually valid
2. **Half Plot Constraints**: No database constraint preventing both A and B from being allocated to different customers (business logic handles this)
3. **Migration Rollback**: No automatic rollback script provided

### Future Enhancements
1. **Phone Number Verification**: Add SMS verification for phone numbers
2. **International Numbers**: Support international phone number formats
3. **Plot Visualization**: Visual representation of half plots in estate maps
4. **Bulk Import**: CSV import for legacy data (currently manual entry only)
5. **Phone Number History**: Track changes to phone numbers over time

## 10. Support and Troubleshooting

### Common Issues

#### "Cannot find module 'customer_phone_numbers'"
**Solution**: Run the database migration first

#### "Plot already exists" error
**Solution**: The system will update the existing plot with half-plot information

#### Phone numbers not showing
**Solution**: Check that the migration ran successfully and RLS policies are correct

#### Responsive issues on mobile
**Solution**: Ensure you're using the responsive utility classes and min-w-0 where needed

### Getting Help
- Check the migration file for database schema
- Review utility functions in `src/lib/utils/`
- Check component examples in this README
- Review existing implementations in the codebase

## 11. File Reference

### New Files Created
```
supabase/migrations/20260116100000_half_plot_and_multi_phone_support.sql
src/app/(dashboard)/dashboard/legacy-entry/page.tsx
src/components/ui/searchable-select.tsx
src/components/customers/PhoneNumberManager.tsx
src/lib/utils/plot.ts
src/lib/utils/customer-phone.ts
src/lib/utils/responsive-text.ts
```

### Modified Files
None (all changes are additive)

### Dependencies
No new dependencies required - all features use existing packages.

---

**Last Updated**: January 16, 2026
**Version**: 1.0.0
**Author**: Antigravity AI
