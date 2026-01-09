import React, { useState, useEffect, useRef } from 'react';
import { useAnimatorStore } from '../../store/animatorStore';
import { Player, type PlayerRef } from '@remotion/player';
import { toBlob } from 'html-to-image';
import download from 'downloadjs';

interface ExportDialogProps {
    playerRef: React.RefObject<PlayerRef | null>;
    wrapperRef: React.RefObject<HTMLDivElement | null>;
    durationInFrames: number;
    component: React.ComponentType<any>;
    inputProps: any;
    width: number;
    height: number;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ durationInFrames, component, inputProps, width, height }) => {
    const { isExportOpen, setIsExportOpen } = useAnimatorStore();
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'rendering' | 'encoding' | 'complete' | 'error'>('idle');
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
    const [exportLogs, setExportLogs] = useState<string[]>([]);
    const [isMp4, setIsMp4] = useState(true);
    const workerRef = useRef<Worker | null>(null);

    // Dedicated ref for the off-screen export player
    const exportPlayerRef = useRef<PlayerRef>(null);
    const exportContainerRef = useRef<HTMLDivElement>(null);

    // Initial worker setup
    useEffect(() => {
        if (!workerRef.current) {
            workerRef.current = new Worker(
                new URL('../../engine/workers/export.worker.ts', import.meta.url),
                { type: 'module' }
            );
            workerRef.current.onmessage = (e) => {
                const { type, data, error, message } = e.data;
                if (type === 'LOG') {
                    setExportLogs(prev => [...prev, `[Worker] ${message}`].slice(-20));
                } else if (type === 'COMPLETE') {
                    const blob = new Blob([data], { type: isMp4 ? 'video/mp4' : 'video/webm' });
                    setVideoBlob(blob);
                    setStatus('complete');
                    setProgress(100);
                } else if (type === 'ERROR') {
                    console.error("Worker Error:", error);
                    setExportLogs(prev => [...prev, `[Error] ${error}`]);
                    setStatus('error');
                }
            };
        }
    }, [isMp4]);

    const startExport = async () => {
        if (!exportPlayerRef.current || !exportContainerRef.current) {
            console.error("Export player not ready");
            setExportLogs(prev => [...prev, "[Error] Export player not ready"]);
            return;
        }

        setStatus('rendering');
        setProgress(0);

        const fps = 30;
        const durationInMs = (durationInFrames / fps) * 1000;

        // 1. Configure Worker
        setExportLogs(['Starting Export...', `Resolution: ${width}x${height}`]);

        const format = isMp4 ? 'mp4' : 'webm';
        workerRef.current?.postMessage({
            type: 'CONFIG',
            data: {
                width,
                height,
                fps,
                bitrate: 6_000_000,
                duration: durationInMs,
                format // 'mp4' or 'webm'
            }
        });

        // Semaphore System
        let credits = 3;
        const creditListener = (e: MessageEvent) => {
            if (e.data.type === 'FRAME_DONE') {
                credits++;
            }
        };
        workerRef.current?.addEventListener('message', creditListener);

        // 2. Capture Loop
        try {
            for (let i = 0; i < durationInFrames; i++) {
                if (status === 'error') break;

                // Backpressure
                while (credits <= 0) {
                    await new Promise(r => setTimeout(r, 10));
                }
                credits--;

                // Seek the EXPORT player
                exportPlayerRef.current.seekTo(i);

                // Wait for paint (Double RAF)
                await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

                // Capture the off-screen container
                const containerToCapture = exportContainerRef.current;

                if (containerToCapture) {
                    const blob = await toBlob(containerToCapture, {
                        width: width,
                        height: height,
                        skipFonts: true,
                        style: {
                            visibility: 'visible',
                            transform: 'none', // Ensure nans logic
                            margin: '0',
                            padding: '0'
                        }
                    });

                    if (blob) {
                        const bitmap = await createImageBitmap(blob);
                        workerRef.current?.postMessage({
                            type: 'ENCODE_FRAME',
                            data: {
                                bitmap,
                                timestamp: (i * 1000000) / fps,
                                keyFrame: i % 30 === 0,
                                duration: 1000000 / fps
                            }
                        }, [bitmap]);
                    }
                }
                setProgress(Math.round((i / durationInFrames) * 90));
            }

            setStatus('encoding'); // Finalizing
            workerRef.current?.postMessage({ type: 'FINALIZE' });
        } catch (e) {
            console.error(e);
            setStatus('error');
        } finally {
            workerRef.current?.removeEventListener('message', creditListener);
        }
    };

    const handleDownload = () => {
        if (videoBlob) {
            download(videoBlob, `kinetix-export.${isMp4 ? 'mp4' : 'webm'}`, isMp4 ? 'video/mp4' : 'video/webm');
        }
    };

    if (!isExportOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            {/* Off-Screen Player for Rendering */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: '200vw', // Move WAY off-screen, right? Or just 100vw.
                    width: `${width}px`,
                    height: `${height}px`,
                    zIndex: -9999,
                    visibility: 'visible', // Must be visible for html-to-image
                    background: 'black',
                    pointerEvents: 'none'
                }}
            >
                <div ref={exportContainerRef} style={{ width: '100%', height: '100%' }}>
                    <Player
                        ref={exportPlayerRef}
                        component={component}
                        durationInFrames={durationInFrames}
                        fps={30}
                        compositionWidth={width}
                        compositionHeight={height}
                        style={{ width: '100%', height: '100%' }}
                        inputProps={inputProps}
                        controls={false}
                        autoPlay={false} // Manual seeking
                    />
                </div>
            </div>

            <div className="w-full max-w-md bg-[#1E293B] border border-slate-700 rounded-xl p-6 shadow-2xl relative">
                <button
                    onClick={() => setIsExportOpen(false)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white"
                >
                    ✕
                </button>

                <h2 className="text-xl font-bold text-white mb-2">Export Video</h2>
                <p className="text-slate-400 text-sm mb-6">
                    Rendering locally using your device power.
                    <br />
                    <span className="text-xs text-slate-500 font-mono">Output: {width}x{height} @ 30fps</span>
                </p>

                {status === 'idle' && (
                    <div className="space-y-4">
                        <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
                            <button
                                onClick={() => setIsMp4(true)}
                                className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${isMp4 ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                MP4 (Best)
                            </button>
                            <button
                                onClick={() => setIsMp4(false)}
                                className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${!isMp4 ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                WebM (Web)
                            </button>
                        </div>
                        <button
                            onClick={startExport}
                            className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-3 rounded-lg transition-all shadow-[0_0_20px_-5px_rgba(14,165,233,0.4)]"
                        >
                            Start Render
                        </button>
                    </div>
                )}

                {(status === 'rendering' || status === 'encoding') && (
                    <div className="space-y-4">
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-sky-500 h-full transition-all duration-300 transform origin-left"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-center text-sm text-sky-400 animate-pulse font-mono">
                            {status === 'rendering' ? `Processing Frame ${Math.round(progress * 1.2)}...` : 'Finalizing...'}
                        </p>

                        {/* Log Terminal */}
                        <div className="w-full bg-black/50 rounded-lg p-2 h-24 overflow-y-auto font-mono text-[10px] text-slate-400 border border-slate-700/50">
                            {exportLogs.map((log, i) => (
                                <div key={i} className="whitespace-nowrap">{log}</div>
                            ))}
                            <div ref={el => el?.scrollIntoView({ behavior: "smooth" })} />
                        </div>
                    </div>
                )}

                {status === 'complete' && (
                    <div className="space-y-4 text-center">
                        <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            ✓
                        </div>
                        <p className="text-slate-200">Export Ready!</p>
                        <button
                            onClick={handleDownload}
                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition-colors"
                        >
                            Download .webm
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4 text-center">
                        <p className="text-red-400">Rendering Failed.</p>
                        <button
                            onClick={() => setStatus('idle')}
                            className="text-slate-400 underline hover:text-white"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExportDialog;
