import { create } from 'zustand';
import { interpolate } from 'd3-interpolate';

export type AnimatorTab = 'data' | 'math' | 'code' | 'style' | 'motion' | 'library';

// Data Types
export interface BarChartDataPoint {
    id: string;
    label: string;
    value: number;
    color: string;
    img?: string;
}

export interface BarChartFrame {
    year: number;
    data: BarChartDataPoint[];
}

export interface BarChartStyle {
    barHeight: number;
    gap: number;
    fontSize: number;
    labelColor: string;
    containerPadding: number;
    roundDuration: number;
}

interface AnimatorState {
    activeTab: 'library' | 'data' | 'math' | 'code' | 'style' | 'motion';
    setActiveTab: (tab: 'library' | 'data' | 'math' | 'code' | 'style' | 'motion') => void;

    // Future: Project State
    projectTitle: string;
    setProjectTitle: (title: string) => void;

    // Data State (Bar Chart Race)
    barChartData: BarChartFrame[];
    setBarChartData: (data: BarChartFrame[]) => void;

    // Bar Chart Style
    barChartStyle: BarChartStyle;
    setBarChartStyle: (style: Partial<BarChartStyle>) => void;

    // Composition State
    activeCompositionId: string;
    setActiveCompositionId: (id: string) => void;

    // Math State
    currentLatex: string;
    setCurrentLatex: (latex: string) => void;

    // Code State
    currentCode: string;
    setCurrentCode: (code: string) => void;

    // UI State
    isExportOpen: boolean;
    setIsExportOpen: (isOpen: boolean) => void;
    isCloudRenderOpen: boolean;
    setIsCloudRenderOpen: (isOpen: boolean) => void;
    isInterstitialOpen: boolean;
    setIsInterstitialOpen: (isOpen: boolean) => void;
    isPropertyPanelExpanded: boolean;
    setIsPropertyPanelExpanded: (isExpanded: boolean) => void;

    // Style State
    backgroundColor: string;
    setBackgroundColor: (color: string) => void;

    // Video Settings
    aspectRatio: '16:9' | '9:16' | '1:1' | '3:4' | '4:3' | '4:5';
    canvasSize: { width: number; height: number };
    setAspectRatio: (ratio: '16:9' | '9:16' | '1:1' | '3:4' | '4:3' | '4:5') => void;
}

export const useAnimatorStore = create<AnimatorState>((set) => ({
    activeTab: 'library', // Default to library on desktop, maybe 'data' on mobile?
    setActiveTab: (tab: AnimatorTab) => set({ activeTab: tab }),

    projectTitle: 'Untitled Project',
    setProjectTitle: (title: string) => set({ projectTitle: title }),

    // Mock Data for Bar Chart Race
    barChartData: Array.from({ length: 20 }, (_, i) => ({
        year: 2000 + i,
        data: [
            { id: 'apple', label: 'Apple', value: 100 + Math.pow(i, 2.5) * 5 + Math.random() * 50, color: '#A3AAAE' },
            { id: 'google', label: 'Google', value: 50 + Math.pow(i, 2.2) * 8 + Math.random() * 50, color: '#EA4335' },
            { id: 'microsoft', label: 'Microsoft', value: 300 + i * 20 + Math.random() * 50, color: '#00A4EF' },
            { id: 'amazon', label: 'Amazon', value: 20 + Math.pow(i, 2.4) * 6 + Math.random() * 50, color: '#FF9900' },
            { id: 'tesla', value: i > 10 ? Math.pow(i - 10, 3) * 5 : 10, color: '#CC0000', label: 'Tesla' }
        ]
    })),
    setBarChartData: (data: BarChartFrame[]) => set({ barChartData: data }),

    barChartStyle: {
        barHeight: 60,
        gap: 20,
        fontSize: 24, // Value font size
        labelColor: '#cbd5e1', // slate-300
        containerPadding: 80,
        roundDuration: 60 // Frames per "year"
    },
    setBarChartStyle: (style) => set((state) => ({ barChartStyle: { ...state.barChartStyle, ...style } })),

    activeCompositionId: 'MathFormula', // Default
    setActiveCompositionId: (id: string) => set({ activeCompositionId: id }),

    // Math State
    currentLatex: '\\sum_{i=0}^n i^2 = \\frac{(n^2+n)(2n+1)}{6}',
    setCurrentLatex: (latex: string) => set({ currentLatex: latex }),

    // Code State
    currentCode: 'console.log("Hello World");',
    setCurrentCode: (code: string) => set({ currentCode: code }),

    // UI State
    isExportOpen: false,
    setIsExportOpen: (isOpen) => set({ isExportOpen: isOpen }),
    isCloudRenderOpen: false,
    setIsCloudRenderOpen: (isOpen) => set({ isCloudRenderOpen: isOpen }),
    isInterstitialOpen: false,
    setIsInterstitialOpen: (isOpen) => set({ isInterstitialOpen: isOpen }),
    isPropertyPanelExpanded: false,
    setIsPropertyPanelExpanded: (isExpanded) => set({ isPropertyPanelExpanded: isExpanded }),

    // Style State
    backgroundColor: '#1E1E1E',
    setBackgroundColor: (color: string) => set({ backgroundColor: color }),

    // Video Settings
    aspectRatio: '16:9',
    canvasSize: { width: 1920, height: 1080 },
    setAspectRatio: (ratio: '16:9' | '9:16' | '1:1' | '3:4' | '4:3' | '4:5') => {
        let width = 1920;
        let height = 1080;

        switch (ratio) {
            case '16:9': width = 1920; height = 1080; break;
            case '9:16': width = 1080; height = 1920; break;
            case '1:1': width = 1080; height = 1080; break;
            case '3:4': width = 1080; height = 1440; break;
            case '4:3': width = 1440; height = 1080; break;
            case '4:5': width = 1080; height = 1350; break;
        }

        set({ aspectRatio: ratio, canvasSize: { width, height } });
    },
}));
