import React from 'react';
import TierRow from './TierRow';
import type { Contestant, TierConfig } from '../types';

type Props = {
  tierNames: string[];
  tierConfig: TierConfig;
  tiers: Record<string, Contestant[]>;
  setDraggedOverTier: (tierName: string | null) => void;
  draggedOverTier: string | null;
  onAnalyzeTier: (tierName: string, contestants: Contestant[]) => void;
  showStats: boolean;
  handleDragStart: (id: string) => void;
  handleDragEndWithClear: () => void;
  draggedContestant: string | null;
  moveSelectedToTier: (tier: string) => void;
  quickRankMode: boolean;
  handleQuickRankWithMode: (id: string, tier: string) => void;
  comparisonActive: boolean;
  selectContestantForComparison: (c: Contestant) => void;
  setSelectedContestant: (c: Contestant | null) => void;
  handleStackForCompare: (id: string) => void;
  selectedContestant: Contestant | null;
  clearTier: (tierName: string) => void;
  lastMovedIds: string[];
  celebrateSTier: boolean;
  onOpenStats?: (c: Contestant) => void;
};

export default function TierGrid(p: Props) {
  return (
    <main className="drag-scope space-y-2 sm:space-y-0 sm:gap-3">
      <div className="sm:grid sm:grid-flow-col sm:auto-cols-fr sm:gap-3" style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))` }}>
        {p.tierNames.map(tierName => (
          <section key={tierName} className="space-y-3 sm:space-y-0">
            <TierRow
          key={tierName}
          tierName={tierName}
          tierConfig={p.tierConfig[tierName]}
          contestants={p.tiers[tierName] || []}
          onDragOver={p.setDraggedOverTier}
          isDraggedOver={p.draggedOverTier === tierName}
          dragAccentColor={null}
          onAnalyzeTier={p.onAnalyzeTier}
          showStats={p.showStats}
          onDragStart={p.handleDragStart}
          onDragEnd={p.handleDragEndWithClear}
          draggedContestant={p.draggedContestant}
          onZoneClick={p.moveSelectedToTier}
          quickRankMode={p.quickRankMode}
          onQuickRank={p.handleQuickRankWithMode}
          onSelect={p.comparisonActive ? p.selectContestantForComparison : (c: Contestant) => p.setSelectedContestant(c)}
          onStackForCompare={p.handleStackForCompare}
          selectedContestant={p.selectedContestant}
          onClearTier={p.clearTier}
          highlightIds={p.lastMovedIds}
          celebrateSTier={p.celebrateSTier}
          onOpenStats={p.onOpenStats}
        />
        </section>
      ))}
  </div>
    </main>
  );
}
