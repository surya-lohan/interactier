"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "../Context/ThemeContext";

export default function ThemeToggle({
    className = "",
    showLabel = false,
}: {
    className?: string;
    showLabel?: boolean;
}) {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    //hydration mismatch
    if (!mounted) {
        return (
            <div className={`w-9 h-9 rounded-full bg-slate-100 border border-slate-200 animate-pulse ${className}`} />
        );
    }

    const isDark = theme === "dark";

    return (
        <button
            onClick={toggleTheme}
            type="button"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={`relative flex items-center justify-center gap-2 p-2 rounded-full border transition-all duration-200 cursor-pointer shadow-xs ${isDark
                ? "bg-[#1E293B] border-slate-700 text-amber-300 hover:bg-[#334155] hover:text-amber-200 hover:border-slate-600"
                : "bg-white border-[#E2E8F0] text-[#4B5563] hover:bg-[#F8FAFC] hover:text-[#0F172A] hover:border-[#CBD5E1]"
                } ${className}`}
        >
            {isDark ? (
                // Sun Icon for switching to light mode
                <svg
                    className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                </svg>
            ) : (
                // Moon Icon for switching to dark mode
                <svg
                    className="w-4 h-4 transition-transform duration-300 -rotate-12 hover:rotate-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                </svg>
            )}

            {showLabel && (
                <span className="text-xs font-semibold select-none pr-1">
                    {isDark ? "Light" : "Dark"}
                </span>
            )}
        </button>
    );
}
