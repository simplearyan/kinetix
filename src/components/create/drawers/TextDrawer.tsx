import React, { useState } from "react";
import { Engine } from "../../../engine/Core";
import { TEXT_OPTIONS, TEXT_EFFECTS, createText } from "../../../data/textOptions";
import { ChevronUp, ChevronDown, Type, Wand2 } from "lucide-react";

interface TextDrawerProps {
    engine: Engine | null;
    isOpen: boolean;
    onClose: () => void;
}

export const TextDrawer: React.FC<TextDrawerProps> = ({ engine, isOpen, onClose }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!isOpen) return null;

    const handleAdd = (type: string, effect?: any) => {
        if (!engine) return;
        createText(engine, type, effect);
        onClose();
    };

    // Helper to render a card
    const renderCard = (opt: any, isEffect = false) => {
        const isHeading = opt.type === 'heading';
        const isSub = opt.type === 'subheading';

        return (
            <button
                key={isEffect ? opt.id : opt.type}
                onClick={() => handleAdd(isEffect ? 'effect' : opt.type, isEffect ? opt : undefined)}
                className={`
                    group flex flex-col items-center justify-center 
                    p-4 rounded-xl border transition-all active:scale-95
                    bg-white dark:bg-app-surface border-slate-200 dark:border-app-border
                    hover:border-primary dark:hover:border-accent hover:bg-primary/5 dark:hover:bg-accent/10
                    ${isExpanded ? 'h-32 w-full' : 'h-24 w-24 shrink-0 snap-start'}
                `}
            >
                {/* Preview Content */}
                {isEffect ? (
                    <span style={{
                        ...opt.previewStyle,
                        fontSize: isExpanded ? '24px' : '16px',
                        textAlign: 'center',
                        lineHeight: 1.1,
                        width: '100%',
                    }}>
                        {opt.label}
                    </span>
                ) : opt.type === 'particle' ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className="absolute right-0 top-0 text-violet-500 opacity-20">
                            <Wand2 size={16} />
                        </div>
                        <span className={`block font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 leading-none ${isExpanded ? 'text-2xl' : 'text-sm'}`}>
                            {opt.label}
                        </span>
                    </div>
                ) : (
                    <span className={`block font-black text-center ${opt.colorClass} ${isHeading ? (isExpanded ? 'text-4xl' : 'text-xl') : isSub ? (isExpanded ? 'text-2xl' : 'text-base') : (isExpanded ? 'text-lg' : 'text-xs')}`}>
                        {opt.label}
                    </span>
                )}

                {/* Label (only show for specific types if needed, but here the preview IS the label usually) */}
                {/* We can add a small caption for clarity if expanded */}
                {isExpanded && !isEffect && opt.type !== 'particle' && (
                    <span className="text-[10px] text-slate-400 mt-2 absolute bottom-2">{opt.description || 'Text Layer'}</span>
                )}
            </button>
        );
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

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 px-1">Basic</h3>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {TEXT_OPTIONS.filter(o => ['heading', 'subheading', 'body'].includes(o.type)).map(o => renderCard(o))}
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 px-1">Effects</h3>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {TEXT_EFFECTS.map(e => renderCard(e, true))}
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 px-1">Special</h3>
                        <div className="grid grid-cols-2 gap-3 pb-20">
                            {TEXT_OPTIONS.filter(o => o.type === 'particle').map(o => renderCard(o))}
                        </div>

                    </div>
                ) : (
                    /* COLLAPSED: Horizontal Scroll */
                    <div className="h-full flex flex-col justify-center">
                        <div className="flex items-center gap-4 overflow-x-auto px-4 pb-4 pt-2 no-scrollbar snap-x">

                            {/* Basics */}
                            {TEXT_OPTIONS.filter(o => ['heading', 'subheading'].includes(o.type)).map(o => renderCard(o))}

                            <div className="w-px h-12 bg-slate-200 dark:bg-slate-800 shrink-0 mx-2" />

                            {/* Effects (Show top 3) */}
                            {TEXT_EFFECTS.slice(0, 4).map(e => renderCard(e, true))}

                            <div className="w-px h-12 bg-slate-200 dark:bg-slate-800 shrink-0 mx-2" />

                            {/* Special */}
                            {TEXT_OPTIONS.filter(o => o.type === 'particle').map(o => renderCard(o))}

                            {/* Spacer for end of list */}
                            <div className="w-2 shrink-0" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
