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
            return NextResponse.json({
                error: "Unauthorized"
            }, {
                status: 401
            })
        }

        const { id: roomId } = await params;

        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: {
                participants: true
            }
        });

        //if room doesn't exist
        if (!room) {
            return NextResponse.json({
                allowed: false,
                reason: "Room not found!"
            })
        }

        if (room.status === "COMPLETED") {
            return NextResponse.json({
                allowed: false,
                reason: "Room completed"
            })
        }

        const userId = session.user.id;

        const isHost = room.userId === userId;
        const isExistingParticipant = room.participants.some(p => p.userId === userId);


        if (isHost || isExistingParticipant) {
            return NextResponse.json({
                allowed: true, role: isHost ? "INTERVIEWER" : "USER"
            });
        }

        if (room.participants.length < 2 && room.status === "WAITING") {
            await prisma.$transaction([
                prisma.roomParticipant.create({
                    data: {
                        roomId: room.id,
                        userId: userId,
                        role: "USER"
                    }
                }),
                prisma.room.update({
                    where: { id: room.id },
                    data: {
                        status: "IN_PROGRESS"
                    }
                })
            ])
            return NextResponse.json({
                allowed: true, role: "USER"
            })
        }

        return NextResponse.json({
            allowed: false, reason: "Room is full"
        })
    } catch (error) {
        console.error("Room validation error");
        return NextResponse.json({
            error: "Internal Server Error"
        })
    }
}