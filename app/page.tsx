"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import ThemeToggle from "./components/ThemeToggle";

export default function HomePage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [roomIdInput, setRoomIdInput] = useState("");
  const [copiedFeature, setCopiedFeature] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"both" | "code" | "canvas">("both");

  const handleQuickJoin = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const cleanId = roomIdInput.trim();
    if (!cleanId) return;
    router.push(`/room/${cleanId}`);
  };

  const handleCreateInstantRoom = () => {
    // Generate a clean 8-character random room id if not authenticated, or navigate to dashboard/auth
    if (session) {
      router.push("/dashboard");
    } else {
      const tempId = Math.random().toString(36).substring(2, 10);
      router.push(`/room/${tempId}`);
    }
  };

  const copySnippet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFeature(id);
    setTimeout(() => setCopiedFeature(null), 1800);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] dark:bg-[#070D1E] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col font-sans selection:bg-[#EFF6FF] selection:text-[#2563EB] transition-colors duration-200">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#E2E8F0_1px,transparent_1px),linear-gradient(to_bottom,#E2E8F0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1E293B_1px,transparent_1px),linear-gradient(to_bottom,#1E293B_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_60%,transparent_100%)] opacity-30 dark:opacity-20" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[320px] bg-gradient-to-b from-[#EFF6FF] to-transparent dark:from-[#2563EB]/15 dark:to-transparent blur-[80px] rounded-full pointer-events-none" />
      </div>

      {/* Header / Navigation */}
      <header className="relative z-30 sticky top-0 bg-white/85 dark:bg-[#0E172E]/90 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#1E293B] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[70px] flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-[#0F172A] dark:text-white">
                Inter<span className="text-[#2563EB]">ACT</span>ier
              </span>
              <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EFF6FF] dark:bg-[#1E293B] text-[#2563EB] dark:text-[#60A5FA] border border-[#BFDBFE] dark:border-slate-700">
                v2.0
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-[#4B5563] dark:text-slate-300">
            <a href="#features" className="hover:text-[#0F172A] dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#workspace" className="hover:text-[#0F172A] dark:hover:text-white transition-colors">
              Workspace Live Demo
            </a>
            <a href="#architecture" className="hover:text-[#0F172A] dark:hover:text-white transition-colors">
              Architecture
            </a>
            <a href="#reviews" className="hover:text-[#0F172A] dark:hover:text-white transition-colors">
              Reviews
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button in Homepage Navbar */}
            <ThemeToggle />

            {session ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-all shadow-cta flex items-center gap-2"
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
                  className="px-4 py-2 text-[#4B5563] dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white text-sm font-medium transition-colors hidden sm:inline-block"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-5 py-2.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-all shadow-cta flex items-center gap-2"
                >
                  <span>Login / Signup</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center">
        {/* HERO SECTION */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20 sm:pb-24">
          {/* Centered Top Announcement Pill */}
          <div className="flex justify-center mb-10">
            <a
              href="#architecture"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFF6FF] dark:bg-[#1E293B]/70 border border-[#DBEAFE] dark:border-slate-700 text-[#2563EB] dark:text-[#60A5FA] text-xs sm:text-[13px] font-semibold hover:bg-[#E0EDFF] dark:hover:bg-[#1E293B] transition-all group"
            >
              <span className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-[#3B82F6] animate-pulse" />
              <span>NEW: Peer-to-Peer WebRTC Mesh + Yjs CRDTs</span>
              <span className="text-[#93C5FD] dark:text-slate-600">|</span>
              <span className="font-medium text-[#1D4ED8] dark:text-[#93C5FD] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Read specs
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </a>
          </div>

          {/* Split 2-Column Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left Column: High-Impact Copy & Actions */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              {/* Eyebrow */}
              <div className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA] mb-3">
                Next-Gen Engineering Assessments
              </div>

              {/* H1 Dual-Tone Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-[#0F172A] dark:text-white tracking-tight leading-[1.15] mb-5">
                The collaborative interview room{" "}
                <span className="text-[#2563EB] dark:text-[#3B82F6]">engineered for developers.</span>
              </h1>

              {/* Concise Gray Subtext */}
              <p className="text-[15px] sm:text-[16px] text-[#4B5563] dark:text-slate-400 font-normal leading-[1.6] mb-8 max-w-xl">
                A high-performance workspace combining real-time Monaco code editing, an infinite system design canvas, and encrypted peer-to-peer video calling. No Zoom tabs. Zero sync latency.
              </p>

              {/* Primary CTA + Quick Join Form */}
              <div className="w-full max-w-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                <button
                  onClick={handleCreateInstantRoom}
                  className="h-12 px-6 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] dark:hover:bg-[#1D4ED8] text-white text-[15px] font-semibold flex items-center justify-center gap-2 shadow-cta hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>Launch Interview Room</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>

                {/* Quick Join Input Box */}
                <form onSubmit={handleQuickJoin} className="relative flex-1 flex items-center">
                  <input
                    type="text"
                    value={roomIdInput}
                    onChange={(e) => setRoomIdInput(e.target.value)}
                    placeholder="Enter Room UUID..."
                    className="w-full h-12 pl-4 pr-16 bg-white dark:bg-[#0E172E] border border-[#E2E8F0] dark:border-slate-700 focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#EFF6FF] dark:focus:ring-[#2563EB]/20 rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-white outline-none transition-all font-mono"
                  />
                  <button
                    type="submit"
                    disabled={!roomIdInput.trim()}
                    className="absolute right-1.5 h-9 px-3 bg-[#0F172A] hover:bg-[#2563EB] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] disabled:opacity-40 disabled:hover:bg-[#0F172A] dark:disabled:hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Join
                  </button>
                </form>
              </div>

              {/* Microcopy with Green Checkmarks */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-[13px] text-[#4B5563] dark:text-slate-300 mb-8">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">No login required to join</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Sub-50ms sync latency</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">End-to-end encrypted</span>
                </div>
              </div>

              {/* Avatar Stack with Review Rating Gold Stars */}
              <div className="pt-5 border-t border-[#E2E8F0] dark:border-[#1E293B] w-full max-w-lg flex items-center gap-4">
                {/* Avatars */}
                <div className="flex -space-x-2.5 overflow-hidden">
                  <div className="inline-block h-9 w-9 rounded-full ring-2 ring-white dark:ring-[#070D1E] bg-[#EFF6FF] dark:bg-blue-950/60 flex items-center justify-center font-bold text-xs text-[#2563EB] dark:text-[#60A5FA]">
                    SK
                  </div>
                  <div className="inline-block h-9 w-9 rounded-full ring-2 ring-white dark:ring-[#070D1E] bg-[#ECFDF5] dark:bg-emerald-950/60 flex items-center justify-center font-bold text-xs text-[#10B981] dark:text-emerald-400">
                    MR
                  </div>
                  <div className="h-9 w-9 rounded-full ring-2 ring-white dark:ring-[#070D1E] bg-[#FEF3C7] dark:bg-amber-950/60 flex items-center justify-center font-bold text-xs text-[#D97706] dark:text-amber-400">
                    AL
                  </div>
                  <div className="h-9 w-9 rounded-full ring-2 ring-white dark:ring-[#070D1E] bg-[#F5F3FF] dark:bg-purple-950/60 flex items-center justify-center font-bold text-xs text-[#7C3AED] dark:text-purple-400">
                    JD
                  </div>
                  <div className="h-9 w-9 rounded-full ring-2 ring-white dark:ring-[#070D1E] bg-slate-900 dark:bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center">
                    +1.4k
                  </div>
                </div>

                {/* Rating & Reviews */}
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1 text-xs font-bold text-[#0F172A] dark:text-white">4.98 / 5.0</span>
                  </div>
                  <span className="text-xs text-[#4B5563] dark:text-slate-400">
                    Trusted by hiring leads at top tech engineering teams
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual with Circular Floating Chips */}
            <div className="lg:col-span-6 relative">
              {/* Floating Chips / Nodes flanking the visual */}
              {/* Top-Left Floating Chip */}
              <div className="absolute -top-4 -left-4 z-20 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0E172E] border border-[#E2E8F0] dark:border-slate-700 shadow-diffuse dark:shadow-none text-xs font-semibold text-[#0F172A] dark:text-white animate-bounce duration-1000">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                <span>⚡ Sub-40ms CRDT Sync</span>
              </div>

              {/* Top-Right Floating Chip */}
              <div className="absolute -top-5 -right-3 z-20 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0E172E] border border-[#E2E8F0] dark:border-slate-700 shadow-diffuse dark:shadow-none text-xs font-semibold text-[#0F172A] dark:text-slate-200">
                <div className="w-4 h-4 rounded-full bg-[#EFF6FF] dark:bg-[#1E293B] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center font-mono text-[10px] font-bold">
                  TS
                </div>
                <span>Monaco 60 FPS Editor</span>
              </div>

              {/* Bottom-Left Floating Chip */}
              <div className="absolute -bottom-5 -left-3 z-20 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0E172E] border border-[#E2E8F0] dark:border-slate-700 shadow-diffuse dark:shadow-none text-xs font-semibold text-[#0F172A] dark:text-white">
                <span className="text-emerald-500 font-bold">🎨</span>
                <span>Infinite Canvas (Excalidraw)</span>
              </div>

              {/* Bottom-Right Floating Chip */}
              <div className="absolute -bottom-4 -right-3 z-20 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0E172E] border border-[#E2E8F0] dark:border-slate-700 shadow-diffuse dark:shadow-none text-xs font-semibold text-[#0F172A] dark:text-white">
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                <span>WebRTC 1080p P2P Mesh</span>
              </div>

              {/* Main Product Showcase Card */}
              <div
                id="workspace"
                className="w-full rounded-2xl bg-white dark:bg-[#0E172E] border border-[#E2E8F0] dark:border-[#1E293B] shadow-diffuse dark:shadow-none overflow-hidden text-left"
              >
                {/* Browser / Window Header Bar */}
                <div className="h-11 px-4 bg-[#F8FAFC] dark:bg-[#0B1326] border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between select-none">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#EF4444] inline-block" />
                      <span className="w-3 h-3 rounded-full bg-[#F59E0B] inline-block" />
                      <span className="w-3 h-3 rounded-full bg-[#10B981] inline-block" />
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 ml-3 px-3 py-1 bg-white dark:bg-[#070D1E] rounded-md border border-[#E2E8F0] dark:border-slate-700 text-[11px] font-mono text-[#0F172A] dark:text-slate-300">
                      <svg className="w-3 h-3 text-[#10B981]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span>interactier.io/room/live-78f92a</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] dark:bg-emerald-950/40 text-[#10B981] dark:text-emerald-400 font-mono text-[11px] border border-[#A7F3D0] dark:border-emerald-800 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                      Connected
                    </span>
                  </div>
                </div>

                {/* View Switcher Bar */}
                <div className="h-9 px-4 bg-[#F8FAFC] dark:bg-[#0B1326] border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveTab("both")}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors ${activeTab === "both"
                        ? "bg-[#EFF6FF] dark:bg-[#1E293B] text-[#2563EB] dark:text-[#60A5FA] font-semibold"
                        : "text-[#4B5563] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white"
                        }`}
                    >
                      Split View
                    </button>
                    <button
                      onClick={() => setActiveTab("code")}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors ${activeTab === "code"
                        ? "bg-[#EFF6FF] dark:bg-[#1E293B] text-[#2563EB] dark:text-[#60A5FA] font-semibold"
                        : "text-[#4B5563] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white"
                        }`}
                    >
                      Code Editor
                    </button>
                    <button
                      onClick={() => setActiveTab("canvas")}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors ${activeTab === "canvas"
                        ? "bg-[#EFF6FF] dark:bg-[#1E293B] text-[#2563EB] dark:text-[#60A5FA] font-semibold"
                        : "text-[#4B5563] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white"
                        }`}
                    >
                      Whiteboard
                    </button>
                  </div>
                  <span className="text-[11px] font-mono text-[#64748B] dark:text-slate-400 hidden sm:inline">
                    2 Engineers in Room
                  </span>
                </div>

                {/* Workspace Panels */}
                <div className="grid grid-cols-1 md:grid-cols-12 min-h-95 bg-white dark:bg-[#070D1E] relative">
                  {/* Left Half: Monaco Preview */}
                  {(activeTab === "both" || activeTab === "code") && (
                    <div
                      className={`${activeTab === "both" ? "md:col-span-6 border-b md:border-b-0 md:border-r border-[#E2E8F0] dark:border-slate-800" : "md:col-span-12"
                        } flex flex-col bg-[#0F172A] text-slate-200`}
                    >
                      <div className="h-8 px-4 bg-[#0B1120] border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                          <span>LRUCache.ts</span>
                        </div>
                        <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                          Candidate typing...
                        </span>
                      </div>

                      <div className="p-4 font-mono text-[12px] leading-relaxed text-slate-300 overflow-x-auto selection:bg-[#2563EB]/40">
                        <p className="text-slate-500">// Collaborative LRU Cache</p>
                        <p className="mt-1">
                          <span className="text-purple-400">class</span>{" "}
                          <span className="text-amber-300">LRUCache</span>&lt;
                          <span className="text-cyan-300">K, V</span>&gt; &#123;
                        </p>
                        <p className="pl-4">
                          <span className="text-purple-400">private</span>{" "}
                          <span className="text-blue-300">cache</span> ={" "}
                          <span className="text-purple-400">new</span>{" "}
                          <span className="text-teal-300">Map</span>();
                        </p>
                        <p className="pl-4 mt-1">
                          <span className="text-purple-400">get</span>(key:{" "}
                          <span className="text-cyan-300">K</span>) &#123;
                        </p>
                        <p className="pl-8 text-slate-400">
                          if (!this.cache.has(key)) return undefined;
                        </p>
                        <p className="pl-8 relative bg-blue-500/10 py-0.5 rounded">
                          const val = this.cache.get(key)!;
                          <span className="inline-block w-0.5 h-3.5 bg-[#2563EB] align-middle ml-1 animate-pulse" />
                          <span className="absolute -top-4 right-2 bg-[#2563EB] text-white text-[9px] px-1 py-0.2 rounded font-sans font-semibold">
                            Interviewer
                          </span>
                        </p>
                        <p className="pl-8">this.cache.delete(key);</p>
                        <p className="pl-8">this.cache.set(key, val);</p>
                        <p className="pl-8 text-emerald-400">return val;</p>
                        <p className="pl-4">&#125;</p>
                        <p>&#125;</p>
                      </div>
                    </div>
                  )}

                  {/* Right Half: System Design Canvas Preview */}
                  {(activeTab === "both" || activeTab === "canvas") && (
                    <div
                      className={`${activeTab === "both" ? "md:col-span-6" : "md:col-span-12"
                        } bg-[#FAFAFC] dark:bg-[#070D1E] flex flex-col relative overflow-hidden`}
                    >
                      <div className="h-8 px-4 bg-white dark:bg-[#0B1326] border-b border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between text-xs font-mono text-[#0F172A] dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <span>SystemDesign.canvas</span>
                        </div>
                        <span className="text-[10px] text-[#64748B] dark:text-slate-400">Infinite Whiteboard</span>
                      </div>

                      <div className="flex-1 p-5 relative flex flex-col items-center justify-center">
                        <div className="w-full max-w-xs space-y-3 font-mono text-xs">
                          {/* Client Tier */}
                          <div className="p-2.5 rounded-xl bg-white dark:bg-[#0E172E] border border-[#E2E8F0] dark:border-slate-700 text-center shadow-xs">
                            <span className="text-[9px] uppercase tracking-wider text-[#64748B] dark:text-slate-400 font-semibold block">
                              Client Layer
                            </span>
                            <span className="text-[#0F172A] dark:text-white font-bold text-xs">
                              Global Edge (Cloudflare)
                            </span>
                          </div>

                          {/* Arrow */}
                          <div className="flex justify-center text-[#94A3B8] dark:text-slate-600 -my-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          </div>

                          {/* Gateway */}
                          <div className="p-2.5 rounded-xl bg-[#EFF6FF] dark:bg-[#1E293B]/70 border border-[#BFDBFE] dark:border-blue-900/60 text-center shadow-xs">
                            <span className="text-[9px] uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA] font-semibold block">
                              WebSocket & P2P Broker
                            </span>
                            <span className="text-[#1D4ED8] dark:text-white font-bold text-xs">
                              Signaling Server :1234
                            </span>
                          </div>

                          {/* Microservices */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div className="p-2 rounded-lg bg-white dark:bg-[#0E172E] border border-[#E2E8F0] dark:border-slate-700 text-center shadow-xs">
                              <span className="text-[10px] text-[#10B981] font-bold block">Auth Engine</span>
                              <span className="text-[9px] text-[#64748B] dark:text-slate-400">JWT Session</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white dark:bg-[#0E172E] border border-[#E2E8F0] dark:border-slate-700 text-center shadow-xs">
                              <span className="text-[10px] text-[#7C3AED] font-bold block">CRDT Store</span>
                              <span className="text-[9px] text-[#64748B] dark:text-slate-400">Yjs Binary Delta</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Floating WebRTC Picture-in-Picture Webcam */}
                  <div className="absolute bottom-3 right-3 z-10 w-48 rounded-xl overflow-hidden bg-white dark:bg-[#0E172E] border border-[#E2E8F0] dark:border-[#1E293B] shadow-card-hover dark:shadow-none flex flex-col">
                    <div className="h-6 px-2 bg-[#F8FAFC] dark:bg-[#0B1326] border-b border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between text-[10px] font-semibold text-[#0F172A] dark:text-white">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                        <span>Candidate Video</span>
                      </div>
                      <span className="text-[9px] text-[#2563EB] dark:text-[#60A5FA] font-mono">1080p</span>
                    </div>
                    <div className="aspect-video bg-[#0F172A] relative flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white font-bold text-xs flex items-center justify-center shadow">
                        Dev
                      </div>
                      <div className="absolute bottom-1 left-1.5 text-[9px] font-mono text-emerald-400 bg-black/60 px-1 rounded">
                        Mic: Active
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* METRICS & SOCIAL PROOF BAND */}
        <section className="w-full bg-white dark:bg-[#0E172E] border-y border-[#E2E8F0] dark:border-[#1E293B] py-10 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="flex flex-col items-center">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
                  &lt; 50ms
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#4B5563] dark:text-slate-400 mt-1">
                  CRDT P2P Sync Latency
                </span>
              </div>
              <div className="flex flex-col items-center border-l-0 sm:border-l border-[#E2E8F0] dark:border-slate-800">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#2563EB] dark:text-[#60A5FA] tracking-tight">
                  99.99%
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#4B5563] dark:text-slate-400 mt-1">
                  Signaling Mesh Uptime
                </span>
              </div>
              <div className="flex flex-col items-center border-l-0 md:border-l border-[#E2E8F0] dark:border-slate-800">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
                  150 KB/s
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#4B5563] dark:text-slate-400 mt-1">
                  Average Bandwidth Usage
                </span>
              </div>
              <div className="flex flex-col items-center border-l-0 sm:border-l border-[#E2E8F0] dark:border-slate-800">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#10B981] tracking-tight">
                  25,000+
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#4B5563] dark:text-slate-400 mt-1">
                  Technical Rounds Conducted
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE CARDS GRID */}
        <section id="features" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-left">
          {/* Section Header */}
          <div className="max-w-3xl mb-16">
            <div className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA] mb-2">
              PLATFORM CAPABILITIES
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] dark:text-white tracking-[-0.02em] leading-tight mb-4">
              Everything required to evaluate senior engineers with precision.
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[#4B5563] dark:text-slate-400 font-normal leading-[1.6]">
              Designed to replace sluggish screen sharing and disjointed tools with a unified, high-fidelity developer workspace.
            </p>
          </div>

          {/* 3-Column Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Monaco CRDT */}
            <div className="rounded-2xl bg-white dark:bg-[#0E172E] border border-[#E2E8F0] dark:border-[#1E293B] p-8 shadow-diffuse dark:shadow-none hover:shadow-card-hover dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between group">
              <div>
                {/* 1. Rounded square pastel icon container with matching monochrome icon */}
                <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] dark:bg-[#1E293B] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>

                {/* 2. Small uppercase tag */}
                <div className="text-[11px] sm:text-[12px] font-semibold tracking-wider text-[#2563EB] dark:text-[#60A5FA] uppercase mb-2">
                  FEATURE 01
                </div>

                {/* 3. Bold card title followed by short explanatory body text */}
                <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-3">
                  Monaco CRDT Synchronization
                </h3>
                <p className="text-[15px] text-[#4B5563] dark:text-slate-400 leading-[1.6] mb-6">
                  Industrial-grade VS Code editor powered by Yjs Conflict-free Replicated Data Types. Delivers true multi-cursor presence, instant code execution, and conflict-free concurrent editing.
                </p>

                {/* 4. Vertical feature checklist with soft circular checkmark icons */}
                <ul className="space-y-3 pt-4 border-t border-[#E2E8F0] dark:border-[#1E293B] text-sm text-[#4B5563] dark:text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#EFF6FF] dark:bg-[#1E293B] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Real-time remote cursor & selection highlights</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#EFF6FF] dark:bg-[#1E293B] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Syntax highlighting for 40+ programming languages</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#EFF6FF] dark:bg-[#1E293B] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Instant snapshot saving & export to interview report</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between text-xs font-mono text-[#64748B] dark:text-slate-400">
                <span>Engine: y-monaco</span>
                <span className="font-semibold text-[#2563EB] dark:text-[#60A5FA]">Zero Conflicts</span>
              </div>
            </div>

            {/* Card 2: Infinite Canvas */}
            <div className="rounded-2xl bg-white dark:bg-[#0E172E] border border-[#E2E8F0] dark:border-[#1E293B] p-8 shadow-diffuse dark:shadow-none hover:shadow-card-hover dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between group">
              <div>
                {/* 1. Rounded square pastel icon container (Mint Wash) */}
                <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] dark:bg-emerald-950/40 text-[#10B981] dark:text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>

                {/* 2. Small uppercase tag */}
                <div className="text-[11px] sm:text-[12px] font-semibold tracking-wider text-[#10B981] dark:text-emerald-400 uppercase mb-2">
                  FEATURE 02
                </div>

                {/* 3. Bold card title */}
                <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-3">
                  Infinite System Design Canvas
                </h3>
                <p className="text-[15px] text-[#4B5563] dark:text-slate-400 leading-[1.6] mb-6">
                  Deep Excalidraw whiteboard integration. Sketch distributed architectures, microservices topologies, and database schemas with simultaneous multi-user stroke synchronization.
                </p>

                {/* 4. Vertical feature checklist */}
                <ul className="space-y-3 pt-4 border-t border-[#E2E8F0] dark:border-[#1E293B] text-sm text-[#4B5563] dark:text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#ECFDF5] dark:bg-emerald-950/40 text-[#10B981] dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Hand-drawn architectural shapes & connectors</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#ECFDF5] dark:bg-emerald-950/40 text-[#10B981] dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Live stroke sync via binary Yjs element arrays</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#ECFDF5] dark:bg-emerald-950/40 text-[#10B981] dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Side-by-side split view with code editor</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between text-xs font-mono text-[#64748B] dark:text-slate-400">
                <span>Engine: @mizuka/y-excalidraw</span>
                <span className="font-semibold text-[#10B981] dark:text-emerald-400">Realtime Vector</span>
              </div>
            </div>

            {/* Card 3: WebRTC Video */}
            <div className="rounded-2xl bg-white dark:bg-[#0E172E] border border-[#E2E8F0] dark:border-[#1E293B] p-8 shadow-diffuse dark:shadow-none hover:shadow-card-hover dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between group">
              <div>
                {/* 1. Rounded square pastel icon container (Purple Wash) */}
                <div className="w-12 h-12 rounded-xl bg-[#F5F3FF] dark:bg-purple-950/40 text-[#7C3AED] dark:text-purple-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>

                {/* 2. Small uppercase tag */}
                <div className="text-[11px] sm:text-[12px] font-semibold tracking-wider text-[#7C3AED] dark:text-purple-400 uppercase mb-2">
                  FEATURE 03
                </div>

                {/* 3. Bold card title */}
                <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-3">
                  Peer-to-Peer WebRTC Calling
                </h3>
                <p className="text-[15px] text-[#4B5563] dark:text-slate-400 leading-[1.6] mb-6">
                  Direct browser-to-browser encrypted video and audio feeds with draggable Picture-in-Picture window. Zero third-party meeting links or software installations required.
                </p>

                {/* 4. Vertical feature checklist */}
                <ul className="space-y-3 pt-4 border-t border-[#E2E8F0] dark:border-[#1E293B] text-sm text-[#4B5563] dark:text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#F5F3FF] dark:bg-purple-950/40 text-[#7C3AED] dark:text-purple-400 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Encrypted direct peer connections (DTLS/SRTP)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#F5F3FF] dark:bg-purple-950/40 text-[#7C3AED] dark:text-purple-400 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Adaptive bitrate stream with 1080p support</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#F5F3FF] dark:bg-purple-950/40 text-[#7C3AED] dark:text-purple-400 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Floating PiP with mute and camera toggles</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between text-xs font-mono text-[#64748B] dark:text-slate-400">
                <span>Engine: RTCPeerConnection</span>
                <span className="font-semibold text-[#7C3AED] dark:text-purple-400">Encrypted Mesh</span>
              </div>
            </div>
          </div>
        </section>

        {/* ARCHITECTURE SECTION */}
        <section id="architecture" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
          <div className="rounded-2xl bg-white dark:bg-[#0E172E] border border-[#E2E8F0] dark:border-[#1E293B] p-8 sm:p-12 shadow-diffuse dark:shadow-none transition-colors">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <div className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA] mb-2">
                  ENGINE ARCHITECTURE
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-white tracking-[-0.02em] leading-tight mb-4">
                  Built around state synchronization, not centralized screen streaming.
                </h2>
                <p className="text-[15px] text-[#4B5563] dark:text-slate-400 leading-[1.6] mb-6">
                  Traditional interview tools compress a video of the screen, introducing blur, 300ms latency, and high bandwidth costs. InterACTier sends microscopic binary CRDT deltas over WebSockets and direct P2P video tracks.
                </p>

                {/* Tech Specs Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#070D1E] border border-[#E2E8F0] dark:border-slate-800">
                    <span className="text-[#64748B] dark:text-slate-400 block mb-1">Signaling Protocol</span>
                    <span className="font-bold text-[#0F172A] dark:text-white">WebSocket + Socket.IO :1234</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#070D1E] border border-[#E2E8F0] dark:border-slate-800">
                    <span className="text-[#64748B] dark:text-slate-400 block mb-1">Conflict Resolution</span>
                    <span className="font-bold text-[#0F172A] dark:text-white">Yjs lib0 Binary Arrays</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#070D1E] border border-[#E2E8F0] dark:border-slate-800">
                    <span className="text-[#64748B] dark:text-slate-400 block mb-1">Room Isolation</span>
                    <span className="font-bold text-[#0F172A] dark:text-white">Strict 1-on-1 Peer Bounds</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#070D1E] border border-[#E2E8F0] dark:border-slate-800">
                    <span className="text-[#64748B] dark:text-slate-400 block mb-1">Audio / Video Encryption</span>
                    <span className="font-bold text-[#0F172A] dark:text-white">DTLS 1.2 / SRTP AES-128</span>
                  </div>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="lg:col-span-5 rounded-xl bg-[#0F172A] p-5 border border-slate-800 text-slate-200 font-mono text-xs shadow-md">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400 text-[11px]">
                  <span>Room Guard Spec</span>
                  <button
                    onClick={() => copySnippet("signalingNamespace.adapter.rooms.get(roomId)", "code-spec")}
                    className="text-[#93C5FD] hover:text-white transition-colors cursor-pointer text-[10px] font-semibold"
                  >
                    {copiedFeature === "code-spec" ? "Copied!" : "Copy Spec"}
                  </button>
                </div>
                <p className="text-purple-400">
                  const <span className="text-white">room = adapter.rooms.get(roomId);</span>
                </p>
                <p className="text-purple-400 mt-1">
                  if <span className="text-white">(room && room.size &gt;= </span>
                  <span className="text-amber-400">2</span>
                  <span className="text-white">) &#123;</span>
                </p>
                <p className="pl-4 text-slate-400">// Strict 1-on-1 interview isolation</p>
                <p className="pl-4 text-rose-400">
                  socket.emit<span className="text-white">(&quot;room-full&quot;);</span>
                </p>
                <p className="pl-4 text-rose-400">
                  socket.disconnect<span className="text-white">(true);</span>
                </p>
                <p className="text-white">&#125;</p>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Zero candidate collisions or glare</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA BANNER */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="rounded-3xl bg-[#EFF6FF] dark:bg-linear-to-br dark:from-[#0E172E] dark:to-[#0B1326] border border-[#BFDBFE] dark:border-[#1E293B] p-10 sm:p-16 shadow-diffuse dark:shadow-none flex flex-col items-center transition-colors">
            <div className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA] mb-2">
              ELEVATE YOUR HIRING ROUNDS
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] dark:text-white tracking-tight mb-4 max-w-2xl">
              Conduct your next technical interview effortlessly.
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[#4B5563] dark:text-slate-400 mb-8 max-w-lg leading-relaxed">
              Create a dedicated interview room in 1 click, send the link to your candidate, and evaluate real code & system design in real time.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={handleCreateInstantRoom}
                className="px-8 py-3.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] dark:hover:bg-[#1D4ED8] text-white font-semibold text-[15px] shadow-cta hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Start Free Interview Session</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              <Link
                href="/auth/signin"
                className="px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 dark:bg-[#15203D] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-white border border-[#E2E8F0] dark:border-slate-700 font-semibold text-[15px] transition-all"
              >
                Sign In to Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0E172E] py-12 text-sm text-[#4B5563] dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center text-white text-xs font-black">
              IA
            </div>
            <span className="font-bold text-[#0F172A] dark:text-white">InterACTier</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-xs text-[#64748B] dark:text-slate-400">Realtime Collaborative Technical Interview Platform</span>
          </div>

          <div className="flex items-center gap-6 text-xs sm:text-sm font-medium">
            <a href="#features" className="hover:text-[#0F172A] dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#architecture" className="hover:text-[#0F172A] dark:hover:text-white transition-colors">
              Architecture
            </a>
            <Link href="/dashboard" className="hover:text-[#0F172A] dark:hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/auth/signin" className="hover:text-[#0F172A] dark:hover:text-white transition-colors">
              Sign In
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>All Systems Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
