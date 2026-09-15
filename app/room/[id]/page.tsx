"use client";
import { use, useEffect, useState } from "react";
import Whiteboard from "@/app/components/Whiteboard";
import RoomContext from "@/app/Context/RoomContext";
import CodeEditor from "@/app/components/CodeEditor";
import Navbar from "@/app/components/Navbar";
import { Group, Panel, Separator } from "react-resizable-panels";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Mediacomponent from "@/app/components/MediaComponent";

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session, isPending } = authClient.useSession();
    const router = useRouter();

    const [snapshotId, setSnapShotId] = useState("");
    const [code, setCode] = useState("");
    const [yElements, setYElements] = useState<any[] | null>(null);
    const [isValidating, setIsValidating] = useState(true);

    useEffect(() => {
        if (!session && !isPending) {
            router.push('/auth/signin')
        }
    }, [session, isPending, router]);


    useEffect(() => {

        if (!session) return;

        const validateAndLoad = async () => {
            try {
                const valRes = await fetch(`/api/rooms/validate/${id}`);
                const valData = await valRes.json();

                if (!valData.allowed) {
                    console.warn("Access denied to room!", valData.reason);
                    router.replace("/dashboard");
                    return;
                }

                const snapRes = await fetch(`/api/rooms/snapshot/${id}`);

                const snapData = await snapRes.json();

                if (snapData?.snapshot) {
                    setSnapShotId(snapData.snapshot.id);
                    setCode(snapData.snapshot.code ?? snapData.code ?? "");
                    setYElements(snapData.snapshot.drawingData ?? snapData.drawingData ?? []);
                }
                setIsValidating(false);
            } catch (error) {
                console.error("Validation error: ", error);
                router.replace("/dashboard")
            }
        }
        validateAndLoad();
    }, [id, session, router]);

    if (isValidating || isPending) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#070D1E] text-slate-300 gap-3">
                <div className="w-8 h-8 border-2 border-[#8083FF] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium text-slate-400">Verifying room access...</span>
            </div>
        );
    }

    return (
        <RoomContext roomId={id}>
            <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#070D1E]">
                <Navbar roomId={id} snapshotId={snapshotId} />
                <Mediacomponent roomId={id} />
                <main className="relative flex flex-1 w-full pt-14 overflow-hidden">
                    <Group orientation="horizontal">
                        <Panel defaultSize="50%" className="h-full w-full relative overflow-hidden bg-[#070D1E]">
                            <CodeEditor code={code} />
                        </Panel>
                        <Separator className="w-2 bg-slate-900/80 hover:bg-slate-800 transition-colors cursor-col-resize flex items-center justify-center relative z-10 group">
                            <div className="w-0.5 h-8 rounded-full bg-slate-700 group-hover:bg-[#8083FF] transition-colors" />
                        </Separator>
                        <Panel defaultSize="50%" className="h-full w-full relative overflow-hidden bg-[#070D1E]">
                            <Whiteboard yElement={yElements} />
                        </Panel>
                    </Group>
                </main>
            </div>
        </RoomContext>
    );
}