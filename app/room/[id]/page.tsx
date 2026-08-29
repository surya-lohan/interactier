"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import * as Y from "yjs";
import type { MonacoBinding } from "y-monaco";
import type { SocketIOProvider } from "y-socket.io";
import Whiteboard from "@/app/components/Whiteboard";

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
    ssr: false
})


export default function CodeEditor() {
    const editorRef = useRef(null);
    const yDocRef = useRef<Y.Doc | null>(null);
    const providerRef = useRef<SocketIOProvider | null>(null);
    const bindingRef = useRef<MonacoBinding | null>(null);

    const handleMount = async (editor: any) => {
        editorRef.current = editor;
        const { MonacoBinding } = await import("y-monaco");//have to dynamically import both to avoid type errors occuring
        const { SocketIOProvider } = await import("y-socket.io");

        const doc = new Y.Doc();
        yDocRef.current = doc;
        const yText = doc.getText('monaco');
        const provider = new SocketIOProvider(
            `${location.protocol === 'http:' ? 'ws:' : 'wss:'}//localhost:1234`,
            'monaco',
            doc,
            {

            }
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
            <div className="flex">
                <MonacoEditor
                    height="100vh"
                    width={`50vw`}
                    language="javascript"
                    theme="vs-dark"
                    onMount={handleMount}
                />
                <div className="w-1/2 h-screen relative">
                    <Whiteboard />
                </div>
            </div>
        </>
    );
};