import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';


import { useAnimatorStore } from '../../../store/animatorStore';

const DataEditor: React.FC = () => {
    const { barChartData, setBarChartData } = useAnimatorStore();

    const handleAdd = () => {
        // Add a new mock frame
        const lastYear = barChartData[barChartData.length - 1]?.year || 2000;
        setBarChartData([...barChartData, {
            year: lastYear + 1,
            data: [
                { id: 'new', label: 'New Item', value: 100, color: '#FFFFFF' }
            ]
        }]);
    };

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-300">Data Source</h3>
                <div className="flex gap-2">
                    <button className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-1 rounded transition-colors" onClick={handleAdd}>
                        + Add Year
                    </button>
                    <button className="text-xs bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 px-2 py-1 rounded transition-colors">
                        Import CSV
                    </button>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid gap-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                {barChartData.map((item) => (
                    <div key={item.year} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3 group hover:border-sky-500/30 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono text-slate-500">{item.year}</span>
                            <button className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity">
                                ✕
                            </button>
                        </div>
                        <div className="space-y-2">
                            {item.data.slice(0, 3).map((val, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: val.color }} />
                                    <span className="text-sm text-slate-300 flex-1 truncate">{val.label}</span>
                                    <span className="text-xs font-mono text-slate-500">{Math.round(val.value)}</span>
                                </div>
                            ))}
                            {item.data.length > 3 && (
                                <div className="text-xs text-slate-600 italic">
                                    + {item.data.length - 3} more items
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DataEditor;


