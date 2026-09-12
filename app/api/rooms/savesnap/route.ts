import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {

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

        const { roomId, code, drawingData, snapshotId } = body;

        if (!roomId || !snapshotId) {
            return NextResponse.json({
                error: "Missing required data",
                status: 400
            })
        }


        const snapshot = await prisma.snapshot.update({
            where: { roomId: roomId, id: snapshotId },
            data: {
                code: code ?? "",
                drawingData: drawingData ?? {},
            }
        })
        return NextResponse.json({ success: true, snapshot: snapshot });
    } catch (error) {
        console.error("Snapshot Save Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}