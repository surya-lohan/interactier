import dynamic from 'next/dynamic';
import { useRef, useEffect, useState } from 'react';
import { MonacoBinding } from 'y-monaco';
import { useRoom } from '../Context/RoomContext';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
    ssr: false
})


export default function CodeEditor() {
    const [editor, setEditor] = useState<any>(null);
    const bindingRef = useRef<MonacoBinding | null>(null);

    const [code, setCode] = useState("const");

    const { yDoc, provider } = useRoom();
    // Create binding once editor, yDoc, and provider are all ready
    useEffect(() => {
        if (!editor || !yDoc || !provider) return;

        let cancelled = false;

        const createBinding = async () => {
            const { MonacoBinding } = await import("y-monaco");
            if (cancelled) return;

            const yText = yDoc.getText('monaco');

            bindingRef.current = new MonacoBinding(
                yText,
                editor.getModel(),
                new Set([editor]),
                provider.awareness
            );
        };

        createBinding();

        return () => {
            cancelled = true;
            if (bindingRef.current) {
                bindingRef.current.destroy();
                bindingRef.current = null;
            }
        }
    }, [editor, yDoc, provider]);

    function getValue() {
        const editorValue = editor?.getValue();

        console.log(editorValue)
    }

    return (
        <div className="h-full w-full">
            <MonacoEditor
                height="100%"
                width="100%"
                language="javascript"
                theme="vs-dark"
                onMount={(api) => setEditor(api)}
                options={{
                    automaticLayout: true,
                }}
            />
        </div>
    );
};