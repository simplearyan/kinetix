import React from 'react';
import { useAnimatorStore } from '../../../store/animatorStore';

const StyleEditor: React.FC = () => {
    const { backgroundColor, setBackgroundColor, aspectRatio, setAspectRatio } = useAnimatorStore();

    const presets = [
        '#1E1E1E', // Default Dark
        '#000000', // Black
        '#FFFFFF', // White
        '#0F172A', // Slate 900
        '#1e293b', // Slate 800
        '#4338ca', // Indigo 700
        '#be123c', // Rose 700
        '#15803d', // Green 700
    ];

    return (
        <div className="p-4 space-y-8">
            {/* Aspect Ratio Section */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300">Aspect Ratio</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['16:9', '9:16', '1:1', '3:4', '4:3', '4:5'] as const).map((ratio) => (
                        <button
                            key={ratio}
                            onClick={() => setAspectRatio(ratio)}
                            className={`
                                py-2 px-3 rounded-lg text-sm font-medium transition-all border
                                ${aspectRatio === ratio
                                    ? 'bg-sky-500/20 border-sky-500 text-sky-400 shadow-[0_0_15px_-3px_rgba(14,165,233,0.3)]'
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                                }
                            `}
                        >
                            {ratio}
                        </button>
                    ))}
                </div>
            </div>

            {/* Background Color Section */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300">Background Color</label>

                <div className="flex gap-3 items-center">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-600 shadow-sm cursor-pointer group">
                        <input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer p-0 border-0"
                        />
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none font-mono"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-8 gap-2 mt-2">
                    {presets.map((color) => (
                        <button
                            key={color}
                            onClick={() => setBackgroundColor(color)}
                            className={`w-8 h-8 rounded-full border border-slate-600 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 ${backgroundColor === color ? 'ring-2 ring-white' : ''}`}
                            style={{ backgroundColor: color }}
                            title={color}
                        />
                    ))}
                </div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <p className="text-xs text-slate-400 leading-relaxed">
                    Set the global style for your animation. Aspect ratio determines the dimensions of the exported video.
                </p>
            </div>
        </div>
    );
};

export default StyleEditor;
