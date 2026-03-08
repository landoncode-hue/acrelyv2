
import { logger } from "@/lib/logger";

export async function getTermiiBalance() {
    try {
        const apiKey = process.env.TERMII_API_KEY;
        const baseUrl = process.env.TERMII_BASE_URL || "https://api.ng.termii.com";

        if (!apiKey) {
            return { balance: 0, currency: "NGN", note: "No API Key" };
        }

        const res = await fetch(`${baseUrl}/api/get-balance?api_key=${apiKey}`, {
            next: { revalidate: 300 } // Cache for 5 minutes
        });

        if (!res.ok) {
            throw new Error(`Termii API error: ${res.statusText}`);
        }

        const data = await res.json();

        // Termii response format: { "user": "...", "balance": 4500, "currency": "NGN" }
        // Or sometimes { "balance": "4500.00", ... }

        return {
            balance: Number(data.balance) || 0,
            currency: data.currency || 'NGN'
        };
    } catch (error) {
        logger.error("Error fetching Termii balance:", error);
        return { balance: 0, currency: "NGN", error: true };
    }
}
