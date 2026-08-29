"use client";
import { use } from "react";
import Whiteboard from "@/app/components/Whiteboard";
import RoomContext from "@/app/Context/RoomContext";
import CodeEditor from "@/app/components/CodeEditor";

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <>
            <RoomContext roomId={id}>
                <div className="flex w-full h-screen">
                    <div className="w-1/2 border-r border-gray-700">
                        <CodeEditor />
                    </div>
                    <div className="w-1/2 relative">
                        <Whiteboard />
                    </div>
                </div>
            </RoomContext>
        </>
    );
}