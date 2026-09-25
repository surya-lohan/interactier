"use client";

import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import { useEffect, useMemo, useRef, useState } from "react";
import * as Y from "yjs";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { ExcalidrawBinding, yjsToExcalidraw } from "@/lib/y-excalidraw";
import * as random from 'lib0/random';
import { useRoom } from "../Context/RoomContext";
import { useTheme } from "../Context/ThemeContext";

const Excalidraw = dynamic(
    async () => ((await import("@excalidraw/excalidraw")).Excalidraw),
    {
        ssr: false
    }
);

import { generateNKeysBetween } from "fractional-indexing";

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
    let list: any[] = [];
    if (data instanceof Y.Array) {
        list = yjsToExcalidraw(data);
    } else if (Array.isArray(data)) {
        list = data.map((item: any) => (item?.el ? item.el : item));
    }

    if (!list || list.length === 0) return [];

    // Deduplicate elements by ID to avoid index and state collisions
    const uniqueMap = new Map<string, any>();
    for (const item of list) {
        if (item && item.id) {
            uniqueMap.set(item.id, item);
        }
    }
    const uniqueElements = Array.from(uniqueMap.values());
    if (uniqueElements.length === 0) return [];

    // Ensure strictly valid, ascending fractional indices
    const keys = generateNKeysBetween(null, null, uniqueElements.length);
    let needsReindexing = false;
    const seenIndices = new Set<string>();

    for (let i = 0; i < uniqueElements.length; i++) {
        const idx = uniqueElements[i]?.index;
        if (!idx || seenIndices.has(idx)) {
            needsReindexing = true;
            break;
        }
        if (i > 0 && uniqueElements[i - 1]?.index >= idx) {
            needsReindexing = true;
            break;
        }
        seenIndices.add(idx);
    }

    if (needsReindexing) {
        return uniqueElements.map((el, i) => ({
            ...el,
            index: keys[i]
        }));
    }

    return uniqueElements;
}

interface WhiteboardProps {
    yElement?: Y.Array<Y.Map<any>> | any[] | Record<string, any> | null;
    isMaximized?: boolean;
    onToggleMaximize?: () => void;
}

