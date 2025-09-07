import React from 'react';
import CustomizationPanel from './CustomizationPanel';
import type { ModalState, TierConfig, ContestantComparison } from '../types';

interface ModalContentRendererProps {
  modalState: ModalState;
  tierConfig: TierConfig;
  setTierConfig: (config: TierConfig) => void;
  onClose: () => void;
  generateComparisonAnalysis?: ContestantComparison | null;
}

const ModalContentRenderer: React.FC<ModalContentRendererProps> = ({
  modalState,
  tierConfig,
  setTierConfig,
  onClose,
  generateComparisonAnalysis
}) => {
  if (modalState.content === 'customization') {
    return (
      <CustomizationPanel 
        tierConfig={tierConfig} 
        onTierConfigChange={setTierConfig} 
        onClose={onClose} 
      />
    );
  }
  
  if (modalState.content === 'comparison' && generateComparisonAnalysis) {
    const analysis = generateComparisonAnalysis;
    return (
      <div className="text-white space-y-4">
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <img 
              src={analysis.contestant1.imageUrl} 
              alt={analysis.contestant1.name} 
              className="w-20 h-20 rounded-full mx-auto mb-2" 
            />
            <div className="font-bold">{analysis.contestant1.name}</div>
            <div className="text-slate-400 text-sm">Season {analysis.contestant1.season}</div>
          </div>
          
          <div className="flex items-center text-3xl text-purple-400">VS</div>
          
          <div className="text-center">
            <img 
              src={analysis.contestant2.imageUrl} 
              alt={analysis.contestant2.name} 
              className="w-20 h-20 rounded-full mx-auto mb-2" 
            />
            <div className="font-bold">{analysis.contestant2.name}</div>
            <div className="text-slate-400 text-sm">Season {analysis.contestant2.season}</div>
          </div>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-lg">
          <h4 className="font-bold mb-2 text-purple-400">📊 Analysis</h4>
          <p className="text-slate-300 mb-2">{analysis.analysis.statusComparison}</p>
          <p className="text-slate-400 text-sm">Season difference: {analysis.analysis.seasonDifference} seasons</p>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-lg">
          <h4 className="font-bold mb-2 text-green-400">💪 Strengths Comparison</h4>
          <ul className="space-y-1 text-slate-300">
            {analysis.analysis.strengthsComparison.map((strength, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-400 text-sm">•</span>
                <span className="text-sm">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-lg">
          <h4 className="font-bold mb-2 text-yellow-400">🏆 Recommendation</h4>
          <p className="text-slate-300">
            Based on the analysis: <span className="font-bold text-white">
              {analysis.analysis.recommendation === 'left' ? analysis.contestant1.name : 
               analysis.analysis.recommendation === 'right' ? analysis.contestant2.name : 
               'Both contestants are equally strong'}
            </span> might have a slight edge in rankings.
          </p>
        </div>
      </div>
    );
  }
  
  // Structured confirm content
  if (typeof modalState.content === 'object' && modalState.content?.type === 'confirm') {
    const { message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'default', onResult } = modalState.content;
    return (
      <div className="text-white space-y-6">
        <div className="whitespace-pre-line text-sm leading-relaxed text-slate-200">{message}</div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => { onResult?.(false); onClose(); }}
            className="px-4 py-2 rounded bg-slate-600 hover:bg-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-300"
          >{cancelLabel}</button>
          <button
            type="button"
            onClick={() => { onResult?.(true); onClose(); }}
            className={`px-4 py-2 rounded text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-300 transition-colors ${tone === 'danger' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-sky-600 hover:bg-sky-500'}`}
            autoFocus
          >{confirmLabel}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white whitespace-pre-line">
      {typeof modalState.content === 'string' ? modalState.content : ''}
    </div>
  );
};

export default ModalContentRenderer;
