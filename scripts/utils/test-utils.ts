
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase Env Vars");
}

export type Role = 'sysadmin' | 'ceo' | 'md' | 'frontdesk' | 'agent' | 'customer';

export const USERS = {
    sysadmin: { email: 'sysadmin@pinnaclegroups.ng', password: 'SysAdminPinnacle2025!', role: 'sysadmin' },
    ceo: { email: 'ceo@pinnaclegroups.ng', password: 'CeoPinnacle2025!', role: 'ceo' },
    md: { email: 'md@pinnaclegroups.ng', password: 'MdPinnacle2025!', role: 'md' },
    frontdesk: { email: 'frontdesk@pinnaclegroups.ng', password: 'FrontDeskPinnacle2025!', role: 'frontdesk' },
};

export async function getAuthenticatedClient(role: keyof typeof USERS): Promise<SupabaseClient> {
    const user = USERS[role];
    const client = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await client.auth.signInWithPassword({
        email: user.email,
        password: user.password,
    });

    if (error) {
        throw new Error(`Failed to login as ${role}: ${error.message}`);
    }

    return client;
}

export function generateRandomString(length: number = 8): string {
    return Math.random().toString(36).substring(2, 2 + length);
}
