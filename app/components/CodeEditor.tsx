"use client";

import dynamic from 'next/dynamic';
import { useRef, useEffect, useState } from 'react';
import { MonacoBinding } from 'y-monaco';
import { useRoom } from '../Context/RoomContext';
import { useTheme } from '../Context/ThemeContext';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
    ssr: false
});

export default function CodeEditor({ code }: { code: string }) {
    const [editor, setEditor] = useState<any>(null);
    const monacoRef = useRef<any>(null);
    const bindingRef = useRef<MonacoBinding | null>(null);

    const [menu, setMenu] = useState(false);
    const [lang, setLang] = useState("javascript");

    const { yDoc, provider } = useRoom();
    const { theme } = useTheme();

    const languages = [
        { id: 1, name: "javascript" },
        { id: 2, name: "typescript" },
        { id: 3, name: "cpp" },
        { id: 4, name: "java" },
        { id: 5, name: "python" }
    ];

    // Create binding once editor, yDoc, and provider are all ready
    useEffect(() => {
        if (!editor || !yDoc || !provider) return;

        let cancelled = false;

        const createBinding = async () => {
            const { MonacoBinding } = await import("y-monaco");
            if (cancelled) return;

            const yText = yDoc.getText('monaco');

            // Seed initial code from snapshot only if the room document is genuinely empty after sync
            const seedCodeIfEmpty = () => {
                if (yText.toString() === "" && code) {
                    yDoc.transact(() => {
                        yText.insert(0, code);
                    });
                }
            };

            if (provider.synced) {
                seedCodeIfEmpty();
            } else {
                const onSync = (isSynced: boolean) => {
                    if (isSynced) {
                        seedCodeIfEmpty();
                        provider.off('synced', onSync);
                        provider.off('sync', onSync);
                    }
                };
                provider.on('synced', onSync);
                provider.on('sync', onSync);
            }

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
        };
    }, [editor, yDoc, provider]);

    // Reactively update editor theme when user toggles dark/light mode
    useEffect(() => {
        if (monacoRef.current) {
            monacoRef.current.editor.setTheme(theme === "dark" ? "interactier-dark" : "interactier-light");
        }
    }, [theme]);

    function handleListClick(lang: { id: number, name: string }): void {
        if (!lang) return;
        setLang(lang.name);
        setMenu(false);
    }

    const defineThemes = (monaco: any) => {
        monacoRef.current = monaco;

        // Light Theme
        monaco.editor.defineTheme("interactier-light", {
            base: "vs",
            inherit: true,
            rules: [
                { token: "", foreground: "0F172A" },
                { token: "comment", foreground: "64748B", fontStyle: "italic" },
                { token: "keyword", foreground: "2563EB", fontStyle: "bold" },
                { token: "identifier", foreground: "0F172A" },
                { token: "string", foreground: "059669" },
                { token: "number", foreground: "D97706" },
                { token: "type", foreground: "7C3AED" },
                { token: "function", foreground: "1D4ED8" },
                { token: "delimiter", foreground: "64748B" },
            ],
            colors: {
                "editor.background": "#FFFFFF",
                "editor.foreground": "#0F172A",
                "editorGutter.background": "#F8FAFC",
                "editorLineNumber.foreground": "#94A3B8",
                "editorLineNumber.activeForeground": "#2563EB",
                "editor.lineHighlightBackground": "#F1F5F960",
                "editor.lineHighlightBorder": "#E2E8F000",
                "editorCursor.foreground": "#2563EB",
                "editor.selectionBackground": "#BFDBFE80",
                "editor.inactiveSelectionBackground": "#DBEAFE60",
                "editorIndentGuide.background1": "#E2E8F0",
                "editorIndentGuide.activeBackground1": "#CBD5E1",

                // Widgets
                "editorWidget.background": "#FFFFFF",
                "editorWidget.foreground": "#0F172A",
                "editorWidget.border": "#E2E8F0",

                // Suggest Autocomplete Dropdown
                "editorSuggestWidget.background": "#FFFFFF",
                "editorSuggestWidget.foreground": "#0F172A",
                "editorSuggestWidget.border": "#E2E8F0",
                "editorSuggestWidget.selectedBackground": "#EFF6FF",
                "editorSuggestWidget.selectedForeground": "#2563EB",
                "editorSuggestWidget.highlightForeground": "#2563EB",
                "editorSuggestWidget.focusHighlightForeground": "#1D4ED8",
                "editorSuggestWidgetStatus.foreground": "#64748B",

                // Hover Documentation Tooltips
                "editorHoverWidget.background": "#FFFFFF",
                "editorHoverWidget.foreground": "#0F172A",
                "editorHoverWidget.border": "#E2E8F0",
                "editorHoverWidget.statusBarBackground": "#F8FAFC",

                // List Component Colors
                "list.hoverBackground": "#F8FAFC",
                "list.hoverForeground": "#0F172A",
                "list.activeSelectionBackground": "#EFF6FF",
                "list.activeSelectionForeground": "#2563EB",
                "list.inactiveSelectionBackground": "#F1F5F9",
                "list.inactiveSelectionForeground": "#0F172A",
                "list.highlightForeground": "#2563EB",
                "list.focusHighlightForeground": "#1D4ED8",

                // Scrollbar
                "scrollbarSlider.background": "#E2E8F080",
                "scrollbarSlider.hoverBackground": "#CBD5E1",
                "scrollbarSlider.activeBackground": "#2563EB60",
            }
        });

        // Dark Theme
        monaco.editor.defineTheme("interactier-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [
                { token: "", foreground: "cbd5e1" },
                { token: "comment", foreground: "64748b", fontStyle: "italic" },
                { token: "keyword", foreground: "60a5fa", fontStyle: "bold" },
                { token: "identifier", foreground: "e2e8f0" },
                { token: "string", foreground: "34d399" },
                { token: "number", foreground: "fbbf24" },
                { token: "type", foreground: "c084fc" },
                { token: "function", foreground: "93c5fd" },
                { token: "delimiter", foreground: "94a3b8" },
            ],
            colors: {
                "editor.background": "#070D1E",
                "editor.foreground": "#e2e8f0",
                "editorGutter.background": "#070D1E",
                "editorLineNumber.foreground": "#475569",
                "editorLineNumber.activeForeground": "#3B82F6",
                "editor.lineHighlightBackground": "#0E172E80",
                "editor.lineHighlightBorder": "#00000000",
                "editorCursor.foreground": "#3B82F6",
                "editor.selectionBackground": "#3B82F633",
                "editor.inactiveSelectionBackground": "#3B82F61A",
                "editorIndentGuide.background1": "#1e293b",
                "editorIndentGuide.activeBackground1": "#334155",

                // Widgets
                "editorWidget.background": "#0E172E",
                "editorWidget.foreground": "#F8FAFC",
                "editorWidget.border": "#1E293B",

                // Suggest Autocomplete Dropdown
                "editorSuggestWidget.background": "#0E172E",
                "editorSuggestWidget.foreground": "#F8FAFC",
                "editorSuggestWidget.border": "#1E293B",
                "editorSuggestWidget.selectedBackground": "#1E293B",
                "editorSuggestWidget.selectedForeground": "#60A5FA",
                "editorSuggestWidget.highlightForeground": "#60A5FA",
                "editorSuggestWidget.focusHighlightForeground": "#93C5FD",
                "editorSuggestWidgetStatus.foreground": "#94A3B8",

                // Hover
                "editorHoverWidget.background": "#0E172E",
                "editorHoverWidget.foreground": "#F8FAFC",
                "editorHoverWidget.border": "#1E293B",
                "editorHoverWidget.statusBarBackground": "#070D1E",

                // List
                "list.hoverBackground": "#15203D",
                "list.hoverForeground": "#F8FAFC",
                "list.activeSelectionBackground": "#1E293B",
                "list.activeSelectionForeground": "#60A5FA",
                "list.highlightForeground": "#60A5FA",

                // Scrollbar
                "scrollbarSlider.background": "#33415540",
                "scrollbarSlider.hoverBackground": "#47556980",
                "scrollbarSlider.activeBackground": "#3B82F680",
            }
        });
    };

    const isDark = theme === "dark";

    return (
        <div className="h-full w-full flex flex-col overflow-hidden bg-white dark:bg-[#070D1E] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-200">
            {/* Top Toolbar */}
            <div className="h-11 px-4 relative flex justify-between items-center shrink-0 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0E172E] transition-colors duration-200">
                <div className="flex items-center gap-2">
                    {/* Language Dropdown Button */}
                    <div className="relative">
                        <button
                            onClick={() => setMenu(!menu)}
                            className="rounded-xl bg-[#F8FAFC] dark:bg-[#15203D] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 py-1.5 px-3 text-xs font-semibold text-[#0F172A] dark:text-white transition-all hover:border-[#2563EB] dark:hover:border-[#3B82F6] flex items-center gap-2 cursor-pointer shadow-xs"
                            type="button"
                        >
                            <span className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-[#3B82F6]"></span>
                            <span className="capitalize">{lang}</span>
                            <svg className="w-3.5 h-3.5 text-[#64748B] dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {menu && (
                            <ul
                                className="absolute left-0 top-full mt-1.5 z-30 min-w-40 max-h-52 overflow-y-auto rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0E172E] p-1.5 shadow-diffuse focus:outline-none"
                            >
                                {languages.map((item) => (
                                    <li
                                        onClick={() => handleListClick(item)}
                                        key={item.id}
                                        className={`cursor-pointer flex w-full text-xs font-medium items-center rounded-lg px-3 py-2 transition-colors ${lang === item.name
                                            ? "bg-[#EFF6FF] dark:bg-[#2563EB]/20 text-[#2563EB] dark:text-[#60A5FA] font-semibold"
                                            : "text-[#4B5563] dark:text-slate-300 hover:bg-[#F8FAFC] dark:hover:bg-[#15203D] hover:text-[#0F172A] dark:hover:text-white"
                                            }`}
                                    >
                                        <span className="capitalize">{item.name}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Monaco Editor Container */}
            <div className="flex-1 w-full min-h-0 relative bg-white dark:bg-[#070D1E]">
                <MonacoEditor
                    value={code}
                    height="100%"
                    width="100%"
                    language={lang}
                    theme={isDark ? "interactier-dark" : "interactier-light"}
                    beforeMount={defineThemes}
                    onMount={(api, monaco) => {
                        defineThemes(monaco);
                        monaco.editor.setTheme(isDark ? "interactier-dark" : "interactier-light");
                        setEditor(api);
                    }}
                    options={{
                        automaticLayout: true,
                        fontSize: 14,
                        fontFamily: "var(--font-mono), 'JetBrains Mono', 'Fira Code', monospace",
                        minimap: { enabled: false },
                        padding: { top: 12 },
                        smoothScrolling: true,
                        cursorBlinking: "smooth",
                        cursorSmoothCaretAnimation: "on",
                        renderLineHighlight: "all",
                        wordWrap: "on",
                        lineNumbersMinChars: 3,
                    }}
                />
            </div>
        </div>
    );
}