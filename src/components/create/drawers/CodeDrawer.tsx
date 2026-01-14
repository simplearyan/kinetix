import React from "react";
import { Engine } from "../../../engine/Core";
import { CODE_OPTIONS, createCode } from "../../../data/codeOptions";
import { BottomSheet } from "../panels/BottomSheet";

interface CodeDrawerProps {
    engine: Engine | null;
    isOpen: boolean;
    onClose: () => void;
}

export const CodeDrawerContent: React.FC<{ engine: Engine | null; onClose: () => void }> = ({ engine, onClose }) => {
    const handleAdd = (type: any) => {
        if (!engine) return;
        createCode(engine, type);
        onClose();
    };

    return (
        <div className="space-y-4 px-2">
            {CODE_OPTIONS.map((opt) => (
                <button
                    key={opt.type}
                    onClick={() => handleAdd(opt.type)}
                    className="w-full text-left p-1 bg-slate-900 rounded-xl shadow-lg hover:ring-2 ring-blue-500 transition-all group overflow-hidden"
                >
                    <div className="bg-slate-800/50 p-2 flex gap-1.5 border-b border-white/5">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                    <div className="p-4 font-mono text-xs">
                        <span className="text-blue-400">console</span>
                        <span className="text-white">.log(</span>
                        <span className="text-green-400">'Code Block'</span>
                        <span className="text-white">)</span>
                    </div>
                </button>
            ))}
        </div>
    );
};

export const CodeDrawer: React.FC<CodeDrawerProps> = ({ engine, isOpen, onClose }) => {
    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title="Code Blocks"
            initialSnap={0.5}
            snaps={[0.5, 0.9]}
        >
            <CodeDrawerContent engine={engine} onClose={onClose} />
        </BottomSheet>
    );
};
