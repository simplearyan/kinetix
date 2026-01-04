import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, SkipBack } from "lucide-react";

interface TimelineProps {
    currentTime: number;
    totalDuration: number;
    isPlaying: boolean;
    onPlayPause: () => void;
    onSeek: (time: number) => void;
}

export const Timeline = ({
    currentTime,
    totalDuration,
    isPlaying,
    onPlayPause,
    onSeek
}: TimelineProps) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleSeek = (e: React.MouseEvent | MouseEvent) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const pct = x / rect.width;
        onSeek(pct * totalDuration);
    };

    useEffect(() => {
        if (!isDragging) return;
        const onMove = (e: MouseEvent) => handleSeek(e);
        const onUp = () => setIsDragging(false);

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, [isDragging]);

    const progress = (currentTime / totalDuration) * 100;

    return (
        <div className="w-full h-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur rounded-2xl shadow-xl border border-slate-200 dark:border-neutral-800 flex flex-col p-3 lg:p-4 relative">
            {/* Controls */}
            <div className="flex items-center justify-between mb-2 lg:mb-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onPlayPause}
                        className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all active:scale-95"
                    >
                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                    </button>
                    <button
                        onClick={() => onSeek(0)}
                        className="w-8 h-8 rounded-full bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-600 dark:text-neutral-400 hidden lg:flex items-center justify-center transition-all"
                    >
                        <SkipBack size={14} />
                    </button>

                    <div className="font-mono text-xs font-semibold text-slate-700 dark:text-neutral-300 ml-4">
                        {(currentTime / 1000).toFixed(2)}s <span className="text-slate-400">/</span> {(totalDuration / 1000).toFixed(2)}s
                    </div>
                </div>
            </div>

            {/* Tracks Area */}
            <div className="h-2 mt-1 lg:h-auto lg:mt-0 flex-1 bg-slate-100 lg:bg-slate-50 dark:bg-white/5 lg:dark:bg-neutral-950 rounded lg:border border-slate-200 dark:border-neutral-800 relative overflow-hidden group">

                {/* Scrubber Area */}
                <div
                    ref={trackRef}
                    className="absolute inset-0 z-20 cursor-pointer"
                    onMouseDown={(e) => {
                        setIsDragging(true);
                        handleSeek(e);
                    }}
                >
                    {/* Playhead */}
                    <div
                        className="absolute top-0 bottom-0 w-px bg-blue-500 pointer-events-none"
                        style={{ left: `${progress}%` }}
                    >
                        <div className="absolute top-0 -translate-x-1/2 -mt-1 w-3 h-3 bg-blue-500 rotate-45 rounded-sm"></div>
                    </div>
                </div>

                {/* Fake Tracks for visuals */}
                <div className="absolute top-2 left-0 right-0 h-8 bg-blue-100/50 dark:bg-blue-900/20 border-b border-white/10 mx-2 rounded px-2 hidden lg:flex items-center text-[10px] text-blue-600 font-bold">
                    Text Layer 1
                </div>
                <div className="absolute top-12 left-0 right-0 h-8 bg-purple-100/50 dark:bg-purple-900/20 border-b border-white/10 mx-2 rounded px-2 hidden lg:flex items-center text-[10px] text-purple-600 font-bold">
                    Chart Animation
                </div>
            </div>
        </div>
    );
};
