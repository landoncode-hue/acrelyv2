import sql from '@/lib/db';
import { logger } from '@/lib/logger';

export class AnalyticsService {
    constructor() { }

    async getExecutiveKPIs(dateFrom?: string | null, dateTo?: string | null) {
        try {
            const data = await sql<any[]>`
                SELECT * FROM get_executive_kpis(${dateFrom || null}, ${dateTo || null})
            `;
            return data[0] || null;
        } catch (error) {
            logger.error('AnalyticsService.getExecutiveKPIs error', error);
            throw error;
        }
    }

    async getRevenueTrends(period: string, dateFrom?: string | null, dateTo?: string | null) {
        try {
            const data = await sql<any[]>`
                SELECT * FROM get_revenue_trends(${period}, ${dateFrom || null}, ${dateTo || null})
            `;
            return data || [];
        } catch (error) {
            logger.error('AnalyticsService.getRevenueTrends error', error);
            throw error;
        }
    }

    async getCustomerAnalytics(dateFrom?: string | null, dateTo?: string | null) {
        try {
            const data = await sql<any[]>`
                SELECT * FROM get_customer_analytics(${dateFrom || null}, ${dateTo || null})
            `;
            return data[0] || null;
        } catch (error) {
            logger.error('AnalyticsService.getCustomerAnalytics error', error);
            throw error;
        }
    }

    async getInventoryAnalytics() {
        try {
            const data = await sql<any[]>`
                SELECT * FROM get_inventory_analytics()
            `;
            return data || [];
        } catch (error) {
            logger.error('AnalyticsService.getInventoryAnalytics error', error);
            throw error;
        }
    }

    async getAgentPerformanceSummary(dateFrom?: string | null, dateTo?: string | null) {
        try {
            const data = await sql<any[]>`
                SELECT * FROM get_agent_performance_summary(${dateFrom || null}, ${dateTo || null})
            `;
            return data || [];
        } catch (error) {
            logger.error('AnalyticsService.getAgentPerformanceSummary error', error);
            throw error;
        }
    }

    async getFrontdeskMetrics(date?: string | null) {
        try {
            const data = await sql<any[]>`
                SELECT * FROM get_frontdesk_metrics(${date || null})
            `;
            return data[0] || null;
        } catch (error) {
            logger.error('AnalyticsService.getFrontdeskMetrics error', error);
            throw error;
        }
    }

    async getSystemHealthMetrics() {
        try {
            const data = await sql<any[]>`
                SELECT * FROM get_system_health_metrics()
            `;
            return data[0] || null;
        } catch (error) {
            logger.error('AnalyticsService.getSystemHealthMetrics error', error);
            throw error;
        }
    }

    async getAgentSelfMetrics(agentId?: string | null) {
        try {
            const data = await sql<any[]>`
                SELECT * FROM get_agent_self_metrics(${agentId || null})
            `;
            return data[0] || null;
        } catch (error) {
            logger.error('AnalyticsService.getAgentSelfMetrics error', error);
            throw error;
        }
    }

    async getAgentConversionFunnel(agentId?: string | null, dateFrom?: string | null, dateTo?: string | null) {
        try {
            const data = await sql<any[]>`
                SELECT * FROM get_agent_conversion_funnel(${agentId || null}, ${dateFrom || null}, ${dateTo || null})
            `;
            return data || [];
        } catch (error) {
            logger.error('AnalyticsService.getAgentConversionFunnel error', error);
            throw error;
        }
    }

    async logAnalyticsAccess(dashboardType: string, filters: any = {}) {
        try {
            await sql`
                SELECT log_analytics_access(${dashboardType}, ${sql.json(filters)})
            `;
            return { success: true };
        } catch (error) {
            logger.error('AnalyticsService.logAnalyticsAccess error', error);
            throw error;
        }
    }

    async getRevenueByPaymentMethod() {
        try {
            const data = await sql<any[]>`
                SELECT * FROM revenue_by_payment_method_view
                ORDER BY total_revenue DESC
            `;
            return data || [];
        } catch (error) {
            logger.error('AnalyticsService.getRevenueByPaymentMethod error', error);
            throw error;
        }
    }

    async getRevenueByPlanType() {
        try {
            const data = await sql<any[]>`
                SELECT * FROM revenue_by_plan_type_view
                ORDER BY total_revenue DESC
            `;
            return data || [];
        } catch (error) {
            logger.error('AnalyticsService.getRevenueByPlanType error', error);
            throw error;
        }
    }

    async getCustomerLifecycleData() {
        try {
            const data = await sql<any[]>`
                SELECT * FROM get_customer_lifecycle_data()
            `;
            return data || [];
        } catch (error) {
            logger.error('AnalyticsService.getCustomerLifecycleData error', error);
            throw error;
        }
    }
}