export default function Whiteboard({ yElement, isMaximized, onToggleMaximize }: WhiteboardProps) {
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
    const [binding, setBindings] = useState<ExcalidrawBinding | null>(null);

    const excalidrawRef = useRef<HTMLDivElement | null>(null);
    const yElementsRef = useRef<Y.Array<Y.Map<any>>>(null);
    const { yDoc, provider } = useRoom();
    const { theme } = useTheme();

    useEffect(() => {
        if (!excalidrawAPI || !excalidrawRef.current || !yDoc || !provider) return;

        let activeBinding: ExcalidrawBinding | null = null;
        let isCancelled = false;
        let stabilizationTimer: ReturnType<typeof setTimeout> | null = null;

        const yElements = yDoc.getArray<Y.Map<any>>('elements');
        yElementsRef.current = yElements;
        const yAssets = yDoc.getMap('assets');

        const initializeWhiteboard = () => {
            if (isCancelled || activeBinding) return;

            // 1. Deduplicate any duplicate elements in yElements (heals any corrupted remote doc state)
            const seenIds = new Set<string>();
            const duplicatesToRemove: number[] = [];
            for (let i = 0; i < yElements.length; i++) {
                const map = yElements.get(i);
                const el = map?.get("el");
                if (!el || !el.id || seenIds.has(el.id)) {
                    duplicatesToRemove.push(i);
                } else {
                    seenIds.add(el.id);
                }
            }

            if (duplicatesToRemove.length > 0) {
                yDoc.transact(() => {
                    for (let i = duplicatesToRemove.length - 1; i >= 0; i--) {
                        yElements.delete(duplicatesToRemove[i], 1);
                    }
                });
            }
            // Never seed from local sceneElements (which are empty after reload) to avoid overwriting existing server data.
            if (yElements.length === 0) {
                // Only seed from the explicit yElement prop
                const rawElements = (Array.isArray(yElement) && yElement.length > 0) ? yElement : [];

                if (rawElements.length > 0) {
                    const uniqueRawMap = new Map<string, any>();
                    for (const item of rawElements) {
                        const el = item?.el ? item.el : item;
                        if (el && el.id) {
                            uniqueRawMap.set(el.id, item);
                        }
                    }
                    const uniqueRaw = Array.from(uniqueRawMap.values());

                    if (uniqueRaw.length > 0) {
                        const validKeys = generateNKeysBetween(null, null, uniqueRaw.length);
                        yDoc.transact(() => {
                            const maps = uniqueRaw.map((item: any, index: number) => {
                                const originalEl = item?.el ? item.el : item;
                                const pos = validKeys[index];
                                const el = { ...originalEl, index: pos };
                                return new Y.Map(Object.entries({ pos, el }));
                            });
                            yElements.push(maps);
                        });
                    }
                }
            } else {
                // Ensure all elements in yElements have valid, distinct indices to prevent Excalidraw Zz >= Zz
                const count = yElements.length;
                let hasCollision = false;
                const seenPos = new Set<string>();
                for (let i = 0; i < count; i++) {
                    const map = yElements.get(i);
                    const pos = map?.get("pos");
                    const el = map?.get("el");
                    if (!pos || !el?.index || seenPos.has(pos) || seenPos.has(el.index)) {
                        hasCollision = true;
                        break;
                    }
                    seenPos.add(pos);
                    seenPos.add(el.index);
                }

                if (hasCollision) {
                    const newKeys = generateNKeysBetween(null, null, count);
                    yDoc.transact(() => {
                        for (let i = 0; i < count; i++) {
                            const map = yElements.get(i);
                            const el = map?.get("el");
                            const newPos = newKeys[i];
                            map.set("pos", newPos);
                            if (el) {
                                map.set("el", { ...el, index: newPos });
                            }
                        }
                    });
                }
            }

            // 3. Connect ExcalidrawBinding with clean, valid elements
            activeBinding = new ExcalidrawBinding(
                yElements,
                yAssets,
                excalidrawAPI,
                provider.awareness,
                { excalidrawDom: excalidrawRef.current!, undoManager: new Y.UndoManager(yElements) }
            );

            const syncedElements = yjsToExcalidraw(yElements);
            if (syncedElements.length > 0) {
                excalidrawAPI.updateScene({ elements: syncedElements, appState: {}, captureUpdate: "NEVER" as any });
            }

            setBindings(activeBinding);
        };
        // This prevents the race condition where synced=true but data hasn't been applied yet,
        // which would incorrectly treat a non-empty room as empty and overwrite server data.
        const STABILIZATION_DELAY_MS = 350;

        const onSyncedAndStabilized = () => {
            if (isCancelled) return;
            stabilizationTimer = setTimeout(() => {
                if (!isCancelled) initializeWhiteboard();
            }, STABILIZATION_DELAY_MS);
        };

        if (provider.synced) {
            onSyncedAndStabilized();
        } else {
            const onSync = (isSynced: boolean) => {
                if (isSynced) {
                    provider.off('synced', onSync);
                    provider.off('sync', onSync);
                    onSyncedAndStabilized();
                }
            };
            provider.on('synced', onSync);
            provider.on('sync', onSync);
        }

        return () => {
            isCancelled = true;
            if (stabilizationTimer !== null) clearTimeout(stabilizationTimer);
            if (activeBinding) {
                activeBinding.destroy();
                setBindings(null);
            }
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

    const initData = useMemo(() => ({
        elements: getInitialElements(yElement),
        appState: {
            theme: (isDark ? "dark" : "light") as "dark" | "light",
            viewBackgroundColor: isDark ? "#070D1E" : "#FAFAFC",
            currentItemStrokeColor: isDark ? "#FFFFFF" : "#0F172A",
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []);

    return (
        <div
            id="whiteboard-container"
            className="relative w-full h-full flex flex-col overflow-hidden bg-[#FAFAFC] dark:bg-[#070D1E] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-200"
        >
            <div className="h-11 px-4 relative flex justify-between items-center shrink-0 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0E172E] transition-colors duration-200">
                <div className="flex items-center w-full justify-between gap-2 text-xs font-semibold text-[#0F172A] dark:text-white">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#ECFDF5] dark:bg-emerald-950/40 text-[#10B981] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] dark:bg-emerald-400"></span>
                            Canvas
                        </span>
                    </div>
                    {onToggleMaximize && (
                        <button
                            type="button"
                            onClick={onToggleMaximize}
                            title={isMaximized ? "Restore code editor" : "Maximize canvas"}
                            className="w-8 h-8 rounded-xl bg-[#F8FAFC] dark:bg-[#15203D] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] hover:text-[#0F172A] dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                            {isMaximized ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="w-3.5 h-3.5" viewBox="0 0 16 16">
                                    <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5m5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5M0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5m10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="w-3.5 h-3.5" viewBox="0 0 16 16">
                                    <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5M.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5" />
                                </svg>
                            )}
                        </button>
                    )}
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