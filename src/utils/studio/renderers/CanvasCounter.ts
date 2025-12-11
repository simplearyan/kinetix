import type { SceneObject } from '../SceneObject';

export interface CanvasCounterProperties {
    startValue: number;
    endValue: number;
    prefix: string;
    suffix: string;
    fontSize: number;
    color: string;
    name?: string;
}

export class CanvasCounter implements SceneObject {
    id: string;
    type: 'counter' = 'counter';
    x: number;
    y: number;
    width: number;
    height: number;

    startTime: number;
    duration: number;

    // Props
    startValue: number;
    endValue: number;
    prefix: string;
    suffix: string;
    fontSize: number;
    color: string;
    name: string;

    constructor(id: string, props: Partial<CanvasCounterProperties> & { x: number, y: number }) {
        this.id = id;
        this.x = props.x;
        this.y = props.y;
        this.width = 200;
        this.height = 100;

        this.startValue = props.startValue || 0;
        this.endValue = props.endValue || 1000;
        this.prefix = props.prefix || '';
        this.suffix = props.suffix || '';
        this.fontSize = props.fontSize || 64;
        this.color = props.color || '#3b82f6';
        this.name = props.name || 'Counter';

        this.startTime = 0;
        this.duration = 2000;
    }

    draw(ctx: CanvasRenderingContext2D, time: number) {
        const t = time - this.startTime;
        if (t < 0) return;

        const progress = Math.min(1, t / this.duration);
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.round(this.startValue + (this.endValue - this.startValue) * ease);

        const text = `${this.prefix}${currentVal.toLocaleString()}${this.suffix}`;

        ctx.save();
        ctx.font = `bold ${this.fontSize}px Inter, sans-serif`;
        ctx.fillStyle = this.color;
        ctx.textBaseline = 'top'; // Easier bounding box

        const metrics = ctx.measureText(text);
        this.width = metrics.width;
        this.height = this.fontSize; // Approx

        ctx.fillText(text, this.x, this.y);
        ctx.restore();
    }

    containsPoint(px: number, py: number): boolean {
        return px >= this.x && px <= this.x + this.width &&
            py >= this.y && py <= this.y + this.height;
    }

    getProperties() {
        return {
            startValue: this.startValue,
            endValue: this.endValue,
            prefix: this.prefix,
            suffix: this.suffix,
            fontSize: this.fontSize,
            color: this.color,
            duration: this.duration,
            startTime: this.startTime,
            name: this.name
        };
    }

    updateProperties(props: any) {
        if (props.startValue !== undefined) this.startValue = Number(props.startValue);
        if (props.endValue !== undefined) this.endValue = Number(props.endValue);
        if (props.prefix !== undefined) this.prefix = props.prefix;
        if (props.suffix !== undefined) this.suffix = props.suffix;
        if (props.fontSize !== undefined) this.fontSize = Number(props.fontSize);
        if (props.color !== undefined) this.color = props.color;
        if (props.duration !== undefined) this.duration = Number(props.duration);
        if (props.startTime !== undefined) this.startTime = Number(props.startTime);
        if (props.name !== undefined) this.name = props.name;
    }

    clone(): CanvasCounter {
        const newId = `counter-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const clone = new CanvasCounter(newId, {
            x: this.x + 20,
            y: this.y + 20,
            startValue: this.startValue,
            endValue: this.endValue,
            prefix: this.prefix,
            suffix: this.suffix,
            fontSize: this.fontSize,
            color: this.color,
            name: this.name + " (Copy)"
        });
        clone.duration = this.duration;
        clone.startTime = this.startTime;
        return clone;
    }
}
