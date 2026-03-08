/**
 * Responsive Text Utilities
 * 
 * Add these utility classes to your Tailwind config or use them directly
 * to handle text overflow and responsive typography
 */

// Add to tailwind.config.ts
export const responsiveTextPlugin = {
    '.text-truncate': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    '.text-wrap-balance': {
        textWrap: 'balance',
    },
    '.text-wrap-pretty': {
        textWrap: 'pretty',
    },
    '.line-clamp-1': {
        overflow: 'hidden',
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': '1',
    },
    '.line-clamp-2': {
        overflow: 'hidden',
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': '2',
    },
    '.line-clamp-3': {
        overflow: 'hidden',
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': '3',
    },
    '.break-words-safe': {
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
        hyphens: 'auto',
    },
    '.number-tabular': {
        fontVariantNumeric: 'tabular-nums',
    },
};

/**
 * Format currency for display with proper overflow handling
 */
export function formatCurrency(
    amount: number,
    options?: {
        currency?: string;
        locale?: string;
        compact?: boolean;
    }
): string {
    const { currency = 'NGN', locale = 'en-NG', compact = false } = options || {};

    if (compact && Math.abs(amount) >= 1000000) {
        const millions = amount / 1000000;
        return `₦${millions.toFixed(1)}M`;
    }

    if (compact && Math.abs(amount) >= 1000) {
        const thousands = amount / 1000;
        return `₦${thousands.toFixed(1)}K`;
    }

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        currencyDisplay: 'narrowSymbol',
    }).format(amount);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format large numbers for display
 */
export function formatNumber(
    num: number,
    options?: {
        compact?: boolean;
        decimals?: number;
    }
): string {
    const { compact = false, decimals = 0 } = options || {};

    if (compact) {
        if (Math.abs(num) >= 1000000) {
            return `${(num / 1000000).toFixed(decimals)}M`;
        }
        if (Math.abs(num) >= 1000) {
            return `${(num / 1000).toFixed(decimals)}K`;
        }
    }

    return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

/**
 * Get responsive class names based on screen size
 */
export function getResponsiveClasses(base: string, sm?: string, md?: string, lg?: string): string {
    const classes = [base];
    if (sm) classes.push(`sm:${sm}`);
    if (md) classes.push(`md:${md}`);
    if (lg) classes.push(`lg:${lg}`);
    return classes.join(' ');
}
