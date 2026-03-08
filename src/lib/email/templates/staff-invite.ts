/**
 * Staff Invitation Email Template
 * Branded email for inviting new staff members to Acrely
 */

export interface StaffInviteEmailData {
  recipientName: string;
  role: string;
  inviteLink: string;
  inviterName: string;
}

export function getStaffInviteEmailHtml(data: StaffInviteEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're invited to Acrely</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <img src="${process.env.NEXT_PUBLIC_APP_URL}/pinnacle-logo.png" alt="Pinnacle Builders" width="120" style="display: block; margin: 0 auto; max-width: 100%; border: 0;">
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                You're invited to Acrely
              </h2>
              
              <p style="margin: 0 0 16px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Hello <strong>${data.recipientName}</strong>,
              </p>
              
              <p style="margin: 0 0 16px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                ${data.inviterName} has invited you to join Acrely as <strong>${data.role}</strong>.
              </p>
              
              <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Click the button below to set your password and complete your account setup:
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0 0 24px;">
                    <a href="${data.inviteLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                      Complete Signup
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px; color: #718096; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 24px; padding: 12px; background-color: #f7fafc; border-radius: 4px; color: #4a5568; font-size: 14px; word-break: break-all; font-family: monospace;">
                ${data.inviteLink}
              </p>

              <div style="margin: 24px 0 0; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>⏰ Important:</strong> This invitation link will expire in 7 days. Please complete your signup before then.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f7fafc; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; color: #718096; font-size: 13px; line-height: 1.6;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
              <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                © ${new Date().getFullYear()} Acrely by Pinnacle Groups. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function getStaffInviteEmailText(data: StaffInviteEmailData): string {
  return `
You're invited to Acrely

Hello ${data.recipientName},

${data.inviterName} has invited you to join Acrely as ${data.role}.

Click the link below to set your password and complete your account setup:
${data.inviteLink}

⏰ Important: This invitation link will expire in 7 days. Please complete your signup before then.

If you didn't expect this invitation, you can safely ignore this email.

© ${new Date().getFullYear()} Acrely by Pinnacle Groups. All rights reserved.
  `.trim();
}
