import type { DiagramData, Node, Edge, DiagramType } from './types';

export class Parser {

    static parse(text: string): DiagramData {
        const lines = text.split('\n').filter(l => l.trim().length > 0);

        // 1. Detect Type
        const type = this.detectType(text, lines);

        // 2. Parse Nodes based on type
        let nodes: Node[] = [];
        let edges: Edge[] = [];

        if (type === 'mindmap') {
            const result = this.parseMindmap(text.split('\n')); // Pass raw lines to preserve indentation
            nodes = result.nodes;
            edges = result.edges;
        } else if (type === 'process' || type === 'cycle') {
            const cleanLines = lines.map(l => l.trim());
            const result = this.parseProcess(cleanLines);
            nodes = result.nodes;
            edges = result.edges;

            if (type === 'cycle' && nodes.length > 1) {
                edges.push({ from: nodes[nodes.length - 1].id, to: nodes[0].id });
            }
        } else if (type === 'bar' || type === 'pie' || type === 'line' || type === 'funnel') {
            const result = this.parseBarChart(lines);
            nodes = result.nodes;
            edges = [];
        } else if (type === 'venn') {
            const result = this.parseVennDiagram(lines);
            nodes = result.nodes;
            edges = [];
        } else if (type === 'math') {
            // Treat lines as matrix rows or equations
            // Simple parser for 1 row = 1 math block
            nodes = lines.map((line, i) => ({
                id: `math-${i}`,
                label: line.trim(),
                color: 'slate'
            }));
        } else {
            // Default to list
            nodes = lines.map((line, i) => ({
                id: `node-${i}`,
                label: line.replace(/^[-*•\d\.]+\s/, '').trim(),
                color: 'blue'
            }));
        }

        return {
            type,
            nodes,
            edges
        };
    }

    private static detectType(text: string, lines: string[]): DiagramType {
        const lower = text.toLowerCase();

        // Explicit Overrides
        if (lower.startsWith('mindmap:')) return 'mindmap';
        if (lower.startsWith('math:')) return 'math';
        if (lower.startsWith('line:')) return 'line';
        if (lower.startsWith('funnel:')) return 'funnel';
        if (lower.startsWith('venn:')) return 'venn';

        // Content detection
        if (lower.includes('loop') || lower.includes('cycle') || lower.includes('repeat')) return 'cycle';

        // Check for indentation (Mindmap) - at least one line has indentation
        const hasIndentation = text.split('\n').some(l => l.startsWith('  ') || l.startsWith('\t'));
        // And is longer than a simple list
        if (hasIndentation && lines.length > 2) return 'mindmap';

        // Check for Math/Matrix signatures
        if (text.includes('[') && text.includes(']')) return 'math';

        // Process/Sequence
        const hasNumbers = lines.some(l => /^\d+\./.test(l.trim()));
        const hasSequencers = lower.includes('step') || lower.includes('then') || lower.includes('->');

        if (hasNumbers || hasSequencers) return 'process';

        // Check for Chart Data (Label, Value)
        const hasChartData = text.split('\n').some(l => /^[^:,]+[:,\t]\s*\d+(\.\d+)?$/.test(l.trim()));

        if (lower.startsWith('pie:')) return 'pie';
        if (lower.startsWith('chart:') || lower.startsWith('bar:') || hasChartData) return 'bar';

        return 'list';
    }

    private static parseMindmap(rawLines: string[]): { nodes: Node[], edges: Edge[] } {
        const nodes: Node[] = [];
        const edges: Edge[] = [];
        const stack: { level: number, id: string }[] = [];
        let counter = 0;

        rawLines.forEach((line) => {
            if (!line.trim()) return;

            // Calculate indentation level (2 spaces = 1 level)
            const spaces = line.search(/\S|$/);
            const level = Math.floor(spaces / 2);

            const label = line.trim().replace(/^[-*•]\s/, '');
            // Skip title line if present in mindmap specifically? No, usually fine.
            if (line.toLowerCase().startsWith('mindmap:')) return;

            const id = `node-${counter++}`;

            const node: Node = { id, label, level, parentId: undefined };
            nodes.push(node);

            // Find parent
            // Pop stack until we find a node with simpler level (level - 1)
            // Or simpler: The parent is the last item in stack with level < current level
            while (stack.length > 0 && stack[stack.length - 1].level >= level) {
                stack.pop();
            }

            if (stack.length > 0) {
                const parent = stack[stack.length - 1];
                node.parentId = parent.id;
                edges.push({ from: parent.id, to: id });
            }

            stack.push({ level, id });
        });

        // Heuristic: If only 1 root, it's fine. If multiple roots were detected,
        // we might want to group them or just visually separate them.

        return { nodes, edges };
    }

    private static parseProcess(lines: string[]): { nodes: Node[], edges: Edge[] } {
        const nodes: Node[] = [];
        const edges: Edge[] = [];

        lines.forEach((line, i) => {
            // Clean specific markers
            const label = line.replace(/^\d+\.|^step\s\d+:?|^[-*•]/i, '').trim();
            const id = `step-${i}`;

            if (label) {
                nodes.push({ id, label, color: 'blue' });
                if (i > 0) {
                    edges.push({ from: `step-${i - 1}`, to: id });
                }
            }
        });

        return { nodes, edges };
    }

    private static parseBarChart(lines: string[]): { nodes: Node[] } {
        const nodes: Node[] = [];

        lines.forEach((line, i) => {
            const clean = line.trim();
            if (!clean) return;

            if (clean.toLowerCase().match(/^(chart:|bar:|pie:|line:|funnel:)/)) return;

            // Parse "Label, Value" or "Label: Value"
            const match = clean.match(/^([^:,]+)(?:[:,\t])\s*(\d+(?:\.\d+)?)/);

            if (match) {
                nodes.push({
                    id: `bar-${i}`,
                    label: match[1].trim(),
                    value: parseFloat(match[2]),
                    color: 'blue'
                });
            } else {
                // Determine if just a label or ignore?
                // For now, treat as 0 value if we think it's part of chart
                // or just ignore non-matching lines to be safe
            }
        });

        return { nodes };
    }

    private static parseVennDiagram(lines: string[]): { nodes: Node[] } {
        const nodes: Node[] = [];
        // Venn expects specific lines: Set 1, Set 2, [Intersection]
        // or specifically labeled lines "A: ...", "B: ...", "A+B: ..."

        // Simple Parser: First two lines are the main sets. Third is intersection.
        let setCounter = 0;

        lines.forEach((line, i) => {
            const clean = line.trim();
            if (!clean || clean.toLowerCase().startsWith('venn:')) return;

            // Check if it denotes intersection explicitly
            const isIntersection = clean.toLowerCase().includes('intersection') || clean.includes('+') || clean.toLowerCase().includes('both');

            nodes.push({
                id: `venn-${i}`,
                label: clean,
                value: isIntersection ? 2 : 1, // 1 = Set, 2 = Intersection
                color: 'blue'
            });
        });

        return { nodes };
    }
}
