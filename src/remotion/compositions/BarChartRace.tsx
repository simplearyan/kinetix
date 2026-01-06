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

interface BarChartRaceProps {
    data?: FrameData[];
    maxItems?: number;
}

const BAR_HEIGHT = 60;
const GAP = 20;

export const BarChartRace: React.FC<BarChartRaceProps> = ({ data, maxItems = 5 }) => {
    const frame = useCurrentFrame();
    const { fps, width } = useVideoConfig();

    // 1. Determine "Time"
    // Assume 1 year = 60 frames (2 seconds)
    const FRAMES_PER_YEAR = 60;
    const safeData = data || [];
    const totalYears = safeData.length;

    if (totalYears === 0) return <div className="flex h-full w-full justify-center items-center text-white text-4xl font-bold">No Data</div>;

    // Which year index are we at?
    const progressTotal = frame / FRAMES_PER_YEAR;
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
    const xScale = scaleLinear()
        .domain([0, maxValue])
        .range([0, width - 400]); // Margin right for text

    return (
        <div className="w-full h-full bg-[#1E293B] flex flex-col items-center justify-center p-20 font-sans text-white">
            <h1 className="text-9xl font-bold mb-10 text-slate-700 absolute bottom-20 right-20 tabular-nums opacity-50">
                {Math.round(interpolate(currentYearData.year, nextYearData.year)(progressInYear))}
            </h1>

            <div className="relative w-full" style={{ height: maxItems * (BAR_HEIGHT + GAP) }}>
                {interpolatedItems.map((item, index) => {
                    // Check if in top N
                    const rank = index;
                    if (rank >= maxItems) return null;

                    return (
                        <div
                            key={item.id}
                            style={{
                                position: 'absolute',
                                top: rank * (BAR_HEIGHT + GAP),
                                left: 0,
                                width: '100%', // container width
                                transition: 'top 0.2s linear', // smooth rank swap? No, we render every frame, top changes instantly? 
                                // Actually, for smooth swapping, we need to interpolate position Y too.
                                // But since we sort every frame, the 'rank' integer jumps.
                                // Remotion renders every frame, so simple sorting causes instant jumps.
                                // Professional implementation uses a "rank" interpolation. 
                                // For MVP, instant jump is acceptable, or we use React Flip Move logic, but here we just render absolute.
                            }}
                            className="flex items-center"
                        >
                            {/* Label */}
                            <div className="w-48 text-right pr-4 font-bold text-slate-300 truncate">
                                {item.label}
                            </div>

                            {/* Bar */}
                            <div
                                style={{
                                    width: xScale(item.value),
                                    backgroundColor: item.color,
                                    height: BAR_HEIGHT
                                }}
                                className="rounded-r-lg flex items-center shadow-lg relative"
                            >
                                {/* Percentage/Value inside or outside */}
                                <span className="absolute left-[100%] ml-3 font-mono font-bold text-slate-200">
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
