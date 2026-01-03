import React, { forwardRef } from "react";

export const CanvasWorkspace = forwardRef<HTMLCanvasElement>((props, ref) => {
    return (
        <div className="flex-1 flex items-center justify-center overflow-hidden min-w-0 min-h-0 bg-slate-50 dark:bg-slate-950 p-8">
             <div className="shadow-2xl shadow-slate-300 dark:shadow-slate-950 border border-slate-200 dark:border-slate-800 ring-4 ring-slate-100 dark:ring-slate-900 rounded-sm overflow-hidden aspect-video w-full h-auto max-w-6xl max-h-full">
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
