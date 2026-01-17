import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, type PanInfo, useAnimation } from "framer-motion";
import { X, ChevronDown } from "lucide-react";

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    initialSnap?: number; // 0 to 1 (percentage of screen height)
    snaps?: number[]; // [0.5, 0.9]
    variant?: 'sheet' | 'dock';
    onSnapChange?: (snapIndex: number) => void;
    zIndex?: number;
    manualSnap?: number | null; // Allow forcing a snap update
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
    isOpen,
    onClose,
    children,
    title,
    initialSnap = 0.5,
    snaps = [0.5, 0.9],
    variant = 'sheet',
    onSnapChange,
    zIndex = 50,
    manualSnap
}) => {
    const [activeSnap, setActiveSnap] = useState(initialSnap);

    // Reset snap when opening
    useEffect(() => {
        if (isOpen) {
            setActiveSnap(initialSnap);
        }
    }, [isOpen, initialSnap]);

    // React to manual snap changes
    useEffect(() => {
        if (manualSnap !== undefined && manualSnap !== null) {
            setActiveSnap(manualSnap);
        }
    }, [manualSnap]);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    const isDock = variant === 'dock';

    const handleDragEnd = (e: any, info: PanInfo) => {
        const threshold = 100; // px
        const velocityThreshold = 500; // px/s

        // If dragged down significantly or flicked down from the bottom-most snap
        // We need to check if we are closing or snapping.

        // Current sheet Y position (approximate from drag) is needed to calculate snap
        // A simple heuristic: check offset.y

        // If dragged down far enough to close
        if (info.offset.y > 200) {
            onClose();
            return;
        }

        // Calculate predicted end Y position (0 is top of screen, window.innerHeight is bottom)
        // Note: motion.div y is percentage based in our animate prop. 
        // But drag works in pixels. We need to convert.

        const sheetHeight = window.innerHeight;
        // Current "y" value relative to full open (0% y) when we started dragging was (1-activeSnap)*height
        // info.point.y gives us the absolute page coordinates

        const predictedY = info.point.y + info.velocity.y * 0.2;
        const predictedSnap = 1 - (predictedY / sheetHeight);

        // Find closest snap
        const closest = snaps.reduce((prev, curr) => {
            return (Math.abs(curr - predictedSnap) < Math.abs(prev - predictedSnap) ? curr : prev);
        });

        setActiveSnap(closest);
        onSnapChange?.(snaps.indexOf(closest));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop - Only for sheet variant */}
                    {!isDock && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-transparent z-40 lg:hidden"
                        />
                    )}

                    {/* Sheet / Dock */}
                    <motion.div
                        initial={{ y: isDock ? "0%" : "100%" }}
                        animate={{ y: isDock ? "0%" : `${(1 - activeSnap) * 100}%` }}
                        exit={{ y: isDock ? "0%" : "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        drag={isDock ? false : "y"}
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.05}
                        dragMomentum={false}
                        onDragEnd={isDock ? undefined : handleDragEnd}
                        className={`fixed left-0 right-0 bg-white dark:bg-app-surface shadow-2xl flex flex-col lg:hidden
                            ${isDock ? "border-t border-slate-200 dark:border-app-border pb-safe bottom-16" : "rounded-t-3xl max-h-[95vh] bottom-0"}
                        `}
                        style={{ height: isDock ? "auto" : "95vh", zIndex }}
                    >
                        {/* Handle / Header */}
                        {!isDock && (
                            <div className="flex flex-col items-center pt-2 pb-0 shrink-0 cursor-grab active:cursor-grabbing touch-none">
                                <div className="w-12 h-1.5 bg-slate-300 dark:bg-neutral-600 rounded-full mb-3" />
                                {title && (
                                    <div className="w-full px-4 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-app-border">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
                                        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Content */}
                        <div className={`flex-1 overflow-y-auto overscroll-contain ${isDock ? "" : "px-4 pb-8"}`}>
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
