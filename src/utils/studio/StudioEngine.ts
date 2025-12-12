
import { VideoRecorder } from '../video-recorder';
import type { SceneObject } from './SceneObject';
import { selectedObjectId, isPlaying, currentTime } from '../../stores/studioStore';

export class StudioEngine {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    objects: SceneObject[] = [];

    // State handled by atoms mostly now, but keep local for perf loop
    // isPlaying = false; 
    currentTime = 0;
    totalDuration = 5000; // Default 5s
    backgroundColor = '#111827'; // gray-900

    setBackgroundColor(color: string) {
        this.backgroundColor = color;
        this.draw(this.currentTime);
    }

    private animationId: number = 0;
    private lastFrameTime = 0;

    // Event Helper
    private emit(event: string, detail: any = {}) {
        window.dispatchEvent(new CustomEvent(`studio:${event}`, { detail }));
    }

    // Interaction State
    private isDragging = false;
    private isResizing = false;
    private activeHandle: 'tl' | 'tr' | 'bl' | 'br' | null = null;
    private dragStartX = 0;
    private dragStartY = 0;
    private initialObjectState: { x: number, y: number, width: number, height: number } | null = null;

    // Selection
    selectedObjectId: string | null = null;

    onSelectionChange: ((id: string | null) => void) | null = null;

    // Notifications
    onObjectListChange: ((objects: SceneObject[]) => void) | null = null;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get 2D context');
        this.ctx = ctx;

