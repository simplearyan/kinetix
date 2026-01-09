import React from 'react';
import { useAnimatorStore } from '../../../store/animatorStore';

const StyleEditor: React.FC = () => {
    const {
        backgroundColor, setBackgroundColor,
        aspectRatio, setAspectRatio,
        activeCompositionId,
        barChartStyle, setBarChartStyle
    } = useAnimatorStore();

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

            {/* Contextual: Bar Chart Settings */}
            {activeCompositionId === 'BarChartRace' && (
                <div className="space-y-4 pt-4 border-t border-slate-700/50">
                    <h4 className="text-sm font-medium text-slate-300">Chart Settings</h4>

                    {/* Font Size */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>Font Size</span>
                            <span>{barChartStyle.fontSize}px</span>
                        </div>
                        <input
                            type="range"
                            min="12"
                            max="72"
                            value={barChartStyle.fontSize}
                            onChange={(e) => setBarChartStyle({ fontSize: Number(e.target.value) })}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />
                    </div>

                    {/* Bar Height */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>Bar Height</span>
                            <span>{barChartStyle.barHeight}px</span>
                        </div>
                        <input
                            type="range"
                            min="20"
                            max="150"
                            value={barChartStyle.barHeight}
                            onChange={(e) => setBarChartStyle({ barHeight: Number(e.target.value) })}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />
                    </div>

                    {/* Gap */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>Bar Gap</span>
                            <span>{barChartStyle.gap}px</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="50"
                            value={barChartStyle.gap}
                            onChange={(e) => setBarChartStyle({ gap: Number(e.target.value) })}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />
                    </div>

                    {/* Padding / Scale */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>Padding</span>
                            <span>{barChartStyle.containerPadding}px</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="400"
                            value={barChartStyle.containerPadding}
                            onChange={(e) => setBarChartStyle({ containerPadding: Number(e.target.value) })}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />
                    </div>

                    {/* Animation Speed (Duration per Round) */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>Speed (Frames per Year)</span>
                            <span>{barChartStyle.roundDuration}</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="120"
                            value={barChartStyle.roundDuration || 60}
                            onChange={(e) => setBarChartStyle({ roundDuration: Number(e.target.value) })}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 px-1">
                            <span>Fast</span>
                            <span>Slow</span>
                        </div>
                    </div>
                </div>
            )}

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
