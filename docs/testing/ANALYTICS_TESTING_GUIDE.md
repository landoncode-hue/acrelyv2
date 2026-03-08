# Analytics Dashboards - RBAC Testing Guide

## Overview

This guide will help you test the new analytics dashboards and verify that Role-Based Access Control (RBAC) is properly enforced.

## Prerequisites

1. ✅ Migrations deployed (see ANALYTICS_DEPLOYMENT.md)
2. ✅ Analytics cache refreshed
3. ✅ Test users with different roles available

## Test Users Needed

You'll need access to accounts with these roles:
- **CEO** or **MD** (full analytics access)
- **Frontdesk** (operational analytics only)
- **Agent** (self-service analytics only)
- **SysAdmin** (all access including system health)
- **Customer** (no analytics access)

## Dashboard URLs

| Dashboard | URL | Allowed Roles |
|-----------|-----|---------------|
| Executive Analytics | `/dashboard/analytics` | CEO, MD, SysAdmin |
| Frontdesk Analytics | `/dashboard/frontdesk-analytics` | CEO, MD, SysAdmin, Frontdesk |
| Agent Analytics | `/dashboard/agent-analytics` | Agent, CEO, MD, SysAdmin |
| System Health | `/dashboard/system-health` | SysAdmin only |
| Reports | `/dashboard/reports` | CEO, MD, SysAdmin, Frontdesk |

---

## Test 1: Executive Analytics Dashboard

### URL: `/dashboard/analytics`

### Allowed Roles: CEO, MD, SysAdmin

#### What to Test:

1. **Access Control**
   - ✅ CEO/MD/SysAdmin can access
   - ❌ Frontdesk gets "Unauthorized Access" message
   - ❌ Agent gets "Unauthorized Access" message
   - ❌ Customer gets redirected or unauthorized

2. **KPI Cards (Top Section)**
   - [ ] Total Revenue - displays currency amount
   - [ ] Outstanding Balance - displays currency amount
   - [ ] Plots Sold - displays number
   - [ ] Active Allocations - displays number
   - [ ] Overdue Customers - displays number (orange highlight)
   - [ ] Agent Performance - displays percentage
   - [ ] Total Customers - displays number
   - [ ] Total Estates - displays number

3. **Revenue Tab**
   - [ ] Revenue Trend Chart - line/bar chart showing monthly revenue
   - [ ] Payment Method Chart - bar chart (Bank Transfer, Cash, Cheque, POS)
   - [ ] Plan Type Chart - pie chart (Outright, 3/6/12 months)

4. **Customers Tab**
   - [ ] Active Customers card
   - [ ] Completed Customers card (green)
   - [ ] Avg Lifetime Value card
   - [ ] Customer Lifecycle Chart - donut chart (Active, Completed, Overdue, Inactive)
   - [ ] Conversion Funnel Chart - horizontal funnel

5. **Inventory Tab**
   - [ ] Estate Occupancy section with progress bars per estate
   - [ ] Shows sold vs available plots

6. **Agents Tab**
   - [ ] Agent Performance table with top 10 agents
   - [ ] Shows leads, conversions, rate, revenue per agent

7. **Date Range Filter**
   - [ ] Can select "Today", "This Month", "This Year"
   - [ ] Charts update when date range changes

8. **Export Button**
   - [ ] "Export Payments" button works
   - [ ] Downloads CSV file

---

## Test 2: Frontdesk Analytics Dashboard

### URL: `/dashboard/frontdesk-analytics`

### Allowed Roles: CEO, MD, SysAdmin, Frontdesk

#### What to Test:

1. **Access Control**
   - ✅ CEO/MD/SysAdmin/Frontdesk can access
   - ❌ Agent gets "Unauthorized Access" message
   - ❌ Customer gets redirected or unauthorized

2. **Operational Widgets**
   - [ ] Payments Today - shows count and amount
   - [ ] Pending Approvals - shows count
   - [ ] Overdue Installments - shows count and amount (orange)
   - [ ] Needs Follow-up - shows count (customers overdue >7 days)
   - [ ] Receipts Generated Today - shows count
   - [ ] Failed Messages - shows count (red if >0)

3. **Quick Actions**
   - [ ] "Record Payment" button links to `/dashboard/payments/record`
   - [ ] "Approve Allocations" button links to `/dashboard/allocations/pending`
   - [ ] "View Overdue" button links to `/dashboard/customers?filter=overdue`
   - [ ] "Send Reminders" button links to `/dashboard/communications`

4. **Today's Focus Section**
   - [ ] Shows relevant recommendations based on metrics
   - [ ] "All Clear!" message when no urgent actions
   - [ ] Highlights pending approvals if any
   - [ ] Highlights overdue customers if any
   - [ ] Highlights failed messages if any

