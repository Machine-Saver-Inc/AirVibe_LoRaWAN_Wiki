
import React, { useState } from 'react';

const alarms = [
  { name: 'Temperature', bit: 0, value: 1 << 0 },
  { name: 'Acceleration Axis 1', bit: 1, value: 1 << 1 },
  { name: 'Acceleration Axis 2', bit: 2, value: 1 << 2 },
  { name: 'Acceleration Axis 3', bit: 3, value: 1 << 3 },
  { name: 'Velocity Axis 1', bit: 4, value: 1 << 4 },
  { name: 'Velocity Axis 2', bit: 5, value: 1 << 5 },
  { name: 'Velocity Axis 3', bit: 6, value: 1 << 6 },
];

export default function AlarmBitmaskCalculator() {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const total = alarms.reduce((sum, a) => sum + (checked[a.value] ? a.value : 0), 0);
  const hex = '0x' + total.toString(16).toUpperCase().padStart(2, '0');
  const bin = total.toString(2).padStart(8, '0');
  const binDisplay = bin.slice(0, 4) + ' ' + bin.slice(4);

  const toggle = (value: number) => {
    setChecked(prev => ({ ...prev, [value]: !prev[value] }));
  };

  return (
    <div className="my-8 group/alarm">
      <div className="flex items-center gap-4 mb-6">
        <h4 className="text-2xl font-bold text-slate-900 group-hover/alarm:text-blue-600 transition-colors">Alarm Bitmask Calculator</h4>
        <div className="h-px bg-slate-200 flex-1"></div>
      </div>
      <p className="text-sm text-slate-500 mb-4">Check the boxes to generate the Alarm Bitmask value to use in the Alarm Downlink.</p>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {alarms.map(alarm => (
            <label
              key={alarm.value}
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={!!checked[alarm.value]}
                  onChange={() => toggle(alarm.value)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">{alarm.name}</span>
              </div>
              <span className="text-xs font-mono text-slate-400">({alarm.value})</span>
            </label>
          ))}
        </div>

        <div className="bg-slate-800 text-white px-4 py-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Decimal</span>
            <span className="font-mono font-bold text-blue-300">{total}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Hexadecimal</span>
            <span className="font-mono font-bold text-blue-300">{hex}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Binary</span>
            <span className="font-mono font-bold text-blue-300">{binDisplay}</span>
          </div>
        </div>

        <div className="px-4 py-5 border-t border-slate-200 bg-slate-50">
          <h5 className="text-sm font-semibold text-slate-700 mb-2">How does this work?</h5>
          <p className="text-sm text-slate-600 leading-relaxed mb-2">
            Each alarm is assigned a unique <strong>bit position</strong> in a bitmask. A bit-shift (<code className="bg-slate-200 px-1 rounded text-xs">1 &lt;&lt; n</code>) means "set bit n to 1" — this produces a unique power of 2 for each alarm.
          </p>
          <div className="overflow-x-auto mb-3">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="text-left py-1.5 pr-4 text-xs font-medium text-slate-500 uppercase">Alarm</th>
                  <th className="text-left py-1.5 pr-4 text-xs font-medium text-slate-500 uppercase">Bit-Shift</th>
                  <th className="text-left py-1.5 pr-4 text-xs font-medium text-slate-500 uppercase">Decimal</th>
                  <th className="text-left py-1.5 text-xs font-medium text-slate-500 uppercase">Meaning</th>
                </tr>
              </thead>
              <tbody className="font-mono text-slate-600">
                {alarms.map(a => (
                  <tr key={a.bit} className="border-b border-slate-100">
                    <td className="py-1.5 pr-4 font-sans">{a.name}</td>
                    <td className="py-1.5 pr-4"><code className="bg-slate-200 px-1 rounded text-xs">1 &lt;&lt; {a.bit}</code></td>
                    <td className="py-1.5 pr-4">{a.value}</td>
                    <td className="py-1.5 font-sans">Bit {a.bit} is set</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-2">
            Because each alarm has a unique bit, there is only one way to add them up to get a specific total. The sensor receives the <strong>total sum</strong> and works backward to determine which alarms are enabled.
          </p>
          <p className="text-xs text-slate-400 italic">
            Example: If you send <strong>66</strong>, the sensor knows the only way to make 66 is <strong>64 + 2</strong> (bit 6 + bit 1). Therefore, it enables "Velocity Axis 3" and "Acceleration Axis 1".
          </p>
        </div>
      </div>
    </div>
  );
}
