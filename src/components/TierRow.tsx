import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Contestant, TierConfigEntry } from '../types';
import { useUIStore } from '../stores/uiStore';
import ContestantCard from './ContestantCard';

interface TierRowProps {
  tierName: string;
  tierConfig: TierConfigEntry;
  contestants: Contestant[];
  onDrop: (contestantId: string, tierName: string) => void;
  onDragOver: (tierName: string | null) => void;
  isDraggedOver: boolean;
  onAnalyzeTier: (tierName: string, contestants: Contestant[]) => void;
  showStats: boolean;
  onDragStart: (contestantId: string) => void;
  onDragEnd: () => void;
  draggedContestant: string | null;
  onZoneClick?: (tierName: string) => void;
  quickRankMode?: boolean;
  onQuickRank?: (contestantId: string, tierName: string) => void;
  onSelect?: (contestant: Contestant) => void;
  selectedContestant?: Contestant | null;
  onClearTier?: (tierName: string) => void;
  highlightIds?: string[]; // recently moved contestants to highlight
  celebrateSTier?: boolean; // trigger subtle celebration effect for S tier first card
  dragAccentColor?: string | null;
  onDominantColor?: (hex: string | null) => void;
  onStackForCompare?: (id: string) => void;
}

const TierRow: React.FC<TierRowProps> = React.memo(({
  tierName,
  tierConfig,
  contestants,
  onDrop,
  onDragOver,
  isDraggedOver,
  onAnalyzeTier,
  showStats,
  onDragStart,
  onDragEnd,
  draggedContestant,
  onZoneClick,
  quickRankMode,
  onQuickRank,
  onSelect,
  selectedContestant,
  onClearTier,
  highlightIds = [],
  celebrateSTier = false
  , dragAccentColor = null, onDominantColor, onStackForCompare
}) => {
  const [isJostling, setIsJostling] = React.useState(false);
  const dragAccent = useUIStore(state => state.dragAccentColor);
  const { isOver, setNodeRef } = useDroppable({ id: `tier-${tierName}` });

  React.useEffect(() => {
    if (isOver) onDragOver(tierName); else onDragOver(null);
  }, [isOver, onDragOver, tierName]);

  const handleDrop = (contestantId: string | null) => {
    if (!contestantId) return;
    onDrop(contestantId, tierName);
    setIsJostling(true);
    window.setTimeout(() => setIsJostling(false), 420);
  };

  // HTML5 fallback drop handler
  const handleDropHtml5 = (e: React.DragEvent) => {
    e.preventDefault();
    const contestantId = e.dataTransfer.getData('text/plain');
    handleDrop(contestantId || null);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      onDragOver(null);
    }
  };

  const handleZoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onZoneClick) onZoneClick(tierName);
  };

  const borderColor = (isDraggedOver && (dragAccent || dragAccentColor)) ? (dragAccent || dragAccentColor || tierConfig.hexColor || '#6b7280') : (tierConfig.hexColor || '#6b7280');

  return (
    <div
      ref={setNodeRef}
      onDrop={handleDropHtml5}
      onDragLeave={handleDragLeave}
      className={`
        flex items-stretch rounded-lg shadow-md border-l-8 transition-all duration-300
  ${isDraggedOver ? 'bg-slate-700/80 scale-[1.01]' : 'bg-slate-800/80'}
  ${celebrateSTier ? 'ring-2 ring-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.6)]' : ''}
        min-h-[120px] sm:min-h-[140px] touch-manipulation
      `}
      style={{ borderLeftColor: borderColor, transition: 'border-left-color 260ms ease' }}
    >
      <div
        className={`
          w-24 sm:w-32 flex flex-col justify-center items-center p-3 sm:p-4 
          text-white rounded-l-lg bg-gradient-to-br ${tierConfig.color}
          cursor-pointer hover:bg-opacity-80 transition-all duration-200
          min-h-[44px] touch-manipulation
        `}
        onClick={handleZoneClick}
        data-tier-name={tierName}
        style={{ minHeight: '44px' }}
      >
        <div className="relative w-full flex flex-col items-center">
          <span className="text-2xl sm:text-4xl font-extrabold">{tierConfig.name}</span>
          {onClearTier && contestants.length > 0 && (
            <button
              aria-label={`Clear ${tierConfig.name} tier`}
              onClick={(e) => { e.stopPropagation(); onClearTier(tierName); }}
              className="absolute -top-2 -right-2 bg-black/40 hover:bg-black/60 text-white text-xs px-1 py-0.5 rounded shadow focus:outline-none focus:ring-2 focus:ring-white/50"
              title="Clear tier"
            >⊘</button>
          )}
        </div>
        <span className="text-xs sm:text-sm text-center hidden sm:block">
          {tierConfig.description}
        </span>
        <button
          onClick={() => onAnalyzeTier(tierName, contestants)}
          className="
            mt-2 text-xs bg-black/30 px-2 py-1 rounded 
            hover:bg-black/50 transition-colors
            focus:outline-none focus:ring-2 focus:ring-white/50
          "
          title={`Analyze ${tierConfig.name} tier`}
        >
          Analyze
        </button>
      </div>

      <div
        className="flex-1 p-3 min-h-[120px] cursor-pointer"
        onClick={handleZoneClick}
        role="region"
        aria-label={`${tierConfig.name} tier drop zone. Contains ${contestants.length} contestants.`}
        data-tier-name={tierName}
      >
  <div className={`flex flex-wrap gap-3 relative min-h-[64px] ${isJostling ? 'tier-jostle' : ''}`}>
          {contestants.length === 0 && (
            <div
              className="absolute inset-0 flex items-center justify-center text-center text-slate-500/70 italic pointer-events-none px-2"
            >
              {tierName === 'S' ? 'Who is god-tier?' : `Drop ${tierConfig.name} picks here...`}
            </div>
          )}
          {contestants.map((contestant) => {
            const highlight = highlightIds.includes(contestant.id);
            return (
              <div key={contestant.id} className={highlight ? 'animate-pulse ring-2 ring-sky-400 rounded-lg' : ''}>
                <ContestantCard
                  contestant={contestant}
                  showStats={showStats}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  isDragging={draggedContestant === contestant.id}
                  quickRankMode={quickRankMode}
                  onQuickRank={onQuickRank}
                  onSelect={onSelect}
                  isSelected={selectedContestant?.id === contestant.id}
                  onDominantColor={onDominantColor}
                  onStackForCompare={onStackForCompare}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

TierRow.displayName = 'TierRow';

export default TierRow;