5. **Auto-Refresh**
   - [ ] Last refresh timestamp displayed
   - [ ] Manual refresh button works
   - [ ] Auto-refreshes every 5 minutes (wait and verify)

---

## Test 3: Agent Analytics Dashboard

### URL: `/dashboard/agent-analytics`

### Allowed Roles: Agent, CEO, MD, SysAdmin

#### What to Test:

1. **Access Control**
   - ✅ Agent/CEO/MD/SysAdmin can access
   - ❌ Frontdesk gets "Unauthorized Access" message
   - ❌ Customer gets redirected or unauthorized

2. **Performance Metrics**
   - [ ] Total Leads - shows count with new leads
   - [ ] Conversions - shows count and conversion rate (green)
   - [ ] Revenue Generated - shows currency amount
   - [ ] Commission Earned - shows total with pending amount

3. **Lead Status Breakdown**
   - [ ] New Leads card
   - [ ] Contacted card
   - [ ] Qualified card
   - [ ] Converted card (green)

4. **Conversion Funnel**
   - [ ] Shows funnel visualization
   - [ ] Displays stages: Total Leads → Contacted → Qualified → Converted
   - [ ] Shows overall conversion rate summary

5. **Commission Summary**
   - [ ] Total commission displayed
   - [ ] Paid commission (green)
   - [ ] Pending commission (orange)
   - [ ] Progress bar showing payment completion %

6. **Performance Insights**
   - [ ] Shows relevant tips based on metrics
   - [ ] Low conversion warning if <10%
   - [ ] New leads reminder if >5
   - [ ] Congratulations if conversion ≥20%

7. **Date Range Filter**
   - [ ] Can select "Today", "This Month", "This Year"
   - [ ] Metrics update when date range changes

8. **RBAC - Agent Scope**
   - [ ] Agent sees ONLY their own metrics
   - [ ] Cannot see other agents' data

---

## Test 4: System Health Dashboard

### URL: `/dashboard/system-health`

### Allowed Roles: SysAdmin only

#### What to Test:

1. **Access Control**
   - ✅ SysAdmin can access
   - ❌ CEO/MD gets "Unauthorized Access" message
   - ❌ All other roles get "Unauthorized Access" message

2. **SMS Delivery**
   - [ ] Last 24 Hours - shows count with status badge
   - [ ] Last 7 Days - shows count
   - [ ] Last 30 Days - shows count
   - [ ] Status badge: Green (0), Yellow (<10), Red (≥10)

3. **Email Delivery**
   - [ ] Last 24 Hours - shows count with status badge
   - [ ] Last 7 Days - shows count
   - [ ] Last 30 Days - shows count
   - [ ] Status badge: Green (0), Yellow (<10), Red (≥10)

4. **System Errors**
   - [ ] Last 24 Hours - shows count with status badge
   - [ ] Status badge: Green (0), Yellow (<5), Red (≥5)

5. **Refresh**
   - [ ] Last refresh timestamp displayed
   - [ ] Manual refresh button works

---

## Test 5: Reports Page

### URL: `/dashboard/reports`

### Allowed Roles: CEO, MD, SysAdmin, Frontdesk

#### What to Test:

1. **Access Control**
   - ✅ CEO/MD/SysAdmin/Frontdesk can access
   - ❌ Agent gets "Unauthorized Access" message
   - ❌ Customer gets redirected or unauthorized

2. **Report Types**
   - [ ] Payments Report option
   - [ ] Allocations Report option
   - [ ] Customers Report option
   - [ ] Agent Performance Report option (only for CEO/MD/SysAdmin)

3. **Date Range**
   - [ ] From Date picker works
   - [ ] To Date picker works
   - [ ] Date range applies to time-based reports

4. **Row Limit**
   - [ ] Can select 100, 500, 1000, 5000, 10000 rows
   - [ ] Warning message about 10,000 row limit

5. **Export**
   - [ ] "Export to CSV" button works
   - [ ] Downloads CSV file with correct data
   - [ ] Filename includes report type and date range

6. **RBAC - Frontdesk Limitation**
   - [ ] Frontdesk CANNOT see "Agent Performance Report" option

---

## Test 6: Data Accuracy

### Verify Analytics Match Database

Run these queries to verify analytics are accurate:

