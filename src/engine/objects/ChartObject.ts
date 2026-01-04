import { KinetixObject } from "../Object";

export type ChartType = "bar" | "line" | "pie";

export class ChartObject extends KinetixObject {
    chartType: ChartType = "bar";
    data: number[] = [10, 25, 40, 30, 60];
    labels: string[] = ["A", "B", "C", "D", "E"];

    // Customization
    color: string = "#3b82f6"; // Base color
    useMultiColor: boolean = false;
    colorPalette: string[] = ["#3B82F6", "#EC4899", "#10B981", "#F59E0B", "#8B5CF6"];

    fontFamily: string = "Inter";
    fontSize: number = 12;
    axisColor: string = "#666666";
    showGrid: boolean = true;

    constructor(id: string, type: ChartType = "bar") {
        super(id, "Chart");
        this.chartType = type;
        this.width = 400;
        this.height = 300;
        this.animation.type = "grow"; // Default animation for charts
    }

    draw(ctx: CanvasRenderingContext2D, time: number) {
        // Animation Progress
        let progress = 1;
        let opacity = 1;

        const duration = this.animation.duration;
        const animType = this.animation.type;

        if (time < duration && animType !== "none") {
            const t = Math.min(time / duration, 1);

            if (animType === "grow") {
                // Cubic ease out for height
                progress = 1 - Math.pow(1 - t, 3);
            } else if (animType === "fadeIn") {
                opacity = t;
            } else if (animType === "slideUp") {
                // Whole chart moves up? Or just default behavior.
                // For simplicity, let's treat slideUp/scaleIn as "grow" relative or just opacity for now
                // to avoid complex transforms in this specific draw method without engine help.
                // Or just standard fade.
                opacity = t;
            }
        }

        ctx.globalAlpha = this.opacity * opacity;

        const padding = { top: 20, right: 20, bottom: 40, left: 40 };
        const chartWidth = this.width - padding.left - padding.right;
        const chartHeight = this.height - padding.top - padding.bottom;
        const startX = this.x + padding.left;
        const startY = this.y + padding.top;

        // Draw Axes
        ctx.beginPath();
        ctx.strokeStyle = this.axisColor;
        ctx.lineWidth = 1;
        ctx.moveTo(startX, startY + chartHeight);
        ctx.lineTo(startX + chartWidth, startY + chartHeight); // X Axis
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX, startY + chartHeight); // Y Axis
        ctx.stroke();

        // Draw Grid
        if (this.showGrid) {
            ctx.beginPath();
            ctx.strokeStyle = this.axisColor;
            ctx.lineWidth = 0.5;
            ctx.globalAlpha = 0.2 * this.opacity * opacity;
            for (let i = 0; i <= 4; i++) {
                const y = startY + chartHeight - (chartHeight * i) / 4;
                ctx.moveTo(startX, y);
                ctx.lineTo(startX + chartWidth, y);
            }
            ctx.stroke();
            ctx.globalAlpha = this.opacity * opacity;
        }

        const maxVal = Math.max(...this.data) * 1.1 || 10;

        // Draw Bars
        if (this.chartType === "bar") {
            const barCount = this.data.length;
            const step = chartWidth / barCount;
            const barWidth = step * 0.7; // 70% width, 30% gap
            const gap = step * 0.15;

            this.data.forEach((val, i) => {
                const targetH = (val / maxVal) * chartHeight;
                const h = targetH * progress; // Animate height

                const bx = startX + i * step + gap;
                const by = startY + chartHeight - h;

                // Color
                ctx.fillStyle = this.useMultiColor
                    ? this.colorPalette[i % this.colorPalette.length]
                    : this.color;

                ctx.fillRect(bx, by, barWidth, h);

                // Labels
                if (this.labels[i]) {
                    ctx.fillStyle = this.axisColor;
                    ctx.font = `${this.fontSize}px ${this.fontFamily}`;
                    ctx.textAlign = "center";
                    ctx.fillText(
                        this.labels[i],
                        bx + barWidth / 2,
                        startY + chartHeight + this.fontSize + 5
                    );
                }
            });
        }

