"use client";

import { PaymentWizard } from "@/components/payments/wizard/payment-wizard";

export default function NewPaymentPage() {
    return (
        <div className="container py-8 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Record New Payment</h1>
            <PaymentWizard />
        </div>
    );
}
