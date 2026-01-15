import React, { useState, useEffect } from "react";
import { BottomSheet } from "../panels/BottomSheet";
import { Engine } from "../../../engine/Core";
import { ChartObject } from "../../../engine/objects/ChartObject";
import { BarChartRaceObject } from "../../../engine/objects/BarChartRaceObject";
import { Slider, Toggle, ColorPicker } from "../ui/InspectorUI";
import { BarChart3, LineChart, PieChart, Circle } from "lucide-react";

interface DataDrawerProps {
    engine: Engine | null;
    selectedId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export const DataDrawer: React.FC<DataDrawerProps> = ({ engine, selectedId, isOpen, onClose }) => {
    const [forceUpdate, setForceUpdate] = useState(0);

    const selectedObject = (engine && selectedId) ? engine.scene.get(selectedId) : null;
    const isValidObject = selectedObject instanceof ChartObject || selectedObject instanceof BarChartRaceObject;

    useEffect(() => {
        if (!engine) return;
        const onObjChange = () => setForceUpdate(n => n + 1);
        // Subscribe if needed
    }, [engine, selectedId]);

    const handleChange = (key: string, value: any) => {
        if (!selectedObject || !engine) return;
        (selectedObject as any)[key] = value;
        engine.render();
        setForceUpdate(n => n + 1);
    };

    if (!isValidObject || !engine) return null;

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title={selectedObject instanceof BarChartRaceObject ? "Race Config" : "Chart Config"}
            variant="dock"
        >
            <div className="flex overflow-x-auto gap-4 p-4 no-scrollbar items-center min-h-[100px]">

                {/* CHART OBJECT CONTROLS */}
                {selectedObject instanceof ChartObject && (
                    <>
                        {/* Chart Type Selector */}
                        <div className="flex gap-2 shrink-0 border-r border-slate-200 dark:border-app-border pr-4 mr-2">
                            {[
                                { id: 'bar', icon: BarChart3, label: 'Bar' },
                                { id: 'line', icon: LineChart, label: 'Line' },
                                { id: 'pie', icon: PieChart, label: 'Pie' },
                                { id: 'donut', icon: Circle, label: 'Donut' }
                            ].map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => handleChange("chartType", type.id)}
                                    className={`flex flex-col items-center justify-center gap-1 min-w-[64px] h-[64px] rounded-xl border transition-all ${selectedObject.chartType === type.id
                                        ? "bg-indigo-50 dark:bg-indigo-500/20 border-indigo-500 text-indigo-600 dark:text-indigo-300 scale-105 shadow-sm"
                                        : "bg-white dark:bg-app-surface border-slate-200 dark:border-app-border text-slate-400 hover:bg-slate-50 dark:hover:bg-app-surface-hover"
                                        }`}
                                >
                                    <type.icon size={20} strokeWidth={2} />
                                    <span className="text-[10px] font-medium">{type.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Donut Radius */}
                        {selectedObject.chartType === 'donut' && (
                            <div className="flex flex-col gap-1 min-w-[120px] shrink-0">
                                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                                    <span>Hole</span>
                                    <span>{Math.round(selectedObject.innerRadius * 100)}%</span>
                                </div>
                                <Slider
                                    value={Math.round(selectedObject.innerRadius * 100)}
                                    min={10} max={90}
                                    onChange={(v) => handleChange("innerRadius", v / 100)}
                                    compact
                                />
                            </div>
                        )}

                        {/* Show Grid Toggle */}
                        <button
                            onClick={() => handleChange("showGrid", !selectedObject.showGrid)}
                            className={`flex flex-col items-center justify-center gap-1 min-w-[64px] h-[64px] rounded-xl border transition-all shrink-0 ${selectedObject.showGrid
                                ? "bg-indigo-50 dark:bg-indigo-500/20 border-indigo-500 text-indigo-600 dark:text-indigo-300"
                                : "bg-white dark:bg-app-surface border-slate-200 dark:border-app-border text-slate-400"
                                }`}
                        >
                            <span className="font-bold text-xs">GUIDES</span>
                            <span className="text-[10px]">{selectedObject.showGrid ? "ON" : "OFF"}</span>
                        </button>

                        {/* Multi-Color Toggle */}
                        <div className="flex flex-col gap-1 min-w-[64px] shrink-0 items-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Multi</span>
                            <Toggle
                                value={selectedObject.useMultiColor}
                                onChange={(v) => handleChange("useMultiColor", v)}
                            />
                        </div>

                        {/* Color Picker (Simplified) */}
                        <div className="shrink-0">
                            <ColorPicker
                                value={selectedObject.color}
                                onChange={(v) => handleChange("color", v)}
                            />
                        </div>
                    </>
                )}

                {/* BAR CHART RACE CONTROLS */}
                {selectedObject instanceof BarChartRaceObject && (
                    <>
                        <div className="flex flex-col gap-1 min-w-[140px] shrink-0">
                            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                                <span>Duration</span>
                                <span>{(selectedObject.duration / 1000).toFixed(1)}s</span>
                            </div>
                            <Slider
                                value={selectedObject.duration}
                                min={1000} max={30000} step={500}
                                onChange={(v) => handleChange("duration", v)}
                                compact
                            />
                        </div>

                        <div className="flex flex-col gap-1 min-w-[120px] shrink-0">
                            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                                <span>Height</span>
                                <span>{selectedObject.barHeight}px</span>
                            </div>
                            <Slider
                                value={selectedObject.barHeight}
                                min={20} max={100}
                                onChange={(v) => handleChange("barHeight", v)}
                                compact
                            />
                        </div>

                        <div className="flex flex-col gap-1 min-w-[120px] shrink-0">
                            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                                <span>Gap</span>
                                <span>{selectedObject.gap}px</span>
                            </div>
                            <Slider
                                value={selectedObject.gap}
                                min={0} max={50}
                                onChange={(v) => handleChange("gap", v)}
                                compact
                            />
                        </div>
                    </>
                )}

                {/* Spacer */}
                <div className="w-4 shrink-0" />
            </div>
        </BottomSheet>
    );
};
