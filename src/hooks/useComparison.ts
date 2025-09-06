import { useState, useCallback, useMemo } from 'react';
import type { Contestant, ComparisonState, ContestantComparison } from '../types';

export const useComparison = () => {
  const [comparisonState, setComparisonState] = useState<ComparisonState>({ 
    isActive: false, 
    contestants: [null, null] 
  });

  const selectContestantForComparison = useCallback((contestant: Contestant) => {
    setComparisonState(prev => {
      const newState = { ...prev };
      if (!newState.contestants[0]) {
        newState.contestants[0] = contestant;
      } else if (!newState.contestants[1] && newState.contestants[0].id !== contestant.id) {
        newState.contestants[1] = contestant;
      }
      return newState;
    });
  }, []);

  const clearComparison = useCallback(() => {
    setComparisonState({ isActive: false, contestants: [null, null] });
  }, []);

  const toggleComparisonMode = useCallback(() => {
    setComparisonState(prev => ({ 
      ...prev, 
      isActive: !prev.isActive,
      contestants: prev.isActive ? [null, null] : prev.contestants
    }));
  }, []);

  const generateComparisonAnalysis = useMemo(() => {
    if (!comparisonState.contestants[0] || !comparisonState.contestants[1]) return null;
    
    const [c1, c2] = comparisonState.contestants;
    const season1 = typeof c1.season === 'number' ? c1.season : parseInt(c1.season || '0');
    const season2 = typeof c2.season === 'number' ? c2.season : parseInt(c2.season || '0');
    
    const analysis: ContestantComparison = {
      contestant1: c1,
      contestant2: c2,
      analysis: {
        seasonDifference: Math.abs(season1 - season2),
        statusComparison: `${c1.name} (Season ${c1.season}) vs ${c2.name} (Season ${c2.season})`,
        strengthsComparison: [
          `${c1.name}: Strong social game and alliance management`,
          `${c2.name}: Strategic gameplay and challenge performance`
        ],
        recommendation: Math.random() > 0.5 ? 'left' : 'right'
      }
    };
    
    return analysis;
  }, [comparisonState.contestants]);

  return {
    comparisonState,
    selectContestantForComparison,
    clearComparison,
    toggleComparisonMode,
    generateComparisonAnalysis
  };
};
