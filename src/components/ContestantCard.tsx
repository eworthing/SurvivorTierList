import React from 'react';
import useContestantCardInteractions from '../hooks/useContestantCardInteractions';
import { useDraggable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import type { Contestant } from '../types';

type Props = {
  contestant: Contestant;
  showStats?: boolean;
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  quickRankMode?: boolean;
  onQuickRank?: (id: string, tier: string) => void;
  onSelect?: (c: Contestant) => void;
  isSelected?: boolean;
  wasConsidered?: boolean; // returned from a tier back to unranked in this session
  onDominantColor?: (hex: string | null) => void; // called during drag hover to set accent
  onWiggleUndo?: (id: string) => void; // called when wiggle gesture detected to undo
  onStackForCompare?: (id: string) => void; // called when held on top of another card
  index?: number;
  tierName?: string;
};

const ContestantCard = React.memo(function ContestantCard({ 
  contestant, 
  showStats, 
  onDragStart, 
  onDragEnd, 
  isDragging, 
  quickRankMode, 
  onQuickRank, 
  onSelect, 
  isSelected,
  wasConsidered,
  onDominantColor, // removed usage of onDominantColor
  onWiggleUndo,
  onStackForCompare,
  index,
  tierName
}: Props) {
  const interactions = useContestantCardInteractions({
    contestant,
    quickRankMode,
    onDragStart,
    onDragEnd,
    onQuickRank,
    onSelect,
    isDragging,
    onDominantColor,
    onWiggleUndo,
    onStackForCompare,
  });

  const {
    showTiers,
    imgSrc,
    isPeeking,
    isSettling,
  isDraggingMobile,
    handleClick,
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove,
    handleKeyDown,
    handleImageError,
    handleMouseEnter,
    handleMouseLeave,
  handleDragEnter,
  handleDragLeaveCard,
    setShowTiers,
  } = interactions;

  // call both hooks in stable order; prefer sortable values when provided by a SortableContext
  const sortable = useSortable({ id: contestant.id, data: { tierName, index } });
  const draggable = useDraggable({ id: contestant.id });
  const attributes = sortable?.attributes || draggable.attributes;
  const listeners = sortable?.listeners || draggable.listeners;
  const setNodeRef = sortable?.setNodeRef || draggable.setNodeRef;
  // safe helpers to inspect unknown draggable object without using `any`
  const drObj: unknown = draggable;
  const hasProp = (o: unknown, p: string): o is Record<string, unknown> => typeof o === 'object' && o !== null && p in (o as Record<string, unknown>);
  type TransformShape = { x?: number; y?: number; scale?: number } | null;
  const maybeTransform: TransformShape = hasProp(drObj, 'transform') ? (drObj as Record<string, unknown>).transform as TransformShape : null;
  const maybeTransition: string | undefined = hasProp(drObj, 'transition') ? (drObj as Record<string, unknown>).transition as string : undefined;
  const transform = (sortable?.transform as TransformShape) || maybeTransform || null;
  const transition = sortable?.transition || maybeTransition || undefined;

  // Safely derive optional stats from unknown-typed index signature
  const strategy = typeof contestant.strategy === 'number' || typeof contestant.strategy === 'string' 
    ? String(contestant.strategy) 
    : undefined;
  const social = typeof contestant.social === 'number' || typeof contestant.social === 'string' 
    ? String(contestant.social) 
    : undefined;
  // handlers and interactive state are provided by the interactions hook

  return (
    <motion.div
      animate={isSettling ? { y: [0, -8, 0] } : { y: 0 }}
      transition={isSettling ? { duration: 0.42, ease: 'easeOut' } : { duration: 0 }}
    >
  <div
      role="button"
      tabIndex={0}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeaveCard}
  onClick={handleClick}
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onKeyDown={handleKeyDown}
  className={`
    relative w-24 h-32 sm:w-28 sm:h-36 md:w-24 md:h-32 rounded-lg overflow-hidden shadow-lg cursor-pointer 
    transform hover:scale-105 transition-transform duration-200 
    focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900
    ${isDragging || isDraggingMobile ? 'opacity-50 scale-95' : 'opacity-100'} 
    ${isSelected ? 'ring-2 ring-sky-400' : ''}
    ${quickRankMode ? 'ring-2 ring-green-400' : ''}
  ${showTiers ? 'ring-2 ring-yellow-400' : ''}
  ${wasConsidered ? 'border-2 border-dashed border-sky-400' : ''}
  ${isSettling ? 'animate-stl-settle' : ''}
    touch-manipulation select-none
  `}
      style={{ 
        minHeight: '44px', // iOS accessibility guideline
        minWidth: '44px',
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale || 1})` : undefined,
        transition: transition || undefined,
      }}
      aria-label={`${contestant.name} from Season ${contestant.season}${quickRankMode ? '. Press 1-6 to rank quickly' : ''}${showTiers ? '. Quick rank active - tap a tier' : ''}`}
      title={quickRankMode ? 'Press 1-6 to rank: 1=S, 2=A, 3=B, 4=C, 5=D, 6=F' : `${contestant.name} - Season ${contestant.season}`}
    >
      <img 
        src={imgSrc} 
        onError={handleImageError} 
        alt={`${contestant.name} from Survivor Season ${contestant.season}`}
        loading="lazy" 
        className="w-full h-full object-cover" 
      />
      {/* Hover peek overlay */}
    {isPeeking && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 rounded-b-lg">
          {contestant.status || `Season ${contestant.season}`} 
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-2">
        <p className="text-white text-sm font-bold leading-tight">{contestant.name}</p>
        <p className="text-slate-300 text-xs">{`S${contestant.season}`}</p>
    {showStats && (
          <div className="text-xs text-slate-300 mt-1">
      {strategy && <span>STR: {strategy}</span>}
      {social && <span className="ml-1">SOC: {social}</span>}
          </div>
        )}
      </div>
      
      {quickRankMode && (
        <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
          1-6
        </div>
      )}

      {wasConsidered && !quickRankMode && (
        <div className="absolute top-1 left-1 bg-sky-600/80 text-white text-[10px] px-1 py-0.5 rounded shadow">
          considered
        </div>
      )}

      {/* Mobile tier selection overlay */}
  {showTiers && onQuickRank && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
          <div className="grid grid-cols-2 gap-2 p-2">
            {[
              { key: 'S', label: 'S', color: 'bg-red-500' },
              { key: 'A', label: 'A', color: 'bg-orange-500' },
              { key: 'B', label: 'B', color: 'bg-yellow-500' },
              { key: 'C', label: 'C', color: 'bg-green-500' },
              { key: 'D', label: 'D', color: 'bg-teal-500' },
              { key: 'F', label: 'F', color: 'bg-gray-500' },
            ].map(tier => (
              <button
                key={tier.key}
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickRank(contestant.id, tier.key);
                  setShowTiers(false);
                }}
                className={`
                  ${tier.color} hover:opacity-80 text-white font-bold 
                  text-sm py-2 px-3 rounded transition-all duration-200
                  transform hover:scale-105 active:scale-95
                  min-h-[44px] min-w-[44px] touch-manipulation
                `}
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                {tier.label}
              </button>
            ))}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTiers(false);
            }}
            className="absolute top-1 right-1 text-white text-lg font-bold bg-black/50 rounded-full w-6 h-6 flex items-center justify-center"
          >
            ×
          </button>
        </div>
      )}
  </div>
  </motion.div>
  );
});

export default ContestantCard;
