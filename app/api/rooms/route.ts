import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    // TODO: Implement rooms listing
    return NextResponse.json({ rooms: [] });
}
