
function parseSmartDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString();
    dateStr = dateStr.trim();

    console.log(`Testing: "${dateStr}"`);

    // Handle D-Mon-YY (e.g. 9-Jan-25) directly
    if (dateStr.match(/^\d{1,2}-[A-Za-z]{3}-\d{2,4}$/)) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            console.log(`  Match custom regex -> ${d.toISOString()}`);
            return d.toISOString();
        }
    }

    // Try Standard (Default to US MM/DD/YYYY in Node/V8)
    const try1 = new Date(dateStr);
    if (!isNaN(try1.getTime())) {
        console.log(`  Standard parse valid -> ${try1.toISOString()}`);
        // But wait, is '23/10/2024' valid in Node?
        return try1.toISOString();
    } else {
        console.log(`  Standard parse invalid`);
    }

    // Try Swapping first two parts (DD/MM/YYYY -> MM/DD/YYYY)
    const parts = dateStr.split(/[\/\-]/);
    if (parts.length === 3) {
        // Construct MM/DD/YYYY
        const swap = `${parts[1]}/${parts[0]}/${parts[2]}`;
        const try2 = new Date(swap);
        if (!isNaN(try2.getTime())) {
            console.log(`  Swap success ${swap} -> ${try2.toISOString()}`);
            return try2.toISOString();
        } else {
            console.log(`  Swap failed ${swap}`);
        }
    }

    console.log(`  Fallback to now`);
    return new Date().toISOString();
}

const testCases = [
    "7/30/2024",       // US Format
    "23/10/2024",      // UK Format
    "9-Jan-25",        // Custom Format
    "2024-01-20",      // ISO
    "11/9/2024",       // Ambiguous
    "14/12/2024"       // Explicit UK
];

testCases.forEach(parseSmartDate);
