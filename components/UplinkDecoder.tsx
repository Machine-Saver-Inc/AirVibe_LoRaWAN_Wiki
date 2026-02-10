
import React, { useState, useEffect } from 'react';
import { Plus, X, Copy, Check, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { decoderExamples, DecoderExample } from '../data/decoderExamples';
import { encoderExamples, EncoderExample } from '../data/encoderExamples';
import { decodeUplink } from '../utils/airvibeDecoder';
import DownlinkEncoder from './DownlinkEncoder';
import { COPY_FEEDBACK_MS } from '../constants';


const UplinkDecoder: React.FC = () => {
  // Mode State
  const [activeTab, setActiveTab] = useState<'decode' | 'encode'>('decode');
  const [showExamples, setShowExamples] = useState(false);

  // Decoder State
  const [decExamples, setDecExamples] = useState<DecoderExample[]>(decoderExamples);
  const [selectedDecId, setSelectedDecId] = useState<string>(decoderExamples[0].id);
  const [decName, setDecName] = useState('');
  const [decRaw, setDecRaw] = useState('');
  const [decFPort, setDecFPort] = useState(8);
  const [decoded, setDecoded] = useState<string>('');
  const [decCopied, setDecCopied] = useState(false);

  // Encoder State
  const [encExamples, setEncExamples] = useState<EncoderExample[]>(encoderExamples);
  const [selectedEncId, setSelectedEncId] = useState<string>(encoderExamples[0].id);

  // --- Decoder Effects & Handlers ---
  useEffect(() => {
    const ex = decExamples.find(e => e.id === selectedDecId);
    if (ex) {
      setDecName(ex.name);
      setDecRaw(ex.raw);
      setDecFPort(ex.fPort);
      handleDecode(ex.raw, ex.fPort);
    }
  }, [selectedDecId]);

  const handleDecode = (hex: string, port: number) => {
    try {
      const result = decodeUplink(hex, port);
      setDecoded(JSON.stringify(result, null, 4));
    } catch (e: any) {
      setDecoded(`Error decoding: ${e.message}`);
    }
  };

  const onDecodeClick = () => {
    handleDecode(decRaw, decFPort);
  };

  const handleDecCopy = () => {
    navigator.clipboard.writeText(decoded);
    setDecCopied(true);
    setTimeout(() => setDecCopied(false), COPY_FEEDBACK_MS);
  };

  const handleRemoveDecExample = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newExamples = decExamples.filter(ex => ex.id !== id);
    setDecExamples(newExamples);
    if (selectedDecId === id && newExamples.length > 0) {
      setSelectedDecId(newExamples[0].id);
    }
  };

  const handleAddDecExample = () => {
    const newId = `custom_dec_${Date.now()}`;
    const newExample: DecoderExample = {
      id: newId,
      name: 'New Uplink',
      raw: '',
      fPort: 8
    };
    setDecExamples([newExample, ...decExamples]);
    setSelectedDecId(newId);
  };

  const downloadDriver = () => {
    const element = document.createElement("a");
    element.href = "assets/AirVibe_TS013_Codec_v2.1.2.js";
    element.download = "AirVibe_TS013_Codec_v2.1.2.js";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // --- Encoder Handlers ---
  const handleRemoveEncExample = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newExamples = encExamples.filter(ex => ex.id !== id);
    setEncExamples(newExamples);
    if (selectedEncId === id && newExamples.length > 0) {
      setSelectedEncId(newExamples[0].id);
    }
  };

  const handleAddEncExample = () => {
    const newId = `custom_enc_${Date.now()}`;
    const newExample: EncoderExample = {
      id: newId,
      name: 'New Downlink',
      json: { fPort: 30, data: {} }
    };
    setEncExamples([newExample, ...encExamples]);
    setSelectedEncId(newId);
  };

  const updateEncoderExampleName = (id: string, newName: string) => {
    setEncExamples(encExamples.map(e => e.id === id ? { ...e, name: newName } : e));
  };
  
  const updateEncoderExampleJson = (id: string, newJson: object) => {
    setEncExamples(encExamples.map(e => e.id === id ? { ...e, json: newJson } : e));
  };

  // --- Render Helpers ---
  const activeExamples = activeTab === 'decode' ? decExamples : encExamples;
  const activeSelectedId = activeTab === 'decode' ? selectedDecId : selectedEncId;
  const handleSelectId = (id: string) => activeTab === 'decode' ? setSelectedDecId(id) : setSelectedEncId(id);
  const handleRemove = activeTab === 'decode' ? handleRemoveDecExample : handleRemoveEncExample;
  const handleAdd = activeTab === 'decode' ? handleAddDecExample : handleAddEncExample;

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col lg:flex-row-reverse h-[calc(100vh-160px)]">

      {/* Right Content (Tool) - Appears first in DOM for mobile top position, but reversed on Desktop to be on Right */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-white z-10">

        {/* Sticky header with Tabs on mobile */}
        <div className="sticky top-0 bg-white z-20 px-6 pt-4 pb-0 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
              <div className="flex">
                  <button
                      onClick={() => setActiveTab('decode')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'decode'
                          ? 'text-teal-600 border-teal-600'
                          : 'text-slate-500 border-transparent hover:text-slate-700'
                      }`}
                  >
                      Decode Uplink
                  </button>
                  <button
                      onClick={() => setActiveTab('encode')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'encode'
                          ? 'text-purple-600 border-purple-600'
                          : 'text-slate-500 border-transparent hover:text-slate-700'
                      }`}
                  >
                      Encode Downlink
                  </button>
              </div>

              <button
                  onClick={downloadDriver}
                  className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors self-start sm:self-auto"
              >
                  <Download className="w-3.5 h-3.5" />
                  AirVibe_TS013_Codec_v2.1.2.js
              </button>
          </div>
        </div>

        <div className="p-6 flex-1">

        {activeTab === 'decode' ? (
           // --- DECODER VIEW ---
           <div className="space-y-6 max-w-2xl animate-fade-in pb-10">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Name<span className="text-teal-500">*</span></label>
                <input 
                  type="text" 
                  value={decName}
                  onChange={(e) => {
                     setDecName(e.target.value);
                     setDecExamples(decExamples.map(ex => ex.id === selectedDecId ? {...ex, name: e.target.value} : ex));
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Raw Uplink Message<span className="text-teal-500">*</span></label>
                <input 
                  type="text" 
                  value={decRaw}
                  onChange={(e) => {
                    setDecRaw(e.target.value);
                    setDecExamples(decExamples.map(ex => ex.id === selectedDecId ? {...ex, raw: e.target.value} : ex));
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none font-mono text-sm text-slate-700"
                />
              </div>

              <div className="flex items-end gap-4">
                <div className="w-32">
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">fPort<span className="text-teal-500">*</span></label>
                  <input 
                    type="number" 
                    value={decFPort}
                    onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setDecFPort(val);
                        setDecExamples(decExamples.map(ex => ex.id === selectedDecId ? {...ex, fPort: val} : ex));
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-slate-900 text-sm"
                  />
                </div>
                <button 
                  onClick={onDecodeClick}
                  className="px-6 py-2.5 bg-white border border-teal-600 text-teal-600 font-medium text-sm rounded hover:bg-teal-50 transition-colors uppercase tracking-wide"
                >
                  Decode
                </button>
              </div>

              <div className="flex-1 min-h-[300px] flex flex-col">
                 <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Decoded Uplink Message</label>
                 <div className="relative flex-1">
                   <textarea 
                     readOnly
                     value={decoded}
                     className="w-full h-full min-h-[300px] p-4 bg-slate-50 border border-slate-300 rounded font-mono text-xs text-slate-700 resize-none focus:ring-2 focus:ring-teal-500 outline-none"
                   />
                   <button 
                     onClick={handleDecCopy}
                     className="absolute bottom-4 right-4 bg-teal-600 text-white px-3 py-1.5 rounded text-xs font-medium shadow-sm hover:bg-teal-700 flex items-center gap-1.5 transition-all"
                   >
                     {decCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                     {decCopied ? 'Copied' : 'Copy to clipboard'}
                   </button>
                 </div>
              </div>

           </div>
        ) : (
           // --- ENCODER VIEW ---
           <div className="pb-10">
               <DownlinkEncoder 
                key={selectedEncId} // Reset state on example switch
                initialExample={encExamples.find(e => e.id === selectedEncId) || encExamples[0]} 
                onUpdateName={updateEncoderExampleName}
                onUpdateJson={updateEncoderExampleJson}
               />
           </div>
        )}
        </div>
      </div>

      {/* Left Sidebar (Examples) - Collapsible on mobile, always visible on desktop */}
      <div className="w-full lg:w-1/3 border-t lg:border-t-0 lg:border-r border-slate-200 flex flex-col bg-slate-50 lg:min-h-auto">
        <div
          className="p-4 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10 cursor-pointer lg:cursor-default"
          onClick={() => setShowExamples(!showExamples)}
        >
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800">Examples</h3>
            <span className="lg:hidden text-slate-400">
              {showExamples ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleAdd(); setShowExamples(true); }}
            className={`flex items-center gap-1 text-xs font-medium text-white px-2 py-1.5 rounded transition-colors ${activeTab === 'decode' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            <Plus className="w-3 h-3" /> ADD
          </button>
        </div>
        <div className={`flex-1 overflow-y-auto p-2 space-y-2 ${showExamples ? '' : 'hidden lg:block'}`}>
          {activeExamples.map((ex: any) => (
            <div 
              key={ex.id}
              onClick={() => handleSelectId(ex.id)}
              className={`group relative p-3 rounded-md cursor-pointer border transition-all ${
                activeSelectedId === ex.id 
                  ? activeTab === 'decode' ? 'bg-teal-50 border-teal-200 shadow-sm' : 'bg-purple-50 border-purple-200 shadow-sm'
                  : 'bg-white border-slate-200 hover:bg-white'
              } ${activeTab === 'decode' ? 'hover:border-teal-200' : 'hover:border-purple-200'}`}
            >
              <div className="flex justify-between items-start pr-6">
                <span className={`font-medium text-sm truncate ${
                    activeSelectedId === ex.id 
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
                onClick={(e) => handleRemove(e, ex.id)}
                className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              
              {activeSelectedId === ex.id && (
                <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-md ${activeTab === 'decode' ? 'bg-teal-500' : 'bg-purple-500'}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default UplinkDecoder;
