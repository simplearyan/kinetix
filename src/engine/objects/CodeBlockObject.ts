import { KinetixObject } from "../Object";

export class CodeBlockObject extends KinetixObject {
    code: string;
    language: string;
    fontSize: number;
    showLineNumbers: boolean = true;
    color: string;

    constructor(id: string, code: string = "") {
        super(id, "CodeBlock");
        this.code = code || "console.log('Hello Kinetix');";
        this.language = "javascript";
        this.fontSize = 16;
        this.width = 400;
        this.height = 200;
        this.color = "#1e293b"; // Dark bg
    }

    draw(ctx: CanvasRenderingContext2D, time: number) {
        // Window Chrome
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 8);
        ctx.fill();

        // Mac traffic lights
        ctx.fillStyle = "#ff5f56";
        ctx.beginPath(); ctx.arc(this.x + 15, this.y + 15, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#ffbd2e";
        ctx.beginPath(); ctx.arc(this.x + 35, this.y + 15, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#27c93f";
        ctx.beginPath(); ctx.arc(this.x + 55, this.y + 15, 6, 0, Math.PI * 2); ctx.fill();

        // Content Area
        ctx.font = `normal ${this.fontSize}px "fira-code", monospace`;
        ctx.fillStyle = "#e2e8f0";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        const lines = this.code.split("\n");
        let lineY = this.y + 40;

        lines.forEach((line, i) => {
            if (lineY > this.y + this.height - 20) return; // Clip

            if (this.showLineNumbers) {
                ctx.fillStyle = "#475569";
                ctx.fillText((i + 1).toString(), this.x + 15, lineY);
                ctx.fillStyle = "#e2e8f0";
                ctx.fillText(line, this.x + 50, lineY);
            } else {
                ctx.fillText(line, this.x + 15, lineY);
            }
            lineY += (this.fontSize * 1.5);
        });
    }

    clone(): CodeBlockObject {
        const clone = new CodeBlockObject(`code-${Date.now()}`, this.code);
        clone.x = this.x + 20;
        clone.y = this.y + 20;
        return clone;
    }
}
