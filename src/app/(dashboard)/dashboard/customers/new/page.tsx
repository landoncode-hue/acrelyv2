import { Metadata } from "next";
import CreateCustomerForm from "@/components/customers/CreateCustomerForm";

export const metadata: Metadata = {
    title: "New Customer",
    description: "Create a new customer profile",
};

export default function CreateCustomerPage() {
    return (
        <CreateCustomerForm />
    );
}
