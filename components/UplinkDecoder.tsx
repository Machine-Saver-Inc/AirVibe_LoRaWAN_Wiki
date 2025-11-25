
import React, { useState, useEffect } from 'react';
import { Plus, X, Copy, Check, Download } from 'lucide-react';
import { decoderExamples, DecoderExample } from '../data/decoderExamples';
import { encoderExamples, EncoderExample } from '../data/encoderExamples';
import { decodeUplink } from '../utils/airvibeDecoder';
import DownlinkEncoder from './DownlinkEncoder';

// Basic driver template to allow users to download a standard JS file
const JS_DRIVER_CONTENT = `/**
 * AirVibe LoRaWAN Decoder Driver
 * Version: 2.26
 */

function Decode(fPort, bytes) {
    var decoded = {};
    var packetType = bytes[0];

    // Helper functions
    function readInt16BE(b, offset) {
        var val = (b[offset] << 8) | b[offset + 1];
        return (val & 0x8000) ? val - 0x10000 : val;
    }
    
    function readUInt16BE(b, offset) {
        return (b[offset] << 8) | b[offset + 1];
    }

    if (packetType === 4) { // Configuration
        decoded.PacketType = 4;
        decoded.Version = bytes[1];
        decoded.PushMode = bytes[2];
        decoded.AxisMask = bytes[3];
        decoded.AccelRange = bytes[4];
        decoded.HardwareFilter = bytes[5];
        decoded.TWFPushPeriod = readUInt16BE(bytes, 6);
        decoded.OverallPushPeriod = readUInt16BE(bytes, 8);
        decoded.NumSamples = readUInt16BE(bytes, 10);
        decoded.HighPass = readUInt16BE(bytes, 12);
        decoded.LowPass = readUInt16BE(bytes, 14);
        decoded.Window = bytes[16];
        decoded.AlarmPeriod = readUInt16BE(bytes, 17);
        decoded.AlarmMask = readUInt16BE(bytes, 19);
        decoded.TempAlarm = readUInt16BE(bytes, 21);
        // ... acceleration and velocity alarm levels ...
    }
    else if (packetType === 2) { // Overall
        decoded.PacketType = 2;
        decoded.Status = bytes[1];
        decoded.AlarmFlag = bytes[2];
        decoded.Temperature = bytes[3];
        decoded.Voltage = bytes[4] * 0.023; // approx
        decoded.Charge = bytes[5];
        decoded.Accel_X = readUInt16BE(bytes, 7);
        decoded.Accel_Y = readUInt16BE(bytes, 9);
        decoded.Accel_Z = readUInt16BE(bytes, 11);
        decoded.Vel_X = readUInt16BE(bytes, 13);
        decoded.Vel_Y = readUInt16BE(bytes, 15);
        decoded.Vel_Z = readUInt16BE(bytes, 17);
    }
    else if (packetType === 3) { // Waveform Info
        decoded.PacketType = 3;
        decoded.TransID = bytes[1];
        decoded.SegNum = bytes[2];
        decoded.AxisSel = bytes[4];
        decoded.TotalSegments = readUInt16BE(bytes, 5);
        decoded.Rate = readUInt16BE(bytes, 8);
        decoded.Samples = readUInt16BE(bytes, 10);
    }
    else if (packetType === 1 || packetType === 5) { // Waveform Data
        decoded.PacketType = packetType;
        decoded.TransID = bytes[1];
        decoded.SegNum = readUInt16BE(bytes, 2);
        decoded.Samples = [];
        for (var i = 4; i < bytes.length; i += 2) {
            decoded.Samples.push(readInt16BE(bytes, i));
        }
    }

    return decoded;
}
`;

const UplinkDecoder: React.FC = () => {
  // Mode State
  const [activeTab, setActiveTab] = useState<'decode' | 'encode'>('decode');

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
    setTimeout(() => setDecCopied(false), 2000);
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
    const file = new Blob([JS_DRIVER_CONTENT], {type: 'text/javascript'});
    element.href = URL.createObjectURL(file);
    element.download = "AirVibe_TPM_2-26_v001.js";
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
      json: { fPort: 30 }
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
      <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-white z-10">
        
        {/* Header with Tabs and Download */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 mb-6 pb-2 gap-4">
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
                AirVibe_TPM_2-26_v001.js
            </button>
        </div>

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

              <div className="pt-4 border-t border-slate-200">
                <button className="px-4 py-2 border border-teal-600 text-teal-600 text-sm font-medium rounded hover:bg-teal-50 uppercase">
                  Edit
                </button>
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

      {/* Left Sidebar (Examples) - Appears 2nd in DOM (so Bottom on Mobile), but Reversed on Desktop to be Left */}
      <div className="w-full lg:w-1/3 border-t lg:border-t-0 lg:border-r border-slate-200 flex flex-col bg-slate-50 min-h-[300px] lg:min-h-auto">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
          <h3 className="font-semibold text-slate-800">Examples</h3>
          <button 
            onClick={handleAdd}
            className={`flex items-center gap-1 text-xs font-medium text-white px-2 py-1.5 rounded transition-colors ${activeTab === 'decode' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            <Plus className="w-3 h-3" /> ADD
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
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
