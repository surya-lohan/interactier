"use client";

import { authClient } from "@/lib/auth-client";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

export default function DashboardPage() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const [roomId, setRoomId] = useState("");
    const [roomCreated, setRoomCreated] = useState(false);
    const [copied, setCopied] = useState(false);
    //refs
    const createRoomInputRef = useRef<HTMLInputElement | null>(null);
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
            setRoomCreated(true);
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
    }

    return (
        <div className="min-h-screen bg-[#070D1E] text-slate-100 flex flex-col selection:bg-[#8083FF]/30 selection:text-[#C0C1FF]">
            {/* Top Navigation Bar */}
            <header className="border-b border-slate-800/80 bg-[#0B1326]/80 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#8083FF] to-[#4F46E5] flex items-center justify-center shadow-lg shadow-[#8083FF]/20 font-black text-white text-lg tracking-wider">
                            IA
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xl tracking-tight text-white">
                                Inter<span className="text-[#8083FF]">ACT</span>ier
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#8083FF]/15 text-[#A5A6FF] border border-[#8083FF]/30">
                                Workspace
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            Realtime Engine Active
                        </div>

                        {/* Profile Header */}
                        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-[#6366F1] to-[#A855F7] flex items-center justify-center text-xs font-bold text-white shadow-inner">
                                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : (session?.user?.email ? session.user.email.charAt(0).toUpperCase() : "U")}
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-xs font-semibold text-slate-200 leading-tight">
                                    {session?.user?.name || "My Profile"}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                    {session?.user?.email || "user@example.com"}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-2.5 py-1 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-md border border-rose-500/20 transition-colors cursor-pointer"
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
                <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#131C35] via-[#101930] to-[#0D1527] border border-slate-800/80 p-6 md:p-10 shadow-2xl">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[#8083FF]/10 blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8083FF]/10 text-[#C0C1FF] text-xs font-semibold mb-4 border border-[#8083FF]/20">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Collaborative Engineering Platform
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                            Pair Programming & <br className="hidden sm:block" />
                            <span className="bg-linear-to-r from-[#C0C1FF] via-[#8083FF] to-[#A5B4FC] bg-clip-text text-transparent">
                                Technical Interview Workspace
                            </span>
                        </h1>
                        <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                            Launch an interactive room with collaborative code editor and whiteboard, or enter a room code to join an ongoing session.
                        </p>
                    </div>
                </section>

                {/* Action Grid: Create Room & Join Room */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

                    {/* 1. Create Room Card */}
                    <div className="rounded-3xl bg-[#0E172E] border border-slate-800/90 p-6 sm:p-8 hover:border-[#8083FF]/40 transition-all duration-300 shadow-xl flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-[#8083FF]/15 border border-[#8083FF]/30 flex items-center justify-center text-[#8083FF]">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Create a New Room</h2>
                                    <p className="text-xs text-slate-400">Set up a session as host or candidate</p>
                                </div>
                            </div>

                            <form onSubmit={handleCreateRoom} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold tracking-wider text-slate-300 uppercase mb-2">
                                        Room Topic / Title
                                    </label>
                                    <input
                                        ref={createRoomInputRef}
                                        type="text"
                                        name="roomTopic"
                                        placeholder="e.g. System Design Mock Interview"
                                        className="w-full bg-[#15203D] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#8083FF] transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold tracking-wider text-slate-300 uppercase mb-2">
                                        Host Role
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border bg-[#8083FF]/20 border-[#8083FF] text-[#C0C1FF] transition"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            Interviewer (Host)
                                        </button>

                                        <button
                                            type="button"
                                            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border bg-[#15203D] border-slate-700/80 text-slate-400 hover:text-white transition"
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
                                        className="w-full flex items-center justify-center gap-2 bg-[#8083FF] hover:bg-[#6C70FF] text-[#070D1E] font-bold py-3.5 px-6 rounded-xl transition duration-200 shadow-lg shadow-[#8083FF]/25 cursor-pointer"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span>Create Room</span>
                                    </button>
                                </div>
                                {roomId && (
                                    <div className="mt-5 p-4 rounded-2xl bg-[#131C35] border border-emerald-500/40 shadow-xl shadow-emerald-950/20 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center justify-between gap-2 mb-2.5">
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-2 w-2 relative">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                </span>
                                                <span className="text-xs font-semibold text-emerald-400">Room Ready & Active</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-mono">Share with candidate</span>
                                        </div>

                                        <div className="flex items-center gap-2 bg-[#070D1E] p-2 rounded-xl border border-slate-700/70">
                                            <input
                                                type="text"
                                                readOnly
                                                value={roomId}
                                                className="w-full bg-transparent text-xs font-mono text-slate-200 outline-none px-2 select-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleCopyRoomId}
                                                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8083FF]/15 hover:bg-[#8083FF]/25 border border-[#8083FF]/30 text-[#C0C1FF] text-xs font-medium transition cursor-pointer"
                                            >
                                                {copied ? (
                                                    <>
                                                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <span className="text-emerald-400 font-semibold">Copied!</span>
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
                                                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
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

                        <p className="text-[11px] text-slate-500 mt-4 text-center">
                            A unique Room ID will be generated upon creation.
                        </p>
                    </div>

                    {/* 2. Join Room Card */}
                    <div className="rounded-3xl bg-[#0E172E] border border-slate-800/90 p-6 sm:p-8 hover:border-indigo-500/40 transition-all duration-300 shadow-xl flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Join Existing Room</h2>
                                    <p className="text-xs text-slate-400">Enter using an invite code or room ID</p>
                                </div>
                            </div>

                            <form onSubmit={handleJoinRoom} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold tracking-wider text-slate-300 uppercase mb-2">
                                        Room ID
                                    </label>
                                    <input
                                        ref={joinRoomInputRef}
                                        type="text"
                                        name="roomId"
                                        placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                                        className="w-full bg-[#15203D] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold tracking-wider text-slate-300 uppercase mb-2">
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        name="displayName"
                                        placeholder="Your name in the room"
                                        className="w-full bg-[#15203D] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 transition"
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold py-3.5 px-6 rounded-xl transition duration-200 shadow-lg shadow-indigo-600/25 cursor-pointer"
                                    >
                                        <span>Join Room</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </div>

                        <p className="text-[11px] text-slate-500 mt-4 text-center">
                            Ask your interviewer or teammate for the Room ID to connect.
                        </p>
                    </div>

                </section>

                {/* Feature Overview Section */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
                    <div className="p-5 rounded-2xl bg-[#0B1326]/60 border border-slate-800/80 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white">Monaco Code Editor</h4>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                VS Code grade editor with syntax highlighting and multi-user cursor sync.
                            </p>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#0B1326]/60 border border-slate-800/80 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white">Excalidraw Canvas</h4>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                Draw system architectures and diagrams on an infinite collaborative whiteboard.
                            </p>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#0B1326]/60 border border-emerald-500/20 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white">CRDT Realtime Sync</h4>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                Powered by Yjs and WebSockets for instant, conflict-free state replication across peers.
                            </p>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}