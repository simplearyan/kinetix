import { KinetixObject } from "../Object";

export class ImageObject extends KinetixObject {
    src: string;
    private _image: HTMLImageElement | null = null;
    private _loaded = false;

    constructor(id: string, src: string) {
        super(id, "Image");
        this.src = src;
        this.loadImage();
    }

    loadImage() {
        if (typeof window === 'undefined') return;
        this._image = new Image();
        this._image.src = this.src;
        this._image.onload = () => {
            this._loaded = true;
            // Auto size if new?
            if (this.width === 100 && this.height === 100) {
                // Standardize roughly
            }
        };
    }

    draw(ctx: CanvasRenderingContext2D, time: number) {
        if (this._loaded && this._image) {
            ctx.drawImage(this._image, this.x, this.y, this.width, this.height);
        } else {
            // Placeholder
            ctx.fillStyle = "#334155";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = "#94a3b8";
            ctx.fillText("Loading...", this.x + 10, this.y + 20);
        }
    }

    clone(): ImageObject {
        const clone = new ImageObject(`img-${Date.now()}`, this.src);
        clone.x = this.x + 20;
        clone.y = this.y + 20;
        clone.width = this.width;
        clone.height = this.height;
        return clone;
    }
}
