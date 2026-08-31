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

    return (
        <>
            <div>
                <MonacoEditor
                    height={'100vh'}
                    width={'50vw'}
                    language='javascript'
                    theme='vs-dark'
                    onMount={(api) => setEditor(api)}
                />
            </div>
        </>
    )
};