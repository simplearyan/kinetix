import React from 'react';
import { useAnimatorStore, type AnimatorTab } from '../../store/animatorStore';
import { LayoutGrid, Calculator, Code2, Palette, Activity } from 'lucide-react';
import DataEditor from './editors/DataEditor';
import MathEditor from './editors/MathEditor';
import CodeEditor from './editors/CodeEditor';

const PropertyPanel: React.FC = () => {
    const { activeTab, setActiveTab } = useAnimatorStore();

    const tabs: { id: AnimatorTab; label: string; icon: React.ElementType }[] = [
        { id: 'data', label: 'Data', icon: LayoutGrid },
        { id: 'math', label: 'Math', icon: Calculator },
        { id: 'code', label: 'Code', icon: Code2 },
        { id: 'style', label: 'Style', icon: Palette },
        { id: 'motion', label: 'Motion', icon: Activity },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'data':
                return <DataEditor />;
            case 'math':
                return <MathEditor />;
            case 'code':
                return <CodeEditor />;
            case 'style':
                return <div className="p-4 text-slate-400">Global Styles Placeholder</div>;
            case 'motion':
                return <div className="p-4 text-slate-400">Animation Presets Placeholder</div>;
            default:
                return <div className="p-4 text-slate-400">Select a tab to begin.</div>;
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0F172A]">
            {/* Mobile Tab Bar (Sticky Header for Panel) */}
            <div className="flex items-center overflow-x-auto border-b border-slate-700/50 no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors
                            ${activeTab === tab.id
                                ? 'text-sky-400 border-b-2 border-sky-400 bg-slate-800/20'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/10'}
                        `}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default PropertyPanel;
