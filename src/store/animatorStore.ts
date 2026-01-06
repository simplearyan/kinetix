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

interface AnimatorState {
    activeTab: 'library' | 'data' | 'math' | 'code' | 'style' | 'motion';
    setActiveTab: (tab: 'library' | 'data' | 'math' | 'code' | 'style' | 'motion') => void;

    // Future: Project State
    projectTitle: string;
    setProjectTitle: (title: string) => void;

    // Data State (Bar Chart Race)
    barChartData: BarChartFrame[];
    setBarChartData: (data: BarChartFrame[]) => void;

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
}));
