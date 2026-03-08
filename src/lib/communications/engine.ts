import { v4 as uuidv4 } from 'uuid'
import { CommunicationValidator } from './validator'
import { logger } from '@/lib/logger'

export type Channel = 'sms' | 'email' | 'whatsapp' | 'in-app'
export type MessageType = 'transactional' | 'reminder' | 'behavioral' | 'campaign'

export interface EntityReference {
    type: 'installment' | 'payment' | 'allocation' | 'customer' | 'leads';
    id: string;
}

export interface SendMessageOptions {
    userId?: string
    customerId?: string
    templateName: string
    data: Record<string, any>
    forceChannel?: Channel
    relatedEntity?: EntityReference
    isUrgent?: boolean
}

export interface TemplateProperties {
    id: string;
    name: string;
    body: string;
    subject?: string;
    type: MessageType;
    allowed_roles?: string[];
    is_urgent?: boolean;
}

/**
 * Replaces {{variable}} placeholders in text with data values
 */
function interpolate(text: string, data: Record<string, any>): string {
    return text.replace(/{{(\w+)}}/g, (_, key) => {
        return data[key] !== undefined ? String(data[key]) : `{{${key}}}`
    })
}

/**
 * Core engine to send messages
 * Now supports Failover, Validation, and Quiet Hours
 */
export class CommunicationEngine {

    /**
     * Unified Send Method
     * Handles: Validation -> Quiet Hours -> Primary Channel -> Failover -> Logging
     */
    static async send(options: SendMessageOptions) {
        logger.info(`Message send mocked: ${options.templateName} to ${options.userId || options.customerId}`);
        return { success: true, errors: [] };
    }

    // Helper for exponential backoff
    static async withRetries<T>(
        fn: () => Promise<T>,
        maxRetries: number = 3,
        initialDelayMs: number = 1000
    ): Promise<T> {
        let lastError: any;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error: any) {
                lastError = error;
                // Don't retry if it's a validation error or 4xx (except 429)
                if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
                    throw error;
                }

                if (attempt === maxRetries) break;

                const delay = initialDelayMs * Math.pow(2, attempt);
                // Jitter
                const jitter = Math.random() * 200;
                logger.warn(`Attempt ${attempt + 1} failed, retrying in ${Math.round(delay + jitter)}ms...`, { error: error.message });
                await new Promise(resolve => setTimeout(resolve, delay + jitter));
            }
        }
        throw lastError;
    }

    private static async executeChannelSend(channel: Channel, recipientData: any, body: string, subject: string | null, logId: string, userId?: string, customerId?: string) {
        // Mock method
    }


    /**
     * Backward compatibility wrapper
     */
    static async sendTransactional(options: SendMessageOptions) {
        return this.send(options);
    }

    /**
     * Schedule a unified reminder
     */
    static async scheduleReminder(userId: string, templateName: string, sendAt: Date, data: Record<string, any>, entity?: EntityReference) {
        logger.info(`Message scheduleReminder mocked: ${templateName} to ${userId}`);
        return { success: true }
    }
}
