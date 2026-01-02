import React, { forwardRef } from "react";

export const CanvasWorkspace = forwardRef<HTMLCanvasElement>((props, ref) => {
    return (
        <div className="flex-1 flex items-center justify-center overflow-hidden bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] p-8">
            <div className="relative w-full h-full flex items-center justify-center">
                 <div className="shadow-2xl shadow-slate-300 dark:shadow-slate-950 border border-slate-200 dark:border-slate-800 ring-4 ring-slate-100 dark:ring-slate-900 rounded-sm overflow-hidden aspect-video max-w-full max-h-full">
                    <canvas 
                        ref={ref}
                        width={1920}
                        height={1080}
                        className="w-full h-full bg-white dark:bg-slate-900 block cursor-crosshair"
                    />
                </div>
            </div>
        </div>
    );
});

CanvasWorkspace.displayName = "CanvasWorkspace";
