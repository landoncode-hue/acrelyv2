import { CommunicationEngine } from './engine';

export type ValidationResult = { valid: true } | { valid: false; reason: string };

export class CommunicationValidator {

    /**
     * Validate Phone Number
     * Supports mostly Nigerian formats +234, 234, 080...
     */
    static validatePhone(phone: string): ValidationResult {
        if (!phone) return { valid: false, reason: 'Phone number is empty' };

        // Remove non-digits/plus
        const clean = phone.replace(/[^0-9+]/g, '');

        // Basic regex for Nigerian mobile
        // 080, 081, 070, 090, 091... followed by 8 digits
        // or +234...
        const nigerianRegex = /^(?:\+?234|0)?[789][01]\d{8}$/;

        // International generic (E.164-ish): 7-15 digits
        const genericRegex = /^\+?[1-9]\d{6,14}$/;

        if (nigerianRegex.test(clean) || genericRegex.test(clean)) {
            return { valid: true };
        }

        return { valid: false, reason: 'Invalid phone number format' };
    }

    /**
     * Validate Email
     * Syntax check. DNS check is expensive/complex for client-side lib, skipping for now.
     */
    static validateEmail(email: string): ValidationResult {
        if (!email) return { valid: false, reason: 'Email is empty' };

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
            return { valid: true };
        }

        return { valid: false, reason: 'Invalid email syntax' };
    }

    /**
     * Check Quiet Hours (9PM - 7AM Lagos Time)
     * Returns valid: false if in quiet hours AND not urgent
     */
    static checkQuietHours(isUrgent: boolean): ValidationResult {
        if (isUrgent) return { valid: true };

        const now = new Date();
        // Convert to Lagos time
        // We use string manipulation for simplicity or Intl
        const lagosTime = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
        const hour = lagosTime.getHours();

        // Quiet hours: 21:00 (9 PM) to 07:00 (7 AM)
        if (hour >= 21 || hour < 7) {
            return { valid: false, reason: 'Quiet hours active (21:00 - 07:00)' };
        }

        return { valid: true };
    }


    /**
     * Detect Duplicates
     * Prevents sending same message to same user within window
     * Note: This requires DB access, so it might return 'valid' here but fail in Engine.
     * This is a placeholder if we want to add lightweight checks.
     */
    static async isDuplicate(userId: string, hash: string): Promise<boolean> {
        // Implementation would check DB logs for recent hash
        return false;
    }
}
