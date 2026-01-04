import React, { forwardRef } from "react";

export const CanvasWorkspace = forwardRef<HTMLCanvasElement, { aspectRatio?: number }>((props, ref) => {
    return (
        <div className="flex-1 flex items-center justify-center overflow-hidden min-w-0 min-h-0 bg-slate-50 dark:bg-neutral-950 p-2 md:p-8">
            <div
                style={{ aspectRatio: props.aspectRatio || 16 / 9 }}
                className="shadow-2xl shadow-slate-300 dark:shadow-neutral-950 border border-slate-200 dark:border-neutral-800 ring-4 ring-slate-100 dark:ring-neutral-900 rounded-sm overflow-hidden w-auto h-auto max-w-full max-h-full block"
            >
                <canvas
                    ref={ref}
                    width={1920}
                    height={1080}
                    className="w-full h-full bg-white dark:bg-slate-900 block cursor-crosshair"
                />
            </div>
        </div>
    );
});

CanvasWorkspace.displayName = "CanvasWorkspace";
