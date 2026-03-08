import { logger } from "@/lib/logger";
import { ApiError, isApiError } from "./api-error";

/**
 * Standardized response for server actions
 */
export type ActionResponse<T> = {
    data: T | null;
    error: ApiError | null;
    success: boolean;
};

/**
 * Wraps a server action with standardized error handling and logging
 */
export async function safeAction<T>(
    actionName: string,
    handler: () => Promise<T>
): Promise<ActionResponse<T>> {
    try {
        const data = await handler();
        return { data, error: null, success: true };
    } catch (error: any) {
        logger.error(`Error in server action [${actionName}]:`, error);

        // If it's already an ApiError, use it directly
        if (isApiError(error)) {
            return {
                data: null,
                error,
                success: false
            };
        }

        // Handle Database/Postgres errors if they have a specific format
        if (error.code) {
            let code: any = 'INTERNAL_ERROR';
            let message = error.message || 'Database error occurred';

            // Map common Postgres error codes
            switch (error.code) {
                case '23505': // Unique violation
                    code = 'BAD_REQUEST';
                    message = 'A record with this information already exists.';
                    break;
                case '23503': // Foreign key violation
                    code = 'BAD_REQUEST';
                    message = 'This operation cannot be completed due to related records.';
                    break;
                case 'PGRST116': // Row not found
                    code = 'NOT_FOUND';
                    message = 'The requested resource was not found.';
                    break;
                case '42501': // Permission denied
                    code = 'FORBIDDEN';
                    message = 'You do not have permission to perform this action.';
                    break;
            }

            return {
                data: null,
                error: {
                    code,
                    message,
                    details: error
                },
                success: false
            };
        }

        return {
            data: null,
            error: {
                code: 'INTERNAL_ERROR',
                message: typeof error === 'string' ? error : (error.message || 'An unexpected error occurred'),
                details: process.env.NODE_ENV === 'development' ? error : undefined
            },
            success: false
        };
    }
}
