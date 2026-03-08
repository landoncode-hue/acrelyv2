/**
 * Centralized logging utility for Acrely
 * Replaces console.log/error/warn with environment-aware logging
 * Supports correlation IDs for distributed tracing
 */

import { getCorrelationId } from './correlation';

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    correlationId?: string;
    context?: Record<string, any>;
}

class Logger {
    private shouldLog(level: LogLevel): boolean {
        // Always log errors
        if (level === 'error') return true;

        // Log warnings in dev and production
        if (level === 'warn') return true;

        // Only log debug/info in development
        if (level === 'debug' || level === 'info') {
            return isDevelopment || isTest;
        }

        return false;
    }

    private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
        const correlationId = getCorrelationId();
        return {
            level,
            message,
            timestamp: new Date().toISOString(),
            correlationId,
            context,
        };
    }

    debug(message: string, context?: Record<string, any>): void {
        if (this.shouldLog('debug')) {
            const entry = this.formatMessage('debug', message, context);
            const corrId = entry.correlationId ? `[${entry.correlationId}]` : '';
            console.log(`[DEBUG]${corrId} ${entry.message}`, context || '');
        }
    }

    info(message: string, context?: Record<string, any>): void {
        if (this.shouldLog('info')) {
            const entry = this.formatMessage('info', message, context);
            const corrId = entry.correlationId ? `[${entry.correlationId}]` : '';
            console.log(`[INFO]${corrId} ${entry.message}`, context || '');
        }
    }

    warn(message: string, context?: Record<string, any>): void {
        if (this.shouldLog('warn')) {
            const entry = this.formatMessage('warn', message, context);
            const corrId = entry.correlationId ? `[${entry.correlationId}]` : '';
            console.warn(`[WARN]${corrId} ${entry.message}`, context || '');
        }
    }

    error(message: string, error?: Error | unknown, context?: Record<string, any>): void {
        if (this.shouldLog('error')) {
            const entry = this.formatMessage('error', message, context);
            const corrId = entry.correlationId ? `[${entry.correlationId}]` : '';
            console.error(`[ERROR]${corrId} ${entry.message}`, error, context || '');
        }
    }

    // Specialized methods for common use cases
    auth(message: string, context?: Record<string, any>): void {
        this.debug(`[AUTH] ${message}`, context);
    }

    db(message: string, context?: Record<string, any>): void {
        this.debug(`[DB] ${message}`, context);
    }

    api(message: string, context?: Record<string, any>): void {
        this.debug(`[API] ${message}`, context);
    }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing
export { Logger };
