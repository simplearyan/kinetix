import React, { useEffect, useState } from 'react';
import { useAnimatorStore } from '../../../store/animatorStore';

const MathEditor: React.FC = () => {
    const { currentLatex, setCurrentLatex } = useAnimatorStore();
    const [localLatex, setLocalLatex] = useState(currentLatex);

    // Sync local state when store changes (e.g. initial load)
    useEffect(() => {
        setLocalLatex(currentLatex);
    }, [currentLatex]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newVal = e.target.value;
        setLocalLatex(newVal);
        setCurrentLatex(newVal);
    };

    const handleSymbolClick = (insert: string) => {
        const newVal = localLatex + insert;
        setLocalLatex(newVal);
        setCurrentLatex(newVal);
    };

    const symbols = [
        { label: '√', insert: '\\sqrt{}' },
        { label: 'π', insert: '\\pi' },
        { label: '∑', insert: '\\sum' },
        { label: '∫', insert: '\\int' },
        { label: '∞', insert: '\\infty' },
        { label: '≠', insert: '\\neq' },
        { label: 'x²', insert: '^2' },
        { label: 'frac', insert: '\\frac{}{}' },
    ];

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-300">LaTeX Formula</h3>
            </div>

            {/* Symbol Shortcuts */}
            <div className="grid grid-cols-4 gap-2">
                {symbols.map((sym) => (
                    <button
                        key={sym.label}
                        onClick={() => handleSymbolClick(sym.insert)}
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-sky-400 py-1.5 rounded text-sm font-mono transition-colors"
                        title={sym.insert}
                    >
                        {sym.label}
                    </button>
                ))}
            </div>

            {/* Text Area */}
            <div className="relative">
                <textarea
                    className="w-full h-40 bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm font-mono text-slate-200 focus:outline-none focus:border-sky-500/50 resize-none font-ligature-none"
                    placeholder="Enter LaTeX here..."
                    value={localLatex}
                    onChange={handleChange}
                />
                <div className="absolute bottom-2 right-2 text-xs text-slate-600">
                    KaTeX supported
                </div>
            </div>

            {/* Preview Hint */}
            <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
                <p className="text-xs text-slate-500">
                    Tip: Wrap your math in <code className="text-sky-400">\text{ }</code> to render regular text inside a formula.
                </p>
            </div>
        </div>
    );
};

export default MathEditor;
