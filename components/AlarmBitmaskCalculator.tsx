
import React, { useState } from 'react';

const alarms = [
  { name: 'Temp', value: 1 },
  { name: 'Acceleration Axis 1', value: 2 },
  { name: 'Acceleration Axis 2', value: 4 },
  { name: 'Acceleration Axis 3', value: 8 },
  { name: 'Velocity Axis 1', value: 16 },
  { name: 'Velocity Axis 2', value: 32 },
  { name: 'Velocity Axis 3', value: 64 },
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
    <div className="my-8">
      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Alarm Bitmask Calculator</h4>
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
            This system works like a menu where every item has a unique price that is a "power of 2" (1, 2, 4, 8...).
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-2">
            Because these numbers are unique, there is only one way to add them up to get a specific total. The sensor receives the <strong>Total Sum</strong> and works backward to figure out which alarms are enabled.
          </p>
          <p className="text-sm font-medium text-slate-700 mb-1">Your Alarms:</p>
          <ul className="text-sm text-slate-600 list-disc pl-5 mb-3 space-y-0.5">
            <li><code className="bg-slate-200 px-1 rounded text-xs">1</code> = Temperature</li>
            <li><code className="bg-slate-200 px-1 rounded text-xs">2, 4, 8</code> = Acceleration Axes</li>
            <li><code className="bg-slate-200 px-1 rounded text-xs">16, 32, 64</code> = Velocity Axes</li>
          </ul>
          <p className="text-xs text-slate-400 italic">
            Example: If you send <strong>66</strong>, the sensor knows the only way to make 66 is <strong>64 + 2</strong>. Therefore, it enables "Velocity Axis 3" and "Accel Axis 1".
          </p>
        </div>
      </div>
    </div>
  );
}