```sql
-- 1. Verify revenue matches
SELECT SUM(amount) as total_revenue 
FROM payments 
WHERE status = 'verified';
-- Compare with "Total Revenue" KPI

-- 2. Verify plots sold
SELECT COUNT(DISTINCT plot_id) as plots_sold
FROM allocations 
WHERE status IN ('approved', 'completed') 
AND plot_id IS NOT NULL;
-- Compare with "Plots Sold" KPI

-- 3. Verify overdue customers
SELECT COUNT(DISTINCT c.id) as overdue_count
FROM customers c
JOIN allocations a ON c.id = a.customer_id
JOIN payment_plans pp ON a.id = pp.allocation_id
JOIN payment_plan_installments ppi ON pp.id = ppi.payment_plan_id
WHERE ppi.status = 'overdue';
-- Compare with "Overdue Customers" KPI

-- 4. Check materialized views are populated
SELECT * FROM public.get_analytics_cache_status();
-- Should show 3 views with recent timestamps and row counts
```

---

## Test 7: Performance

### Loading Speed

1. **Executive Dashboard**
   - [ ] Loads in <3 seconds
   - [ ] All charts render without errors
   - [ ] No blank/broken charts

2. **Frontdesk Dashboard**
   - [ ] Loads in <2 seconds
   - [ ] All widgets display data

3. **Agent Dashboard**
   - [ ] Loads in <2 seconds
   - [ ] Charts render correctly

### Materialized Views Impact

- [ ] Dashboard loads faster with materialized views vs. without
- [ ] No noticeable lag when switching tabs

---

## Test 8: Error Handling

### Empty States

1. **No Data Scenarios**
   - [ ] Charts show "No data available" message
   - [ ] No broken UI or errors
   - [ ] Graceful empty state handling

2. **Loading States**
   - [ ] Skeleton loaders appear while loading
   - [ ] Smooth transition from loading to data

### Network Errors

1. **Offline/Error Scenarios**
   - [ ] Error toast appears if data fetch fails
   - [ ] Dashboard doesn't crash
   - [ ] Can retry/refresh

---

## Test Results Template

Use this template to record your test results:

```markdown
## Test Results - [Date]

### Executive Analytics
- Access Control: ✅ / ❌
- KPIs Display: ✅ / ❌
- Charts Render: ✅ / ❌
- Date Filter Works: ✅ / ❌
- Export Works: ✅ / ❌
- Issues: [describe any issues]

### Frontdesk Analytics
- Access Control: ✅ / ❌
- Widgets Display: ✅ / ❌
- Quick Actions Work: ✅ / ❌
- Auto-Refresh Works: ✅ / ❌
- Issues: [describe any issues]

### Agent Analytics
- Access Control: ✅ / ❌
- Metrics Display: ✅ / ❌
- Funnel Renders: ✅ / ❌
- Commission Summary: ✅ / ❌
- Agent Scope Enforced: ✅ / ❌
- Issues: [describe any issues]

### System Health
- Access Control: ✅ / ❌
- Metrics Display: ✅ / ❌
- Issues: [describe any issues]

### Reports
- Access Control: ✅ / ❌
- Export Works: ✅ / ❌
- Frontdesk Limitation: ✅ / ❌
- Issues: [describe any issues]

### Data Accuracy
- Revenue Matches: ✅ / ❌
- Plots Sold Matches: ✅ / ❌
- Overdue Matches: ✅ / ❌
- Issues: [describe any issues]

### Performance
- Load Times Acceptable: ✅ / ❌
- No Errors: ✅ / ❌
- Issues: [describe any issues]
```

---

## Common Issues & Solutions

### Issue: "Unauthorized Access" for all users
**Solution**: Check RLS policies are applied and user roles are set correctly

### Issue: Charts show "No data available"
**Solution**: 
1. Verify migrations applied: Check materialized views exist
2. Refresh cache: `SELECT public.refresh_analytics_cache();`
3. Check data exists in source tables

### Issue: Slow loading
**Solution**: 
1. Verify materialized views are being used
2. Check cache status: `SELECT * FROM public.get_analytics_cache_status();`
3. Refresh cache if stale

### Issue: Agent sees other agents' data
**Solution**: Check RPC function RBAC - should filter by `auth.uid()`

### Issue: Export fails
**Solution**: Check export functions have proper permissions

---

## Sign-Off Checklist

Before marking analytics as production-ready:

- [ ] All dashboards accessible by correct roles
- [ ] All unauthorized access properly blocked
- [ ] All charts render with real data
- [ ] Data accuracy verified against database
- [ ] Performance is acceptable (<3s load times)
- [ ] Error handling works gracefully
- [ ] Export functionality works
- [ ] Agent scope properly enforced
- [ ] Materialized views populated and working
- [ ] No console errors in browser

---

**Ready to test?** Start with Test 1 and work through each section systematically!
