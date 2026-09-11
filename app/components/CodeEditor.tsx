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
    const [menu, setMenu] = useState(false);
    const [lang, setLang] = useState("javascript");

    const { yDoc, provider } = useRoom();

    const languages = [
        { id: 1, name: "javascript" },
        { id: 2, name: "cpp" },
        { id: 3, name: "java" }
    ]

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

    function handleListClick(lang: { id: number, name: string }): void {
        if (!lang) {
            return;
        }
        setLang(lang.name);
        setMenu(false);
    }

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="p-2 relative flex justify-between items-center shrink-0">
                <button
                    onClick={() => setMenu(!menu)}
                    data-popover-target="menu"
                    className="rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all hover:shadow-lg focus:shadow-none hover:bg-slate-700 disabled:pointer-events-none disabled:opacity-50 ml-2 cursor-pointer"
                    type="button"
                >
                    {lang}
                </button>
                {menu && (
                    <ul
                        role="menu"
                        data-popover="menu"
                        data-popover-placement="bottom"
                        className="absolute left-2 top-full mt-1.5 z-20 min-w-45 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg focus:outline-none"
                    >
                        {languages.map((lang) => (
                            <li
                                onClick={() => handleListClick(lang)}
                                key={lang.id}
                                role="menuitem"
                                className="cursor-pointer text-slate-800 flex w-full text-sm items-center rounded-md p-3 transition-all hover:bg-slate-100 active:bg-slate-100"
                            >
                                {lang.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="flex-1 w-full min-h-0 relative">
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
        </div>
    );
};