import { PaymentPlanService } from "@/lib/services/PaymentPlanService";
import PaymentPlansClient from "./payment-plans-client";

const paymentPlanService = new PaymentPlanService();

export default async function PaymentPlansPage() {
    const plans = await paymentPlanService.getPaymentPlans();

    return <PaymentPlansClient initialPlans={plans || []} />;
}
