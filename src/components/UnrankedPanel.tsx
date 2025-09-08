import React from 'react';
import type { Contestant } from '../types';
import ContestantCard from './ContestantCard';

type Props = {
  filteredUnranked: Contestant[];
  unrankedCount: number;
  unrankedCollapsed: boolean;
  setUnrankedCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
  showStats: boolean;
  handleDragStart: (id: string) => void;
  handleDragEndWithClear: () => void;
  draggedContestant: string | null;
  quickRankMode: boolean;
  handleQuickRankWithMode: (id: string, tier: string) => void;
  comparisonActive: boolean;
  selectContestantForComparison: (c: Contestant) => void;
  setSelectedContestant: (c: Contestant | null) => void;
  handleStackForCompare: (id: string) => void;
  selectedContestant: Contestant | null;
  consideredIds: Set<string>;
};

export default function UnrankedPanel(p: Props) {
  return (
    <footer className="text-center mt-8">
      <div className="mb-4 bg-slate-800 rounded-lg p-2">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold text-slate-300 flex items-center gap-2">📍 Unranked Contestants
            <span className="text-xs font-normal text-slate-400">({p.unrankedCount} remaining)</span>
          </h2>
          <button
            onClick={() => p.setUnrankedCollapsed(c => !c)}
            className="text-slate-300 text-xs bg-slate-700/60 hover:bg-slate-600 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-expanded={!p.unrankedCollapsed}
          >{p.unrankedCollapsed ? 'Expand' : 'Collapse'}</button>
        </div>
        {!p.unrankedCollapsed && (
          <div className="mt-2 flex flex-wrap justify-center gap-3 min-h-[120px]">
            {p.filteredUnranked.length > 0 ? p.filteredUnranked.map(contestant => (
              <ContestantCard
                key={contestant.id}
                contestant={contestant}
                showStats={p.showStats}
                onDragStart={p.handleDragStart}
                onDragEnd={p.handleDragEndWithClear}
                isDragging={p.draggedContestant === contestant.id}
                quickRankMode={p.quickRankMode}
                onQuickRank={p.handleQuickRankWithMode}
                onSelect={p.comparisonActive ? p.selectContestantForComparison : (c: Contestant) => p.setSelectedContestant(c)}
                onStackForCompare={p.handleStackForCompare}
                isSelected={p.selectedContestant?.id === contestant.id}
                wasConsidered={p.consideredIds.has(contestant.id)}
              />
            )) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                {p.unrankedCount === 0 ? 'All contestants have been ranked! Great job!' : 'No matches for current search / filters'}
              </div>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
