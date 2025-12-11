export type DiagramType = 'process' | 'cycle' | 'comparison' | 'list' | 'mindmap' | 'math' | 'bar' | 'pie' | 'line' | 'venn' | 'funnel';

export interface Node {
    id: string;
    label: string;
    value?: number;
    icon?: string;
    color?: string;
    // For Hierarchies
    parentId?: string;
    children?: string[]; // IDs of children
    level?: number;
}

export interface Edge {
    from: string;
    to: string;
    label?: string;
}

export interface DiagramData {
    type: DiagramType;
    nodes: Node[];
    edges: Edge[];
    title?: string;
}
