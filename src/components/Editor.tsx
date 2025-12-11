import React, { useState, useEffect } from 'react';
import { Sparkles, Layout, Type, Image as ImageIcon, Download, Palette, FileImage, FileCode, Network, BarChart3, PieChart as PieChartIcon, GitMerge, Trash2, Share2, Link as LinkIcon, Check } from 'lucide-react';
import { Parser } from '../engine/Parser';
import { Visualizer } from './Visualizer';
import { Exporter } from '../engine/Exporter';
import type { DiagramData } from '../engine/types';

export const Editor = () => {
    const [text, setText] = useState("Mindmap:\nRoot Idea\n  Branch 1\n    Detail A\n    Detail B\n  Branch 2\n    Detail C");
    const [viewMode, setViewMode] = useState<'split' | 'canvas'>('split');
    const [diagramData, setDiagramData] = useState<DiagramData | null>(null);
    const [variant, setVariant] = useState<'corporate' | 'hand-drawn' | 'neon'>('corporate');
    const [config, setConfig] = useState<any>({
        title: 'Untitled Project',
        textColor: '',
        accentColor: '',
        backgroundColor: '', // transparent default
        fontFamily: 'sans',
        theme: 'light' 
    });
    const [showSettings, setShowSettings] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [hasCopied, setHasCopied] = useState(false);

    // 1. Load from URL or LocalStorage on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const encoded = params.get('project');
        
        if (encoded) {
            try {
                const decoded = JSON.parse(decodeURIComponent(atob(encoded)));
                setText(decoded.text || "");
                setVariant(decoded.variant || 'corporate');
                if(decoded.config) setConfig(decoded.config);
                // Clean URL
                window.history.replaceState({}, '', window.location.pathname);
            } catch (e) {
                console.error("Failed to load project from URL", e);
            }
        } else {
            const saved = localStorage.getItem('kinetix-project');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setText(parsed.text);
                    setVariant(parsed.variant);
                    if(parsed.config) setConfig(parsed.config);
                } catch(e) {}
            }
        }
    }, []);

    // 2. Save to LocalStorage & SEO Update
    // 2. Parse Diagram when text changes
    useEffect(() => {
        handleGenerate();
    }, [text]);

    // 3. Save to LocalStorage & SEO Update
    useEffect(() => {
        localStorage.setItem('kinetix-project', JSON.stringify({ text, variant, config }));
        
        // SEO: Update Title based on Config Title
        document.title = `${config.title || "Untitled"} | Kinetix`;

    }, [text, variant, config]);

    const handleGenerate = () => {
        const data = Parser.parse(text);
        setDiagramData(data);
    };

    const handleExport = async (format: 'png' | 'svg') => {
        await Exporter.exportImage('kinetix-canvas', format, config.backgroundColor || undefined);
        setShowExportMenu(false);
    };

    const handleClear = () => {
        if(confirm('Are you sure you want to clear the project?')) {
            const defaultText = "Mindmap:\nNew Idea";
            setText(defaultText);
            setVariant('corporate');
            setConfig({ ...config, title: 'Untitled Project' });
            localStorage.removeItem('kinetix-project');
        }
    };

    const handleShare = () => {
        const payload = JSON.stringify({ text, variant, config });
        const encoded = btoa(encodeURIComponent(payload));
        const url = `${window.location.origin}${window.location.pathname}?project=${encoded}`;
        
        navigator.clipboard.writeText(url).then(() => {
            setHasCopied(true);
            setTimeout(() => setHasCopied(false), 2000);
        });
    };

    const applyTemplate = (type: 'mindmap' | 'bar' | 'pie' | 'process') => {
        let template = "";
        switch(type) {
            case 'mindmap':
                template = "Mindmap:\nCentral Idea\n  Main 1\n    Sub A\n    Sub B\n  Main 2\n    Sub C";
                break;
            case 'bar':
                template = "Bar: Quarterly Revenue\nQ1, 45\nQ2, 80\nQ3, 65\nQ4, 90";
                break;
            case 'pie':
                template = "Pie: User Segments\nMobile, 55\nDesktop, 35\nTablet, 10";
                break;
            case 'process':
                template = "Process:\n1. Start\n2. Analysis\n3. Design\n4. Implementation";
                break;
        }
        setText(template);
    };

