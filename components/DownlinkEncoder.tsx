
import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { EncoderExample } from '../data/encoderExamples';
import { encodeDownlink } from '../utils/airvibeEncoder';

interface DownlinkEncoderProps {
  initialExample: EncoderExample;
  onUpdateName: (id: string, name: string) => void;
  onUpdateJson: (id: string, json: object) => void;
}

const DownlinkEncoder: React.FC<DownlinkEncoderProps> = ({ initialExample, onUpdateName, onUpdateJson }) => {
  const [name, setName] = useState(initialExample.name);
  const [jsonText, setJsonText] = useState(JSON.stringify(initialExample.json, null, 2));
  const [encodedHex, setEncodedHex] = useState('');
  const [fPort, setFPort] = useState<number | string>('-');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync internal state when the selected example changes
  useEffect(() => {
    setName(initialExample.name);
    const newJson = JSON.stringify(initialExample.json, null, 2);
    setJsonText(newJson);
    processEncoding(newJson);
  }, [initialExample.id]);

  const processEncoding = (inputJson: string) => {
    try {
      setError(null);
      const parsed = JSON.parse(inputJson);
      const result = encodeDownlink(parsed);
      
      if (result.error) {
        setError(result.error);
        setEncodedHex('');
        setFPort(result.fPort || '-');
      } else {
        setEncodedHex(result.hex);
        setFPort(result.fPort);
        // Only trigger update callback if valid
        onUpdateJson(initialExample.id, parsed);
      }
    } catch (e: any) {
      setError("Invalid JSON format");
      setEncodedHex('');
    }
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(e.target.value);
    processEncoding(e.target.value);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(encodedHex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      
      <div>
        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Name<span className="text-purple-500">*</span></label>
        <input 
          type="text" 
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            onUpdateName(initialExample.id, e.target.value);
          }}
          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-slate-900 text-sm"
        />
      </div>

      <div className="flex-1 min-h-[300px] flex flex-col">
         <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Downlink Message to Encode (JSON)<span className="text-purple-500">*</span></label>
         <textarea 
           value={jsonText}
           onChange={handleJsonChange}
           className={`w-full h-[300px] p-4 bg-slate-50 border rounded font-mono text-xs text-slate-700 resize-none focus:ring-2 focus:ring-purple-500 outline-none ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'}`}
         />
         {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
      </div>

      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 space-y-4">
        <div>
          <label className="block text-xs font-medium text-purple-700 uppercase mb-1">Encoded Payload (Hex)</label>
          <div className="relative">
            <input 
              readOnly
              type="text" 
              value={encodedHex}
              className="w-full p-2.5 pr-24 bg-white border border-purple-200 rounded font-mono text-sm text-slate-800 focus:outline-none"
            />
            {encodedHex && (
              <button 
                onClick={handleCopy}
                className="absolute top-1/2 -translate-y-1/2 right-2 bg-purple-100 text-purple-700 px-3 py-1 rounded text-xs font-medium hover:bg-purple-200 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-purple-700 uppercase">fPort:</span>
            <span className="font-mono text-sm bg-white border border-purple-200 px-2 py-0.5 rounded text-slate-800">{fPort}</span>
        </div>
      </div>

    </div>
  );
};

export default DownlinkEncoder;
