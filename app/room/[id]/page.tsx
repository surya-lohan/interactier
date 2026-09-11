"use client";
import { use, useEffect, useState } from "react";
import Whiteboard from "@/app/components/Whiteboard";
import RoomContext from "@/app/Context/RoomContext";
import CodeEditor from "@/app/components/CodeEditor";
import Navbar from "@/app/components/Navbar";
import { Group, Panel, Separator } from "react-resizable-panels";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session, isPending } = authClient.useSession();
    const router = useRouter();

    useEffect(() => {
        if (!session && !isPending) {
            router.push('/auth/signin')
        }
    }, [session, isPending, router]);

    return (
        <RoomContext roomId={id}>
            <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#070D1E]">
                <Navbar roomId={id} />
                <main className="relative flex flex-1 w-full pt-14 overflow-hidden">
                    <Group orientation="horizontal">
                        <Panel defaultSize="50%" className="h-full w-full relative overflow-hidden bg-[#070D1E]">
                            <CodeEditor />
                        </Panel>
                        <Separator className="w-2 bg-slate-900/80 hover:bg-slate-800 transition-colors cursor-col-resize flex items-center justify-center relative z-10 group">
                            <div className="w-0.5 h-8 rounded-full bg-slate-700 group-hover:bg-[#8083FF] transition-colors" />
                        </Separator>
                        <Panel defaultSize="50%" className="h-full w-full relative overflow-hidden bg-[#070D1E]">
                            <Whiteboard />
                        </Panel>
                    </Group>
                </main>
            </div>
        </RoomContext>
    );
}