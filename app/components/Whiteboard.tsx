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

const doc = new Y.Doc();

const yElements = doc.getArray<Y.Map<any>>('elements');
const yAssets = doc.getMap('assets');

const provider = new SocketIOProvider(
    `ws://localhost:1234`,
    'excalidraw-elements',
    doc,
    { autoConnect: true }
);
provider.awareness.setLocalStateField('user', {
    name: 'Anonymous' + Math.floor(Math.random() * 100),
    color: userColor.color,
    colorLight: userColor.light
});

export default function Whiteboard() {
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
    const [binding, setBindings] = useState<ExcalidrawBinding | null>(null)

    const providerRef = useRef<SocketIOProvider | null>(null);
    const excalidrawRef = useRef<HTMLDivElement | null>(null);


    // jab excalidraw ki api ready hoje tb 
    useEffect(() => {
        if (!excalidrawAPI || !excalidrawRef.current) return;


        const binding = new ExcalidrawBinding(
            yElements,
            yAssets,
            excalidrawAPI,
            providerRef.current?.awareness,
            { excalidrawDom: excalidrawRef.current, undoManager: new Y.UndoManager(yElements) }
        )
        setBindings(binding);
        return () => {
            setBindings(null);
            binding.destroy();
        }

    }, [excalidrawAPI]);

    const initData = {
        elements: yjsToExcalidraw(yElements)
    }

    return (
        <div ref={excalidrawRef} className="absolute inset-0">
            <Excalidraw
                excalidrawAPI={(api) => setExcalidrawAPI(api)}
                initialData={initData}
                onPointerUpdate={binding?.onPointerUpdate}
                theme="light"
            />
        </div>
    );
}