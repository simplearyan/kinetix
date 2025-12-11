import type { SceneObject } from '../SceneObject';

export interface CanvasCodeProperties {
    code: string;
    language: 'javascript' | 'python' | 'html';
    fontSize: number;
    theme: 'dark' | 'light';
    name?: string;
}

export class CanvasCode implements SceneObject {
    id: string;
    type: 'code' = 'code';
    x: number;
    y: number;
    width: number;
    height: number;

    startTime: number;
    duration: number;

    // Props
    code: string;
    language: string;
    fontSize: number;
    theme: 'dark' | 'light';
    name: string;

    constructor(id: string, props: Partial<CanvasCodeProperties> & { x: number, y: number }) {
        this.id = id;
        this.x = props.x;
        this.y = props.y;
        this.width = 400;
        this.height = 200;

        this.code = props.code || `function hello() {\n  console.log("Hello Kinetix!");\n}`;
        this.language = props.language || 'javascript';
        this.fontSize = props.fontSize || 16;
        this.theme = props.theme || 'dark';
        this.name = props.name || 'Code Block';

        this.startTime = 0;
        this.duration = 2000;
    }

    draw(ctx: CanvasRenderingContext2D, time: number) {
        const t = time - this.startTime;
        if (t < 0) return;

        const progress = Math.min(1, t / this.duration);
        const charCount = Math.floor(this.code.length * progress);
        const currentCode = this.code.substring(0, charCount);

        ctx.save();

        // Window Chrome
        const padding = 20;
        const lineHeight = this.fontSize * 1.5;

        // Background
        ctx.fillStyle = this.theme === 'dark' ? '#1e1e1e' : '#f8fafc';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Header
        ctx.fillStyle = this.theme === 'dark' ? '#252526' : '#e2e8f0';
        ctx.fillRect(this.x, this.y, this.width, 30);

        // Buttons
        ctx.fillStyle = '#ff5f56';
        ctx.beginPath(); ctx.arc(this.x + 15, this.y + 15, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffbd2e';
        ctx.beginPath(); ctx.arc(this.x + 35, this.y + 15, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#27c93f';
        ctx.beginPath(); ctx.arc(this.x + 55, this.y + 15, 6, 0, Math.PI * 2); ctx.fill();

        // Code Content
        ctx.font = `normal ${this.fontSize}px 'Fira Code', monospace`;
        ctx.textBaseline = 'top';
        ctx.fillStyle = this.theme === 'dark' ? '#d4d4d4' : '#334155';

        // Simple multiline rendering
        const lines = currentCode.split('\n');
        let currentY = this.y + 30 + padding;

        lines.forEach(line => {
            if (currentY + lineHeight > this.y + this.height) return; // Clip
            ctx.fillText(line, this.x + padding, currentY);
            currentY += lineHeight;
        });

        // Cursor
        if (progress < 1) {
            const lastLine = lines[lines.length - 1];
            const lastLineWidth = ctx.measureText(lastLine).width;
            const cursorY = currentY - lineHeight;

            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(this.x + padding + lastLineWidth + 2, cursorY + 2, 2, this.fontSize);
        }

        ctx.restore();
    }

    containsPoint(px: number, py: number): boolean {
        return px >= this.x && px <= this.x + this.width &&
            py >= this.y && py <= this.y + this.height;
    }

    getProperties() {
        return {
            code: this.code,
            language: this.language,
            fontSize: this.fontSize,
            theme: this.theme,
            duration: this.duration,
            startTime: this.startTime,
            name: this.name
        };
    }

    updateProperties(props: any) {
        if (props.code !== undefined) this.code = props.code;
        if (props.language !== undefined) this.language = props.language;
        if (props.fontSize !== undefined) this.fontSize = Number(props.fontSize);
        if (props.theme !== undefined) this.theme = props.theme;
        if (props.duration !== undefined) this.duration = Number(props.duration);
        if (props.startTime !== undefined) this.startTime = Number(props.startTime);
        if (props.name !== undefined) this.name = props.name;
    }

    clone(): CanvasCode {
        const newId = `code-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const clone = new CanvasCode(newId, {
            x: this.x + 20,
            y: this.y + 20,
            code: this.code,
            language: this.language as any,
            fontSize: this.fontSize,
            theme: this.theme,
            name: this.name + " (Copy)"
        });
        clone.duration = this.duration;
        clone.startTime = this.startTime;
        clone.width = this.width;
        clone.height = this.height;
        return clone;
    }
}
