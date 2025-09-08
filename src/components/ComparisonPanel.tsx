import React from 'react';
import type { Contestant } from '../types';

type Props = {
  contestants: [Contestant | null, Contestant | null];
  onViewAnalysis?: () => void;
  onClear: () => void;
  generateComparisonAnalysis?: (a: Contestant|null, b: Contestant|null) => string;
};

export default function ComparisonPanel({ contestants, onViewAnalysis, onClear }: Props) {
  const a = contestants[0];
  const b = contestants[1];
  return (
    <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-purple-500">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-purple-400">Comparison Mode Active</h3>
        <p className="text-slate-400">Click contestants to compare them side by side</p>
      </div>

      {(a || b) ? (
        <div className="flex justify-center gap-4 mb-4">
          <div className="text-center">
            {a ? (
              <div className="bg-slate-700 p-3 rounded-lg">
                <img src={a.imageUrl} alt={a.name} className="w-16 h-16 rounded-full mx-auto mb-2" />
                <div className="text-white font-semibold">{a.name}</div>
              </div>
            ) : (
              <div className="bg-slate-700/50 border-2 border-dashed border-slate-500 p-3 rounded-lg w-24 h-24 flex items-center justify-center text-slate-500">Select 1st</div>
            )}
          </div>

          <div className="flex items-center text-2xl text-purple-400">VS</div>

          <div className="text-center">
            {b ? (
              <div className="bg-slate-700 p-3 rounded-lg">
                <img src={b.imageUrl} alt={b.name} className="w-16 h-16 rounded-full mx-auto mb-2" />
                <div className="text-white font-semibold">{b.name}</div>
              </div>
            ) : (
              <div className="bg-slate-700/50 border-2 border-dashed border-slate-500 p-3 rounded-lg w-24 h-24 flex items-center justify-center text-slate-500">Select 2nd</div>
            )}
          </div>
        </div>
      ) : null}

      <div className="flex justify-center gap-2">
        {onViewAnalysis && (
          <button onClick={onViewAnalysis} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all">📊 View Analysis</button>
        )}
        <button onClick={onClear} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all">Clear</button>
      </div>
    </div>
  );
}
