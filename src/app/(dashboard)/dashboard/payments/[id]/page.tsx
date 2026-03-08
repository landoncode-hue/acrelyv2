import { PaymentService } from "@/lib/services/PaymentService";
import { PaymentDetailClient } from "./payment-detail-client";
import { getCurrentUser } from "@/lib/auth/session";
import { notFound } from "next/navigation";

export const metadata = {
    title: "Payment Details | Acrely",
};

export default async function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCurrentUser();
    const paymentService = new PaymentService();
    const payment = await paymentService.getPaymentById(id);

    if (!payment) {
        notFound();
    }

    return (
        <PaymentDetailClient
            payment={payment}
            userRole={user?.role || ""}
            userId={user?.id || ""}
        />
    );
}
