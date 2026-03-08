import sql from "@/lib/db";
import { logger } from "@/lib/logger";
import { getCorrelationId } from "@/lib/correlation";

export type AuditAction =
    | 'create_lead'
    | 'convert_lead'
    | 'create_allocation'
    | 'approve_allocation'
    | 'reject_allocation'
    | 'record_payment'
    | 'create_agent'
    | 'approve_agent'
    | 'reject_agent'
    | 'create_staff'
    | 'update_settings'
    | 'login'
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILED'
    | 'LOGIN_LOCKED'
    | 'PASSWORD_RESET_REQUESTED'
    | 'PASSWORD_RESET_COMPLETED'
    | 'STAFF_INVITED'
    | 'MFA_ENABLED'
    | 'MFA_DISABLED'
    | 'MFA_VERIFIED'
    | 'EMAIL_VERIFIED';

interface AuditLogParams {
    action?: AuditAction;
    action_type?: string;
    entityId?: string;
    entityType?: string;
    details?: any;
    actor_user_id?: string;
    actor_role?: string;
    target_id?: string;
    target_type?: string;
    changes?: any;
    ip_address?: string;
    user_agent?: string;
    correlation_id?: string;
}

export async function logAudit(params: AuditLogParams) {
    try {
        const actionType = params.action_type || params.action;
        const targetId = params.target_id || params.entityId;
        const targetType = params.target_type || params.entityType;
        const correlationId = params.correlation_id || getCorrelationId();

        await sql`
            INSERT INTO audit_logs (
                actor_user_id,
                actor_role,
                action_type,
                target_id,
                target_type,
                changes,
                ip_address,
                user_agent,
                correlation_id
            ) VALUES (
                ${params.actor_user_id ?? null},
                ${params.actor_role ?? null},
                ${actionType ?? null},
                ${targetId ?? null},
                ${targetType ?? null},
                ${params.changes ?? params.details ?? null},
                ${params.ip_address ?? null},
                ${params.user_agent ?? null},
                ${correlationId ?? null}
            )
        `;
    } catch (error) {
        logger.error("Failed to log audit:", error);
    }
}
