import React, { useState } from 'react';
import {
    Settings, Grid3x3, Coffee, Heart, Camera, Download,
    MoreVertical, ChevronLeft, FileVideo, Sun, Moon
} from "lucide-react";

interface HeaderProps {
    onExport: () => void;
    onSnapshot: () => void;
    onSettings: () => void;
    currentGuide: "none" | "center" | "thirds" | "golden";
    onGuideChange: (type: "none" | "center" | "thirds" | "golden") => void;
}

export const Header = ({
    onExport,
    onSnapshot,
    onSettings,
    currentGuide,
    onGuideChange
}: HeaderProps) => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showGuidesMenu, setShowGuidesMenu] = useState(false);

    const toggleTheme = () => {
        if (document.documentElement.classList.contains("dark")) {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        } else {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        }
    };

    return (
        <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 lg:px-6 bg-white dark:bg-slate-900 shrink-0 z-[60] relative transition-colors">

            {/* LEFT: Logo / Back */}
            <div className="flex items-center gap-3">
                <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                        K
                    </div>
                    <span className="font-bold text-lg hidden lg:block text-slate-900 dark:text-white tracking-tight">
                        Kinetix Create
                    </span>
                </a>
            </div>

            {/* CENTER: Project Title (Mobile & Desktop) */}
            <div className="absolute left-1/2 -translate-x-1/2 max-w-[40%] hidden md:block">
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Untitled Project
                </div>
            </div>

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-2">

                {/* Desktop: Donation / Socials */}
                <div className="hidden xl:flex items-center gap-2 mr-2 border-r border-slate-200 dark:border-slate-800 pr-4">
                    <a
                        href="https://ko-fi.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-900/10 dark:text-amber-500 rounded-lg text-xs font-bold transition-colors"
                    >
                        <Coffee size={14} />
                        <span>Support</span>
                    </a>
                </div>

                {/* Guides (Desktop) */}
                <div className="relative hidden lg:block">
                    <button
                        onClick={() => setShowGuidesMenu(!showGuidesMenu)}
                        className={`p-2 rounded-lg transition-colors ${currentGuide !== 'none' ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800"}`}
                        title="Canvas Guides"
                    >
                        <Grid3x3 size={20} />
                    </button>
                    {/* Dropdown would go here - simplified for brevity, assume similar implementation */}
                    {showGuidesMenu && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-slate-200 dark:border-neutral-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-2 space-y-1">
                                {[
                                    { id: "none", label: "No Guides" },
                                    { id: "center", label: "Center" },
                                    { id: "thirds", label: "Rule of Thirds" },
                                    { id: "golden", label: "Golden Ratio" }
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => {
                                            onGuideChange(opt.id as any);
                                            setShowGuidesMenu(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors ${currentGuide === opt.id ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800"}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-colors hidden sm:block"
                >
                    <Sun size={20} className="hidden dark:block" />
                    <Moon size={20} className="block dark:hidden" />
                </button>

                {/* Settings (Desktop) */}
                <button
                    onClick={onSettings}
                    className="hidden lg:block p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                    <Settings size={20} />
                </button>

                {/* Snapshot */}
                <button
                    onClick={onSnapshot}
                    className="p-2 lg:px-3 lg:py-2 bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 rounded-lg font-medium text-sm hover:bg-slate-200 transition-colors flex items-center gap-2"
                >
                    <Camera size={20} className="lg:w-[18px] lg:h-[18px]" />
                    <span className="hidden lg:inline">Snapshot</span>
                </button>

                {/* Export (Primary) */}
                <button
                    onClick={onExport}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Download size={18} />
                    <span className="hidden lg:inline">Export</span>
                </button>

                {/* Kebab Menu (Mobile) */}
                <div className="relative lg:hidden">
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg"
                    >
                        <MoreVertical size={20} />
                    </button>

                    {showMobileMenu && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-1">
                                <button onClick={onSettings} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                                    <Settings size={16} /> Settings
                                </button>
                                <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                                    <Sun size={16} /> Toggle Theme
                                </button>
                                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                                <a href="https://ko-fi.com" target="_blank" className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-lg">
                                    <Coffee size={16} /> Support
                                </a>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
};
