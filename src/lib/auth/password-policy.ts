import { z } from 'zod';

/**
 * Password Policy Configuration
 * Enforces strong password requirements for all users
 */
export const PASSWORD_CONFIG = {
    MIN_LENGTH: 10,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_DIGIT: true,
    REQUIRE_SPECIAL: false, // Optional for now
} as const;

/**
 * Common passwords to reject (top 100 most common)
 * In production, this should be a larger list or use a library like zxcvbn
 */
const COMMON_PASSWORDS = new Set([
    'password', 'password123', '12345678', '123456789', '1234567890',
    'qwerty', 'abc123', 'monkey', '1234567', 'letmein',
    'trustno1', 'dragon', 'baseball', 'iloveyou', 'master',
    'sunshine', 'ashley', 'bailey', 'passw0rd', 'shadow',
    'superman', 'qazwsx', 'michael', 'football', 'welcome',
    'jesus', 'ninja', 'mustang', 'password1', 'admin',
    'administrator', 'root', 'toor', 'pass', 'test',
]);

/**
 * Password strength levels
 */
export enum PasswordStrength {
    WEAK = 'weak',
    MEDIUM = 'medium',
    STRONG = 'strong',
}

/**
 * Password validation result
 */
export interface PasswordValidationResult {
    valid: boolean;
    strength: PasswordStrength;
    errors: string[];
    suggestions: string[];
}

/**
 * Zod schema for password validation
 */
export const passwordSchema = z
    .string()
    .min(PASSWORD_CONFIG.MIN_LENGTH, `Password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters`)
    .refine(
        (password) => !COMMON_PASSWORDS.has(password.toLowerCase()),
        'This password is too common. Please choose a more unique password.'
    )
    .refine(
        (password) => !PASSWORD_CONFIG.REQUIRE_UPPERCASE || /[A-Z]/.test(password),
        'Password must contain at least one uppercase letter'
    )
    .refine(
        (password) => !PASSWORD_CONFIG.REQUIRE_LOWERCASE || /[a-z]/.test(password),
        'Password must contain at least one lowercase letter'
    )
    .refine(
        (password) => !PASSWORD_CONFIG.REQUIRE_DIGIT || /\d/.test(password),
        'Password must contain at least one number'
    );

/**
 * Validates password and returns detailed feedback
 */
export function validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Check minimum length
    if (password.length < PASSWORD_CONFIG.MIN_LENGTH) {
        errors.push(`Password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters`);
        suggestions.push(`Add ${PASSWORD_CONFIG.MIN_LENGTH - password.length} more characters`);
    }

    // Check for uppercase
    if (PASSWORD_CONFIG.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
        suggestions.push('Add an uppercase letter (A-Z)');
    }

    // Check for lowercase
    if (PASSWORD_CONFIG.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
        suggestions.push('Add a lowercase letter (a-z)');
    }

    // Check for digit
    if (PASSWORD_CONFIG.REQUIRE_DIGIT && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
        suggestions.push('Add a number (0-9)');
    }

    // Check for special character (optional)
    if (PASSWORD_CONFIG.REQUIRE_SPECIAL && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
        suggestions.push('Add a special character (!@#$%^&*)');
    }

    // Check against common passwords
    if (COMMON_PASSWORDS.has(password.toLowerCase())) {
        errors.push('This password is too common');
        suggestions.push('Choose a more unique password');
    }

    // Calculate strength
    let strength = PasswordStrength.WEAK;
    if (errors.length === 0) {
        // All requirements met, determine strength based on additional factors
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        const isLongEnough = password.length >= 12;
        const hasVariety = new Set(password.toLowerCase()).size >= 8;

        if (hasSpecialChar && isLongEnough && hasVariety) {
            strength = PasswordStrength.STRONG;
        } else if (hasSpecialChar || isLongEnough) {
            strength = PasswordStrength.MEDIUM;
        }
    }

    return {
        valid: errors.length === 0,
        strength,
        errors,
        suggestions,
    };
}

/**
 * Get password strength score (0-100)
 */
export function getPasswordStrengthScore(password: string): number {
    let score = 0;

    // Length score (up to 40 points)
    score += Math.min(password.length * 2, 40);

    // Variety score (up to 30 points)
    const uniqueChars = new Set(password).size;
    score += Math.min(uniqueChars * 2, 30);

    // Complexity score (up to 30 points)
    if (/[A-Z]/.test(password)) score += 5;
    if (/[a-z]/.test(password)) score += 5;
    if (/\d/.test(password)) score += 5;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 10;
    if (password.length >= 12) score += 5;

    // Penalize common patterns
    if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
    if (/^[0-9]+$/.test(password)) score -= 20; // Only numbers
    if (/^[a-zA-Z]+$/.test(password)) score -= 10; // Only letters
    if (COMMON_PASSWORDS.has(password.toLowerCase())) score -= 50;

    return Math.max(0, Math.min(100, score));
}

/**
 * Get password strength color for UI
 */
export function getPasswordStrengthColor(strength: PasswordStrength): string {
    switch (strength) {
        case PasswordStrength.WEAK:
            return 'destructive';
        case PasswordStrength.MEDIUM:
            return 'warning';
        case PasswordStrength.STRONG:
            return 'success';
        default:
            return 'muted';
    }
}

/**
 * Get password strength label for UI
 */
export function getPasswordStrengthLabel(strength: PasswordStrength): string {
    switch (strength) {
        case PasswordStrength.WEAK:
            return 'Weak';
        case PasswordStrength.MEDIUM:
            return 'Medium';
        case PasswordStrength.STRONG:
            return 'Strong';
        default:
            return 'Unknown';
    }
}
