import { NextResponse } from 'next/server';
import { getTermiiBalance } from "@/lib/termii";

export async function GET() {
    const data = await getTermiiBalance();

    if (data.error) {
        return NextResponse.json({ balance: 0 }, { status: 500 });
    }

    return NextResponse.json(data);
}
