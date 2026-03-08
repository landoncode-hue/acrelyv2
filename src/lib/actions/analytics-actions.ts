"use server";

import { logger } from "@/lib/logger";
import { ActionResponse, safeAction } from "@/lib/safe-action";
import { AnalyticsService } from "../services/AnalyticsService";
import { z } from "zod";

/**
 * Analytics Server Actions
 * Provides server-side functions for fetching analytics data from the database
 */

const analyticsService = new AnalyticsService();

// =====================================================
// EXECUTIVE DASHBOARD ACTIONS
// =====================================================

export interface ExecutiveKPIs {
    total_revenue_collected: number;
    outstanding_balance: number;
    overdue_balance: number;
    total_plots: number;
    plots_sold: number;
    plots_available: number;
    active_allocations: number;
    pending_allocations: number;
    overdue_customers: number;
    agent_performance_index: number;
    total_customers: number;
    avg_customer_lifetime_value: number;
    total_estates: number;
}

// Schemas
const DateRangeSchema = z.object({
    dateFrom: z.string().datetime().optional().nullable(),
    dateTo: z.string().datetime().optional().nullable(),
});

const PeriodSchema = z.enum(["daily", "monthly", "yearly"]);

export async function getExecutiveKPIs(
    dateFrom?: string,
    dateTo?: string
): Promise<ActionResponse<ExecutiveKPIs>> {
    return safeAction("getExecutiveKPIs", async () => {
        // Input Validation
        const validated = DateRangeSchema.safeParse({ dateFrom, dateTo });
        if (!validated.success) {
            throw new Error(`Invalid input: ${validated.error.message}`);
        }

        return analyticsService.getExecutiveKPIs(dateFrom, dateTo);
    });
}

export interface RevenueTrend {
    period_start: string;
    period_label: string;
    payment_count: number;
    total_revenue: number;
    avg_payment: number;
}

export async function getRevenueTrends(
    period: "daily" | "monthly" | "yearly" = "monthly",
    dateFrom?: string,
    dateTo?: string
): Promise<ActionResponse<RevenueTrend[]>> {
    return safeAction("getRevenueTrends", async () => {
        const dateValidation = DateRangeSchema.safeParse({ dateFrom, dateTo });
        const periodValidation = PeriodSchema.safeParse(period);

        if (!dateValidation.success || !periodValidation.success) {
            throw new Error("Invalid parameters");
        }

        return analyticsService.getRevenueTrends(period, dateFrom, dateTo);
    });
}

export interface CustomerAnalytics {
    total_customers: number;
    active_customers: number;
    completed_customers: number;
    overdue_customers: number;
    inactive_customers: number;
    avg_lifetime_value: number;
    total_lifetime_value: number;
    avg_outstanding_balance: number;
    customers_with_balance: number;
}

export async function getCustomerAnalytics(
    dateFrom?: string,
    dateTo?: string
): Promise<ActionResponse<CustomerAnalytics>> {
    return safeAction("getCustomerAnalytics", async () => {
        return analyticsService.getCustomerAnalytics(dateFrom, dateTo);
    });
}

export interface InventoryAnalytics {
    estate_id: string;
    estate_name: string;
    total_plots: number;
    available_plots: number;
    sold_plots: number;
    reserved_plots: number;
    occupancy_percentage: number;
    avg_days_per_sale: number | null;
    sales_last_30_days: number;
    sales_last_90_days: number;
}

export async function getInventoryAnalytics(): Promise<ActionResponse<InventoryAnalytics[]>> {
    return safeAction("getInventoryAnalytics", async () => {
        return analyticsService.getInventoryAnalytics();
    });
}

export interface AgentPerformance {
    agent_id: string;
    agent_name: string;
    agent_email: string;
    total_leads: number;
    converted_leads: number;
    conversion_rate: number;
    total_allocations: number;
    completed_allocations: number;
    total_revenue: number;
    commission_pending: number;
    commission_paid: number;
    commission_total: number;
}

export async function getAgentPerformanceSummary(
    dateFrom?: string,
    dateTo?: string
): Promise<ActionResponse<AgentPerformance[]>> {
    return safeAction("getAgentPerformanceSummary", async () => {
        return analyticsService.getAgentPerformanceSummary(dateFrom, dateTo);
    });
}

