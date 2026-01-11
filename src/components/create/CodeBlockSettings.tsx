import React from "react";
import { Engine } from "../../engine/Core";
import { CodeBlockObject } from "../../engine/objects/CodeBlockObject";
import { ControlRow, PropertySection, SliderInput, Toggle, Slider } from "./InspectorUI";

interface CodeBlockSettingsProps {
    object: CodeBlockObject;
    engine: Engine | null;
    variant: "desktop" | "mobile";
    activeTab?: string;
    onUpdate: () => void;
}

export const CodeBlockSettings: React.FC<CodeBlockSettingsProps> = ({ object: obj, engine, variant, activeTab, onUpdate }) => {
    if (!engine) return null;

    const handleChange = (key: string, value: any) => {
        (obj as any)[key] = value;
        engine.render();
        onUpdate();
    };

    // --- MOBILE LAYOUT ---
    if (variant === "mobile") {
        return (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-4">


                {activeTab === "settings" && (
                    <>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block mb-2">Editor Settings</span>
                        <ControlRow label="Display" layout="vertical">
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <Toggle
                                        value={obj.syntaxHighlighting}
                                        onChange={(v) => handleChange("syntaxHighlighting", v)}
                                    />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">Syntax</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Toggle
                                        value={obj.showLineNumbers !== false}
                                        onChange={(v) => handleChange("showLineNumbers", v)}
                                    />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">Line nums</span>
                                </div>
                            </div>
                        </ControlRow>
                    </>
                )}
            </div>
        );
    }

    // --- DESKTOP LAYOUT ---
    return (
        <>
            <PropertySection title="Code Content">
                <div className="space-y-2">
                    <textarea
                        className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg p-2 text-xs font-mono outline-none min-h-[150px]"
                        value={obj.code}
                        onChange={(e) => handleChange("code", e.target.value)}
                        spellCheck={false}
                        placeholder="// Insert code here..."
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={() => document.getElementById('code-import')?.click()}
                            className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                            Import File
                        </button>
                        <input
                            type="file"
                            id="code-import"
                            className="hidden"
                            accept=".js,.ts,.jsx,.tsx,.html,.css,.json,.py,.java,.cpp,.c,.h,.md,.txt"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                        handleChange("code", ev.target?.result as string);
                                    };
                                    reader.readAsText(file);
                                }
                                e.target.value = '';
                            }}
                        />
                    </div>
                </div>
            </PropertySection>

            <PropertySection title="Syntax & Theme">
                <ControlRow label="Theme">
                    <select
                        className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg p-2 text-xs outline-none"
                        value={obj.theme}
                        onChange={(e) => handleChange("theme", e.target.value)}
                    >
                        <option value="vscode-dark">VS Code Dark</option>
                        <option value="light">Light</option>
                        <option value="monokai">Monokai</option>
                        <option value="github-dark">GitHub Dark</option>
                        <option value="dracula">Dracula</option>
                    </select>
                </ControlRow>
                <ControlRow label="Font Size">
                    <SliderInput
                        value={obj.fontSize}
                        min={8}
                        max={100}
                        onChange={(v) => handleChange("fontSize", v)}
                        formatValue={(v) => `${v}px`}
                    />
                </ControlRow>
                <ControlRow label="Settings" layout="horizontal">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <Toggle
                                value={obj.syntaxHighlighting}
                                onChange={(v) => handleChange("syntaxHighlighting", v)}
                            />
                            <span className="text-xs text-slate-600 dark:text-slate-400">Syntax</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Toggle
                                value={obj.showLineNumbers !== false}
                                onChange={(v) => handleChange("showLineNumbers", v)}
                            />
                            <span className="text-xs text-slate-600 dark:text-slate-400">Line nums</span>
                        </div>
                    </div>
                </ControlRow>
            </PropertySection>

            <PropertySection title="Layout & Spacing" defaultOpen={false}>
                <ControlRow label="Padding">
                    <SliderInput
                        value={obj.padding || 0}
                        min={0}
                        max={100}
                        onChange={(v) => handleChange("padding", v)}
                    />
                </ControlRow>
                <ControlRow label="Line Gap">
                    <SliderInput
                        value={obj.lineNumberMargin || 15}
                        min={0}
                        max={100}
                        onChange={(v) => handleChange("lineNumberMargin", v)}
                    />
                </ControlRow>
                <ControlRow label="Start Line #">
                    <input
                        type="number"
                        className="inspector-input-number"
                        value={obj.startLineNumber || 1}
                        onChange={(e) => handleChange("startLineNumber", Number(e.target.value))}
                    />
                </ControlRow>
            </PropertySection>

            <PropertySection title="Line Highlighting" defaultOpen={false}>
                <ControlRow label="Highlight Color" layout="horizontal">
                    <div className="flex justify-end gap-2 items-center">
                        <input
                            type="color"
                            className="w-8 h-8 rounded cursor-pointer"
                            value={obj.highlightColor || "#ffffff"}
                            onChange={(e) => handleChange("highlightColor", e.target.value)}
                        />
                    </div>
                </ControlRow>
                <ControlRow label="Lines (e.g. 1, 3-5)">
                    <input
                        type="text"
                        className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg p-2 text-xs outline-none"
                        placeholder="1, 3-5"
                        defaultValue={(obj.highlightedLines || []).join(", ")}
                        onBlur={(e) => {
                            const val = e.target.value;
                            const lines = val.split(",").flatMap(part => {
                                if (part.includes("-")) {
                                    const parts = part.split("-").map(n => parseInt(n.trim()));
                                    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                                        return Array.from({ length: parts[1] - parts[0] + 1 }, (_, i) => parts[0] + i);
                                    }
                                    return [];
                                }
                                const num = parseInt(part.trim());
                                return isNaN(num) ? [] : [num];
                            });
                            handleChange("highlightedLines", lines);
                        }}
                    />
                </ControlRow>
            </PropertySection>

        </>
    );
};
