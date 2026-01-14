import React from "react";
import { Engine } from "../../../engine/Core";
import { TEXT_OPTIONS, createText } from "../../../data/textOptions";
import { BottomSheet } from "../panels/BottomSheet";

interface TextDrawerProps {
    engine: Engine | null;
    isOpen: boolean;
    onClose: () => void;
}

export const TextDrawerContent: React.FC<{ engine: Engine | null; onClose: () => void }> = ({ engine, onClose }) => {
    const handleAdd = (type: any) => {
        if (!engine) return;
        createText(engine, type);
        onClose();
    };

    return (
        <div className="space-y-4 px-2">
            <div className="text-xs font-bold text-slate-400 text-center mb-4">Click to add to canvas</div>

            {TEXT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                    <button
                        key={opt.type}
                        onClick={() => handleAdd(opt.type)}
                        className={`w-full text-left p-6 rounded-xl shadow-sm border transition-all group relative overflow-hidden
                                ${opt.bgClass} 
                                ${opt.type === 'particle'
                                ? 'hover:scale-105 hover:shadow-md border-violet-200 dark:border-violet-900/30'
                                : 'bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 hover:scale-105 hover:shadow-md'
                            }
                            `}
                    >
                        {opt.type === 'particle' && (
                            <div className="absolute right-4 top-4 text-violet-500 opacity-20 group-hover:opacity-100 transition-opacity">
                                <Icon size={24} />
                            </div>
                        )}

                        <span className={`block mb-2 font-black ${opt.type === 'heading' ? 'text-4xl' : opt.type === 'subheading' ? 'text-xl font-medium' : 'text-2xl'} ${opt.colorClass}`}>
                            {opt.label}
                        </span>
                        <span className={`text-xs block ${opt.type === 'particle' ? 'text-violet-600/70 dark:text-violet-400/70' : 'text-slate-400'}`}>
                            {opt.description}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export const TextDrawer: React.FC<TextDrawerProps> = ({ engine, isOpen, onClose }) => {
    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title="Typography"
            initialSnap={0.5}
            snaps={[0.5, 0.9]}
        >
            <TextDrawerContent engine={engine} onClose={onClose} />
        </BottomSheet>
    );
};
