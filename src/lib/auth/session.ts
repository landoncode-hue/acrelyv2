import { cookies } from 'next/headers';
import { verifyToken, type JWTPayload } from './jwt';

export const SESSION_COOKIE_NAME = 'acrely-session';

type Session = any;

/**
 * Cookie configuration for session storage
 */
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
};

/**
 * Get the raw session token from the cookie.
 */
async function getSessionToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export interface SessionUser extends JWTPayload {
    id: string;         // alias for sub
    full_name: string;
}

/**
 * Get the current authenticated user from the session cookie.
 * Returns null if not authenticated or token is invalid/expired.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
    const token = await getSessionToken();
    if (!token) return null;
    const payload = await verifyToken(token);
    if (!payload) return null;
    return {
        ...payload,
        id: payload.sub,
        full_name: '', // JWT doesn't store this — query DB if needed
    };
}

/**
 * Get user profile with role information.
 * In production, this should query the DB for the full profile.
 * For now it returns the JWT claims directly.
 */
export async function getUserProfile(userId: string) {
    // TODO: Query profiles table for full profile data
    // For now, return from JWT claims
    const user = await getCurrentUser();
    if (!user || user.sub !== userId) return null;
    return {
        id: user.sub,
        full_name: 'User', // JWT doesn't store this — query DB
        email: user.email,
        phone: null as string | null,
        role: user.role,
        is_staff: user.is_staff,
        email_verified: true,
        mfa_enabled: false,
        avatar_url: null as string | null,
    };
}

/**
 * Get current session from httpOnly cookies
 */
export async function getSession(): Promise<Session | null> {
    const user = await getCurrentUser();
    if (!user) return null;
    return { user };
}

/**
 * Check if user has required role
 */
export async function hasRole(requiredRole: string | string[]): Promise<boolean> {
    const user = await getCurrentUser();
    if (!user) return false;
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(user.role);
}

/**
 * Check if user is staff
 */
export async function isStaff(): Promise<boolean> {
    const user = await getCurrentUser();
    if (!user) return false;
    return user.is_staff === true;
}

/**
 * Set the session cookie with a JWT token.
 * Called after successful login.
 */
export async function setSessionCookie(token: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, COOKIE_OPTIONS);
}

/**
 * Clear all session cookies (logout)
 */
export async function clearSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Refresh session token — not needed with JWT, kept for interface compat.
 */
export async function refreshSession(): Promise<Session | null> {
    return getSession();
}

/**
 * Check if session is near expiry (within 5 minutes)
 * Used by middleware to trigger refresh
 */
export function isSessionNearExpiry(session: Session): boolean {
    if (!session?.expires_at) return false;
    const expiryTime = session.expires_at * 1000;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    return expiryTime - now < fiveMinutes;
}
