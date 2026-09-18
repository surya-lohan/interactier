"use client";

import { signUp } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import ThemeToggle from "@/app/components/ThemeToggle";

export default function SignUp() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const router = useRouter();

    const handleSignUp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!name.trim() || !email.trim() || !password) {
            setErrorMsg("Please fill in all fields.");
            return;
        }

        if (password.length < 6) {
            setErrorMsg("Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);
        setErrorMsg("");

        try {
            const { data, error } = await signUp.email({
                name: name.trim(),
                email: email.trim(),
                password,
            });

            if (error) {
                console.error("Sign Up Failed:", error.message);
                setErrorMsg(error.message || "Failed to create account. Please try again.");
                setLoading(false);
                return;
            }

            console.log("User created successfully!", data);
            router.push("/dashboard");
        } catch (err: any) {
            console.error("Sign Up Exception:", err);
            setErrorMsg(err?.message || "An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-[#FAFAFC] dark:bg-[#070D1E] text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 overflow-hidden font-sans selection:bg-[#EFF6FF] selection:text-[#2563EB] transition-colors duration-200">
            {/* Top Right Theme Toggle */}
            <div className="absolute top-5 right-5 z-20">
                <ThemeToggle />
            </div>

            {/* Background Subtle Accent */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[#EFF6FF] dark:bg-[#2563EB]/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Main Auth Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="rounded-2xl bg-white dark:bg-[#0E172E] border border-[#E2E8F0] dark:border-[#1E293B] p-7 sm:p-9 shadow-diffuse dark:shadow-none transition-all">
                    {/* Header with Brand Logo */}
                    <div className="flex flex-col items-center text-center">
                        <Link href="/" className="inline-flex items-center gap-2.5 group mb-5">
                            <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-xs font-black text-white text-base tracking-wider group-hover:scale-105 transition-transform duration-200">
                                IA
                            </div>
                            <span className="font-extrabold text-2xl tracking-tight text-[#0F172A] dark:text-white">
                                Inter<span className="text-[#2563EB]">ACT</span>ier
                            </span>
                        </Link>

                        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
                            Create your account
                        </h1>
                        <p className="text-xs sm:text-sm text-[#4B5563] dark:text-slate-400 mt-1">
                            Join to start collaborating in real-time
                        </p>
                    </div>

                    {/* Error Banner */}
                    {errorMsg && (
                        <div className="mt-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in duration-200">
                            <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="leading-relaxed flex-1 font-medium">{errorMsg}</span>
                            <button
                                type="button"
                                onClick={() => setErrorMsg("")}
                                className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 ml-auto cursor-pointer"
                                aria-label="Dismiss error"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Sign-Up Form */}
                    <form onSubmit={handleSignUp} className="mt-6 space-y-4">
                        {/* Full Name Field */}
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4B5563] dark:text-slate-400">
                                Full Name
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-3.5 text-[#94A3B8] dark:text-slate-500 pointer-events-none">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full rounded-xl bg-white dark:bg-[#15203D] border border-[#E2E8F0] dark:border-slate-700 pl-10 pr-3.5 py-2.5 text-sm text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#EFF6FF] dark:focus:ring-[#2563EB]/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4B5563] dark:text-slate-400">
                                Email Address
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-3.5 text-[#94A3B8] dark:text-slate-500 pointer-events-none">
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
                                    className="w-full rounded-xl bg-white dark:bg-[#15203D] border border-[#E2E8F0] dark:border-slate-700 pl-10 pr-3.5 py-2.5 text-sm text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#EFF6FF] dark:focus:ring-[#2563EB]/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4B5563] dark:text-slate-400">
                                    Password
                                </label>
                                <span className="text-[10px] text-[#64748B] dark:text-slate-400">Min. 6 chars</span>
                            </div>
                            <div className="relative flex items-center">
                                <span className="absolute left-3.5 text-[#94A3B8] dark:text-slate-500 pointer-events-none">
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
                                    className="w-full rounded-xl bg-white dark:bg-[#15203D] border border-[#E2E8F0] dark:border-slate-700 pl-10 pr-10 py-2.5 text-sm text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#EFF6FF] dark:focus:ring-[#2563EB]/20 transition-all font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 text-[#94A3B8] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-colors p-1 cursor-pointer"
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
                                className="w-full rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:hover:bg-[#1D4ED8] text-white font-semibold py-2.5 px-4 shadow-cta hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2 text-sm cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                        </svg>
                                        <span>Creating account...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign Up</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Footer Switcher */}
                    <div className="mt-6 pt-5 border-t border-[#E2E8F0] dark:border-[#1E293B] text-center text-xs text-[#4B5563] dark:text-slate-400">
                        Already have an account?{" "}
                        <Link
                            href="/auth/signin"
                            className="font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:text-[#1D4ED8] dark:hover:text-blue-300 transition-colors ml-1"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}