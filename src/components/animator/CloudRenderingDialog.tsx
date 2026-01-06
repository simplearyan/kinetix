import React, { useState } from 'react';
import { useAnimatorStore } from '../../store/animatorStore';

const CloudRenderingDialog: React.FC = () => {
    const {
        isCloudRenderOpen,
        setIsCloudRenderOpen,
        activeCompositionId,
        barChartData,
        currentCode,
        currentLatex
    } = useAnimatorStore();

    const [copied, setCopied] = useState(false);

    if (!isCloudRenderOpen) return null;

    // Construct the input props that would be needed for the render
    const inputProps = (() => {
        switch (activeCompositionId) {
            case 'BarChartRace': return { data: barChartData };
            case 'CodeBlock': return { code: currentCode };
            case 'MathFormula': return { latex: currentLatex };
            default: return {};
        }
    })();

    // Serialize props to a string safely for CLI
    const propsString = JSON.stringify(inputProps).replace(/'/g, "'\\''");

    const workflowYaml = `name: Render ${activeCompositionId} Video
on:
  workflow_dispatch:

jobs:
  render:
    name: Render Video
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install Dependencies
        run: npm ci

      - name: Render Video
        run: npx remotion render src/index.ts ${activeCompositionId} out-${activeCompositionId}.mp4 --props='${propsString}'

      - name: Upload Artifact
        uses: actions/upload-artifact@v3
        with:
          name: rendered-video
          path: out-${activeCompositionId}.mp4
`;

    const handleCopy = () => {
        navigator.clipboard.writeText(workflowYaml);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-[#0F172A] border border-slate-700 rounded-xl p-0 shadow-2xl relative flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-[#1E293B] rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">GitHub Actions Workflow</h2>
                        <p className="text-slate-400 text-sm">Render this video for free using GitHub Actions.</p>
                    </div>
                    <button
                        onClick={() => setIsCloudRenderOpen(false)}
                        className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-[#0F172A]">
                    <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 font-mono text-xs text-sky-300 overflow-x-auto whitespace-pre">
                        {workflowYaml}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700/50 bg-[#1E293B] flex justify-between items-center rounded-b-xl">
                    <div className="text-xs text-slate-500">
                        Copy this YAML to <span className="font-mono text-slate-300">.github/workflows/render.yml</span> in your repo.
                    </div>
                    <button
                        onClick={handleCopy}
                        className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${copied
                                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                            }`}
                    >
                        {copied ? (
                            <>
                                <span>✓</span> Copied
                            </>
                        ) : (
                            <>
                                <span>📋</span> Copy YAML
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CloudRenderingDialog;
