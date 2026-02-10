import React from 'react';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { DecoderExample } from '../data/decoderExamples';
import { EncoderExample } from '../data/encoderExamples';

interface ExamplesSidebarProps {
  activeTab: 'decode' | 'encode';
  examples: (DecoderExample | EncoderExample)[];
  selectedId: string;
  onSelect: (id: string) => void;
  onRemove: (e: React.MouseEvent, id: string) => void;
  onAdd: () => void;
  showExamples: boolean;
  onToggleExamples: () => void;
}

export default function ExamplesSidebar({
  activeTab,
  examples,
  selectedId,
  onSelect,
  onRemove,
  onAdd,
  showExamples,
  onToggleExamples,
}: ExamplesSidebarProps) {
  return (
    <div className="w-full lg:w-1/3 border-t lg:border-t-0 lg:border-r border-slate-200 flex flex-col bg-slate-50 lg:min-h-auto">
      <div
        className="p-4 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10 cursor-pointer lg:cursor-default"
        onClick={onToggleExamples}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-800">Examples</h3>
          <span className="lg:hidden text-slate-400">
            {showExamples ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onAdd(); onToggleExamples(); }}
          className={`flex items-center gap-1 text-xs font-medium text-white px-2 py-1.5 rounded transition-colors ${activeTab === 'decode' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-purple-600 hover:bg-purple-700'}`}
        >
          <Plus className="w-3 h-3" /> ADD
        </button>
      </div>
      <div className={`flex-1 overflow-y-auto p-2 space-y-2 ${showExamples ? '' : 'hidden lg:block'}`}>
        {examples.map((ex: DecoderExample | EncoderExample) => (
          <div
            key={ex.id}
            onClick={() => onSelect(ex.id)}
            className={`group relative p-3 rounded-md cursor-pointer border transition-all ${
              selectedId === ex.id
                ? activeTab === 'decode' ? 'bg-teal-50 border-teal-200 shadow-sm' : 'bg-purple-50 border-purple-200 shadow-sm'
                : 'bg-white border-slate-200 hover:bg-white'
            } ${activeTab === 'decode' ? 'hover:border-teal-200' : 'hover:border-purple-200'}`}
          >
            <div className="flex justify-between items-start pr-6">
              <span className={`font-medium text-sm truncate ${
                  selectedId === ex.id
                  ? activeTab === 'decode' ? 'text-teal-900' : 'text-purple-900'
                  : 'text-slate-700'
              }`}>
                {ex.name}
              </span>
              {ex.fPort !== undefined && (
                 <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                   {ex.fPort}
                 </span>
              )}
               {ex.json?.fPort !== undefined && (
                 <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                   {ex.json.fPort}
                 </span>
              )}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1 truncate">
               {activeTab === 'decode' ? (ex.raw || "Empty payload") : "JSON Payload"}
            </div>

            <button
              onClick={(e) => onRemove(e, ex.id)}
              className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>

            {selectedId === ex.id && (
              <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-md ${activeTab === 'decode' ? 'bg-teal-500' : 'bg-purple-500'}`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
