import React, { useEffect, useRef } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import katex from 'katex';
import 'katex/dist/katex.min.css'; // Ensure this is importable, or handle via global CSS

interface MathFormulaProps {
    latex?: string;
    primaryColor?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({ latex = '', primaryColor = '#38BDF8' }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const containerRef = useRef<HTMLDivElement>(null);

    const scale = spring({
        frame,
        fps,
        config: {
            damping: 10,
            stiffness: 100,
        },
    });

    useEffect(() => {
        if (containerRef.current) {
            katex.render(latex, containerRef.current, {
                throwOnError: false,
                displayMode: true,
            });
        }
    }, [latex]);

    return (
        <AbsoluteFill className="bg-[#0F172A] items-center justify-center">
            <div
                ref={containerRef}
                style={{
                    transform: `scale(${scale})`,
                    color: '#F8FAFC',
                    fontSize: '4rem',
                    padding: '2rem',
                }}
                className="font-bold drop-shadow-lg"
            />
            {/* Attribution / Watermark style */}
            <div className="absolute bottom-8 right-12 text-slate-600 font-mono text-xl opacity-50">
                Kinetix Math
            </div>
        </AbsoluteFill>
    );
};
