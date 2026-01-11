import React, { useState } from "react";
import { Engine } from "../../engine/Core";
import { TextObject } from "../../engine/objects/TextObject";
import { Slider } from "./InspectorUI";

interface FontDrawerProps {
    engine: Engine | null;
    selectedId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

const FONTS = ["Inter", "Arial", "Impact", "Times New Roman", "Courier New", "Georgia", "Verdana"];

export const FontDrawer: React.FC<FontDrawerProps> = ({ engine, selectedId, isOpen, onClose }) => {
    const [forceUpdate, setForceUpdate] = useState(0);

    const obj = selectedId && engine ? engine.scene.get(selectedId) : null;

    if (!isOpen || !obj || !(obj instanceof TextObject)) return null;

    const handleChange = (key: string, value: any) => {
        (obj as any)[key] = value;
        engine?.render();
        setForceUpdate(n => n + 1);
    };

    return (
        <div className="fixed bottom-16 left-0 right-0 z-[90] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-full duration-300 shadow-xl pb-safe">
            <div className="p-6 space-y-6">

                {/* Font Size Slider */}
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                        <span>Size</span>
                        <span>{obj.fontSize}px</span>
                    </div>
                    <Slider
                        value={obj.fontSize || 40}
                        min={10} max={300}
                        onChange={(v) => handleChange("fontSize", v)}
                        compact={false}
                    />
                </div>

                {/* Font Family List */}
                <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Font Family</span>
                    <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                        {FONTS.map(font => (
                            <button
                                key={font}
                                onClick={() => handleChange("fontFamily", font)}
                                className={`flex items-center justify-center px-6 py-4 rounded-xl border transition-all shrink-0 min-w-[100px] ${obj.fontFamily === font
                                        ? "bg-indigo-50 dark:bg-indigo-500/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm"
                                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                    }`}
                            >
                                <span className="text-lg" style={{ fontFamily: font }}>Aa</span>
                                <span className="text-xs ml-2 font-medium">{font}</span>
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};
