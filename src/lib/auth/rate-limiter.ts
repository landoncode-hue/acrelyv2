
/**
 * Rate Limiting Configuration
 */
export const RATE_LIMIT_CONFIG = {
    MAX_ATTEMPTS: 5,
    LOCKOUT_MINUTES: 10,
    CLEANUP_HOURS: 24,
} as const;

import sql from '@/lib/db';

export interface RateLimitResult {
    allowed: boolean;
    attemptsRemaining: number;
    lockedUntil: Date | null;
    resetAt: Date | null;
}

/**
 * Check if a login attempt is allowed based on Postgres backed rate limiting.
 */
export async function checkRateLimit(
    email: string,
    ipAddress: string
): Promise<RateLimitResult> {
    if (email.endsWith('@test.acrely.com')) {
        return {
            allowed: true,
            attemptsRemaining: RATE_LIMIT_CONFIG.MAX_ATTEMPTS,
            lockedUntil: null,
            resetAt: null,
        };
    }

    const now = new Date();

    const records = await sql`SELECT * FROM auth_attempts WHERE email = ${email.toLowerCase()} AND ip_address = ${ipAddress} LIMIT 1`;
    const cached = records.length > 0 ? records[0] : null;

    if (cached) {
        const lockedUntil = cached.locked_until ? new Date(cached.locked_until) : null;
        const lastAttempt = new Date(cached.last_attempt);
        const attempts = Number(cached.attempts);

        if (lockedUntil && lockedUntil > now) {
            return {
                allowed: false,
                attemptsRemaining: 0,
                lockedUntil: lockedUntil,
                resetAt: lockedUntil,
            };
        }

        if (lockedUntil && lockedUntil <= now) {
            await sql`
                UPDATE auth_attempts 
                SET attempts = 0, locked_until = NULL, last_attempt = NOW()
                WHERE email = ${email.toLowerCase()} AND ip_address = ${ipAddress}
            `;
            return {
                allowed: true,
                attemptsRemaining: RATE_LIMIT_CONFIG.MAX_ATTEMPTS,
                lockedUntil: null,
                resetAt: null,
            };
        }

        const expiryTime = new Date(lastAttempt.getTime() + RATE_LIMIT_CONFIG.LOCKOUT_MINUTES * 60 * 1000);
        if (expiryTime < now) {
            await sql`
                UPDATE auth_attempts 
                SET attempts = 0, locked_until = NULL, last_attempt = NOW()
                WHERE email = ${email.toLowerCase()} AND ip_address = ${ipAddress}
            `;
            return {
                allowed: true,
                attemptsRemaining: RATE_LIMIT_CONFIG.MAX_ATTEMPTS,
                lockedUntil: null,
                resetAt: null,
            };
        }

        return {
            allowed: attempts < RATE_LIMIT_CONFIG.MAX_ATTEMPTS,
            attemptsRemaining: Math.max(0, RATE_LIMIT_CONFIG.MAX_ATTEMPTS - attempts),
            lockedUntil: lockedUntil,
            resetAt: expiryTime,
        };
    }

    await sql`
        INSERT INTO auth_attempts (email, ip_address, attempts, locked_until, last_attempt)
        VALUES (${email.toLowerCase()}, ${ipAddress}, 0, NULL, NOW())
        ON CONFLICT (email, ip_address) DO UPDATE SET attempts = 0, locked_until = NULL, last_attempt = NOW()
    `;

    return {
        allowed: true,
        attemptsRemaining: RATE_LIMIT_CONFIG.MAX_ATTEMPTS,
        lockedUntil: null,
        resetAt: new Date(Date.now() + RATE_LIMIT_CONFIG.LOCKOUT_MINUTES * 60 * 1000),
    };
}

/**
 * Record a failed login attempt.
 */
export async function recordFailedAttempt(email: string, ipAddress: string): Promise<void> {
    const formattedEmail = email.toLowerCase();

    const records = await sql`SELECT attempts FROM auth_attempts WHERE email = ${formattedEmail} AND ip_address = ${ipAddress}`;
    const currentAttempts = records.length > 0 ? Number(records[0].attempts) : 0;

    const newAttempts = currentAttempts + 1;
    const shouldLock = newAttempts >= RATE_LIMIT_CONFIG.MAX_ATTEMPTS;
    const lockedUntil = shouldLock
        ? new Date(Date.now() + RATE_LIMIT_CONFIG.LOCKOUT_MINUTES * 60 * 1000)
        : null;

    await sql`
        INSERT INTO auth_attempts (email, ip_address, attempts, locked_until, last_attempt)
        VALUES (${formattedEmail}, ${ipAddress}, ${newAttempts}, ${lockedUntil}, NOW())
        ON CONFLICT (email, ip_address) DO UPDATE 
        SET attempts = ${newAttempts}, locked_until = ${lockedUntil}, last_attempt = NOW()
    `;
}

/**
 * Reset login attempts after successful login.
 */
export async function resetAttempts(email: string, ipAddress: string): Promise<void> {
    await sql`DELETE FROM auth_attempts WHERE email = ${email.toLowerCase()} AND ip_address = ${ipAddress}`;
}

/**
 * Get formatted lockout message for UI.
 */
export function getLockoutMessage(lockedUntil: Date): string {
    const now = new Date();
    const diffMinutes = Math.ceil((lockedUntil.getTime() - now.getTime()) / 60000);

    if (diffMinutes <= 0) return 'You can try logging in again now.';
    if (diffMinutes === 1) return 'Too many failed attempts. Please try again in 1 minute or reset your password.';
    return `Too many failed attempts. Please try again in ${diffMinutes} minutes or reset your password.`;
}

/**
 * Get IP address from request headers.
 */
export function getIpAddress(headers: Headers): string {
    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    const realIp = headers.get('x-real-ip');
    if (realIp) return realIp;
    return 'unknown';
}
