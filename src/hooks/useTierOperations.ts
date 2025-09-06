import { useCallback, useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Contestant, Tiers, UserStats } from '../types';
import { deepClone } from '../utils';
import * as HistoryManager from '../historyManager';

interface UseTierOperationsProps {
  currentContestants: Contestant[];
  tierNames: string[];
  setStats: Dispatch<SetStateAction<UserStats>>;
  setStartTime: (time: number) => void;
  onAction?: (description: string) => void; // optional side-effect hook for UI toasts
  onReturnToUnranked?: (ids: string[]) => void; // notify when contestants move back to unranked
}

export const useTierOperations = ({
  currentContestants,
  tierNames,
  setStats,
  setStartTime,
  onAction,
  onReturnToUnranked
}: UseTierOperationsProps) => {
  const [tiers, setTiers] = useState<Record<string, Contestant[]>>({});
  const [history, setHistory] = useState(() => HistoryManager.initHistory({}));
  const [draggedContestant, setDraggedContestant] = useState<string | null>(null);
  const [draggedOverTier, setDraggedOverTier] = useState<string | null>(null);

  // Initialize tiers when dependencies change
  useEffect(() => {
    const newTiers = { 
      ...Object.fromEntries(tierNames.map(name => [name, []])), 
      unranked: deepClone(currentContestants) 
    };
    setTiers(deepClone(newTiers));
    const initialHistory = HistoryManager.initHistory(newTiers);
    setHistory(initialHistory);
    setStartTime(Date.now());
  }, [tierNames, currentContestants, setStartTime]);

  const saveToHistory = useCallback((newTiers: Tiers) => {
    setHistory(prev => HistoryManager.saveSnapshot(prev, newTiers));
  }, []);

  const handleDrop = useCallback((contestantId: string, targetTierName: string) => {
    if (!contestantId || !targetTierName) return;
    setTiers(prevTiers => {
      const newTiers = deepClone(prevTiers);
      let sourceTierName: string | null = null;
      let contestantToMove: Contestant | null = null;
      
      for (const [tierName, contestantsRaw] of Object.entries(newTiers)) {
        const contestants = Array.isArray(contestantsRaw) ? (contestantsRaw as Contestant[]) : [];
        const idx = contestants.findIndex((c) => c.id === contestantId);
        if (idx !== -1) {
          sourceTierName = tierName;
          contestantToMove = contestants[idx];
          newTiers[tierName] = [...contestants.slice(0, idx), ...contestants.slice(idx + 1)];
          break;
        }
      }
      
      if (!contestantToMove || sourceTierName === targetTierName) return prevTiers;
      if (!Array.isArray(newTiers[targetTierName])) newTiers[targetTierName] = [];
      newTiers[targetTierName] = [...newTiers[targetTierName], contestantToMove];
      saveToHistory(newTiers);
      if (onAction && contestantToMove) {
        onAction(`Moved ${contestantToMove.name || 'Contestant'} to ${targetTierName}`);
      }
      // Notify when a contestant returns to unranked from a ranked tier
      if (targetTierName === 'unranked' && sourceTierName && sourceTierName !== 'unranked') {
        if (onAction) onAction(`${contestantToMove.name || 'Contestant'} returned to unranked`);
        if (onReturnToUnranked) onReturnToUnranked([contestantToMove.id]);
      }
      return newTiers;
    });
    setDraggedOverTier(null); 
    setDraggedContestant(null);
  }, [saveToHistory, onAction, onReturnToUnranked]);

  const handleDragStart = useCallback((contestantId: string) => setDraggedContestant(contestantId), []);
  const handleDragEnd = useCallback(() => { 
    setDraggedContestant(null); 
    setDraggedOverTier(null); 
  }, []);

  const undo = useCallback(() => {
    setHistory(prev => {
      if (!HistoryManager.canUndo(prev)) return prev;
      const next = HistoryManager.undo(prev);
      setTiers(HistoryManager.getCurrent(next));
      setStats(s => ({ ...s, undoCount: (s.undoCount || 0) + 1 }));
      return next;
    });
  }, [setStats]);

  const redo = useCallback(() => {
    setHistory(prev => {
      if (!HistoryManager.canRedo(prev)) return prev;
      const next = HistoryManager.redo(prev);
      setTiers(HistoryManager.getCurrent(next));
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    const resetTiers = { 
      ...Object.fromEntries(tierNames.map(name => [name, []])), 
      unranked: deepClone(currentContestants) 
    };
    setTiers(deepClone(resetTiers));
    saveToHistory(resetTiers);
    setStartTime(Date.now());
    if (onAction) onAction('Reset all tiers');
  }, [currentContestants, saveToHistory, tierNames, setStartTime, onAction]);

  const randomizeTiers = useCallback(() => {
    const shuffled = deepClone(currentContestants).sort(() => Math.random() - 0.5);
    const newTiers: Tiers = {
      ...Object.fromEntries(tierNames.map(name => [name, []])),
      unranked: []
    };
    shuffled.forEach((contestant: Contestant, index: number) => {
      const tierIndex = Math.floor(index / Math.ceil(shuffled.length / tierNames.length));
      const tierName = tierNames[Math.min(tierIndex, tierNames.length - 1)];
      if (newTiers[tierName]) newTiers[tierName].push(contestant);
    });
    setTiers(deepClone(newTiers));
    saveToHistory(newTiers);
    if (onAction) onAction('Randomized tiers');
  }, [currentContestants, tierNames, saveToHistory, onAction]);

  const handleQuickRank = useCallback((contestantId: string, tier: string) => {
    // Determine if unranked would be empty after this move based on current state
    const remainingUnranked = (tiers.unranked || []).filter((c: Contestant) => c.id !== contestantId).length;
    handleDrop(contestantId, tier);
    return remainingUnranked === 0; // Exit quick rank mode when no one remains unranked
  }, [handleDrop, tiers.unranked]);

  const clearTier = useCallback((tierName: string) => {
    setTiers(prev => {
      if (!prev[tierName] || prev[tierName].length === 0) return prev;
      const newTiers = deepClone(prev);
      const moved = newTiers[tierName];
      newTiers[tierName] = [];
      newTiers.unranked = [...(newTiers.unranked || []), ...moved];
      saveToHistory(newTiers);
      if (onAction) onAction(`Cleared tier ${tierName} (${moved.length} moved to unranked)`);
      if (onReturnToUnranked && moved.length) onReturnToUnranked(moved.map(c => c.id));
      return newTiers;
    });
  }, [saveToHistory, onAction, onReturnToUnranked]);

  return {
    tiers,
    history,
    draggedContestant,
    draggedOverTier,
    handleDrop,
    handleDragStart,
    handleDragEnd,
    undo,
    redo,
    reset,
    randomizeTiers,
    handleQuickRank,
    setDraggedOverTier,
  clearTier,
    // Allow loading tiers from persisted state and reset history accordingly
    setTiersFromLoad: (loaded: Tiers, resetHistory = true) => {
      setTiers(deepClone(loaded));
      if (resetHistory) {
        const h = HistoryManager.initHistory(loaded);
        setHistory(h);
      } else {
        saveToHistory(loaded);
      }
    }
  };
};
