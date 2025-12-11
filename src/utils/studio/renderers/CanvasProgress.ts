import type { SceneObject } from '../SceneObject';

export interface CanvasProgressProperties {
    value: number;
    variant: 'linear' | 'circular';
    color: string;
    thickness: number;
    name?: string;
}

export class CanvasProgress implements SceneObject {
    id: string;
    type: 'progress' = 'progress';
    x: number;
    y: number;
    width: number;
    height: number;

    startTime: number;
    duration: number;

    // Props
    value: number;
    variant: 'linear' | 'circular';
    color: string;
    thickness: number;
    name: string;

    constructor(id: string, props: Partial<CanvasProgressProperties> & { x: number, y: number }) {
        this.id = id;
        this.x = props.x;
        this.y = props.y;
        this.width = 300;
        this.height = 40; // Default for linear

        this.value = props.value || 75;
        this.variant = props.variant || 'linear';
        this.color = props.color || '#3b82f6';
        this.thickness = props.thickness || 10;
        this.name = props.name || 'Progress';

        this.startTime = 0;
        this.duration = 1500;

        if (this.variant === 'circular') {
            this.width = 150;
            this.height = 150;
        }
    }

    draw(ctx: CanvasRenderingContext2D, time: number) {
        const t = time - this.startTime;
        if (t < 0) return;

        const progress = Math.min(1, t / this.duration);
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentValue = this.value * ease;

        ctx.save();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineCap = 'round';
        ctx.lineWidth = this.thickness;

        if (this.variant === 'linear') {
            // Background track
            ctx.fillStyle = '#e2e8f0'; // slate-200
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Fill
            ctx.fillStyle = this.color;
            const w = (currentValue / 100) * this.width;
            ctx.fillRect(this.x, this.y, w, this.height);

            // Text
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Inter';
            ctx.fillText(`${Math.round(currentValue)}%`, this.x + 10, this.y + 25);

        } else if (this.variant === 'circular') {
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;
            const r = (Math.min(this.width, this.height) / 2) - this.thickness;

            // Background Circle
            ctx.beginPath();
            ctx.strokeStyle = '#e2e8f0';
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();

            // Progress Arc
            const startAngle = -Math.PI / 2;
            const endAngle = startAngle + (Math.PI * 2 * (currentValue / 100));

            ctx.beginPath();
            ctx.strokeStyle = this.color;
            ctx.arc(cx, cy, r, startAngle, endAngle);
            ctx.stroke();

            // Text Center
            ctx.fillStyle = this.color;
            ctx.font = 'bold 24px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${Math.round(currentValue)}%`, cx, cy);
        }

        ctx.restore();
    }

    containsPoint(px: number, py: number): boolean {
        return px >= this.x && px <= this.x + this.width &&
            py >= this.y && py <= this.y + this.height;
    }

    getProperties() {
        return {
            value: this.value,
            variant: this.variant,
            color: this.color,
            thickness: this.thickness,
            duration: this.duration,
            startTime: this.startTime,
            name: this.name
        };
    }

    updateProperties(props: any) {
        if (props.value !== undefined) this.value = Number(props.value);
        if (props.variant !== undefined) {
            this.variant = props.variant;
            // adjust dimensions defaults if switched
            if (this.variant === 'circular' && this.height < 100) {
                this.width = 150;
                this.height = 150;
            }
        }
        if (props.color !== undefined) this.color = props.color;
        if (props.thickness !== undefined) this.thickness = Number(props.thickness);
        if (props.duration !== undefined) this.duration = Number(props.duration);
        if (props.startTime !== undefined) this.startTime = Number(props.startTime);
        if (props.name !== undefined) this.name = props.name;
    }

    clone(): CanvasProgress {
        const newId = `progress-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const clone = new CanvasProgress(newId, {
            x: this.x + 20,
            y: this.y + 20,
            value: this.value,
            variant: this.variant,
            color: this.color,
            thickness: this.thickness,
            name: this.name + " (Copy)"
        });
        clone.duration = this.duration;
        clone.startTime = this.startTime;
        clone.width = this.width;
        clone.height = this.height;
        return clone;
    }
}
