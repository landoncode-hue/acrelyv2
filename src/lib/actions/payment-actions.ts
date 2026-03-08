"use server";

import { safeAction } from "@/lib/actions/safe-action";
import { PaymentService } from "@/lib/services/PaymentService";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { z } from "zod";
import { RecordPaymentParams } from "@/lib/services/PaymentService";

const paymentService = new PaymentService();

const ReversePaymentSchema = z.object({
    paymentId: z.string().uuid(),
    reason: z.string().min(5),
});

const GenerateReceiptSchema = z.object({
    paymentId: z.string().uuid(),
    regenerate: z.boolean().optional(),
});

export const reversePaymentAction = safeAction(
    ReversePaymentSchema,
    async ({ paymentId, reason }) => {
        const user = await getCurrentUser();
        if (!user || !['sysadmin', 'ceo', 'md'].includes(user.role)) {
            throw new Error("Unauthorized: Insufficient permissions to reverse payments.");
        }

        const result = await paymentService.reversePayment({
            paymentId,
            reversalReason: reason,
            actorUserId: user.id!,
            actorRole: user.role!
        });

        revalidatePath(`/dashboard/payments/${paymentId}`);
        revalidatePath('/dashboard/payments');

        return result;
    }
);

export const generateReceiptAction = safeAction(
    GenerateReceiptSchema,
    async ({ paymentId, regenerate }) => {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error("Unauthorized");
        }

        const result = await paymentService.generateReceipt({
            paymentId,
            actorUserId: user.id!,
            actorRole: user.role!,
            regenerate
        });

        revalidatePath(`/dashboard/payments/${paymentId}`);

        return result;
    }
);

const RecordPaymentSchema = z.custom<RecordPaymentParams>();

export const recordPaymentAction = safeAction(
    RecordPaymentSchema,
    async (params) => {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error("Unauthorized: You must be logged in to record payments.");
        }

        const result = await paymentService.recordPayment(params, user.id);

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/payments');
        if (params.allocationId) {
            revalidatePath(`/dashboard/allocations/${params.allocationId}`);
        }

        return result;
    }
);

export const getSignedReceiptUrlAction = safeAction(
    z.object({ path: z.string() }),
    async ({ path }) => {
        return await paymentService.getSignedReceiptUrl(path);
    }
);
