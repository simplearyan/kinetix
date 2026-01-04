import { Scene } from "./Scene";
import { Muxer, ArrayBufferTarget } from "webm-muxer";

export class Engine {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    scene: Scene;

    // Time
    currentTime: number = 0;
    totalDuration: number = 5000;
    isPlaying: boolean = false;
    isLooping: boolean = true;
    playbackRate: number = 1;

    resize(width: number, height: number) {
        if (this.scene.width === 0 || this.scene.height === 0) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.scene.width = width;
            this.scene.height = height;
            this.render();
            // Call resize anyway to set initial aspect?
            this.onResize?.(width, height);
            return;
        }

        const scaleX = width / this.scene.width;
        const scaleY = height / this.scene.height;

        // Use the smaller scale to ensure obj fits in the new view without cropping/overflowing relatively?
        // Or actually, we want layout to "stretch" positions, but "scale" sizes uniformly.
        const sizeScale = Math.min(scaleX, scaleY);
        // Special case: If mostly just resolution upgrade (both > 1), maybe use max? 
        // Or just min is safest to avoid cropping.

        this.canvas.width = width;
        this.canvas.height = height;
        this.scene.width = width;
        this.scene.height = height;

        // Scale all objects
        this.scene.objects.forEach(obj => {
            // Position: Relative to canvas size (Percentage based)
            obj.x *= scaleX;
            obj.y *= scaleY;

            // Size: Uniform scaling to maintain aspect
            obj.width *= sizeScale;
            obj.height *= sizeScale;

            // Props
            if ('fontSize' in obj) {
                (obj as any).fontSize *= sizeScale;
            }
            if ('padding' in obj) {
                (obj as any).padding *= sizeScale;
            }
            if ('lineNumberMargin' in obj) {
                (obj as any).lineNumberMargin *= sizeScale;
            }
        });

