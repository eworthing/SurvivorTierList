import { useReducer, useCallback, useMemo } from 'react';
import type { Contestant, ComparisonState, ContestantComparison } from '../types';

type Action =
  | { type: 'select'; contestant: Contestant }
  | { type: 'clear' }
  | { type: 'toggle' };

const initialState: ComparisonState = { isActive: false, contestants: [null, null] };

function reducer(state: ComparisonState, action: Action): ComparisonState {
  switch (action.type) {
    case 'select': {
      const { contestant } = action;
      if (!state.contestants[0]) return { ...state, contestants: [contestant, null] };
      if (!state.contestants[1] && state.contestants[0]?.id !== contestant.id) return { ...state, contestants: [state.contestants[0], contestant] };
      return state;
    }
    case 'clear':
      return { isActive: false, contestants: [null, null] };
    case 'toggle':
      return { isActive: !state.isActive, contestants: state.isActive ? [null, null] : state.contestants };
    default:
      return state;
  }
}

export const useComparison = () => {
  const [comparisonState, dispatch] = useReducer(reducer, initialState);

  const selectContestantForComparison = useCallback((contestant: Contestant) => {
    dispatch({ type: 'select', contestant });
  }, []);

  const clearComparison = useCallback(() => dispatch({ type: 'clear' }), []);

  const toggleComparisonMode = useCallback(() => dispatch({ type: 'toggle' }), []);

  const generateComparisonAnalysis = useMemo<ContestantComparison | null>(() => {
    const [c1, c2] = comparisonState.contestants;
    if (!c1 || !c2) return null;

    const season1 = typeof c1.season === 'number' ? c1.season : parseInt(String(c1.season || '0'));
    const season2 = typeof c2.season === 'number' ? c2.season : parseInt(String(c2.season || '0'));

    // Deterministic recommendation: prefer the contestant with higher id hash as a tie-breaker
    const rec = (() => {
      if (season1 < season2) return 'left';
      if (season2 < season1) return 'right';
      // fallback: compare id strings
      return String(c1.id) >= String(c2.id) ? 'left' : 'right';
    })();

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
        recommendation: rec
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