class ErrorBoundary extends React.Component<any, { hasError: boolean, error: Error | null }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Editor Error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 text-red-500 bg-red-50 border border-red-200 rounded-lg m-4">
                    <h2 className="font-bold text-lg mb-2">Editor Crashed</h2>
                    <pre className="text-sm overflow-auto max-h-[300px]">{this.state.error?.toString()}</pre>
                    <pre className="text-xs text-slate-500 mt-2">{this.state.error?.stack}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

    return (
        <ErrorBoundary>
        <div className="flex h-full">
            {/* Left Pane: Text Editor */}
            <div className={`flex flex-col border-r border-slate-200 transition-all duration-300 ${viewMode === 'split' ? 'w-[360px]' : 'w-0 opacity-0 overflow-hidden'}`}>
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                    {/* Project Name Input */}
                    <input 
                        value={config.title} 
                        onChange={(e) => setConfig({...config, title: e.target.value})}
                        className="text-xs font-semibold text-slate-600 uppercase tracking-wider bg-transparent hover:bg-slate-50 focus:bg-slate-50 border-transparent border focus:border-slate-200 rounded px-1 -ml-1 w-full max-w-[150px] outline-none transition-colors"
                        placeholder="UNTITLED PROJECT"
                    />
                    <div className="flex items-center gap-2">
                         <button 
                            onClick={handleClear}
                            className="p-1 hover:bg-red-50 hover:text-red-500 rounded text-slate-400 transition-colors"
                            title="Clear Project"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
                
                {/* Text Area Container */}
                <div className="flex-1 relative bg-white">
                    <textarea 
                        className="w-full h-full p-6 resize-none focus:outline-none text-slate-700 leading-relaxed font-mono text-sm"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type your outline here..."
                    />
                    
                    {/* Floating Generate Action - Positioned above tabs */}
                    <div className="absolute bottom-6 right-6">
                        <button 
                            onClick={handleGenerate}
                            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg shadow-slate-900/20 hover:scale-105 transition-transform font-bold text-xs uppercase tracking-wide"
                        >
                            <Sparkles size={14} />
                            Generate
                        </button>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="bg-slate-50 border-t border-slate-200 p-2 flex flex-col gap-3">
                    
                    {/* Templates */}
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">Templates</div>
                        <div className="grid grid-cols-4 gap-1">
                            <button onClick={() => applyTemplate('mindmap')} className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-colors text-[10px] font-medium text-slate-600 gap-1">
                                <Network size={16} />
                                <span>Mind</span>
                            </button>
                            <button onClick={() => applyTemplate('bar')} className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-colors text-[10px] font-medium text-slate-600 gap-1">
                                <BarChart3 size={16} />
                                <span>Bar</span>
                            </button>
                            <button onClick={() => applyTemplate('pie')} className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-colors text-[10px] font-medium text-slate-600 gap-1">
                                <PieChartIcon size={16} />
                                <span>Pie</span>
                            </button>
                            <button onClick={() => applyTemplate('process')} className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-colors text-[10px] font-medium text-slate-600 gap-1">
                                <GitMerge size={16} />
                                <span>Flow</span>
                            </button>
                        </div>
                    </div>

                    {/* Styles */}
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">Style</div>
                        <div className="flex p-1 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <button 
                            onClick={() => setVariant('corporate')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-all ${
                                variant === 'corporate' 
                                ? 'bg-slate-100 text-slate-900 shadow-inner' 
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <Layout size={14} />
                            Clean
                        </button>
                        <button 
                            onClick={() => setVariant('hand-drawn')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-all ${
                                variant === 'hand-drawn' 
                                ? 'bg-slate-100 text-slate-900 shadow-inner' 
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <FileImage size={14} />
                            Sketch
                        </button>
                         <button 
                            onClick={() => setVariant('neon')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-all ${
                                variant === 'neon' 
                                ? 'bg-slate-100 text-slate-900 shadow-inner' 
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <Palette size={14} />
                            Neon
                        </button>
                    </div>
                </div>
            </div>
            </div>

            {/* Right Pane: Canvas */}
            <div className={`flex-1 relative flex flex-col transition-colors duration-300 ${variant === 'neon' ? 'bg-slate-950' : 'bg-slate-50'}`}>
                {/* Canvas Toolkit */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 gap-2">
                    <div className="bg-white/90 backdrop-blur rounded-full shadow-sm border border-slate-200 p-1 flex items-center gap-1 text-slate-600">
                        {/* Style Switcher */}
                        <div className="flex items-center bg-slate-100 rounded-full p-1">
                            <button 
                                onClick={() => setVariant('corporate')}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${variant === 'corporate' ? 'bg-white shadow-sm text-slate-900' : 'hover:text-slate-900'}`}
                            >
                                Clean
                            </button>
                            <button 
                                onClick={() => setVariant('hand-drawn')}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${variant === 'hand-drawn' ? 'bg-white shadow-sm text-slate-900' : 'hover:text-slate-900'}`}
                            >
                                Sketch
                            </button>
                            <button 
                                onClick={() => setVariant('neon')}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${variant === 'neon' ? 'bg-white shadow-sm text-slate-900' : 'hover:text-slate-900'}`}
                            >
                                Neon
                            </button>
                        </div>

                        <div className="w-px h-4 bg-slate-200 mx-1"></div>

                        {/* Formatting Toggle */}
                        <button 
                            onClick={() => setShowSettings(!showSettings)}
                            className={`p-2 hover:bg-slate-50 rounded-full transition-colors ${showSettings ? 'bg-slate-100 text-blue-600' : 'text-slate-600'}`}
                            title="Customize"
                        >
                            <Palette size={18} />
                        </button>

                        <div className="w-px h-4 bg-slate-200 mx-1"></div>

                        <div className="flex items-center gap-1">
                            {/* Share Button */}
                            <button 
                                onClick={handleShare}
                                className={`p-2 hover:bg-slate-50 rounded-full transition-colors ${hasCopied ? 'text-green-500 bg-green-50' : 'text-slate-600'}`} 
                                title="Copy Link"
                            >
                                {hasCopied ? <Check size={18} /> : <Share2 size={18} />}
                            </button>
                            
                            <div className="w-px h-4 bg-slate-200 mx-1"></div>

                            <button 
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className={`p-2 hover:bg-slate-50 rounded-full transition-colors ${showExportMenu ? 'bg-slate-100 text-blue-600' : ''}`} 
                                title="Export"
                            >
                                <Download size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Settings Panel */}
                    {showSettings && (
                        <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-4 w-[280px] animate-in fade-in slide-in-from-top-4">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Customization</div>
                            
                            {/* Color Pickers */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-600">Background</span>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => setConfig({...config, backgroundColor: ''})} 
                                            className={`w-4 h-4 rounded border ${!config.backgroundColor ? 'border-blue-500 ring-1 ring-blue-200' : 'border-slate-200'}`}
                                            title="Transparent"
                                        >
                                            <div className="w-full h-full relative overflow-hidden">
                                                <div className="absolute inset-0 bg-white"></div>
                                                <div className="absolute inset-0 border-r border-slate-300 rotate-45 transform scale-150 origin-center bg-red-500 w-px"></div>
                                            </div>
                                        </button>
                                        <input 
                                            type="color" 
                                            value={config.backgroundColor || '#ffffff'}
                                            onChange={(e) => setConfig({...config, backgroundColor: e.target.value})}
                                            className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-600">Accent Color</span>
                                     <div className="flex items-center gap-2">
                                         <button onClick={() => setConfig({...config, accentColor: ''})} className="text-[10px] text-slate-400 hover:text-slate-600">Reset</button>
                                         <input 
                                            type="color" 
                                            value={config.accentColor || '#3b82f6'}
                                            onChange={(e) => setConfig({...config, accentColor: e.target.value})}
                                            className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                                        />
                                     </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-600">Text Color</span>
                                     <div className="flex items-center gap-2">
                                         <button onClick={() => setConfig({...config, textColor: ''})} className="text-[10px] text-slate-400 hover:text-slate-600">Reset</button>
                                         <input 
                                            type="color" 
                                            value={config.textColor || '#000000'}
                                            onChange={(e) => setConfig({...config, textColor: e.target.value})}
                                            className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                                        />
                                     </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Export Menu */}
                    {showExportMenu && (
                        <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg border border-slate-100 p-2 min-w-[140px] flex flex-col gap-1 animate-in fade-in slide-in-from-top-2">
                            <button onClick={() => handleExport('png')} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg text-sm text-slate-700 text-left">
                                <FileImage size={14} className="text-blue-500"/>
                                <span>Export PNG {config.backgroundColor ? '(BG)' : ''}</span>
                            </button>
                            <button onClick={() => handleExport('svg')} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg text-sm text-slate-700 text-left">
                                <FileCode size={14} className="text-purple-500"/>
                                <span>Export SVG {config.backgroundColor ? '(BG)' : ''}</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Canvas Area */}
                <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
                    <div 
                        id="kinetix-canvas"
                        style={{ backgroundColor: config.backgroundColor || undefined }}
                        className={`rounded-xl shadow-sm border w-full max-w-5xl aspect-video p-12 flex items-center justify-center relative overflow-hidden transition-colors duration-500
                        ${!config.backgroundColor && (variant === 'neon' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}
                    `}>
                        
                        {diagramData ? (
                            <Visualizer data={diagramData} variant={variant} config={config} />
                        ) : (
                            <div className="text-slate-300 text-sm">Start typing to generate...</div>
                        )}
                        
                        {/* Watermark/Branding */}
                        <div className="absolute bottom-4 right-4 text-xs text-slate-300 font-medium select-none exclude-from-export">
                            Kinetix
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </ErrorBoundary>
    );
};
