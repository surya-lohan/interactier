"use client"
import dynamic from "next/dynamic"
import "@excalidraw/excalidraw/index.css";
import { useEffect, useRef, useState } from "react";
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { ExcalidrawBinding, yjsToExcalidraw } from "@mizuka/y-excalidraw";
import * as random from 'lib0/random'
import { useRoom } from "../Context/RoomContext";

const Excalidraw = dynamic(
    async () => ((await import("@excalidraw/excalidraw")).Excalidraw),
    {
        ssr: false
    }
);

export const usercolors = [
    { color: '#30bced', light: '#30bced33' },
    { color: '#6eeb83', light: '#6eeb8333' },
    { color: '#ffbc42', light: '#ffbc4233' },
    { color: '#ecd444', light: '#ecd44433' },
    { color: '#ee6352', light: '#ee635233' },
    { color: '#9ac2c9', light: '#9ac2c933' },
    { color: '#8acb88', light: '#8acb8833' },
    { color: '#1be7ff', light: '#1be7ff33' }
]

export const userColor = usercolors[random.uint32() % usercolors.length]


function getInitialElements(data: unknown): readonly ExcalidrawElement[] {
    if (!data) return [];
    if (data instanceof Y.Array) {
        console.log(yjsToExcalidraw(data))
        return yjsToExcalidraw(data);
    }
    if (Array.isArray(data)) {
        return data.map((item: any) => (item?.el ? item.el : item));
    }
    return [];
}

export default function Whiteboard({ yElement }: { yElement?: Y.Array<Y.Map<any>> | any[] | Record<string, any> | null }) {
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
    const [binding, setBindings] = useState<ExcalidrawBinding | null>(null)


    const excalidrawRef = useRef<HTMLDivElement | null>(null);
    const yElementsRef = useRef<Y.Array<Y.Map<any>>>(null)
    const { yDoc, provider } = useRoom();


    // jab excalidraw ki api ready hoje tb 
    useEffect(() => {
        if (!excalidrawAPI || !excalidrawRef.current || !yDoc || !provider) return;

        const yElements = yDoc.getArray<Y.Map<any>>('elements');
        yElementsRef.current = yElements;

        const sceneElements = excalidrawAPI.getSceneElements();
        const rawElements = (Array.isArray(yElement) && yElement.length > 0)
            ? yElement
            : (sceneElements.length > 0 ? sceneElements : []);

        console.log("[Whiteboard] Binding effect running:", {
            yElementsLength: yElements.length,
            rawElementsLength: rawElements.length,
            sceneElementsLength: sceneElements.length,
        });

        // Agar yDoc me elements nahi hain aur snapshot ya canvas data available hai, toh yDoc me seed karein
        if (yElements.length === 0 && rawElements.length > 0) {
            yDoc.transact(() => {
                const maps = rawElements.map((item: any, index: number) => {
                    const el = item?.el ? item.el : item;
                    const pos = item?.pos ?? String(index).padStart(6, '0');
                    return new Y.Map(Object.entries({ pos, el }));
                });
                yElements.push(maps);
            });
            console.log("[Whiteboard] Seeded yDoc with", rawElements.length, "elements");
        }

        const yAssets = yDoc.getMap('assets');

        const binding = new ExcalidrawBinding(
            yElements,
            yAssets,
            excalidrawAPI,
            provider.awareness,
            { excalidrawDom: excalidrawRef.current, undoManager: new Y.UndoManager(yElements) }
        );

        // Explicitly ensure scene has the elements if yElements has them
        const syncedElements = yjsToExcalidraw(yElements);
        if (syncedElements.length > 0) {
            excalidrawAPI.updateScene({ elements: syncedElements });
        }

        setBindings(binding);

        return () => {
            setBindings(null);
            binding.destroy();
        }
    }, [excalidrawAPI, yDoc, provider, yElement]);

    const initData = {
        elements: getInitialElements(yElement),
        appState: {
            theme: "dark" as const,
            viewBackgroundColor: "#070D1E",
            currentItemStrokeColor: "#ffffff",
        }
    }

    return (
        <div className="relative w-full h-full overflow-hidden bg-[#070D1E]">
            <div ref={excalidrawRef} className="w-full h-full">
                <Excalidraw
                    excalidrawAPI={(api) => setExcalidrawAPI(api)}
                    initialData={initData}
                    onPointerUpdate={binding?.onPointerUpdate}
                    theme="dark"
                />
            </div>
        </div>
    );
}