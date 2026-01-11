import React, { useEffect, useState, useRef } from "react";
import { CanvasSettings } from "../settings/CanvasSettings";
import { Engine } from "../../../engine/Core";
import { TextObject } from "../../../engine/objects/TextObject";
import { CodeBlockObject } from "../../../engine/objects/CodeBlockObject";
import { ChartObject } from "../../../engine/objects/ChartObject";
import { BarChartRaceObject } from "../../../engine/objects/BarChartRaceObject";
import { CharacterObject } from "../../../engine/objects/CharacterObject";
import { LogoCharacterObject } from "../../../engine/objects/LogoCharacterObject";
import { ParticleTextObject } from "../../../engine/objects/ParticleTextObject";
import { LayersPanel } from "./LayersPanel";

import {
    Slider,
    ColorPicker,
    MobileCategoryStrip,
    MobileControlGroup,
    MobilePropertyContainer,
    Toggle,
    ControlRow,
    PropertySection,
    SliderInput,
    SegmentedControl,
    IconGrid
} from "../ui/InspectorUI";
import { TextSettings } from "../settings/TextSettings";
import { CodeBlockSettings } from "../settings/CodeBlockSettings";
import { ChartSettings } from "../settings/ChartSettings";
import { BarChartRaceSettings } from "../settings/BarChartRaceSettings";

import {
    Settings,
    ArrowUp,
    ArrowDown,
    RotateCcw,
    Copy,
    Trash2,
    MonitorPlay,
    SlidersHorizontal,
    Type,
    Sparkles,
    Keyboard,
    Maximize,
    Ban,
    ArrowRight,
    Zap,
    Palette,
    User,
    Link2,
    Unlink2,
    BarChart,
    PieChart,
    Square,
    Eye,
    EyeOff,
    X,
    Maximize2,
    ArrowLeft
} from "lucide-react";

import { FontPicker } from "../ui/FontPicker";

interface PropertiesPanelProps {
    engine: Engine | null;
    selectedId: string | null;
    isMobileSheet?: boolean;
    initialTab?: "properties" | "layers" | "animations";
    externalMobileCategory?: string;
    onResize?: (w: number, h: number) => void;
}

type Tab = "properties" | "layers" | "animations";