        this.render();
        this.onResize?.(width, height);
    }

    // Loop
    private _rafId: number = 0;
    private _lastFrameTime: number = 0;

    // Interaction State
    selectedObjectId: string | null = null;
    private _isDragging = false;
    private _dragStartX = 0;
    private _dragStartY = 0;
    private _initialObjState: { x: number, y: number } | null = null;

    // Event hooks
    onTimeUpdate?: (time: number) => void;
    onPlayStateChange?: (isPlaying: boolean) => void;
    onSelectionChange?: (id: string | null) => void;
    onObjectChange?: () => void; // Generic update for props
    onResize?: (width: number, height: number) => void;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Failed to get 2D context");
        this.ctx = ctx;
        this.scene = new Scene();
        this.scene.onUpdate = () => {
            this.render(); // Always re-render on visual change
            this.onObjectChange?.(); // Notify listeners (UI)
        };

        this._setupInteraction();
        this.render();
    }

    private _setupInteraction() {
        // Mouse Events
        this.canvas.addEventListener("mousedown", (e) => {
            const { x, y } = this._getMousePos(e);
            this._handleStart(x, y);
        });

        window.addEventListener("mousemove", (e) => {
            if (this._isDragging && this.selectedObjectId) {
                const { x, y } = this._getMousePos(e);
                this._handleMove(x, y);
            }
        });

        window.addEventListener("mouseup", () => {
            this._handleEnd();
        });

        // Touch Events
        this.canvas.addEventListener("touchstart", (e) => {
            e.preventDefault(); // Prevent scrolling
            const { x, y } = this._getTouchPos(e);
            this._handleStart(x, y);
        }, { passive: false });

        window.addEventListener("touchmove", (e) => {
            if (this._isDragging && this.selectedObjectId) {
                e.preventDefault(); // Prevent scrolling
                const { x, y } = this._getTouchPos(e);
                this._handleMove(x, y);
            }
        }, { passive: false });

        window.addEventListener("touchend", () => {
            this._handleEnd();
        });
    }

    private _handleStart(x: number, y: number) {
        // Check Hit (Top-most first)
        let hitId = null;
        for (let i = this.scene.objects.length - 1; i >= 0; i--) {
            const obj = this.scene.objects[i];
            if (!obj.visible || obj.locked) continue;
            if (obj.isHit(x, y)) {
                hitId = obj.id;
                break;
            }
        }

        this.selectObject(hitId);

        if (hitId) {
            this._isDragging = true;
            this._dragStartX = x;
            this._dragStartY = y;
            const obj = this.scene.get(hitId);
            if (obj) this._initialObjState = { x: obj.x, y: obj.y };
        }
    }

    private _handleMove(x: number, y: number) {
        const obj = this.scene.get(this.selectedObjectId!);
        if (obj && this._initialObjState) {
            const dx = x - this._dragStartX;
            const dy = y - this._dragStartY;
            obj.x = this._initialObjState.x + dx;
            obj.y = this._initialObjState.y + dy;
            this.render();
            this.onObjectChange?.();
        }
    }

    private _handleEnd() {
        this._isDragging = false;
        this._initialObjState = null;
    }

    private _getMousePos(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    private _getTouchPos(e: TouchEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const touch = e.touches[0] || e.changedTouches[0];
        return {
            x: (touch.clientX - rect.left) * scaleX,
            y: (touch.clientY - rect.top) * scaleY
        };
    }

    selectObject(id: string | null) {
        this.selectedObjectId = id;
        this.render(); // Redraw selection box
        this.onSelectionChange?.(id);
    }

    play() {
        if (this.isPlaying) return;

        if (this.currentTime >= this.totalDuration) {
            this.currentTime = 0;
        }

        this.isPlaying = true;
        this._lastFrameTime = performance.now();
        this._rafId = requestAnimationFrame(this._loop);
        this.onPlayStateChange?.(true);
    }

    pause() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        cancelAnimationFrame(this._rafId);
        this.onPlayStateChange?.(false);
    }

    seek(time: number) {
        this.currentTime = Math.max(0, Math.min(time, this.totalDuration));
        this.render();
        this.onTimeUpdate?.(this.currentTime);
    }

    private _loop = (now: number) => {
        if (!this.isPlaying) return;

        const dt = now - this._lastFrameTime;
        this._lastFrameTime = now;

        let nextTime = this.currentTime + (dt * this.playbackRate);

        if (nextTime >= this.totalDuration) {
            if (this.isLooping) {
                nextTime = 0;
            } else {
                nextTime = this.totalDuration;
                this.pause(); // Stop
            }
        }

        this.currentTime = nextTime;
        this.render();
        this.onTimeUpdate?.(this.currentTime);

        this._rafId = requestAnimationFrame(this._loop);
    }

    render() {
        this.scene.render(this.ctx, this.currentTime);

        // Draw Selection Overlay
        if (this.selectedObjectId && !this.isPlaying) {
            const obj = this.scene.get(this.selectedObjectId);
            if (obj) {
                this.ctx.save();
                this.ctx.strokeStyle = "#3b82f6";
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
                this.ctx.restore();
            }
        }
    }

    async exportVideo(
        duration: number,
        fps: number = 30,
        mode: 'realtime' | 'offline' = 'offline',
        onProgress: (percent: number) => void,
        signal?: AbortSignal
    ): Promise<Blob> {
        return new Promise(async (resolve, reject) => {
            // Force even dimensions for encoder stability
            const evenWidth = this.canvas.width % 2 === 0 ? this.canvas.width : this.canvas.width - 1;
            const evenHeight = this.canvas.height % 2 === 0 ? this.canvas.height : this.canvas.height - 1;

            // Save and disable looping
            const wasLooping = this.isLooping;
            this.isLooping = false;

            if (mode === 'realtime') {
                try {
                    const stream = this.canvas.captureStream(fps);

                    // Use default codec for maximum compatibility
                    // VP8/VP9 specific strings can fail on some systems/drivers
                    const mimeType = "video/webm";
                    console.log("Realtime Export MIME:", mimeType);

                    const recorder = new MediaRecorder(stream, {
                        mimeType,
                        videoBitsPerSecond: 5000000 // 5 Mbps
                    });

                    const chunks: Blob[] = [];
                    recorder.ondataavailable = (e) => {
                        if (e.data.size > 0) chunks.push(e.data);
                    };

                    recorder.onerror = (e) => {
                        console.error("MediaRecorder Error:", e);
                        this.isLooping = wasLooping; // Restore
                        reject(new Error("MediaRecorder Error: " + e.error.message));
                    };

                    const stopPromise = new Promise<Blob>((resolveStop, rejectStop) => {
                        recorder.onstop = () => {
                            const blob = new Blob(chunks, { type: mimeType });
                            console.log("Export Finished. Chunks:", chunks.length, "Total Size:", blob.size);

                            if (blob.size === 0) {
                                rejectStop(new Error("Export failed: Resulting video is empty (0 bytes)."));
                            } else {
                                resolveStop(blob);
                            }
                        };
                    });

                    recorder.start(); // Standard recording (no timeslice)

                    // Realtime: Just play
                    this.currentTime = 0;
                    this.play();

                    const checkInterval = setInterval(async () => {
                        if (signal?.aborted) {
                            clearInterval(checkInterval);
                            this.pause();
                            recorder.stop();
                            this.isLooping = wasLooping; // Restore
                            reject(new Error("Export cancelled"));
                            return;
                        }

                        const progress = (this.currentTime / duration) * 100;
                        onProgress(Math.min(progress, 99));

                        // Check if stopped or reached end
                        if (!this.isPlaying && this.currentTime >= duration) {
                            clearInterval(checkInterval);
                            recorder.stop();
                            onProgress(100);

                            try {
                                const blob = await stopPromise;
                                this.isLooping = wasLooping; // Restore
                                resolve(blob);
                            } catch (e) {
                                this.isLooping = wasLooping; // Restore
                                reject(e);
                            }
                        }
                    }, 100);
                } catch (e) {
                    this.isLooping = wasLooping; // Restore
                    reject(e);
                }

            } else {
                // Offline: Worker-based Frame-by-Frame
                const startTime = performance.now();
                console.log("Starting Offline Export...");

                try {
                    this.pause();
                    const totalFrames = Math.ceil(duration * fps);
                    const dt = 1000 / fps; // in ms
                    const frameDurationUs = 1000000 / fps;

                    // Initialize Worker
                    const worker = new Worker(new URL('./workers/export.worker.ts', import.meta.url), { type: 'module' });

                    worker.postMessage({
                        type: 'CONFIG',
                        data: {
                            width: evenWidth,
                            height: evenHeight,
                            fps,
                            bitrate: 5_000_000
                        }
                    });

                    // Wait for worker ready
                    await new Promise<void>((resolveW, rejectW) => {
                        const initHandler = (e: MessageEvent) => {
                            if (e.data.type === 'READY') {
                                worker.removeEventListener('message', initHandler);
                                resolveW();
                            } else if (e.data.type === 'ERROR') {
                                worker.removeEventListener('message', initHandler);
                                rejectW(new Error(e.data.error));
                            }
                        };
                        worker.addEventListener('message', initHandler);
                    });

                    let queueSize = 0;
                    const progressHandler = (e: MessageEvent) => {
                        if (e.data.type === 'PROGRESS') {
                            queueSize = e.data.data.queueSize;
                        }
                    };
                    worker.addEventListener('message', progressHandler);

                    const BATCH_SIZE = 10; // Process 10 frames before yielding

                    for (let i = 0; i <= totalFrames; i++) {
                        if (signal?.aborted) {
                            worker.terminate();
                            this.isLooping = wasLooping;
                            return reject(new Error("Export cancelled"));
                        }

                        // Backpressure: Check often to prevent OOM
                        while (queueSize > 10) {
                            await new Promise(r => setTimeout(r, 10));
                        }

                        const time = i * dt;
                        this.seek(time); // Sets currentTime and calls render() synchronously

                        // Create Bitmap (Efficient snapshot)
                        // No need to wait for repaint/setTimeout(0) as render is synchronous
                        const bitmap = await createImageBitmap(this.canvas, {
                            resizeWidth: evenWidth,
                            resizeHeight: evenHeight
                        });

                        // Transfer to worker
                        worker.postMessage({
                            type: 'ENCODE_FRAME',
                            data: {
                                bitmap,
                                timestamp: i * frameDurationUs,
                                keyFrame: i % fps === 0
                            }
                        }, [bitmap]);

                        // Update progress periodically
                        if (i % 5 === 0) onProgress((i / totalFrames) * 100);

                        // Yield to UI loop only once per batch
                        if (i % BATCH_SIZE === 0) {
                            await new Promise(r => setTimeout(r, 0));
                        }
                    }

                    // Finalize
                    worker.postMessage({ type: 'FINALIZE' });

                    const blob = await new Promise<Blob>((resolveB, rejectB) => {
                        const finishHandler = (e: MessageEvent) => {
                            if (e.data.type === 'COMPLETE') {
                                const blob = new Blob([e.data.data], { type: 'video/webm' });
                                worker.removeEventListener('message', finishHandler);
                                worker.terminate();
                                resolveB(blob);
                            } else if (e.data.type === 'ERROR') {
                                worker.removeEventListener('message', finishHandler);
                                rejectB(new Error(e.data.error));
                                worker.terminate();
                            }
                        };
                        worker.addEventListener('message', finishHandler);
                    });

                    if (signal?.aborted) {
                        this.isLooping = wasLooping;
                        return reject(new Error("Export cancelled"));
                    }

                    console.log(`Export Finished. Total time: ${(performance.now() - startTime).toFixed(2)}ms`);
                    this.isLooping = wasLooping;
                    resolve(blob);

                    // Restore state
                    this.currentTime = 0;
                    this.render();
                } catch (e) {
                    this.isLooping = wasLooping;
                    reject(e);
                }
            }
        });
    }

    dispose() {
        this.pause();
        // Cleanup if needed
    }
}
