import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorised access. Please log in first." },
                { status: 401 }
            );
        }

        const { id } = await params;

        const snapshot = await prisma.snapshot.findFirst({
            where: {
                roomId: id,
            }
        });

        return NextResponse.json({ success: true, snapshot }, { status: 200 });

    } catch (error) {
        console.error("Fetch Rooms Error:", error);
        return NextResponse.json(
            { error: error },
            { status: 500 }
        );
    }
}