        // Draw Line Chart
        if (this.chartType === "line") {
            const pointCount = this.data.length;
            const step = chartWidth / (pointCount - 1 || 1);

            ctx.beginPath();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            // Rounded joins
            ctx.lineJoin = "round";
            ctx.lineCap = "round";

            const points: { x: number, y: number }[] = this.data.map((val, i) => {
                const targetH = (val / maxVal) * chartHeight;
                return {
                    x: startX + i * step,
                    y: startY + chartHeight - targetH
                };
            });

            // Animation: progressive draw
            // Calculate total path length? Or just clamp X based on progress?
            // "Grow" makes sense for bar, "Draw" (wipe) makes sense for line.
            // If animType is "grow", we can reuse progress (0-1).
            // Let's assume progress determines how far along the x-axis we draw.

            const maxDrawX = startX + chartWidth * (this.animation.type === "grow" ? progress : 1);

            if (points.length > 0) {
                ctx.moveTo(points[0].x, points[0].y);

                for (let i = 1; i < points.length; i++) {
                    const p = points[i];
                    const prevP = points[i - 1];

                    // If segment is fully within range
                    if (p.x <= maxDrawX) {
                        ctx.lineTo(p.x, p.y);
                    } else {
                        // Partial segment
                        if (prevP.x < maxDrawX) {
                            // Interpolate y at maxDrawX
                            const ratio = (maxDrawX - prevP.x) / (p.x - prevP.x);
                            const y = prevP.y + (p.y - prevP.y) * ratio;
                            ctx.lineTo(maxDrawX, y);
                        }
                        break; // Stop drawing
                    }
                }
            }
            ctx.stroke();

            // Draw Points (dots)
            points.forEach((p, i) => {
                // Only show point if we've reached it
                if (p.x <= maxDrawX) {
                    // Animate point scale
                    let scale = 1;
                    if (this.animation.type === "grow") {
                        // Pop in effect when line reaches
                        const pointProgress = (maxDrawX - p.x) / 50; // simple fade/pop logic
                        // For simplicity, just appear
                    }

                    ctx.beginPath();
                    ctx.fillStyle = this.useMultiColor
                        ? this.colorPalette[i % this.colorPalette.length]
                        : "white";
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = 2;
                    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                }

                // Labels
                if (this.labels[i]) {
                    ctx.fillStyle = this.axisColor;
                    ctx.font = `${this.fontSize}px ${this.fontFamily}`;
                    ctx.textAlign = "center";
                    ctx.fillText(
                        this.labels[i],
                        p.x,
                        startY + chartHeight + this.fontSize + 5
                    );
                }
            });
        }

        // Draw Y Axis Labels
        ctx.fillStyle = this.axisColor;
        ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        ctx.textAlign = "right";
        for (let i = 0; i <= 4; i++) {
            const val = Math.round((maxVal * i) / 4);
            const y = startY + chartHeight - (chartHeight * i) / 4;
            ctx.fillText(val.toString(), startX - 5, y + this.fontSize / 3);
        }

        ctx.globalAlpha = 1.0;
    }

    clone(): ChartObject {
        const clone = new ChartObject(`chart-${Date.now()}`, this.chartType);
        clone.x = this.x + 20;
        clone.y = this.y + 20;
        clone.width = this.width;
        clone.height = this.height;
        clone.data = [...this.data];
        clone.labels = [...this.labels];
        clone.color = this.color;
        clone.useMultiColor = this.useMultiColor;
        clone.fontFamily = this.fontFamily;
        clone.fontSize = this.fontSize;
        clone.axisColor = this.axisColor;
        clone.showGrid = this.showGrid;

        // Clone animation settings
        clone.animation = { ...this.animation };

        return clone;
    }
}
