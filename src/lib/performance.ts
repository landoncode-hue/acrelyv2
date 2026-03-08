// Performance monitoring utility
// Tracks page load times, API response times, and database query performance
import { logger } from "@/lib/logger";

interface PerformanceMetric {
    name: string;
    duration: number;
    timestamp: number;
}

class PerformanceMonitor {
    private metrics: PerformanceMetric[] = [];
    private maxMetrics = 1000; // Keep last 1000 metrics

    /**
     * Start timing an operation
     */
    startTimer(name: string): () => void {
        const start = performance.now();

        return () => {
            const duration = performance.now() - start;
            this.recordMetric(name, duration);
        };
    }

    /**
     * Record a performance metric
     */
    private recordMetric(name: string, duration: number) {
        this.metrics.push({
            name,
            duration,
            timestamp: Date.now(),
        });

        // Keep only last N metrics
        if (this.metrics.length > this.maxMetrics) {
            this.metrics.shift();
        }

        // Log slow operations in development
        if (process.env.NODE_ENV === 'development' && duration > 1000) {
            logger.warn(`[PERF] Slow operation: ${name} took ${duration.toFixed(2)}ms`);
        }
    }

    /**
     * Get average duration for a metric
     */
    getAverage(name: string): number {
        const filtered = this.metrics.filter(m => m.name === name);
        if (filtered.length === 0) return 0;

        const sum = filtered.reduce((acc, m) => acc + m.duration, 0);
        return sum / filtered.length;
    }

    /**
     * Get all metrics for reporting
     */
    getMetrics(): PerformanceMetric[] {
        return [...this.metrics];
    }

    /**
     * Clear all metrics
     */
    clear() {
        this.metrics = [];
    }

    /**
     * Get performance summary
     */
    getSummary() {
        const grouped = this.metrics.reduce((acc, metric) => {
            if (!acc[metric.name]) {
                acc[metric.name] = {
                    count: 0,
                    total: 0,
                    min: Infinity,
                    max: -Infinity,
                };
            }

            acc[metric.name].count++;
            acc[metric.name].total += metric.duration;
            acc[metric.name].min = Math.min(acc[metric.name].min, metric.duration);
            acc[metric.name].max = Math.max(acc[metric.name].max, metric.duration);

            return acc;
        }, {} as Record<string, { count: number; total: number; min: number; max: number }>);

        return Object.entries(grouped).map(([name, stats]) => ({
            name,
            count: stats.count,
            average: stats.total / stats.count,
            min: stats.min,
            max: stats.max,
        }));
    }
}

// Global instance
export const perfMonitor = new PerformanceMonitor();

// Helper to wrap async functions with performance tracking
export function withPerf<T extends (...args: any[]) => Promise<any>>(
    name: string,
    fn: T
): T {
    return (async (...args: any[]) => {
        const end = perfMonitor.startTimer(name);
        try {
            return await fn(...args);
        } finally {
            end();
        }
    }) as T;
}
