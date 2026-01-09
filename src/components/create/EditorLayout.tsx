import { Settings, Grid3x3, Coffee, Heart, RotateCcw, X, SlidersHorizontal, Camera, Download } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { VerticalAd } from "../ads/VerticalAd";
import { CanvasWorkspace } from "./CanvasWorkspace";
import { PropertiesPanel } from "./PropertiesPanel";
import { Timeline } from "./Timeline";
import { Engine } from "../../engine/Core";
import { Exporter } from "../../engine/Export";
import { HardwareDetector, type HardwareInfo } from "../../utils/HardwareDetector";
import { BrowserDetector } from "../../utils/BrowserDetector";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";

// Use a simple local context or prop drilling for this "one-page app"
// to keep it self-contained for now.

export const EditorLayout = () => {
    const rootRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [engine, setEngine] = useState<Engine | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [canvasAspectRatio, setCanvasAspectRatio] = useState(16 / 9);
    const [exportMode, setExportMode] = useState<'realtime' | 'offline'>('offline');
    const [exportProgress, setExportProgress] = useState(0);

    // FIX: Remove injected 'height: auto !important' style to restore layout.
    useLayoutEffect(() => {
        const removeInjectedHeight = () => {
            if (rootRef.current && rootRef.current.style.height === 'auto') {
                rootRef.current.style.removeProperty('height');
            }
        };

        removeInjectedHeight();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    removeInjectedHeight();
                }
            });
        });

        if (rootRef.current) {
            observer.observe(rootRef.current, { attributes: true, attributeFilter: ["style"] });
        }

        return () => observer.disconnect();
    }, []);

    // Initialize Engine
    useEffect(() => {
        if (!canvasRef.current) return;

        const newEngine = new Engine(canvasRef.current);

        // Hooks
        newEngine.onTimeUpdate = (t) => setCurrentTime(t);
        newEngine.onPlayStateChange = (p) => setIsPlaying(p);
        newEngine.onSelectionChange = (id) => setSelectedId(id);
        newEngine.onResize = (w, h) => setCanvasAspectRatio(w / h);
        newEngine.onDurationChange = (d) => {
            // Force re-render of Timeline/UI
            setCurrentTime(t => t); // fast way to trigger update? or maybe add a state?
        };

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



    const handleExportImage = () => {
        if (!engine) return;
        Exporter.exportImage(engine, "png");
    };

    // State for Export Dialog
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [exportConfig, setExportConfig] = useState<{
        filename: string;
        format: "webm" | "mp4" | "mov";
        duration: number; // 0 for full
        useFullDuration: boolean;
        fps: number;
    }>({
        filename: "my-animation",
        format: "webm",
        duration: 5,
        useFullDuration: true,
        fps: 30
    });

    const [exportTab, setExportTab] = useState<'offline' | 'realtime'>('offline');
    const [hardwareInfo, setHardwareInfo] = useState<HardwareInfo | null>(null);
    const [exportLogs, setExportLogs] = useState<string[]>([]);

    useEffect(() => {
        if (showExportDialog && !hardwareInfo) {
            const info = HardwareDetector.getHardwareInfo();
            setHardwareInfo(info);
            console.log("Hardware Detected:", info);
        }
    }, [showExportDialog]);

    const isPerformanceWarning = hardwareInfo?.tier === 'low' && (exportConfig.fps > 30 || (engine?.canvas?.width ?? 0) > 1920);
    const isBrowserWarning = showExportDialog && !BrowserDetector.isChromium();


    const abortController = useRef<AbortController | null>(null);

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

    const handleExport = async () => {
        if (!engine) return;

        setIsExporting(true);
        setExportProgress(0);

        try {
            const duration = exportConfig.useFullDuration ? engine.totalDuration : (exportConfig.duration * 1000);

            abortController.current = new AbortController();

            const engineType = (exportConfig.format === 'mp4' || exportConfig.format === 'mov') ? 'mediabunny' : 'legacy';

            const blob = await engine.exportVideo(
                duration,
                exportConfig.fps || 30,
                exportMode,
                (p) => setExportProgress(p),
                abortController.current.signal,
                engineType,
                exportConfig.format,
                (msg) => setExportLogs(prev => [...prev, msg].slice(-50))
            );

            // Download
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${exportConfig.filename}.${exportConfig.format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setShowExportDialog(false);

        } catch (e: any) {
            if (e.message === "Export cancelled") {
                console.log("Export cancelled by user");
            } else {
                console.error("Export failed", e);
                alert("Export failed. Check console for details.");
            }
        } finally {
            setIsExporting(false);
            setExportProgress(0);
            abortController.current = null;
        }
    };

    const handleCancelExport = () => {
        if (abortController.current) {
            abortController.current.abort();
        }
    };

    return (
        <div ref={rootRef} className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-black relative">

            {/* Landscape Lock Overlay Removed */}

            {/* Header */}
            <header className="h-14 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between px-4 bg-white dark:bg-neutral-900 shrink-0 z-[60] relative">
                <a href={import.meta.env.BASE_URL} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">K</div>
                    <span className="font-bold text-lg hidden sm:block text-slate-900 dark:text-white">Kinetix Create</span>
                </a>

                <div className="flex items-center gap-2">
                    {/* Donation Buttons */}
                    <a
                        href="https://ko-fi.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden md:flex items-center gap-2 px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-900/20 dark:text-amber-500 dark:hover:bg-amber-900/40 rounded-lg text-xs font-bold transition-colors mr-2"
                    >
                        <Coffee size={14} className="text-amber-700 dark:text-amber-500" />
                        <span>Buy me a coffee</span>
                    </a>
                    <a
                        href="https://patreon.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden md:flex items-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-900 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg text-xs font-bold transition-colors mr-4"
                    >
                        <Heart size={14} className="text-red-600 fill-red-600 dark:text-red-500 dark:fill-red-500" />
                        <span>Patreon</span>
                    </a>

                    {/* Guides Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowGuidesMenu(!showGuidesMenu)}
                            className={`p-2 rounded-lg transition-colors mr-1 ${currentGuide !== 'none' ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800"}`}
                            title="Canvas Guides"
                        >
                            <Grid3x3 size={20} />
                        </button>

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
                                            onClick={() => handleGuideChange(opt.id as any)}
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
                        onClick={() => {
                            if (document.documentElement.classList.contains("dark")) {
                                document.documentElement.classList.remove("dark");
                                localStorage.setItem("theme", "light");
                            } else {
                                document.documentElement.classList.add("dark");
                                localStorage.setItem("theme", "dark");
                            }
                        }}
                        className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-colors mr-1"
                        title="Toggle Dark Mode"
                    >
                        {/* Simple Sun/Moon Icon Logic (Client-side only) */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hidden dark:block">
                            <circle cx="12" cy="12" r="5" />
                            <path d="M12 1v2" />
                            <path d="M12 21v2" />
                            <path d="M4.22 4.22l1.42 1.42" />
                            <path d="M18.36 18.36l1.42 1.42" />
                            <path d="M1 12h2" />
                            <path d="M21 12h2" />
                            <path d="M4.22 19.78l1.42-1.42" />
                            <path d="M18.36 5.64l1.42-1.42" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="block dark:hidden">
                            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                        </svg>
                    </button>

                    <button
                        onClick={() => {
                            // Deselect to show global settings
                            engine?.selectObject(null);
                            setRightSidebarOpen(true);
                        }}
                        className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-colors mr-2"
                        title="Scene & Export Settings"
                    >
                        <Settings size={20} />
                    </button>

                    <button
                        onClick={handleExportImage}
                        className="px-3 py-2 bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 rounded-lg font-medium text-sm hover:bg-slate-200 transition-colors flex items-center gap-2"
                        title="Snapshot"
                    >
                        <Camera size={18} />
                        <span className="hidden lg:inline">Snapshot</span>
                    </button>
                    <button
                        onClick={() => setShowExportDialog(true)}
                        disabled={isExporting}
                        className="px-3 lg:px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        title="Export Video"
                    >
                        {isExporting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span className="hidden sm:inline">Exporting...</span>
                            </>
                        ) : (
                            <>
                                <Download size={18} className="lg:hidden" />
                                <span className="hidden lg:inline">Export Video</span>
                                <span className="hidden sm:inline lg:hidden">Export</span>
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden relative min-h-0">
                {/* Left Sidebar (Assets) */}
                <Sidebar engine={engine} />

                {/* Center Canvas */}
                <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-slate-100 dark:bg-black relative">
                    <CanvasWorkspace ref={canvasRef} aspectRatio={canvasAspectRatio} />

                    {/* Timeline */}
                    <div className="shrink-0 p-2 lg:p-4 z-10">
                        <div className="h-auto lg:h-32">
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

                {/* Mobile Floating Inspector Toggle */}
                <button
                    onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                    className={`
                        lg:hidden fixed bottom-8 transform left-1/2 -translate-x-1/2 z-40 
                        flex items-center gap-2 px-6 py-3 rounded-full shadow-2xl 
                        transition-all duration-300 font-bold text-sm
                        ${rightSidebarOpen
                            ? "bg-blue-600 text-white shadow-blue-500/50 scale-105 ring-2 ring-white/20"
                            : "bg-white dark:bg-neutral-800 text-slate-900 dark:text-white border border-slate-200 dark:border-neutral-700 shadow-slate-200/50 dark:shadow-black/50 hover:bg-slate-50"
                        }
                    `}
                >
                    {rightSidebarOpen ? (
                        <>
                            <X size={18} />
                            <span>Close</span>
                        </>
                    ) : (
                        <>
                            <SlidersHorizontal size={18} className="text-blue-600 dark:text-blue-400" />
                            <span>Inspector</span>
                        </>
                    )}
                </button>

                {/* Mobile Backdrop */}
                {rightSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-20 lg:hidden animate-in fade-in duration-200"
                        onClick={() => setRightSidebarOpen(false)}
                    />
                )}

                {/* Right Sidebar */}
                <div className={`
                    w-80 border-l border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0 flex flex-col overflow-hidden min-h-0
                    fixed right-0 top-14 bottom-0 z-30 shadow-2xl lg:relative lg:top-0 lg:shadow-none lg:z-auto lg:h-auto
                    transition-transform duration-300 ease-in-out
                    ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:hidden'}
                `}>
                    <PropertiesPanel
                        engine={engine}
                        selectedId={selectedId}
                    />
                </div>

                {/* Export Dialog / Native Window Design */}
                {(showExportDialog || isExporting) && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-8 animate-in fade-in duration-200 pointer-events-none">

                        <div className="pointer-events-auto bg-white dark:bg-neutral-900 rounded-xl shadow-2xl shadow-black/20 border border-slate-200 dark:border-neutral-800 overflow-hidden w-full max-w-6xl flex flex-col lg:flex-row h-auto max-h-[85vh] lg:h-[650px] animate-in zoom-in-95 duration-300">

                            {/* Left Ad Column */}
                            <div className="w-72 bg-slate-50 dark:bg-neutral-950 border-r border-slate-200 dark:border-neutral-800 p-6 hidden lg:flex flex-col items-center justify-center">
                                <span className="text-[10px] uppercase font-bold text-slate-400 mb-4">Advertisement</span>
                                <VerticalAd />
                            </div>

                            {/* Center Content Column */}
                            <div className="flex-1 flex flex-col relative bg-white dark:bg-neutral-900 overflow-y-auto">
                                {isExporting ? (
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                        <div className="w-24 h-24 mb-6 relative">
                                            <div className="absolute inset-0 border-4 border-slate-100 dark:border-neutral-800 rounded-full"></div>
                                            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Exporting Video...</h3>
                                        <p className="text-slate-500 dark:text-neutral-400 mb-8 max-w-xs mx-auto">Your animation is being rendered frame by frame. Please do not close this tab.</p>

                                        <div className="flex justify-between w-full max-w-md mb-2">
                                            <span className="text-xs font-bold text-slate-400 uppercase">Rendering</span>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">{Math.round(exportProgress)}%</span>
                                        </div>
                                        <div className="w-full max-w-md bg-slate-100 dark:bg-neutral-800 rounded-full h-3 overflow-hidden mb-8">
                                            <div
                                                className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-out"
                                                style={{ width: `${exportProgress}%` }}
                                            />
                                        </div>

                                        <button
                                            onClick={handleCancelExport}
                                            className="px-6 py-2 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 font-bold hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
                                        >
                                            Cancel
                                        </button>

                                        {/* Export Logs Terminal */}
                                        <div className="w-full max-w-md mt-6 bg-slate-900 rounded-lg p-3 h-32 overflow-y-auto text-left border border-slate-800 font-mono text-[10px] text-slate-400">
                                            {exportLogs.length === 0 ? (
                                                <div className="text-slate-600 italic">Waiting for logs...</div>
                                            ) : (
                                                exportLogs.map((log, i) => (
                                                    <div key={i} className="whitespace-nowrap">{log}</div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Dialog Header */}
                                        <div className="p-4 lg:p-6 border-b border-slate-200 dark:border-neutral-800 flex justify-between items-center">
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Export Video</h3>
                                                <p className="text-sm text-slate-500 dark:text-neutral-400">Configure your export settings</p>
                                            </div>
                                            <button onClick={() => setShowExportDialog(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 rounded-full hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors">
                                                <span className="sr-only">Close</span>
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>

                                        {/* Dialog Body */}
                                        <div className="flex border-b border-slate-200 dark:border-neutral-800">
                                            <button
                                                onClick={() => {
                                                    setExportTab('offline');
                                                    setExportMode('offline');
                                                    setExportConfig({ ...exportConfig, format: 'webm' });
                                                }}
                                                className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${exportMode === 'offline' ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-neutral-300"}`}
                                            >
                                                Offline Render (Best Quality)
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setExportTab('realtime');
                                                    setExportMode('realtime');
                                                    setExportConfig({ ...exportConfig, format: 'webm' });
                                                }}
                                                className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${exportMode === 'realtime' ? "border-purple-500 text-purple-600 dark:text-purple-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-neutral-300"}`}
                                            >
                                                Realtime Record (Fast)
                                            </button>
                                        </div>

                                        <div className="p-3 lg:p-8 space-y-6 lg:space-y-8 flex-1 overflow-y-auto min-h-0">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Filename</label>
                                                        <div className="flex rounded-xl border border-slate-200 dark:border-neutral-700 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all bg-white dark:bg-neutral-800">
                                                            <input
                                                                type="text"
                                                                className="flex-1 bg-transparent border-none px-3 py-2 lg:px-4 lg:py-3 text-sm lg:text-base text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
                                                                value={exportConfig.filename}
                                                                onChange={(e) => setExportConfig({ ...exportConfig, filename: e.target.value })}
                                                                placeholder="my-video"
                                                            />
                                                            <div className="px-3 py-2 lg:px-4 lg:py-3 text-slate-400 font-mono text-xs lg:text-sm border-l border-slate-100 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900/50 flex items-center">
                                                                .{exportConfig.format}
                                                            </div>
                                                        </div>
                                                    </div>


                                                    <div>
                                                        <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Format</label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <button
                                                                onClick={() => setExportConfig({ ...exportConfig, format: "webm" })}
                                                                className={`p-2 rounded-xl border text-center transition-all ${exportConfig.format === "webm" ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500 dark:ring-blue-500/50 text-blue-700 dark:text-blue-400" : "bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 hover:border-blue-400 text-slate-900 dark:text-white"}`}
                                                            >
                                                                <div className="font-bold text-sm">WebM</div>
                                                            </button>
                                                            <button
                                                                onClick={() => setExportConfig({ ...exportConfig, format: "mp4" })}
                                                                className={`p-2 rounded-xl border text-center transition-all ${exportConfig.format === "mp4" ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500 dark:ring-blue-500/50 text-blue-700 dark:text-blue-400" : "bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 hover:border-blue-400 text-slate-900 dark:text-white"}`}
                                                            >
                                                                <div className="font-bold text-sm">MP4</div>
                                                            </button>
                                                            <button
                                                                onClick={() => setExportConfig({ ...exportConfig, format: "mov" })}
                                                                className={`p-2 rounded-xl border text-center transition-all ${exportConfig.format === "mov" ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500 dark:ring-blue-500/50 text-blue-700 dark:text-blue-400" : "bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 hover:border-blue-400 text-slate-900 dark:text-white"}`}
                                                            >
                                                                <div className="font-bold text-sm">MOV</div>
                                                            </button>
                                                        </div>
                                                        <div className="mt-2 text-xs text-slate-400 dark:text-neutral-500">
                                                            {exportConfig.format === 'webm' && "Best for Web. Fastest export."}
                                                            {exportConfig.format === 'mp4' && "Universal format. Works everywhere."}
                                                            {exportConfig.format === 'mov' && "Best for video editing software."}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Duration</label>
                                                        <div className="flex flex-col gap-2 lg:gap-3">
                                                            <button
                                                                onClick={() => setExportConfig({ ...exportConfig, useFullDuration: true })}
                                                                className={`p-3 lg:p-4 rounded-xl border text-left transition-all group ${exportConfig.useFullDuration ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500 dark:ring-blue-500/50" : "bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 hover:border-blue-400"}`}
                                                            >
                                                                <div className="flex justify-between items-center">
                                                                    <div>
                                                                        <div className={`font-bold mb-0.5 lg:mb-1 ${exportConfig.useFullDuration ? "text-blue-700 dark:text-blue-400" : "text-slate-900 dark:text-white"}`}>Full Timeline</div>
                                                                        <div className="text-xs text-slate-500 dark:text-neutral-400 hidden lg:block">Export entire project.</div>
                                                                    </div>
                                                                    {exportConfig.useFullDuration && <div className="w-4 h-4 rounded-full bg-blue-500 border-border-blue-500 text-white flex items-center justify-center scale-90">✓</div>}
                                                                </div>
                                                            </button>

                                                            <button
                                                                onClick={() => setExportConfig({ ...exportConfig, useFullDuration: false })}
                                                                className={`p-3 lg:p-4 rounded-xl border text-left transition-all group ${!exportConfig.useFullDuration ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500 dark:ring-blue-500/50" : "bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 hover:border-blue-400"}`}
                                                            >
                                                                <div className="flex justify-between items-center">
                                                                    <div>
                                                                        <div className={`font-bold mb-0.5 lg:mb-1 ${!exportConfig.useFullDuration ? "text-blue-700 dark:text-blue-400" : "text-slate-900 dark:text-white"}`}>Custom Segment</div>
                                                                        <div className="text-xs text-slate-500 dark:text-neutral-400 hidden lg:block">Specify seconds.</div>
                                                                    </div>
                                                                    {!exportConfig.useFullDuration && (
                                                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                                            <input
                                                                                type="number"
                                                                                min={1}
                                                                                max={60}
                                                                                value={exportConfig.duration}
                                                                                onChange={(e) => setExportConfig({ ...exportConfig, duration: Number(e.target.value) })}
                                                                                className="w-16 bg-white dark:bg-neutral-900 border border-blue-200 dark:border-blue-500/30 text-blue-900 dark:text-blue-100 rounded-lg px-2 py-1 text-sm text-center font-bold outline-none ring-2 ring-blue-500/20"
                                                                            />
                                                                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">s</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {isBrowserWarning && (
                                                <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-700/50 mb-4">
                                                    <div className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5">⚠️</div>
                                                    <div>
                                                        <div className="font-bold text-orange-900 dark:text-orange-100 text-sm">Browser Recommendation</div>
                                                        <div className="text-xs text-orange-700 dark:text-orange-300 mt-1 leading-relaxed">
                                                            You are using <b>{BrowserDetector.getBrowserName()}</b>. Video export is experimental on this browser.
                                                            <br />
                                                            For 20x faster exports and better stability, please use <b>Google Chrome</b> or <b>Microsoft Edge</b>.
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {exportMode === 'offline' && (
                                                <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700/50">
                                                    <div className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5">ℹ️</div>
                                                    <div>
                                                        <div className="font-bold text-yellow-900 dark:text-yellow-100 text-sm">Offline Render Mode</div>
                                                        <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                                            This mode forces a perfect 60 FPS by rendering frame-by-frame. It may take longer than the video duration, but guarantees no lag or stutter.
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {exportMode === 'realtime' && (
                                                <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700/50">
                                                    <div className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">⚡</div>
                                                    <div>
                                                        <div className="font-bold text-purple-900 dark:text-purple-100 text-sm">Realtime Record Mode</div>
                                                        <div className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                                                            This mode captures the screen as it plays. It's faster (1x speed) but quality depends on playback smoothness.
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {isPerformanceWarning && (
                                                <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-700/50">
                                                    <div className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5">
                                                        <AlertTriangle size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-orange-900 dark:text-orange-100 text-sm">Performance Warning</div>
                                                        <div className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                                                            Your device seems to have limited hardware acceleration. Exporting at 60 FPS or High Resolution might cause freezing or crashes. Try 30 FPS if issues occur.
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-slate-500 block">Frame Rate (FPS)</label>
                                                <div className="flex gap-2">
                                                    {[30, 60].map(fps => (
                                                        <button
                                                            key={fps}
                                                            onClick={() => setExportConfig({ ...exportConfig, fps })}
                                                            className={`
                                                                flex-1 py-2 rounded-xl text-sm font-bold border transition-all
                                                                ${exportConfig.fps === fps
                                                                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400 ring-1 ring-blue-500"
                                                                    : "bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 hover:border-blue-400 text-slate-700 dark:text-neutral-300"
                                                                }
                                                                ${fps === 60 && hardwareInfo?.tier === 'low' ? "opacity-90 ring-2 ring-orange-500/20 border-orange-200" : ""}
                                                            `}
                                                        >
                                                            {fps} FPS
                                                            {fps === 60 && <span className="ml-1 text-[10px] text-slate-400 font-normal opacity-70">(High Quality)</span>}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>


                                        </div>

                                        {/* Dialog Footer */}
                                        <div className="p-4 lg:p-6 border-t border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800/50 flex justify-between items-center">
                                            <div className="text-xs text-slate-500 max-w-xs hidden sm:block">
                                                By exporting, you agree to our <a href="#" className="underline hover:text-slate-800 dark:hover:text-neutral-200">Terms of Service</a>.
                                            </div>
                                            <div className="flex gap-2 lg:gap-3 w-full sm:w-auto justify-end">
                                                <button
                                                    onClick={() => setShowExportDialog(false)}
                                                    className="px-4 py-2 lg:px-6 lg:py-3 text-slate-600 dark:text-neutral-400 font-bold text-xs lg:text-sm hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleExport}
                                                    className="px-6 py-2 lg:px-8 lg:py-3 bg-blue-600 text-white rounded-xl font-bold text-xs lg:text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-95 flex items-center gap-2"
                                                >
                                                    <span>Export</span>
                                                    <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>


                            {/* Right Ad Column */}
                            <div className="w-72 bg-slate-50 dark:bg-neutral-950 border-l border-slate-200 dark:border-neutral-800 p-6 hidden lg:flex flex-col items-center justify-center">
                                <span className="text-[10px] uppercase font-bold text-slate-400 mb-4">Advertisement</span>
                                <VerticalAd />
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
