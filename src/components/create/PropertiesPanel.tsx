import React, { useEffect, useState, useRef } from "react";
import { Engine } from "../../engine/Core";
import { TextObject } from "../../engine/objects/TextObject";
import { CodeBlockObject } from "../../engine/objects/CodeBlockObject";
import { ChartObject } from "../../engine/objects/ChartObject";

import {
    PropertySection,
    ControlRow,
    SliderInput,
    Toggle,
    SegmentedControl,
    IconGrid
} from "./InspectorUI";

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
    SlidersHorizontal,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Type,
    Image,
    Box,
    PieChart,
    BarChart,
    LineChart,
    Activity,
    Circle,
    Square,
    ChevronUp,
    Minimize
} from "lucide-react";

interface ExportConfig {
    filename: string;
    format: "webm" | "mp4" | "mov";
    duration: number;
    useFullDuration: boolean;
    fps: number;
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
    const [exportMode, setExportMode] = useState<'realtime' | 'offline'>('offline');

    const handleExport = async () => {
        if (isExporting || !engine) return;

        setIsExporting(true);
        setExportProgress(0);

        try {
            const duration = exportConfig?.useFullDuration ? engine.totalDuration : (exportConfig?.duration || 5) * 1000;

            const blob = await engine.exportVideo(
                duration,
                30, // FPS
                exportMode,
                (progress) => setExportProgress(progress)
            );

            // Download
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${exportConfig?.filename || "video"}.${exportConfig?.format || "webm"}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (e) {
            console.error("Export failed", e);
            alert("Export failed: " + e);
        } finally {
            setIsExporting(false);
            setExportProgress(0);
        }
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
            <div className="inspector-tabs">
                <button
                    onClick={() => setActiveTab("properties")}
                    className={`inspector-tab-item ${activeTab === "properties" ? "active" : ""}`}
                >
                    <Settings size={14} /> Inspector
                </button>
                <button
                    onClick={() => setActiveTab("layers")}
                    className={`inspector-tab-item hidden lg:flex ${activeTab === "layers" ? "active" : ""}`}
                >
                    <Layers size={14} /> Layers
                </button>
                <button
                    onClick={() => setActiveTab("animations")}
                    className={`inspector-tab-item hidden lg:flex ${activeTab === "animations" ? "active" : ""}`}
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
                            <div className="p-1">
                                <PropertySection title="Canvas Settings" defaultOpen={true}>
                                    <ControlRow label="Background Color" layout="horizontal">
                                        <div className="flex justify-end items-center gap-2">
                                            <input
                                                type="color"
                                                className="inspector-input-color"
                                                value={engine.scene.backgroundColor}
                                                onChange={(e) => {
                                                    engine.scene.backgroundColor = e.target.value;
                                                    engine.render();
                                                    setForceUpdate(n => n + 1);
                                                }}
                                            />
                                            <span className="text-xs font-mono text-slate-500">{engine.scene.backgroundColor}</span>
                                        </div>
                                    </ControlRow>

                                    <ControlRow label="Aspect Ratio">
                                        <div className="inspector-resolution-grid">
                                            {[
                                                { label: "16:9", val: 16 / 9 },
                                                { label: "9:16", val: 9 / 16 },
                                                { label: "1:1", val: 1 },
                                                { label: "4:3", val: 4 / 3 },
                                                { label: "3:4", val: 3 / 4 },
                                            ].map((ratio) => {
                                                const currentRatio = engine.scene.width / engine.scene.height;
                                                const isActive = Math.abs(currentRatio - ratio.val) < 0.01;
                                                return (
                                                    <button
                                                        key={ratio.label}
                                                        onClick={() => {
                                                            // Maintain current quality (height or short edge based)
                                                            // Heuristic: Quality is usually the smaller dimension or standard height like 1080
                                                            // But simply: let's pick the 'quality base' from current height if 16:9, or width if 9:16?
                                                            // Simpler: Just map current size to a "quality bucket" and re-apply.
                                                            // Better: Define explicit Qualities.

                                                            // Determine current quality class based on pixel count or short edge
                                                            const shortEdge = Math.min(engine.scene.width, engine.scene.height);
                                                            let quality = 1080; // default
                                                            if (Math.abs(shortEdge - 480) < 50) quality = 480;
                                                            if (Math.abs(shortEdge - 720) < 50) quality = 720;
                                                            if (Math.abs(shortEdge - 1080) < 50) quality = 1080;
                                                            if (Math.abs(shortEdge - 2160) < 50) quality = 2160;

                                                            let w, h;
                                                            if (ratio.val >= 1) { // Landscape or Square
                                                                h = quality;
                                                                w = Math.round(h * ratio.val);
                                                            } else { // Portrait
                                                                w = quality;
                                                                h = Math.round(w / ratio.val);
                                                            }

                                                            engine.resize(w, h);
                                                            setForceUpdate(n => n + 1);
                                                        }}
                                                        className={`inspector-resolution-btn ${isActive ? "active" : ""}`}
                                                    >
                                                        {ratio.label}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </ControlRow>

                                    <ControlRow label="Resolution (Quality)">
                                        <div className="inspector-resolution-grid">
                                            {[
                                                { label: "480p", base: 480 },
                                                { label: "720p", base: 720 },
                                                { label: "1080p", base: 1080 },
                                                { label: "4K", base: 2160 }
                                            ].map((qual) => {
                                                // Check if active: Short edge matches base
                                                const shortEdge = Math.min(engine.scene.width, engine.scene.height);
                                                const isActive = Math.abs(shortEdge - qual.base) < 10;

                                                return (
                                                    <button
                                                        key={qual.label}
                                                        onClick={() => {
                                                            const currentRatio = engine.scene.width / engine.scene.height;
                                                            let w, h;
                                                            if (currentRatio >= 1) {
                                                                h = qual.base;
                                                                w = Math.round(h * currentRatio);
                                                            } else {
                                                                w = qual.base;
                                                                h = Math.round(w / currentRatio);
                                                            }
                                                            engine.resize(w, h);
                                                            setForceUpdate(n => n + 1);
                                                        }}
                                                        className={`inspector-resolution-btn ${isActive ? "active" : ""}`}
                                                    >
                                                        {qual.label}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-2 text-center">
                                            {engine.scene.width} x {engine.scene.height} px
                                        </div>
                                    </ControlRow>
                                </PropertySection>

                                {exportConfig && setExportConfig && (
                                    <PropertySection title="Export Video" defaultOpen={false}>
                                        <ControlRow label="Filename">
                                            <input
                                                type="text"
                                                disabled={isExporting}
                                                className="inspector-input-text"
                                                value={exportConfig.filename}
                                                onChange={(e) => setExportConfig({ ...exportConfig, filename: e.target.value })}
                                            />
                                        </ControlRow>

                                        <ControlRow label="Format">
                                            <SegmentedControl
                                                value={exportConfig.format}
                                                onChange={(val) => setExportConfig({ ...exportConfig, format: val as any })}
                                                options={[
                                                    { value: "webm", label: "WebM" },
                                                    { value: "mp4", label: "MP4" },
                                                    { value: "mov", label: "MOV" }
                                                ]}
                                            />
                                        </ControlRow>

                                        <ControlRow label="Duration" layout="horizontal">
                                            <Toggle
                                                value={exportConfig.useFullDuration}
                                                onChange={(val) => setExportConfig({ ...exportConfig, useFullDuration: val })}
                                                label="Full Timeline"
                                            />
                                        </ControlRow>

                                        <ControlRow label="High Quality (Slow)" layout="horizontal">
                                            <Toggle
                                                value={exportMode === 'offline'}
                                                onChange={(val) => setExportMode(val ? 'offline' : 'realtime')}
                                                label="Offline Render"
                                            />
                                            <span className="text-[10px] text-slate-400 ml-2">Fixes lag/stutter</span>
                                        </ControlRow>

                                        {!exportConfig.useFullDuration && (
                                            <ControlRow label="Custom Duration (s)">
                                                <SliderInput
                                                    min={1}
                                                    max={60}
                                                    value={exportConfig.duration}
                                                    onChange={(val) => setExportConfig({ ...exportConfig, duration: val })}
                                                />
                                            </ControlRow>
                                        )}

                                        <div className="pt-2">
                                            {!isExporting ? (
                                                <button
                                                    onClick={handleExport}
                                                    className="inspector-btn-primary"
                                                >
                                                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shadow-[0_0_10px_rgba(248,113,113,0.5)]" />
                                                    Export Video
                                                </button>
                                            ) : (
                                                <div className="space-y-2 p-3 bg-slate-50 dark:bg-neutral-800/50 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase animate-pulse">Rendering...</span>
                                                        <span className="text-[10px] text-slate-500 font-mono">{Math.round(exportProgress)}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-500 transition-all duration-300 ease-out"
                                                            style={{ width: `${exportProgress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </PropertySection>
                                )}
                            </div>
                        ) : (
                            <div className="p-1 space-y-1">
                                {/* Selected Object Header */}
                                <div className="inspector-object-header">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="inspector-object-icon">
                                            {obj instanceof ChartObject ? <BarChart size={16} /> :
                                                obj instanceof TextObject ? <Type size={16} /> :
                                                    obj instanceof CodeBlockObject ? <Box size={16} /> :
                                                        <Square size={16} />}
                                        </div>
                                        <div className="inspector-object-info">
                                            <div className="inspector-object-name" title={obj.name}>
                                                {obj.name || "Untitled"}
                                            </div>
                                            <div className="inspector-object-type">
                                                {obj.constructor.name.replace('Object', '')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="inspector-object-actions">
                                        <button
                                            onClick={() => {
                                                const newObj = obj.clone();
                                                newObj.x += 20;
                                                newObj.y += 20;
                                                engine.scene.add(newObj);
                                                setForceUpdate(n => n + 1);
                                            }}
                                            className="inspector-action-btn"
                                            title="Duplicate"
                                        >
                                            <Copy size={14} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                engine.scene.remove(obj.id);
                                                setForceUpdate(n => n + 1);
                                            }}
                                            className="inspector-action-btn delete"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <PropertySection title="Layout">
                                    <ControlRow label="Position">
                                        <div className="inspector-labeled-input-group">
                                            <div className="inspector-labeled-input-container">
                                                <span className="inspector-input-label">X</span>
                                                <input
                                                    type="number"
                                                    className="inspector-input-number"
                                                    value={Math.round(obj.x)}
                                                    onChange={(e) => handleChange("x", Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="inspector-labeled-input-container">
                                                <span className="inspector-input-label">Y</span>
                                                <input
                                                    type="number"
                                                    className="inspector-input-number"
                                                    value={Math.round(obj.y)}
                                                    onChange={(e) => handleChange("y", Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    </ControlRow>
                                    <ControlRow label="Width">
                                        <SliderInput
                                            value={Math.round(obj.width)}
                                            min={10}
                                            max={1920}
                                            onChange={(v) => handleChange("width", v)}
                                            formatValue={(v) => `${v}px`}
                                        />
                                    </ControlRow>
                                    <ControlRow label="Height">
                                        <SliderInput
                                            value={Math.round(obj.height)}
                                            min={10}
                                            max={1080}
                                            onChange={(v) => handleChange("height", v)}
                                            formatValue={(v) => `${v}px`}
                                        />
                                    </ControlRow>
                                    <ControlRow label="Scale" layout="horizontal">
                                        <div className="flex-1">
                                            <SliderInput
                                                value={Math.round((obj.scaleX || 1) * 100)}
                                                min={10}
                                                max={200}
                                                onChange={(v) => {
                                                    const s = v / 100;
                                                    obj.scaleX = s;
                                                    obj.scaleY = s;
                                                    setForceUpdate(n => n + 1);
                                                }}
                                                formatValue={(v) => `${v}%`}
                                            />
                                        </div>
                                    </ControlRow>
                                </PropertySection>

                                <PropertySection title="Appearance" defaultOpen={false}>
                                    <ControlRow label="Opacity">
                                        <SliderInput
                                            value={obj.opacity ?? 1}
                                            min={0}
                                            max={1}
                                            step={0.01}
                                            onChange={(v) => handleChange("opacity", v)}
                                            formatValue={(v) => `${Math.round(v * 100)}%`}
                                        />
                                    </ControlRow>
                                    <ControlRow label="Rotation">
                                        <SliderInput
                                            value={obj.rotation ?? 0}
                                            min={-180}
                                            max={180}
                                            onChange={(v) => handleChange("rotation", v)}
                                            formatValue={(v) => `${v}°`}
                                        />
                                    </ControlRow>
                                </PropertySection>

                                <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />

                                {/* Type Specific */}
                                {/* Type Specific Properties */}
                                {(obj instanceof TextObject || obj instanceof ChartObject) && (
                                    <>
                                        {obj instanceof TextObject && (
                                            <PropertySection title="Content">
                                                <textarea
                                                    className="inspector-textarea"
                                                    value={obj.text}
                                                    onChange={(e) => handleChange("text", e.target.value)}
                                                    placeholder="Type your text here..."
                                                />
                                            </PropertySection>
                                        )}

                                        <PropertySection title="Typography">
                                            <ControlRow label="Font Family">
                                                <select
                                                    className="inspector-select"
                                                    value={obj.fontFamily}
                                                    onChange={(e) => handleChange("fontFamily", e.target.value)}
                                                >
                                                    <option value="Inter">Inter</option>
                                                    <option value="Arial">Arial</option>
                                                    <option value="Helvetica">Helvetica</option>
                                                    <option value="Times New Roman">Times New Roman</option>
                                                    <option value="Courier New">Courier New</option>
                                                    <option value="Georgia">Georgia</option>
                                                    <option value="Verdana">Verdana</option>
                                                    <option value="Impact">Impact</option>
                                                    <option value="Comic Sans MS">Comic Sans</option>
                                                </select>
                                            </ControlRow>
                                            <ControlRow label="Font Size">
                                                <SliderInput
                                                    value={obj.fontSize || 16}
                                                    min={8}
                                                    max={120}
                                                    onChange={(v) => handleChange("fontSize", v)}
                                                    formatValue={(v) => `${v}px`}
                                                />
                                            </ControlRow>
                                            <ControlRow label="Color" layout="horizontal">
                                                <div className="flex justify-end gap-2 items-center">
                                                    <input
                                                        type="color"
                                                        className="inspector-input-color"
                                                        value={obj.color}
                                                        onChange={(e) => handleChange("color", e.target.value)}
                                                    />
                                                    <span className="text-xs font-mono text-slate-500">{obj.color}</span>
                                                </div>
                                            </ControlRow>
                                            <ControlRow label="Font Size">
                                                <SliderInput
                                                    value={obj.fontSize}
                                                    min={10}
                                                    max={400}
                                                    onChange={(v) => handleChange("fontSize", v)}
                                                    formatValue={(v) => `${v}px`}
                                                />
                                            </ControlRow>
                                        </PropertySection>
                                    </>
                                )}

                                {obj instanceof CodeBlockObject && (
                                    <>
                                        <PropertySection title="Code Content">
                                            <div className="space-y-2">
                                                <textarea
                                                    className="inspector-textarea font-mono"
                                                    value={obj.code}
                                                    onChange={(e) => handleChange("code", e.target.value)}
                                                    spellCheck={false}
                                                    placeholder="// Insert code here..."
                                                />
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() => document.getElementById('code-import')?.click()}
                                                        className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                                    >
                                                        <Box size={12} /> Import File
                                                    </button>
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
                                                                    handleChange("code", ev.target?.result as string);
                                                                };
                                                                reader.readAsText(file);
                                                            }
                                                            e.target.value = '';
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </PropertySection>

                                        <PropertySection title="Syntax & Theme">
                                            <ControlRow label="Theme">
                                                <select
                                                    className="inspector-select"
                                                    value={obj.theme}
                                                    onChange={(e) => handleChange("theme", e.target.value)}
                                                >
                                                    <option value="vscode-dark">VS Code Dark</option>
                                                    <option value="light">Light</option>
                                                    <option value="monokai">Monokai</option>
                                                    <option value="github-dark">GitHub Dark</option>
                                                    <option value="dracula">Dracula</option>
                                                </select>
                                            </ControlRow>
                                            <ControlRow label="Font Size">
                                                <SliderInput
                                                    value={obj.fontSize}
                                                    min={8}
                                                    max={100}
                                                    onChange={(v) => handleChange("fontSize", v)}
                                                    formatValue={(v) => `${v}px`}
                                                />
                                            </ControlRow>
                                            <ControlRow label="Settings" layout="horizontal">
                                                <div className="flex gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <Toggle
                                                            value={obj.syntaxHighlighting}
                                                            onChange={(v) => handleChange("syntaxHighlighting", v)}
                                                        />
                                                        <span className="text-xs text-slate-600 dark:text-slate-400">Syntax</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Toggle
                                                            value={obj.showLineNumbers !== false}
                                                            onChange={(v) => handleChange("showLineNumbers", v)}
                                                        />
                                                        <span className="text-xs text-slate-600 dark:text-slate-400">Line nums</span>
                                                    </div>
                                                </div>
                                            </ControlRow>
                                        </PropertySection>

                                        <PropertySection title="Layout & Spacing" defaultOpen={false}>
                                            <ControlRow label="Padding">
                                                <SliderInput
                                                    value={obj.padding || 0}
                                                    min={0}
                                                    max={100}
                                                    onChange={(v) => handleChange("padding", v)}
                                                />
                                            </ControlRow>
                                            <ControlRow label="Line Gap">
                                                <SliderInput
                                                    value={obj.lineNumberMargin || 15}
                                                    min={0}
                                                    max={100}
                                                    onChange={(v) => handleChange("lineNumberMargin", v)}
                                                />
                                            </ControlRow>
                                            <ControlRow label="Start Line #">
                                                <input
                                                    type="number"
                                                    className="inspector-input-number"
                                                    value={obj.startLineNumber || 1}
                                                    onChange={(e) => handleChange("startLineNumber", Number(e.target.value))}
                                                />
                                            </ControlRow>
                                        </PropertySection>

                                        <PropertySection title="Line Highlighting" defaultOpen={false}>
                                            <ControlRow label="Highlight Color" layout="horizontal">
                                                <div className="flex justify-end gap-2 items-center">
                                                    <input
                                                        type="color"
                                                        className="inspector-input-color"
                                                        value={obj.highlightColor || "#ffffff"}
                                                        onChange={(e) => handleChange("highlightColor", e.target.value)}
                                                    />
                                                </div>
                                            </ControlRow>
                                            <ControlRow label="Lines (e.g. 1, 3-5)">
                                                <input
                                                    type="text"
                                                    className="inspector-input-text"
                                                    placeholder="1, 3-5"
                                                    defaultValue={(obj.highlightedLines || []).join(", ")}
                                                    onBlur={(e) => {
                                                        const val = e.target.value;
                                                        const lines = val.split(",").flatMap(part => {
                                                            if (part.includes("-")) {
                                                                const parts = part.split("-").map(n => parseInt(n.trim()));
                                                                if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                                                                    return Array.from({ length: parts[1] - parts[0] + 1 }, (_, i) => parts[0] + i);
                                                                }
                                                                return [];
                                                            }
                                                            const num = parseInt(part.trim());
                                                            return isNaN(num) ? [] : [num];
                                                        });
                                                        handleChange("highlightedLines", lines);
                                                    }}
                                                />
                                            </ControlRow>
                                        </PropertySection>
                                    </>
                                )}

                                {obj instanceof ChartObject && (
                                    <>
                                        <PropertySection title="Chart Type">
                                            <IconGrid
                                                value={obj.chartType}
                                                onChange={(v) => handleChange("chartType", v)}
                                                size="sm"
                                                cols={2}
                                                layout="horizontal"
                                                options={[
                                                    { value: "bar", label: "Bar", icon: <BarChart size={16} /> },
                                                    { value: "line", label: "Line", icon: <LineChart size={16} /> },
                                                    { value: "area", label: "Area", icon: <Activity size={16} /> },
                                                    { value: "scatter", label: "Scatter", icon: <Circle size={16} /> },
                                                    { value: "pie", label: "Pie", icon: <PieChart size={16} /> },
                                                    { value: "donut", label: "Donut", icon: <Circle size={16} strokeWidth={2.5} /> }
                                                ]}
                                            />
                                        </PropertySection>

                                        <PropertySection title="Chart Configuration">
                                            {obj.chartType === "donut" && (
                                                <ControlRow label="Hole Radius">
                                                    <SliderInput
                                                        value={Math.round(obj.innerRadius * 100)}
                                                        min={10}
                                                        max={90}
                                                        onChange={(v) => handleChange("innerRadius", v / 100)}
                                                        formatValue={(v) => `${v}%`}
                                                    />
                                                </ControlRow>
                                            )}

                                            <ControlRow label="Label Position">
                                                <SegmentedControl
                                                    value={obj.labelPosition}
                                                    onChange={(v) => handleChange("labelPosition", v)}
                                                    options={[
                                                        { value: "axis", label: "Axis" },
                                                        { value: "top", label: "Top" },
                                                        { value: "center", label: "Center" },
                                                        { value: "none", label: "None" }
                                                    ]}
                                                />
                                            </ControlRow>

                                            <ControlRow label="Show Grid" layout="horizontal">
                                                <Toggle
                                                    value={obj.showGrid}
                                                    onChange={(v) => handleChange("showGrid", v)}
                                                />
                                            </ControlRow>

                                            <ControlRow label="Axis Color" layout="horizontal">
                                                <div className="flex justify-end gap-2 items-center">
                                                    <input
                                                        type="color"
                                                        className="inspector-input-color"
                                                        value={obj.axisColor}
                                                        onChange={(e) => handleChange("axisColor", e.target.value)}
                                                    />
                                                </div>
                                            </ControlRow>
                                        </PropertySection>

                                        <PropertySection title="Data">
                                            <ControlRow label="Values (comma separated)">
                                                <input
                                                    type="text"
                                                    className="inspector-input-text"
                                                    value={obj.data.join(", ")}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        const data = val.split(",").map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
                                                        if (data.length > 0 || val === "") {
                                                            handleChange("data", data);
                                                        }
                                                    }}
                                                />
                                            </ControlRow>
                                            <ControlRow label="Labels (comma separated)">
                                                <input
                                                    type="text"
                                                    className="inspector-input-text"
                                                    value={obj.labels.join(", ")}
                                                    onChange={(e) => {
                                                        const labels = e.target.value.split(",").map(s => s.trim());
                                                        handleChange("labels", labels);
                                                    }}
                                                />
                                            </ControlRow>
                                        </PropertySection>

                                        <PropertySection title="Colors">
                                            <ControlRow label="Color Mode" layout="horizontal">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Multi-color</span>
                                                    <Toggle
                                                        value={obj.useMultiColor}
                                                        onChange={(v) => handleChange("useMultiColor", v)}
                                                    />
                                                </div>
                                            </ControlRow>

                                            {!obj.useMultiColor ? (
                                                <ControlRow label="Base Color" layout="horizontal">
                                                    <div className="inspector-palette-grid">
                                                        {['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#a855f7', '#6366f1'].map(c => (
                                                            <button
                                                                key={c}
                                                                onClick={(e) => handleChange("color", c)}
                                                                className={`inspector-color-swatch-btn ${obj.color === c ? 'active' : ''}`}
                                                                style={{ backgroundColor: c }}
                                                            />
                                                        ))}
                                                        <div className="inspector-color-input-wrapper group">
                                                            <input
                                                                type="color"
                                                                className="inspector-input-color sm absolute inset-0 z-10 opacity-0"
                                                                value={obj.color}
                                                                onChange={(e) => handleChange("color", e.target.value)}
                                                            />
                                                            <div
                                                                className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-conic-gradient"
                                                                style={{ background: `linear-gradient(135deg, ${obj.color} 0%, ${obj.color} 100%)` }}
                                                            >
                                                                <div className="w-full h-full rounded-full ring-1 ring-inset ring-black/10" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </ControlRow>
                                            ) : (
                                                <div className="inspector-palette-grid multi">
                                                    {obj.colorPalette.map((color: string, i: number) => (
                                                        <div key={i} className="relative group">
                                                            <input
                                                                type="color"
                                                                className="inspector-input-color"
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
                                                        className="inspector-add-color-btn"
                                                        onClick={() => {
                                                            const newPalette = [...obj.colorPalette, "#888888"];
                                                            handleChange("colorPalette", newPalette);
                                                        }}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            )}
                                        </PropertySection>
                                    </>
                                )}

                                <PropertySection title="Animation">
                                    <ControlRow label="Effect">
                                        <IconGrid
                                            value={obj.animation.type}
                                            onChange={(v) => {
                                                obj.animation.type = v as any;
                                                engine.currentTime = 0;
                                                engine.play();
                                                setForceUpdate(n => n + 1);
                                            }}
                                            size="sm"
                                            cols={2}
                                            layout="horizontal"
                                            options={[
                                                { value: "none", label: "None", icon: <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" /> },
                                                ...(obj instanceof TextObject ? [{ value: "typewriter", label: "Typewriter", icon: <Type size={14} /> }] : []),
                                                { value: "fadeIn", label: "Fade", icon: <Activity size={14} className="opacity-50" /> },
                                                { value: "slideUp", label: "Slide", icon: <ChevronUp size={14} /> },
                                                { value: "scaleIn", label: "Scale", icon: <Minimize size={14} /> },
                                                ...(obj instanceof ChartObject ? [{ value: "grow", label: "Grow", icon: <BarChart size={14} /> }] : [])
                                            ]}
                                        />
                                    </ControlRow>

                                    {obj.animation.type !== "none" && (
                                        <ControlRow label="Duration">
                                            <SliderInput
                                                value={obj.animation.duration}
                                                min={100}
                                                max={3000}
                                                step={100}
                                                onChange={(v) => {
                                                    obj.animation.duration = v;
                                                    setForceUpdate(n => n + 1);
                                                }}
                                                formatValue={(v) => `${v}ms`}
                                            />
                                        </ControlRow>
                                    )}
                                </PropertySection>

                                <div className="pt-4 px-1">
                                    <button
                                        onClick={() => {
                                            engine.scene.remove(obj.id);
                                            setForceUpdate(n => n + 1);
                                        }}
                                        className="w-full py-3 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={14} />
                                        Delete Layer
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
                                {(() => {
                                    const commonAnims = [
                                        { id: "none", label: "None", className: "" },
                                        { id: "fadeIn", label: "Fade In", className: "group-hover:animate-pulse" },
                                        { id: "slideUp", label: "Slide Up", className: "group-hover:animate-bounce" },
                                        { id: "scaleIn", label: "Scale In", className: "group-hover:scale-75 transition-transform" },
                                    ];

                                    let displayAnims = commonAnims;

                                    if (obj instanceof ChartObject) {
                                        displayAnims = [
                                            { id: "none", label: "None", className: "" },
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
                                            { id: "none", label: "None", className: "" },
                                            { id: "typewriter", label: "Typewriter", className: "" },
                                            { id: "fadeIn", label: "Fade In", className: "group-hover:animate-pulse" },
                                        ];
                                    }

                                    return (
                                        <IconGrid
                                            value={obj.animation?.type || "none"}
                                            onChange={(v) => {
                                                if (obj.animation) {
                                                    obj.animation.type = v as any;
                                                    engine.currentTime = 0;
                                                    engine.play();
                                                    setForceUpdate(n => n + 1);
                                                }
                                            }}
                                            cols={2}
                                            layout="horizontal"
                                            size="sm"
                                            options={displayAnims.map(anim => ({
                                                value: anim.id,
                                                label: anim.label,
                                                icon: anim.id === "none" ? <div className="w-1.5 h-1.5 bg-current rounded-full" /> : <Play size={14} className={anim.className} />
                                            }))}
                                        />
                                    );
                                })()}

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
