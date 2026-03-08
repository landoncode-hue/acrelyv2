/**
 * Format a number as Nigerian Naira currency
 */
export function formatNaira(value: number | string | undefined): string {
    if (value === undefined || value === null || value === '') return '₦0';
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
    if (isNaN(num)) return '₦0';

    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
}

/**
 * Parse a formatted currency string back to a number
 */
export function parseNaira(value: string): number {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? 0 : num;
}

/**
 * Format number with thousands separators (for input display)
 */
export function formatWithCommas(value: number | string): string {
    if (value === '' || value === undefined || value === null) return '';
    const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
    if (isNaN(num)) return '';
    return num.toLocaleString('en-NG');
}

/**
 * Hook for currency input handling
 * Returns handlers for a controlled input that formats currency
 */
export function useCurrencyInput(initialValue: number = 0) {
    const formatForDisplay = (val: number) => val ? formatWithCommas(val) : '';
    const parseFromDisplay = (val: string) => parseFloat(val.replace(/[^0-9.-]/g, '')) || 0;

    return {
        formatForDisplay,
        parseFromDisplay,
        formatNaira,
    };
}
