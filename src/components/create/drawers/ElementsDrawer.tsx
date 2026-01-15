import React, { useState } from "react";
import { Engine } from "../../../engine/Core";
import { ShapesDrawerContent } from "./ShapesDrawer";
import { CodeDrawerContent } from "./CodeDrawer";
import { Square, Terminal } from "lucide-react";

interface ElementsDrawerContentProps {
    engine: Engine | null;
    onClose: () => void;
}

import { BottomSheet } from "../panels/BottomSheet";

export const ElementsDrawer: React.FC<ElementsDrawerContentProps & { isOpen: boolean }> = ({ engine, onClose, isOpen }) => {
    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title={undefined}
            initialSnap={0.5}
            snaps={[0.5, 0.95]}
            variant="dock"
        >
            <ElementsDrawerContent engine={engine} onClose={onClose} />
        </BottomSheet>
    );
};

export const ElementsDrawerContent: React.FC<ElementsDrawerContentProps> = ({ engine, onClose }) => {
    const [activeSubTab, setActiveSubTab] = useState<'shapes' | 'code'>('shapes');

    return (
        <div className="h-full flex flex-col">
            {/* Segmented Control */}
            <div className="px-4 pb-4">
                <div className="flex p-1 bg-slate-100 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/5">
                    <button
                        onClick={() => setActiveSubTab('shapes')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'shapes'
                            ? 'bg-white dark:bg-app-surface text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        <Square size={16} />
                        <span>Shapes</span>
                    </button>
                    <button
                        onClick={() => setActiveSubTab('code')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'code'
                            ? 'bg-white dark:bg-app-surface text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        <Terminal size={16} />
                        <span>Code</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                {activeSubTab === 'shapes' ? (
                    <ShapesDrawerContent engine={engine} onClose={onClose} />
                ) : (
                    <CodeDrawerContent engine={engine} onClose={onClose} />
                )}
            </div>
        </div>
    );
};
