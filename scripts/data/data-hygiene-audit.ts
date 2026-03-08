#!/usr/bin/env tsx

/**
 * Data Hygiene Audit Script
 * 
 * Scans the production database for test/seed data patterns.
 * This is a READ-ONLY script that generates a report without modifying data.
 * 
 * Usage:
 *   npm run audit:data-hygiene
 *   
 * Or with custom database URL:
 *   DATABASE_URL=postgresql://... npm run audit:data-hygiene
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing required environment variables:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface AuditFinding {
    table: string;
    issue: string;
    count: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    examples?: any[];
}

const findings: AuditFinding[] = [];

/**
 * Add a finding to the report
 */
function addFinding(finding: AuditFinding) {
    findings.push(finding);
    const icon = finding.severity === 'critical' ? '🔴' : finding.severity === 'high' ? '🟠' : finding.severity === 'medium' ? '🟡' : '🟢';
    console.log(`${icon} [${finding.table}] ${finding.issue}: ${finding.count} records`);
}

/**
 * Check for test email patterns
 */
async function checkTestEmails() {
    console.log('\n📧 Checking for test email patterns...');

    const testPatterns = [
        '@test.local',
        '@test.com',
        '@example.com',
        '@localhost',
        'test@',
        'demo@',
    ];

    // Check customers
    for (const pattern of testPatterns) {
        const { data, error } = await supabase
            .from('customers')
            .select('id, email, full_name, created_at')
            .ilike('email', `%${pattern}%`)
            .limit(5);

        if (error) {
            console.error(`Error checking customers for ${pattern}:`, error.message);
            continue;
        }

        if (data && data.length > 0) {
            addFinding({
                table: 'customers',
                issue: `Test email pattern: ${pattern}`,
                count: data.length,
                severity: pattern.includes('@test.') ? 'critical' : 'high',
                examples: data.slice(0, 3),
            });
        }
    }

    // Check leads
    for (const pattern of testPatterns) {
        const { data, error } = await supabase
            .from('leads')
            .select('id, email, full_name, created_at')
            .ilike('email', `%${pattern}%`)
            .limit(5);

        if (error) {
            console.error(`Error checking leads for ${pattern}:`, error.message);
            continue;
        }

        if (data && data.length > 0) {
            addFinding({
                table: 'leads',
                issue: `Test email pattern: ${pattern}`,
                count: data.length,
                severity: pattern.includes('@test.') ? 'critical' : 'high',
                examples: data.slice(0, 3),
            });
        }
    }

    // Check profiles
    for (const pattern of testPatterns) {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, email, full_name, created_at')
            .ilike('email', `%${pattern}%`)
            .limit(5);

        if (error) {
            console.error(`Error checking profiles for ${pattern}:`, error.message);
            continue;
        }

        if (data && data.length > 0) {
            addFinding({
                table: 'profiles',
                issue: `Test email pattern: ${pattern}`,
                count: data.length,
                severity: pattern.includes('@test.') ? 'critical' : 'high',
                examples: data.slice(0, 3),
            });
        }
    }
}

/**
 * Check for seed data patterns
 */
async function checkSeedDataPatterns() {
    console.log('\n🌱 Checking for seed data patterns...');

    // Check for "Test" prefix in estate names
    const { data: testEstates, error: estatesError } = await supabase
        .from('estates')
        .select('id, name, location, created_at')
        .ilike('name', 'Test%')
        .limit(10);

    if (estatesError) {
        console.error('Error checking estates:', estatesError.message);
    } else if (testEstates && testEstates.length > 0) {
        addFinding({
            table: 'estates',
            issue: 'Estate names starting with "Test"',
            count: testEstates.length,
            severity: 'critical',
            examples: testEstates.slice(0, 3),
        });
    }

    // Check for "Test" or "Demo" in customer names
    const { data: testCustomers, error: customersError } = await supabase
        .from('customers')
        .select('id, full_name, email, created_at')
        .or('full_name.ilike.%Test%,full_name.ilike.%Demo%')
        .neq('status', 'archived')
        .limit(10);

    if (customersError) {
        console.error('Error checking customers:', customersError.message);
    } else if (testCustomers && testCustomers.length > 0) {
        addFinding({
            table: 'customers',
            issue: 'Customer names containing "Test" or "Demo"',
            count: testCustomers.length,
            severity: 'high',
            examples: testCustomers.slice(0, 3),
        });
    }
}

/**
 * Check for is_test flag compliance
 */
async function checkTestFlagCompliance() {
    console.log('\n🏴 Checking is_test flag compliance...');

    const tables = ['customers', 'estates', 'leads'];

    for (const table of tables) {
        // Check if is_test column exists
        const { data, error } = await supabase
            .from(table)
            .select('id')
            .eq('is_test', true)
            .limit(1);

        if (error) {
            if (error.message.includes('column') && error.message.includes('does not exist')) {
                addFinding({
                    table,
                    issue: 'is_test column does not exist',
                    count: 0,
                    severity: 'medium',
                });
            } else {
                console.error(`Error checking ${table}:`, error.message);
            }
        } else {
            console.log(`✅ ${table} has is_test column`);
        }
    }
}

/**
 * Check for old soft-deleted records
 */
/**
 * Check for old soft-deleted records
 */
