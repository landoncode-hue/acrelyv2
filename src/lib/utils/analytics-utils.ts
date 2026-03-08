/**
 * Analytics Utility Functions
 * Provides helper functions for analytics calculations and formatting
 */

/**
 * Calculates percentage change between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change (positive or negative)
 */
export function calculatePercentageChange(
    current: number,
    previous: number
): number {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
}

/**
 * Formats a metric value based on type
 * @param value - Value to format
 * @param type - Type of metric ('currency', 'number', 'percentage')
 * @returns Formatted string
 */
export function formatMetricValue(
    value: number,
    type: "currency" | "number" | "percentage"
): string {
    switch (type) {
        case "currency":
            return new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(value);

        case "percentage":
            return `${value.toFixed(1)}%`;

        case "number":
        default:
            return new Intl.NumberFormat("en-NG").format(value);
    }
}

/**
 * Aggregates time-series data by period
 * @param data - Array of data with date field
 * @param period - Period to aggregate by ('daily', 'monthly', 'yearly')
 * @param dateField - Name of the date field in data objects
 * @param valueField - Name of the value field to aggregate
 * @returns Aggregated data
 */
export function aggregateByPeriod(
    data: any[],
    period: "daily" | "monthly" | "yearly",
    dateField: string = "date",
    valueField: string = "value"
): { period: string; value: number }[] {
    const aggregated: Record<string, number> = {};

    data.forEach((item) => {
        const date = new Date(item[dateField]);
        let periodKey: string;

        switch (period) {
            case "daily":
                periodKey = date.toISOString().split("T")[0];
                break;
            case "monthly":
                periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                break;
            case "yearly":
                periodKey = String(date.getFullYear());
                break;
        }

        if (!aggregated[periodKey]) {
            aggregated[periodKey] = 0;
        }
        aggregated[periodKey] += Number(item[valueField]) || 0;
    });

    return Object.entries(aggregated)
        .map(([period, value]) => ({ period, value }))
        .sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Calculates conversion rate
 * @param numerator - Number of conversions
 * @param denominator - Total number of opportunities
 * @returns Conversion rate as percentage
 */
export function calculateConversionRate(
    numerator: number,
    denominator: number
): number {
    if (denominator === 0) return 0;
    return (numerator / denominator) * 100;
}

/**
 * Formats a large number with abbreviations (K, M, B)
 * @param value - Number to format
 * @returns Formatted string with abbreviation
 */
export function formatLargeNumber(value: number): string {
    if (value >= 1_000_000_000) {
        return `${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
        return `${(value / 1_000).toFixed(1)}K`;
    }
    return String(value);
}

/**
 * Calculates average from array of numbers
 * @param values - Array of numbers
 * @returns Average value
 */
export function calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
}

/**
 * Generates a color based on value and thresholds
 * @param value - Value to evaluate
 * @param goodThreshold - Threshold for "good" (green)
 * @param warningThreshold - Threshold for "warning" (yellow)
 * @returns Color class name
 */
export function getMetricColor(
    value: number,
    goodThreshold: number,
    warningThreshold: number
): "green" | "yellow" | "red" {
    if (value >= goodThreshold) return "green";
    if (value >= warningThreshold) return "yellow";
    return "red";
}

/**
 * Calculates trend direction
 * @param current - Current value
 * @param previous - Previous value
 * @returns Trend direction ('up', 'down', 'neutral')
 */
export function getTrendDirection(
    current: number,
    previous: number
): "up" | "down" | "neutral" {
    const change = current - previous;
    const threshold = previous * 0.01; // 1% threshold for neutral

    if (Math.abs(change) < threshold) return "neutral";
    return change > 0 ? "up" : "down";
}

/**
 * Formats a date range for display
 * @param dateFrom - Start date
 * @param dateTo - End date
 * @returns Formatted date range string
 */
export function formatDateRange(dateFrom: Date, dateTo: Date): string {
    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
    };

    const fromStr = dateFrom.toLocaleDateString("en-US", options);
    const toStr = dateTo.toLocaleDateString("en-US", options);

    return `${fromStr} - ${toStr}`;
}

/**
 * Gets preset date ranges
 * @returns Object with common date range presets
 */
export function getDateRangePresets() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return {
        today: {
            from: today,
            to: now,
            label: "Today",
        },
        yesterday: {
            from: new Date(today.getTime() - 24 * 60 * 60 * 1000),
            to: today,
            label: "Yesterday",
        },
        last7Days: {
            from: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
            to: now,
            label: "Last 7 Days",
        },
        last30Days: {
            from: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
            to: now,
            label: "Last 30 Days",
        },
        thisMonth: {
            from: new Date(now.getFullYear(), now.getMonth(), 1),
            to: now,
            label: "This Month",
        },
        lastMonth: {
            from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
            to: new Date(now.getFullYear(), now.getMonth(), 0),
            label: "Last Month",
        },
        thisYear: {
            from: new Date(now.getFullYear(), 0, 1),
            to: now,
            label: "This Year",
        },
        lastYear: {
            from: new Date(now.getFullYear() - 1, 0, 1),
            to: new Date(now.getFullYear() - 1, 11, 31),
            label: "Last Year",
        },
    };
}
