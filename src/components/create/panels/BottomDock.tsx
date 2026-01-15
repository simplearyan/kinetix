import React from "react";
import { Plus, SlidersHorizontal, Layers, Download, Type, Square, BarChart3, Terminal, Sparkles, Keyboard, Palette, User, Settings2, ChevronLeft, Database, Scaling, Move, Crop } from "lucide-react";

export type BottomDockTab = "assets" | "text" | "elements" | "shapes" | "code" | "charts" | "config" | "edit" | "font" | "style" | "motion" | "adjust" | "dimensions" | "position" | "layers" | "export" | "theme" | "settings" | "canvas" | null;

export type ObjectType = "text" | "shape" | "image" | "chart" | "bar-race" | "character" | "code" | "particle" | null;

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
                ${activeTab === id ? "text-primary dark:text-accent" : highlight ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}
        >
            <div className={`p-2 rounded-full transition-all ${activeTab === id ? "bg-primary/10 dark:bg-accent/20 scale-110" : highlight ? "bg-slate-100 dark:bg-slate-800" : ""}`}>
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
            <div className={`${!isFullscreen ? 'lg:hidden fixed' : 'absolute'} bottom-0 left-0 right-0 w-full h-16 bg-white/95 dark:bg-app-surface/95 border-t border-slate-200 dark:border-app-border flex items-center px-2 z-[100] overflow-x-auto no-scrollbar gap-1 dark:shadow-none pb-safe`}>

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
                        <Button id="dimensions" icon={Scaling} label="Size" />
                        <Button id="adjust" icon={Settings2} label="Adjust" />
                        <Button id="motion" icon={Sparkles} label="Motion" />
                        <Button id="position" icon={Move} label="Position" />
                        <Separator />
                        <Button id="layers" icon={Layers} label="Layers" />
                    </>
                )}

                {/* CONTEXT: SHAPE/OTHER SELECTED */}
                {selectedObjectType && !['text', 'code', 'chart', 'bar-race'].includes(selectedObjectType) && (
                    <>
                        <Button id="dimensions" icon={Scaling} label="Size" />
                        <Button id="adjust" icon={Settings2} label="Adjust" />
                        <Button id="style" icon={Palette} label="Style" />
                        <Button id="motion" icon={Sparkles} label="Motion" />
                        <Button id="position" icon={Move} label="Position" />
                        <Separator />
                        <Button id="layers" icon={Layers} label="Layers" />
                    </>
                )}

                {/* CONTEXT: CHART/RACE SELECTED */}
                {(selectedObjectType === 'chart' || selectedObjectType === 'bar-race') && (
                    <>
                        <Button id="config" icon={SlidersHorizontal} label="Config" highlight />
                        <Button id="dimensions" icon={Scaling} label="Size" />
                        <Button id="adjust" icon={Settings2} label="Adjust" />
                        <Button id="motion" icon={Sparkles} label="Motion" />
                        <Button id="position" icon={Move} label="Position" />
                        <Separator />
                        <Button id="layers" icon={Layers} label="Layers" />
                    </>
                )}

                {/* CONTEXT: CODE SELECTED */}
                {selectedObjectType === 'code' && (
                    <>
                        <Button id="edit" icon={Keyboard} label="Edit" highlight />
                        <Button id="theme" icon={Palette} label="Theme" />
                        <Button id="dimensions" icon={Scaling} label="Size" />
                        <Button id="adjust" icon={Settings2} label="Adjust" />
                        <Button id="settings" icon={SlidersHorizontal} label="Settings" />
                        <Button id="position" icon={Move} label="Position" />
                        <Separator />
                        <Button id="layers" icon={Layers} label="Layers" />
                    </>
                )}

                {/* DEFAULT: NO SELECTION (ADD MODE) */}
                {!selectedObjectType && (
                    <>
                        {/* Text */}
                        <Button id="text" icon={Type} label="Text" />

                        {/* Elements (Combined Shapes & Code) */}
                        <Button id="elements" icon={Square} label="Elements" />

                        {/* Charts */}
                        <Button id="charts" icon={BarChart3} label="Charts" />

                        <Separator />



                        {/* Layers */}
                        <Button id="layers" icon={Layers} label="Layers" />

                        <Separator />

                        {/* Canavs Settings */}
                        <Button id="canvas" icon={Crop} label="Canvas" />

                        {/* Export */}
                        <Button id="export" icon={Download} label="Export" />
                    </>
                )}

            </div>
        </>
    );
};
