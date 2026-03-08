import { toast } from "sonner";

/**
 * Standardized toast helper functions for consistent messaging patterns
 */

export const showSuccess = (title: string, description?: string) =>
    toast.success(title, { description });

export const showError = (title: string, retry?: () => void) =>
    toast.error(title, {
        action: retry ? { label: 'Retry', onClick: retry } : undefined
    });

export const showWarning = (title: string, description?: string) =>
    toast.warning(title, { description });

export const showInfo = (title: string, description?: string) =>
    toast.info(title, { description });

export const showLoading = (title: string) =>
    toast.loading(title);
