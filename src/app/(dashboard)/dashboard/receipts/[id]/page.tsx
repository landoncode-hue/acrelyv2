import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import sql from "@/lib/db";
import { ReceiptClient } from "./receipt-client";

export default async function ReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch the payment details directly from sql
    const payments = await sql<any[]>`
SELECT
p.*,
    c.full_name as customer_name,
    c.email as customer_email,
    c.phone as customer_phone,
    c.address as customer_address
        FROM payments p
        JOIN customers c ON p.customer_id = c.id
        WHERE p.id = ${id}
        LIMIT 1
    `;

    const paymentData = payments[0];

    if (!paymentData) {
        return <div className="p-8 text-center text-red-500">Receipt not found</div>;
    }

    // Format data to match previous interface
    const formattedPayment = {
        ...paymentData,
        customers: {
            full_name: paymentData.customer_name,
            email: paymentData.customer_email,
            phone: paymentData.customer_phone,
            address: paymentData.customer_address
        }
    };

    return <ReceiptClient payment={formattedPayment} />;
}
