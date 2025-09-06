import React from 'react';
import type { Contestant } from '../types';
import type { UseHeadToHeadReturn } from '../hooks/useHeadToHead';

interface HeadToHeadModeProps {
  h2h: UseHeadToHeadReturn;
  onClose: () => void;
}

const Card: React.FC<{ contestant: Contestant; onClick: () => void }> = ({ contestant, onClick }) => (
  <button
    onClick={onClick}
    className="flex-1 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 rounded-xl p-4 flex flex-col items-center gap-3 shadow-md transition-colors"
  >
    <img
      src={contestant.imageUrl}
      alt={contestant.name}
      className="w-28 h-28 object-cover rounded-full border-4 border-slate-500"
      loading="lazy"
    />
    <div className="text-white font-semibold text-lg text-center">{contestant.name}</div>
    <div className="text-slate-400 text-xs">Season {contestant.season}</div>
  </button>
);

const HeadToHeadMode: React.FC<HeadToHeadModeProps> = ({ h2h, onClose }) => {
  if (!h2h.isActive) return null;
  const pair = h2h.pair;

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-50 flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-200">Head-to-Head Voting</h2>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">Comparisons: {h2h.comparisons}</span>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
          >Exit</button>
        </div>
      </div>
      {pair ? (
        <div className="flex flex-col md:flex-row gap-6 flex-1">
          <Card contestant={pair[0]} onClick={() => h2h.chooseWinner(pair[0].id)} />
          <div className="flex items-center justify-center text-slate-400 font-bold text-2xl">VS</div>
          <Card contestant={pair[1]} onClick={() => h2h.chooseWinner(pair[1].id)} />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400">Not enough contestants to compare.</div>
      )}
      <div className="mt-6 grid gap-3">
        <div className="flex gap-2">
          <button
            onClick={h2h.skip}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg"
          >Skip</button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg"
          >Finish & View Ranking</button>
        </div>
        {h2h.ranking.length > 0 && (
          <div className="max-h-48 overflow-auto rounded-lg border border-slate-700 p-2 bg-slate-900/70">
            <h3 className="text-slate-300 font-semibold mb-2 text-sm">Live Ranking (win %)</h3>
            <ol className="space-y-1 text-xs">
              {h2h.ranking.map(r => (
                <li key={r.contestant.id} className="flex justify-between text-slate-400">
                  <span className="truncate max-w-[140px]">{r.contestant.name}</span>
                  <span className="font-mono">{(r.score * 100).toFixed(1)}% ({r.wins}-{r.losses})</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeadToHeadMode;
