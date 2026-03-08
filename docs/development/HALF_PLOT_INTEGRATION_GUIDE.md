# Integration Guide: Adding Half Plot Support to Existing Components

This guide shows how to update existing components to support half plots with the new database schema.

## Quick Reference

### Import the utility functions
```typescript
import { formatPlotNumber, getPlotDisplayLabel, getFormattedPlotNumber } from "@/lib/utils/plot";
```

### Database Query Updates

#### Before:
```typescript
const { data: plots } = await supabase
  .from("plots")
  .select("id, plot_number, status, estates(name)");
```

#### After:
```typescript
const { data: plots } = await supabase
  .from("plots")
  .select("id, plot_number, is_half_plot, half_plot_designation, status, estates(name)");
```

### Display Updates

#### Before:
```tsx
<div>Plot {plot.plot_number}</div>
```

#### After:
```tsx
import { formatPlotNumber } from "@/lib/utils/plot";

<div>
  Plot {formatPlotNumber(plot.plot_number, plot.is_half_plot, plot.half_plot_designation)}
</div>
```

## Component-Specific Updates

### 1. Receipt Viewer Component

**File**: `src/components/features/receipt-viewer.tsx`

#### Before (Line 99):
```tsx
<p className="font-medium">
  Plot {payment.allocation?.plots?.plot_number || payment.plots?.plot_number || "Unknown"}
</p>
```

#### After:
```tsx
import { formatPlotNumber } from "@/lib/utils/plot";

const plot = payment.allocation?.plots || payment.plots;
const formattedPlotNumber = plot 
  ? formatPlotNumber(plot.plot_number, plot.is_half_plot, plot.half_plot_designation)
  : "Unknown";

<p className="font-medium">Plot {formattedPlotNumber}</p>
```

### 2. Customer Analytics Dashboard

**File**: `src/components/analytics/CustomerAnalyticsDashboard.tsx`

#### Update Type Definition (Line 34):
```typescript
type CustomerAllocation = {
  id: string;
  estate_name: string;
  plot_number: string;
  is_half_plot?: boolean;
  half_plot_designation?: string | null;
  // ... other fields
};
```

#### Update Display (Line 255):
```tsx
import { formatPlotNumber } from "@/lib/utils/plot";

{customer.estate_name} - Plot {formatPlotNumber(
  customer.plot_number,
  customer.is_half_plot,
  customer.half_plot_designation
)}
```

### 3. Plot Grid Component

**File**: `src/components/features/plot-grid.tsx`

#### Update Type Definition (Line 25):
```typescript
type Plot = {
  id: string;
  plot_number: string;
  is_half_plot?: boolean;
  half_plot_designation?: string | null;
  status: string;
  price?: number;
  // ... other fields
};
```

#### Update Query:
```typescript
const { data: plots } = await supabase
  .from("plots")
  .select("id, plot_number, is_half_plot, half_plot_designation, status, price, dimensions, size")
  .eq("estate_id", estateId);
```

#### Update Display (Line 114):
```tsx
import { formatPlotNumber } from "@/lib/utils/plot";

{formatPlotNumber(plot.plot_number, plot.is_half_plot, plot.half_plot_designation)}
```

### 4. Allocation Wizard

**File**: `src/components/allocations/wizard/allocation-wizard.tsx`

#### Update Type (Line 22):
```typescript
type SelectedPlot = {
  id: string;
  plot_number: string;
  is_half_plot?: boolean;
  half_plot_designation?: string | null;
  price: number;
  size: 'full_plot' | 'half_plot';
};
```

#### Update Query in Select Plot Step:
```typescript
.select("id, plot_number, is_half_plot, half_plot_designation, price, status, dimensions, size")
```

### 5. Payment Schedule Component

**File**: `src/components/portal/payment-schedule.tsx`

#### Update Type (Line 28):
```typescript
plots: { 
  plot_number: string;
  is_half_plot?: boolean;
  half_plot_designation?: string | null;
};
```

#### Update Query (Line 73):
```typescript
plots (plot_number, is_half_plot, half_plot_designation)
```

#### Update Display (Line 162):
```tsx
import { formatPlotNumber } from "@/lib/utils/plot";

Plot #{formatPlotNumber(
  allocation?.plots?.plot_number || 'N/A',
  allocation?.plots?.is_half_plot,
  allocation?.plots?.half_plot_designation
)} • {plan.plan_type.replace('_', ' ')} plan
```

### 6. Add Plot Dialog

**File**: `src/components/estates/add-plot-dialog.tsx`

#### Add Form Fields:
```tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const [isHalfPlot, setIsHalfPlot] = useState(false);
const [halfPlotDesignation, setHalfPlotDesignation] = useState<"A" | "B" | "">("");

// In the form:
<div className="space-y-3">
  <div className="flex items-center space-x-2">
    <Checkbox
      id="is_half_plot"
      checked={isHalfPlot}
      onCheckedChange={(checked) => {
        setIsHalfPlot(checked as boolean);
        if (!checked) setHalfPlotDesignation("");
      }}
    />
    <Label htmlFor="is_half_plot">This is a half plot</Label>
  </div>

  {isHalfPlot && (
    <div className="space-y-2 ml-6">
      <Label htmlFor="designation">Half Plot Designation *</Label>
      <Select
        value={halfPlotDesignation}
        onValueChange={(value: "A" | "B") => setHalfPlotDesignation(value)}
        required={isHalfPlot}
      >
        <SelectTrigger id="designation">
          <SelectValue placeholder="Select A or B" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="A">A (First Half)</SelectItem>
          <SelectItem value="B">B (Second Half)</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Plot will be displayed as: {plotNumber}{halfPlotDesignation || "?"}
      </p>
    </div>
  )}
</div>
```

