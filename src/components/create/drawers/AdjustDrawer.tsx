import React, { useState, useEffect } from "react";
import { Engine } from "../../../engine/Core";
import { Slider } from "../ui/InspectorUI";
import { BottomSheet } from "../panels/BottomSheet";
import { MoveHorizontal, MoveVertical, RotateCw, RotateCcw } from "lucide-react";

interface AdjustDrawerProps {
    engine: Engine | null;
    selectedId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

type AdjustProperty = 'width' | 'height' | 'rotation';

export const AdjustDrawer: React.FC<AdjustDrawerProps> = ({ engine, selectedId, isOpen, onClose }) => {
    const [forceUpdate, setForceUpdate] = useState(0);
    const [activeProperty, setActiveProperty] = useState<AdjustProperty>('width');

    const obj = selectedId && engine ? engine.scene.get(selectedId) : null;

    useEffect(() => {
        if (isOpen) {
            // Reset to width on open if needed, or keep last state
            // setActiveProperty('width');
        }
    }, [isOpen]);

    if (!isOpen || !obj) return null;

    const handleChange = (key: string, value: any) => {
        (obj as any)[key] = value;
        engine?.render();
        setForceUpdate(n => n + 1);
    };

    const properties = [
        { id: 'width', label: 'Width', icon: MoveHorizontal, min: 10, max: 1920, unit: 'px' },
        { id: 'height', label: 'Height', icon: MoveVertical, min: 10, max: 1080, unit: 'px' },
        { id: 'rotation', label: 'Rotation', icon: RotateCw, min: -180, max: 180, unit: '°' },
    ];

    const activeConfig = properties.find(p => p.id === activeProperty) || properties[0];
    const currentValue = activeProperty === 'rotation'
        ? (obj.rotation || 0)
        : (obj as any)[activeProperty];

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title="Adjust"
            variant="dock"
        >
            <div className="flex flex-col gap-4 p-4 min-h-[140px]">

                {/* TOP: Dynamic Slider Area */}
                <div className="flex flex-col gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                            <activeConfig.icon size={14} />
                            <span>{activeConfig.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-slate-900 dark:text-white">
                                {Math.round(currentValue)}{activeConfig.unit}
                            </span>
                            <button
                                onClick={() => {
                                    const defaults: Record<string, number> = { width: 200, height: 200, rotation: 0 };
                                    handleChange(activeProperty, defaults[activeProperty]);
                                }}
                                className="p-1 rounded-full text-slate-400 hover:text-indigo-600 dark:hover:text-white bg-slate-200 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-colors"
                            >
                                <RotateCcw size={12} />
                            </button>
                        </div>
                    </div>
                    <div className="py-2">
                        <Slider
                            value={Math.round(currentValue)}
                            min={activeConfig.min}
                            max={activeConfig.max}
                            onChange={(v) => handleChange(activeProperty, v)}
                            compact={false}
                        />
                    </div>
                </div>

                {/* BOTTOM: Property Selector (Horizontal Scroll) */}
                <div className="flex overflow-x-auto gap-2 no-scrollbar items-center pb-2">
                    {properties.map((prop) => (
                        <button
                            key={prop.id}
                            onClick={() => setActiveProperty(prop.id as AdjustProperty)}
                            className={`flex flex-col items-center justify-center gap-1 min-w-[72px] h-[72px] rounded-xl border transition-all shrink-0 ${activeProperty === prop.id
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-md scale-105"
                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                                }`}
                        >
                            <prop.icon size={22} strokeWidth={2} />
                            <span className="text-[10px] font-bold">{prop.label}</span>
                        </button>
                    ))}

                    {/* Spacer */}
                    <div className="w-2 shrink-0" />
                </div>

            </div>
        </BottomSheet>
    );
};
