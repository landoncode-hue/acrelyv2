import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import sql from "@/lib/db";
import { LegacyImportClient } from "./legacy-import-client";

export default async function LegacyDataEntryPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const estates = await sql`
        SELECT id, name, price FROM estates ORDER BY name ASC
    `;

    return <LegacyImportClient initialEstates={estates as any[]} />;
}
