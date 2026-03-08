import sql from '@/lib/db';
import { logger } from '@/lib/logger';

export interface ExportHistoryItem {
    id: string;
    user_id: string;
    user_role: string;
    export_type: string;
    date_from: string | null;
    date_to: string | null;
    row_count: number;
    row_limit: number;
    status: string;
    created_at: string;
}

export class ExportService {
    constructor() { }

    async exportPaymentsReport(dateFrom: string, dateTo: string, limit: number = 5000) {
        try {
            const result = await sql`
                SELECT export_payments_report(
                    ${dateFrom},
                    ${dateTo},
                    ${limit}
                ) as data
            `;
            const rows = result[0].data || [];
            if (rows.length > 0) {
                await this.logExport('payments', dateFrom, dateTo, rows.length, limit);
            }
            return rows;
        } catch (error) {
            logger.error('ExportService.exportPaymentsReport error', error);
            throw error;
        }
    }

    async exportAllocationsReport(dateFrom: string, dateTo: string, limit: number = 5000) {
        try {
            const result = await sql`
                SELECT export_allocations_report(
                    ${dateFrom},
                    ${dateTo},
                    ${limit}
                ) as data
            `;
            const rows = result[0].data || [];
            if (rows.length > 0) {
                await this.logExport('allocations', dateFrom, dateTo, rows.length, limit);
            }
            return rows;
        } catch (error) {
            logger.error('ExportService.exportAllocationsReport error', error);
            throw error;
        }
    }

    async exportCustomersReport(limit: number = 5000) {
        try {
            const result = await sql`
                SELECT export_customers_report(
                    ${limit}
                ) as data
            `;
            const rows = result[0].data || [];
            if (rows.length > 0) {
                await this.logExport('customers', null, null, rows.length, limit);
            }
            return rows;
        } catch (error) {
            logger.error('ExportService.exportCustomersReport error', error);
            throw error;
        }
    }

    async exportAgentPerformanceReport(dateFrom?: string, dateTo?: string) {
        try {
            const result = await sql`
                SELECT export_agent_performance_report(
                    ${dateFrom || null},
                    ${dateTo || null}
                ) as data
            `;
            const rows = result[0].data || [];
            if (rows.length > 0) {
                await this.logExport('agent_performance', dateFrom || null, dateTo || null, rows.length, 0);
            }
            return rows;
        } catch (error) {
            logger.error('ExportService.exportAgentPerformanceReport error', error);
            throw error;
        }
    }

    async getExportHistory(limit: number = 50): Promise<ExportHistoryItem[]> {
        try {
            return await sql<ExportHistoryItem[]>`
                SELECT * FROM export_history 
                ORDER BY created_at DESC 
                LIMIT ${limit}
            `;
        } catch (error) {
            logger.error('ExportService.getExportHistory error', error);
            throw error;
        }
    }

    async logExport(exportType: string, dateFrom: string | null, dateTo: string | null, rowCount: number, rowLimit: number) {
        try {
            const result = await sql`
                SELECT log_export(
                    ${exportType},
                    ${dateFrom},
                    ${dateTo},
                    ${rowCount},
                    ${rowLimit}
                ) as data
            `;
            return result[0].data as string;
        } catch (error) {
            logger.error('ExportService.logExport error', error);
            throw error;
        }
    }
}
