import React, { useState, useEffect } from "react";
import { BottomSheet } from "../panels/BottomSheet";
import { Engine } from "../../../engine/Core";
import { ChartObject } from "../../../engine/objects/ChartObject";
import { ColorPicker } from "../ui/InspectorUI";
import { Plus, Trash2 } from "lucide-react";

interface ChartDataDrawerProps {
    engine: Engine | null;
    selectedId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export const ChartDataDrawer: React.FC<ChartDataDrawerProps> = ({ engine, selectedId, isOpen, onClose }) => {
    const [forceUpdate, setForceUpdate] = useState(0);

    const selectedObject = (engine && selectedId) ? engine.scene.get(selectedId) : null;
    const isChart = selectedObject instanceof ChartObject;

    useEffect(() => {
        if (!engine) return;
        const onObjChange = () => setForceUpdate(n => n + 1);
        // Subscribe logic would go here if engine exposed granular events, 
        // effectively we rely on parent re-renders or manual force updates
    }, [engine, selectedId]);

    const handleChange = (index: number, key: 'label' | 'value' | 'color', value: any) => {
        if (!isChart || !engine) return;

        if (key === 'label') {
            const newLabels = [...selectedObject.labels];
            newLabels[index] = value;
            selectedObject.labels = newLabels;
        } else if (key === 'value') {
            const newData = [...selectedObject.data];
            newData[index] = parseFloat(value) || 0;
            selectedObject.data = newData;
        } else if (key === 'color') {
            const newColors = [...(selectedObject.customColors || [])];
            newColors[index] = value;
            selectedObject.customColors = newColors;
        }

        engine.render();
        setForceUpdate(n => n + 1);
    };

    const handleAdd = () => {
        if (!isChart || !engine) return;
        selectedObject.labels.push("New");
        selectedObject.data.push(10);
        // Ensure custom colors array matches length if used
        if (selectedObject.customColors.length < selectedObject.data.length) {
            // No op, undefined will fall back to palette
        }
        engine.render();
        setForceUpdate(n => n + 1);
    }

    const handleRemove = (index: number) => {
        if (!isChart || !engine) return;
        selectedObject.labels.splice(index, 1);
        selectedObject.data.splice(index, 1);
        selectedObject.customColors.splice(index, 1);
        engine.render();
        setForceUpdate(n => n + 1);
    }

    if (!isChart || !engine) return null;

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Data"
            variant="dock"
        >
            <div className="flex flex-col p-4 pb-24 space-y-3">

                {/* Header Row */}
                <div className="flex px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <div className="w-8 shrink-0 text-center">Clr</div>
                    <div className="flex-1 px-2">Label</div>
                    <div className="w-20 text-right pr-4">Value</div>
                    <div className="w-8"></div>
                </div>

                {/* Data Rows */}
                {selectedObject.data.map((val, i) => (
                    <div key={i} className="flex items-center bg-slate-50 dark:bg-app-bg p-2 rounded-xl border border-slate-100 dark:border-app-border">
                        {/* Color */}
                        <div className="w-8 shrink-0 flex justify-center">
                            <ColorPicker
                                value={selectedObject.customColors[i] || (selectedObject.useMultiColor ? selectedObject.colorPalette[i % selectedObject.colorPalette.length] : selectedObject.color)}
                                onChange={(c) => handleChange(i, 'color', c)}
                                size="sm"
                            />
                        </div>

                        {/* Label */}
                        <div className="flex-1 px-2">
                            <input
                                type="text"
                                className="w-full bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-300"
                                value={selectedObject.labels[i] || ""}
                                onChange={(e) => handleChange(i, 'label', e.target.value)}
                                placeholder="Label"
                            />
                        </div>

                        {/* Value */}
                        <div className="w-20 shrink-0">
                            <input
                                type="number"
                                className="w-full bg-transparent text-sm font-bold text-right text-slate-900 dark:text-white outline-none"
                                value={val}
                                onChange={(e) => handleChange(i, 'value', e.target.value)}
                            />
                        </div>

                        {/* Delete */}
                        <button
                            onClick={() => handleRemove(i)}
                            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}

                {/* Add Button */}
                <button
                    onClick={handleAdd}
                    className="flex items-center justify-center gap-2 w-full py-3 mt-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-app-border text-slate-400 hover:text-indigo-500 hover:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all text-xs font-bold uppercase tracking-wider"
                >
                    <Plus size={16} />
                    Add Data Point
                </button>

            </div>
        </BottomSheet>
    );
};
