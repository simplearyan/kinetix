import React, { useState } from 'react';
import { useAnimatorStore } from '../../../store/animatorStore';

const CodeEditor: React.FC = () => {
    const { currentCode, setCurrentCode } = useAnimatorStore();
    const [language, setLanguage] = useState('javascript');
    const [theme, setTheme] = useState('dracula');

    // Line Numbers & Typewriter toggles can be local UI state for now
    // or moved to store if they affect the composition (they should).
    // For MVP, we stick to just editing text.

    const predefinedSnippet = `function hello() {\n  console.log("Hello Kinetix");\n}`;

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-300">Code Source</h3>
            </div>

            {/* Language & Theme Controls */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium ml-1">Language</label>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded px-2 py-1.5 focus:outline-none focus:border-sky-500/50"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="python">Python</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium ml-1">Theme</label>
                    <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded px-2 py-1.5 focus:outline-none focus:border-sky-500/50"
                    >
                        <option value="dracula">Dracula</option>
                        <option value="github-dark">GitHub Dark</option>
                    </select>
                </div>
            </div>

            {/* Code Area */}
            <div className="relative">
                <textarea
                    className="w-full h-60 bg-[#1E1E1E] border border-slate-700 rounded-lg p-3 text-sm font-mono text-slate-300 focus:outline-none focus:border-sky-500/50 resize-y"
                    placeholder="Paste code here..."
                    spellCheck={false}
                    value={currentCode}
                    onChange={(e) => setCurrentCode(e.target.value)}
                />
                <div className="absolute top-2 right-2 flex gap-1">
                    <button
                        onClick={() => setCurrentCode(predefinedSnippet)}
                        className="text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-300 px-1.5 py-0.5 rounded opacity-50 hover:opacity-100 transition-all"
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0 checked:bg-sky-500 cursor-pointer" defaultChecked />
                    <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Line Numbers</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0 checked:bg-sky-500 cursor-pointer" defaultChecked />
                    <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Typewriter Effect</span>
                </label>
            </div>
        </div>
    );
};

export default CodeEditor;
