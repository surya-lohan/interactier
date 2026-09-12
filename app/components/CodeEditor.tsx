import dynamic from 'next/dynamic';
import { useRef, useEffect, useState } from 'react';
import { MonacoBinding } from 'y-monaco';
import { useRoom } from '../Context/RoomContext';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
    ssr: false
})


export default function CodeEditor({ code }: { code: string }) {
    const [editor, setEditor] = useState<any>(null);
    const bindingRef = useRef<MonacoBinding | null>(null);

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

    function handleListClick(lang: { id: number, name: string }): void {
        if (!lang) {
            return;
        }
        setLang(lang.name);
        setMenu(false);
    }

    const defineTheme = (monaco: any) => {
        monaco.editor.defineTheme("interactier-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [
                { token: "", foreground: "cbd5e1" },
                { token: "comment", foreground: "64748b", fontStyle: "italic" },
                { token: "keyword", foreground: "8083ff", fontStyle: "bold" },
                { token: "identifier", foreground: "e2e8f0" },
                { token: "string", foreground: "38bdf8" },
                { token: "number", foreground: "f43f5e" },
                { token: "type", foreground: "a5b4fc" },
                { token: "function", foreground: "c084fc" },
                { token: "delimiter", foreground: "94a3b8" },
            ],
            colors: {
                "editor.background": "#070D1E",
                "editor.foreground": "#e2e8f0",
                "editorGutter.background": "#070D1E",
                "editorLineNumber.foreground": "#334155",
                "editorLineNumber.activeForeground": "#8083FF",
                "editor.lineHighlightBackground": "#0E172E70",
                "editor.lineHighlightBorder": "#00000000",
                "editorCursor.foreground": "#8083FF",
                "editor.selectionBackground": "#8083FF33",
                "editor.inactiveSelectionBackground": "#8083FF1A",
                "editorIndentGuide.background1": "#1e293b",
                "editorIndentGuide.activeBackground1": "#475569",
                "editorWidget.background": "#0E172E",
                "editorWidget.border": "#1e293b",
                "editorSuggestWidget.background": "#0E172E",
                "editorSuggestWidget.border": "#1e293b",
                "editorSuggestWidget.selectedBackground": "#8083FF2E",
                "editorSuggestWidget.highlightForeground": "#8083FF",
                "scrollbarSlider.background": "#33415540",
                "scrollbarSlider.hoverBackground": "#47556980",
                "scrollbarSlider.activeBackground": "#8083FF80",
            }
        });
    };

    return (
        <div className="h-full w-full flex flex-col overflow-hidden bg-[#070D1E]">
            <div className="px-3 py-2 relative flex justify-between items-center shrink-0 border-b border-slate-800/80 bg-[#0B1326]/90 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setMenu(!menu)}
                        data-popover-target="menu"
                        className="rounded-lg bg-[#131C35] hover:bg-[#1A2647] border border-slate-700/60 py-1.5 px-3 text-xs font-medium text-slate-200 transition-all hover:border-[#8083FF]/50 flex items-center gap-2 cursor-pointer shadow-sm"
                        type="button"
                    >
                        <span className="w-2 h-2 rounded-full bg-[#8083FF]"></span>
                        <span className="capitalize">{lang}</span>
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {menu && (
                        <ul
                            role="menu"
                            data-popover="menu"
                            data-popover-placement="bottom"
                            className="absolute left-3 top-full mt-1.5 z-30 min-w-36 max-h-48 overflow-y-auto rounded-xl border border-slate-700/80 bg-[#0E172E] p-1.5 shadow-2xl shadow-black/60 focus:outline-none"
                        >
                            {languages.map((item) => (
                                <li
                                    onClick={() => handleListClick(item)}
                                    key={item.id}
                                    role="menuitem"
                                    className={`cursor-pointer flex w-full text-xs font-medium items-center rounded-lg px-3 py-2 transition-colors ${lang === item.name
                                        ? "bg-[#8083FF]/20 text-white font-semibold"
                                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                                        }`}
                                >
                                    <span className="capitalize">{item.name}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono pr-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Realtime Code</span>
                </div>
            </div>
            <div className="flex-1 w-full min-h-0 relative">
                <MonacoEditor
                    value={code}
                    height="100%"
                    width="100%"
                    language={lang}
                    theme="interactier-dark"
                    beforeMount={defineTheme}
                    onMount={(api, monaco) => {
                        defineTheme(monaco);
                        monaco.editor.setTheme("interactier-dark");
                        setEditor(api);
                    }}
                    options={{
                        automaticLayout: true,
                        fontSize: 14,
                        fontFamily: "var(--font-geist-mono), 'JetBrains Mono', 'Fira Code', monospace",
                        minimap: { enabled: false },
                        padding: { top: 12 },
                        smoothScrolling: true,
                        cursorBlinking: "smooth",
                        cursorSmoothCaretAnimation: "on",
                        renderLineHighlight: "all",
                    }}
                />
            </div>
        </div>
    );
};