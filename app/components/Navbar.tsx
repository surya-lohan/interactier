"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useRoom } from "../Context/RoomContext";
import axios from "axios";
import Link from "next/link";

import ThemeToggle from "./ThemeToggle";

export default function Navbar({ roomId, snapshotId }: { roomId: string; snapshotId: string }) {
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const { yDoc } = useRoom();

    const handleCopy = () => {
        if (!roomId) return;
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleEndSession = async () => {
        const code = yDoc?.getText('monaco') || "";
        const yElements = yDoc?.getArray('elements').toJSON();

        try {
            await axios.patch('/api/rooms/savesnap', {
                code: code,
                drawingData: yElements,
                roomId,
                snapshotId
            });
        } catch (error) {
            console.log("Error", error);
        }
        router.push("/dashboard");
    };

    return (
        <header className="fixed top-0 left-0 right-0 w-full h-14 bg-white/95 dark:bg-[#0E172E]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#1E293B] px-4 sm:px-6 flex items-center justify-between z-50 selection:bg-[#EFF6FF] selection:text-[#2563EB] transition-colors duration-200">
            {/* Brand Logo */}
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center shadow-xs font-black text-white text-sm tracking-wider transition-transform group-hover:scale-105">
                    IA
                </div>
                <span className="font-extrabold text-lg tracking-tight text-[#0F172A] dark:text-white">
                    Inter<span className="text-[#2563EB]">ACT</span>ier
                </span>
            </Link>

            {/* Room ID Badge & Copy Pill */}
            <div className="flex items-center gap-2 bg-[#EFF6FF] dark:bg-[#1E293B] border border-[#BFDBFE] dark:border-slate-700 rounded-full px-3.5 py-1 text-xs shadow-xs">
                <span className="text-[#2563EB] dark:text-[#60A5FA] font-semibold hidden sm:inline">Room:</span>
                <span className="font-mono font-medium text-[#1D4ED8] dark:text-slate-200">{roomId}</span>
                <button
                    onClick={handleCopy}
                    className="ml-1 text-[#2563EB] dark:text-[#60A5FA] hover:text-[#1D4ED8] dark:hover:text-white transition p-1 hover:bg-[#DBEAFE] dark:hover:bg-slate-700 rounded-full cursor-pointer flex items-center"
                    title="Copy Room ID"
                    aria-label="Copy Room ID"
                >
                    {copied ? (
                        <span className="text-[11px] font-bold text-[#10B981] flex items-center gap-1">
                            <svg className="w-3 h-3 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            Copied
                        </span>
                    ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Right side: Dark Mode Toggle on left side of End Session */}
            <div className="flex items-center gap-2.5">
                <ThemeToggle />
                <button
                    onClick={handleEndSession}
                    className="rounded-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 px-4 py-1.5 text-xs font-semibold transition-all duration-150 cursor-pointer flex items-center gap-1.5 shadow-xs"
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