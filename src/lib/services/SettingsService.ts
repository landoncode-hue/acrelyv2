import sql from '@/lib/db';
import { logger } from '@/lib/logger';

export class SettingsService {
    constructor() { }

    async updateSystemSettings(updates: { key: string; value: any }[]) {
        try {
            // First, delete existing keys that are being updated to avoid conflicts if needed
            // although ON CONFLICT should handle it.
            // But let's use a transaction for safety if multiple updates.
            await sql.begin(async (sql) => {
                for (const update of updates) {
                    await sql`
                        INSERT INTO system_settings (key, value)
                        VALUES (${update.key}, ${update.value})
                        ON CONFLICT (key) DO UPDATE SET
                            value = EXCLUDED.value
                    `;
                }
            });
            return true;
        } catch (error) {
            logger.error('SettingsService.updateSystemSettings error', error);
            throw error;
        }
    }

    async getSystemSettings() {
        try {
            const data = await sql<any[]>`
                SELECT * FROM system_settings
            `;
            const settingsMap: Record<string, any> = {};
            data.forEach((row: any) => {
                settingsMap[row.key] = row.value;
            });
            return settingsMap;
        } catch (error) {
            logger.error('SettingsService.getSystemSettings error', error);
            return {};
        }
    }

    async getLogoUrl() {
        try {
            // Check if we have a custom logo URL in settings
            const settings = await this.getSystemSettings();
            if (settings.company_logo_url) return settings.company_logo_url;

            // Default path (will be handled by client/proxy)
            return "/company-logo.png";
        } catch (error) {
            return "/company-logo.png";
        }
    }
}
