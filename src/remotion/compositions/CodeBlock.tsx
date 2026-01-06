import React, { useEffect, useState } from 'react';
import { continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { createHighlighter, type Highlighter } from 'shiki';

interface CodeBlockProps {
    code?: string; // Make optional for safety
    language?: string;
    theme?: string;
}

const handle = delayRender("Loading Shiki");

export const CodeBlock: React.FC<CodeBlockProps> = ({ code = '', language = 'javascript', theme = 'dracula' }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Shiki State
    const [highlighter, setHighlighter] = useState<Highlighter | null>(null);
    const [html, setHtml] = useState<string>('');

    // Load Shiki once
    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                const h = await createHighlighter({
                    themes: ['dracula', 'github-dark'],
                    langs: ['javascript', 'typescript', 'python', 'html', 'css'],
                });
                if (mounted) {
                    setHighlighter(h);
                    continueRender(handle);
                }
            } catch (e) {
                console.error("Shiki Load Error", e);
                if (mounted) continueRender(handle);
            }
        };

        load();

        return () => { mounted = false; };
    }, []);

    // Update Highlighted HTML when code/highlighter changes
    useEffect(() => {
        if (!highlighter || !code) return;

        try {
            const result = highlighter.codeToHtml(code, {
                lang: language,
                theme: theme === 'dracula' ? 'dracula' : 'github-dark'
            });
            setHtml(result);
        } catch (e) {
            console.warn("Highlight error", e);
            setHtml(`<pre>${code}</pre>`);
        }
    }, [highlighter, code, language, theme]);

    // Typewriter Logic
    // We want to reveal the code character by character.
    // Ideally we reveal TOKENS, but Shiki returns a full HTML string with spans.
    // Parsing that is hard for a simple Typewriter.
    // Simple MVP approach: Mask the container with a width/height or use a customized renderer.
    // Or: Render the FULL code, but mask it with CSS based on frame.
    // Or: `code.slice(0, progress)` and re-highlight? 
    // Re-highlighting every frame is expensive (100ms+), will drop fps.

    // Better Approach for MVP:
    // Render the FULL HTML.
    // Use a CSS `clip-path` or `height` (if revealing lines) or `width` (if single line).
    // For multiline code, a "cursor" that moves is complex.

    // Let's implement "Line by Line" reveal, which is common and looks good.
    // We split the HTML by newlines? No, Shiki output is one block.

    // Alternative: Highlight the SUBSTRING `code.slice(0, n)`
    // IF Shiki is fast enough (on small snippets it might be).
    // Let's try the Substring approach. If it's slow, we optimize.

    // WAIT: `useEffect` above updates `html` when `code` changes.
    // If we want to animate `code`, we should calculate `visibleCode` based on frame.

    const durationPerChar = 2; // frames
    const charsToShow = Math.floor(frame / durationPerChar);
    const visibleCode = code.slice(0, charsToShow);

    // We need a separate effect to highlight `visibleCode` specifically?
    // If we rely on the `useEffect` above, it runs only when `code` prop changes.
    // But here `visibleCode` IS derived from `code` + `frame`.
    // So we should just highlight `visibleCode` directly in render? 
    // NO, `codeToHtml` is synchronous once highlighter is loaded. We can do it in render!

    if (!highlighter) return <div className="text-white p-10 font-mono">Loading Highlighter...</div>;

    let highlighted = "";
    try {
        highlighted = highlighter.codeToHtml(visibleCode, {
            lang: language,
            theme: theme === 'dracula' ? 'dracula' : 'github-dark'
        });
    } catch (e) {
        highlighted = `<pre>${visibleCode}</pre>`;
    }

    const cursorVisible = (frame % 20 < 10); // blink every 20 frames

    return (
        <div className="w-full h-full flex items-center justify-center bg-[#0F172A]">
            <div className="relative p-8 rounded-xl bg-[#282A36] shadow-2xl min-w-[600px] min-h-[400px] border border-slate-700/50">
                {/* Window Controls */}
                <div className="flex gap-2 mb-4 absolute top-4 left-4">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>

                <div className="mt-6 font-mono text-lg leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: highlighted }}
                />

                {/* Cursor (positioned via CSS? hard to place exactly at end of text flow without specific structure) */}
                {/* Simplification: Just append a block cursor if we could. 
                     Or we render the cursor *inside* the HTML? Shiki returns a <pre><code>...
                     It's tricky to inject.
                     We will omit the cursor for now to avoid layout shift issues, or add it with CSS if possible.
                 */}
            </div>

            <div className="absolute bottom-10 text-slate-500 text-sm font-mono">
                {language.toUpperCase()} • {charsToShow < code.length ? 'TYPING...' : 'DONE'}
            </div>
        </div>
    );
};