export const PropertiesPanel = ({ engine, selectedId, isMobileSheet = false, initialTab = "properties", externalMobileCategory, onResize }: PropertiesPanelProps) => {
    const [activeTab, setActiveTab] = useState<Tab>(initialTab);
    const [internalMobileCategory, setInternalMobileCategory] = useState("layout");

    // Use external category if provided (controlled), else internal state
    const activeMobileCategory = externalMobileCategory || internalMobileCategory;
    const setActiveMobileCategory = setInternalMobileCategory;

    const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [_, setForceUpdate] = useState(0);
    const [isRatioLocked, setIsRatioLocked] = useState(true);

    // Text Specific State
    const [isEditingText, setIsEditingText] = useState(false);
    const textInputRef = useRef<HTMLTextAreaElement>(null);

    // Subscribe to engine changes
    useEffect(() => {
        if (!engine) return;
        const onUpdate = () => setForceUpdate(n => n + 1);
        engine.onObjectChange = onUpdate;
        return () => { engine.onObjectChange = undefined; }
    }, [engine]);

    // Reset mobile category when selection changes
    useEffect(() => {
        if (selectedId && engine) {
            const obj = engine.scene.get(selectedId);
            // Only update internal state; if external prop is used, this is ignored for rendering
            if (obj instanceof TextObject) {
                setActiveMobileCategory("style");
            } else {
                setActiveMobileCategory("layout");
            }
            setIsEditingText(false);
        }
    }, [selectedId, engine]);

    // ... (skipping lines 85-244) ...



    // Focus text input when entering edit mode
    useEffect(() => {
        if (isEditingText && textInputRef.current) {
            textInputRef.current.focus();
            textInputRef.current.setSelectionRange(textInputRef.current.value.length, textInputRef.current.value.length);
        }
    }, [isEditingText]);

    if (!engine) return null;

    const obj = selectedId ? engine.scene.get(selectedId) : null;

    const handleChange = (key: string, value: any) => {
        if (!obj) return;
        (obj as any)[key] = value;
        engine.render();
        setForceUpdate(n => n + 1);
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

    // --- Mobile View ---
    if (isMobileSheet) {
        // 1. Canvas Settings (No Object)
        if (!obj) {
            return (
                <MobilePropertyContainer>
                    <div className="flex-1 overflow-y-auto p-6">
                        <CanvasSettings
                            engine={engine}
                            onResize={onResize}
                            onUpdate={() => setForceUpdate(n => n + 1)}
                            variant="mobile"
                        />
                    </div>
                </MobilePropertyContainer>
            );

        }

        // Special Layout for CODE EDITING
        if (activeMobileCategory === "edit" && obj instanceof CodeBlockObject) {
            return (
                <MobilePropertyContainer>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm z-10">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">Edit Code</span>
                        {/* No explicit Done button needed if we use bottom sheet close, but good for UX */}
                    </div>
                    <div className="flex-1 p-4 bg-slate-50 dark:bg-slate-950 relative">
                        <textarea
                            className="w-full h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white text-xs font-mono focus:border-indigo-500 outline-none resize-none"
                            value={obj.code}
                            onChange={(e) => handleChange("code", e.target.value)}
                            spellCheck={false}
                            autoFocus
                        />
                    </div>
                </MobilePropertyContainer>
            );
        }

        // Special Layout for TEXT EDITING
        if (isEditingText && obj instanceof TextObject) {
            return (
                <MobilePropertyContainer>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm z-10">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">Edit Text</span>
                        <button
                            onClick={() => setIsEditingText(false)}
                            className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-full active:scale-95 transition-transform"
                        >
                            Done
                        </button>
                    </div>
                    <div className="flex-1 p-4 bg-slate-50 dark:bg-slate-950">
                        <textarea
                            ref={textInputRef}
                            className="w-full h-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white text-lg focus:border-indigo-500 outline-none resize-none"
                            value={obj.text}
                            onChange={(e) => handleChange("text", e.target.value)}
                        />
                    </div>
                </MobilePropertyContainer>
            )
        }

        // 2. Object Selected Categories Design
        let categories = [];

        if (obj instanceof TextObject) {
            categories = [
                { id: "keyboard", label: "Edit", icon: <Keyboard size={20} /> }, // Action
            ];
        } else {
            categories = [
                ...(obj instanceof CharacterObject ? [{ id: "character", label: "Character", icon: <User size={20} /> }] : []),
            ];
        }

        return (
            <MobilePropertyContainer>
                {/* Object Header Info */}
                <div className="px-6 py-4 flex items-center justify-between bg-transparent">
                    <span className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                        {obj.name || String((obj as any).type)}
                    </span>
                    <div className="flex items-center gap-1">
                        <button onClick={() => handleDuplicate(obj.id)} className="p-2 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-slate-800 transition-colors"><Copy size={16} /></button>
                        <button onClick={() => { engine.scene.remove(obj.id); engine.render(); setForceUpdate(n => n + 1); }} className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-slate-800 transition-colors"><Trash2 size={16} /></button>
                    </div>
                </div>

                {!externalMobileCategory && (
                    <MobileCategoryStrip
                        categories={categories.filter(c => c.id !== "keyboard")}
                        activeCategory={activeMobileCategory}
                        onSelect={(id) => {
                            setActiveMobileCategory(id);
                        }}
                    >
                        {/* Inject Edit Button for Text Objects */}
                        {obj instanceof TextObject && (
                            <button
                                onClick={() => setIsEditingText(true)}
                                className="flex flex-col items-center gap-1 min-w-[60px] "
                            >
                                <div className={`p-2 rounded-full bg-transparent text-slate-400 hover:text-white transition-colors`}>
                                    <Keyboard size={20} />
                                </div>
                                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Edit</span>
                            </button>
                        )}
                    </MobileCategoryStrip>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-4">




                    {/* Mobile: Character Properties */}
                    {obj instanceof CharacterObject && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-4">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block mb-2">Character</span>
                            <ControlRow label="Animation">
                                <select
                                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg p-3 text-sm outline-none"
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
                                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg p-3 text-sm outline-none"
                                    value={obj.costume}
                                    onChange={(e) => handleChange("costume", e.target.value)}
                                >
                                    <option value="casual">Casual</option>
                                    <option value="suit">Suit</option>
                                    <option value="superhero">Superhero</option>
                                </select>
                            </ControlRow>
                            <ControlRow label="Colors" layout="vertical">
                                <div className="flex gap-4">
                                    <div className="flex flex-col gap-1 items-center">
                                        <span className="text-[9px] text-slate-400">Skin</span>
                                        <ColorPicker value={obj.skinColor} onChange={(v) => handleChange("skinColor", v)} size="sm" />
                                    </div>
                                    <div className="flex flex-col gap-1 items-center">
                                        <span className="text-[9px] text-slate-400">Hair</span>
                                        <ColorPicker value={obj.hairColor} onChange={(v) => handleChange("hairColor", v)} size="sm" />
                                    </div>
                                    <div className="flex flex-col gap-1 items-center">
                                        <span className="text-[9px] text-slate-400">Costume</span>
                                        <ColorPicker value={obj.costumeColor} onChange={(v) => handleChange("costumeColor", v)} size="sm" />
                                    </div>
                                </div>
                            </ControlRow>
                        </div>
                    )}

                    {/* Mobile: CodeBlock Properties */}
                    {obj instanceof CodeBlockObject && (
                        <CodeBlockSettings
                            object={obj}
                            engine={engine}
                            variant="mobile"
                            activeTab={activeMobileCategory}
                            onUpdate={() => setForceUpdate(n => n + 1)}
                        />
                    )}



                    {/* Mobile: ParticleText Properties */}
                    {obj instanceof ParticleTextObject && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-4">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block mb-2">Particle Text</span>
                            <ControlRow label="Animation">
                                <select
                                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg p-3 text-sm outline-none"
                                    value={obj.animType}
                                    onChange={(e) => handleChange("animType", e.target.value)}
                                >
                                    <option value="none">Static</option>
                                    <option value="explode">Explode</option>
                                    <option value="vortex">Vortex</option>
                                </select>
                            </ControlRow>
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase"><span>Gap</span><span>{obj.gap}</span></div>
                                <Slider
                                    value={obj.gap}
                                    min={1} max={10}
                                    onChange={(v) => handleChange("gap", v)}
                                    compact={false}
                                />
                            </div>
                        </div>
                    )}

                    {/* Layering Card */}
                    {!['theme', 'settings'].includes(activeMobileCategory) && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block mb-2">Layering</span>
                            <div className="flex justify-between p-2">
                                <button onClick={() => engine.scene.moveUp(obj.id)} className="flex-1 p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-white flex flex-col items-center gap-1">
                                    <ArrowUp size={20} /> <span className="text-[10px] font-medium">Forward</span>
                                </button>
                                <button onClick={() => engine.scene.moveDown(obj.id)} className="flex-1 p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-white flex flex-col items-center gap-1">
                                    <ArrowDown size={20} /> <span className="text-[10px] font-medium">Backward</span>
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </MobilePropertyContainer >
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">
            {/* Tabs */}
            <div className="flex items-center p-1 mx-4 mt-4 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 shrink-0">
                {(["properties", "layers", "animations"] as Tab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${activeTab === tab
                            ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-20 no-scrollbar space-y-4">
                {activeTab === "properties" && (
                    <>
                        {!obj ? (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <PropertySection title="Canvas Settings" defaultOpen={true}>
                                    <CanvasSettings
                                        engine={engine}
                                        onResize={onResize}
                                        onUpdate={() => setForceUpdate(n => n + 1)}
                                    />
                                </PropertySection>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                {/* Header */}
                                <div className="space-y-1 pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <label className="text-[10px] font-bold uppercase text-slate-400">Layer Name</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={obj.name}
                                            onChange={(e) => { obj.name = e.target.value; setForceUpdate(n => n + 1); }}
                                            className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1 text-xs font-bold border border-transparent focus:border-indigo-500 outline-none"
                                        />
                                        <button onClick={() => handleDuplicate(obj.id)} className="p-1.5 text-slate-400 hover:text-indigo-500 bg-slate-100 dark:bg-slate-800 rounded-lg"><Copy size={14} /></button>
                                        <button onClick={() => { engine.scene.remove(obj.id); engine.render(); setForceUpdate(n => n + 1); }} className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-100 dark:bg-slate-800 rounded-lg"><Trash2 size={14} /></button>
                                    </div>
                                </div>

                                {/* Common Properties */}
                                {/* RESTORED PROPERTIES LOGIC */}
                                {(obj instanceof ParticleTextObject) ? (
                                    <>
                                        <PropertySection title="Text Content">
                                            <textarea
                                                className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg p-2 text-xs border-transparent focus:border-indigo-500 outline-none resize-y min-h-[80px]"
                                                value={obj.text}
                                                onChange={(e) => handleChange("text", e.target.value)}
                                                placeholder="Type your text here..."
                                            />
                                        </PropertySection>
                                        <PropertySection title="Particle Effects">
                                            <ControlRow label="Animation Mode">
                                                <select
                                                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg p-2 text-xs outline-none"
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
                                                <ColorPicker
                                                    value={obj.color}
                                                    onChange={(val) => handleChange("color", val)}
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
                                                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg p-2 text-xs outline-none"
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
                                ) : (obj instanceof CharacterObject) ? (
                                    <PropertySection title="Character">
                                        <ControlRow label="Animation">
                                            <select
                                                className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg p-2 text-xs outline-none"
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
                                                className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg p-2 text-xs outline-none"
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
                                                className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg p-2 text-xs outline-none"
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
                                                className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg p-2 text-xs outline-none"
                                                value={obj.accessory}
                                                onChange={(e) => handleChange("accessory", e.target.value)}
                                            >
                                                <option value="none">None</option>
                                                <option value="glasses">Glasses</option>
                                                <option value="cap">Red Cap</option>
                                            </select>
                                        </ControlRow>

                                        <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />

                                        <ControlRow label="Colors" layout="vertical">
                                            <div className="flex gap-4">
                                                <div className="flex flex-col gap-1 items-center">
                                                    <span className="text-[9px] text-slate-400 uppercase">Skin</span>
                                                    <ColorPicker
                                                        value={obj.skinColor}
                                                        onChange={(val) => handleChange("skinColor", val)}
                                                        size="sm"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1 items-center">
                                                    <span className="text-[9px] text-slate-400 uppercase">Hair</span>
                                                    <ColorPicker
                                                        value={obj.hairColor}
                                                        onChange={(val) => handleChange("hairColor", val)}
                                                        size="sm"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1 items-center">
                                                    <span className="text-[9px] text-slate-400 uppercase">Costume</span>
                                                    <ColorPicker
                                                        value={obj.costumeColor}
                                                        onChange={(val) => handleChange("costumeColor", val)}
                                                        size="sm"
                                                    />
                                                </div>
                                            </div>
                                        </ControlRow>
                                    </PropertySection>
                                ) : (obj instanceof LogoCharacterObject) ? (
                                    <PropertySection title="Logo Settings">
                                        <ControlRow label="Name / Text">
                                            <input
                                                type="text"
                                                className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg p-2 text-xs outline-none"
                                                value={obj.text}
                                                onChange={(e) => handleChange("text", e.target.value)}
                                            />
                                        </ControlRow>
                                        <ControlRow label="Circle Color" layout="horizontal">
                                            <ColorPicker
                                                value={obj.circleColor}
                                                onChange={(val) => handleChange("circleColor", val)}
                                            />
                                        </ControlRow>
                                        <ControlRow label="Text Color" layout="horizontal">
                                            <ColorPicker
                                                value={obj.textColor}
                                                onChange={(val) => handleChange("textColor", val)}
                                            />
                                        </ControlRow>
                                    </PropertySection>
                                ) : (obj instanceof CodeBlockObject) ? (
                                    <CodeBlockSettings
                                        object={obj}
                                        engine={engine}
                                        variant="desktop"
                                        onUpdate={() => setForceUpdate(n => n + 1)}
                                    />
                                ) : (
                                    /* Common Properties Fallback and other types logic merging */
                                    <div className="space-y-4">
                                        <ControlRow label="Position">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1">
                                                    <span className="text-[10px] text-slate-400">X</span>
                                                    <input
                                                        type="number"
                                                        value={Math.round(obj.x)}
                                                        onChange={(e) => handleChange("x", Number(e.target.value))}
                                                        className="w-full bg-transparent text-xs font-mono outline-none"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1">
                                                    <span className="text-[10px] text-slate-400">Y</span>
                                                    <input
                                                        type="number"
                                                        value={Math.round(obj.y)}
                                                        onChange={(e) => handleChange("y", Number(e.target.value))}
                                                        className="w-full bg-transparent text-xs font-mono outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </ControlRow>
                                        <ControlRow label="Dimensions">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1">
                                                    <span className="text-[10px] text-slate-400">W</span>
                                                    <input
                                                        type="number"
                                                        value={Math.round(obj.width)}
                                                        onChange={(e) => {
                                                            const v = Number(e.target.value);
                                                            const oldW = obj.width;
                                                            const ratio = obj.height / oldW;
                                                            handleChange("width", v);
                                                            if (isRatioLocked) handleChange("height", Math.round(v * ratio));
                                                        }}
                                                        className="w-full bg-transparent text-xs font-mono outline-none"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1 flex-1">
                                                    <span className="text-[10px] text-slate-400">H</span>
                                                    <input
                                                        type="number"
                                                        value={Math.round(obj.height)}
                                                        onChange={(e) => handleChange("height", Number(e.target.value))}
                                                        className="w-full bg-transparent text-xs font-mono outline-none"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => { handleChange("width", 200); handleChange("height", 200); }}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
                                                    title="Reset Dimensions"
                                                >
                                                    <RotateCcw size={12} />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2 cursor-pointer" onClick={() => setIsRatioLocked(!isRatioLocked)}>
                                                {isRatioLocked ? <Link2 size={12} className="text-indigo-500" /> : <Unlink2 size={12} className="text-slate-400" />}
                                                <span className="text-[10px] text-slate-500 select-none">Constrain Proportions</span>
                                            </div>
                                        </ControlRow>
                                        <ControlRow label="Rotation">
                                            <div className="flex items-center gap-2">
                                                <Slider
                                                    value={Math.round(obj.rotation || 0)}
                                                    min={-180} max={180}
                                                    onChange={(v) => handleChange("rotation", v)}
                                                />
                                                <button
                                                    onClick={() => handleChange("rotation", 0)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
                                                    title="Reset Rotation"
                                                >
                                                    <RotateCcw size={12} />
                                                </button>
                                            </div>
                                        </ControlRow>
                                        <ControlRow label="Opacity">
                                            <Slider
                                                value={obj.opacity ?? 1}
                                                min={0} max={1} step={0.01}
                                                onChange={(v) => handleChange("opacity", v)}
                                            />
                                        </ControlRow>

                                        {/* Text Object Specific */}
                                        {obj instanceof TextObject && (
                                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                                <TextSettings
                                                    object={obj}
                                                    engine={engine}
                                                    variant="desktop"
                                                    section="all"
                                                    onUpdate={() => setForceUpdate(n => n + 1)}
                                                />
                                            </div>
                                        )}

                                        {/* Chart Object Specific */}
                                        {obj instanceof ChartObject && (
                                            <ChartSettings
                                                object={obj}
                                                engine={engine}
                                                onUpdate={() => setForceUpdate(n => n + 1)}
                                            />
                                        )}

                                        {/* BarChartRace Specific */}
                                        {obj instanceof BarChartRaceObject && (
                                            <BarChartRaceSettings
                                                object={obj}
                                                engine={engine}
                                                onUpdate={() => setForceUpdate(n => n + 1)}
                                            />
                                        )}

                                        {/* Generic Color for generic objects */}
                                        {'color' in obj && !(obj instanceof TextObject) && !(obj instanceof ChartObject) && !(obj instanceof ParticleTextObject) && (
                                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                                <ControlRow label="Color">
                                                    <ColorPicker value={(obj as any).color} onChange={(v) => handleChange("color", v)} />
                                                </ControlRow>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                        }
                    </>
                )}

                {
                    activeTab === "layers" && (
                        <LayersPanel engine={engine} selectedId={selectedId} />
                    )
                }

                {
                    activeTab === "animations" && (
                        <div className="p-4 space-y-4">
                            {!obj ? (
                                <div className="text-center py-8">
                                    <div className="inline-flex p-3 rounded-full bg-slate-100 dark:bg-slate-800 mb-3 text-slate-400">
                                        <Sparkles size={24} />
                                    </div>
                                    <p className="text-xs text-slate-500">Select an object to add animations.</p>
                                </div>
                            ) : (
                                <>
                                    <PropertySection title="Entrance Animation">
                                        <IconGrid
                                            value={(obj as any).enterAnimation || "none"}
                                            onChange={(v) => handleChange("enterAnimation", v)}
                                            cols={3}
                                            options={[
                                                { value: "none", label: "None", icon: <X size={16} /> },
                                                { value: "fade_in", label: "Fade In", icon: <Sparkles size={16} /> },
                                                { value: "scale_in", label: "Scale In", icon: <Maximize2 size={16} /> },
                                                { value: "slide_in_left", label: "Slide Left", icon: <ArrowLeft size={16} /> },
                                                { value: "slide_in_right", label: "Slide Right", icon: <ArrowRight size={16} /> },
                                                { value: "typewriter", label: "Typewriter", icon: <Keyboard size={16} /> },
                                            ]}
                                        />
                                        {(obj as any).enterAnimation && (obj as any).enterAnimation !== "none" && (
                                            <ControlRow label="Duration">
                                                <SliderInput
                                                    value={(obj as any).enterDuration || 1000}
                                                    min={100} max={5000} step={100}
                                                    onChange={(v) => handleChange("enterDuration", v)}
                                                    formatValue={(v) => `${(v / 1000).toFixed(1)}s`}
                                                />
                                            </ControlRow>
                                        )}
                                    </PropertySection>

                                    <PropertySection title="Exit Animation">
                                        <IconGrid
                                            value={(obj as any).exitAnimation || "none"}
                                            onChange={(v) => handleChange("exitAnimation", v)}
                                            cols={3}
                                            options={[
                                                { value: "none", label: "None", icon: <X size={16} /> },
                                                { value: "fade_out", label: "Fade Out", icon: <Sparkles size={16} /> },
                                                { value: "scale_out", label: "Scale Out", icon: <Maximize2 size={16} /> },
                                                { value: "slide_out_left", label: "Slide Left", icon: <ArrowLeft size={16} /> },
                                                { value: "slide_out_right", label: "Slide Right", icon: <ArrowRight size={16} /> },
                                            ]}
                                        />
                                        {(obj as any).exitAnimation && (obj as any).exitAnimation !== "none" && (
                                            <ControlRow label="Duration">
                                                <SliderInput
                                                    value={(obj as any).exitDuration || 1000}
                                                    min={100} max={5000} step={100}
                                                    onChange={(v) => handleChange("exitDuration", v)}
                                                    formatValue={(v) => `${(v / 1000).toFixed(1)}s`}
                                                />
                                            </ControlRow>
                                        )}
                                    </PropertySection>
                                </>
                            )}
                        </div>
                    )
                }
            </div >
        </div >
    );
};
