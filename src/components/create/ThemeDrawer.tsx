import React, { useEffect, useState } from "react";
import { Engine } from "../../engine/Core";
import { CodeBlockObject } from "../../engine/objects/CodeBlockObject";
import { Check, Palette } from "lucide-react";
import { Slider } from "./InspectorUI";

interface ThemeDrawerProps {
    engine: Engine | null;
    selectedId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

const THEMES = [
    { id: 'vscode-dark', label: 'VS Code Dark', color: '#1E1E1E', textColor: '#D4D4D4' },
    { id: 'light', label: 'Light', color: '#FFFFFF', textColor: '#000000', border: true },
    { id: 'monokai', label: 'Monokai', color: '#272822', textColor: '#F8F8F2' },
    { id: 'github-dark', label: 'GitHub Dark', color: '#24292e', textColor: '#e1e4e8' },
    { id: 'dracula', label: 'Dracula', color: '#282a36', textColor: '#f8f8f2' },
];

export const ThemeDrawer: React.FC<ThemeDrawerProps> = ({ engine, selectedId, isOpen, onClose }) => {
    const [forceUpdate, setForceUpdate] = useState(0);

    const obj = selectedId && engine ? engine.scene.get(selectedId) : null;
    const isCodeBlock = obj instanceof CodeBlockObject;

    if (!isOpen || !isCodeBlock) return null;

    const currentTheme = (obj as CodeBlockObject).theme || 'vscode-dark';

    const handleThemeChange = (themeId: string) => {
        if (!engine) return;
        (obj as CodeBlockObject).theme = themeId as any;
        engine.render();
        setForceUpdate(n => n + 1);
    };

    const handleFontSizeChange = (size: number) => {
        if (!engine) return;
        (obj as CodeBlockObject).fontSize = size;
        engine.render();
        setForceUpdate(n => n + 1);
    }

    return (
        <div className="fixed bottom-16 left-0 right-0 z-[90] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-full duration-300 shadow-xl pb-safe">

            {/* Font Size Slider */}
            <div className="px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800/50">
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                        <span>Font Size</span>
                        <span>{(obj as CodeBlockObject).fontSize}px</span>
                    </div>
                    <Slider
                        value={(obj as CodeBlockObject).fontSize}
                        min={8} max={100}
                        onChange={handleFontSizeChange}
                        compact
                    />
                </div>
            </div>

            {/* Horizontal Themes */}
            <div className="flex overflow-x-auto gap-4 p-4 no-scrollbar items-center">
                {THEMES.map((theme) => {
                    const isActive = currentTheme === theme.id;
                    return (
                        <button
                            key={theme.id}
                            onClick={() => handleThemeChange(theme.id)}
                            className={`flex flex-col gap-2 min-w-[100px] rounded-xl border transition-all shrink-0 overflow-hidden text-left group ${isActive
                                ? "ring-2 ring-indigo-500 border-transparent shadow-md scale-105"
                                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm"
                                }`}
                        >
                            {/* Visual Preview */}
                            <div
                                className="h-16 w-full flex items-center justify-center relative"
                                style={{ backgroundColor: theme.color }}
                            >
                                <span style={{ color: theme.textColor }} className="font-mono text-xs font-bold">
                                    ._code
                                </span>
                                {isActive && (
                                    <div className="absolute top-1 right-1 bg-indigo-500 rounded-full p-0.5 shadow-sm">
                                        <Check size={10} className="text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Label */}
                            <div className="px-2 pb-2">
                                <span className={`text-[10px] font-medium block truncate ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                    {theme.label}
                                </span>
                            </div>
                        </button>
                    );
                })}

                {/* Spacer for right padding */}
                <div className="w-2 shrink-0" />
            </div>
        </div>
    );
};
