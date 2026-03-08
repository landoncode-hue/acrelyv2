"use server";

import { safeAction } from "@/lib/actions/safe-action";
import { z } from "zod";
import sql from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";

export const updateTemplateAction = safeAction(
    z.object({
        id: z.string().uuid(),
        subject: z.string().optional(),
        body: z.string(),
    }),
    async (data) => {
        const user = await getCurrentUser();
        if (!user || !['sysadmin', 'ceo', 'md'].includes(user.role || '')) {
            throw new Error("Unauthorized to update templates");
        }

        const { id, subject, body } = data;

        const result = await sql`
            UPDATE communication_templates
            SET body = ${body},
                subject = ${subject || null},
                updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
        `;

        if (result.length === 0) {
            throw new Error("Template not found or could not be updated");
        }

        revalidatePath("/dashboard/communications/templates");
        return result[0];
    }
);

export const generateEmailHtml = async (content: string, title: string = "Notification") => {
    // Convert newlines to breaks if it's plain text (simple heuristic: no <p> or <div> tags)
    const formattedContent = content.includes('<') && content.includes('>')
        ? content
        : content.replace(/\n/g, '<br>');

    // Using absolute URLs for images previously hosted on Supabase Storage
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://acrely.pinnaclegroups.ng";
    const headerBannerUrl = `${baseUrl}/images/header-banner.jpg`; 
    const logoUrl = `${baseUrl}/images/acrely-logo.png`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>${title}</title>
    <style>
        body { background-color: #f6f9fc; font-family: sans-serif; }
        .main { background: #ffffff; border-radius: 8px; width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #F96C16; padding: 25px; text-align: center; color: white; }
    </style>
</head>
<body>
    <div class="main">
        <div class="header">
            <!-- <img src="${headerBannerUrl}" alt="Banner" style="max-width: 100%; height: auto;" /> -->
            <h1>${title}</h1>
        </div>
        <div style="padding: 20px; color: #4a5568;">
            ${formattedContent}
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
            <p>Pinnacle Builders Homes And Properties</p>
        </div>
    </div>
</body>
</html>
    `;
};

export const sendBroadcastAction = safeAction(
    z.object({
        recipientType: z.enum(['all_customers', 'all_leads', 'debtors', 'staff']),
        channel: z.enum(['sms', 'email']),
        message: z.string(),
        subject: z.string().optional(),
    }),
    async (data) => {
        const user = await getCurrentUser();
        if (!user || !['sysadmin', 'ceo', 'md'].includes(user.role || '')) {
            throw new Error("Unauthorized to send broadcasts");
        }

        const { recipientType, channel, message, subject } = data;
        const createdBy = user.id;
        const campaignName = `${recipientType.replace('_', ' ')} ${channel.toUpperCase()} Broadcast`;

        // 1. Create Campaign Record
        const insertCampaignRes = await sql`
            INSERT INTO campaigns (
                name, recipient_type, channel, subject, message, status, created_by
            ) VALUES (
                ${campaignName}, ${recipientType}, ${channel}, ${subject || null}, ${message}, 'processing', ${createdBy}
            ) RETURNING id
        `;
        const campaignId = insertCampaignRes[0].id;

        // 2. Fetch Recipients
        let recipients: any[] = [];
        const field = channel === 'email' ? 'email' : 'phone';

        if (recipientType === 'all_customers') {
            recipients = await sql`SELECT ${sql(field)} as contact, full_name as name FROM customers WHERE ${sql(field)} IS NOT NULL`;
        } else if (recipientType === 'all_leads') {
            recipients = await sql`SELECT ${sql(field)} as contact, full_name as name FROM leads WHERE ${sql(field)} IS NOT NULL`;
        } else if (recipientType === 'staff') {
            recipients = await sql`SELECT ${sql(field)} as contact, full_name as name FROM profiles WHERE is_staff = true AND ${sql(field)} IS NOT NULL`;
        } else if (recipientType === 'debtors') {
            const overdueData = await sql`
                SELECT DISTINCT c.${sql(field)} as contact, c.full_name as name, c.id, e.name as estate_name, p.plot_number, ppi.amount
                FROM payment_plan_installments ppi
                JOIN payment_plans pp ON ppi.plan_id = pp.id
                JOIN allocations a ON pp.allocation_id = a.id
                JOIN customers c ON a.customer_id = c.id
                JOIN plots p ON a.plot_id = p.id
                JOIN estates e ON p.estate_id = e.id
                WHERE ppi.status = 'overdue' AND c.${sql(field)} IS NOT NULL
            `;
            // De-duplicate by customer id
            const seen = new Set();
            recipients = overdueData.filter(r => {
                if (seen.has(r.id)) return false;
                seen.add(r.id);
                // Attach extra details
                r.extra = {
                    estate_name: r.estate_name,
                    plot_number: r.plot_number,
                    amount: r.amount ? Number(r.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 }) : '0.00'
                };
                return true;
            });
        }

        await sql`UPDATE campaigns SET recipient_count = ${recipients.length} WHERE id = ${campaignId}`;

        if (recipients.length === 0) {
            await sql`UPDATE campaigns SET status = 'completed', completed_at = NOW() WHERE id = ${campaignId}`;
            return { success: true, count: 0, campaignId, message: "No recipients found" };
        }

        // 3. Insert into communication_logs to be picked up by a worker OR actually send them here.
        // For stripping supabase, we'll emulate the Edge Function by actually sending them here via fetch.

        let sentCount = 0;
        let failedCount = 0;
        const BATCH_SIZE = 50;
        const termiiApiKey = process.env.TERMII_API_KEY;
        const resendApiKey = process.env.RESEND_API_KEY;

        for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
            const batch = recipients.slice(i, i + BATCH_SIZE);

            if (channel === 'email') {
                if (!resendApiKey) {
                    failedCount += batch.length;
                    if (batch.length > 0) {
                        await sql`INSERT INTO communication_logs (channel, type, message, status, campaign_id, meta)
                                  VALUES ('email', 'campaign', ${message.substring(0, 500)}, 'failed', ${campaignId}, ${sql.json({ recipient: batch[0].contact, error: "System Error: Missing Resend API Key" })})`;
                    }
                    continue;
                }

                const payload = await Promise.all(batch.map(async r => {
                    let text = message.replace(/\{\{name\}\}/g, r.name || 'Customer').replace(/\{\{customer_name\}\}/g, r.name || 'Customer');
                    if (r.extra) {
                        for (const key of Object.keys(r.extra)) {
                            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'gi');
                            text = text.replace(regex, r.extra[key] || '');
                        }
                    }
                    return {
                        from: process.env.RESEND_FROM_EMAIL || "Pinnacle Builders <no-reply@acrely.pinnaclegroups.ng>",
                        to: [r.contact],
                        subject: subject || "Update from Pinnacle Builders",
                        html: await generateEmailHtml(text, subject || "Update from Pinnacle Builders")
                    };
                }));

                const res = await fetch("https://api.resend.com/emails/batch", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${resendApiKey}` },
                    body: JSON.stringify(payload)
                });
                
                const resData = await res.json();
                if (res.ok && resData.data) {
                    for (let j = 0; j < batch.length; j++) {
                        await sql`INSERT INTO communication_logs (channel, type, message, status, campaign_id, provider_message_id, meta)
                                  VALUES ('email', 'campaign', ${message.substring(0, 500)}, 'delivered', ${campaignId}, ${resData.data[j]?.id || null}, ${sql.json({ recipient: batch[j].contact, subject })})`;
                    }
                    sentCount += batch.length;
                } else {
                    failedCount += batch.length;
                    if (batch.length > 0) {
                        await sql`INSERT INTO communication_logs (channel, type, message, status, campaign_id, meta)
                                  VALUES ('email', 'campaign', ${message.substring(0, 500)}, 'failed', ${campaignId}, ${sql.json({ recipient: batch[0].contact, error: resData.message || "Batch Email Failed" })})`;
                    }
                }
            } else {
                // SMS
                for (const recipient of batch) {
                    try {
                        let formattedPhone = recipient.contact.replace(/\D/g, '');
                        if (formattedPhone.startsWith("0") && formattedPhone.length === 11) {
                            formattedPhone = "234" + formattedPhone.slice(1);
                        }

                        if (!termiiApiKey) {
                             await sql`INSERT INTO communication_logs (channel, type, message, status, campaign_id, meta)
                                      VALUES ('sms', 'campaign', ${message.substring(0, 500)}, 'failed', ${campaignId}, ${sql.json({ recipient: recipient.contact, error: "Missing Termii API Key" })})`;
                             failedCount++;
                             continue;
                        }

                        const smsPayload = {
                            api_key: termiiApiKey,
                            to: formattedPhone,
                            from: process.env.TERMII_SENDER_ID || "N-Alert",
                            sms: message.replace(/\{\{name\}\}/g, recipient.name || 'Customer'),
                            type: "plain",
                            channel: "generic"
                        };

                        const res = await fetch("https://api.ng.termii.com/api/sms/send", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(smsPayload)
                        });

                        const resData = await res.json();
                        if (res.ok || resData.message_id) {
                            await sql`INSERT INTO communication_logs (channel, type, message, status, campaign_id, provider_message_id, meta)
                                      VALUES ('sms', 'campaign', ${message.substring(0, 500)}, 'pending', ${campaignId}, ${resData.message_id || null}, ${sql.json({ recipient: recipient.contact })})`;
                            sentCount++;
                        } else {
                            await sql`INSERT INTO communication_logs (channel, type, message, status, campaign_id, meta)
                                      VALUES ('sms', 'campaign', ${message.substring(0, 500)}, 'failed', ${campaignId}, ${sql.json({ recipient: recipient.contact, error: resData.message })})`;
                            failedCount++;
                        }
                    } catch (e) {
                        failedCount++;
                    }
                }
            }
        }

        // 4. Finalize Campaign
        await sql`UPDATE campaigns SET status = 'completed', delivered_count = ${sentCount}, failed_count = ${failedCount}, completed_at = NOW() WHERE id = ${campaignId}`;
        
        revalidatePath("/dashboard/communications/campaigns");

        return {
            success: true,
            campaignId,
            sent: sentCount,
            failed: failedCount,
            total: recipients.length
        };
    }
);
