import React, { useState } from "react";
import { Engine } from "../../engine/Core";
import { Slider } from "./InspectorUI";

interface AdjustDrawerProps {
    engine: Engine | null;
    selectedId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export const AdjustDrawer: React.FC<AdjustDrawerProps> = ({ engine, selectedId, isOpen, onClose }) => {
    const [forceUpdate, setForceUpdate] = useState(0);

    const obj = selectedId && engine ? engine.scene.get(selectedId) : null;

    if (!isOpen || !obj) return null;

    const handleChange = (key: string, value: any) => {
        (obj as any)[key] = value;

        // Handle ratio lock for simple resize
        if (key === 'width') {
            // Assuming a simple resizing logic for now where we might want to keep aspect ratio
            // But for the drawer we just expose raw width/rotation as requested
        }

        engine?.render();
        setForceUpdate(n => n + 1);
    };

    return (
        <div className="fixed bottom-16 left-0 right-0 z-[90] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-full duration-300 shadow-xl pb-safe">
            <div className="p-6 space-y-6">
                {/* Width Slider */}
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                        <span>Width</span>
                        <span>{Math.round(obj.width)}</span>
                    </div>
                    <Slider
                        value={Math.round(obj.width)}
                        min={10} max={1000}
                        onChange={(v) => handleChange("width", v)}
                        compact={false}
                    />
                </div>

                {/* Height Slider */}
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                        <span>Height</span>
                        <span>{Math.round(obj.height)}</span>
                    </div>
                    <Slider
                        value={Math.round(obj.height)}
                        min={10} max={1000}
                        onChange={(v) => handleChange("height", v)}
                        compact={false}
                    />
                </div>

                {/* Rotation Slider */}
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                        <span>Rotation</span>
                        <span>{Math.round(obj.rotation || 0)}°</span>
                    </div>
                    <Slider
                        value={Math.round(obj.rotation || 0)}
                        min={-180} max={180}
                        onChange={(v) => handleChange("rotation", v)}
                        compact={false}
                    />
                </div>
            </div>
        </div>
    );
};
