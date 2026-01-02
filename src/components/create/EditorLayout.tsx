import { Settings, Grid3x3 } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { CanvasWorkspace } from "./CanvasWorkspace";
import { PropertiesPanel } from "./PropertiesPanel";
import { Timeline } from "./Timeline";
import { Engine } from "../../engine/Core";
import { Exporter } from "../../engine/Export";
import React, { useEffect, useRef, useState } from "react";

// Use a simple local context or prop drilling for this "one-page app"
// to keep it self-contained for now.

export const EditorLayout = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [engine, setEngine] = useState<Engine | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // Initialize Engine
    useEffect(() => {
        if (!canvasRef.current) return;
        
        const newEngine = new Engine(canvasRef.current);
        
        // Hooks
        newEngine.onTimeUpdate = (t) => setCurrentTime(t);
        newEngine.onPlayStateChange = (p) => setIsPlaying(p);
        newEngine.onSelectionChange = (id) => setSelectedId(id);
        
        setEngine(newEngine);

        return () => {
            newEngine.dispose();
        };
    }, []);

    const handlePlayPause = () => {
        if (!engine) return;
        if (isPlaying) engine.pause();
        else engine.play();
    };

    const handleExportVideo = async () => {
        if (!engine) return;
        setIsExporting(true);
        setShowExportDialog(false); // Close dialog
        
        await Exporter.exportVideo(engine, {
            filename: exportConfig.filename || "kinetix-video",
            format: exportConfig.format,
            duration: exportConfig.duration
        }, (p) => {
            console.log(`Export progress: ${p}%`);
        });
        setIsExporting(false);
    };

    const handleExportImage = () => {
        if (!engine) return;
        Exporter.exportImage(engine, "png");
    };

    // State for Export Dialog
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [exportConfig, setExportConfig] = useState<{
        filename: string;
        format: "webm" | "mp4";
        duration: number; // 0 for full
        useFullDuration: boolean;
    }>({
        filename: "my-animation",
        format: "webm",
        duration: 5,
        useFullDuration: true
    });

    // State for Guides
    const [showGuidesMenu, setShowGuidesMenu] = useState(false);
    const [currentGuide, setCurrentGuide] = useState<"none" | "center" | "thirds" | "golden">("none");

    const handleGuideChange = (type: "none" | "center" | "thirds" | "golden") => {
        if (!engine) return;
        engine.scene.guideType = type;
        setCurrentGuide(type);
        engine.render();
        setShowGuidesMenu(false);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-white dark:bg-slate-900 shrink-0 z-20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">K</div>
                    <span className="font-bold text-lg hidden sm:block text-slate-900 dark:text-white">Kinetix Create</span>
                </div>
                
                <div className="flex items-center gap-2">
                     
                     {/* Guides Menu */}
                     <div className="relative">
                        <button
                            onClick={() => setShowGuidesMenu(!showGuidesMenu)}
                            className={`p-2 rounded-lg transition-colors mr-1 ${currentGuide !== 'none' ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                            title="Canvas Guides"
                        >
                            <Grid3x3 size={20} />
                        </button>
                        
                        {showGuidesMenu && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-2 space-y-1">
                                    {[
                                        { id: "none", label: "No Guides" },
                                        { id: "center", label: "Center" },
                                        { id: "thirds", label: "Rule of Thirds" },
                                        { id: "golden", label: "Golden Ratio" }
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleGuideChange(opt.id as any)}
                                            className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors ${currentGuide === opt.id ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                     </div>

                     <button
                        onClick={() => {
                            // Deselect to show global settings
                            engine?.selectObject(null);
                            setRightSidebarOpen(true);
                        }}
                        className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors mr-2"
                        title="Scene & Export Settings"
                     >
                        <Settings size={20} />
                     </button>

                     <button 
                        onClick={handleExportImage}
                        className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-sm hover:bg-slate-200 transition-colors"
                     >
                        Snapshot
                     </button>
                     <button 
                        onClick={() => setShowExportDialog(true)}
                        disabled={isExporting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                     >
                        {isExporting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Exporting...
                            </>
                        ) : (
                            "Export Video"
                        )}
                     </button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Left Sidebar (Assets) */}
                <Sidebar engine={engine} />

                {/* Center Canvas */}
                <div className="flex-1 flex flex-col min-w-0 bg-slate-100 dark:bg-slate-950 relative">
                    <CanvasWorkspace ref={canvasRef} />
                    
                    {/* Timeline */}
                    <div className="shrink-0 p-4 z-10">
                        <div className="h-32">
                             <Timeline 
                                currentTime={currentTime} 
                                totalDuration={engine?.totalDuration || 5000}
                                isPlaying={isPlaying}
                                onPlayPause={handlePlayPause}
                                onSeek={(t) => engine?.seek(t)}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Sidebar (Properties) */}
                {rightSidebarOpen && (
                    <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 overflow-y-auto">
                        <PropertiesPanel 
                            engine={engine} 
                            selectedId={selectedId}
                            exportConfig={exportConfig}
                            setExportConfig={setExportConfig}
                        />
                    </div>
                )}

                {/* Export Dialog Overlay */}
                {showExportDialog && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 pointer-events-none">
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 dark:border-slate-800 overflow-hidden w-full max-w-md pointer-events-auto">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                                <h3 className="font-bold text-slate-900 dark:text-white">Export Video</h3>
                                <button onClick={() => setShowExportDialog(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                    <span className="sr-only">Close</span>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Filename</label>
                                    <div className="flex">
                                        <input 
                                            type="text" 
                                            className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-l px-3 py-2 text-sm text-slate-900 dark:text-white"
                                            value={exportConfig.filename}
                                            onChange={(e) => setExportConfig({...exportConfig, filename: e.target.value})}
                                            placeholder="my-video"
                                        />
                                        <div className="bg-slate-200 dark:bg-slate-700 px-3 py-2 text-sm text-slate-500 rounded-r flex items-center">
                                            .{exportConfig.format}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Format</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button 
                                            onClick={() => setExportConfig({...exportConfig, format: "webm"})}
                                            className={`py-2 px-3 rounded border text-sm font-medium transition-all ${exportConfig.format === "webm" ? "bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/20" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}
                                        >
                                            WebM (Best for Web)
                                        </button>
                                        <button 
                                            onClick={() => setExportConfig({...exportConfig, format: "mp4"})}
                                            className={`py-2 px-3 rounded border text-sm font-medium transition-all ${exportConfig.format === "mp4" ? "bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/20" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}
                                        >
                                            MP4 (Compatibility)
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Duration</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={exportConfig.useFullDuration} 
                                                onChange={(e) => setExportConfig({...exportConfig, useFullDuration: e.target.checked})}
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-slate-700 dark:text-slate-300">Export Full Timeline</span>
                                        </label>
                                        
                                        {!exportConfig.useFullDuration && (
                                            <div className="flex items-center gap-2 animate-in slide-in-from-top-1">
                                                <input 
                                                    type="number" 
                                                    min={1}
                                                    max={60}
                                                    value={exportConfig.duration}
                                                    onChange={(e) => setExportConfig({...exportConfig, duration: Number(e.target.value)})}
                                                    className="w-20 bg-slate-100 dark:bg-slate-800 border-none rounded px-3 py-2 text-sm"
                                                />
                                                <span className="text-sm text-slate-500">seconds</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                                <button 
                                    onClick={() => setShowExportDialog(false)}
                                    className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium text-sm hover:text-slate-900 dark:hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleExportVideo}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                                >
                                    Export Now
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
