"use client";

import { signIn } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function Signin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const router = useRouter();

    const handleSubmit = async (e?: React.SyntheticEvent) => {
        if (e) e.preventDefault();

        if (!email.trim() || !password) {
            setErrorMsg("Please enter both email and password.");
            return;
        }

        setLoading(true);
        setErrorMsg("");

        try {
            const { data, error } = await signIn.email({
                email: email.trim(),
                password,
            });

            if (error) {
                console.error("Login Failed:", error.message);
                setErrorMsg(error.message || "Invalid credentials. Please try again.");
                setLoading(false);
                return;
            }

            console.log("Logged in successfully!", data);
            router.push("/dashboard");
        } catch (err: any) {
            console.error("Login Exception:", err);
            setErrorMsg(err?.message || "An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-[#070D1E] text-slate-100 flex items-center justify-center p-4 sm:p-6 overflow-hidden selection:bg-[#8083FF]/30">
            {/* Background Ambient Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-137.5 h-137.5 bg-[#8083FF]/12 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-87.5 h-87.5 bg-[#4F46E5]/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-10 left-10 w-75 h-75 bg-[#38BDF8]/5 rounded-full blur-[90px] pointer-events-none" />

            {/* Main Auth Card */}
            <div className="relative z-10 w-full max-w-110">
                <div className="rounded-3xl bg-[#0E172E]/90 border border-slate-800/90 p-7 sm:p-9 shadow-2xl shadow-black/50 backdrop-blur-xl transition-all">
                    {/* Header with Brand Logo */}
                    <div className="flex flex-col items-center text-center">
                        <Link href="/" className="inline-flex items-center gap-2.5 group mb-5">
                            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-[#8083FF] to-[#4F46E5] flex items-center justify-center shadow-lg shadow-[#8083FF]/25 font-black text-white text-base tracking-wider group-hover:scale-105 transition-transform duration-200">
                                IA
                            </div>
                            <span className="font-extrabold text-2xl tracking-tight text-white">
                                Inter<span className="text-[#8083FF]">ACT</span>ier
                            </span>
                        </Link>

                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                            Continue to your collaborative engineering workspace
                        </p>
                    </div>

                    {/* Error Banner */}
                    {errorMsg && (
                        <div className="mt-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-rose-300 text-xs animate-in fade-in duration-200">
                            <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="leading-relaxed flex-1">{errorMsg}</span>
                            <button
                                type="button"
                                onClick={() => setErrorMsg("")}
                                className="text-rose-400/80 hover:text-rose-300 ml-auto cursor-pointer"
                                aria-label="Dismiss error"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Sign-In Form */}
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                Email Address
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-3.5 text-slate-500 pointer-events-none">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </span>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full rounded-xl bg-[#090E1F]/90 border pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#8083FF] focus:ring-2 focus:ring-[#8083FF]/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Password
                                </label>
                            </div>
                            <div className="relative flex items-center">
                                <span className="absolute left-3.5 text-slate-500 pointer-events-none">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full rounded-xl bg-[#090E1F]/90 border border-slate-700/70 pl-10 pr-10 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#8083FF]/20 transition-all font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors p-1 cursor-pointer"
                                    title={showPassword ? "Hide password" : "Show password"}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-linear-to-r from-[#8083FF] to-[#6366F1] hover:from-[#7275fc] hover:to-[#5558e6] text-white font-semibold py-2.5 px-4 shadow-lg shadow-[#8083FF]/25 hover:shadow-[#8083FF]/35 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2 text-sm"
                            >
                                {loading ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                        </svg>
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Footer Switcher */}
                    <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
                        Don't have an account?{" "}
                        <Link
                            href="/auth/signup"
                            className="font-semibold text-[#A5B4FC] hover:text-white transition-colors underline underline-offset-4 decoration-[#8083FF]/50 hover:decoration-white ml-1"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}