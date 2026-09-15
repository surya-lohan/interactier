"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function HomePage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [roomIdInput, setRoomIdInput] = useState("");
  const [copiedFeature, setCopiedFeature] = useState<string | null>(null);

  const handleQuickJoin = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const cleanId = roomIdInput.trim();
    if (!cleanId) return;
    router.push(`/room/${cleanId}`);
  };

  const copySnippet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFeature(id);
    setTimeout(() => setCopiedFeature(null), 1800);
  };

  return (
    <div className="min-h-screen bg-[#070D1E] text-slate-100 flex flex-col selection:bg-[#8083FF]/30 selection:text-[#C0C1FF]">
      {/* Background Ambience & Subtle Grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293B0F_1px,transparent_1px),linear-gradient(to_bottom,#1E293B0F_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[360px] bg-[#8083FF]/10 blur-[130px] rounded-full pointer-events-none" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-30 border-b border-slate-800/80 bg-[#070D1E]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8083FF] to-[#4F46E5] flex items-center justify-center shadow-lg shadow-[#8083FF]/25 font-black text-white text-base tracking-wider transition-transform group-hover:scale-105">
              IA
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">
                Inter<span className="text-[#8083FF]">ACT</span>ier
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#8083FF]/15 text-[#A5A6FF] border border-[#8083FF]/30">
                v1.0
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#workspace" className="hover:text-white transition-colors">
              Workspace
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Engine Features
            </a>
            <a href="#architecture" className="hover:text-white transition-colors">
              Architecture
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-[#8083FF] hover:bg-[#6C70FF] text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-[#8083FF]/25 hover:shadow-[#8083FF]/40 flex items-center gap-2"
              >
                <span>Dashboard</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="px-3.5 py-1.5 rounded-lg text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8083FF] to-[#6366F1] hover:from-[#6C70FF] hover:to-[#4F46E5] text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-[#8083FF]/20 flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300 mb-8 backdrop-blur-md shadow-xl">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="font-mono text-[11px] text-slate-400">Yjs CRDTs + Peer-to-Peer WebRTC</span>
          <span className="text-slate-600">|</span>
          <span className="text-[#A5A6FF] font-medium">Sub-50ms Latency</span>
        </div>

        {/* Hero Title */}
        <h1 className="max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
          The collaborative interview room{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A5A6FF] via-[#8083FF] to-[#C0C1FF]">
            engineered for developers.
          </span>
        </h1>

        {/* Hero Description */}
        <p className="max-w-2xl text-base sm:text-lg text-slate-300 mb-10 leading-relaxed font-normal">
          A high-performance workspace combining real-time Monaco code editing, an infinite system design whiteboard, and peer-to-peer video calling. No Zoom links. No sync delays.
        </p>

        {/* Hero CTAs + Quick Join Input */}
        <div className="w-full max-w-md flex flex-col sm:flex-row items-center gap-3 mb-14">
          <Link
            href={session ? "/dashboard" : "/auth/signin"}
            className="w-full sm:w-auto flex-1 h-12 px-6 rounded-xl bg-gradient-to-r from-[#8083FF] to-[#6366F1] hover:from-[#6C70FF] hover:to-[#4F46E5] text-white font-semibold flex items-center justify-center gap-2 shadow-xl shadow-[#8083FF]/25 hover:shadow-[#8083FF]/40 transition-all cursor-pointer"
          >
            <span>Launch Interview Room</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          <form onSubmit={handleQuickJoin} className="w-full sm:w-auto flex-1 relative flex items-center">
            <input
              type="text"
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
              placeholder="Enter Room UUID..."
              className="w-full h-12 pl-4 pr-16 bg-slate-900/90 border border-slate-700/90 focus:border-[#8083FF] rounded-xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 outline-none transition-colors font-mono"
            />
            <button
              type="submit"
              disabled={!roomIdInput.trim()}
              className="absolute right-1.5 h-9 px-3 bg-slate-800 hover:bg-[#8083FF] disabled:opacity-40 disabled:hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Join
            </button>
          </form>
        </div>

        {/* Realistic Product Mockup Showcase */}
        <div id="workspace" className="w-full max-w-6xl rounded-2xl border border-slate-800/90 bg-[#0B1326]/90 shadow-2xl shadow-black/80 overflow-hidden text-left relative group">
          {/* Mockup Window Header Bar */}
          <div className="h-11 px-4 bg-[#080E1F] border-b border-slate-800/80 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-xs text-slate-400 font-mono ml-3 border-l border-slate-800 pl-3">
                room/d9f10a82 · Live Interview
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[11px] border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                WebRTC Mesh Connected
              </span>
              <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-[11px]">
                Snapshot ID #418
              </span>
            </div>
          </div>

          {/* Mockup Split Workspace: Monaco Left + Whiteboard Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px] bg-[#070D1E] relative">
            {/* Left Panel: Monaco Editor Preview */}
            <div className="lg:col-span-6 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col">
              <div className="h-9 px-4 bg-[#091024] border-b border-slate-800/70 flex items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-[#8083FF]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  <span>LRUCache.ts</span>
                  <span className="text-[10px] text-slate-500">TypeScript · 60 FPS</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                  <span>Candidate typing...</span>
                </div>
              </div>

              {/* Code Buffer Simulation */}
              <div className="p-5 font-mono text-xs sm:text-[13px] leading-relaxed text-slate-300 overflow-x-auto selection:bg-[#8083FF]/40">
                <p className="text-slate-500">// Real-time collaborative LRU Cache implementation</p>
                <p className="mt-1">
                  <span className="text-purple-400">class</span> <span className="text-yellow-300">LRUCache</span>&lt;<span className="text-cyan-300">K</span>, <span className="text-cyan-300">V</span>&gt; &#123;
                </p>
                <p className="pl-4">
                  <span className="text-purple-400">private</span> <span className="text-blue-300">capacity</span>: <span className="text-teal-300">number</span>;
                </p>
                <p className="pl-4">
                  <span className="text-purple-400">private</span> <span className="text-blue-300">cache</span>: <span className="text-teal-300">Map</span>&lt;<span className="text-cyan-300">K</span>, <span className="text-cyan-300">V</span>&gt; = <span className="text-purple-400">new</span> <span className="text-teal-300">Map</span>();
                </p>
                <p className="mt-2 pl-4">
                  <span className="text-purple-400">constructor</span>(<span className="text-orange-300">capacity</span>: <span className="text-teal-300">number</span>) &#123;
                </p>
                <p className="pl-8">
                  <span className="text-purple-400">this</span>.capacity = capacity;
                </p>
                <p className="pl-4">&#125;</p>
                <p className="mt-2 pl-4">
                  <span className="text-purple-400">public</span> <span className="text-yellow-300">get</span>(<span className="text-orange-300">key</span>: <span className="text-cyan-300">K</span>): <span className="text-cyan-300">V</span> | <span className="text-purple-400">undefined</span> &#123;
                </p>
                <p className="pl-8">
                  <span className="text-purple-400">if</span> (!<span className="text-purple-400">this</span>.cache.<span className="text-yellow-300">has</span>(key)) <span className="text-purple-400">return undefined</span>;
                </p>
                <p className="pl-8 text-emerald-300 bg-emerald-500/10 py-0.5 rounded px-1 -ml-1 inline-block border-l-2 border-emerald-400">
                  <span className="text-slate-400">// Move to most recently used</span>
                </p>
                <p className="pl-8 relative">
                  <span className="text-purple-400">const</span> val = <span className="text-purple-400">this</span>.cache.<span className="text-yellow-300">get</span>(key)!;
                  {/* Remote Selection Flag */}
                  <span className="inline-block w-0.5 h-4 bg-amber-400 align-middle ml-1 animate-pulse" />
                  <span className="absolute -top-5 left-36 bg-amber-500 text-slate-950 font-bold text-[9px] px-1.5 py-0.5 rounded shadow">
                    Candidate
                  </span>
                </p>
                <p className="pl-8">
                  <span className="text-purple-400">this</span>.cache.<span className="text-yellow-300">delete</span>(key);
                </p>
                <p className="pl-8">
                  <span className="text-purple-400">this</span>.cache.<span className="text-yellow-300">set</span>(key, val);
                </p>
                <p className="pl-8">
                  <span className="text-purple-400">return</span> val;
                </p>
                <p className="pl-4">&#125;</p>
                <p>&#125;</p>
              </div>
            </div>

            {/* Right Panel: Excalidraw Whiteboard Preview */}
            <div className="lg:col-span-6 bg-[#0B1326] flex flex-col relative overflow-hidden">
              <div className="h-9 px-4 bg-[#091024] border-b border-slate-800/70 flex items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>SystemArchitecture.excalidraw</span>
                </div>
                <span className="text-[10px] text-slate-500">Shared Canvas</span>
              </div>

              {/* Hand-drawn style Architecture Diagram Simulation */}
              <div className="flex-1 p-6 relative flex flex-col items-center justify-center">
                <div className="w-full max-w-sm space-y-4 font-mono text-xs">
                  {/* Client Layer */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700 text-center shadow-md">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">Client Layer</span>
                    <span className="text-white font-bold">Web / Mobile Clients (DNS: Route53)</span>
                  </div>

                  {/* Down Arrow */}
                  <div className="flex justify-center text-slate-500 -my-2">
                    <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>

                  {/* Load Balancer */}
                  <div className="p-3 rounded-xl bg-[#8083FF]/15 border border-[#8083FF]/50 text-center shadow-lg shadow-[#8083FF]/10">
                    <span className="text-[#A5A6FF] font-semibold block text-[10px] uppercase tracking-wider">Gateway Layer</span>
                    <span className="text-white font-bold">API Gateway & Nginx Load Balancer</span>
                  </div>

                  {/* Split Arrow */}
                  <div className="grid grid-cols-2 gap-4 text-center text-slate-500 text-[11px]">
                    <div className="flex justify-center">↓ Round Robin</div>
                    <div className="flex justify-center">↓ Event Bus</div>
                  </div>

                  {/* Microservices */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-center">
                      <span className="text-emerald-400 font-bold block text-[11px]">Auth Service</span>
                      <span className="text-[10px] text-slate-400">Node / Go</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-center">
                      <span className="text-purple-400 font-bold block text-[11px]">Sync Worker</span>
                      <span className="text-[10px] text-slate-400">WebSockets / Yjs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Live WebRTC Floating Candidate PiP */}
            <div className="absolute bottom-4 right-4 z-20 w-60 rounded-2xl overflow-hidden bg-slate-950/95 border border-slate-700 shadow-2xl shadow-black backdrop-blur-md flex flex-col">
              <div className="h-7 px-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px] select-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-semibold text-slate-200">Candidate (Live Feed)</span>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded">
                  P2P 1080p
                </span>
              </div>
              <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                {/* Simulated webcam video avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#8083FF] flex items-center justify-center font-bold text-white text-sm shadow-inner">
                  Dev
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-slate-300 backdrop-blur-xs font-mono">
                  Audio: Active · 48kHz
                </div>
                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                  <span className="w-5 h-5 rounded bg-slate-800/90 flex items-center justify-center text-slate-300 text-[10px]">
                    🎤
                  </span>
                  <span className="w-5 h-5 rounded bg-slate-800/90 flex items-center justify-center text-slate-300 text-[10px]">
                    📹
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Deep Dive Grid */}
        <div id="features" className="w-full max-w-6xl mt-28 text-left">
          <div className="mb-12">
            <span className="text-xs font-bold text-[#8083FF] uppercase tracking-wider font-mono">Technical Pillars</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Everything required to evaluate senior engineers.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
              Zero tab switching. Built specifically for real engineering problem solving, from low-level data structures to high-level distributed systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Monaco Editor */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-[#8083FF]/50 transition-colors flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#8083FF]/15 border border-[#8083FF]/30 flex items-center justify-center text-[#A5A6FF] mb-5 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Monaco CRDT Synchronization</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Real Monaco editor (the engine behind VS Code) connected over Yjs CRDTs. Provides remote cursor positions, selection highlighting, and multi-language syntax with zero merge conflicts.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>y-monaco + y-socket.io</span>
                <span className="text-[#8083FF]">CRDT Powered</span>
              </div>
            </div>

            {/* Feature 2: Excalidraw Canvas */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-[#8083FF]/50 transition-colors flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Infinite System Design Canvas</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Deep Excalidraw whiteboard integration. Sketch microservice boundaries, database sharding topologies, and event streams simultaneously alongside your running code buffer.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>@mizuka/y-excalidraw</span>
                <span className="text-emerald-400">Multi-User</span>
              </div>
            </div>

            {/* Feature 3: WebRTC Video */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-[#8083FF]/50 transition-colors flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Peer-to-Peer WebRTC Calling</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Low-latency browser-to-browser audio and video calling with draggable Picture-in-Picture and split grid views. No third-party meeting links or software installs required.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>RTCPeerConnection</span>
                <span className="text-purple-400">Encrypted P2P</span>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture & Protocol Section */}
        <div id="architecture" className="w-full max-w-6xl mt-28 text-left bg-gradient-to-b from-slate-900/80 to-[#0B1326]/80 border border-slate-800 rounded-2xl p-8 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="text-xs font-bold text-[#8083FF] uppercase tracking-wider font-mono">
                Engine Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 mb-4">
                Designed around state synchronization, not centralized screen sharing.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Most platforms capture a high-bandwidth video feed of someone else&apos;s screen. InterACTier sends lightweight binary delta updates over WebSocket and direct WebRTC tracks. Bandwidth consumption remains below 150 KB/s even with 4K multi-monitor setups.
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-300">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 block">Signaling Gateway</span>
                  <span className="font-bold text-white">Node.js + Socket.IO :1234</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 block">CRDT Synchronization</span>
                  <span className="font-bold text-white">Yjs + lib0 Binaries</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-950/90 rounded-xl p-5 border border-slate-800/90 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400 text-[11px]">
                <span>Room Capacity Guard</span>
                <button
                  onClick={() => copySnippet("signalingNamespace.adapter.rooms.get(roomId)", "code")}
                  className="hover:text-white transition-colors cursor-pointer text-[10px]"
                >
                  {copiedFeature === "code" ? "Copied!" : "Copy Spec"}
                </button>
              </div>
              <p className="text-purple-400">const<span className="text-white"> room = adapter.rooms.get(roomId);</span></p>
              <p className="text-purple-400 mt-1">if <span className="text-white">(room.size &gt;= </span><span className="text-amber-400">2</span><span className="text-white">) &#123;</span></p>
              <p className="pl-4 text-slate-400">// Strict 1-on-1 interview isolation</p>
              <p className="pl-4 text-rose-400">socket.emit<span className="text-white">(&quot;room-full&quot;);</span></p>
              <p className="pl-4 text-rose-400">socket.disconnect<span className="text-white">(true);</span></p>
              <p className="text-white">&#125;</p>
              <p className="mt-3 text-emerald-400">// Zero WebRTC glare or candidate collisions</p>
            </div>
          </div>
        </div>

        {/* Ready to Interview Bottom CTA */}
        <div className="w-full max-w-6xl mt-24 py-16 px-6 sm:px-12 rounded-3xl bg-gradient-to-r from-[#8083FF]/15 via-slate-900 to-[#6366F1]/15 border border-[#8083FF]/30 text-center flex flex-col items-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Conduct your next technical round seamlessly.
          </h2>
          <p className="max-w-xl text-slate-300 text-sm sm:text-base mb-8">
            Create an interview room in 1 second, share the URL with your candidate, and evaluate real code and architecture in real time.
          </p>
          <Link
            href={session ? "/dashboard" : "/auth/signup"}
            className="px-8 py-3.5 rounded-xl bg-[#8083FF] hover:bg-[#6C70FF] text-white font-semibold text-sm sm:text-base shadow-xl shadow-[#8083FF]/30 hover:shadow-[#8083FF]/50 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Start Free Interview Session</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </main>

      {/* Clean Engineering Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#060B1A] py-10 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8083FF]" />
            <span className="text-slate-300 font-semibold">InterACTier Engine</span>
            <span>—</span>
            <span>Realtime Technical Interview Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">
              Dashboard
            </Link>
            <Link href="/auth/signin" className="hover:text-slate-300 transition-colors">
              Sign In
            </Link>
            <span>Next.js 16 + WebRTC</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
