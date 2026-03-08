
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkSysadmin() {
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error("Error listing users:", error);
        return;
    }

    const sysadmin = users.users.find(u => u.email === 'sysadmin@pinnaclegroups.ng');

    if (!sysadmin) {
        console.log("Sysadmin user NOT FOUND in Auth.");
        return;
    }

    console.log(`Found Auth User: ${sysadmin.id}`);

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sysadmin.id)
        .single();

    if (profileError) {
        console.error("Error fetching profile:", profileError);
    } else {
        console.log("Sysadmin Profile:", profile);
    }
}

checkSysadmin();
