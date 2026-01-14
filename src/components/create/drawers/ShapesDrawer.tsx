import React from "react";
import { Engine } from "../../../engine/Core";
import { SHAPE_OPTIONS, createShape } from "../../../data/shapeOptions";
import { BottomSheet } from "../panels/BottomSheet";

interface ShapesDrawerProps {
    engine: Engine | null;
    isOpen: boolean;
    onClose: () => void;
}

export const ShapesDrawerContent: React.FC<{ engine: Engine | null; onClose: () => void }> = ({ engine, onClose }) => {
    const handleAdd = (type: any) => {
        if (!engine) return;
        createShape(engine, type);
        onClose();
    };

    return (
        <div className="space-y-4 px-2">
            {/* Shapes Loop */}
            {SHAPE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                    <button
                        key={opt.type}
                        onClick={() => handleAdd(opt.type)}
                        className="w-full text-left p-4 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-700 hover:scale-105 hover:shadow-md transition-all group flex items-center gap-4"
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${opt.iconBgClass} ${opt.iconColorClass}`}>
                            <Icon size={24} />
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 dark:text-white">{opt.label}</div>
                            <div className="text-xs text-slate-500 dark:text-neutral-400">{opt.description}</div>
                        </div>
                    </button>
                );
            })}

            <div className="text-center text-xs text-slate-400 mt-2">More shapes coming soon...</div>
        </div>
    );
};

export const ShapesDrawer: React.FC<ShapesDrawerProps> = ({ engine, isOpen, onClose }) => {
    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title="Shapes & Assets"
            initialSnap={0.5}
            snaps={[0.5, 0.9]}
        >
            <ShapesDrawerContent engine={engine} onClose={onClose} />
        </BottomSheet>
    );
};
