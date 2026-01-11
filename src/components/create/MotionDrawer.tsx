import React, { useEffect, useState } from "react";
import { Engine } from "../../engine/Core";
import { Ban, Zap, ArrowUp, Maximize, Keyboard } from "lucide-react";
import { TextObject } from "../../engine/objects/TextObject";
import { Slider } from "./InspectorUI";

interface MotionDrawerProps {
    engine: Engine | null;
    selectedId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export const MotionDrawer: React.FC<MotionDrawerProps> = ({ engine, selectedId, isOpen, onClose }) => {
    const [forceUpdate, setForceUpdate] = useState(0);

    const obj = selectedId && engine ? engine.scene.get(selectedId) : null;

    useEffect(() => {
        if (!isOpen) return;
        // Subscribe to updates if needed, mostly handled by parent re-renders or local forceUpdate
    }, [isOpen, selectedId]);

    if (!isOpen || !obj) return null;

    // Helper to update animation
    const updateAnim = (updates: Partial<any>) => {
        if (!obj || !engine) return;

        // Ensure animation object exists
        if (!obj.animation) obj.animation = { type: 'none', duration: 1000, delay: 0 };

        Object.assign(obj.animation, updates);
        engine.render();
        setForceUpdate(n => n + 1);
    };

    const animations = [
        { id: 'none', label: 'None', icon: Ban },
        { id: 'fadeIn', label: 'Fade In', icon: Zap },
        { id: 'slideUp', label: 'Slide Up', icon: ArrowUp },
        { id: 'scaleIn', label: 'Pop In', icon: Maximize },
        { id: 'typewriter', label: 'Typewriter', icon: Keyboard },
    ];

    // Filter animations: Typewriter only for TextObject
    const availableAnimations = (obj instanceof TextObject)
        ? animations
        : animations.filter(a => a.id !== 'typewriter');

    return (
        <div className="fixed bottom-16 left-0 right-0 z-[90] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-full duration-300 shadow-xl pb-safe">

            {/* Timing Controls (Only if animation active) */}
            {obj.animation?.type && obj.animation.type !== 'none' && (
                <div className="px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800/50">
                    <div className="flex gap-8">
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                                <span>Duration</span>
                                <span>{(obj.animation.duration || 1000) / 1000}s</span>
                            </div>
                            <Slider
                                value={obj.animation.duration || 1000}
                                min={100} max={3000}
                                onChange={(v) => updateAnim({ duration: v })}
                                compact
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                                <span>Delay</span>
                                <span>{(obj.animation.delay || 0) / 1000}s</span>
                            </div>
                            <Slider
                                value={obj.animation.delay || 0}
                                min={0} max={2000}
                                onChange={(v) => updateAnim({ delay: v })}
                                compact
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Horizontal Presets */}
            <div className="flex overflow-x-auto gap-4 p-4 no-scrollbar items-center">
                {availableAnimations.map((anim) => {
                    const isActive = obj.animation?.type === anim.id || (!obj.animation?.type && anim.id === 'none');
                    return (
                        <button
                            key={anim.id}
                            onClick={() => updateAnim({ type: anim.id })}
                            className={`flex flex-col items-center justify-center gap-2 min-w-[72px] h-[72px] rounded-2xl border transition-all shrink-0 ${isActive
                                ? "bg-indigo-50 dark:bg-indigo-500/20 border-indigo-500 text-indigo-600 dark:text-indigo-300 scale-105 shadow-sm"
                                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                                }`}
                        >
                            <anim.icon size={24} strokeWidth={1.5} />
                            <span className="text-[10px] font-medium">{anim.label}</span>
                        </button>
                    );
                })}

                {/* Spacer for right padding */}
                <div className="w-2 shrink-0" />
            </div>
        </div>
    );
};
