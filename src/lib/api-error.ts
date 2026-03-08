export type ErrorCode =
    | 'VALIDATION_ERROR'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'RATE_LIMITED'
    | 'INTERNAL_ERROR'
    | 'BAD_REQUEST';

export interface ApiError {
    code: ErrorCode;
    message: string;
    details?: any;
}

export function createError(code: ErrorCode, message: string, details?: any): ApiError {
    return { code, message, details };
}

export function isApiError(error: any): error is ApiError {
    return error && typeof error === 'object' && 'code' in error && 'message' in error;
}

export const StandardErrors = {
    Unauthorized: createError('UNAUTHORIZED', 'You must be logged in to access this resource'),
    Forbidden: createError('FORBIDDEN', 'You do not have permission to perform this action'),
    NotFound: createError('NOT_FOUND', 'The requested resource was not found'),
    RateLimited: createError('RATE_LIMITED', 'Too many requests, please try again later'),
    InternalError: createError('INTERNAL_ERROR', 'An unexpected error occurred'),
    InvalidInput: (details?: any) => createError('VALIDATION_ERROR', 'Invalid input provided', details),
};
