import { PaymentService } from "@/lib/services/PaymentService";
import { PaymentClient } from "./payment-client";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = {
    title: "Payments | Acrely",
};

export default async function PaymentsPage() {
    const user = await getCurrentUser();
    const paymentService = new PaymentService();
    const rawPayments = await paymentService.getAllPayments();

    const payments = rawPayments.map((p: any) => ({
        id: p.id,
        customer_name: p.customer_full_name || p.customer_name || 'Unknown',
        customer_id: p.customer_id,
        amount: Number(p.amount),
        method: p.method || p.payment_method || 'other',
        reference: p.transaction_ref || p.reference || '',
        payment_date: p.payment_date || p.created_at,
        status: p.status,
        allocation_id: p.allocation_id,
        estate_name: p.estate_name,
        plot_number: p.plot_number
    }));

    return <PaymentClient payments={payments} userRole={user?.role || ""} />;
}
