import { NextResponse } from 'next/server';

export async function POST() { return NextResponse.json({ success: true, mocked: true }); }
export async function DELETE() { return NextResponse.json({ success: true, mocked: true }); }
