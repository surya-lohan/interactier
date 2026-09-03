"use client";
import { use, useState } from "react";
import Whiteboard from "@/app/components/Whiteboard";
import RoomContext from "@/app/Context/RoomContext";
import CodeEditor from "@/app/components/CodeEditor";
import Navbar from "@/app/components/Navbar";
import { languages } from "monaco-editor";

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [menu, setMenu] = useState(false);
    const [lang, setLang] = useState("javascript");
    const [code, setCode] = useState("");

    const languages = [
        { id: 1, name: "javascript" },
        { id: 2, name: "cpp" },
        { id: 3, name: "java" }
    ]

    function handleListClick(lang: { id: number, name: string }): void {
        if (!lang) {
            return;
        }
        setLang(lang.name);
        setMenu(false);
    }

    function handleCodeSave(): void {
    }

    return (
        <RoomContext roomId={id}>
            <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#070D1E]">
                <Navbar roomId={id} />
                <main className="flex flex-1 w-full pt-14 overflow-hidden">
                    <div className="w-1/2 h-full border-r border-slate-800/80">
                        <div className="p-2 relative flex justify-between items-center">
                            <button
                                onClick={() => setMenu(!menu)}
                                data-popover-target="menu"
                                className="rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all hover:shadow-lg focus:shadow-none hover:bg-slate-700 disabled:pointer-events-none disabled:opacity-50 ml-2"
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
                        <CodeEditor />
                    </div>
                    <div className="w-1/2 h-full relative">
                        <Whiteboard />
                    </div>
                </main>
            </div>
        </RoomContext>
    );
}