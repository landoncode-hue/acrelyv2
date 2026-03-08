import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import sql from "@/lib/db";
import { CreateLeadClient } from "./leads-new-client";

export default async function CreateLeadPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const estates = await sql`
        SELECT id, name FROM estates ORDER BY name ASC
    `;

    return <CreateLeadClient estates={estates as any[]} />;
}
