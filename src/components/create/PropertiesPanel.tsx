import React, { useEffect, useState, useRef } from "react";
import { Engine } from "../../engine/Core";
import { TextObject } from "../../engine/objects/TextObject";
import { CodeBlockObject } from "../../engine/objects/CodeBlockObject";
import { ChartObject } from "../../engine/objects/ChartObject";

import {
    Layers,
    Settings,
    Eye,
    EyeOff,
    Lock,
    Unlock,
    ArrowUp,
    ArrowDown,
    Copy,
    Trash2,
    Pencil,
    MonitorPlay,
    Play,
    SlidersHorizontal
} from "lucide-react";

interface ExportConfig {
    filename: string;
    format: "webm" | "mp4";
    duration: number;
    useFullDuration: boolean;
}

interface PropertiesPanelProps {
    engine: Engine | null;
    selectedId: string | null;
    exportConfig?: ExportConfig;
    setExportConfig?: (config: ExportConfig) => void;
}

type Tab = "properties" | "layers" | "animations";

export const PropertiesPanel = ({ engine, selectedId, exportConfig, setExportConfig }: PropertiesPanelProps) => {
    const [activeTab, setActiveTab] = useState<Tab>("properties");
    const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [_, setForceUpdate] = useState(0);

    // Export simulation state
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);

    const handleExport = () => {
        if (isExporting) return;

        setIsExporting(true);
        setExportProgress(0);

        // Simulate export process
        const interval = setInterval(() => {
            setExportProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setIsExporting(false), 500); // Small delay at 100%
                    return 100;
                }
                // Random increment between 2 and 8
                return Math.min(prev + Math.random() * 6 + 2, 100);
            });
        }, 100);
    };

    const editInputRef = useRef<HTMLInputElement>(null);

    // Subscribe to engine changes to rerender panel
    useEffect(() => {
        if (!engine) return;
        const onUpdate = () => setForceUpdate(n => n + 1);
        engine.onObjectChange = onUpdate;

        return () => { engine.onObjectChange = undefined; }
    }, [engine]);

    useEffect(() => {
        if (editingLayerId && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [editingLayerId]);

    if (!engine) return null;

    const obj = selectedId ? engine.scene.get(selectedId) : null;

    const handleChange = (key: string, value: any) => {
        if (!obj) return;
        (obj as any)[key] = value;
        engine.render();
        setForceUpdate(n => n + 1);
    };

    const handleRenameStart = (id: string, currentName: string) => {
        setEditingLayerId(id);
        setEditName(currentName);
    };

    const handleRenameSave = () => {
        if (editingLayerId && engine) {
            const layer = engine.scene.get(editingLayerId);
            if (layer) {
                layer.name = editName;
                setForceUpdate(n => n + 1);
            }
        }
        setEditingLayerId(null);
    };

    const handleDuplicate = (id: string) => {
        const original = engine.scene.get(id);
        if (original && original.clone) {
            const clone = original.clone();
            clone.name = `${original.name} Copy`;
            engine.scene.add(clone);
            engine.render();
            setForceUpdate(n => n + 1);
        }
    };

    const handleDelete = (id: string) => {
        engine.scene.remove(id);
        if (selectedId === id) {
            engine.selectObject(null);
        }
        engine.render();
        setForceUpdate(n => n + 1);
    }

    return (
        <div className="flex flex-col h-full">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-neutral-800">
                <button
                    onClick={() => setActiveTab("properties")}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${activeTab === "properties" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-neutral-800"}`}
                >
                    <Settings size={14} /> Inspector
                </button>
                <button
                    onClick={() => setActiveTab("layers")}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${activeTab === "layers" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-neutral-800"}`}
                >
                    <Layers size={14} /> Layers
                </button>
                <button
                    onClick={() => setActiveTab("animations")}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${activeTab === "animations" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-neutral-800"}`}
                >
                    <MonitorPlay size={14} /> Motion
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4">

                {/* PROPERTIES TAB */}
                {activeTab === "properties" && (
                    <>
                        {!obj ? (
                            <div className="space-y-6">
                                {/* Scene Settings Header */}
                                <div className="text-center p-4">
                                    <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">Scene Settings</div>
                                    <div className="text-xs text-slate-500">Global project configuration</div>
                                </div>

                                {/* Background Color */}
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-slate-500 font-bold block">Background Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            className="w-10 h-10 p-0.5 rounded cursor-pointer bg-transparent border border-slate-200 dark:border-neutral-700"
                                            value={engine.scene.backgroundColor}
                                            onChange={(e) => {
                                                engine.scene.backgroundColor = e.target.value;
                                                engine.render();
                                                setForceUpdate(n => n + 1);
                                            }}
                                        />
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                className="w-full h-10 bg-slate-100 dark:bg-neutral-800 border-none rounded px-3 text-xs text-slate-700 dark:text-neutral-300 font-mono"
                                                value={engine.scene.backgroundColor}
                                                onChange={(e) => {
                                                    engine.scene.backgroundColor = e.target.value;
                                                    engine.render();
                                                    setForceUpdate(n => n + 1);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-200 dark:bg-neutral-800 my-4" />

                                {/* Resolution Settings */}
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-slate-500 font-bold block">Resolution</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => {
                                                engine.resize(854, 480);
                                                setForceUpdate(n => n + 1);
                                            }}
                                            className={`py-2 px-3 rounded text-xs font-medium border transition-all ${engine.scene.height === 480 ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400" : "bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 hover:border-blue-400"}`}
                                        >
                                            480p
                                        </button>
                                        <button
                                            onClick={() => {
                                                engine.resize(1280, 720);
                                                setForceUpdate(n => n + 1);
                                            }}
                                            className={`py-2 px-3 rounded text-xs font-medium border transition-all ${engine.scene.height === 720 ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400" : "bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 hover:border-blue-400"}`}
                                        >
                                            720p
                                            <span className="opacity-50 ml-1 font-normal">(HD)</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                engine.resize(1920, 1080);
                                                setForceUpdate(n => n + 1);
                                            }}
                                            className={`py-2 px-3 rounded text-xs font-medium border transition-all ${engine.scene.height === 1080 ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400" : "bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 hover:border-blue-400"}`}
                                        >
                                            1080p
                                            <span className="opacity-50 ml-1 font-normal">(FHD)</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                engine.resize(3840, 2160);
                                                setForceUpdate(n => n + 1);
                                            }}
                                            className={`py-2 px-3 rounded text-xs font-medium border transition-all ${engine.scene.height === 2160 ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400" : "bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 hover:border-blue-400"}`}
                                        >
                                            4K
                                            <span className="opacity-50 ml-1 font-normal">(UHD)</span>
                                        </button>
                                    </div>
                                    <div className="text-[10px] text-slate-400 text-center mt-2">
                                        Current: {engine.scene.width} x {engine.scene.height}
                                    </div>
                                </div>

                                <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />

                                {/* Export Settings (if available) */}
                                {exportConfig && setExportConfig && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                                            <SlidersHorizontal size={14} />
                                            <span>Export Settings</span>
                                        </div>

                                        <div>
                                            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Filename</label>
                                            <input
                                                type="text"
                                                disabled={isExporting}
                                                className="w-full bg-slate-100 dark:bg-neutral-800 border-none rounded px-2 py-1 text-xs text-slate-700 dark:text-neutral-300 disabled:opacity-50"
                                                value={exportConfig.filename}
                                                onChange={(e) => setExportConfig({ ...exportConfig, filename: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Format</label>
                                                <select
                                                    disabled={isExporting}
                                                    className="w-full bg-slate-100 dark:bg-neutral-800 border-none rounded px-2 py-1 text-xs text-slate-700 dark:text-neutral-300 disabled:opacity-50"
                                                    value={exportConfig.format}
                                                    onChange={(e) => setExportConfig({ ...exportConfig, format: e.target.value as any })}
                                                >
                                                    <option value="webm">WebM</option>
                                                    <option value="mp4">MP4</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Duration</label>
                                                <select
                                                    disabled={isExporting}
                                                    className="w-full bg-slate-100 dark:bg-neutral-800 border-none rounded px-2 py-1 text-xs text-slate-700 dark:text-neutral-300 disabled:opacity-50"
                                                    value={exportConfig.useFullDuration ? "full" : "custom"}
                                                    onChange={(e) => setExportConfig({ ...exportConfig, useFullDuration: e.target.value === "full" })}
                                                >
                                                    <option value="full">Full Timeline</option>
                                                    <option value="custom">Custom</option>
                                                </select>
                                            </div>
                                        </div>

                                        {!exportConfig.useFullDuration && (
                                            <div>
                                                <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Custom Duration (s)</label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={60}
                                                    disabled={isExporting}
                                                    className="w-full bg-slate-100 dark:bg-neutral-800 border-none rounded px-2 py-1 text-xs text-slate-700 dark:text-neutral-300 disabled:opacity-50"
                                                    value={exportConfig.duration}
                                                    onChange={(e) => setExportConfig({ ...exportConfig, duration: Number(e.target.value) })}
                                                />
                                            </div>
                                        )}

                                        <div className="pt-2">
                                            {!isExporting ? (
                                                <button
                                                    onClick={handleExport}
                                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                    Export Video
                                                </button>
                                            ) : (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase animate-pulse">Rendering...</span>
                                                        <span className="text-[10px] text-slate-500 font-mono">{Math.round(exportProgress)}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-600 transition-all duration-300 ease-out"
                                                            style={{ width: `${exportProgress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Selected Object Header */}
                                <div className="p-4 bg-slate-50 dark:bg-neutral-800/50 rounded-xl border border-slate-100 dark:border-neutral-800">
                                    <div className="text-[10px] uppercase text-blue-500 font-bold mb-1 tracking-wider">Selected Layer</div>
                                    <div className="text-xl font-bold text-slate-900 dark:text-white truncate" title={obj.name}>
                                        {obj.name || "Untitled"}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1 font-mono">
                                        {obj.constructor.name.replace('Object', '')}
                                    </div>
                                </div>

                                {/* Common Transforms */}
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">X Position</label>
                                            <input
                                                type="number"
                                                className="w-full bg-slate-100 dark:bg-neutral-800 border-none rounded px-2 py-1 text-xs text-slate-700 dark:text-neutral-300"
                                                value={Math.round(obj.x)}
                                                onChange={(e) => handleChange("x", Number(e.target.value))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Y Position</label>
                                            <input
                                                type="number"
                                                className="w-full bg-slate-100 dark:bg-neutral-800 border-none rounded px-2 py-1 text-xs text-slate-700 dark:text-neutral-300"
                                                value={Math.round(obj.y)}
                                                onChange={(e) => handleChange("y", Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Width</label>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="range"
                                                    min="10"
                                                    max="1920"
                                                    className="flex-1 accent-blue-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700"
                                                    value={Math.round(obj.width)}
                                                    onChange={(e) => handleChange("width", Number(e.target.value))}
                                                />
                                                <input
                                                    type="number"
                                                    className="w-16 bg-slate-100 dark:bg-neutral-800 border-none rounded px-2 py-1 text-xs text-slate-700 dark:text-neutral-300 text-right"
                                                    value={Math.round(obj.width)}
                                                    onChange={(e) => handleChange("width", Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Height</label>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="range"
                                                    min="10"
                                                    max="1080"
                                                    className="flex-1 accent-blue-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700"
                                                    value={Math.round(obj.height)}
                                                    onChange={(e) => handleChange("height", Number(e.target.value))}
                                                />
                                                <input
                                                    type="number"
                                                    className="w-16 bg-slate-100 dark:bg-neutral-800 border-none rounded px-2 py-1 text-xs text-slate-700 dark:text-neutral-300 text-right"
                                                    value={Math.round(obj.height)}
                                                    onChange={(e) => handleChange("height", Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />

                                {/* Type Specific */}
                                {obj instanceof TextObject && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Content</label>
                                            <textarea
                                                className="w-full bg-slate-100 dark:bg-neutral-800 border-none rounded px-2 py-2 text-xs text-slate-700 dark:text-neutral-300 min-h-[60px]"
                                                value={obj.text}
                                                onChange={(e) => handleChange("text", e.target.value)}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Color</label>
                                                <input
                                                    type="color"
                                                    className="w-full h-8 cursor-pointer rounded"
                                                    value={obj.color}
                                                    onChange={(e) => handleChange("color", e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Size</label>
                                                <div className="flex gap-2 items-center">
                                                    <input
                                                        type="range"
                                                        min="10"
                                                        max="400"
                                                        className="flex-1 accent-blue-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700"
                                                        value={obj.fontSize}
                                                        onChange={(e) => handleChange("fontSize", Number(e.target.value))}
                                                    />
                                                    <input
                                                        type="number"
                                                        className="w-16 bg-slate-100 dark:bg-neutral-800 border-none rounded px-2 py-1 text-xs text-slate-700 dark:text-neutral-300 text-right"
                                                        value={obj.fontSize}
                                                        onChange={(e) => handleChange("fontSize", Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Font Family</label>
                                            <select
                                                className="w-full bg-slate-100 dark:bg-neutral-800 border-none rounded px-2 py-2 text-xs text-slate-700 dark:text-neutral-300"
                                                value={obj.fontFamily}
                                                onChange={(e) => handleChange("fontFamily", e.target.value)}
                                            >
                                                <option value="Inter">Inter (Default)</option>
                                                <option value="Arial">Arial</option>
                                                <option value="Helvetica">Helvetica</option>
                                                <option value="Times New Roman">Times New Roman</option>
                                                <option value="Courier New">Courier New</option>
                                                <option value="Georgia">Georgia</option>
                                                <option value="Verdana">Verdana</option>
                                                <option value="Impact">Impact</option>
                                                <option value="Comic Sans MS">Comic Sans MS</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {obj instanceof CodeBlockObject && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Code</label>
                                            <textarea
                                                className="w-full bg-slate-100 dark:bg-neutral-800 border-none rounded px-2 py-2 text-xs text-slate-700 dark:text-neutral-300 font-mono min-h-[100px]"
                                                value={obj.code}
                                                onChange={(e) => handleChange("code", e.target.value)}
                                                spellCheck={false}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Theme</label>
                                                <select
                                                    className="w-full bg-slate-100 dark:bg-neutral-800 border-none rounded px-2 py-2 text-xs text-slate-700 dark:text-neutral-300"
                                                    value={obj.theme}
                                                    onChange={(e) => handleChange("theme", e.target.value)}
                                                >
                                                    <option value="vscode-dark">VS Code Dark</option>
                                                    <option value="light">Light</option>
                                                    <option value="monokai">Monokai</option>
                                                    <option value="github-dark">GitHub Dark</option>
                                                    <option value="dracula">Dracula</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Font Size</label>
                                                <div className="flex gap-2 items-center">
                                                    <input
                                                        type="range"
                                                        min="8"
                                                        max="100"
                                                        className="flex-1 accent-blue-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700"
                                                        value={obj.fontSize}
                                                        onChange={(e) => handleChange("fontSize", Number(e.target.value))}
                                                    />
                                                    <input
                                                        type="number"
                                                        className="w-16 bg-slate-100 dark:bg-neutral-800 border-none rounded px-2 py-1 text-xs text-slate-700 dark:text-neutral-300 text-right"
                                                        value={obj.fontSize}
                                                        onChange={(e) => handleChange("fontSize", Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Padding</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-slate-100 dark:bg-neutral-800 border-none rounded px-2 py-1 text-xs text-slate-700 dark:text-neutral-300"
                                                    value={obj.padding || 0}
                                                    onChange={(e) => handleChange("padding", Number(e.target.value))}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Start Line #</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-slate-100 dark:bg-neutral-800 border-none rounded px-2 py-1 text-xs text-slate-700 dark:text-neutral-300"
                                                    value={obj.startLineNumber || 1}
                                                    onChange={(e) => handleChange("startLineNumber", Number(e.target.value))}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Line Gap</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-slate-100 dark:bg-neutral-800 border-none rounded px-2 py-1 text-xs text-slate-700 dark:text-neutral-300"
                                                    value={obj.lineNumberMargin || 15}
                                                    onChange={(e) => handleChange("lineNumberMargin", Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Highlight Lines (e.g. 1, 3-5)</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-slate-100 dark:bg-neutral-800 border-none rounded px-2 py-1 text-xs text-slate-700 dark:text-neutral-300"
                                                    placeholder="1, 3-5"
                                                    defaultValue={(obj.highlightedLines || []).join(", ")}
                                                    onBlur={(e) => {
                                                        const val = e.target.value;
                                                        const lines = val.split(",").flatMap(part => {
                                                            if (part.includes("-")) {
                                                                const [start, end] = part.split("-").map(n => parseInt(n.trim()));
                                                                if (!isNaN(start) && !isNaN(end)) {
                                                                    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
                                                                }
                                                                return [];
                                                            }
                                                            const num = parseInt(part.trim());
                                                            return isNaN(num) ? [] : [num];
                                                        });
                                                        handleChange("highlightedLines", lines);
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Highlight Color</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        className="w-8 h-8 cursor-pointer rounded bg-transparent border border-slate-200 dark:border-neutral-700 p-0.5"
                                                        value={obj.highlightColor || "#ffffff"}
                                                        onChange={(e) => handleChange("highlightColor", e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="flex-1 bg-slate-100 dark:bg-neutral-800 border-none rounded px-2 py-1 text-xs text-slate-700 dark:text-neutral-300 font-mono"
                                                        value={obj.highlightColor || "rgba(255,255,255,0.1)"}
                                                        onChange={(e) => handleChange("highlightColor", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="syntax-toggle"
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                    checked={obj.syntaxHighlighting}
                                                    onChange={(e) => handleChange("syntaxHighlighting", e.target.checked)}
                                                />
                                                <label htmlFor="syntax-toggle" className="text-xs text-slate-700 dark:text-neutral-300 font-medium select-none cursor-pointer">
                                                    Enable Syntax Highlighting
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="linenumbers-toggle"
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                    checked={obj.showLineNumbers !== false}
                                                    onChange={(e) => handleChange("showLineNumbers", e.target.checked)}
                                                />
                                                <label htmlFor="linenumbers-toggle" className="text-xs text-slate-700 dark:text-neutral-300 font-medium select-none cursor-pointer">
                                                    Show Line Numbers
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <input
                                                type="file"
                                                id="code-import"
                                                className="hidden"
                                                accept=".js,.ts,.jsx,.tsx,.html,.css,.json,.py,.java,.cpp,.c,.h,.md,.txt"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = (ev) => {
                                                            const text = ev.target?.result as string;
                                                            handleChange("code", text);
                                                        };
                                                        reader.readAsText(file);
                                                    }
                                                    // Reset input so same file can be selected again
                                                    e.target.value = '';
                                                }}
                                            />
                                            <button
                                                onClick={() => document.getElementById('code-import')?.click()}
                                                className="w-full py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                                Import Code File
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {obj instanceof ChartObject && (
                                    <div className="space-y-4">
                                        {/* Data Editor */}
                                        <div>
                                            <div className="text-[10px] uppercase text-slate-500 font-bold mb-2">Data & Labels</div>
                                            <div className="space-y-2">
                                                <div>
                                                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Labels (comma separated)</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-slate-100 dark:bg-neutral-800 border-none rounded px-2 py-1 text-xs text-slate-700 dark:text-neutral-300 font-mono"
                                                        value={obj.labels.join(", ")}
                                                        onChange={(e) => {
                                                            const labels = e.target.value.split(",").map(s => s.trim());
                                                            handleChange("labels", labels);
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Values (comma separated)</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-slate-100 dark:bg-neutral-800 border-none rounded px-2 py-1 text-xs text-slate-700 dark:text-neutral-300 font-mono"
                                                        value={obj.data.join(", ")}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            const data = val.split(",").map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
                                                            // Only update if we have valid data, or empty
                                                            if (data.length > 0 || val === "") {
                                                                handleChange("data", data);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />

                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-[10px] uppercase text-slate-500 font-bold">Chart Appearance</label>
                                                <div className="flex items-center gap-2">
                                                    <label className="text-[10px] uppercase text-slate-400 font-bold cursor-pointer select-none" htmlFor="multicolor">Multi-color</label>
                                                    <input
                                                        type="checkbox"
                                                        id="multicolor"
                                                        className="rounded text-blue-600 focus:ring-blue-500"
                                                        checked={obj.useMultiColor}
                                                        onChange={(e) => handleChange("useMultiColor", e.target.checked)}
                                                    />
                                                </div>
                                            </div>
                                            {!obj.useMultiColor ? (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        className="w-10 h-10 p-0.5 rounded cursor-pointer bg-transparent border border-slate-200 dark:border-neutral-700"
                                                        value={obj.color}
                                                        onChange={(e) => handleChange("color", e.target.value)}
                                                    />
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            className="w-full h-10 bg-slate-100 dark:bg-neutral-800 border-none rounded px-3 text-xs text-slate-700 dark:text-neutral-300 font-mono"
                                                            value={obj.color}
                                                            onChange={(e) => handleChange("color", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <div className="grid grid-cols-5 gap-2">
                                                        {obj.colorPalette.map((color: string, i: number) => (
                                                            <div key={i} className="relative group">
                                                                <input
                                                                    type="color"
                                                                    className="w-full h-8 rounded cursor-pointer p-0 border-none"
                                                                    value={color}
                                                                    onChange={(e) => {
                                                                        const newPalette = [...obj.colorPalette];
                                                                        newPalette[i] = e.target.value;
                                                                        handleChange("colorPalette", newPalette);
                                                                    }}
                                                                />
                                                                {obj.colorPalette.length > 1 && (
                                                                    <button
                                                                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                                                                        onClick={() => {
                                                                            const newPalette = obj.colorPalette.filter((_: any, idx: number) => idx !== i);
                                                                            handleChange("colorPalette", newPalette);
                                                                        }}
                                                                    >
                                                                        ×
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                        <button
                                                            className="w-full h-8 rounded border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-colors"
                                                            onClick={() => {
                                                                const newPalette = [...obj.colorPalette, "#888888"];
                                                                handleChange("colorPalette", newPalette);
                                                            }}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Axis Color</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        className="w-8 h-8 p-0.5 rounded cursor-pointer bg-transparent border border-slate-200 dark:border-neutral-700"
                                                        value={obj.axisColor}
                                                        onChange={(e) => handleChange("axisColor", e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="flex-1 bg-slate-100 dark:bg-neutral-800 border-none rounded px-2 py-1 text-xs text-slate-700 dark:text-neutral-300 font-mono"
                                                        value={obj.axisColor}
                                                        onChange={(e) => handleChange("axisColor", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Show Grid</label>
                                                <div className="flex items-center h-8">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded text-blue-600 focus:ring-blue-500 mr-2"
                                                        checked={obj.showGrid}
                                                        onChange={(e) => handleChange("showGrid", e.target.checked)}
                                                    />
                                                    <span className="text-xs text-slate-700 dark:text-neutral-300">Enabled</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="col-span-2">
                                                <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Font Size</label>
                                                <div className="flex gap-2 items-center">
                                                    <input
                                                        type="range"
                                                        min="8"
                                                        max="48"
                                                        className="flex-1 accent-blue-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700"
                                                        value={obj.fontSize}
                                                        onChange={(e) => handleChange("fontSize", Number(e.target.value))}
                                                    />
                                                    <input
                                                        type="number"
                                                        className="w-16 bg-slate-100 dark:bg-neutral-800 border-none rounded px-2 py-1 text-xs text-slate-700 dark:text-neutral-300 text-right"
                                                        value={obj.fontSize}
                                                        onChange={(e) => handleChange("fontSize", Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Font Family</label>
                                                <select
                                                    className="w-full bg-slate-100 dark:bg-neutral-800 border-none rounded px-2 py-2 text-xs text-slate-700 dark:text-neutral-300"
                                                    value={obj.fontFamily}
                                                    onChange={(e) => handleChange("fontFamily", e.target.value)}
                                                >
                                                    <option value="Inter">Inter (Default)</option>
                                                    <option value="Arial">Arial</option>
                                                    <option value="Helvetica">Helvetica</option>
                                                    <option value="Times New Roman">Times New Roman</option>
                                                    <option value="Courier New">Courier New</option>
                                                    <option value="Georgia">Georgia</option>
                                                    <option value="Comic Sans MS">Comic Sans MS</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />

                                {/* Quick Animation Controls */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="text-[10px] uppercase text-slate-500 font-bold">Animation</div>
                                        {obj.animation.type !== "none" && (
                                            <div className="text-[10px] text-slate-400 font-mono">{obj.animation.duration}ms</div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(() => {
                                            const commonAnims = [
                                                { id: "none", label: "None" },
                                                { id: "fadeIn", label: "Fade In" },
                                                { id: "slideUp", label: "Slide Up" },
                                                { id: "scaleIn", label: "Scale In" },
                                            ];

                                            let displayAnims = commonAnims;

                                            if (obj instanceof ChartObject) {
                                                displayAnims = [
                                                    { id: "none", label: "None" },
                                                    { id: "grow", label: "Grow" },
                                                    { id: "fadeIn", label: "Fade In" },
                                                ];
                                            } else if (obj instanceof TextObject) {
                                                displayAnims = [
                                                    ...commonAnims,
                                                    { id: "typewriter", label: "Typewriter" },
                                                ];
                                            } else if (obj instanceof CodeBlockObject) {
                                                displayAnims = [
                                                    { id: "none", label: "None" },
                                                    { id: "typewriter", label: "Typewriter" },
                                                    { id: "fadeIn", label: "Fade In" },
                                                ];
                                            }

                                            return displayAnims.map((anim) => (
                                                <button
                                                    key={anim.id}
                                                    onClick={() => {
                                                        if (obj.animation) {
                                                            const isSame = obj.animation.type === anim.id;
                                                            if (!isSame) {
                                                                obj.animation.type = anim.id as any;
                                                                engine.currentTime = 0;
                                                                engine.play();
                                                                setForceUpdate(n => n + 1);
                                                            }
                                                        }
                                                    }}
                                                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${obj.animation?.type === anim.id ? "bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400" : "bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 hover:border-blue-400"}`}
                                                >
                                                    {anim.label}
                                                </button>
                                            ));
                                        })()}
                                    </div>

                                    {obj.animation.type !== "none" && (
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-slate-400 font-bold block">Duration</label>
                                            <input
                                                type="range"
                                                min={100}
                                                max={3000}
                                                step={100}
                                                value={obj.animation.duration}
                                                onChange={(e) => {
                                                    obj.animation.duration = Number(e.target.value);
                                                    setForceUpdate(n => n + 1);
                                                }}
                                                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700 accent-blue-600"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
                                    <button
                                        onClick={() => {
                                            engine.scene.remove(obj.id);
                                            engine.selectObject(null);
                                            engine.render();
                                        }}
                                        className="w-full py-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                    >
                                        Delete Object
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ANIMATIONS TAB */}
                {activeTab === "animations" && (
                    <>
                        {!obj ? (
                            <div className="text-center text-slate-400 text-sm py-8">
                                Select an object to add animations
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Selected Object Header */}
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="text-[10px] uppercase text-blue-500 font-bold mb-1 tracking-wider">Target Layer</div>
                                    <div className="text-xl font-bold text-slate-900 dark:text-white truncate" title={obj.name}>
                                        {obj.name || "Untitled"}
                                    </div>
                                </div>

                                <div className="text-[10px] uppercase text-slate-500 font-bold mt-4 mb-2">In Animation</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {(() => {
                                        const commonAnims = [
                                            { id: "none", label: "None", icon: <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-700" /> },
                                            { id: "fadeIn", label: "Fade In", className: "group-hover:animate-pulse" },
                                            { id: "slideUp", label: "Slide Up", className: "group-hover:animate-bounce" },
                                            { id: "scaleIn", label: "Scale In", className: "group-hover:scale-75 transition-transform" },
                                        ];

                                        let displayAnims = commonAnims;

                                        if (obj instanceof ChartObject) {
                                            displayAnims = [
                                                { id: "none", label: "None", icon: <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-700" /> },
                                                { id: "grow", label: "Grow", className: "group-hover:scale-y-110 transition-transform origin-bottom" },
                                                { id: "fadeIn", label: "Fade In", className: "group-hover:animate-pulse" },
                                            ];
                                        } else if (obj instanceof TextObject) {
                                            displayAnims = [
                                                ...commonAnims,
                                                { id: "typewriter", label: "Typewriter", className: "" },
                                            ];
                                        } else if (obj instanceof CodeBlockObject) {
                                            displayAnims = [
                                                { id: "none", label: "None", icon: <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-700" /> },
                                                { id: "typewriter", label: "Typewriter", className: "" },
                                                { id: "fadeIn", label: "Fade In", className: "group-hover:animate-pulse" },
                                            ];
                                        }

                                        return displayAnims.map((anim) => (
                                            <button
                                                key={anim.id}
                                                onClick={() => {
                                                    if (obj.animation) {
                                                        obj.animation.type = anim.id as any;
                                                        engine.currentTime = 0; // Reset to preview
                                                        engine.play();
                                                        setForceUpdate(n => n + 1);
                                                    }
                                                }}
                                                className={`p-3 rounded-xl border text-left group transition-all relative overflow-hidden ${obj.animation?.type === anim.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300"}`}
                                            >
                                                <div className="mb-2 h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                    {anim.id === "none" ? <div className="w-3 h-3 bg-current rounded-full" /> : <Play size={12} className={anim.className} />}
                                                </div>
                                                <div className="text-xs font-bold">{anim.label}</div>
                                            </button>
                                        ));
                                    })()}
                                </div>

                                {obj.animation?.type !== "none" && (
                                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <label className="text-[10px] uppercase text-slate-500 font-bold">Duration</label>
                                                <span className="text-[10px] font-mono text-slate-500">{obj.animation.duration}ms</span>
                                            </div>
                                            <input
                                                type="range"
                                                min={100}
                                                max={3000}
                                                step={100}
                                                value={obj.animation.duration}
                                                onChange={(e) => {
                                                    obj.animation.duration = Number(e.target.value);
                                                    setForceUpdate(n => n + 1);
                                                }}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* LAYERS TAB */}
                {activeTab === "layers" && (
                    <div className="flex flex-col h-full">
                        {/* Layer List */}
                        <div className="flex-1 overflow-y-auto space-y-1 p-2">
                            {[...engine.scene.objects].reverse().map((o, i) => (
                                <div
                                    key={o.id}
                                    className={`flex items-center gap-2 p-2 rounded-lg group transition-colors ${selectedId === o.id ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/50" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"}`}
                                    onClick={() => engine.selectObject(o.id)}
                                >
                                    {/* Visibility Toggle */}
                                    <button
                                        className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${!o.visible ? "text-slate-400" : "text-current"}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            o.visible = !o.visible;
                                            engine.render();
                                            setForceUpdate(n => n + 1);
                                        }}
                                        title={o.visible ? "Hide" : "Show"}
                                    >
                                        {o.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                                    </button>

                                    {/* Lock Toggle */}
                                    <button
                                        className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${!o.locked ? "text-slate-400 opacity-0 group-hover:opacity-100" : "text-current opacity-100"}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            o.locked = !o.locked;
                                            engine.render();
                                            setForceUpdate(n => n + 1);
                                        }}
                                        title={o.locked ? "Unlock" : "Lock"}
                                    >
                                        {o.locked ? <Lock size={12} /> : <Unlock size={12} />}
                                    </button>

                                    {/* Name / Rename */}
                                    <div className="flex-1 min-w-0" onClick={(e) => {
                                        if (selectedId === o.id) e.stopPropagation(); // Don't trigger select if already selected (allows double click maybe?)
                                    }}>
                                        {editingLayerId === o.id ? (
                                            <input
                                                ref={editInputRef}
                                                className="w-full bg-white dark:bg-slate-950 border border-blue-500 rounded px-1.5 py-0.5 text-xs focus:outline-none"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                onBlur={handleRenameSave}
                                                onKeyDown={(e) => e.key === "Enter" && handleRenameSave()}
                                            />
                                        ) : (
                                            <div
                                                className="truncate cursor-text"
                                                onDoubleClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRenameStart(o.id, o.name);
                                                }}
                                            >
                                                <span className="text-xs font-medium block truncate">{o.name || "Untitled"}</span>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            ))}

                            {engine.scene.objects.length === 0 && (
                                <div className="text-center text-slate-400 text-xs py-10">
                                    No layers. Add some objects!
                                </div>
                            )}
                        </div>

                        {/* Bottom Toolbar */}
                        {selectedId && (
                            <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 grid grid-cols-4 gap-1">
                                <button
                                    onClick={() => handleDuplicate(selectedId)}
                                    className="flex flex-col items-center justify-center p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors gap-1"
                                    title="Duplicate"
                                >
                                    <Copy size={16} />
                                    <span className="text-[9px] uppercase font-bold">Duplicate</span>
                                </button>
                                <button
                                    onClick={() => {
                                        engine.scene.moveUp(selectedId);
                                        engine.render();
                                        setForceUpdate(n => n + 1);
                                    }}
                                    className="flex flex-col items-center justify-center p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors gap-1"
                                    title="Move Up"
                                >
                                    <ArrowUp size={16} />
                                    <span className="text-[9px] uppercase font-bold">Up</span>
                                </button>
                                <button
                                    onClick={() => {
                                        engine.scene.moveDown(selectedId);
                                        engine.render();
                                        setForceUpdate(n => n + 1);
                                    }}
                                    className="flex flex-col items-center justify-center p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors gap-1"
                                    title="Move Down"
                                >
                                    <ArrowDown size={16} />
                                    <span className="text-[9px] uppercase font-bold">Down</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(selectedId)}
                                    className="flex flex-col items-center justify-center p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors gap-1"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                    <span className="text-[9px] uppercase font-bold">Delete</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    )
}