// =====================================================
// OPERATIONAL DASHBOARD ACTIONS
// =====================================================

export interface FrontdeskMetrics {
    payments_today_count: number;
    payments_today_amount: number;
    pending_approvals_count: number;
    overdue_installments_count: number;
    overdue_installments_amount: number;
    receipts_generated_today: number;
    failed_messages_count: number;
    customers_needing_followup: number;
}

export async function getFrontdeskMetrics(
    date?: string
): Promise<ActionResponse<FrontdeskMetrics>> {
    return safeAction("getFrontdeskMetrics", async () => {
        if (date && !z.string().datetime().safeParse(date).success) {
            throw new Error("Invalid date format");
        }

        return analyticsService.getFrontdeskMetrics(date);
    });
}

export interface SystemHealthMetrics {
    failed_sms_24h: number;
    failed_sms_7d: number;
    failed_sms_30d: number;
    failed_email_24h: number;
    failed_email_7d: number;
    failed_email_30d: number;
    total_storage_bytes: number;
    recent_errors_count: number;
}

export async function getSystemHealthMetrics(): Promise<ActionResponse<SystemHealthMetrics>> {
    return safeAction("getSystemHealthMetrics", async () => {
        return analyticsService.getSystemHealthMetrics();
    });
}

// =====================================================
// AGENT SELF-SERVICE ACTIONS
// =====================================================

export interface AgentSelfMetrics {
    agent_id: string;
    agent_name: string;
    total_leads: number;
    new_leads: number;
    contacted_leads: number;
    qualified_leads: number;
    converted_leads: number;
    conversion_rate: number;
    total_allocations: number;
    approved_allocations: number;
    completed_allocations: number;
    total_revenue: number;
    commission_pending: number;
    commission_paid: number;
    commission_total: number;
    wallet_balance: number;
}

export async function getAgentSelfMetrics(
    agentId?: string
): Promise<ActionResponse<AgentSelfMetrics>> {
    return safeAction("getAgentSelfMetrics", async () => {
        if (agentId && !z.string().uuid().safeParse(agentId).success) {
            throw new Error("Invalid Agent ID");
        }

        return analyticsService.getAgentSelfMetrics(agentId);
    });
}

export interface ConversionFunnelStage {
    stage: string;
    count: number;
    percentage: number;
}

export async function getAgentConversionFunnel(
    agentId?: string,
    dateFrom?: string,
    dateTo?: string
): Promise<ActionResponse<ConversionFunnelStage[]>> {
    return safeAction("getAgentConversionFunnel", async () => {
        return analyticsService.getAgentConversionFunnel(agentId, dateFrom, dateTo);
    });
}

// =====================================================
// ANALYTICS ACCESS LOGGING
// =====================================================

export async function logAnalyticsAccess(
    dashboardType: string,
    filters: Record<string, any> = {}
): Promise<ActionResponse<{ success: boolean }>> {
    return safeAction("logAnalyticsAccess", async () => {
        return analyticsService.logAnalyticsAccess(dashboardType, filters);
    });
}

// =====================================================
// ADDITIONAL ANALYTICS ACTIONS
// =====================================================

export interface RevenueByPaymentMethod {
    payment_method: string;
    payment_count: number;
    total_revenue: number;
    avg_payment_amount: number;
}

export async function getRevenueByPaymentMethod(): Promise<ActionResponse<RevenueByPaymentMethod[]>> {
    return safeAction("getRevenueByPaymentMethod", async () => {
        return analyticsService.getRevenueByPaymentMethod();
    });
}

export interface RevenueByPlanType {
    plan_type: string;
    allocation_count: number;
    payment_count: number;
    total_revenue: number;
    total_contract_value: number;
    outstanding_balance: number;
    collection_rate_percentage: number;
}

export async function getRevenueByPlanType(): Promise<ActionResponse<RevenueByPlanType[]>> {
    return safeAction("getRevenueByPlanType", async () => {
        return analyticsService.getRevenueByPlanType();
    });
}

export interface CustomerLifecycleData {
    customer_status: string;
    count: number;
    total_lifetime_value: number;
    avg_outstanding_balance: number;
}

export async function getCustomerLifecycleData(): Promise<ActionResponse<CustomerLifecycleData[]>> {
    return safeAction("getCustomerLifecycleData", async () => {
        return analyticsService.getCustomerLifecycleData();
    });
}
