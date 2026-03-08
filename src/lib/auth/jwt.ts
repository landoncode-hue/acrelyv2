import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'dev-secret-change-in-production-min-64-chars-long-xxxxxxxxxxxxxxxxxxxxxxxxx'
);

const JWT_ISSUER = 'acrely';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
    sub: string;       // user id
    email: string;
    role: string;
    is_staff: boolean;
    email_verified: boolean;
}

/**
 * Sign a JWT token with user claims.
 */
export async function signToken(payload: JWTPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setIssuer(JWT_ISSUER)
        .setExpirationTime(JWT_EXPIRES_IN)
        .sign(JWT_SECRET);
}

/**
 * Verify and decode a JWT token.
 * Returns the payload if valid, null if expired or invalid.
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET, {
            issuer: JWT_ISSUER,
        });
        return payload as unknown as JWTPayload;
    } catch {
        return null;
    }
}
