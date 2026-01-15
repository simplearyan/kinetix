import React, { useState } from "react";
import { BottomSheet } from "../panels/BottomSheet";
import { Engine } from "../../../engine/Core";
import { ChartObject } from "../../../engine/objects/ChartObject";
import { ColorPicker, ControlRow, Slider } from "../ui/InspectorUI";
import { Type, Droplets, AlignCenter, LayoutTemplate } from "lucide-react";

interface ChartStyleDrawerProps {
    engine: Engine | null;
    selectedId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

const FONTS = [
    { name: 'Inter', label: 'Inter' },
    { name: 'Roboto', label: 'Roboto' },
    { name: 'Lora', label: 'Lora' },
    { name: 'Montserrat', label: 'Mont.' },
    { name: 'Playfair Display', label: 'Playfair' },
    { name: 'Oswald', label: 'Oswald' },
];

export const ChartStyleDrawer: React.FC<ChartStyleDrawerProps> = ({ engine, selectedId, isOpen, onClose }) => {
    // Only 'font' and 'visuals' tabs now. Axis merged into Visuals.
    const [activeSubTab, setActiveSubTab] = useState<'font' | 'visuals'>('font');
    const [forceUpdate, setForceUpdate] = useState(0);

    const selectedObject = (engine && selectedId) ? engine.scene.get(selectedId) : null;
    const isChart = selectedObject instanceof ChartObject;

    const handleChange = (key: string, value: any) => {
        if (!isChart || !engine) return;
        (selectedObject as any)[key] = value;
        engine.render();
        setForceUpdate(n => n + 1);
    };

    if (!isChart || !engine) return null;

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title={undefined}
            variant="dock"
        >
            {/* Main Container */}
            <div className="flex flex-col w-full max-h-[50vh] relative bg-slate-50 dark:bg-app-bg/50">

                {/* Content Area - Scrollable with extra padding at bottom */}
                <div className="flex-1 overflow-y-auto pb-16 no-scrollbar">

                    {/* --- FONT TAB CONTENT --- */}
                    {activeSubTab === 'font' && (
                        <div className="p-4 space-y-6">

                            {/* Horizontal Font List (Sleek Style) */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Typeface</label>
                                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1 -mx-1 snap-x">
                                    {FONTS.map(font => (
                                        <button
                                            key={font.name}
                                            onClick={() => handleChange('fontFamily', font.name)}
                                            className={`flex items-center justify-center px-4 py-3 rounded-xl border transition-all shrink-0 min-w-[90px] snap-start ${selectedObject.fontFamily === font.name
                                                ? "bg-indigo-50 dark:bg-indigo-500/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm"
                                                : "bg-white dark:bg-app-surface border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-app-surface-hover"
                                                }`}
                                        >
                                            <span
                                                className="text-base"
                                                style={{ fontFamily: font.name }}
                                            >
                                                Aa
                                            </span>
                                            <span className="text-xs ml-2 font-medium truncate">{font.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Size & Grid Color (Axis Color) - Merged Row */}
                            <div className="flex items-center gap-4 bg-white dark:bg-app-surface p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Size</span>
                                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{selectedObject.fontSize}px</span>
                                    </div>
                                    <Slider
                                        value={selectedObject.fontSize}
                                        min={8} max={72}
                                        onChange={(v) => handleChange('fontSize', v)}
                                    />
                                </div>
                                <div className="shrink-0 flex flex-col items-center gap-1 pl-4 border-l border-slate-100 dark:border-white/10">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Grid</span>
                                    <ColorPicker
                                        value={selectedObject.axisColor}
                                        onChange={(c) => handleChange('axisColor', c)}
                                    />
                                </div>
                            </div>

                        </div>
                    )}

                    {/* --- VISUALS TAB CONTENT --- */}
                    {activeSubTab === 'visuals' && (
                        <div className="p-4 space-y-4">

                            {/* Label Position */}
                            <div className="bg-white dark:bg-app-surface p-1 rounded-xl w-full border border-slate-100 dark:border-white/5 flex gap-1">
                                {[
                                    { id: 'axis', label: 'Axis', icon: LayoutTemplate },
                                    { id: 'top', label: 'Top', icon: AlignCenter },
                                    { id: 'center', label: 'Center', icon: AlignCenter }
                                ].map(pos => (
                                    <button
                                        key={pos.id}
                                        onClick={() => handleChange('labelPosition', pos.id)}
                                        className={`flex-1 py-3 flex items-center justify-center gap-2 text-xs font-bold rounded-lg capitalize transition-all ${selectedObject.labelPosition === pos.id
                                            ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 shadow-sm"
                                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                                            }`}
                                    >
                                        <pos.icon size={14} />
                                        <span>{pos.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Opacity */}
                            <div className="bg-white dark:bg-app-surface p-4 rounded-2xl border border-slate-100 dark:border-white/5 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Opacity</span>
                                    <span className="text-xs font-mono bg-slate-100 dark:bg-app-bg px-2 py-1 rounded">{Math.round(selectedObject.opacity * 100)}%</span>
                                </div>
                                <Slider
                                    value={Math.round(selectedObject.opacity * 100)}
                                    min={0} max={100}
                                    onChange={(v) => handleChange('opacity', v / 100)}
                                />
                            </div>

                            {/* Chart Color (Standalone, Sleek) */}
                            <div className="bg-white dark:bg-app-surface p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase">Primary Color</span>
                                <ColorPicker
                                    value={selectedObject.color}
                                    onChange={(c) => handleChange('color', c)}
                                />
                            </div>

                        </div>
                    )}

                </div>

                {/* BOTTOM NAVIGATION (Minimalist Floating) */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center z-50 pointer-events-none">
                    <div className="flex items-center gap-12 pointer-events-auto">
                        <button
                            onClick={() => setActiveSubTab('font')}
                            className={`flex flex-col items-center gap-1 transition-all relative ${activeSubTab === 'font'
                                ? 'text-yellow-500 dark:text-yellow-400 scale-110'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                }`}
                        >
                            <Type size={22} strokeWidth={activeSubTab === 'font' ? 2.5 : 2} />
                            {activeSubTab === 'font' && <div className="w-1 h-1 rounded-full bg-yellow-500 dark:bg-yellow-400 absolute -bottom-2" />}
                        </button>
                        <button
                            onClick={() => setActiveSubTab('visuals')}
                            className={`flex flex-col items-center gap-1 transition-all relative ${activeSubTab === 'visuals'
                                ? 'text-yellow-500 dark:text-yellow-400 scale-110'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                }`}
                        >
                            <Droplets size={22} strokeWidth={activeSubTab === 'visuals' ? 2.5 : 2} />
                            {activeSubTab === 'visuals' && <div className="w-1 h-1 rounded-full bg-yellow-500 dark:bg-yellow-400 absolute -bottom-2" />}
                        </button>
                    </div>
                </div>

            </div>
        </BottomSheet>
    );
};
