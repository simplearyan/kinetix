import React, { useEffect, useState, useRef } from "react";
import { Engine } from "../../engine/Core";
import { TextObject } from "../../engine/objects/TextObject";
import { CodeBlockObject } from "../../engine/objects/CodeBlockObject";
import { ChartObject } from "../../engine/objects/ChartObject";
import { BarChartRaceObject } from "../../engine/objects/BarChartRaceObject";
import { CharacterObject } from "../../engine/objects/CharacterObject";
import { LogoCharacterObject } from "../../engine/objects/LogoCharacterObject";
import { ParticleTextObject } from "../../engine/objects/ParticleTextObject";

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
    Minimize,
    User,
    Sparkles,
    Wand2,
    Link2,
    Unlink2
} from "lucide-react";

interface PropertiesPanelProps {
    engine: Engine | null;
    selectedId: string | null;
}

type Tab = "properties" | "layers" | "animations";

export const PropertiesPanel = ({ engine, selectedId }: PropertiesPanelProps) => {
    const [activeTab, setActiveTab] = useState<Tab>("properties");
    const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [_, setForceUpdate] = useState(0);
    const [isRatioLocked, setIsRatioLocked] = useState(true); // Added isRatioLocked state


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

                                    <ControlRow label="Duration" layout="horizontal">
                                        <div className="flex items-center gap-2 justify-end">
                                            <input
                                                type="number"
                                                min={1}
                                                max={300}
                                                className="inspector-input-number w-16 text-right"
                                                value={Math.round(engine.totalDuration / 1000)}
                                                onChange={(e) => {
                                                    const val = Math.max(1, Number(e.target.value));
                                                    engine.setTotalDuration(val * 1000);
                                                    setForceUpdate(n => n + 1);
                                                }}
                                            />
                                            <span className="text-xs text-slate-500">sec</span>
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
                                                        obj instanceof CharacterObject ? <User size={16} /> :
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

                                    <div className="space-y-3 relative">
                                        {/* Link Line Visual */}
                                        {isRatioLocked && (
                                            <div className="absolute left-[3px] top-[14px] bottom-[14px] w-1.5 border-l border-t border-b border-slate-300 dark:border-slate-600 rounded-l-md pointer-events-none" />
                                        )}

                                        {/* Lock Button */}
                                        <button
                                            className={`absolute left-[-12px] top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full z-10 transition-colors ${isRatioLocked ? "text-blue-500 border-blue-200 dark:border-blue-900" : "text-slate-400"}`}
                                            onClick={() => setIsRatioLocked(!isRatioLocked)}
                                            title={isRatioLocked ? "Unlock Ratio" : "Lock Ratio"}
                                        >
                                            {isRatioLocked ? <Link2 size={10} /> : <Unlink2 size={10} />}
                                        </button>

                                        <ControlRow label="Width">
                                            <SliderInput
                                                value={Math.round(obj.width)}
                                                min={10}
                                                max={1920}
                                                onChange={(v) => {
                                                    const oldW = obj.width;
                                                    handleChange("width", v);
                                                    if (isRatioLocked && oldW > 0) {
                                                        const ratio = obj.height / oldW;
                                                        handleChange("height", Math.round(v * ratio));
                                                    }
                                                }}
                                                formatValue={(v) => `${v}px`}
                                            />
                                        </ControlRow>
                                        <ControlRow label="Height">
                                            <SliderInput
                                                value={Math.round(obj.height)}
                                                min={10}
                                                max={1080}
                                                onChange={(v) => {
                                                    const oldH = obj.height;
                                                    handleChange("height", v);
                                                    if (isRatioLocked && oldH > 0) {
                                                        const ratio = obj.width / oldH;
                                                        handleChange("width", Math.round(v * ratio));
                                                    }
                                                }}
                                                formatValue={(v) => `${v}px`}
                                            />
                                        </ControlRow>
                                    </div>

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
                                {(obj instanceof CharacterObject) && (
                                    <PropertySection title="Character">
                                        <ControlRow label="Animation">
                                            <select
                                                className="inspector-select"
                                                value={obj.currentAnimation}
                                                onChange={(e) => handleChange("currentAnimation", e.target.value)}
                                            >
                                                <option value="idle">Idle</option>
                                                <option value="wave">Wave</option>
                                                <option value="think">Thinking</option>
                                                <option value="walk">Walking</option>
                                                <option value="explain">Explain</option>
                                            </select>
                                        </ControlRow>
                                        <ControlRow label="Costume">
                                            <select
                                                className="inspector-select"
                                                value={obj.costume}
                                                onChange={(e) => handleChange("costume", e.target.value)}
                                            >
                                                <option value="casual">Casual (T-Shirt)</option>
                                                <option value="suit">Business Suit</option>
                                                <option value="superhero">Superhero</option>
                                                <option value="mechanic">Mechanic</option>
                                            </select>
                                        </ControlRow>
                                        <ControlRow label="Hair Style">
                                            <select
                                                className="inspector-select"
                                                value={obj.hairStyle}
                                                onChange={(e) => handleChange("hairStyle", e.target.value)}
                                            >
                                                <option value="messy">Messy (Raghav)</option>
                                                <option value="short">Short</option>
                                                <option value="ponytail">Ponytail</option>
                                                <option value="bald">Bald</option>
                                            </select>
                                        </ControlRow>
                                        <ControlRow label="Accessory">
                                            <select
                                                className="inspector-select"
                                                value={obj.accessory}
                                                onChange={(e) => handleChange("accessory", e.target.value)}
                                            >
                                                <option value="none">None</option>
                                                <option value="glasses">Glasses</option>
                                                <option value="cap">Red Cap</option>
                                            </select>
                                        </ControlRow>

                                        <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />

                                        <ControlRow label="Skin & Hair" layout="horizontal">
                                            <div className="flex justify-end gap-2 items-center">
                                                <div className="w-4 h-4 rounded-full bg-slate-200" title="Skin" />
                                                <input
                                                    type="color"
                                                    className="inspector-input-color"
                                                    value={obj.skinColor}
                                                    onChange={(e) => handleChange("skinColor", e.target.value)}
                                                />
                                                <div className="w-4 h-4 rounded-full bg-slate-800 ml-2" title="Hair" />
                                                <input
                                                    type="color"
                                                    className="inspector-input-color"
                                                    value={obj.hairColor}
                                                    onChange={(e) => handleChange("hairColor", e.target.value)}
                                                />
                                            </div>
                                        </ControlRow>
                                        <ControlRow label="Costume Color" layout="horizontal">
                                            <div className="flex justify-end gap-2 items-center">
                                                <input
                                                    type="color"
                                                    className="inspector-input-color"
                                                    value={obj.costumeColor}
                                                    onChange={(e) => handleChange("costumeColor", e.target.value)}
                                                />
                                            </div>
                                        </ControlRow>
                                    </PropertySection>
                                )}

                                {(obj instanceof LogoCharacterObject) && (
                                    <PropertySection title="Logo Settings">
                                        <ControlRow label="Name / Text">
                                            <input
                                                type="text"
                                                className="inspector-input-text"
                                                value={obj.text}
                                                onChange={(e) => handleChange("text", e.target.value)}
                                            />
                                        </ControlRow>
                                        <ControlRow label="Circle Color" layout="horizontal">
                                            <input
                                                type="color"
                                                className="inspector-input-color"
                                                value={obj.circleColor}
                                                onChange={(e) => handleChange("circleColor", e.target.value)}
                                            />
                                        </ControlRow>
                                        <ControlRow label="Text Color" layout="horizontal">
                                            <input
                                                type="color"
                                                className="inspector-input-color"
                                                value={obj.textColor}
                                                onChange={(e) => handleChange("textColor", e.target.value)}
                                            />
                                        </ControlRow>
                                    </PropertySection>
                                )}

                                {(obj instanceof ParticleTextObject) && (
                                    <>
                                        <PropertySection title="Text Content">
                                            <textarea
                                                className="inspector-textarea"
                                                value={obj.text}
                                                onChange={(e) => handleChange("text", e.target.value)}
                                                placeholder="Type your text here..."
                                            />
                                        </PropertySection>
                                        <PropertySection title="Particle Effects">
                                            <ControlRow label="Animation Mode">
                                                <select
                                                    className="inspector-select"
                                                    value={obj.animType}
                                                    onChange={(e) => handleChange("animType", e.target.value)}
                                                >
                                                    <option value="none">Static</option>
                                                    <option value="explode">Interactive Explode</option>
                                                    <option value="assemble">Assemble (Intro)</option>
                                                    <option value="float">Floating</option>
                                                    <option value="vortex">Vortex</option>
                                                </select>
                                            </ControlRow>
                                            <ControlRow label="Particle Size">
                                                <SliderInput
                                                    value={obj.particleSize}
                                                    min={1}
                                                    max={10}
                                                    onChange={(v) => handleChange("particleSize", v)}
                                                    formatValue={(v) => `${v}px`}
                                                />
                                            </ControlRow>
                                            <ControlRow label="Density (Gap)">
                                                <SliderInput
                                                    value={obj.gap}
                                                    min={1}
                                                    max={10}
                                                    onChange={(v) => handleChange("gap", v)}
                                                    formatValue={(v) => `1/${v}`}
                                                />
                                                <div className="text-[10px] text-orange-500 mt-1">Lower gap = more CPU</div>
                                            </ControlRow>
                                            <ControlRow label="Color" layout="horizontal">
                                                <input
                                                    type="color"
                                                    className="inspector-input-color"
                                                    value={obj.color}
                                                    onChange={(e) => handleChange("color", e.target.value)}
                                                />
                                            </ControlRow>
                                        </PropertySection>

                                        <PropertySection title="Typography">
                                            <ControlRow label="Font Size">
                                                <SliderInput
                                                    value={obj.fontSize}
                                                    min={20}
                                                    max={300}
                                                    onChange={(v) => handleChange("fontSize", v)}
                                                    formatValue={(v) => `${v}px`}
                                                />
                                            </ControlRow>
                                            <ControlRow label="Font Family">
                                                <select
                                                    className="inspector-select"
                                                    value={obj.fontFamily}
                                                    onChange={(e) => handleChange("fontFamily", e.target.value)}
                                                >
                                                    <option value="Inter">Inter</option>
                                                    <option value="Arial">Arial</option>
                                                    <option value="Impact">Impact</option>
                                                    <option value="Times New Roman">Times New Roman</option>
                                                </select>
                                            </ControlRow>
                                        </PropertySection>
                                    </>
                                )}

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

                                {obj instanceof BarChartRaceObject && (
                                    <PropertySection title="Race Configuration">
                                        <ControlRow label="Duration (Speed)">
                                            <SliderInput
                                                value={obj.duration}
                                                min={1000}
                                                max={30000}
                                                step={500}
                                                onChange={(v) => handleChange("duration", v)}
                                                formatValue={(v) => `${(v / 1000).toFixed(1)}s`}
                                            />
                                            <div className="flex justify-between px-1 mt-1">
                                                <span className="text-[10px] text-slate-400">Fast (1s)</span>
                                                <span className="text-[10px] text-slate-400">Slow (30s)</span>
                                            </div>
                                        </ControlRow>
                                        <ControlRow label="Bar Height">
                                            <SliderInput
                                                value={obj.barHeight}
                                                min={20}
                                                max={100}
                                                onChange={(v) => handleChange("barHeight", v)}
                                                formatValue={(v) => `${v}px`}
                                            />
                                        </ControlRow>
                                        <ControlRow label="Gap">
                                            <SliderInput
                                                value={obj.gap}
                                                min={0}
                                                max={50}
                                                onChange={(v) => handleChange("gap", v)}
                                                formatValue={(v) => `${v}px`}
                                            />
                                        </ControlRow>
                                    </PropertySection>
                                )}

                                {!(obj instanceof BarChartRaceObject) && (
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
                                )}

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

                                {obj instanceof BarChartRaceObject ? (
                                    <div className="text-center text-slate-400 py-8 text-sm">
                                        Motion animations are disabled for this object type.
                                        Use the "Race Configuration" in properties to adjust the animation.
                                    </div>
                                ) : (
                                    <>
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
                                    </>
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
