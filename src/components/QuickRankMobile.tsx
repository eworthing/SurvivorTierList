import React from 'react';

interface QuickRankMobileProps {
  isVisible: boolean;
  onTierSelect: (tierName: string) => void;
  onCancel: () => void;
  selectedContestantName?: string;
}

const QuickRankMobile: React.FC<QuickRankMobileProps> = ({
  isVisible,
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
        
        {/* Tier Options: phone-optimized 3x2 grid */}
        <div className="p-3">
          <div className="grid grid-cols-3 gap-2">
            {['S','A','B','C','D','F'].map(t => (
              <button
                key={t}
                onClick={() => onTierSelect(t)}
                className="hit rounded-xl text-base font-semibold border py-3 flex items-center justify-center"
                aria-label={`Rank ${t}`}
              >
                {t}
              </button>
            ))}
          </div>
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
