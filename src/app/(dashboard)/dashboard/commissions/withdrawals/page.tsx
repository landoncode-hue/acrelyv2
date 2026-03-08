import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import sql from "@/lib/db";
import { WithdrawalManagementClient } from "./withdrawals-client";

export default async function WithdrawalManagementPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    if (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'ceo' && user.role !== 'md') {
        redirect("/dashboard");
    }

    // Fetch withdrawal requests directly via SQL
    const requests = await sql<any[]>`
        SELECT 
            wr.*,
            p.full_name as agent_name,
            p.email as agent_email
        FROM withdrawal_requests wr
        JOIN agents a ON wr.agent_id = a.id
        JOIN profiles p ON a.profile_id = p.id
        ORDER BY wr.created_at DESC
    `;

    // Map data to match the expected format in client
    const formattedRequests = requests.map(req => ({
        ...req,
        agents: {
            profiles: {
                full_name: req.agent_name,
                email: req.agent_email
            }
        }
    }));

    return <WithdrawalManagementClient initialRequests={formattedRequests} />;
}
