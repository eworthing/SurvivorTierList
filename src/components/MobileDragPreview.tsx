import React from 'react';
import type { Contestant } from '../types';

interface MobileDragPreviewProps {
  contestant: Contestant;
  position: { x: number; y: number };
  isVisible: boolean;
}

const MobileDragPreview: React.FC<MobileDragPreviewProps> = ({
  contestant,
  position,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200"
      style={{
        left: position.x,
        top: position.y,
        opacity: isVisible ? 0.9 : 0
      }}
    >
      <div className="bg-slate-800 border-2 border-blue-400 rounded-lg p-2 shadow-2xl scale-110">
        <div className="flex items-center gap-2">
          <img 
            src={contestant.imageUrl} 
            alt={contestant.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="text-white text-sm font-semibold">
            {contestant.name}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDragPreview;
