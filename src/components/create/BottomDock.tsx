import React from "react";
import { Plus, SlidersHorizontal, Layers, Download, Type, Square, BarChart3, Terminal, Sparkles, Keyboard, Palette, User, Settings2, ChevronLeft } from "lucide-react";

export type BottomDockTab = "assets" | "text" | "shapes" | "code" | "charts" | "edit" | "font" | "style" | "motion" | "adjust" | "layers" | "export" | "theme" | "settings" | null;

export type ObjectType = "text" | "shape" | "image" | "chart" | "character" | "code" | "particle" | null;

interface BottomDockProps {
    activeTab: BottomDockTab;
    onTabChange: (tab: BottomDockTab) => void;
    hasSelection: boolean;
    selectedObjectType: ObjectType;
    isFullscreen?: boolean;
    onCloseContext?: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({ activeTab, onTabChange, hasSelection, selectedObjectType, isFullscreen, onCloseContext }) => {

    const Button = ({ id, icon: Icon, label, disabled = false, highlight = false }: { id: BottomDockTab, icon: any, label: string, disabled?: boolean, highlight?: boolean }) => (
        <button
            onClick={() => !disabled && onTabChange(activeTab === id ? null : id)}
            disabled={disabled}
            className={`flex flex-col items-center justify-center min-w-[4rem] h-full gap-1 transition-all
                ${disabled ? "opacity-30 grayscale" : ""} 
                ${activeTab === id ? "text-indigo-600 dark:text-indigo-400" : highlight ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}
        >
            <div className={`p-2 rounded-full transition-all ${activeTab === id ? "bg-indigo-100 dark:bg-indigo-900/50 scale-110" : highlight ? "bg-slate-100 dark:bg-slate-800" : ""}`}>
                <Icon size={20} strokeWidth={activeTab === id ? 2.5 : 2} />
            </div>
            <span className={`text-[9px] whitespace-nowrap ${activeTab === id ? "font-bold" : "font-medium"}`}>{label}</span>
        </button>
    );

    const Separator = () => <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 shrink-0 mx-1" />;

    return (
        <>
            <style>
                {`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                `}
            </style>
            <div className={`${!isFullscreen ? 'lg:hidden fixed' : 'absolute'} bottom-0 left-0 right-0 w-full h-16 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 flex items-center px-2 z-[100] overflow-x-auto no-scrollbar gap-1 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-none pb-safe`}>

                {/* Back Arrow for Context Mode */}
                {hasSelection && (
                    <>
                        <button
                            onClick={onCloseContext}
                            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full shrink-0 ${activeTab === null ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'}`}
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 shrink-0 mx-1" />
                    </>
                )}

                {/* CONTEXT: TEXT SELECTED */}
                {selectedObjectType === 'text' && (
                    <>
                        <Button id="edit" icon={Keyboard} label="Edit" highlight />
                        <Button id="font" icon={Type} label="Font" />
                        <Button id="style" icon={Palette} label="Style" />
                        <Button id="motion" icon={Sparkles} label="Motion" />
                        <Button id="adjust" icon={Settings2} label="Adjust" />
                        <Separator />
                        <Button id="layers" icon={Layers} label="Layers" />
                    </>
                )}

                {/* CONTEXT: SHAPE/OTHER SELECTED */}
                {selectedObjectType && selectedObjectType !== 'text' && selectedObjectType !== 'code' && (
                    <>
                        <Button id="adjust" icon={Settings2} label="Adjust" />
                        <Button id="style" icon={Palette} label="Style" />
                        <Button id="motion" icon={Sparkles} label="Motion" />
                        <Separator />
                        <Button id="layers" icon={Layers} label="Layers" />
                    </>
                )}

                {/* CONTEXT: CODE SELECTED */}
                {selectedObjectType === 'code' && (
                    <>
                        <Button id="edit" icon={Keyboard} label="Edit" highlight />
                        <Button id="theme" icon={Palette} label="Theme" />
                        <Button id="settings" icon={SlidersHorizontal} label="Settings" />
                        <Button id="adjust" icon={Settings2} label="Adjust" />
                        <Separator />
                        <Button id="layers" icon={Layers} label="Layers" />
                    </>
                )}

                {/* DEFAULT: NO SELECTION (ADD MODE) */}
                {!selectedObjectType && (
                    <>
                        {/* Text */}
                        <Button id="text" icon={Type} label="Text" />

                        {/* Shapes */}
                        <Button id="shapes" icon={Square} label="Shapes" />

                        {/* Code */}
                        <Button id="code" icon={Terminal} label="Code" />

                        {/* Charts */}
                        <Button id="charts" icon={BarChart3} label="Charts" />

                        <Separator />

                        {/* Layers */}
                        {/* Layers */}
                        <Button id="layers" icon={Layers} label="Layers" />

                        <Separator />

                        {/* Export */}
                        <Button id="export" icon={Download} label="Export" />
                    </>
                )}

            </div>
        </>
    );
};
