"use client";

import { authClient } from "@/lib/auth-client";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

import ThemeToggle from "../components/ThemeToggle";

export default function DashboardPage() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const [roomId, setRoomId] = useState("");
    const [copied, setCopied] = useState(false);
    const joinRoomInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/auth/signin");
        }
    }, [isPending, session, router]);

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.post('/api/rooms');
            const createdRoomId = response.data.roomId;
            setRoomId(createdRoomId);
        } catch (error) {
            console.log("Getting trouble creating room!", error);
        }
    };

    const handleJoinRoom = async (e: React.FormEvent) => {
        e.preventDefault();

        const inputId = joinRoomInputRef.current?.value?.trim();
        if (!inputId) {
            console.log("Please enter your room id");
            return;
        }

        router.push(`/room/${inputId}`);
    };

    const handleLogout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/auth/signin");
                }
            }
        });
    };

    function handleCopyRoomId(): void {
        if (!roomId) return;
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="min-h-screen bg-[#FAFAFC] dark:bg-[#070D1E] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col font-sans selection:bg-[#EFF6FF] selection:text-[#2563EB] transition-colors duration-200">
            {/* Top Navigation Bar */}
            <header className="border-b border-[#E2E8F0] dark:border-[#1E293B] bg-white/90 dark:bg-[#0E172E]/90 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-xs font-black text-white text-base tracking-wider transition-transform group-hover:scale-105">
                            IA
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xl tracking-tight text-[#0F172A] dark:text-white">
                                Inter<span className="text-[#2563EB]">ACT</span>ier
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EFF6FF] dark:bg-[#1E293B] text-[#2563EB] dark:text-[#60A5FA] border border-[#BFDBFE] dark:border-slate-700">
                                Workspace
                            </span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECFDF5] dark:bg-emerald-950/40 border border-[#A7F3D0] dark:border-emerald-800 text-[#10B981] text-xs font-semibold">
                            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                            Signaling Mesh Active
                        </div>

                        {/* Theme Toggle Button in Dashboard Navbar */}
                        <ThemeToggle />

                        {/* Profile Header */}
                        <div className="flex items-center gap-3 pl-3 border-l border-[#E2E8F0] dark:border-slate-700">
                            <div className="w-8 h-8 rounded-full bg-[#EFF6FF] dark:bg-[#1E293B] text-[#2563EB] dark:text-[#60A5FA] border border-[#BFDBFE] dark:border-slate-700 flex items-center justify-center text-xs font-bold shadow-xs">
                                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : (session?.user?.email ? session.user.email.charAt(0).toUpperCase() : "U")}
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-xs font-bold text-[#0F172A] dark:text-white leading-tight">
                                    {session?.user?.name || "My Profile"}
                                </p>
                                <p className="text-[10px] text-[#64748B] dark:text-slate-400">
                                    {session?.user?.email || "user@example.com"}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-10">

                {/* Welcome Hero Banner */}
                <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0E172E] border border-[#E2E8F0] dark:border-[#1E293B] p-6 md:p-10 shadow-diffuse">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[#EFF6FF] dark:bg-[#2563EB]/10 blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] dark:bg-[#1E293B] text-[#2563EB] dark:text-[#60A5FA] text-xs font-semibold mb-4 border border-[#BFDBFE] dark:border-slate-700">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Collaborative Engineering Workspace
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0F172A] dark:text-white tracking-[-0.025em] leading-tight">
                            Pair Programming & <br className="hidden sm:block" />
                            <span className="text-[#2563EB]">
                                Technical Interview Workspace
                            </span>
                        </h1>
                        <p className="mt-3 text-sm sm:text-base text-[#4B5563] dark:text-slate-400 max-w-2xl leading-relaxed">
                            Launch an interactive room with real-time Monaco code editing and infinite system design whiteboard, or enter a room code to join an ongoing session.
                        </p>
                    </div>
                </section>

                {/* Action Grid: Create Room & Join Room */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

                    {/* 1. Create Room Card */}
                    <div className="rounded-2xl h-fit bg-white dark:bg-[#0E172E] border border-[#E2E8F0] dark:border-[#1E293B] p-6 sm:p-8 shadow-diffuse hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3.5 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] dark:bg-[#1E293B] border border-[#BFDBFE] dark:border-slate-700 flex items-center justify-center text-[#2563EB] dark:text-[#60A5FA]">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">Create a New Room</h2>
                                    <p className="text-xs text-[#64748B] dark:text-slate-400">Set up an isolated session for live code & diagramming</p>
                                </div>
                            </div>

                            <form onSubmit={handleCreateRoom} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold tracking-wider text-[#4B5563] dark:text-slate-400 uppercase mb-2">
                                        Host Role
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border bg-[#EFF6FF] dark:bg-[#2563EB]/20 border-[#2563EB] text-[#2563EB] dark:text-[#60A5FA] transition shadow-xs"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            Interviewer (Host)
                                        </button>

                                        <button
                                            type="button"
                                            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border bg-[#F8FAFC] dark:bg-[#15203D] border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Candidate / Peer
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold py-3.5 px-6 rounded-xl transition duration-200 shadow-cta cursor-pointer"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span>Create Room</span>
                                    </button>
                                </div>

                                {roomId && (
                                    <div className="mt-5 p-4 rounded-xl bg-[#ECFDF5] dark:bg-emerald-950/40 border border-[#A7F3D0] dark:border-emerald-800 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center justify-between gap-2 mb-2.5">
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-2 w-2 relative">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                                                </span>
                                                <span className="text-xs font-bold text-[#10B981]">Room Ready & Active</span>
                                            </div>
                                            <span className="text-[10px] text-[#059669] dark:text-emerald-400 font-mono font-medium">Share link with candidate</span>
                                        </div>

                                        <div className="flex items-center gap-2 bg-white dark:bg-[#070D1E] p-2 rounded-lg border border-[#A7F3D0] dark:border-emerald-800">
                                            <input
                                                type="text"
                                                readOnly
                                                value={roomId}
                                                className="w-full bg-transparent text-xs font-mono text-[#0F172A] dark:text-white outline-none px-2 select-all font-semibold"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleCopyRoomId}
                                                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#EFF6FF] dark:bg-[#1E293B] hover:bg-[#DBEAFE] dark:hover:bg-slate-700 border border-[#BFDBFE] dark:border-slate-700 text-[#2563EB] dark:text-[#60A5FA] text-xs font-semibold transition cursor-pointer"
                                            >
                                                {copied ? (
                                                    <>
                                                        <svg className="w-3.5 h-3.5 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <span className="text-[#10B981]">Copied!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                        <span>Copy</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="mt-3">
                                            <button
                                                type="button"
                                                onClick={() => router.push(`/room/${roomId}`)}
                                                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-xs shadow-sm transition cursor-pointer"
                                            >
                                                <span>Enter Room Workspace</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-4 text-center">
                            A unique Room ID will be generated upon creation.
                        </p>
                    </div>

                    {/* 2. Join Room Card */}
                    <div className="rounded-2xl h-fit bg-white dark:bg-[#0E172E] border border-[#E2E8F0] dark:border-[#1E293B] p-6 sm:p-8 shadow-diffuse hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3.5 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] dark:bg-[#1E293B] border border-[#BFDBFE] dark:border-slate-700 flex items-center justify-center text-[#2563EB] dark:text-[#60A5FA]">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">Join Existing Room</h2>
                                    <p className="text-xs text-[#64748B] dark:text-slate-400">Enter using an invite code or room ID</p>
                                </div>
                            </div>

                            <form onSubmit={handleJoinRoom} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold tracking-wider text-[#4B5563] dark:text-slate-400 uppercase mb-2">
                                        Room ID
                                    </label>
                                    <input
                                        ref={joinRoomInputRef}
                                        type="text"
                                        name="roomId"
                                        placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                                        className="w-full bg-white dark:bg-[#15203D] border border-[#E2E8F0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-[#0F172A] dark:text-white font-mono focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#EFF6FF] dark:focus:ring-[#2563EB]/20 transition"
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 bg-[#0F172A] dark:bg-[#2563EB] hover:bg-[#2563EB] dark:hover:bg-[#1D4ED8] text-white font-semibold py-3.5 px-6 rounded-xl transition duration-200 shadow-sm cursor-pointer"
                                    >
                                        <span>Join Room</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </div>

                        <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-4 text-center">
                            Ask your interviewer or teammate for the Room ID to connect.
                        </p>
                    </div>

                </section>

                {/* Feature Overview Section */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
                    <div className="p-6 rounded-2xl bg-white dark:bg-[#0E172E] border border-[#E2E8F0] dark:border-[#1E293B] shadow-diffuse dark:shadow-none flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-[#1E293B] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-[#0F172A] dark:text-white">Monaco Code Editor</h4>
                            <p className="text-xs text-[#4B5563] dark:text-slate-400 mt-1 leading-relaxed">
                                VS Code grade editor with syntax highlighting and multi-user cursor sync.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-[#0E172E] border border-[#E2E8F0] dark:border-[#1E293B] shadow-diffuse dark:shadow-none flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] dark:bg-emerald-950/40 text-[#10B981] dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-[#0F172A] dark:text-white">Excalidraw Canvas</h4>
                            <p className="text-xs text-[#4B5563] dark:text-slate-400 mt-1 leading-relaxed">
                                Draw system architectures and diagrams on an infinite collaborative whiteboard.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-[#0E172E] border border-[#E2E8F0] dark:border-[#1E293B] shadow-diffuse dark:shadow-none flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] dark:bg-purple-950/40 text-[#7C3AED] dark:text-purple-400 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-[#0F172A] dark:text-white">CRDT Realtime Sync</h4>
                            <p className="text-xs text-[#4B5563] dark:text-slate-400 mt-1 leading-relaxed">
                                Powered by Yjs and WebSockets for instant, conflict-free state replication across peers.
                            </p>
                        </div>
                    </div>
                </section>


            </main>
        </div>
    );
}