"use client";

import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { ExcalidrawBinding, yjsToExcalidraw } from "@mizuka/y-excalidraw";
import * as random from 'lib0/random';
import { useRoom } from "../Context/RoomContext";
import { useTheme } from "../Context/ThemeContext";

const Excalidraw = dynamic(
    async () => ((await import("@excalidraw/excalidraw")).Excalidraw),
    {
        ssr: false
    }
);

export const usercolors = [
    { color: '#2563EB', light: '#2563EB33' },
    { color: '#10B981', light: '#10B98133' },
    { color: '#F59E0B', light: '#F59E0B33' },
    { color: '#7C3AED', light: '#7C3AED33' },
    { color: '#EF4444', light: '#EF444433' },
    { color: '#06B6D4', light: '#06B6D433' },
    { color: '#EC4899', light: '#EC489933' },
];

export const userColor = usercolors[random.uint32() % usercolors.length];

function getInitialElements(data: unknown): readonly ExcalidrawElement[] {
    if (!data) return [];
    if (data instanceof Y.Array) {
        return yjsToExcalidraw(data);
    }
    if (Array.isArray(data)) {
        return data.map((item: any) => (item?.el ? item.el : item));
    }
    return [];
}

export default function Whiteboard({ yElement }: { yElement?: Y.Array<Y.Map<any>> | any[] | Record<string, any> | null }) {
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
    const [binding, setBindings] = useState<ExcalidrawBinding | null>(null);

    const excalidrawRef = useRef<HTMLDivElement | null>(null);
    const yElementsRef = useRef<Y.Array<Y.Map<any>>>(null);
    const { yDoc, provider } = useRoom();
    const { theme } = useTheme();

    useEffect(() => {
        if (!excalidrawAPI || !excalidrawRef.current || !yDoc || !provider) return;

        const yElements = yDoc.getArray<Y.Map<any>>('elements');
        yElementsRef.current = yElements;

        const sceneElements = excalidrawAPI.getSceneElements();
        const rawElements = (Array.isArray(yElement) && yElement.length > 0)
            ? yElement
            : (sceneElements.length > 0 ? sceneElements : []);

        if (yElements.length === 0 && rawElements.length > 0) {
            yDoc.transact(() => {
                const maps = rawElements.map((item: any, index: number) => {
                    const el = item?.el ? item.el : item;
                    const pos = item?.pos ?? String(index).padStart(6, '0');
                    return new Y.Map(Object.entries({ pos, el }));
                });
                yElements.push(maps);
            });
        }

        const yAssets = yDoc.getMap('assets');

        const binding = new ExcalidrawBinding(
            yElements,
            yAssets,
            excalidrawAPI,
            provider.awareness,
            { excalidrawDom: excalidrawRef.current, undoManager: new Y.UndoManager(yElements) }
        );

        const syncedElements = yjsToExcalidraw(yElements);
        if (syncedElements.length > 0) {
            excalidrawAPI.updateScene({ elements: syncedElements });
        }

        setBindings(binding);

        return () => {
            setBindings(null);
            binding.destroy();
        };
    }, [excalidrawAPI, yDoc, provider, yElement]);

    // Reactively update Excalidraw theme when user toggles dark/light mode
    useEffect(() => {
        if (!excalidrawAPI) return;
        excalidrawAPI.updateScene({
            appState: {
                theme: theme === "dark" ? "dark" : "light",
                viewBackgroundColor: theme === "dark" ? "#070D1E" : "#FAFAFC",
                currentItemStrokeColor: theme === "dark" ? "#FFFFFF" : "#0F172A",
            }
        });
    }, [theme, excalidrawAPI]);

    const isDark = theme === "dark";

    const initData = {
        elements: getInitialElements(yElement),
        appState: {
            theme: (isDark ? "dark" : "light") as "dark" | "light",
            viewBackgroundColor: isDark ? "#070D1E" : "#FAFAFC",
            currentItemStrokeColor: isDark ? "#FFFFFF" : "#0F172A",
        }
    };

    return (
        <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#FAFAFC] dark:bg-[#070D1E] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-200">
            {/* Top Toolbar matching CodeEditor */}
            <div className="h-11 px-4 relative flex justify-between items-center shrink-0 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0E172E] transition-colors duration-200">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A] dark:text-white">
                    <div className="w-6 h-6 rounded-lg bg-[#ECFDF5] dark:bg-emerald-950/40 text-[#10B981] dark:text-emerald-400 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </div>
                    <span>Canvas</span>
                </div>
            </div>

            {/* Excalidraw Canvas Area */}
            <div className="flex-1 w-full min-h-0 relative bg-[#FAFAFC] dark:bg-[#070D1E]">
                <div ref={excalidrawRef} className="w-full h-full">
                    <Excalidraw
                        excalidrawAPI={(api) => setExcalidrawAPI(api)}
                        initialData={initData}
                        onPointerUpdate={binding?.onPointerUpdate}
                        theme={isDark ? "dark" : "light"}
                    />
                </div>
            </div>
        </div>
    );
}   