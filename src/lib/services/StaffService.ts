import { ProfileRepository } from '../repositories/ProfileRepository';
import { Profile, StaffMember } from '../repositories/types';
import { logger } from '@/lib/logger';
import { sendEmail } from '@/lib/email/send-email';
import { getStaffInviteEmailHtml, getStaffInviteEmailText } from '@/lib/email/templates/staff-invite';
import { logAudit } from '@/lib/audit';

export class StaffService {
    private profileRepository: ProfileRepository;

    constructor() {
        this.profileRepository = new ProfileRepository();
    }


    async getAllStaff(filters?: { role?: string; status?: string }): Promise<StaffMember[]> {
        return this.profileRepository.findStaff(filters);
    }

    async getStaffById(id: string): Promise<StaffMember | null> {
        const profile = await this.profileRepository.findById(id);
        if (profile && profile.is_staff) {
            return profile;
        }
        return null;
    }

    async inviteStaff(data: {
        email: string;
        full_name: string;
        role: string;
        employee_id?: string;
        department?: string;
        invited_by: string;
        inviter_name: string;
    }): Promise<{ success: boolean; user?: any; error?: string }> {
        try {
            const { email, full_name, role, employee_id, department, invited_by, inviter_name } = data;

            // Check if user already exists
            const existing = await this.profileRepository.findByEmail(email);
            if (existing) {
                return { success: false, error: 'A user with this email already exists' };
            }

            // Real staff invitation
            const crypto = await import('crypto');
            const sql = (await import('@/lib/db')).default;

            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

            // Insert new profile
            const users = await sql<{ id: string }[]>`
                INSERT INTO profiles (
                    email, full_name, role, is_staff, staff_status, employee_id, password_hash
                ) VALUES (
                    ${email.toLowerCase().trim()}, ${full_name}, ${role}, true, 'invited', ${employee_id || null}, '$2b$10$placeholder'
                ) RETURNING id
            `;

            const userId = users[0].id;

            // Store invite token
            await sql`
                INSERT INTO password_reset_tokens (user_id, token, expires_at)
                VALUES (${userId}, ${token}, ${expiresAt})
                ON CONFLICT (user_id) DO UPDATE SET
                    token = ${token},
                    expires_at = ${expiresAt},
                    created_at = NOW()
            `;

            const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/complete-signup?token=${token}`;

            // Send invite email
            await sendEmail({
                to: email,
                subject: 'You have been invited to join Acrely',
                html: getStaffInviteEmailHtml({
                    recipientName: full_name,
                    inviterName: inviter_name,
                    role,
                    inviteLink: inviteUrl,
                }),
                text: getStaffInviteEmailText({
                    recipientName: full_name,
                    inviterName: inviter_name,
                    role,
                    inviteLink: inviteUrl,
                }),
            });

            await logAudit({
                action: 'STAFF_INVITED',
                actor_user_id: invited_by,
                target_id: userId,
                target_type: 'profile',
                details: { role, email }
            });

            return {
                success: true,
                user: { id: userId, email, role },
            };
        } catch (error: any) {
            logger.error('StaffService.inviteStaff unexpected error', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    }

    async updateStaffStatus(id: string, status: 'active' | 'suspended' | 'deactivated', reason?: string): Promise<boolean> {
        try {
            await this.profileRepository.update(id, {
                staff_status: status,
                metadata: {
                    ...(await this.profileRepository.findById(id))?.metadata,
                    status_change_reason: reason,
                    status_changed_at: new Date().toISOString(),
                }
            });
            return true;
        } catch (error) {
            logger.error('StaffService.updateStaffStatus error', error);
            return false;
        }
    }

    async updateStaffRole(id: string, role: string, reason?: string): Promise<boolean> {
        try {
            await this.profileRepository.update(id, {
                role: role as any,
                metadata: {
                    ...(await this.profileRepository.findById(id))?.metadata,
                    role_change_reason: reason,
                    role_changed_at: new Date().toISOString(),
                }
            });
            return true;
        } catch (error) {
            logger.error('StaffService.updateStaffRole error', error);
            return false;
        }
    }

    async resetPassword(id: string): Promise<boolean> {
        try {
            const staff = await this.getStaffById(id);
            if (!staff) return false;

            // Mock reset password
            return true;
        } catch (error) {
            logger.error('StaffService.resetPassword error', error);
            return false;
        }
    }
}
