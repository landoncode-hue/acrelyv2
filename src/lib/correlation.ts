/**
 * Correlation ID management for distributed request tracing
 * 
 * Edge Runtime compatible - uses headers instead of AsyncLocalStorage
 */

import { v4 as uuidv4 } from 'uuid';

interface CorrelationContext {
    correlationId: string;
    userId?: string;
    sessionId?: string;
    metadata?: Record<string, any>;
}

// Global storage for correlation ID (server-side only)
let currentCorrelationId: string | undefined;

/**
 * Generate a new correlation ID
 */
export function generateCorrelationId(): string {
    return `corr_${uuidv4()}`;
}

/**
 * Get the current correlation ID
 * In Edge Runtime, this returns the globally set ID
 */
export function getCorrelationId(): string | undefined {
    return currentCorrelationId;
}

/**
 * Set the current correlation ID
 * Used internally by middleware
 */
export function setCorrelationId(id: string): void {
    currentCorrelationId = id;
}

/**
 * Clear the current correlation ID
 */
export function clearCorrelationId(): void {
    currentCorrelationId = undefined;
}

/**
 * Get the full correlation context
 */
export function getCorrelationContext(): CorrelationContext | undefined {
    const correlationId = getCorrelationId();
    if (!correlationId) return undefined;

    return {
        correlationId,
    };
}

/**
 * Execute a function with a correlation context
 * In Edge Runtime, this temporarily sets the global ID
 */
export function withCorrelationContext<T>(
    context: CorrelationContext,
    callback: () => T
): T {
    const previousId = currentCorrelationId;
    currentCorrelationId = context.correlationId;

    try {
        return callback();
    } finally {
        currentCorrelationId = previousId;
    }
}

/**
 * Create a new correlation context with generated ID
 */
export function createCorrelationContext(
    userId?: string,
    metadata?: Record<string, any>
): CorrelationContext {
    return {
        correlationId: generateCorrelationId(),
        userId,
        metadata,
    };
}

/**
 * Extract correlation ID from request headers
 */
export function extractCorrelationId(headers: Headers): string | undefined {
    return headers.get('x-correlation-id') || undefined;
}

/**
 * Inject correlation ID into request headers
 */
export function injectCorrelationId(
    headers: Headers,
    correlationId: string
): void {
    headers.set('x-correlation-id', correlationId);
}

/**
 * Create headers with correlation ID
 */
export function createHeadersWithCorrelation(
    correlationId?: string,
    additionalHeaders?: Record<string, string>
): Headers {
    const headers = new Headers(additionalHeaders);
    const id = correlationId || getCorrelationId() || generateCorrelationId();
    injectCorrelationId(headers, id);
    return headers;
}

/**
 * Middleware helper to extract or generate correlation ID from request
 */
export function getOrCreateCorrelationId(request: Request): string {
    const headers = new Headers(request.headers);
    const extracted = extractCorrelationId(headers);

    if (extracted) {
        setCorrelationId(extracted);
        return extracted;
    }

    const generated = generateCorrelationId();
    setCorrelationId(generated);
    return generated;
}