        // Setup interaction
        this.setupInteraction();
    }

    addObject(obj: SceneObject) {
        this.objects.push(obj);
        this.selectObject(obj.id);
        if (this.onObjectListChange) this.onObjectListChange(this.objects);
        this.draw(this.currentTime);
    }

    removeObject(id: string) {
        this.objects = this.objects.filter(o => o.id !== id);
        if (this.selectedObjectId === id) {
            this.selectObject(null);
        }
        if (this.onObjectListChange) this.onObjectListChange(this.objects);
        this.draw(this.currentTime);
    }

    duplicateObject(id: string) {
        const obj = this.getObject(id);
        if (obj && obj.clone) {
            const newObj = obj.clone();
            this.addObject(newObj);
        }
    }

    renameObject(id: string, name: string) {
        const obj = this.getObject(id);
        if (obj) {
            obj.name = name;
            // Notify UI
            if (this.onObjectListChange) this.onObjectListChange(this.objects);
        }
    }

    moveObjectUp(id: string) {
        const index = this.objects.findIndex(o => o.id === id);
        if (index !== -1 && index < this.objects.length - 1) {
            // Swap with next
            const temp = this.objects[index];
            this.objects[index] = this.objects[index + 1];
            this.objects[index + 1] = temp;

            if (this.onObjectListChange) this.onObjectListChange(this.objects);
            this.draw(this.currentTime);
        }
    }

    moveObjectDown(id: string) {
        const index = this.objects.findIndex(o => o.id === id);
        if (index > 0) {
            // Swap with prev
            const temp = this.objects[index];
            this.objects[index] = this.objects[index - 1];
            this.objects[index - 1] = temp;

            if (this.onObjectListChange) this.onObjectListChange(this.objects);
            this.draw(this.currentTime);
        }
    }

    getObject(id: string) {
        return this.objects.find(o => o.id === id);
    }

    selectObject(id: string | null) {
        // this.selectedObjectId = id; // Local obsolete if purely relying on store, but engine usually authoritative
        // We will subscribe to store in UI, but engine updates store here
        selectedObjectId.set(id);

        // if (this.onSelectionChange) this.onSelectionChange(id); // Deprecated
        this.draw(currentTime.get());
    }

    // --- Rendering ---

    draw(time: number) {
        currentTime.set(time); // Sync time
        const { width, height } = this.canvas;

        // Clear
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, width, height);

        // Draw Grid (optional, only in editor mode?)
        // For now, clean background

        // Draw Objects
        // Sort by some Z-index later? For now insertion order
        const currentSel = selectedObjectId.get();

        for (const obj of this.objects) {
            // Check visibility based on time?
            // Simple: Just draw everything, let them handle their own animation state
            this.ctx.save();
            // Global transform if needed
            obj.draw(this.ctx, time);
            this.ctx.restore();

            // Draw selection box
            if (obj.id === currentSel && !this.isExporting && !this.isPreviewing) {
                this.drawSelectionBox(obj);
            }
        }
    }

    drawSelectionBox(obj: SceneObject) {
        this.ctx.strokeStyle = '#3b82f6'; // blue-500
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);

        // Handles
        this.ctx.fillStyle = '#fff';
        const handles = this.getHandleRects(obj);

        for (const [key, h] of Object.entries(handles)) {
            this.ctx.fillRect(h.x, h.y, h.w, h.h);
            this.ctx.strokeRect(h.x, h.y, h.w, h.h);
        }
    }

    private getHandleRects(obj: SceneObject) {
        const s = 8; // handle size
        const hs = s / 2; // half size
        return {
            tl: { x: obj.x - hs, y: obj.y - hs, w: s, h: s },
            tr: { x: obj.x + obj.width - hs, y: obj.y - hs, w: s, h: s },
            bl: { x: obj.x - hs, y: obj.y + obj.height - hs, w: s, h: s },
            br: { x: obj.x + obj.width - hs, y: obj.y + obj.height - hs, w: s, h: s },
        };
    }

    // --- Playback ---

    // Playback Settings
    isLooping = true;

    play() {
        if (isPlaying.get()) return;

        // If at end and not looping, restart
        if (this.currentTime >= this.totalDuration) {
            this.currentTime = 0;
        }

        isPlaying.set(true);
        this.emit('playstate', { isPlaying: true });
        this.lastFrameTime = performance.now();
        this.loop();
    }

    pause() {
        isPlaying.set(false);
        this.emit('playstate', { isPlaying: false });
        if (this.animationId) cancelAnimationFrame(this.animationId);
    }

    stop() {
        this.pause();
        this.seek(0);
        // pause() emits playstate: false, seek() emits timeupdate: 0
    }

    seek(time: number) {
        const t = Math.max(0, Math.min(time, this.totalDuration));
        currentTime.set(t); // Ensure store is updated
        this.draw(t);
        this.emit('timeupdate', { time: t });
    }

    private loop = () => {
        if (!isPlaying.get()) return;

        const now = performance.now();
        const dt = now - this.lastFrameTime;
        this.lastFrameTime = now;

        let nextTime = currentTime.get() + dt;

        if (nextTime >= this.totalDuration) {
            if (this.isLooping) {
                nextTime = 0; // Loop
            } else {
                nextTime = this.totalDuration;
                this.pause(); // Stop
            }
        }

        this.draw(nextTime);
        this.emit('timeupdate', { time: nextTime });
        this.animationId = requestAnimationFrame(this.loop);
    }

    // --- Interaction ---

    private setupInteraction() {
        // --- Mouse Interaction ---
        this.canvas.addEventListener('mousedown', (e) => {
            const { x, y } = this.getMousePos(e);

            // 1. Check Handles first (if object selected)
            const currentSelId = selectedObjectId.get();
            const currentSelObj = currentSelId ? this.getObject(currentSelId) : null;

            if (currentSelObj && !this.isPreviewing) {
                const handles = this.getHandleRects(currentSelObj);
                for (const [key, h] of Object.entries(handles)) {
                    if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) {
                        this.isResizing = true;
                        this.activeHandle = key as any;
                        this.dragStartX = x;
                        this.dragStartY = y;
                        this.initialObjectState = { ...currentSelObj };
                        return; // Stop event
                    }
                }
            }

            // 2. Check Objects
            // Find clicked object (reverse order for top-first)
            let clickedId = null;
            for (let i = this.objects.length - 1; i >= 0; i--) {
                // Simple containment check - assumes rect for now
                const obj = this.objects[i];
                if (x >= obj.x && x <= obj.x + obj.width && y >= obj.y && y <= obj.y + obj.height) {
                    clickedId = obj.id;
                    break;
                }
            }

            // 3. Select / Deselect
            this.selectObject(clickedId);

            // 4. Start Drag
            if (clickedId) {
                this.isDragging = true;
                this.dragStartX = x;
                this.dragStartY = y;
                const obj = this.getObject(clickedId)!;
                this.initialObjectState = { ...obj };
            }
        });

        window.addEventListener('mousemove', (e) => {
            const { x, y } = this.getMousePos(e);
            const currentSelId = selectedObjectId.get();
            const currentSelObj = currentSelId ? this.getObject(currentSelId) : null;

            // --- Cursor Updates ---
            if (!this.isDragging && !this.isResizing) {
                let cursor = 'default';

                // Check Handles
                if (currentSelObj && !this.isPreviewing) {
                    const handles = this.getHandleRects(currentSelObj);
                    if (x >= handles.tl.x && x <= handles.tl.x + handles.tl.w && y >= handles.tl.y && y <= handles.tl.y + handles.tl.h) cursor = 'nwse-resize';
                    else if (x >= handles.br.x && x <= handles.br.x + handles.br.w && y >= handles.br.y && y <= handles.br.y + handles.br.h) cursor = 'nwse-resize';
                    else if (x >= handles.tr.x && x <= handles.tr.x + handles.tr.w && y >= handles.tr.y && y <= handles.tr.y + handles.tr.h) cursor = 'nesw-resize';
                    else if (x >= handles.bl.x && x <= handles.bl.x + handles.bl.w && y >= handles.bl.y && y <= handles.bl.y + handles.bl.h) cursor = 'nesw-resize';

                    // Check Object Body
                    else if (x >= currentSelObj.x && x <= currentSelObj.x + currentSelObj.width && y >= currentSelObj.y && y <= currentSelObj.y + currentSelObj.height) {
                        cursor = 'move';
                    }
                } else {
                    // Check other objects hover
                    for (let i = this.objects.length - 1; i >= 0; i--) {
                        const obj = this.objects[i];
                        if (x >= obj.x && x <= obj.x + obj.width && y >= obj.y && y <= obj.y + obj.height) {
                            cursor = 'pointer'; // Clickable
                            break;
                        }
                    }
                }

                this.canvas.style.cursor = cursor;
                return;
            }

            // --- Dragging ---
            if (this.isDragging && currentSelObj && this.initialObjectState) {
                const dx = x - this.dragStartX;
                const dy = y - this.dragStartY;
                currentSelObj.x = this.initialObjectState.x + dx;
                currentSelObj.y = this.initialObjectState.y + dy;
            }

            // --- Resizing ---
            if (this.isResizing && currentSelObj && this.activeHandle && this.initialObjectState) {
                const dx = x - this.dragStartX;
                const dy = y - this.dragStartY;
                const init = this.initialObjectState;

                if (this.activeHandle === 'br') {
                    currentSelObj.width = Math.max(10, init.width + dx);
                    currentSelObj.height = Math.max(10, init.height + dy);
                } else if (this.activeHandle === 'bl') {
                    const newW = Math.max(10, init.width - dx);
                    currentSelObj.x = init.x + (init.width - newW);
                    currentSelObj.width = newW;
                    currentSelObj.height = Math.max(10, init.height + dy);
                } else if (this.activeHandle === 'tr') {
                    const newH = Math.max(10, init.height - dy);
                    currentSelObj.y = init.y + (init.height - newH);
                    currentSelObj.height = newH;
                    currentSelObj.width = Math.max(10, init.width + dx);
                } else if (this.activeHandle === 'tl') {
                    const newW = Math.max(10, init.width - dx);
                    const newH = Math.max(10, init.height - dy);
                    currentSelObj.x = init.x + (init.width - newW);
                    currentSelObj.y = init.y + (init.height - newH);
                    currentSelObj.width = newW;
                    currentSelObj.height = newH;
                }
            }

            // Update UI
            if (!isPlaying.get()) {
                this.draw(currentTime.get());
            }
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.isResizing = false;
            this.activeHandle = null;
            this.initialObjectState = null;
        });

        // --- Keyboard Shortcuts ---
        window.addEventListener('keydown', (e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key === 'Delete' || e.key === 'Backspace') {
                const id = selectedObjectId.get();
                if (id) this.removeObject(id);
            }
            if (e.key === 'Escape') {
                this.selectObject(null);
            }
            if (e.key === ' ' && !e.repeat) {
                e.preventDefault(); // Stop scroll
                if (isPlaying.get()) this.pause();
                else this.play();
            }
            if (e.key === 'ArrowLeft') {
                this.pause();
                this.seek(this.currentTime - 100); // -0.1s
            }
            if (e.key === 'ArrowRight') {
                this.pause();
                this.seek(this.currentTime + 100); // +0.1s
            }
        });
    }

    get isPlaying(): boolean {
        return isPlaying.get();
    }

    private getMousePos(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    // --- Interaction ---

    // ... interaction setup ... (omitted for brevity in this replace block, can't easily jump over) 
    // Actually, I should just modify the draw function and add the new methods.

    // --- Preview ---
    isPreviewing = false;

    startPreview() {
        this.isPreviewing = true;
        this.selectObject(null); // Deselect
        this.currentTime = 0;
        this.play();
    }

    stopPreview() {
        this.isPreviewing = false;
        this.pause();
    }

    // --- Export ---
    private isExporting = false;

    async exportVideo(options: { mimeType: string, fps: number, onProgress: (p: number) => void }): Promise<string> {
        this.pause();
        this.isExporting = true;
        this.selectObject(null); // Clear selection box

        const recorder = new VideoRecorder(this.canvas, {
            fps: options.fps,
            videoBitsPerSecond: 16000000,
            mimeType: options.mimeType
        });

        recorder.start();

        const totalFrames = (this.totalDuration / 1000) * options.fps;
        const msPerFrame = 1000 / options.fps;

        for (let i = 0; i < totalFrames; i++) {
            const t = i * msPerFrame;
            this.draw(t);
            options.onProgress(i / totalFrames);
            await new Promise(r => setTimeout(r, 0));
        }

        const url = await recorder.stop();
        this.isExporting = false;
        options.onProgress(1);

        // Restore state
        this.draw(0);

        return url;
    }
}
