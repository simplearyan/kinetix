import type { SceneObject } from '../SceneObject';

export interface CanvasTextProperties {
    text: string;
    fontFamily: string;
    fontSize: number;
    color: string;
    animationType: 'none' | 'typewriter' | 'fade' | 'slide-up';
    name?: string;
}

export class CanvasText implements SceneObject {
    id: string;
    type: 'text' = 'text';
    x: number;
    y: number;
    width: number;
    height: number;

    startTime: number;
    duration: number;

    // Props
    text: string;
    fontFamily: string;
    fontSize: number;
    color: string;
    animationType: 'none' | 'typewriter' | 'fade' | 'slide-up';

    constructor(id: string, props: Partial<CanvasTextProperties> & { x: number, y: number }) {
        this.id = id;
        this.x = props.x;
        this.y = props.y;
        this.text = props.text || 'Hello World';
        this.fontFamily = props.fontFamily || 'Inter';
        this.fontSize = props.fontSize || 48;
        this.color = props.color || '#ffffff';
        this.animationType = props.animationType || 'typewriter';

        this.startTime = 0;
        this.duration = 2000;

        // Approximate width/height (updated on draw usually, but init with guess)
        this.width = this.text.length * (this.fontSize * 0.6);
        this.height = this.fontSize;

        this.name = props.name || this.text || id;
    }

    // New: Name property
    name: string;

    // New: Clone method
    clone(): CanvasText {
        const newId = `text-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        // Offset slightly
        const newX = this.x + 20;
        const newY = this.y + 20;

        const clone = new CanvasText(newId, {
            x: newX,
            y: newY,
            text: this.text,
            fontFamily: this.fontFamily,
            fontSize: this.fontSize,
            color: this.color,
            animationType: this.animationType,
        });

        // Copy other props
        clone.duration = this.duration;
        clone.startTime = this.startTime;
        clone.name = this.name + " (Copy)";

        return clone;
    }

    draw(ctx: CanvasRenderingContext2D, time: number) {
        // Measure first to be accurate
        ctx.font = `bold ${this.fontSize}px ${this.fontFamily}`;
        const metrics = ctx.measureText(this.text);
        this.width = metrics.width;
        this.height = this.fontSize; // Approx

        // Local time
        const t = time - this.startTime;

        // Not started or Ended?
        // Let's decide if it stays visible after duration or not.
        // Usually animations transition IN, then stay.
        // So we clamp t to duration for the animation progress.

        if (t < 0) return; // Not yet visible

        const progress = Math.min(1, t / this.duration);

        ctx.save();
        ctx.fillStyle = this.color;
        ctx.textBaseline = 'top';

        if (this.animationType === 'typewriter') {
            const charCount = Math.floor(this.text.length * progress);
            const currentText = this.text.substring(0, charCount);

            ctx.fillText(currentText, this.x, this.y);

            // Cursor (optional)
            if (progress < 1) {
                ctx.fillRect(this.x + ctx.measureText(currentText).width + 2, this.y, 2, this.fontSize);
            }

        } else if (this.animationType === 'fade') {
            ctx.globalAlpha = Math.max(0, Math.min(1, progress));
            ctx.fillText(this.text, this.x, this.y);

        } else if (this.animationType === 'slide-up') {
            const offset = (1 - easeOutCubic(progress)) * 50;
            ctx.globalAlpha = Math.max(0, Math.min(1, progress));
            ctx.fillText(this.text, this.x, this.y + offset);

        } else {
            // None
            ctx.fillText(this.text, this.x, this.y);
        }

        ctx.restore();
    }

    containsPoint(px: number, py: number): boolean {
        return px >= this.x && px <= this.x + this.width &&
            py >= this.y && py <= this.y + this.height;
    }

    getProperties() {
        return {
            text: this.text,
            fontSize: this.fontSize,
            color: this.color,
            animationType: this.animationType,
            duration: this.duration,
            startTime: this.startTime,
            name: this.name
        };
    }

    updateProperties(props: any) {
        if (props.text !== undefined) this.text = props.text;
        if (props.fontSize !== undefined) this.fontSize = Number(props.fontSize);
        if (props.color !== undefined) this.color = props.color;
        if (props.animationType !== undefined) this.animationType = props.animationType;
        if (props.duration !== undefined) this.duration = Number(props.duration);
        if (props.startTime !== undefined) this.startTime = Number(props.startTime);
        if (props.name !== undefined) this.name = props.name;
    }
}

// Easing
function easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3);
}
