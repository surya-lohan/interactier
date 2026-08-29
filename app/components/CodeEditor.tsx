import dynamic from 'next/dynamic';
import { useRef, useEffect } from 'react';
import { MonacoBinding } from 'y-monaco';
import { useRoom } from '../Context/RoomContext';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
    ssr: false
})


export default function CodeEditor() {
    const editorRef = useRef(null);
    const bindingRef = useRef<MonacoBinding | null>(null);

    const { yDoc, provider } = useRoom();

    const handleMount = async (editor: any) => {
        const { MonacoBinding } = await import("y-monaco");//have to dynamically import to avoid type errors occuring

        if (!yDoc || !provider) return;
        const yText = yDoc.getText('monaco');
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
        }
    }, [])
    return (
        <>
            <div>
                <MonacoEditor
                    height={'100vh'}
                    width={'50vw'}
                    language='javascript'
                    theme='vs-dark'
                    onMount={handleMount}
                />
            </div>
        </>
    )
};