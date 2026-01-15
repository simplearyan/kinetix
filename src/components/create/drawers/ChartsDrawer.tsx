import React, { useState } from "react";
import { Engine } from "../../../engine/Core";
import { ChevronUp, ChevronDown } from "lucide-react";
import { CHART_TYPES, createChart, type ChartType } from "../../../data/chartOptions";

interface ChartsDrawerProps {
    engine: Engine | null;
    isOpen: boolean;
    onClose: () => void;
}

export const ChartsDrawer: React.FC<ChartsDrawerProps> = ({ engine, isOpen, onClose }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!isOpen) return null;

    const handleAddChart = (type: ChartType) => {
        if (!engine) return;
        createChart(engine, type);
        onClose();
    };

    return (
        <div className={`
            fixed bottom-16 left-0 right-0 z-40
            bg-white dark:bg-app-surface border-t border-slate-200 dark:border-app-border
            transition-all duration-300 ease-in-out
            ${isExpanded ? 'h-[70vh] rounded-t-2xl shadow-2xl' : 'h-40'}
        `}>
            {/* Header / Toggle Handle */}
            <div
                className="flex items-center justify-center p-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors absolute top-0 left-0 right-0 h-8 z-10"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>

            {/* Toggle Icon */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute top-2 right-4 p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors z-20"
            >
                {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>

            {/* Content Container */}
            <div className="h-full pt-8 pb-4">
                {isExpanded ? (
                    /* EXPANDED: Grid View */
                    <div className="h-full overflow-y-auto p-4 custom-scrollbar">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 px-1">Chart Types</h3>
                        <div className="grid grid-cols-2 gap-4 pb-20">
                            {CHART_TYPES.map(chart => {
                                const Icon = chart.icon;
                                return (
                                    <button
                                        key={chart.type}
                                        onClick={() => handleAddChart(chart.type)}
                                        className="group flex flex-col items-start p-4 rounded-xl bg-slate-50 dark:bg-app-bg border border-slate-200 dark:border-app-border hover:border-primary dark:hover:border-accent hover:bg-primary/5 dark:hover:bg-accent/10 transition-all text-left"
                                    >
                                        <div className={`p-3 mb-3 rounded-lg bg-white dark:bg-app-surface shadow-sm group-hover:scale-110 transition-transform ${chart.colorClass}`}>
                                            <Icon size={24} />
                                        </div>
                                        <span className="font-bold text-sm text-slate-900 dark:text-white mb-1">{chart.label}</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">{chart.description || 'Visualize data'}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* COLLAPSED: Horizontal Scroll */
                    <div className="h-full flex flex-col justify-center">
                        <div className="flex items-center gap-4 overflow-x-auto px-4 pb-4 pt-2 no-scrollbar snap-x">
                            {CHART_TYPES.map(chart => {
                                const Icon = chart.icon;
                                return (
                                    <button
                                        key={chart.type}
                                        onClick={() => handleAddChart(chart.type)}
                                        className="shrink-0 snap-start flex flex-col items-center justify-center w-24 h-24 rounded-xl bg-slate-50 dark:bg-app-bg border border-slate-200 dark:border-app-border hover:border-primary dark:hover:border-accent hover:bg-primary/5 dark:hover:bg-accent/10 transition-all"
                                    >
                                        <div className={`mb-2 ${chart.colorClass}`}>
                                            <Icon size={24} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white text-center leading-tight">{chart.label}</span>
                                    </button>
                                );
                            })}
                            {/* Spacer for end of list */}
                            <div className="w-2 shrink-0" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
