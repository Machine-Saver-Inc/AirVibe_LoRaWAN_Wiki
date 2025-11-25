
import React, { useState } from 'react';
import { Search, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { searchWiki } from '../services/geminiService';
import { SectionType, WikiPage } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface AISearchProps {
  activeData: WikiPage[];
  onNavigate: (section: SectionType, id: string) => void;
}

const AISearch: React.FC<AISearchProps> = ({ activeData, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [linkId, setLinkId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setAnswer(null);
    setLinkId(null);
    
    // Pass the currently active data version to the search
    const result = await searchWiki(query, activeData);
    
    setAnswer(result.answer);
    setLinkId(result.relevantSectionId || null);
    setLoading(false);
  };

  const handleLinkClick = (id: string) => {
    // Find which page/section this ID belongs to
    const page = activeData.find(p => p.id === id);
    if (page) {
      onNavigate(page.section, id);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="relative group z-10">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <form onSubmit={handleSearch} className="relative flex items-center bg-white rounded-lg shadow-xl ring-1 ring-slate-900/5">
          <div className="pl-4 text-slate-400">
            {loading ? <Loader2 className="h-6 w-6 animate-spin text-blue-500" /> : <Sparkles className="h-6 w-6 text-blue-500" />}
          </div>
          <input
            type="text"
            className="w-full p-4 bg-transparent border-0 focus:ring-0 text-slate-900 placeholder:text-slate-400 focus:outline-none"
            placeholder="Ask AI about the protocol (e.g., 'How does the OTA upgrade work?', 'What is packet type 4?')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="mr-2 px-6 py-2 bg-slate-900 text-white font-medium rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 transition-all"
          >
            Search
          </button>
        </form>
      </div>

      {answer && (
        <div className="mt-4 p-6 bg-white border border-blue-100 rounded-lg shadow-sm ring-1 ring-blue-50 relative animate-fade-in">
           <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> AI Answer
           </h4>
           <div className="prose prose-slate text-slate-700 leading-relaxed whitespace-pre-line">
             <MarkdownRenderer text={answer} />
           </div>
           {linkId && (
             <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
               <button 
                 onClick={() => handleLinkClick(linkId)}
                 className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
               >
                 Go to relevant section <ArrowRight className="w-4 h-4" />
               </button>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default AISearch;
