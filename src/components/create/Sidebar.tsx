import React, { useState } from "react";
import { 
    Type, 
    Image as ImageIcon, 
    Square, 
    ChevronLeft,
    MonitorPlay
} from "lucide-react";
import { Engine } from "../../engine/Core";
import { TextObject } from "../../engine/objects/TextObject";
import { CodeBlockObject } from "../../engine/objects/CodeBlockObject";
import { ChartObject } from "../../engine/objects/ChartObject";interface SidebarProps {
    engine: Engine | null;
}

type Tab = "templates" | "text" | "media" | "shapes" | null;

export const Sidebar = ({ engine }: SidebarProps) => {
    const [activeTab, setActiveTab] = useState<Tab>("text");

    const handleTabClick = (tab: Tab) => {
        if (activeTab === tab) {
            setActiveTab(null); // Toggle close
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
        const name = getNextName("Code");
        const code = new CodeBlockObject(`code-${Date.now()}`);
        code.name = name;
        code.x = engine.scene.width / 2 - 200;
        code.y = engine.scene.height / 2 - 100;
        engine.scene.add(code);
        engine.render();
    };

    const handleAddChart = (type: "bar" | "line" | "pie") => {
        if (!engine) return;
        const name = getNextName(type === "bar" ? "Bar Chart" : "Line Chart");
        const chart = new ChartObject(`chart-${Date.now()}`, type);
        chart.name = name;
        chart.x = engine.scene.width / 2 - 200;
        chart.y = engine.scene.height / 2 - 150;
        engine.scene.add(chart);
        engine.render();
    };

    return (
        <div className="flex h-full z-10 shadow-xl shadow-slate-200 dark:shadow-slate-900/50">
            {/* 1. Slim Activity Bar */}
            <aside className="w-16 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-4 gap-4 z-20">
                 <button 
                    onClick={() => handleTabClick("text")}
                    className={`p-3 rounded-xl transition-all ${activeTab === "text" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                    title="Typography"
                >
                    <Type size={22} />
                </button>
                <button 
                     onClick={() => handleTabClick("media")}
                     className={`p-3 rounded-xl transition-all ${activeTab === "media" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                     title="Charts & Media"
                >
                    <ImageIcon size={22} />
                </button>
                <button 
                     onClick={() => handleTabClick("shapes")}
                     className={`p-3 rounded-xl transition-all ${activeTab === "shapes" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                     title="Shapes & Code"
                >
                    <Square size={22} />
                </button>
                
                <div className="flex-1" />
                
                <button 
                     onClick={() => setActiveTab(null)}
                     className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                     title="Collapse"
                >
                    <ChevronLeft size={20} className={`transition-transform ${!activeTab ? "rotate-180" : ""}`} />
                </button>
            </aside>

            {/* 2. Expandable Drawer */}
            {activeTab && (
                <aside className="w-80 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-left-4 duration-200">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50">
                        <span className="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                                    className="w-full text-left p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:scale-105 hover:shadow-md transition-all group"
                                >
                                    <span className="text-4xl font-black text-slate-900 dark:text-white block mb-2">Heading</span>
                                    <span className="text-xs text-slate-400">Inter Display, Bold</span>
                                </button>
                                <button 
                                    onClick={() => handleAddText("subheading")}
                                    className="w-full text-left p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:scale-105 hover:shadow-md transition-all group"
                                >
                                    <span className="text-xl font-medium text-slate-700 dark:text-slate-300 block mb-2">Subheading</span>
                                    <span className="text-xs text-slate-400">Inter Display, Medium</span>
                                </button>
                            </div>
                        )}

                        {activeTab === "media" && (
                             <div className="space-y-4">
                                 <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => handleAddChart("bar")} className="aspect-square bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-200 transition-all gap-3 group">
                                        <div className="flex items-end gap-1 h-12 w-12 justify-center">
                                            <div className="w-2 bg-blue-500/80 h-6 rounded-t-sm group-hover:h-8 transition-all"></div>
                                            <div className="w-2 bg-blue-500 h-10 rounded-t-sm group-hover:h-12 transition-all"></div>
                                            <div className="w-2 bg-blue-500/80 h-8 rounded-t-sm group-hover:h-6 transition-all"></div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Bar Chart</span>
                                    </button>
                                    <button onClick={() => handleAddChart("line")} className="aspect-square bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-200 transition-all gap-3 group">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-500 group-hover:scale-110 transition-transform">
                                            <path d="M3 18 L9 12 L14 16 L21 8" />
                                        </svg>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Line Chart</span>
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
                </aside>
            )}
        </div>
    );
};