#### Update Insert (Line 72):
```typescript
const { error } = await supabase.from("plots").insert({
  estate_id: estateId,
  plot_number: plotNumber.toUpperCase(),
  is_half_plot: isHalfPlot,
  half_plot_designation: isHalfPlot ? halfPlotDesignation : null,
  // ... other fields
});
```

### 7. Bulk Create Plots Dialog

**File**: `src/components/estates/bulk-create-plots-dialog.tsx`

#### Update Type (Line 21):
```typescript
type PlotData = {
  plot_number: string;
  is_half_plot?: boolean;
  half_plot_designation?: string | null;
  price?: number;
  dimensions?: string;
};
```

#### Add Checkbox for Half Plots:
```tsx
const [createHalfPlots, setCreateHalfPlots] = useState(false);

// In the form:
<div className="flex items-center space-x-2">
  <Checkbox
    id="create_half_plots"
    checked={createHalfPlots}
    onCheckedChange={(checked) => setCreateHalfPlots(checked as boolean)}
  />
  <Label htmlFor="create_half_plots">
    Create as half plots (will generate A and B for each number)
  </Label>
</div>
```

#### Update Plot Generation Logic:
```typescript
const plotsToCreate: PlotData[] = [];

for (let i = start; i <= end; i++) {
  const plotNumber = `${prefix}${i}`;
  
  if (createHalfPlots) {
    // Create both A and B halves
    plotsToCreate.push({
      plot_number: plotNumber,
      is_half_plot: true,
      half_plot_designation: "A",
      price: plotPrice,
      dimensions: dimensions,
    });
    plotsToCreate.push({
      plot_number: plotNumber,
      is_half_plot: true,
      half_plot_designation: "B",
      price: plotPrice,
      dimensions: dimensions,
    });
  } else {
    // Create full plot
    plotsToCreate.push({
      plot_number: plotNumber,
      is_half_plot: false,
      half_plot_designation: null,
      price: plotPrice,
      dimensions: dimensions,
    });
  }
}
```

## Common Patterns

### Pattern 1: Display Plot Number in Lists
```tsx
import { formatPlotNumber } from "@/lib/utils/plot";

// In a table or list
plots.map(plot => (
  <div key={plot.id}>
    {formatPlotNumber(plot.plot_number, plot.is_half_plot, plot.half_plot_designation)}
  </div>
))
```

### Pattern 2: Display Plot with Estate Name
```tsx
import { getPlotDisplayLabel } from "@/lib/utils/plot";

const label = getPlotDisplayLabel(
  plot.plot_number,
  plot.is_half_plot,
  plot.half_plot_designation,
  estate.name
);
// Returns: "Plot 101A - City of David Estate"
```

### Pattern 3: Filtering Half Plots
```tsx
// Get only full plots
const fullPlots = plots.filter(p => !p.is_half_plot);

// Get only half plots
const halfPlots = plots.filter(p => p.is_half_plot);

// Get specific half plot designation
const aPlots = plots.filter(p => p.is_half_plot && p.half_plot_designation === 'A');
```

### Pattern 4: Sorting Plots with Half Plot Support
```tsx
plots.sort((a, b) => {
  // Compare base plot numbers
  const numA = parseInt(a.plot_number.replace(/\D/g, ''));
  const numB = parseInt(b.plot_number.replace(/\D/g, ''));
  
  if (numA !== numB) return numA - numB;
  
  // If same base number, sort by designation (A before B)
  if (a.is_half_plot && b.is_half_plot) {
    return (a.half_plot_designation || '').localeCompare(b.half_plot_designation || '');
  }
  
  // Full plots before half plots
  return a.is_half_plot ? 1 : -1;
});
```

## Testing Checklist

After updating a component, test:

- [ ] Full plots display correctly (no designation shown)
- [ ] Half plot A displays with "A" suffix
- [ ] Half plot B displays with "B" suffix
- [ ] Sorting works correctly (101, 101A, 101B, 102, 102A, etc.)
- [ ] Filtering works if applicable
- [ ] No TypeScript errors
- [ ] No runtime errors
- [ ] Responsive design maintained
- [ ] Text doesn't overflow

## Migration Strategy

### Phase 1: Update Data Layer (Queries)
1. Update all Supabase queries to include `is_half_plot` and `half_plot_designation`
2. Update TypeScript types to include these fields

### Phase 2: Update Display Layer
1. Import `formatPlotNumber` utility
2. Replace all `plot.plot_number` displays with formatted version
3. Test each component individually

### Phase 3: Update Input Forms
1. Add half plot checkbox and designation selector
2. Update insert/update operations
3. Add validation

### Phase 4: Testing
1. Test with existing full plots (should work unchanged)
2. Test creating new half plots
3. Test displaying mixed full and half plots
4. Test edge cases (sorting, filtering, searching)

## Common Mistakes to Avoid

1. **Forgetting to update queries**: Always include `is_half_plot` and `half_plot_designation` in SELECT
2. **Not handling null values**: Check for null/undefined before formatting
3. **Hardcoding "A" or "B"**: Always use the database value
4. **Inconsistent display**: Use utility functions everywhere, not custom formatting
5. **Breaking existing full plots**: Ensure backward compatibility

## Need Help?

- Check `../reports/SYSTEM_ENHANCEMENTS.md` for full documentation
- Review `src/lib/utils/plot.ts` for all available utility functions
- Look at `src/app/(dashboard)/dashboard/legacy-entry/page.tsx` for a complete example
- Test with the legacy data entry form first

---

**Last Updated**: January 16, 2026
