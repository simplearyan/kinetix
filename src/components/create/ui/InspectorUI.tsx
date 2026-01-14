import React, { useState } from "react";
import { ChevronDown, ChevronRight, Check } from "lucide-react";

// --- Types ---
interface PropertySectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    rightElement?: React.ReactNode;
    compact?: boolean;
}

interface ControlRowProps {
    label?: string; // Optional for grid layouts
    icon?: React.ReactNode;
    children: React.ReactNode;
    description?: string;
    layout?: "horizontal" | "vertical";
    className?: string;
    labelClassName?: string;
}

interface CompactControlRowProps {
    label: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

interface ToggleProps {
    value: boolean;
    onChange: (val: boolean) => void;
    label?: string;
    size?: "sm" | "md";
}

interface SliderProps {
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (val: number) => void;
    label?: string; // Optional label for the value display
    formatValue?: (val: number) => string;
    compact?: boolean;
}

interface SegmentedControlProps {
    options: { value: string; label?: string; icon?: React.ReactNode }[];
    value: string;
    onChange: (val: string) => void;
    size?: "sm" | "md";
}

interface IconGridProps {
    options: { value: string; label: string; icon: React.ReactNode }[];
    value: string;
    onChange: (val: string) => void;
    cols?: number;
    size?: "sm" | "md";
    layout?: "vertical" | "horizontal";
}


// --- Components ---

export const PropertySection: React.FC<PropertySectionProps> = ({ title, children, defaultOpen = true, rightElement, compact = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`mb-3 border border-app-light-border dark:border-app-border rounded-xl overflow-hidden bg-app-light-surface/50 dark:bg-app-surface/50 shadow-sm transition-all ${compact ? 'py-0' : ''}`}>
            <div
                className={`flex items-center justify-between cursor-pointer hover:bg-app-light-surface-hover dark:hover:bg-app-surface-hover transition-colors select-none px-3 bg-app-light-surface/60 dark:bg-app-surface/60 border-b border-app-light-border dark:border-app-border ${compact ? 'py-2' : 'py-2.5'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    {isOpen ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                    <span className={`font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider ${compact ? 'text-[10px]' : 'text-[11px]'}`}>
                        {title}
                    </span>
                </div>
                {rightElement && <div onClick={e => e.stopPropagation()}>{rightElement}</div>}
            </div>
            {isOpen && (
                <div className={`px-3 py-3 space-y-3 ${compact ? 'space-y-2' : ''}`}>
                    {children}
                </div>
            )}
        </div>
    );
};

export const ControlRow: React.FC<ControlRowProps> = ({ label, icon, children, description, layout = "vertical", className = "", labelClassName = "" }) => {
    if (layout === "horizontal") {
        return (
            <div className={`flex items-center justify-between gap-3 min-h-[28px] ${className}`}>
                {(label || icon) && (
                    <div className="flex items-center gap-2 shrink-0 max-w-[50%]">
                        {icon && <span className="text-slate-400">{icon}</span>}
                        {label && (
                            <div className="flex flex-col">
                                <label className={`text-[11px] font-medium text-slate-600 dark:text-slate-300 ${labelClassName}`}>{label}</label>
                                {description && <span className="text-[9px] text-slate-400">{description}</span>}
                            </div>
                        )}
                    </div>
                )}
                <div className="flex-1 min-w-0 flex justify-end">
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {(label || icon) && (
                <div className="flex items-center gap-2">
                    {icon && <span className="text-slate-400">{icon}</span>}
                    {label && (
                        <div className="flex flex-col">
                            <label className={`text-[11px] font-medium text-slate-600 dark:text-slate-300 ${labelClassName}`}>{label}</label>
                            {description && <span className="text-[9px] text-slate-400">{description}</span>}
                        </div>
                    )}
                </div>
            )}
            <div className="w-full">
                {children}
            </div>
        </div>
    );
};

export const CompactControlRow: React.FC<CompactControlRowProps> = ({ label, icon, children, className = "" }) => {
    return (
        <div className={`flex items-center gap-2 bg-app-light-surface dark:bg-app-surface rounded-lg p-1.5 ${className}`}>
            {icon ? (
                <span className="text-slate-400 shrink-0" title={label}>{icon}</span>
            ) : (
                <span className="text-[10px] font-bold text-slate-500 w-4 text-center shrink-0" title={label}>{label[0]}</span>
            )}
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>
    )
}

export const Toggle: React.FC<ToggleProps> = ({ value, onChange, label, size = "md" }) => {
    const h = size === "sm" ? "h-5 w-9" : "h-6 w-11";
    const ball = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
    const translate = size === "sm" ? "translate-x-4" : "translate-x-6";

    return (
        <button
            className={`relative inline-flex ${h} items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 dark:focus:ring-offset-app-bg ${value ? "bg-accent" : "bg-app-light-border dark:bg-app-border"}`}
            onClick={() => onChange(!value)}
        >
            <span className="sr-only">{label || "Toggle"}</span>
            <span
                className={`inline-block ${ball} transform rounded-full bg-white shadow transition-transform ${value ? translate : "translate-x-1"}`}
            />
        </button>
    );
};

export const Slider: React.FC<SliderProps> = ({ value, min, max, step = 1, onChange, formatValue, compact }) => {
    const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
    const isBipolar = min < 0 && max > 0;
    const centerPercentage = isBipolar ? ((0 - min) / (max - min)) * 100 : 0;

    return (
        <div className={`relative flex w-full items-center cursor-pointer touch-none select-none group ${compact ? 'h-6' : 'h-8'}`}>
            {/* Track Background */}
            <div className={`relative w-full rounded-full overflow-hidden bg-app-light-border dark:bg-app-surface-hover ${compact ? 'h-1' : 'h-1.5'}`}>
                {/* Center Tick for Bipolar Sliders */}
                {isBipolar && (
                    <div className="absolute top-0 bottom-0 w-0.5 bg-slate-400/50 dark:bg-slate-500 z-10" style={{ left: `${centerPercentage}%` }} />
                )}

                {/* Fill */}
                <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Thumb (Invisible but large hit area for touch) */}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            {/* Thumb Visual */}
            <div
                className={`absolute bg-white border border-app-light-border dark:border-slate-500 rounded-full shadow-sm pointer-events-none transition-transform group-hover:scale-110 group-active:scale-95 ${compact ? 'h-3 w-3 top-1.5' : 'h-4 w-4 top-2'}`}
                style={{ left: `calc(${percentage}% - ${compact ? 6 : 8}px)` }}
            />

            {/* Hover Tooltip */}
            <div className="absolute right-0 -top-8 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-app-surface px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-app-light-border dark:border-app-border z-10 translate-y-2">
                {formatValue ? formatValue(value) : value}
            </div>
        </div>
    );
};

export const SliderInput: React.FC<SliderProps> = (props) => {
    return (
        <div className="flex items-center gap-3 w-full">
            <div className="flex-1">
                <Slider {...props} />
            </div>
            <input
                type="number"
                value={props.value}
                onChange={(e) => props.onChange(Number(e.target.value))}
                className="w-14 bg-transparent border-b border-transparent hover:border-app-light-border dark:hover:border-slate-600 focus:border-accent dark:focus:border-accent text-xs text-right font-mono text-slate-700 dark:text-slate-200 outline-none p-0 transition-colors"
            />
        </div>
    )
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange, size = "md" }) => {
    return (
        <div className="flex bg-app-light-surface dark:bg-app-bg p-0.5 rounded-lg w-full">
            {options.map((option) => {
                const isSelected = value === option.value;
                return (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-md text-xs font-medium transition-all ${size === 'sm' ? 'py-1' : 'py-1.5'} ${isSelected ? "bg-white dark:bg-app-surface text-accent dark:text-accent-light shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
                        title={option.label}
                    >
                        {option.icon}
                        {option.label && <span>{option.label}</span>}
                    </button>
                );
            })}
        </div>
    );
};

export const IconGrid: React.FC<IconGridProps> = ({ options, value, onChange, cols = 3, size = "md", layout = "vertical" }) => {
    return (
        <div className={`grid grid-cols-${cols} gap-2 w-full`}>
            {options.map((option) => {
                const isSelected = value === option.value;
                return (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={`flex flex-col items-center justify-center rounded-xl border transition-all relative overflow-hidden ${isSelected ? "bg-indigo-50 dark:bg-indigo-900/20 border-accent text-accent dark:text-accent-light ring-1 ring-accent" : "bg-white dark:bg-app-surface border-app-light-border dark:border-app-border text-slate-500 dark:text-slate-400 hover:border-app-light-border dark:hover:border-slate-500 hover:bg-app-light-surface dark:hover:bg-app-surface-hover"} ${size === 'sm' ? 'p-1.5 aspect-[4/3] gap-1' : 'p-2 aspect-square gap-1.5'} ${layout === 'horizontal' ? '!flex-row !aspect-auto !justify-start px-3 py-2 text-left' : ''}`}
                    >
                        <div className={`${size === 'sm' ? 'scale-75 origin-bottom' : ''}`}>{option.icon}</div>
                        {layout !== 'horizontal' && <span className={`font-bold uppercase truncate max-w-full ${size === 'sm' ? 'text-[8px] leading-tight' : 'text-[9px]'}`}>{option.label}</span>}
                        {layout === 'horizontal' && <span className="text-[10px] ml-2">{option.label}</span>}

                        {isSelected && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full" />}
                    </button>
                );
            })}
        </div>
    );
};

interface ColorPickerProps {
    value: string;
    onChange: (val: string) => void;
    label?: string;
    size?: "sm" | "md";
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, label, size = "md" }) => {
    return (
        <div className="flex items-center gap-2">
            <div className="relative group cursor-pointer">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
                <div
                    className={`rounded-full shadow-sm ring-1 ring-app-light-border dark:ring-app-border overflow-hidden transition-transform group-hover:scale-110 ${size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'}`}
                    style={{ backgroundColor: value }}
                />
            </div>
            {label && <span className="text-xs font-mono text-slate-500">{label}</span>}
        </div>
    );
};

// --- Mobile Specific Components ---

export const MobilePropertyContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 pb-safe">
            {children}
        </div>
    );
};

