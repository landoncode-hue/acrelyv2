import { useState, useEffect, useRef } from "react";

/**
 * Hook that delays showing a loading state to prevent flash on fast networks
 * @param isLoading - The actual loading state
 * @param delay - Milliseconds to wait before showing loader (default: 200ms)
 * @returns A delayed loading state that only shows if loading takes longer than delay
 */
export function useDelayedLoading(isLoading: boolean, delay: number = 200): boolean {
    const [showLoader, setShowLoader] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isLoading) {
            // Start a timer to show loader after delay
            timerRef.current = setTimeout(() => {
                setShowLoader(true);
            }, delay);
        } else {
            // Clear timer and hide loader immediately when loading completes
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            if (showLoader) {
                // Use setTimeout to avoid synchronous state update warning
                setTimeout(() => setShowLoader(false), 0);
            }
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [isLoading, delay]);

    return showLoader;
}
