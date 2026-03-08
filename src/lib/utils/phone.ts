
export type PhoneNumber = {
    id: string;
    customer_id: string;
    phone_number: string;
    is_primary: boolean;
    label: string;
    created_at?: string;
    updated_at?: string;
};

/**
 * Normalizes a phone number to the international format (Termii standard).
 * Specifically targets Nigerian numbers to ensure they start with '234'.
 * 
 * Rules:
 * - Removes all non-digit characters (spaces, dashes, etc.).
 * - If it starts with '0', replace '0' with '234'.
 * - If it starts with '234' (without +), keep it.
 * - If it starts with '+234', remove '+' (already handled by non-digit removal).
 * - If it is a 10-digit number (e.g., 803...), assume '234' prefix.
 * 
 * @param phone The input phone number string
 * @returns The normalized phone number string (e.g., "2348031234567")
 */
export function normalizePhone(phone: string): string {
    if (!phone) return "";

    // 1. Remove all non-numeric characters
    let clean = phone.replace(/\D/g, "");

    // 2. Handle Nigerian format
    if (clean.startsWith("0") && clean.length === 11) {
        // "0803..." -> "234803..."
        return "234" + clean.substring(1);
    }

    if (clean.length === 10 && /^[789]/.test(clean)) {
        // "803..." (missing leading zero) -> "234803..."
        return "234" + clean;
    }

    if (clean.startsWith("234") && (clean.length === 13 || clean.length === 10)) {
        // Already "234803..." -> Keep it
        return clean;
    }

    // Return cleaned version if no specific rule matches (e.g. international)
    return clean;
}

/**
 * Formats phone numbers for display
 */
export function formatPhoneNumbersDisplay(phoneNumbers: PhoneNumber[]): string {
    if (!phoneNumbers || phoneNumbers.length === 0) return "N/A";

    // Sort so primary is first
    const sorted = [...phoneNumbers].sort((a, b) =>
        (a.is_primary === b.is_primary) ? 0 : a.is_primary ? -1 : 1
    );

    if (sorted.length === 1) return sorted[0].phone_number;

    return `${sorted[0].phone_number} (+${sorted.length - 1} more)`;
}

/**
 * Gets all phone numbers as a comma-separated string
 */
export function getAllPhoneNumbersString(phoneNumbers: PhoneNumber[]): string {
    if (!phoneNumbers || phoneNumbers.length === 0) return "";
    return phoneNumbers.map(p => p.phone_number).join(", ");
}
