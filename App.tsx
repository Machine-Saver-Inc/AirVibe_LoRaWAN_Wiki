
import React, { useState, useEffect } from 'react';
import { Menu, X, Book, Database, Activity, Settings, Cpu, Radio, Code, MessageSquare, Rocket } from 'lucide-react';
import { wikiData } from './data/sections';
import PacketTable from './components/PacketTable';
import MermaidDiagram from './components/MermaidDiagram';
import AISearch from './components/AISearch';
import MarkdownRenderer from './components/MarkdownRenderer';
import UplinkDecoder from './components/UplinkDecoder';
import AlarmBitmaskCalculator from './components/AlarmBitmaskCalculator';
import WaveformTracker from './components/WaveformTracker';
import FuotaHelper from './components/FuotaHelper';
import ErrorBoundary from './components/ErrorBoundary';
import { SectionType, WikiPage } from './types';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionType>(SectionType.OVERVIEW);
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);

  const activeData = wikiData;

  // Handle scrolling after section change
  useEffect(() => {
    if (pendingScrollId) {
      // Small timeout to allow the DOM to update with the new section content
      const timer = setTimeout(() => {
        const element = document.getElementById(pendingScrollId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Add highlight effect
          element.classList.add('bg-blue-50', 'transition-colors', 'duration-500');
          setTimeout(() => element.classList.remove('bg-blue-50'), 2000);
        }
        setPendingScrollId(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeSection, pendingScrollId]);

  const handleNavigate = (section: SectionType, id: string) => {
    setActiveSection(section);
    setPendingScrollId(id);
  };

  // Define strict section order
  const sections = [
    SectionType.OVERVIEW,
    SectionType.QUICKSTART,
    SectionType.CONFIG_MODES,
    SectionType.DECODER,
    SectionType.DOWNLINKS,
    SectionType.UPLINKS,
    SectionType.ALARMS,
    SectionType.TIME_WAVEFORM,
    SectionType.FUOTA,
  ];

  // Group pages by section based on ACTIVE version data
  const pagesBySection = activeData.reduce((acc, page) => {
    if (!acc[page.section]) acc[page.section] = [];
    acc[page.section].push(page);
    return acc;
  }, {} as Record<SectionType, WikiPage[]>);

  const getIconForSection = (section: SectionType) => {
    switch (section) {
      case SectionType.OVERVIEW: return <Book className="w-5 h-5" />;
      case SectionType.QUICKSTART: return <Rocket className="w-5 h-5" />;
      case SectionType.UPLINKS: return <Radio className="w-5 h-5" />;
      case SectionType.DOWNLINKS: return <Database className="w-5 h-5" />;
      case SectionType.FUOTA: return <Cpu className="w-5 h-5" />;
      case SectionType.CONFIG_MODES: return <Settings className="w-5 h-5" />;
      case SectionType.ALARMS: return <AlertIcon />;
      case SectionType.TIME_WAVEFORM: return <Activity className="w-5 h-5" />;
      case SectionType.DECODER: return <Code className="w-5 h-5" />;
      default: return <Book className="w-5 h-5" />;
    }
  };

  const AlertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  );

  return (
    <div className="h-screen bg-slate-50 flex font-sans text-slate-900 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed top-0 left-0 z-30 h-screen w-72 bg-slate-900 text-slate-300 transition-transform duration-300 lg:static lg:translate-x-0 flex flex-col flex-shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
               <h1 className="text-xl font-bold text-white tracking-tight">AirVibe Wiki</h1>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-semibold">LoRaWAN Condition Monitoring Sensor</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>


        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => { setActiveSection(section); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeSection === section 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              {getIconForSection(section)}
              {section}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-800 space-y-3">
          <a 
            href="https://github.com/Machine-Saver-Inc/AirVibe_LoRaWAN_Wiki/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded border border-slate-700 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Feedback
          </a>
          <div className="text-xs text-slate-500 text-center">
            &copy; 2026 Machine Saver, Inc.
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex items-center gap-4 justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-900">
              <Menu className="w-6 h-6" />
            </button>
            <div>
               <h2 className="text-xl font-semibold text-slate-800">{activeSection}</h2>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 scroll-smooth">
          <ErrorBoundary>

          {activeSection !== SectionType.DECODER && (
            <AISearch
              activeData={activeData}
              onNavigate={handleNavigate}
            />
          )}

          {activeSection === SectionType.DECODER ? (
            <UplinkDecoder />
          ) : (
            <div className="max-w-5xl mx-auto space-y-16 pb-20">
              {pagesBySection[activeSection]?.map((page) => (
                <section key={page.id} id={page.id} className="scroll-mt-24 group">
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {page.title}
                    </h3>
                    <div className="h-px bg-slate-200 flex-1"></div>
                  </div>

                  <div className="mb-8 leading-relaxed whitespace-pre-line text-slate-600">
                    <MarkdownRenderer text={page.content} />
                  </div>

                  {page.id === 'alarm-logic' && <AlarmBitmaskCalculator />}
                  {page.id === 'process-twf' && <WaveformTracker />}
                  {page.id === 'process-ota' && <FuotaHelper />}

                  {page.mermaidDiagram && (
                    <div className="my-8 group/diagram">
                      <div className="flex items-center gap-4 mb-6">
                        <h4 className="text-2xl font-bold text-slate-900 group-hover/diagram:text-blue-600 transition-colors">Process Diagram</h4>
                        <div className="h-px bg-slate-200 flex-1"></div>
                      </div>
                      <MermaidDiagram chart={page.mermaidDiagram} />
                    </div>
                  )}

                  {page.packetTable && (
                    <PacketTable
                      packetType={page.packetTable.packetType}
                      port={page.packetTable.port}
                      fields={page.packetTable.fields}
                    />
                  )}

                  {page.extraTable && (
                    <div className="rounded-lg border border-slate-200 shadow-sm mt-4">
                      <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
                          <h4 className="font-semibold text-slate-700">{page.extraTable.title}</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50">
                            <tr>
                              {page.extraTable.headers.map((h, i) => (
                                <th key={i} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-200">
                            {page.extraTable.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className={`px-6 py-3 text-sm text-slate-700 ${cIdx === 0 ? 'font-medium' : ''}`}>
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </section>
              ))}

              {(!pagesBySection[activeSection] || pagesBySection[activeSection].length === 0) && (
                <div className="text-center py-20 text-slate-400">
                  <p>No content available for this section.</p>
                </div>
              )}
            </div>
          )}

          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

export default App;
