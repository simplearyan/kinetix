import type { SceneObject } from '../SceneObject';

export interface CanvasBarChartProperties {
    title: string;
    data: { label: string, value: number }[];
    barColor: string;
    textColor: string;
    name?: string;
}

export class CanvasBarChart implements SceneObject {
    id: string;
    type: 'chart' = 'chart';
    x: number;
    y: number;
    width: number;
    height: number;

    startTime: number;
    duration: number;

    // Props
    title: string;
    data: { label: string, value: number }[];
    barColor: string;
    textColor: string;

    constructor(id: string, props: Partial<CanvasBarChartProperties> & { x: number, y: number }) {
        this.id = id;
        this.x = props.x;
        this.y = props.y;
        this.width = 400; // Default size
        this.height = 300;

        this.title = props.title || 'Growth Chart';
        this.data = props.data || [
            { label: 'Q1', value: 30 },
            { label: 'Q2', value: 50 },
            { label: 'Q3', value: 80 },
            { label: 'Q4', value: 65 },
        ];
        this.barColor = props.barColor || '#3b82f6'; // blue-500
        this.textColor = props.textColor || '#e2e8f0'; // slate-200

        this.startTime = 0;
        this.duration = 1500;

        this.name = props.name || this.title || id;
    }

    // New: Name
    name: string;

    // New: Clone
    clone(): CanvasBarChart {
        const newId = `chart-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newX = this.x + 20;
        const newY = this.y + 20;

        const clone = new CanvasBarChart(newId, {
            x: newX,
            y: newY,
            title: this.title,
            data: JSON.parse(JSON.stringify(this.data)), // Deep copy data
            barColor: this.barColor,
            textColor: this.textColor
        });

        clone.duration = this.duration;
        clone.startTime = this.startTime;
        clone.name = this.name + " (Copy)";

        return clone;
    }

    draw(ctx: CanvasRenderingContext2D, time: number) {
        const t = time - this.startTime;
        if (t < 0) return;

        const progress = Math.min(1, t / this.duration);
        const ease = 1 - Math.pow(1 - progress, 3); // Ease out cubic

        ctx.save();
        ctx.translate(this.x, this.y);

        // Debug bg
        // ctx.fillStyle = 'rgba(255,255,255,0.05)';
        // ctx.fillRect(0,0, this.width, this.height);

        // Title
        ctx.fillStyle = this.textColor;
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.title, this.width / 2, 30);

        // Chart Area
        const chartTop = 60;
        const chartBottom = this.height - 40;
        const chartLeft = 40;
        const chartRight = this.width - 20;

        // Axes
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(chartLeft, chartTop);
        ctx.lineTo(chartLeft, chartBottom);
        ctx.lineTo(chartRight, chartBottom);
        ctx.stroke();

        // Bars
        const maxValue = Math.max(...this.data.map(d => d.value)) * 1.1; // 10% headroom
        const barCount = this.data.length;
        const availableWidth = (chartRight - chartLeft);
        const barSpacing = availableWidth / barCount;
        const barWidth = barSpacing * 0.6;
        const spacing = barSpacing * 0.2;

        this.data.forEach((d, i) => {
            const x = chartLeft + spacing + (i * barSpacing);
            const maxBarHeight = chartBottom - chartTop;
            const targetHeight = (d.value / maxValue) * maxBarHeight;

            // Stagger animation slightly per bar
            const barProgress = Math.min(1, Math.max(0, (progress * 1.5) - (i * 0.1)));
            const currentHeight = targetHeight * ease;
            // Note: using global ease for simplicity, or calculated barProgress ease

            const y = chartBottom - currentHeight;

            // Bar
            ctx.fillStyle = this.barColor;
            ctx.fillRect(x, y, barWidth, currentHeight);

            // Label
            ctx.fillStyle = this.textColor;
            ctx.font = '12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(d.label, x + barWidth / 2, chartBottom + 20);
        });

        ctx.restore();
    }

    containsPoint(px: number, py: number): boolean {
        return px >= this.x && px <= this.x + this.width &&
            py >= this.y && py <= this.y + this.height;
    }

    getProperties() {
        return {
            title: this.title,
            barColor: this.barColor,
            textColor: this.textColor,
            duration: this.duration,
            startTime: this.startTime,
            name: this.name
        };
    }

    updateProperties(props: any) {
        if (props.title !== undefined) this.title = props.title;
        if (props.barColor !== undefined) this.barColor = props.barColor;
        if (props.textColor !== undefined) this.textColor = props.textColor;
        if (props.duration !== undefined) this.duration = Number(props.duration);
        if (props.startTime !== undefined) this.startTime = Number(props.startTime);
        if (props.name !== undefined) this.name = props.name;
    }
}
