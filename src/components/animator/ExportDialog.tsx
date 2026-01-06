import React, { useState, useRef, useEffect } from 'react';
import { useAnimatorStore } from '../../store/animatorStore';
import type { PlayerRef } from '@remotion/player';
import { toBlob } from 'html-to-image';
import download from 'downloadjs';

// Worker import removed, using URL constructor below

const ExportDialog: React.FC<{ playerRef: React.RefObject<PlayerRef | null>, wrapperRef: React.RefObject<HTMLDivElement | null>, durationInFrames: number }> = ({ playerRef, wrapperRef, durationInFrames }) => {
    const { isExportOpen, setIsExportOpen } = useAnimatorStore();
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'rendering' | 'encoding' | 'complete' | 'error'>('idle');
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
    const workerRef = useRef<Worker | null>(null);

    // Initial worker setup
    useEffect(() => {
        if (!workerRef.current) {
            // Use standard Vite/ESM worker instantiation
            workerRef.current = new Worker(
                new URL('../../engine/workers/export.worker.ts', import.meta.url),
                { type: 'module' }
            );
            workerRef.current.onmessage = (e) => {
                const { type, data, error } = e.data;
                if (type === 'PROGRESS') {
                    // Worker queue progress (encoding)
                    // We handle main progress via the loop below, but this is good for debug
                    console.log('Encoder queue:', data.queueSize);
                } else if (type === 'COMPLETE') {
                    const blob = new Blob([data], { type: 'video/webm' });
                    setVideoBlob(blob);
                    setStatus('complete');
                    setProgress(100);
                } else if (type === 'ERROR') {
                    console.error("Worker Error:", error);
                    setStatus('error');
                }
            };
        }
    }, []);

    const startExport = async () => {
        if (!playerRef.current) return;
        setStatus('rendering');
        setProgress(0);

        const width = 1920;
        const height = 1080;
        const fps = 30;

        const durationInMs = (durationInFrames / fps) * 1000;

        // 1. Configure Worker
        workerRef.current?.postMessage({
            type: 'CONFIG',
            data: {
                width,
                height,
                fps,
                bitrate: 6_000_000,
                duration: durationInMs
            }
        });

        // 2. Capture Loop

        for (let i = 0; i < durationInFrames; i++) {
            playerRef.current.seekTo(i);

            // Wait for React to render frame (approx 1 frame time + buffer)
            await new Promise(r => setTimeout(r, 80)); // Slightly increased buffer

            // Use the wrapper ref passed from parent
            const containerToCapture = wrapperRef.current;

            if (containerToCapture) {
                // Calculate scale to force 1080p output regardless of screen size
                // Strategy: Force the cloned node to have 1920x1080 dimensions.
                // Remotion Player (and our content) is responsive, so it should fill this new size.

                const blob = await toBlob(containerToCapture, {
                    width: 1920,
                    height: 1080,
                    skipFonts: true,
                    // Remove pixelRatio - let's rely on native layout scaling
                    style: {
                        transform: 'none',
                        borderRadius: '0px',
                        border: 'none',
                        boxShadow: 'none',
                        width: '1920px',
                        height: '1080px',
                        maxWidth: 'none',
                        maxHeight: 'none',
                        margin: '0',
                        padding: '0',
                        top: '0',
                        left: '0'
                    }
                });

                if (blob) {
                    const bitmap = await createImageBitmap(blob);

                    // Send to worker
                    workerRef.current?.postMessage({
                        type: 'ENCODE_FRAME',
                        data: {
                            bitmap,
                            timestamp: (i / fps) * 1_000_000, // Microseconds!
                            keyFrame: i % 30 === 0,
                            duration: (1 / fps) * 1_000_000 // Microseconds
                        }
                    }, [bitmap]); // Transferable
                }
            }

            setProgress(Math.round((i / durationInFrames) * 90)); // 0-90% is rendering
        }

        setStatus('encoding'); // Finalizing
        workerRef.current?.postMessage({ type: 'FINALIZE' });
    };

    const handleDownload = () => {
        if (videoBlob) {
            download(videoBlob, 'kinetix-export.webm', 'video/webm');
        }
    };

    if (!isExportOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
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
                </p>

                {status === 'idle' && (
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm text-slate-300 bg-slate-800 p-3 rounded">
                            <span>Format</span>
                            <span className="font-mono text-sky-400">WEBM (1080p)</span>
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
                                className="bg-sky-500 h-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-center text-sm text-sky-400 animate-pulse">
                            {status === 'rendering' ? `Rendering Frame ${Math.round(progress * 1.2)}...` : 'Finalizing...'}
                        </p>
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
