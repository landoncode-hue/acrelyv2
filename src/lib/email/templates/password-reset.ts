/**
 * Password Reset Email Template
 * Security-focused email for password reset requests
 */

export interface PasswordResetEmailData {
  recipientName: string;
  resetLink: string;
}

export function getPasswordResetEmailHtml(data: PasswordResetEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
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
                Reset your password
              </h2>
              
              <p style="margin: 0 0 16px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Hello <strong>${data.recipientName}</strong>,
              </p>
              
              <p style="margin: 0 0 16px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password for your Acrely account.
              </p>
              
              <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Click the button below to create a new password:
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0 0 24px;">
                    <a href="${data.resetLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px; color: #718096; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 24px; padding: 12px; background-color: #f7fafc; border-radius: 4px; color: #4a5568; font-size: 14px; word-break: break-all; font-family: monospace;">
                ${data.resetLink}
              </p>

              <div style="margin: 24px 0 0; padding: 16px; background-color: #fee2e2; border-left: 4px solid #ef4444; border-radius: 4px;">
                <p style="margin: 0 0 8px; color: #991b1b; font-size: 14px; line-height: 1.6;">
                  <strong>🔒 Security Notice:</strong>
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #991b1b; font-size: 14px; line-height: 1.6;">
                  <li>This link will expire in 1 hour</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Your password will not change until you create a new one</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f7fafc; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; color: #718096; font-size: 13px; line-height: 1.6;">
                Need help? Contact our support team at support@pinnaclegroups.ng
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

export function getPasswordResetEmailText(data: PasswordResetEmailData): string {
  return `
Reset your password

Hello ${data.recipientName},

We received a request to reset your password for your Acrely account.

Click the link below to create a new password:
${data.resetLink}

🔒 Security Notice:
- This link will expire in 1 hour
- If you didn't request this reset, please ignore this email
- Your password will not change until you create a new one

Need help? Contact our support team at support@pinnaclegroups.ng

© ${new Date().getFullYear()} Acrely by Pinnacle Groups. All rights reserved.
  `.trim();
}
