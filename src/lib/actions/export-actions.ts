"use server";

import { safeAction } from "@/lib/safe-action";
import { ExportService } from "@/lib/services/ExportService";

/**
 * Export Server Actions
 * Refactored to remove direct Supabase dependencies.
 */

const exportService = new ExportService();

export const exportPaymentsReportAction = async (
    dateFrom: string,
    dateTo: string,
    limit: number = 5000
) => {
    return safeAction('exportPaymentsReport', async () => {
        return await exportService.exportPaymentsReport(dateFrom, dateTo, limit);
    });
};

export const exportAllocationsReportAction = async (
    dateFrom: string,
    dateTo: string,
    limit: number = 5000
) => {
    return safeAction('exportAllocationsReport', async () => {
        return await exportService.exportAllocationsReport(dateFrom, dateTo, limit);
    });
};

export const exportCustomersReportAction = async (limit: number = 5000) => {
    return safeAction('exportCustomersReport', async () => {
        return await exportService.exportCustomersReport(limit);
    });
};

export const exportAgentPerformanceReportAction = async (
    dateFrom?: string,
    dateTo?: string
) => {
    return safeAction('exportAgentPerformanceReport', async () => {
        return await exportService.exportAgentPerformanceReport(dateFrom, dateTo);
    });
};

export const getExportHistoryAction = async (limit: number = 50) => {
    return safeAction('getExportHistory', async () => {
        return await exportService.getExportHistory(limit);
    });
};