export const MobileCategoryStrip: React.FC<{
    categories: { id: string; label: string; icon?: React.ReactNode }[];
    activeCategory: string;
    onSelect: (id: string) => void;
    children?: React.ReactNode;
}> = ({ categories, activeCategory, onSelect, children }) => {
    return (
        <div className="flex items-center gap-4 overflow-x-auto px-4 py-3 border-b border-white/10 no-scrollbar touch-pan-x">
            {children}
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onSelect(cat.id)}
                    className={`flex flex-col items-center gap-1 min-w-[60px] transition-all ${activeCategory === cat.id
                        ? "text-blue-400 opacity-100 scale-105"
                        : "text-slate-400 opacity-70 hover:opacity-100"
                        }`}
                >
                    <div className={`p-2 rounded-full ${activeCategory === cat.id ? "bg-blue-500/20" : "bg-transparent"
                        }`}>
                        {cat.icon}
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-wider">{cat.label}</span>
                </button>
            ))}
        </div>
    );
};

export const MobileControlGroup: React.FC<{ title?: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => {
    return (
        <div className={`mb-4 ${className}`}>
            {title && (
                <div className="px-4 mb-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {title}
                </div>
            )}
            <div className="bg-slate-800/50 dark:bg-app-surface/50 rounded-xl overflow-hidden mx-2 border border-white/5 divide-y divide-white/5">
                {children}
            </div>
        </div>
    );
};
