import { KinetixObject } from "../Object";

export type ChartType = "bar" | "line" | "pie";

export class ChartObject extends KinetixObject {
    chartType: ChartType = "bar";
    data: number[] = [10, 25, 40, 30, 60];
    labels: string[] = ["A", "B", "C", "D", "E"];
    color: string = "#3b82f6";

    constructor(id: string, type: ChartType = "bar") {
        super(id, "Chart");
        this.chartType = type;
        this.width = 400;
        this.height = 300;
    }

    draw(ctx: CanvasRenderingContext2D, time: number) {
        // Background container
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = this.color;

        // Simple Bar implementation
        if (this.chartType === "bar") {
            const barWidth = (this.width - 40) / this.data.length;
            const maxVal = Math.max(...this.data) || 1;

            this.data.forEach((val, i) => {
                const h = (val / maxVal) * (this.height - 40);
                const bx = this.x + 20 + i * barWidth + 5;
                const by = this.y + this.height - 20 - h;

                // Animate height based on time?
                // Just static for now
                ctx.fillRect(bx, by, barWidth - 10, h);
            });
        }
    }

    clone(): ChartObject {
        const clone = new ChartObject(`chart-${Date.now()}`, this.chartType);
        clone.x = this.x + 20;
        clone.y = this.y + 20;
        clone.data = [...this.data];
        return clone;
    }
}
