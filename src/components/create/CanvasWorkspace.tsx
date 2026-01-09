import React, { forwardRef } from "react";
import { Play, Pause, Maximize, Minimize } from "lucide-react";

interface CanvasWorkspaceProps {
    aspectRatio?: number;
    isPlaying?: boolean;
    onPlayPause?: () => void;
    onToggleFullscreen?: () => void;
    isFullscreen?: boolean;
    hideOverlayControls?: boolean;
    activeGuide?: string;
}

export const CanvasWorkspace = forwardRef<HTMLCanvasElement, CanvasWorkspaceProps>((props, ref) => {

    const renderGuideOverlay = () => {
        switch (props.activeGuide) {
            case 'thirds':
                return (
                    <div className="absolute inset-0 pointer-events-none z-30 opacity-50">
                        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-cyan-400/50 shadow-[0_0_2px_rgba(34,211,238,0.8)]"></div>
                        <div className="absolute right-1/3 top-0 bottom-0 w-px bg-cyan-400/50 shadow-[0_0_2px_rgba(34,211,238,0.8)]"></div>
                        <div className="absolute top-1/3 left-0 right-0 h-px bg-cyan-400/50 shadow-[0_0_2px_rgba(34,211,238,0.8)]"></div>
                        <div className="absolute bottom-1/3 left-0 right-0 h-px bg-cyan-400/50 shadow-[0_0_2px_rgba(34,211,238,0.8)]"></div>
                    </div>
                );
            case 'center':
                return (
                    <div className="absolute inset-0 pointer-events-none z-30 opacity-50">
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-400/50 shadow-[0_0_2px_rgba(34,211,238,0.8)]"></div>
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-400/50 shadow-[0_0_2px_rgba(34,211,238,0.8)]"></div>
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-cyan-400/30 rounded-full"></div>
                    </div>
                );
            case 'golden':
                return (
                    <div className="absolute inset-0 pointer-events-none z-30 opacity-50">
                        {/* Golden Ratio ~ 0.618 and 0.382 */}
                        <div className="absolute left-[38.2%] top-0 bottom-0 w-px bg-cyan-400/50 shadow-[0_0_2px_rgba(34,211,238,0.8)]"></div>
                        <div className="absolute left-[61.8%] top-0 bottom-0 w-px bg-cyan-400/50 shadow-[0_0_2px_rgba(34,211,238,0.8)]"></div>
                        <div className="absolute top-[38.2%] left-0 right-0 h-px bg-cyan-400/50 shadow-[0_0_2px_rgba(34,211,238,0.8)]"></div>
                        <div className="absolute top-[61.8%] left-0 right-0 h-px bg-cyan-400/50 shadow-[0_0_2px_rgba(34,211,238,0.8)]"></div>
                    </div>
                );
            case 'safe':
                return (
                    <div className="absolute inset-0 pointer-events-none z-30 opacity-50">
                        {/* Action Safe 90% */}
                        <div className="absolute inset-[5%] border border-green-400/40 shadow-[0_0_2px_rgba(74,222,128,0.5)]"></div>
                        <div className="absolute top-2 left-[5%] text-[10px] text-green-400 font-mono">ACTION SAFE</div>

                        {/* Title Safe 80% */}
                        <div className="absolute inset-[10%] border border-cyan-400/40 shadow-[0_0_2px_rgba(34,211,238,0.5)]"></div>
                        <div className="absolute top-[calc(10%+4px)] left-[10%] text-[10px] text-cyan-400 font-mono">TITLE SAFE</div>

                        {/* Center Cross */}
                        <div className="absolute left-1/2 top-[10%] bottom-[10%] w-px bg-white/10"></div>
                        <div className="absolute top-1/2 left-[10%] right-[10%] h-px bg-white/10"></div>
                    </div>
                );
            default:
                return null;
        }
    };
    return (
        <div className="flex-1 flex items-center justify-center overflow-hidden min-w-0 min-h-0 bg-slate-50 dark:bg-neutral-950 p-2 md:p-8">
            <div
                style={{ aspectRatio: props.aspectRatio || 16 / 9 }}
                className="shadow-2xl shadow-slate-300 dark:shadow-neutral-950 border border-slate-200 dark:border-neutral-800 ring-4 ring-slate-100 dark:ring-neutral-900 rounded-sm overflow-hidden w-auto h-auto max-w-full max-h-full block relative group"
            >
                <canvas
                    ref={ref}
                    width={1920}
                    height={1080}
                    className="w-full h-full bg-white dark:bg-slate-900 block cursor-crosshair"
                />

                {/* Guide Overlay */}
                {renderGuideOverlay()}

                {/* Control Overlay */}
                {!props.hideOverlayControls && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 bg-slate-900/80 backdrop-blur text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                props.onPlayPause?.();
                            }}
                            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                            title={props.isPlaying ? "Pause" : "Play"}
                        >
                            {props.isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                        </button>

                        <div className="w-px h-4 bg-white/20 mx-1" />

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                props.onToggleFullscreen?.();
                            }}
                            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                            title={props.isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        >
                            {props.isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

CanvasWorkspace.displayName = "CanvasWorkspace";
