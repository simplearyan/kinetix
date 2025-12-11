export interface SceneObject {
    id: string;
    type: 'text' | 'chart' | 'scribble' | 'image' | 'progress' | 'code' | 'counter';
    x: number;
    y: number;
    width: number;
    height: number;
    startTime: number; // ms offset when this object appears
    duration: number;  // ms duration of animation

    // Core render method
    draw(ctx: CanvasRenderingContext2D, time: number): void;

    // Selection/Interaction
    containsPoint(x: number, y: number): boolean;

    // Properties helper (for UI)
    getProperties(): Record<string, any>;
    updateProperties(props: Record<string, any>): void;

    // Optional Name (for Layers Panel)
    name?: string;

    // Clone (for Duplication)
    clone?(): SceneObject;
}
