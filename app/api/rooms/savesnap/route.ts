import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {

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

        const body = await request.json();

        const { roomId, code, drawingData, yjsStateArray } = body;

        if (!roomId || !yjsStateArray) {
            return NextResponse.json({
                error: "Missing required data",
                status: 400
            })
        }

        const yjsBuffer = Buffer.from(yjsStateArray);

        const snapshot = await prisma.snapshot.create({
            data: {
                roomId: roomId,
                userId: session.user.id,
                code: code || "",
                drawingData: drawingData || {},
                yjsState: yjsBuffer
            }
        })
        return NextResponse.json({ success: true, snapshotId: snapshot.id });
    } catch (error) {
        console.error("Snapshot Save Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}