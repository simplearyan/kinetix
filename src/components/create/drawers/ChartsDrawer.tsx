import React from "react";
import { Engine } from "../../../engine/Core";
import { CHART_TYPES, createChart } from "../../../data/chartOptions";
import { BottomSheet } from "../panels/BottomSheet";

interface ChartsDrawerProps {
    engine: Engine | null;
    isOpen: boolean;
    onClose: () => void;
}

export const ChartsDrawerContent: React.FC<{ engine: Engine | null; onClose: () => void }> = ({ engine, onClose }) => {
    // Logic to add chart
    const handleAdd = (type: any) => {
        if (!engine) return;
        createChart(engine, type);
        onClose();
    };

    return (
        <div className="grid grid-cols-2 gap-3 pb-8">
            {CHART_TYPES.map((chart) => {
                const Icon = chart.icon;
                return (
                    <button
                        key={chart.type}
                        onClick={() => handleAdd(chart.type)}
                        className="flex flex-col items-start p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl transition-all group active:scale-95 text-left"
                    >
                        <div className={`mb-3 p-2 rounded-lg bg-white dark:bg-slate-900 shadow-sm ${chart.colorClass?.replace('text-', 'text-opacity-80 text-') || 'text-slate-500'}`}>
                            <Icon size={24} className={chart.colorClass} />
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">
                            {chart.label}
                        </span>
                        <span className="text-xs font-bold text-slate-500 font-medium leading-tight">
                            {chart.description || "Add to canvas"}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export const ChartsDrawer: React.FC<ChartsDrawerProps> = ({ engine, isOpen, onClose }) => {
    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title="Charts & Data"
            initialSnap={0.5}
            snaps={[0.5, 0.95]} // Allow almost full screen
        >
            <ChartsDrawerContent engine={engine} onClose={onClose} />
        </BottomSheet>
    );
};
