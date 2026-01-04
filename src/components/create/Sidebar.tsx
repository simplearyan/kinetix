import React, { useState } from "react";
import {
    Type,
    Image as ImageIcon,
    Square,
    ChevronLeft,
    MonitorPlay,
    LayoutGrid,
    X
} from "lucide-react";
import { Engine } from "../../engine/Core";
import { TextObject } from "../../engine/objects/TextObject";
import { CodeBlockObject } from "../../engine/objects/CodeBlockObject";
import { ChartObject } from "../../engine/objects/ChartObject"; interface SidebarProps {
    engine: Engine | null;
}
import { SquareAd } from "../ads/SquareAd";

type Tab = "templates" | "text" | "media" | "shapes" | null;

export const Sidebar = ({ engine }: SidebarProps) => {
    const [activeTab, setActiveTab] = useState<Tab>("text");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleTabClick = (tab: Tab) => {
        if (activeTab === tab) {
            setActiveTab(null); // Toggle close
            setIsMobileMenuOpen(false);
        } else {
            setActiveTab(tab);
        }
    };

    const getNextName = (base: string) => {
        if (!engine) return base;
        let count = 1;
        // Regex to find "Base N" pattern
        const regex = new RegExp(`^${base} (\\d+)$`);

        const existingNumbers = engine.scene.objects
            .map(o => {
                const match = o.name.match(regex);
                return match ? parseInt(match[1]) : 0;
            })
            .filter(n => n > 0);

        if (existingNumbers.length > 0) {
            count = Math.max(...existingNumbers) + 1;
        }

        // If "Base" itself exists but not "Base 1", we might want to start at 2?
        // Or simpler: just count how many objects start with "Base"
        // Let's stick to the gap-filling or max method.
        // If "Heading" exists, next is "Heading 1"? Or "Heading 2"?
        // Used asked for "Heading 1", "Heading 2".

        // Let's start with "Heading 1" always if "Heading" isn't taken? 
        // Or if user just clicks add, it should be "Heading 1", then "Heading 2".

        return `${base} ${count}`;
    };

    const handleAddText = (style: string) => {
        if (!engine) return;
        if (window.innerWidth < 1100) setActiveTab(null);
        const name = getNextName(style === "heading" ? "Heading" : "Subheading");
        const txt = new TextObject(`text-${Date.now()}`, {
            text: name, // Use the name as default text too? Or just "Big Heading"
            fontSize: style === "heading" ? 80 : 40,
            color: "#ffffff"
        });
        txt.name = name; // Set the name
        txt.text = name; // Set the display text to match name for clarity
        txt.x = engine.scene.width / 2 - 150;
        txt.y = engine.scene.height / 2 - 50;
        engine.scene.add(txt);
        engine.render();
    };

    const handleAddCode = () => {
        if (!engine) return;
        if (window.innerWidth < 1100) setActiveTab(null);
        const name = getNextName("Code");
        const code = new CodeBlockObject(`code-${Date.now()}`);
        code.name = name;
        code.x = engine.scene.width / 2 - 200;
        code.y = engine.scene.height / 2 - 100;
        engine.scene.add(code);
        engine.render();
    };

    const handleAddChart = (type: "bar" | "line" | "area" | "scatter" | "pie" | "donut") => {
        if (!engine) return;
        if (window.innerWidth < 1100) setActiveTab(null);

        let nameBase = "Chart";
        if (type === "bar") nameBase = "Bar Chart";
        if (type === "line") nameBase = "Line Chart";
        if (type === "area") nameBase = "Area Chart";
        if (type === "scatter") nameBase = "Scatter Plot";
        if (type === "pie") nameBase = "Pie Chart";
        if (type === "donut") nameBase = "Donut Chart";

        const name = getNextName(nameBase);
        const chart = new ChartObject(`chart-${Date.now()}`, type);
        chart.name = name;
        chart.x = engine.scene.width / 2 - 200;
        chart.y = engine.scene.height / 2 - 150;

        if (type === "pie" || type === "donut") {
            chart.width = 300;
            chart.height = 300;
            chart.labels = ["A", "B", "C", "D"];
            chart.data = [30, 20, 15, 35];
            chart.animation.type = "grow"; // Radial grow
        }

        engine.scene.add(chart);
        engine.render();
    };

    return (
        <div className="flex h-full z-10 shadow-xl shadow-slate-200 dark:shadow-neutral-900/50 relative">
            {/* 1. Slim Activity Bar */}
            <aside className={`w-16 bg-white dark:bg-neutral-900 border-r border-slate-200 dark:border-neutral-800 flex flex-col items-center py-4 gap-4 
            fixed left-0 top-14 bottom-0 z-[60] transition-transform duration-300 lg:static lg:h-full lg:translate-x-0 lg:z-auto
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <button
                    onClick={() => handleTabClick("text")}
                    className={`p-3 rounded-xl transition-all ${activeTab === "text" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800"}`}
                    title="Typography"
                >
                    <Type size={22} />
                </button>
                <button
                    onClick={() => handleTabClick("media")}
                    className={`p-3 rounded-xl transition-all ${activeTab === "media" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800"}`}
                    title="Charts & Media"
                >
                    <ImageIcon size={22} />
                </button>
                <button
                    onClick={() => handleTabClick("shapes")}
                    className={`p-3 rounded-xl transition-all ${activeTab === "shapes" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800"}`}
                    title="Shapes & Code"
                >
                    <Square size={22} />
                </button>

                <div className="flex-1" />

                {/* Ad Spot - Sponsor Slot */}
                <div className="w-12 h-12 mb-2 bg-slate-100 dark:bg-neutral-800 rounded-lg flex flex-col items-center justify-center border border-slate-200 dark:border-neutral-700 overflow-hidden cursor-pointer group hover:border-blue-300 transition-colors">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">AD</span>
                    <div className="w-6 h-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-sm group-hover:scale-110 transition-transform"></div>
                </div>

                <button
                    onClick={() => {
                        setActiveTab(null);
                        setIsMobileMenuOpen(false);
                    }}
                    className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    title="Collapse"
                >
                    <ChevronLeft size={20} className={`transition-transform ${!activeTab ? "rotate-180" : ""}`} />
                </button>
            </aside>


            {/* Mobile Toggle Button (FAB) */}
            <button
                onClick={() => {
                    if (isMobileMenuOpen) {
                        setIsMobileMenuOpen(false);
                        setActiveTab(null);
                    } else {
                        setIsMobileMenuOpen(true);
                    }
                }}
                className={`
                    lg:hidden fixed top-20 right-4 z-[100] p-3 rounded-full shadow-xl transition-all duration-300
                    flex items-center justify-center border border-slate-200 dark:border-slate-700
                    ${isMobileMenuOpen
                        ? "bg-white text-slate-900 dark:bg-neutral-800 dark:text-white"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }
                `}
            >
                {isMobileMenuOpen ? <X size={24} /> : <LayoutGrid size={24} />}
            </button>

            {/* 2. Expandable Drawer */}
            {activeTab && (
                <>
                    {/* Backdrop for mobile overlay */}
                    <div
                        className="fixed inset-0 z-40 lg:hidden bg-black/50 animate-in fade-in duration-200"
                        onClick={() => {
                            setActiveTab(null);
                            setIsMobileMenuOpen(false);
                        }}
                    />
                    <aside className="w-64 sm:w-80 bg-slate-50 dark:bg-neutral-950 border-r border-slate-200 dark:border-neutral-800 flex flex-col animate-in slide-in-from-left-4 duration-200 fixed left-16 top-14 bottom-0 lg:static lg:h-full z-50 shadow-2xl lg:shadow-none">
                        <div className="p-4 border-b border-slate-200 dark:border-neutral-800 flex justify-between items-center bg-white/50 dark:bg-neutral-900/50">
                            <span className="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                                {activeTab === "text" && "Typography"}
                                {activeTab === "media" && "Charts & Data"}
                                {activeTab === "shapes" && "Shapes & Assets"}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">

                            {activeTab === "text" && (
                                <div className="space-y-4">
                                    <div className="text-xs font-bold text-slate-400 text-center mb-4">Click to add to canvas</div>
                                    <button
                                        onClick={() => handleAddText("heading")}
                                        className="w-full text-left p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-700 hover:scale-105 hover:shadow-md transition-all group"
                                    >
                                        <span className="text-4xl font-black text-slate-900 dark:text-white block mb-2">Heading</span>
                                        <span className="text-xs text-slate-400">Inter Display, Bold</span>
                                    </button>
                                    <button
                                        onClick={() => handleAddText("subheading")}
                                        className="w-full text-left p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-700 hover:scale-105 hover:shadow-md transition-all group"
                                    >
                                        <span className="text-xl font-medium text-slate-700 dark:text-neutral-300 block mb-2">Subheading</span>
                                        <span className="text-xs text-slate-400">Inter Display, Medium</span>
                                    </button>
                                </div>
                            )}

                            {activeTab === "media" && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button onClick={() => handleAddChart("bar")} className="aspect-square bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 flex flex-col items-center justify-center hover:bg-blue-50 dark:hover:bg-neutral-700 hover:border-blue-200 transition-all gap-3 group">
                                            <div className="flex items-end gap-1 h-8 w-8 justify-center">
                                                <div className="w-1.5 bg-blue-500/80 h-4 rounded-t-sm group-hover:h-5 transition-all"></div>
                                                <div className="w-1.5 bg-blue-500 h-6 rounded-t-sm group-hover:h-8 transition-all"></div>
                                                <div className="w-1.5 bg-blue-500/80 h-5 rounded-t-sm group-hover:h-4 transition-all"></div>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-600 dark:text-neutral-400">Bar</span>
                                        </button>
                                        <button onClick={() => handleAddChart("line")} className="aspect-square bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 flex flex-col items-center justify-center hover:bg-blue-50 dark:hover:bg-neutral-700 hover:border-blue-200 transition-all gap-3 group">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-500 group-hover:scale-110 transition-transform">
                                                <path d="M3 18 L9 12 L14 16 L21 8" />
                                            </svg>
                                            <span className="text-[10px] font-bold text-slate-600 dark:text-neutral-400">Line</span>
                                        </button>
                                        <button onClick={() => handleAddChart("area")} className="aspect-square bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 flex flex-col items-center justify-center hover:bg-blue-50 dark:hover:bg-neutral-700 hover:border-blue-200 transition-all gap-3 group">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500 group-hover:scale-110 transition-transform">
                                                <path d="M3 18 L9 12 L14 16 L21 8 V 18 H 3" fill="currentColor" fillOpacity="0.2" />
                                                <path d="M3 18 L9 12 L14 16 L21 8" />
                                            </svg>
                                            <span className="text-[10px] font-bold text-slate-600 dark:text-neutral-400">Area</span>
                                        </button>
                                        <button onClick={() => handleAddChart("scatter")} className="aspect-square bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 flex flex-col items-center justify-center hover:bg-blue-50 dark:hover:bg-neutral-700 hover:border-blue-200 transition-all gap-3 group">
                                            <div className="h-8 w-8 relative">
                                                <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                                <div className="absolute top-4 left-4 w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                                <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-600 dark:text-neutral-400">Scatter</span>
                                        </button>
                                        <button onClick={() => handleAddChart("pie")} className="aspect-square bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 flex flex-col items-center justify-center hover:bg-blue-50 dark:hover:bg-neutral-700 hover:border-blue-200 transition-all gap-3 group">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-500 group-hover:scale-110 transition-transform">
                                                <path d="M21.21 15.89 A 10 10 0 1 1 8 2.83" />
                                                <path d="M22 12 A 10 10 0 0 0 12 2 v 10 z" />
                                            </svg>
                                            <span className="text-[10px] font-bold text-slate-600 dark:text-neutral-400">Pie</span>
                                        </button>
                                        <button onClick={() => handleAddChart("donut")} className="aspect-square bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 flex flex-col items-center justify-center hover:bg-blue-50 dark:hover:bg-neutral-700 hover:border-blue-200 transition-all gap-3 group">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-500 group-hover:scale-110 transition-transform">
                                                <circle cx="12" cy="12" r="10" />
                                                <circle cx="12" cy="12" r="4" />
                                            </svg>
                                            <span className="text-[10px] font-bold text-slate-600 dark:text-neutral-400">Donut</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === "shapes" && (
                                <div className="space-y-4">
                                    <button
                                        onClick={handleAddCode}
                                        className="w-full text-left p-1 bg-slate-900 rounded-xl shadow-lg hover:ring-2 ring-blue-500 transition-all group overflow-hidden"
                                    >
                                        <div className="bg-slate-800/50 p-2 flex gap-1.5 border-b border-white/5">
                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        </div>
                                        <div className="p-4 font-mono text-xs">
                                            <span className="text-blue-400">console</span>
                                            <span className="text-white">.log(</span>
                                            <span className="text-green-400">'Code Block'</span>
                                            <span className="text-white">)</span>
                                        </div>
                                    </button>
                                    <div className="text-center text-xs text-slate-400 mt-2">More shapes coming soon...</div>
                                </div>
                            )}

                        </div>

                        <div className="mt-auto pt-4">
                            <SquareAd />
                        </div>
                    </aside>
                </>
            )}
        </div >
    );
};
