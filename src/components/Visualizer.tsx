import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DiagramData, Node, Edge } from '../engine/types';
import clsx from 'clsx';

interface VisualizerProps {
    data: DiagramData;
    variant: 'corporate' | 'hand-drawn' | 'neon';
    config?: any; // DiagramConfig
}

export const Visualizer: React.FC<VisualizerProps> = ({ data, variant, config }) => {
    
    // Apply global text color if set
    const style = config?.textColor ? { color: config.textColor } : {};

    if (data.type === 'mindmap') {
        return <MindmapLayout data={data} variant={variant} config={config} style={style} />;
    }
    
    if (data.type === 'math') {
        return <MathLayout data={data} variant={variant} config={config} style={style} />;
    }

    if (data.type === 'bar') {
        return <BarChartLayout data={data} variant={variant} config={config} style={style} />;
    }

    if (data.type === 'pie') {
        return <PieChartLayout data={data} variant={variant} config={config} style={style} />;
    }

    if (data.type === 'process' || data.type === 'cycle') {
        return <ProcessLayout data={data} isCycle={data.type === 'cycle'} variant={variant} config={config} style={style} />;
    }
    
    return <ListLayout data={data} variant={variant} config={config} style={style} />;
};

// ... existing styles helper ...

// --- Layouts ---

