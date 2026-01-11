import React, { useState } from "react";
import { Engine } from "../../engine/Core";
import { CodeBlockObject } from "../../engine/objects/CodeBlockObject";
import { Toggle, Slider, ControlRow } from "./InspectorUI";

interface SettingsDrawerProps {
    engine: Engine | null;
    selectedId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ engine, selectedId, isOpen, onClose }) => {
    const [forceUpdate, setForceUpdate] = useState(0);

    const obj = selectedId && engine ? engine.scene.get(selectedId) : null;

    if (!isOpen || !obj) return null;

    const handleChange = (key: string, value: any) => {
        (obj as any)[key] = value;
        engine?.render();
        setForceUpdate(n => n + 1);
    };

    // Render content based on object type
    const renderContent = () => {
        if (obj instanceof CodeBlockObject) {
            return (
                <div className="space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-4">
                        <ControlRow label="Options" layout="vertical">
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <Toggle
                                        value={obj.syntaxHighlighting}
                                        onChange={(v) => handleChange("syntaxHighlighting", v)}
                                    />
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Syntax Highlighting</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Toggle
                                        value={obj.showLineNumbers !== false}
                                        onChange={(v) => handleChange("showLineNumbers", v)}
                                    />
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Line Numbers</span>
                                </div>
                            </div>
                        </ControlRow>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                            <span>Internal Padding</span>
                            <span>{obj.padding || 0}px</span>
                        </div>
                        <Slider
                            value={obj.padding || 0}
                            min={0} max={100}
                            onChange={(v) => handleChange("padding", v)}
                            compact={false}
                        />
                    </div>
                </div>
            );
        }

        // Default or other objects can be added here
        return <div className="text-center text-slate-400 text-sm py-4">No settings available for this object</div>;
    };

    return (
        <div className="fixed bottom-16 left-0 right-0 z-[90] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-full duration-300 shadow-xl pb-safe">
            <div className="p-6">
                {renderContent()}
            </div>
        </div>
    );
};
