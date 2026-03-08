/**
 * CSV Utility Functions
 * Provides utilities for converting JSON data to CSV format and triggering downloads
 */

/**
 * Converts a JSON array to CSV string
 * @param data - Array of objects to convert
 * @param headers - Optional custom headers (defaults to object keys)
 * @returns CSV string
 */
export function jsonToCSV(data: any[], headers?: string[]): string {
    if (!data || data.length === 0) {
        return "";
    }

    // Use provided headers or extract from first object
    const csvHeaders = headers || Object.keys(data[0]);

    // Create header row
    const headerRow = csvHeaders.map((header) => escapeCSVValue(header)).join(",");

    // Create data rows
    const dataRows = data.map((row) => {
        return csvHeaders
            .map((header) => {
                const value = row[header];
                return escapeCSVValue(value);
            })
            .join(",");
    });

    // Combine header and data rows
    return [headerRow, ...dataRows].join("\n");
}

/**
 * Escapes a value for CSV format
 * @param value - Value to escape
 * @returns Escaped string
 */
function escapeCSVValue(value: any): string {
    if (value === null || value === undefined) {
        return "";
    }

    // Convert to string
    let stringValue = String(value);

    // Check if value needs to be quoted (contains comma, quote, or newline)
    const needsQuotes = /[",\n\r]/.test(stringValue);

    if (needsQuotes) {
        // Escape existing quotes by doubling them
        stringValue = stringValue.replace(/"/g, '""');
        // Wrap in quotes
        stringValue = `"${stringValue}"`;
    }

    return stringValue;
}

/**
 * Triggers a browser download of CSV data
 * @param csvString - CSV formatted string
 * @param filename - Name of the file to download
 */
export function downloadCSV(csvString: string, filename: string): void {
    // Create blob
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

    // Create download link
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
}

/**
 * Formats currency for CSV (removes symbols, keeps numeric value)
 * @param amount - Amount to format
 * @returns Formatted string
 */
export function formatCurrencyForCSV(amount: number): string {
    return amount.toFixed(2);
}

/**
 * Formats date for CSV (ISO 8601 format)
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDateForCSV(date: Date | string): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toISOString();
}

/**
 * Formats a date to a readable format for CSV
 * @param date - Date to format
 * @returns Formatted date string (YYYY-MM-DD)
 */
export function formatReadableDateForCSV(date: Date | string): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toISOString().split("T")[0];
}

/**
 * Converts an array of objects to CSV and triggers download
 * @param data - Array of objects to export
 * @param filename - Name of the file to download
 * @param headers - Optional custom headers
 */
export function exportToCSV(
    data: any[],
    filename: string,
    headers?: string[]
): void {
    const csvString = jsonToCSV(data, headers);
    downloadCSV(csvString, filename);
}
