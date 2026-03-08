"use server";

import { clearSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

/**
 * Auth Server Actions
 */

export async function logoutAction() {
    await clearSession();
    redirect("/login");
}