const ProcessLayout = ({ data, isCycle, variant, config, style }: any) => {
    return (
        <div className="flex items-center justify-center gap-4 flex-wrap max-w-4xl p-8" style={style}>
            {data.nodes.map((node: any, i: number) => (
                <motion.div 
                    key={node.id}
                    layout // Keep layout for smooth reordering if needed
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="relative flex items-center justify-center p-4"
                >
                    {/* Node */}
                    <div
                        className={clsx(
                            "p-6 w-48 min-h-[100px] flex items-center justify-center text-center relative z-10",
                            getCardStyle(variant)
                        )}
                        style={{ 
                            backgroundColor: config?.accentColor || undefined,
                            borderColor: config?.accentColor ? 'transparent' : undefined,
                            color: config?.textColor || (config?.accentColor ? 'white' : undefined)
                            }}
                    >
                        <span className="text-lg font-bold">{node.label}</span>
                        
                        {/* Step Badge */}
                        <div className={clsx(
                            "absolute -top-3 -left-3 w-8 h-8 flex items-center justify-center font-bold",
                            variant === 'hand-drawn' ? "bg-amber-100 border-2 border-slate-800 rounded-none shadow-[2px_2px_0px_0px_black]" :
                            variant === 'neon' ? "bg-slate-900 border border-blue-500 text-blue-400 rounded-full" :
                            "bg-blue-100 border-2 border-white rounded-full text-blue-600 shadow-sm"
                        )}>
                            {i + 1}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

// ... ListLayout ...

const MindmapLayout = ({ data, variant, config, style }: any) => {
    // ...
    // Update renderNode to accept styles
    const root = data.nodes.find((n: any) => n.level === 0) || data.nodes[0];
    if (!root) return null;

    const getChildren = (parentId: string) => data.nodes.filter((n: any) => n.parentId === parentId);

    const renderNode = (node: Node) => {
        const children = getChildren(node.id);
        
        return (
            <div className="flex flex-row items-center gap-8" style={style}>
                 <motion.div
                    key={node.id + '-card'} 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={clsx("p-4 whitespace-nowrap z-10", getCardStyle(variant))}
                    style={{ 
                        backgroundColor: config?.accentColor || undefined,
                        color: config?.textColor || (config?.accentColor ? 'white' : undefined)
                    }}
                >
                    {node.label}
                </motion.div>

                {children.length > 0 && (
                    <div className="flex flex-col gap-4 relative">
                        {/* Connector Vertical */}
                        <div className={clsx("absolute top-0 bottom-0 -left-6 w-4 border-l-2 rounded-l-xl", getEdgeStyle(variant))} 
                             style={{ top: '50%', bottom: '50%', transform: 'scaleY(0.9)', borderColor: config?.accentColor }}
                        ></div>
                        {children.map((child: any) => (
                            <div key={child.id} className="relative flex items-center">
                                {/* Connector Horizontal */}
                                <div className={clsx("w-8 h-0.5 -ml-8", variant === 'hand-drawn' ? "bg-slate-800" : "bg-slate-300")}
                                     style={{ backgroundColor: config?.accentColor }}
                                />
                                {renderNode(child)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-8 overflow-auto flex items-center justify-center min-h-[400px]">
             {renderNode(root)}
        </div>
    );
};

const MathLayout = ({ data, variant, config, style }: any) => {
    return (
        <div className="flex flex-col gap-8 items-center justify-center p-12" style={style}>
            {data.nodes.map((node: any, i: number) => (
                <motion.div
                    key={node.id}
                    className={clsx("p-8 text-2xl font-serif text-center", getCardStyle(variant))}
                    style={{ color: config?.textColor }}
                >
                     {/* ... content ... */}
                     <div>{node.label}</div>
                </motion.div>
            ))}
        </div>
    );
};

const BarChartLayout = ({ data, variant, config, style }: any) => {
    const values = data.nodes.map((n:any) => n.value || 0);
    const max = Math.max(...values, 100); 
    // Uses config.accentColor directly in styles which is correct.
    // Fixed: deterministic rotation.
    
    return (
        <div className="flex items-end justify-center gap-6 h-[400px] w-full max-w-2xl px-8 pb-12 pt-20" style={style}>
            {data.nodes.map((node: any, i: number) => {
                const heightPercentage = Math.max(((node.value || 0) / max) * 100, 2); 
                
                return (
                    <motion.div
                        key={node.id}
                        className="flex flex-col items-center gap-3 relative group w-full h-full justify-end"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                    >
                        {/* Value Label */}
                        <div className={clsx(
                            "absolute -top-8 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity",
                            variant === 'neon' ? "text-blue-400" : "text-slate-500"
                        )} style={{ color: config?.textColor }}>
                            {node.value}
                        </div>

                        {/* Bar */}
                        <div 
                            className={clsx(
                                "w-full max-w-[60px] rounded-t-md transition-all relative",
                                variant === 'hand-drawn' ? "bg-blue-400 border-2 border-slate-800 rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1" :
                                variant === 'neon' ? "bg-slate-800 border-t border-x border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]" :
                                "bg-blue-500 hover:bg-blue-600 shadow-sm"
                            )}
                            style={{ 
                                height: `${heightPercentage}%`,
                                transform: variant === 'hand-drawn' ? `rotate(${(i % 2 === 0 ? 0.5 : -0.5) + Math.sin(i) * 0.5}deg)` : undefined,
                                backgroundColor: config?.accentColor || undefined,
                                borderColor: config?.accentColor ? '#334155' : undefined
                            }}
                        >
                            {/* Neon Glow */}
                            {variant === 'neon' && (
                                <div className="absolute top-0 left-0 w-full h-2 bg-blue-400 blur-sm opacity-50"></div>
                            )}
                        </div>

                        {/* Label */}
                        <span className={clsx(
                            "text-sm font-medium text-center truncate w-full",
                            variant === 'neon' ? "text-slate-300 font-mono" : 
                            variant === 'hand-drawn' ? "font-hand text-slate-800" : 
                            "text-slate-600"
                        )} style={{ color: config?.textColor }}>
                            {node.label}
                        </span>
                    </motion.div>
                );
            })}
        </div>
    );
};

const PieChartLayout = ({ data, variant, config, style }: any) => {
    // ... calculate slices ...
    const values = data.nodes.map((n:any) => n.value || 0);
    const total = values.reduce((a:number, b:number) => a + b, 0);
    let currentAngle = 0;
    const slices = data.nodes.map((node:any, i:number) => {
        // ... same calculation ...
        const val = node.value || 0;
        const angle = (val / total) * 360;
        const start = currentAngle;
        currentAngle += angle;
        if (val <= 0) return null;
        
        const radius = 100;
        const x1 = 150 + radius * Math.cos(Math.PI * start / 180);
        const y1 = 150 + radius * Math.sin(Math.PI * start / 180);
        const x2 = 150 + radius * Math.cos(Math.PI * (start + angle) / 180);
        const y2 = 150 + radius * Math.sin(Math.PI * (start + angle) / 180);
        const largeArc = angle > 180 ? 1 : 0;
        const d = `M150,150 L${x1},${y1} A${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z`;

        // Colors
        const defaultColors = variant === 'neon' 
            ? ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'] 
            : ['#60a5fa', '#34d399', '#f87171', '#fbbf24', '#818cf8'];

        return { ...node, d, start, angle, centerAngle: start + angle / 2, color: defaultColors[i % defaultColors.length] };
    }).filter(Boolean);

    return (
         <div className="flex flex-col items-center justify-center p-8 h-[400px]" style={style}>
             <svg width="300" height="300" viewBox="0 0 300 300" className="overflow-visible">
                 {/* ... defs ... */}
                 {slices.map((slice: any, i: number) => (
                    <motion.path
                        key={slice.id}
                        d={slice.d}
                        fill={slice.color} 
                        stroke={variant === 'neon' ? slice.color : 'white'}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="origin-center hover:scale-105 transition-transform"
                    />
                 ))}
                 {/* Labels */}
                 {slices.map((slice: any, i: number) => {
                     const labelRadius = 140;
                     const lx = 150 + labelRadius * Math.cos(Math.PI * slice.centerAngle / 180);
                     const ly = 150 + labelRadius * Math.sin(Math.PI * slice.centerAngle / 180);
                     return (
                        <motion.text
                            key={`label-${slice.id}`}
                            x={lx} y={ly}
                            textAnchor={lx > 150 ? "start" : "end"}
                            dominantBaseline="middle"
                            className="text-xs font-bold pointer-events-none fill-current"
                            style={{ fill: config?.textColor }}
                        >
                            {slice.label} ({Math.round(slice.value / total * 100)}%)
                        </motion.text>
                     )
                 })}
             </svg>
         </div>
    );
};

// --- Styles Helper ---
const getCardStyle = (variant: string) => {
    if (variant === 'hand-drawn') {
        return "bg-white border-2 border-slate-800 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-hand hover:-translate-y-1 transition-transform rotate-1";
    }
    if (variant === 'neon') {
        return "bg-slate-900 border border-blue-500 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] text-blue-100 font-mono";
    }
    // Corporate/Default
    return "bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all font-sans text-slate-700";
};

const getEdgeStyle = (variant: string) => {
    if (variant === 'hand-drawn') return "text-slate-800";
    if (variant === 'neon') return "text-blue-500 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]";
    return "text-slate-300";
};

// --- Layouts ---


