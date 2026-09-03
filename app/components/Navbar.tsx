"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar({ roomId }: { roomId: string }) {
    const router = useRouter();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!roomId) return;
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleEndSession = () => {
        router.push("/dashboard");
    };

    return (
        <header className="fixed top-0 left-0 right-0 w-full h-14 bg-[#0B1326]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between z-50 selection:bg-[#8083FF]/30">
            {/* Brand Logo */}
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#8083FF] to-[#4F46E5] flex items-center justify-center shadow-md shadow-[#8083FF]/20 font-black text-white text-sm tracking-wider">
                    IA
                </div>
                <span className="font-extrabold text-lg tracking-tight text-white">
                    Inter<span className="text-[#8083FF]">ACT</span>ier
                </span>
            </div>

            {/* Room ID Badge & Copy */}
            <div className="flex items-center gap-2 bg-[#131C35] border border-slate-700/60 rounded-lg px-3 py-1.5">
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">Room ID:</span>
                <span className="text-xs font-mono text-slate-200">{roomId}</span>
                <button
                    onClick={handleCopy}
                    className="ml-1 text-slate-400 hover:text-white transition p-1 hover:bg-slate-700/50 rounded cursor-pointer flex items-center"
                    title="Copy Room ID"
                    aria-label="Copy Room ID"
                >
                    {copied ? (
                        <span className="text-xs font-semibold text-emerald-400">Copied!</span>
                    ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    )}
                </button>
            </div>

            {/* End Session Action */}
            <div>
                <button
                    onClick={handleEndSession}
                    className="rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 hover:text-rose-300 px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 cursor-pointer flex items-center gap-1.5"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>End session</span>
                </button>
            </div>
        </header>
    );
}