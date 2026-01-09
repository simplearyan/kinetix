import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { scaleLinear } from 'd3-scale';
import { interpolate } from 'd3-interpolate';

interface BarData {
    id: string;
    label: string;
    value: number;
    color: string;
}

interface FrameData {
    year: number;
    data: BarData[];
}

interface BarChartStyle {
    barHeight: number;
    gap: number;
    fontSize: number;
    labelColor: string;
    containerPadding: number;
    roundDuration: number;
}

interface BarChartRaceProps {
    data?: FrameData[];
    maxItems?: number;
    style?: React.CSSProperties & {
        barChartStyle?: BarChartStyle;
    };
}

export const BarChartRace: React.FC<BarChartRaceProps> = ({ data, maxItems = 5, style }) => {
    const frame = useCurrentFrame();
    const { fps, width } = useVideoConfig();

    // Defaults
    const chartStyle = style?.barChartStyle || {
        barHeight: 60,
        gap: 20,
        fontSize: 24,
        labelColor: '#cbd5e1',
        containerPadding: 80,
        roundDuration: 60
    };

    const { barHeight, gap, fontSize, labelColor, containerPadding, roundDuration } = chartStyle;

    // 1. Determine "Time"
    // Use dynamic round duration (frames per year)
    const framesPerYear = roundDuration || 60;
    const safeData = data || [];
    const totalYears = safeData.length;

    if (totalYears === 0) return <div className="flex h-full w-full justify-center items-center text-white text-4xl font-bold">No Data</div>;

    // Which year index are we at?
    const progressTotal = frame / framesPerYear;
    const currentIndex = Math.min(Math.floor(progressTotal), totalYears - 2);
    const progressInYear = progressTotal - currentIndex; // 0 to 1

    // 2. Interpolate Values
    // We need to interpolate between data[currentIndex] and data[currentIndex+1]
    const currentYearData = safeData[currentIndex];
    const nextYearData = safeData[currentIndex + 1] || currentYearData;

    // Create a map of all IDs to interpolate values
    const allIds = new Set([...currentYearData.data.map(d => d.id), ...nextYearData.data.map(d => d.id)]);

    const interpolatedItems = Array.from(allIds).map(id => {
        const startItem = currentYearData.data.find(d => d.id === id);
        const endItem = nextYearData.data.find(d => d.id === id);

        const startValue = startItem ? startItem.value : 0;
        const endValue = endItem ? endItem.value : startValue; // If disappearing, stay or fade? simpler to hold last val
        const color = startItem?.color || endItem?.color || '#888';
        const label = startItem?.label || endItem?.label || id;

        // Linear interpolation
        const val = interpolate(startValue, endValue)(progressInYear);

        return {
            id,
            label,
            value: val,
            color
        };
    });

    // 3. Rank Items
    // Sort descending
    interpolatedItems.sort((a, b) => b.value - a.value);

    // 4. Calculate Layout
    // We only show top N
    const visibleItems = interpolatedItems.slice(0, maxItems);
    const maxValue = visibleItems[0]?.value || 100;

    // Scale
    // Use containerPadding for margins
    const chartWidth = width - (containerPadding * 2) - 300; // 300 for right side number label space? Adjust as needed.
    const xScale = scaleLinear()
        .domain([0, maxValue])
        .range([0, Math.max(100, chartWidth)]); // Ensure positive width

    return (
        <div
            style={{
                ...style,
                backgroundColor: style?.backgroundColor || '#1E293B',
                padding: containerPadding
            }}
            className="w-full h-full flex flex-col items-center justify-center font-sans text-white box-border"
        >
            <h1 className="font-bold mb-10 text-slate-700 absolute bottom-20 right-20 tabular-nums opacity-50" style={{ fontSize: fontSize * 4 }}>
                {Math.round(interpolate(currentYearData.year, nextYearData.year)(progressInYear))}
            </h1>

            <div className="relative w-full" style={{ height: maxItems * (barHeight + gap) }}>
                {interpolatedItems.map((item, index) => {
                    // Check if in top N
                    const rank = index;
                    if (rank >= maxItems) return null;

                    return (
                        <div
                            key={item.id}
                            style={{
                                position: 'absolute',
                                top: rank * (barHeight + gap),
                                left: 0,
                                width: '100%', // container width
                                transition: 'top 0.2s linear',
                            }}
                            className="flex items-center"
                        >
                            {/* Label */}
                            <div
                                className="w-48 text-right pr-4 font-bold truncate"
                                style={{ color: labelColor, fontSize: Math.max(12, fontSize * 0.7) }}
                            >
                                {item.label}
                            </div>

                            {/* Bar */}
                            <div
                                style={{
                                    width: xScale(item.value),
                                    backgroundColor: item.color,
                                    height: barHeight
                                }}
                                className="rounded-r-lg flex items-center shadow-lg relative"
                            >
                                {/* Percentage/Value inside or outside */}
                                <span
                                    className="absolute left-[100%] ml-3 font-mono font-bold text-slate-200"
                                    style={{ fontSize: fontSize }}
                                >
                                    {Math.round(item.value).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
