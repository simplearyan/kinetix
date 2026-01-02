import { Scene } from "./Scene";

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
        this.canvas.width = width;
        this.canvas.height = height;
        this.scene.width = width;
        this.scene.height = height;
        this.render();
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
        this.canvas.addEventListener("mousedown", (e) => {
            const { x, y } = this._getMousePos(e);

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
        });

        window.addEventListener("mousemove", (e) => {
            if (this._isDragging && this.selectedObjectId) {
                const { x, y } = this._getMousePos(e);
                const obj = this.scene.get(this.selectedObjectId);
                if (obj && this._initialObjState) {
                    const dx = x - this._dragStartX;
                    const dy = y - this._dragStartY;
                    obj.x = this._initialObjState.x + dx;
                    obj.y = this._initialObjState.y + dy;
                    this.render();
                    this.onObjectChange?.();
                }
            }
        });

        window.addEventListener("mouseup", () => {
            this._isDragging = false;
            this._initialObjState = null;
        });
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

    dispose() {
        this.pause();
        // Cleanup if needed
    }
}
