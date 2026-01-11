import React, { useState } from "react";
import { Engine } from "../../engine/Core";
import { TextObject } from "../../engine/objects/TextObject";
import { ControlRow, ColorPicker, Slider, Toggle, PropertySection } from "./InspectorUI";

interface TextSettingsProps {
    object: TextObject;
    engine: Engine;
    onUpdate?: () => void;
    variant?: 'desktop' | 'mobile';
    section?: 'all' | 'content' | 'font' | 'style';
}

export const TextSettings: React.FC<TextSettingsProps> = ({
    object: obj,
    engine,
    onUpdate,
    variant = 'desktop',
    section = 'all'
}) => {
    const [forceUpdate, setForceUpdate] = useState(0);

    const handleChange = (key: string, value: any) => {
        (obj as any)[key] = value;
        engine.render();
        setForceUpdate(n => n + 1);
        onUpdate?.();
    };

    const isMobile = variant === 'mobile';

    // Classes
    const containerClasses = isMobile ? "flex flex-col gap-6 px-1" : "space-y-4";

    const inputBaseClasses = isMobile
        ? "w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-3 text-sm border border-transparent focus:border-indigo-500 outline-none"
        : "w-full bg-slate-100 dark:bg-slate-800 rounded-lg p-2 text-xs border-transparent focus:border-indigo-500 outline-none";

    const cardClasses = isMobile
        ? "bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-4"
        : "space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800";

    const showContent = section === 'all' || section === 'content';
    const showFont = section === 'all' || section === 'font';
    const showStyle = section === 'all' || section === 'style';

    const MobileSectionHeader: React.FC<{ title: string; toggle?: React.ReactNode }> = ({ title, toggle }) => (
        <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{title}</span>
            {toggle}
        </div>
    );

    return (
        <div className={containerClasses}>

            {/* CONTENT SECTION */}
            {showContent && (
                <div className={isMobile ? "space-y-4" : ""}>
                    {!isMobile && <span className="text-[10px] font-bold uppercase text-indigo-500 mb-2 block">Typography</span>}
                    <ControlRow label="Content">
                        <textarea
                            value={obj.text}
                            onChange={(e) => handleChange("text", e.target.value)}
                            className={`${inputBaseClasses} ${isMobile ? "min-h-[120px]" : "resize-y min-h-[80px]"}`}
                            placeholder="Type your text..."
                        />
                    </ControlRow>
                </div>
            )}

            {/* FONT SECTION */}
            {showFont && (
                <div className={isMobile ? "space-y-4" : ""}>
                    <ControlRow label="Font Family">
                        <select
                            value={obj.fontFamily}
                            onChange={(e) => handleChange("fontFamily", e.target.value)}
                            className={inputBaseClasses}
                        >
                            <option value="Inter">Inter</option>
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Verdana">Verdana</option>
                        </select>
                    </ControlRow>
                    <ControlRow label="Size" layout={isMobile ? "vertical" : "horizontal"}>
                        <div className="space-y-1 w-full">
                            {isMobile && <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase"><span>Size</span><span>{obj.fontSize}px</span></div>}
                            <Slider
                                value={obj.fontSize || 40}
                                min={8} max={400}
                                onChange={(v) => handleChange("fontSize", v)}
                                compact={!isMobile}
                            />
                        </div>
                    </ControlRow>
                </div>
            )}

            {/* STYLE SECTION */}
            {showStyle && (
                <div className={isMobile ? "space-y-4" : "space-y-4"}>

                    {/* Appearance */}
                    <div className={isMobile ? cardClasses : "pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2"}>
                        {isMobile && <MobileSectionHeader title="Appearance" />}

                        <ControlRow label="Text Color" layout={isMobile ? "horizontal" : "vertical"}>
                            <div className={isMobile ? "flex justify-end" : ""}>
                                <ColorPicker
                                    value={obj.color}
                                    onChange={(v) => handleChange("color", v)}
                                    size={isMobile ? "md" : "sm"}
                                />
                            </div>
                        </ControlRow>

                        {isMobile && (
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase"><span>Opacity</span><span>{Math.round((obj.opacity ?? 1) * 100)}%</span></div>
                                <Slider
                                    value={obj.opacity ?? 1}
                                    min={0} max={1} step={0.01}
                                    onChange={(v) => handleChange("opacity", v)}
                                    compact={false}
                                />
                            </div>
                        )}
                    </div>

                    {/* Outline */}
                    <div className={cardClasses}>
                        {isMobile ? (
                            <MobileSectionHeader
                                title="Outline"
                                toggle={
                                    <Toggle
                                        value={!!obj.strokeColor}
                                        onChange={(v) => {
                                            handleChange("strokeColor", v ? "#000000" : undefined);
                                            if (v && !obj.strokeWidth) handleChange("strokeWidth", 2);
                                        }}
                                    />
                                }
                            />
                        ) : (
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Outline</span>
                                <Toggle
                                    value={!!obj.strokeColor}
                                    onChange={(v) => {
                                        handleChange("strokeColor", v ? "#000000" : undefined);
                                        if (v && !obj.strokeWidth) handleChange("strokeWidth", 2);
                                    }}
                                />
                            </div>
                        )}

                        {obj.strokeColor && (
                            <div className={`space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 ${isMobile ? "" : "pt-2 border-t border-slate-100 dark:border-slate-800/50"}`}>
                                <div className={isMobile ? "space-y-2" : ""}>
                                    {isMobile && <span className="text-[10px] text-slate-500 font-bold uppercase">Color</span>}
                                    <ColorPicker
                                        value={obj.strokeColor}
                                        onChange={(v) => handleChange("strokeColor", v)}
                                        size={isMobile ? "md" : "sm"}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase"><span>Width</span><span>{obj.strokeWidth}px</span></div>
                                    <Slider
                                        value={obj.strokeWidth || 0}
                                        min={1} max={20}
                                        onChange={(v) => handleChange("strokeWidth", v)}
                                        compact={!isMobile}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Shadow */}
                    <div className={cardClasses}>
                        {isMobile ? (
                            <MobileSectionHeader
                                title="Shadow"
                                toggle={
                                    <Toggle
                                        value={!!obj.shadow}
                                        onChange={(v) => {
                                            handleChange("shadow", v ? { color: "#000000", blur: 4, offsetX: 2, offsetY: 2 } : undefined);
                                        }}
                                    />
                                }
                            />
                        ) : (
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Shadow</span>
                                <Toggle
                                    value={!!obj.shadow}
                                    onChange={(v) => {
                                        handleChange("shadow", v ? { color: "#000000", blur: 4, offsetX: 2, offsetY: 2 } : undefined);
                                    }}
                                />
                            </div>
                        )}

                        {obj.shadow && (
                            <div className={`space-y-4 animate-in fade-in slide-in-from-top-4 duration-200 ${isMobile ? "" : "pt-2 border-t border-slate-100 dark:border-slate-800/50"}`}>
                                <div className={isMobile ? "space-y-2" : ""}>
                                    {isMobile && <span className="text-[10px] text-slate-500 font-bold uppercase">Color</span>}
                                    <ColorPicker
                                        value={obj.shadow.color}
                                        onChange={(v) => handleChange("shadow", { ...obj.shadow!, color: v })}
                                        size={isMobile ? "md" : "sm"}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase"><span>Blur</span><span>{obj.shadow.blur}px</span></div>
                                    <Slider
                                        value={obj.shadow.blur}
                                        min={0} max={20}
                                        onChange={(v) => handleChange("shadow", { ...obj.shadow!, blur: v })}
                                        compact={!isMobile}
                                    />
                                </div>
                                <div className={`grid grid-cols-2 ${isMobile ? "gap-6" : "gap-4"}`}>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase"><span>Offset X</span><span>{obj.shadow.offsetX}</span></div>
                                        <Slider
                                            value={obj.shadow.offsetX}
                                            min={-20} max={20}
                                            onChange={(v) => handleChange("shadow", { ...obj.shadow!, offsetX: v })}
                                            compact={!isMobile}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase"><span>Offset Y</span><span>{obj.shadow.offsetY}</span></div>
                                        <Slider
                                            value={obj.shadow.offsetY}
                                            min={-20} max={20}
                                            onChange={(v) => handleChange("shadow", { ...obj.shadow!, offsetY: v })}
                                            compact={!isMobile}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Background */}
                    <div className={cardClasses}>
                        {isMobile ? (
                            <MobileSectionHeader
                                title="Background"
                                toggle={
                                    <Toggle
                                        value={!!obj.backgroundColor}
                                        onChange={(v) => {
                                            handleChange("backgroundColor", v ? "#000000" : undefined);
                                            if (v) {
                                                if (!obj.backgroundPadding) handleChange("backgroundPadding", 10);
                                                if (!obj.backgroundRadius) handleChange("backgroundRadius", 4);
                                            }
                                        }}
                                    />
                                }
                            />
                        ) : (
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Background</span>
                                <Toggle
                                    value={!!obj.backgroundColor}
                                    onChange={(v) => {
                                        handleChange("backgroundColor", v ? "#000000" : undefined);
                                        if (v) {
                                            if (!obj.backgroundPadding) handleChange("backgroundPadding", 10);
                                            if (!obj.backgroundRadius) handleChange("backgroundRadius", 4);
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {obj.backgroundColor && (
                            <div className={`space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 ${isMobile ? "" : "pt-2 border-t border-slate-100 dark:border-slate-800/50"}`}>
                                <div className={isMobile ? "space-y-2" : ""}>
                                    {isMobile && <span className="text-[10px] text-slate-500 font-bold uppercase">Color</span>}
                                    <ColorPicker
                                        value={obj.backgroundColor}
                                        onChange={(v) => handleChange("backgroundColor", v)}
                                        size={isMobile ? "md" : "sm"}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase"><span>Padding</span><span>{obj.backgroundPadding}px</span></div>
                                    <Slider
                                        value={obj.backgroundPadding || 0}
                                        min={0} max={50}
                                        onChange={(v) => handleChange("backgroundPadding", v)}
                                        compact={!isMobile}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase"><span>Radius</span><span>{obj.backgroundRadius}px</span></div>
                                    <Slider
                                        value={obj.backgroundRadius || 0}
                                        min={0} max={50}
                                        onChange={(v) => handleChange("backgroundRadius", v)}
                                        compact={!isMobile}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
