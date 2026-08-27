"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import * as Y from "yjs";
import type { MonacoBinding } from "y-monaco";
import type { WebsocketProvider } from "y-websocket";
import Mediacomponent from "@/app/components/MediaComponent";

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
    ssr: false
})

export default function CodeEditor() {
    const editorRef = useRef(null);
    const yDocRef = useRef<Y.Doc | null>(null);
    const providerRef = useRef<WebsocketProvider | null>(null);
    const bindingRef = useRef<MonacoBinding | null>(null);

    const handleMount = async (editor: any) => {
        editorRef.current = editor;
        const { MonacoBinding } = await import("y-monaco");//have to dynamically import both to avoid type errors occuring
        const { WebsocketProvider } = await import("y-websocket");

        const doc = new Y.Doc();
        yDocRef.current = doc;
        const yText = doc.getText('monaco');
        const provider = new WebsocketProvider(
            `${location.protocol === 'http:' ? 'ws:' : 'wss:'}//localhost:8080`,
            'monaco',
            doc
        );
        providerRef.current = provider;

        bindingRef.current = new MonacoBinding(
            yText,
            editor.getModel(),
            new Set([editor]),
            provider.awareness
        );
    }

    useEffect(() => {
        return () => {
            if (bindingRef.current) {
                bindingRef.current.destroy();
            }
            if (providerRef.current) {
                providerRef.current.disconnect();
            }
            if (yDocRef.current) {
                yDocRef.current.destroy();
            }
        }
    }, [])
    return (
        <>
            <div className="flex gap-4">
                <MonacoEditor
                    height="100vh"
                    width={`50vw`}
                    language="javascript"
                    theme="vs-dark"
                    onMount={handleMount}
                />
                <Mediacomponent />
            </div>
        </>
    );
};