async function checkSoftDeletedRecords() {
    console.log('\n🗑️  Checking for old soft-deleted/archived records...');

    const retentionDays = 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Check customers (using status='archived' and updated_at as proxy for archival time)
    const { data: deletedCustomers, error: customersError } = await supabase
        .from('customers')
        .select('id, full_name, updated_at, status')
        .eq('status', 'archived')
        .lt('updated_at', cutoffDate.toISOString())
        .limit(10);

    if (customersError) {
        console.error('Error checking archived customers:', customersError.message);
    } else if (deletedCustomers && deletedCustomers.length > 0) {
        addFinding({
            table: 'customers',
            issue: `Archived records older than ${retentionDays} days`,
            count: deletedCustomers.length,
            severity: 'medium',
            examples: deletedCustomers.slice(0, 3),
        });
    }
}

/**
 * Check for old notifications
 */
async function checkOldNotifications() {
    console.log('\n🔔 Checking for old notifications...');

    const retentionDays = 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const { data: oldNotifications, error } = await supabase
        .from('notifications')
        .select('id, created_at, is_read')
        .eq('is_read', true)
        .lt('created_at', cutoffDate.toISOString())
        .limit(100);

    if (error) {
        console.error('Error checking notifications:', error.message);
    } else if (oldNotifications && oldNotifications.length > 0) {
        addFinding({
            table: 'notifications',
            issue: `Read notifications older than ${retentionDays} days`,
            count: oldNotifications.length,
            severity: 'low',
        });
    }
}

/**
 * Check for old communication logs
 */
async function checkOldCommunicationLogs() {
    console.log('\n📨 Checking for old communication logs...');

    const retentionDays = 365;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const { data: oldLogs, error } = await supabase
        .from('communication_logs')
        .select('id, created_at, channel, status')
        .lt('created_at', cutoffDate.toISOString())
        .limit(100);

    if (error) {
        console.error('Error checking communication logs:', error.message);
    } else if (oldLogs && oldLogs.length > 0) {
        addFinding({
            table: 'communication_logs',
            issue: `Communication logs older than ${retentionDays} days`,
            count: oldLogs.length,
            severity: 'low',
        });
    }
}

/**
 * Generate report
 */
function generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 DATA HYGIENE AUDIT REPORT');
    console.log('='.repeat(80));
    console.log(`\nGenerated: ${new Date().toISOString()}`);
    console.log(`Database: ${SUPABASE_URL}\n`);

    if (findings.length === 0) {
        console.log('✅ No issues found! Database is clean.\n');
        return;
    }

    // Group by severity
    const critical = findings.filter(f => f.severity === 'critical');
    const high = findings.filter(f => f.severity === 'high');
    const medium = findings.filter(f => f.severity === 'medium');
    const low = findings.filter(f => f.severity === 'low');

    console.log(`Total Issues Found: ${findings.length}\n`);
    console.log(`🔴 Critical: ${critical.length}`);
    console.log(`🟠 High: ${high.length}`);
    console.log(`🟡 Medium: ${medium.length}`);
    console.log(`🟢 Low: ${low.length}\n`);

    console.log('='.repeat(80));
    console.log('DETAILED FINDINGS');
    console.log('='.repeat(80));

    for (const finding of findings) {
        const icon = finding.severity === 'critical' ? '🔴' : finding.severity === 'high' ? '🟠' : finding.severity === 'medium' ? '🟡' : '🟢';
        console.log(`\n${icon} [${finding.severity.toUpperCase()}] ${finding.table}`);
        console.log(`   Issue: ${finding.issue}`);
        console.log(`   Count: ${finding.count} records`);

        if (finding.examples && finding.examples.length > 0) {
            console.log(`   Examples:`);
            finding.examples.forEach((example, i) => {
                console.log(`     ${i + 1}. ${JSON.stringify(example, null, 2).split('\n').join('\n        ')}`);
            });
        }
    }

    console.log('\n' + '='.repeat(80));
    console.log('RECOMMENDATIONS');
    console.log('='.repeat(80));

    if (critical.length > 0 || high.length > 0) {
        console.log('\n🚨 IMMEDIATE ACTION REQUIRED:');
        console.log('   - Review and remove test/seed data from production');
        console.log('   - Implement is_test flag on all tables');
        console.log('   - Set up automated cleanup policies');
    }

    if (medium.length > 0) {
        console.log('\n⚠️  RECOMMENDED ACTIONS:');
        console.log('   - Implement data retention policies');
        console.log('   - Schedule cleanup jobs for old records');
    }

    if (low.length > 0) {
        console.log('\n💡 NICE TO HAVE:');
        console.log('   - Archive old logs to reduce database size');
        console.log('   - Implement log rotation');
    }

    console.log('\n' + '='.repeat(80));

    // Save report to file
    const reportPath = path.join(process.cwd(), 'data-hygiene-audit-report.json');
    const reportData = {
        timestamp: new Date().toISOString(),
        database: SUPABASE_URL,
        summary: {
            total: findings.length,
            critical: critical.length,
            high: high.length,
            medium: medium.length,
            low: low.length,
        },
        findings,
    };

    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 Full report saved to: ${reportPath}\n`);
}

/**
 * Main execution
 */
async function main() {
    console.log('🔍 Starting Data Hygiene Audit...\n');
    console.log(`Database: ${SUPABASE_URL}`);
    console.log('Mode: READ-ONLY (no data will be modified)\n');

    try {
        await checkTestEmails();
        await checkSeedDataPatterns();
        await checkTestFlagCompliance();
        await checkSoftDeletedRecords();
        await checkOldNotifications();
        await checkOldCommunicationLogs();

        generateReport();
    } catch (error) {
        console.error('\n❌ Audit failed:', error);
        process.exit(1);
    }
}

main();
