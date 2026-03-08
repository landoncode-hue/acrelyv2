const bcrypt = require('bcryptjs');

const credentials = [
    { email: 'sysadmin@pinnaclegroups.ng', password: 'SysAdminPinnacle2025!', role: 'sysadmin', name: 'System Admin' },
    { email: 'ceo@pinnaclegroups.ng', password: 'CeoPinnacle2025!', role: 'ceo', name: 'CEO' },
    { email: 'md@pinnaclegroups.ng', password: 'MdPinnacle2025!', role: 'md', name: 'Managing Director' },
    { email: 'frontdesk@pinnaclegroups.ng', password: 'FrontDeskPinnacle2025!', role: 'frontdesk', name: 'Front Desk' }
];

async function generateHashes() {
    console.log('Generating hashes...');
    for (const cred of credentials) {
        const hash = await bcrypt.hash(cred.password, 10);
        console.log(`Email: ${cred.email}`);
        console.log(`Role: ${cred.role}`);
        console.log(`Hash: ${hash}`);
        console.log('---');
    }
}

generateHashes();
