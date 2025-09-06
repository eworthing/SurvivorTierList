import React from 'react';
import type { TierConfig } from '../types';

interface QuickRankMobileProps {
  isVisible: boolean;
  tierConfig: TierConfig;
  onTierSelect: (tierName: string) => void;
  onCancel: () => void;
  selectedContestantName?: string;
}

const QuickRankMobile: React.FC<QuickRankMobileProps> = ({
  isVisible,
  tierConfig,
  onTierSelect,
  onCancel,
  selectedContestantName
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-t-2xl w-full max-w-md transform transition-transform duration-300 ease-out">
        {/* Handle bar */}
        <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mt-3 mb-4"></div>
        
        {/* Header */}
        <div className="px-4 pb-4 border-b border-slate-700">
          <h3 className="text-white font-bold text-lg">Quick Rank</h3>
          {selectedContestantName && (
            <p className="text-slate-400 text-sm">
              Ranking: <span className="text-white font-semibold">{selectedContestantName}</span>
            </p>
          )}
        </div>
        
        {/* Tier Options */}
        <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
          {Object.entries(tierConfig).map(([tierName, config]) => (
            <button
              key={tierName}
              onClick={() => onTierSelect(tierName)}
              className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 hover:bg-slate-700 active:bg-slate-600 touch-manipulation"
              style={{ backgroundColor: `${(config.hexColor || '#6b7280')}20`, borderLeft: `4px solid ${config.hexColor || '#6b7280'}` }}
            >
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: config.hexColor || '#6b7280' }}
              />
              <div className="flex-1 text-left">
                <div className="text-white font-semibold">{config.name} Tier</div>
                <div className="text-slate-400 text-sm">{config.description}</div>
              </div>
              <div className="text-slate-500 text-2xl">›</div>
            </button>
          ))}
        </div>
        
        {/* Cancel Button */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={onCancel}
            className="w-full py-3 text-slate-400 text-center font-medium hover:text-white transition-colors duration-200 touch-manipulation"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickRankMobile;
