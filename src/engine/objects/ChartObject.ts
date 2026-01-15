import { KinetixObject } from "../Object";

export type ChartType = "bar" | "line" | "area" | "scatter" | "pie" | "donut";

export class ChartObject extends KinetixObject {
    chartType: ChartType = "bar";
    data: number[] = [10, 25, 40, 30, 60];
    labels: string[] = ["A", "B", "C", "D", "E"];

    // Customization
    color: string = "#3b82f6"; // Base color
    useMultiColor: boolean = false;
    colorPalette: string[] = ["#3B82F6", "#EC4899", "#10B981", "#F59E0B", "#8B5CF6"];
    customColors: string[] = []; // Individual overrides

    fontFamily: string = "Inter";
    fontSize: number = 12;
    axisColor: string = "#666666";
    showGrid: boolean = true;

    // New Properties
    labelPosition: "axis" | "top" | "center" = "axis";
    innerRadius: number = 0.6; // For donut (0-1 relative to radius)

    constructor(id: string, type: ChartType = "bar") {
        super(id, "Chart");
        this.chartType = type;
        this.width = 400;
        this.height = 300;
        this.animation.type = "grow"; // Default animation
    }

    draw(ctx: CanvasRenderingContext2D, time: number) {
        // Animation Paramteres
        const duration = this.animation.duration;
        const animType = this.animation.type;

        let globalProgress = 0;
        if (time < duration && animType !== "none") {
            globalProgress = Math.min(time / duration, 1);
        } else if (animType === "none" || time >= duration) {
            globalProgress = 1;
        }

        ctx.save();
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        ctx.translate(cx, cy);
        ctx.rotate((this.rotation || 0) * Math.PI / 180);
        ctx.scale(this.scaleX || 1, this.scaleY || 1);
        ctx.translate(-cx, -cy);

        ctx.globalAlpha = this.opacity;

        const padding = { top: 20, right: 20, bottom: 40, left: 40 };
        const chartWidth = this.width - padding.left - padding.right;
        const chartHeight = this.height - padding.top - padding.bottom;
        const startX = this.x + padding.left;
        const startY = this.y + padding.top;
        const maxVal = Math.max(...this.data) * 1.1 || 10;

        // --- AXES & GRID (Cartesian only) ---
        if (["bar", "line", "area", "scatter"].includes(this.chartType)) {
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
                ctx.globalAlpha = 0.2 * this.opacity;
                for (let i = 0; i <= 4; i++) {
                    const y = startY + chartHeight - (chartHeight * i) / 4;
                    ctx.moveTo(startX, y);
                    ctx.lineTo(startX + chartWidth, y);
                }
                ctx.stroke();
                ctx.globalAlpha = this.opacity;
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
        }

        // --- BAR CHART ---
        if (this.chartType === "bar") {
            const step = chartWidth / this.data.length;
            const barWidth = step * 0.7;
            const gap = step * 0.15;

            this.data.forEach((val, i) => {
                // Staggered Animation
                const staggerDelay = 50 * i; // ms
                let localTime = time - staggerDelay;
                if (animType === "none") localTime = duration;

                let progress = 0;
                if (localTime > 0) {
                    progress = Math.min(localTime / (duration - staggerDelay || 1), 1);
                    if (animType === "grow") progress = 1 - Math.pow(1 - progress, 3); // EaseOut
                }

                if (progress <= 0 && animType !== "none") return;

                const targetH = (val / maxVal) * chartHeight;
                const h = targetH * progress;

                const bx = startX + i * step + gap;
                const by = startY + chartHeight - h;

                // Color Logic: Custom > Multi/Palette > Single
                let barColor = this.color;
                if (this.customColors[i]) {
                    barColor = this.customColors[i];
                } else if (this.useMultiColor) {
                    barColor = this.colorPalette[i % this.colorPalette.length];
                }

                ctx.fillStyle = barColor;
                ctx.fillRect(bx, by, barWidth, h);

                // Labels
                if (this.labels[i] && this.labelPosition !== "center") {
                    ctx.fillStyle = this.axisColor;
                    ctx.textAlign = "center";
                    if (this.labelPosition === "axis") {
                        ctx.fillText(this.labels[i], bx + barWidth / 2, startY + chartHeight + this.fontSize + 5);
                    } else if (this.labelPosition === "top") {
                        ctx.fillText(val.toString(), bx + barWidth / 2, by - 5);
                    }
                }
            });
        }

        // --- LINE / AREA CHART ---
        if (this.chartType === "line" || this.chartType === "area") {
            const step = chartWidth / (this.data.length - 1 || 1);
            const points = this.data.map((val, i) => ({
                x: startX + i * step,
                y: startY + chartHeight - (val / maxVal) * chartHeight
            }));

            // Animation: progressive draw (Wipe L->R)
            const maxDrawX = startX + chartWidth * (animType === "grow" ? globalProgress : 1);

            if (points.length > 0) {
                ctx.beginPath();
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 3;
                ctx.lineJoin = "round";
                ctx.lineCap = "round";

                // Build path carefully to clip at maxDrawX
                ctx.moveTo(points[0].x, points[0].y);
                let lastDrawnPoint = points[0];

                for (let i = 1; i < points.length; i++) {
                    const p = points[i];
                    const prevP = points[i - 1];
                    if (p.x <= maxDrawX) {
                        ctx.lineTo(p.x, p.y);
                        lastDrawnPoint = p;
                    } else {
                        if (prevP.x < maxDrawX) {
                            const ratio = (maxDrawX - prevP.x) / (p.x - prevP.x);
                            const y = prevP.y + (p.y - prevP.y) * ratio;
                            ctx.lineTo(maxDrawX, y);
                            lastDrawnPoint = { x: maxDrawX, y };
                        }
                        break;
                    }
                }

                if (this.chartType === "line") {
                    ctx.stroke();
                } else {
                    // Close path for Area
                    ctx.lineTo(lastDrawnPoint.x, startY + chartHeight);
                    ctx.lineTo(startX, startY + chartHeight);
                    ctx.closePath();
                    ctx.fillStyle = this.color; // Should ideally be lighter or gradient
                    ctx.globalAlpha = 0.5 * this.opacity;
                    ctx.fill();
                    ctx.globalAlpha = this.opacity;
                    // Redraw stroke on top
                    // (Simplified: just stroke the top line again if needed, or assume fill is enough)
                    ctx.beginPath();
                    ctx.moveTo(points[0].x, points[0].y);
                    for (let i = 1; i < points.length; i++) { // Re-calculate simple path for stroke
                        if (points[i].x <= maxDrawX) ctx.lineTo(points[i].x, points[i].y);
                        else if (points[i - 1].x < maxDrawX) {
                            const ratio = (maxDrawX - points[i - 1].x) / (points[i].x - points[i - 1].x);
                            const y = points[i - 1].y + (points[i].y - points[i - 1].y) * ratio;
                            ctx.lineTo(maxDrawX, y);
                            break;
                        }
                    }
                    ctx.stroke();
                }
            }

            // Dots (Scatter style on top of line)
            if (this.chartType === "line") {
                points.forEach((p, i) => {
                    if (p.x <= maxDrawX) {
                        ctx.beginPath();

                        let dotColor = this.useMultiColor ? this.colorPalette[i % this.colorPalette.length] : "white";
                        if (this.customColors[i]) dotColor = this.customColors[i];

                        ctx.fillStyle = dotColor;
                        ctx.strokeStyle = this.color;
                        ctx.lineWidth = 2;
                        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();

                        if (this.labels[i] && this.labelPosition === "axis") {
                            ctx.fillStyle = this.axisColor;
                            ctx.textAlign = "center";
                            ctx.fillText(this.labels[i], p.x, startY + chartHeight + this.fontSize + 5);
                        }
                    }
                });
            }
        }

        // --- SCATTER PLOT ---
        if (this.chartType === "scatter") {
            const step = chartWidth / (this.data.length - 1 || 1);
            this.data.forEach((val, i) => {
                // Staggered Pop In
                const stagger = i * 100;
                let localT = 1;
                if (animType === "grow") {
                    localT = Math.max(0, Math.min((time - stagger) / 400, 1));
                    // Elastic overshoot
                    const c4 = (2 * Math.PI) / 3;
                    if (localT > 0 && localT < 1) localT = Math.pow(2, -10 * localT) * Math.sin((localT * 10 - 0.75) * c4) + 1;
                }
                if (localT <= 0 && animType !== "none") return;

                const x = startX + i * step;
                const y = startY + chartHeight - (val / maxVal) * chartHeight;

                ctx.beginPath();

                let dotColor = this.color;
                if (this.customColors[i]) dotColor = this.customColors[i];
                else if (this.useMultiColor) dotColor = this.colorPalette[i % this.colorPalette.length];

                ctx.fillStyle = dotColor;
                ctx.arc(x, y, 6 * localT, 0, Math.PI * 2);
                ctx.fill();

                // Labels
                if (this.labels[i] && this.labelPosition === "top") {
                    ctx.fillStyle = this.axisColor;
                    ctx.textAlign = "center";
                    ctx.globalAlpha = localT * this.opacity;
                    ctx.fillText(val.toString(), x, y - 10);
                    ctx.globalAlpha = this.opacity;
                }
            });
        }

        // --- PIE / DONUT ---
        if (this.chartType === "pie" || this.chartType === "donut") {
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            const radius = Math.min(this.width, this.height) / 2 - 20;
            const innerR = this.chartType === "donut" ? radius * this.innerRadius : 0;

            const total = this.data.reduce((a, b) => a + b, 0);
            let currentAngle = -Math.PI / 2; // Start at top

            this.data.forEach((val, i) => {
                const sliceAngle = (val / total) * (Math.PI * 2);
                const endAngle = currentAngle + sliceAngle;

                // Animation: Rotate / Scale
                // Simple: wiping the angle? Or scaling the radius?
                // Let's do radial wipe (filling the circle)

                let visibleSliceAngle = sliceAngle;
                if (animType === "grow") {
                    // Calculate if this slice is reached by global progress (0 - 2PI)
                    const totalAngle = Math.PI * 2;
                    const targetEnd = -Math.PI / 2 + totalAngle * globalProgress;

                    if (currentAngle > targetEnd) {
                        visibleSliceAngle = 0; // Not reached yet
                    } else if (endAngle > targetEnd) {
                        visibleSliceAngle = targetEnd - currentAngle; // Partially visible
                    }
                }

                if (visibleSliceAngle > 0) {
                    ctx.beginPath();
                    // If donut, we draw outer arc, then inner arc in reverse
                    if (this.chartType === "donut") {
                        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + visibleSliceAngle, false);
                        ctx.arc(centerX, centerY, innerR, currentAngle + visibleSliceAngle, currentAngle, true); // Reverse
                        ctx.closePath();
                    } else { // Pie chart
                        ctx.moveTo(centerX, centerY); // Needed for correct fill
                        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + visibleSliceAngle);
                        ctx.closePath();
                    }

                    let sliceColor = (i === 0 ? this.color : "#eeeeee");
                    if (this.useMultiColor) sliceColor = this.colorPalette[i % this.colorPalette.length];
                    if (this.customColors[i]) sliceColor = this.customColors[i];

                    ctx.fillStyle = sliceColor;

                    // Pie usually needs multi color. If useMultiColor false, maybe vary opacity?
                    if (!this.useMultiColor && !this.customColors[i]) {
                        ctx.globalAlpha = (1 - i * 0.1) * this.opacity;
                        ctx.fill();
                        ctx.globalAlpha = this.opacity;
                    } else {
                        ctx.fill();
                    }

                    ctx.strokeStyle = "#fff";
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Labels (Center of slice)
                    if (this.labels[i] && visibleSliceAngle > sliceAngle * 0.5) { // Only show full label
                        const midAngle = currentAngle + visibleSliceAngle / 2;
                        const labelR = innerR + (radius - innerR) / 2;
                        const lx = centerX + Math.cos(midAngle) * labelR;
                        const ly = centerY + Math.sin(midAngle) * labelR;

                        ctx.fillStyle = "white";
                        ctx.font = `bold ${this.fontSize}px ${this.fontFamily}`;
                        ctx.textAlign = "center";
                        ctx.fillText(this.labels[i], lx, ly + 4);
                    }
                }
                currentAngle += sliceAngle;
            });
        }
        ctx.restore();
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
        clone.customColors = [...this.customColors];

        // Clone animation settings
        clone.animation = { ...this.animation };

        return clone;
    }
}
