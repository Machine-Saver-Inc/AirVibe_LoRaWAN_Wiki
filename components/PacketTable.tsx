import React from 'react';
import { PacketField } from '../types';

interface PacketTableProps {
  title?: string;
  packetType?: number | string;
  port?: number;
  fields: PacketField[];
}

const PacketTable: React.FC<PacketTableProps> = ({ title, packetType, port, fields }) => {
  const hasValues = fields.some(f => f.values);
  const hasDefault = fields.some(f => f.default);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm mt-4 mb-8">
      <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
        <h4 className="font-semibold text-slate-700">{title || 'Packet Structure'}</h4>
        <div className="text-sm font-mono bg-white px-2 py-1 rounded border border-slate-300">
          {packetType !== undefined && <span className="mr-3">Type: <span className="text-blue-600 font-bold">{packetType}</span></span>}
          {port !== undefined && <span>Port: <span className="text-purple-600 font-bold">{port}</span></span>}
        </div>
      </div>
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-24">Byte #</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-48">Field Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
            {hasValues && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Values</th>
            )}
            {hasDefault && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">Default</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {fields.map((field, idx) => (
            <tr key={idx} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-3 text-sm font-mono text-slate-600 whitespace-nowrap">{field.byte}</td>
              <td className="px-6 py-3 text-sm font-medium text-slate-900">{field.name}</td>
              <td className="px-6 py-3 text-sm text-slate-600">{field.description}</td>
              {hasValues && (
                <td className="px-6 py-3 text-sm text-slate-600 font-mono">
                  {field.values
                    ? field.values.split(' | ').map((v, i) => (
                        <div key={i} className="py-0.5">{v.trim()}</div>
                      ))
                    : '-'}
                </td>
              )}
              {hasDefault && (
                <td className="px-6 py-3 text-sm text-slate-500 font-mono">{field.default || '-'}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PacketTable;
