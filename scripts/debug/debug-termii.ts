
import dotenv from 'dotenv';
import fs from 'fs';

// Load envs
dotenv.config();
if (fs.existsSync('.env.local')) {
    const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function debugTermii() {
    const apiKey = process.env.TERMII_API_KEY;
    const baseUrl = process.env.TERMII_BASE_URL || "https://api.ng.termii.com";

    console.log("Checking Termii Configuration...");
    console.log(`Base URL: ${baseUrl}`);
    console.log(`API Key Present: ${!!apiKey}`);
    if (apiKey) console.log(`API Key Length: ${apiKey.length}`);

    if (!apiKey) {
        console.error("❌ Missing TERMII_API_KEY in .env");
        return;
    }

    try {
        const url = `${baseUrl}/api/get-balance?api_key=${apiKey}`;
        console.log(`Fetching from: ${baseUrl}/api/get-balance?api_key=***`);

        const res = await fetch(url);
        const status = res.status;
        console.log(`Response Status: ${status}`);

        const text = await res.text();
        console.log(`Raw Response Body:`, text);

        try {
            const json = JSON.parse(text);
            console.log("Parsed JSON:", json);
        } catch (e) {
            console.log("Failed to parse JSON response");
        }

    } catch (error) {
        console.error("Error calling Termii API:", error);
    }
}

debugTermii();
