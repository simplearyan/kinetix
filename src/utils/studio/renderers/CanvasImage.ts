import type { SceneObject } from '../SceneObject';

export interface CanvasImageProperties {
    src: string;
    borderRadius: number;
    effect: 'none' | 'zoom-in' | 'pan-left';
    name?: string;
}

export class CanvasImage implements SceneObject {
    id: string;
    type: 'image' = 'image';
    x: number;
    y: number;
    width: number;
    height: number;

    startTime: number;
    duration: number;

    // Props
    src: string;
    borderRadius: number;
    effect: 'none' | 'zoom-in' | 'pan-left';
    name: string;

    private image: HTMLImageElement;
    private isLoaded = false;

    constructor(id: string, props: Partial<CanvasImageProperties> & { x: number, y: number }) {
        this.id = id;
        this.x = props.x;
        this.y = props.y;
        this.width = 400;
        this.height = 300;

        this.src = props.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop';
        this.borderRadius = props.borderRadius || 10;
        this.effect = props.effect || 'zoom-in';
        this.name = props.name || 'Image';

        this.startTime = 0;
        this.duration = 3000;

        this.image = new Image();
        this.image.src = this.src;
        this.image.onload = () => { this.isLoaded = true; };
    }

    draw(ctx: CanvasRenderingContext2D, time: number) {
        if (!this.isLoaded) return;

        const t = time - this.startTime;
        if (t < 0) return;

        const progress = Math.min(1, t / this.duration);

        ctx.save();

        // Path for rounded corners (clipping mask)
        this.roundedRect(ctx, this.x, this.y, this.width, this.height, this.borderRadius);
        ctx.clip();

        // Animation Transform
        let scale = 1;
        let dx = 0;

        if (this.effect === 'zoom-in') {
            scale = 1 + (progress * 0.2); // Zoom to 1.2x
            // Center scaling
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;
            ctx.translate(cx, cy);
            ctx.scale(scale, scale);
            ctx.translate(-cx, -cy);
        } else if (this.effect === 'pan-left') {
            scale = 1.2; // Start zoomed in
            dx = - (progress * 50); // Move left
            ctx.translate(dx, 0);
            // Also need to scale initially effectively
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;
            ctx.translate(cx, cy);
            ctx.scale(scale, scale);
            ctx.translate(-cx, -cy);
        }

        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);

        ctx.restore();
    }

    private roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    containsPoint(px: number, py: number): boolean {
        return px >= this.x && px <= this.x + this.width &&
            py >= this.y && py <= this.y + this.height;
    }

    getProperties() {
        return {
            src: this.src,
            borderRadius: this.borderRadius,
            effect: this.effect,
            duration: this.duration,
            startTime: this.startTime,
            name: this.name
        };
    }

    updateProperties(props: any) {
        if (props.src !== undefined && props.src !== this.src) {
            this.src = props.src;
            this.image.src = this.src;
        }
        if (props.borderRadius !== undefined) this.borderRadius = Number(props.borderRadius);
        if (props.effect !== undefined) this.effect = props.effect;
        if (props.duration !== undefined) this.duration = Number(props.duration);
        if (props.startTime !== undefined) this.startTime = Number(props.startTime);
        if (props.name !== undefined) this.name = props.name;
    }

    clone(): CanvasImage {
        const newId = `image-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const clone = new CanvasImage(newId, {
            x: this.x + 20,
            y: this.y + 20,
            src: this.src,
            borderRadius: this.borderRadius,
            effect: this.effect,
            name: this.name + " (Copy)"
        });
        clone.duration = this.duration;
        clone.startTime = this.startTime;
        clone.width = this.width;
        clone.height = this.height;
        return clone;
    }
}
