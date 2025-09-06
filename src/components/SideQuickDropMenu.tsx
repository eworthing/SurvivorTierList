import React from 'react';
import type { TierConfig } from '../types';
import { useDroppable } from '@dnd-kit/core';

type Side = 'left' | 'right';

interface SideQuickDropMenuProps {
  side: Side;
  tierNames: string[];
  tierConfig: TierConfig;
  onDropToTier: (contestantId: string, tierName: string) => void;
}

const SideQuickDropMenu: React.FC<SideQuickDropMenuProps> = ({ side, tierNames, tierConfig, onDropToTier }) => {
  const ordered = ['S','A','B','C','D','F'].filter(t => tierNames.includes(t));
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const handleDropHtml5 = (e: React.DragEvent, tierName: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) onDropToTier(id, tierName);
  };

  const TierDropButton: React.FC<{ tn: string }> = ({ tn }) => {
    const { isOver, setNodeRef } = useDroppable({ id: `side-${tn}` });
    return (
      <div
        ref={setNodeRef}
        role="button"
        aria-label={`Drop to ${tierConfig[tn]?.name || tn} tier`}
        title={`Drop to ${tierConfig[tn]?.name || tn}`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDropHtml5(e, tn)}
        className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-extrabold cursor-pointer select-none border-2 hover:scale-105 transition-transform active:scale-95 ${isOver ? 'scale-110 bg-white/10' : ''}`}
        style={{
          borderColor: tierConfig[tn]?.hexColor || '#94a3b8',
          background: 'rgba(15,23,42,0.7)'
        }}
        data-tier-name={tn}
      >
        {tn}
      </div>
    );
  };

  const isLeft = side === 'left';

  return (
    <div
      aria-label="Quick tier drop menu"
      className={`fixed top-1/2 -translate-y-1/2 ${isLeft ? 'left-2' : 'right-2'} z-40 hidden sm:flex flex-col gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-700 shadow-xl backdrop-blur`}
      role="navigation"
    >
      {ordered.map(tn => (
        <TierDropButton key={tn} tn={tn} />
      ))}
    </div>
  );
};

export default SideQuickDropMenu;
