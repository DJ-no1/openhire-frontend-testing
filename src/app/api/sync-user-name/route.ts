import { NextRequest, NextResponse } from 'next/server';
import { syncCurrentUserName } from '@/lib/fix-user-names';

export async function POST(request: NextRequest) {
    try {
        const result = await syncCurrentUserName();

        return NextResponse.json(result, {
            status: result.success ? 200 : 400
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: `Server error: ${error}` },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    return NextResponse.json(
        { message: 'Use POST to sync current user name' },
        { status: 200 }
    );
}
