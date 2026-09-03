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


export default function Whiteboard() {
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

        const yAssets = yDoc.getMap('assets');

        const binding = new ExcalidrawBinding(
            yElements,
            yAssets,
            excalidrawAPI,
            provider.awareness,
            { excalidrawDom: excalidrawRef.current, undoManager: new Y.UndoManager(yElements) }
        )

        setBindings(binding);

        return () => {
            setBindings(null);
            binding.destroy();
        }

    }, [excalidrawAPI, yDoc, provider]);

    const initData = {
        elements: yElementsRef.current ? yjsToExcalidraw(yElementsRef.current) : []
    }

    return (
        <div ref={excalidrawRef} className="inset-0 absolute">
            <Excalidraw
                excalidrawAPI={(api) => setExcalidrawAPI(api)}
                initialData={initData}
                onPointerUpdate={binding?.onPointerUpdate}
                theme="light"
            />
        </div>
    );
}