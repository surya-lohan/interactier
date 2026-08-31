import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";


// GET: Fetch user's recent rooms
export async function GET(request: NextRequest) {
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
        const rooms = await prisma.room.findMany({
            where: {
                OR: [
                    { userId: session.user.id },
                    { participants: { some: { userId: session.user.id } } },
                ]
            },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                },
                participants: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            }
        });

        return NextResponse.json({ success: true, rooms }, { status: 200 });

    } catch (error) {
        console.error("Fetch Rooms Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

//GET: Check if the room with roomId exist or not


// POST: Create a new room
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

        const userRole = "INTERVIEWER";

        const newRoom = await prisma.$transaction(async (tx) => {
            const room = await tx.room.create({
                data: {
                    userId: session.user.id,
                    status: "WAITING"
                }
            });

            await tx.roomParticipant.create({
                data: {
                    roomId: room.id,
                    userId: session.user.id,
                    role: userRole
                }
            });

            return room;
        });

        return NextResponse.json(
            { success: true, roomId: newRoom.id, room: newRoom },
            { status: 201 }
        );

    } catch (error) {
        console.error("Room Creation Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
