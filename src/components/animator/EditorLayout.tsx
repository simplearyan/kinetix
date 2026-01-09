import React, { useRef } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { MyRemotionRoot } from '../../remotion/Root';
import { BarChartRace } from '../../remotion/compositions/BarChartRace';
import { MathFormula } from '../../remotion/compositions/MathFormula';
import { CodeBlock } from '../../remotion/compositions/CodeBlock';
import PropertyPanel from './PropertyPanel';
import { useAnimatorStore } from '../../store/animatorStore';
import ExportDialog from './ExportDialog';
import CloudRenderingDialog from './CloudRenderingDialog';
import { BannerAd, InterstitialAd } from './AdComponents';
import { Cloud, Download, Menu, X } from 'lucide-react';
import { useState } from 'react';

const EditorLayout: React.FC = () => {
    // Mobile: We will just show PropertyPanel in the bottom section
    // Desktop: 'Library' is left, 'PropertyPanel' content is right.

    const {
        currentLatex,
        setIsExportOpen,
        setIsCloudRenderOpen,
        activeCompositionId,
        setActiveCompositionId,
        barChartData,
        currentCode,
        setIsInterstitialOpen,
        backgroundColor, // Get background color
        canvasSize // Get canvas size
    } = useAnimatorStore();

    const [isLibraryOpen, setIsLibraryOpen] = useState(false);

    const playerRef = useRef<PlayerRef>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Dynamic props based on composition
    const inputProps = (() => {
        const baseProps = { style: { backgroundColor } }; // Pass background color
        switch (activeCompositionId) {
            case 'BarChartRace': return { ...baseProps, data: barChartData };
            case 'CodeBlock': return { ...baseProps, code: currentCode };
            case 'MathFormula': return { ...baseProps, latex: currentLatex };
            default: return baseProps;
        }
    })();

    const activeComponent = (() => {
        switch (activeCompositionId) {
            case 'BarChartRace': return BarChartRace;
            case 'CodeBlock': return CodeBlock;
            case 'MathFormula': return MathFormula;
            default: return MathFormula;
        }
    })();

    const activeDuration = activeCompositionId === 'BarChartRace' ? 1200 : 300; // 300 for code, 120 for math usually but dynamic is better

    return (
        <div className="flex flex-col h-screen w-full bg-[#0F172A] overflow-hidden">
            <InterstitialAd />
            <CloudRenderingDialog />

            {/* Top Bar */}
            <header className="h-14 shrink-0 border-b border-slate-700/50 flex items-center px-4 justify-between bg-[#0F172A]/90 backdrop-blur z-20">
                <div className="flex items-center gap-2">
                    {/* Mobile Library Toggle */}
                    <button
                        onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                        className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        {isLibraryOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <span className="font-bold text-xl tracking-tight text-sky-400">Kinetix</span>
                    <span className="text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded">BETA</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCloudRenderOpen(true)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium px-3 py-2 rounded-lg transition-all hover:bg-white/5"
                        title="Generate GitHub Actions Workflow"
                    >
                        <Cloud size={16} />
                        <span className="hidden sm:inline">Cloud Render</span>
                    </button>
                    <button
                        onClick={() => {
                            // 50% chance to show interstitial before export options
                            if (Math.random() > 0.5) {
                                setIsInterstitialOpen(true);
                            }
                            setIsExportOpen(true);
                        }}
                        className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_-3px_rgba(14,165,233,0.3)] hover:shadow-[0_0_20px_-3px_rgba(14,165,233,0.5)]"
                    >
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex flex-1 overflow-hidden relative">
                <ExportDialog
                    playerRef={playerRef}
                    wrapperRef={wrapperRef}
                    durationInFrames={activeDuration}
                    component={activeComponent}
                    inputProps={inputProps}
                    width={canvasSize.width}
                    height={canvasSize.height}
                />

                {/* Mobile Library Drawer (Overlay) */}
                {isLibraryOpen && (
                    <div className="lg:hidden absolute inset-0 z-50 bg-[#0F172A]/95 backdrop-blur-md flex flex-col">
                        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                            <h3 className="font-bold text-slate-200">Library</h3>
                            <button onClick={() => setIsLibraryOpen(false)} className="p-2 text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto">
                            <div className="grid gap-3">
                                <div
                                    onClick={() => { setActiveCompositionId('BarChartRace'); useAnimatorStore.getState().setActiveTab('data'); setIsLibraryOpen(false); }}
                                    className={`p-4 border rounded-xl transition-all cursor-pointer ${activeCompositionId === 'BarChartRace' ? 'bg-sky-500/20 border-sky-500/50' : 'bg-slate-800/60 border-slate-700/50'}`}
                                >
                                    <div className="font-bold text-slate-200 mb-1">Bar Chart Race</div>
                                    <div className="text-sm text-slate-400">Visualize data ranking over time.</div>
                                </div>
                                <div
                                    onClick={() => { setActiveCompositionId('CodeBlock'); useAnimatorStore.getState().setActiveTab('code'); setIsLibraryOpen(false); }}
                                    className={`p-4 border rounded-xl transition-all cursor-pointer ${activeCompositionId === 'CodeBlock' ? 'bg-sky-500/20 border-sky-500/50' : 'bg-slate-800/60 border-slate-700/50'}`}
                                >
                                    <div className="font-bold text-slate-200 mb-1">Code Typewriter</div>
                                    <div className="text-sm text-slate-400">Animate code snippets typing.</div>
                                </div>
                                <div
                                    onClick={() => { setActiveCompositionId('MathFormula'); useAnimatorStore.getState().setActiveTab('math'); setIsLibraryOpen(false); }}
                                    className={`p-4 border rounded-xl transition-all cursor-pointer ${activeCompositionId === 'MathFormula' ? 'bg-sky-500/20 border-sky-500/50' : 'bg-slate-800/60 border-slate-700/50'}`}
                                >
                                    <div className="font-bold text-slate-200 mb-1">Math Formula</div>
                                    <div className="text-sm text-slate-400">KaTeX rendering with spring pop.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Left Sidebar (Desktop Only) */}
                <div className="hidden lg:flex w-72 shrink-0 border-r border-slate-700/50 bg-[#0F172A] flex-col z-10">
                    <div className="p-4 border-b border-slate-700/30">
                        <h3 className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Library</h3>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="grid gap-3">
                            <div
                                onClick={() => { setActiveCompositionId('BarChartRace'); useAnimatorStore.getState().setActiveTab('data'); }}
                                className={`p-3 border rounded-lg transition-all cursor-pointer group ${activeCompositionId === 'BarChartRace' ? 'bg-sky-500/10 border-sky-500/50' : 'bg-slate-800/40 border-slate-700/50 hover:border-sky-500/40 hover:bg-slate-800/60'}`}
                            >
                                <div className="font-medium text-slate-200 text-sm mb-1 group-hover:text-sky-300">Bar Chart Race</div>
                                <div className="text-xs text-slate-500">Visualize data ranking over time.</div>
                            </div>
                            <div
                                onClick={() => { setActiveCompositionId('CodeBlock'); useAnimatorStore.getState().setActiveTab('code'); }}
                                className={`p-3 border rounded-lg transition-all cursor-pointer group ${activeCompositionId === 'CodeBlock' ? 'bg-sky-500/10 border-sky-500/50' : 'bg-slate-800/40 border-slate-700/50 hover:border-sky-500/40 hover:bg-slate-800/60'}`}
                            >
                                <div className="font-medium text-slate-200 text-sm mb-1 group-hover:text-sky-300">Code Typewriter</div>
                                <div className="text-xs text-slate-500">Animate code snippets typing.</div>
                            </div>
                            <div
                                onClick={() => { setActiveCompositionId('MathFormula'); useAnimatorStore.getState().setActiveTab('math'); }}
                                className={`p-3 border rounded-lg transition-all cursor-pointer group ${activeCompositionId === 'MathFormula' ? 'bg-sky-500/10 border-sky-500/50' : 'bg-slate-800/40 border-slate-700/50 hover:border-sky-500/40 hover:bg-slate-800/60'}`}
                            >
                                <div className="font-medium text-slate-200 text-sm mb-1 group-hover:text-sky-300">Math Formula</div>
                                <div className="text-xs text-slate-500">KaTeX rendering with spring pop.</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center Canvas (Responsive) */}
                <div className="flex-1 flex flex-col bg-[#020617] relative overflow-hidden">
                    {/* Player Container */}
                    <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 overflow-hidden">
                        <div ref={wrapperRef} style={{ aspectRatio: `${canvasSize.width}/${canvasSize.height}` }} className="w-full max-w-5xl max-h-[70vh] rounded-xl overflow-hidden shadow-2xl border border-slate-800 ring-1 ring-slate-700/50 bg-black relative z-10 transition-all duration-300">
                            <Player
                                ref={playerRef}
                                component={activeComponent}
                                durationInFrames={activeDuration}
                                fps={30}
                                compositionWidth={canvasSize.width}
                                compositionHeight={canvasSize.height}
                                style={{ width: '100%', height: '100%' }}
                                controls
                                inputProps={inputProps}
                            />
                        </div>

                        {/* Banner Ad Placement */}
                        <div className="mt-8 w-full max-w-5xl hidden lg:block">
                            <BannerAd />
                        </div>
                    </div>

                    {/* Mobile: Bottom Sheet / Property Panel Area */}
                    <div className="lg:hidden h-[55%] bg-[#0F172A] border-t border-slate-700 flex flex-col shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.5)] z-20">
                        <PropertyPanel />
                    </div>
                </div>

                {/* Right Sidebar (Desktop Only) */}
                <div className="hidden lg:flex w-80 shrink-0 border-l border-slate-700/50 bg-[#0F172A] flex-col z-10">
                    <PropertyPanel />
                </div>
            </div>
        </div>
    );
};

export default EditorLayout;
