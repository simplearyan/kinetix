import { KinetixObject } from "../Object";

interface DataPoint {
    year: number;
    values: Record<string, number>;
}

// Mock Data: Popular Social Networks (Simplified)
const MOCK_DATA: DataPoint[] = [
    { year: 2004, values: { "Facebook": 1, "MySpace": 5, "Friendster": 3, "Orkut": 2, "LinkedIn": 0.5 } },
    { year: 2005, values: { "Facebook": 5, "MySpace": 20, "Friendster": 5, "Orkut": 8, "LinkedIn": 2 } },
    { year: 2006, values: { "Facebook": 12, "MySpace": 50, "Friendster": 4, "Orkut": 15, "LinkedIn": 5, "Twitter": 0.1 } },
    { year: 2007, values: { "Facebook": 50, "MySpace": 80, "Friendster": 3, "Orkut": 25, "LinkedIn": 10, "Twitter": 5 } },
    { year: 2008, values: { "Facebook": 100, "MySpace": 75, "Friendster": 2, "Orkut": 40, "LinkedIn": 25, "Twitter": 20 } },
    { year: 2009, values: { "Facebook": 300, "MySpace": 60, "Friendster": 1, "Orkut": 50, "LinkedIn": 40, "Twitter": 50 } },
    { year: 2010, values: { "Facebook": 500, "MySpace": 40, "Instagram": 1, "Orkut": 45, "LinkedIn": 70, "Twitter": 100 } },
    { year: 2012, values: { "Facebook": 1000, "Instagram": 50, "Twitter": 200, "LinkedIn": 150, "Pinterest": 20 } },
    { year: 2015, values: { "Facebook": 1500, "Instagram": 400, "Twitter": 300, "LinkedIn": 300, "Pinterest": 100, "Snapchat": 100 } },
    { year: 2018, values: { "Facebook": 2200, "Instagram": 1000, "Twitter": 350, "LinkedIn": 500, "TikTok": 200, "Snapchat": 300 } },
    { year: 2020, values: { "Facebook": 2700, "Instagram": 1200, "TikTok": 700, "Twitter": 400, "LinkedIn": 700, "Snapchat": 400 } },
    { year: 2023, values: { "Facebook": 3000, "Instagram": 2000, "TikTok": 1600, "Twitter": 500, "LinkedIn": 900, "Snapchat": 750 } },
];

const COLORS: Record<string, string> = {
    "Facebook": "#1877F2",
    "MySpace": "#003399",
    "Friendster": "#CCCCCC",
    "Orkut": "#D6006D",
    "LinkedIn": "#0077B5",
    "Twitter": "#1DA1F2",
    "Instagram": "#E1306C",
    "Pinterest": "#BD081C",
    "Snapchat": "#FFFC00",
    "TikTok": "#000000"
};

export class BarChartRaceObject extends KinetixObject {
    maxBars: number = 8;
    data: DataPoint[] = MOCK_DATA;

    // Layout
    barHeight: number = 40;
    gap: number = 10;
    labelColor: string = "#333";
    valueColor: string = "#666";
    fontFamily: string = "Inter";
    fontSize: number = 14; // Base font size
    duration: number = 10000; // Total duration in ms

    // State for smooth animation
    private yPositions: Record<string, number> = {};
    private lastDrawTime: number = 0;

    constructor(id: string) {
        super(id, "BarChartRace");
        this.width = 600;
        this.height = 400;
    }

    draw(ctx: CanvasRenderingContext2D, time: number) {
        // 1. Time Interpolation
        const totalDuration = this.duration || 10000;
        const progress = Math.min(Math.max(time / totalDuration, 0), 1);

        const startYear = this.data[0].year;
        const endYear = this.data[this.data.length - 1].year;
        const currentYear = startYear + (endYear - startYear) * progress;

        // Check for seek/jump to reset animation state
        const isSeek = Math.abs(time - this.lastDrawTime) > 500;
        this.lastDrawTime = time;

        // 2. Interpolate Values (same)
        // Find indices
        let prevIndex = 0;
        for (let i = 0; i < this.data.length - 1; i++) {
            if (this.data[i + 1].year > currentYear) {
                prevIndex = i;
                break;
            }
            if (i === this.data.length - 2) prevIndex = this.data.length - 2;
        }

        const prev = this.data[prevIndex];
        const next = this.data[prevIndex + 1];
        const t = (currentYear - prev.year) / (next.year - prev.year);

        const currentValues: { label: string, value: number, color: string }[] = [];
        const allKeys = new Set([...Object.keys(prev.values), ...Object.keys(next.values)]);

        allKeys.forEach(key => {
            const v1 = prev.values[key] || 0;
            const v2 = next.values[key] || 0;
            const val = v1 + (v2 - v1) * t;
            if (val > 0) {
                currentValues.push({
                    label: key,
                    value: val,
                    color: COLORS[key] || "#999"
                });
            }
        });

        // 3. Rank
        currentValues.sort((a, b) => b.value - a.value);

        // Normalize for Width
        const maxValue = currentValues[0]?.value || 100;

        // 4. Draw
        ctx.save();
        ctx.translate(this.x, this.y);

        // Title / Year
        ctx.fillStyle = this.labelColor;
        // Scale year font relative to base font size (e.g. 4x)
        const yearFontSize = this.fontSize * 4.5;
        ctx.font = `bold ${yearFontSize}px ${this.fontFamily}`;
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        ctx.globalAlpha = 0.2;
        // Adjust position based on size
        ctx.fillText(Math.floor(currentYear).toString(), this.width - 20, this.height - 20);
        ctx.globalAlpha = this.opacity;

        // Draw Bars
        const visibleBars = currentValues.slice(0, this.maxBars);

        visibleBars.forEach((item, i) => {
            const targetY = i * (this.barHeight + this.gap) + 40;

            // Smooth lerp for Y position
            let currentY = this.yPositions[item.label];

            // Initialize or Snap if seeking (large time jump)
            if (currentY === undefined || isSeek) {
                currentY = targetY;
            } else {
                // Lerp towards target (10% per frame approx)
                currentY = currentY + (targetY - currentY) * 0.15;
                // Snap if very close to avoid micro-jitters
                if (Math.abs(currentY - targetY) < 0.5) currentY = targetY;
            }

            // Update state
            this.yPositions[item.label] = currentY;

            const y = currentY;

            // Width
            const w = (item.value / maxValue) * (this.width - 150);

            // Draw Bar
            ctx.fillStyle = item.color;
            ctx.beginPath();
            ctx.roundRect(0, y, w, this.barHeight, 4);
            ctx.fill();

            // Label (Name)
            ctx.fillStyle = this.labelColor;
            ctx.font = `bold ${this.fontSize}px ${this.fontFamily}`;
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            ctx.fillText(item.label, -10, y + this.barHeight / 2);

            // Value
            ctx.fillStyle = this.valueColor;
            // Value slightly smaller? or same? Let's use same or 0.9x
            ctx.font = `${this.fontSize * 0.9}px ${this.fontFamily}`;
            ctx.textAlign = "left";
            ctx.fillText(Math.round(item.value).toLocaleString(), w + 10, y + this.barHeight / 2);
        });

        ctx.restore();
    }

    clone(): BarChartRaceObject {
        const clone = new BarChartRaceObject(`race-${Date.now()}`);
        clone.x = this.x + 20;
        clone.y = this.y + 20;
        clone.width = this.width;
        clone.height = this.height;
        return clone;
    }
}
