import { logger } from "@/lib/logger";

export interface GenerateReceiptParams {
    paymentId: string;
    actorUserId: string;
    actorRole: string;
}

export interface GenerateReceiptResponse {
    success: boolean;
    signedUrl?: string;
    storagePath?: string;
    emailStatus?: string;
    error?: string;
}

export async function generateReceipt({
    paymentId,
    actorUserId,
    actorRole,
}: GenerateReceiptParams): Promise<GenerateReceiptResponse> {
    try {
        return {
            success: false,
            error: "Receipt generation temporarily disabled",
        };
    } catch (err: any) {
        logger.error("Exception in generateReceipt:", err);
        return { success: false, error: err.message || "Unknown error occurred" };
    }
}
