import { useState, useRef, useCallback } from "react";

interface CancellableOperationResult<T> {
    data: T | null;
    error: Error | null;
    cancelled: boolean;
}

interface UseCancellableOperationReturn<T> {
    execute: (operation: (signal: AbortSignal) => Promise<T>) => Promise<CancellableOperationResult<T>>;
    cancel: () => void;
    isRunning: boolean;
    isCancelled: boolean;
}

/**
 * Hook for managing cancellable long-running operations
 * Uses AbortController to allow cancellation of async operations
 */
export function useCancellableOperation<T = unknown>(): UseCancellableOperationReturn<T> {
    const [isRunning, setIsRunning] = useState(false);
    const [isCancelled, setIsCancelled] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const cancel = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsCancelled(true);
        }
    }, []);

    const execute = useCallback(async (
        operation: (signal: AbortSignal) => Promise<T>
    ): Promise<CancellableOperationResult<T>> => {
        // Cancel any previous operation
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new controller
        abortControllerRef.current = new AbortController();
        const { signal } = abortControllerRef.current;

        setIsRunning(true);
        setIsCancelled(false);

        try {
            const data = await operation(signal);
            return { data, error: null, cancelled: false };
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return { data: null, error: null, cancelled: true };
            }
            return { data: null, error: error as Error, cancelled: false };
        } finally {
            setIsRunning(false);
        }
    }, []);

    return { execute, cancel, isRunning, isCancelled };
}

/**
 * Example usage:
 * 
 * const { execute, cancel, isRunning, isCancelled } = useCancellableOperation<Data[]>();
 * 
 * const handleFetch = async () => {
 *     const result = await execute(async (signal) => {
 *         const response = await fetch('/api/data', { signal });
 *         if (!response.ok) throw new Error('Failed to fetch');
 *         return response.json();
 *     });
 * 
 *     if (result.cancelled) {
 *         toast.info('Operation cancelled');
 *     } else if (result.error) {
 *         toast.error(result.error.message);
 *     } else {
 *         setData(result.data);
 *     }
 * };
 * 
 * // To cancel:
 * <Button onClick={cancel} disabled={!isRunning}>Cancel</Button>
 */
