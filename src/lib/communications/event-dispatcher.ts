import { CommunicationEngine } from "./engine";
import { logger } from "@/lib/logger";

type EventType =
    | 'payment.recorded'
    | 'payment.overdue'
    | 'allocation.approved'
    | 'receipt.generated'
    | 'calendar.reminder';

interface EventPayload {
    userId: string;
    data: Record<string, any>;
    entity?: {
        type: 'installment' | 'payment' | 'allocation';
        id: string;
    }
}

/**
 * Central Event Dispatcher
 * Subscribes to application events and triggers communications
 */
export class EventDispatcher {

    static async emit(event: EventType, payload: EventPayload) {
        logger.api(`[EventDispatcher] Emitting ${event}`, payload.entity);

        try {
            switch (event) {
                case 'allocation.approved':
                    await CommunicationEngine.send({
                        userId: payload.userId,
                        templateName: 'Allocation Approved',
                        data: payload.data,
                        relatedEntity: payload.entity
                    });
                    // Also send in-app
                    await CommunicationEngine.send({
                        userId: payload.userId,
                        templateName: 'Allocation Ready',
                        data: payload.data,
                        forceChannel: 'in-app'
                    });
                    break;

                case 'payment.recorded':
                    await CommunicationEngine.send({
                        userId: payload.userId,
                        templateName: 'Payment Recorded',
                        data: payload.data,
                        relatedEntity: payload.entity
                    });
                    break;

                case 'receipt.generated':
                    // Receipts prefer Email
                    await CommunicationEngine.send({
                        userId: payload.userId,
                        templateName: 'Receipt',
                        data: payload.data,
                        forceChannel: 'email', // Explicitly email
                        relatedEntity: payload.entity
                    });
                    break;

                case 'payment.overdue':
                    await CommunicationEngine.send({
                        userId: payload.userId,
                        templateName: 'Overdue',
                        data: payload.data,
                        relatedEntity: payload.entity,
                        isUrgent: true // Mark urgent to bypass some quiet hours if really needed, though logic might still block
                    });
                    break;

                default:
                    logger.warn(`[EventDispatcher] No handler for ${event}`);
            }
        } catch (err) {
            logger.error(`[EventDispatcher] Error handling ${event}:`, err);
            // We swallow error here to not block the main transaction flow calling this
        }
    }
}
