import { useCallback, useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Contestant, Tiers, UserStats } from '../types';
import { deepClone } from '../utils';
import { moveContestant, clearTier as clearTierHelper, reorderWithinTier, randomizeIntoTiers } from '../tiers';
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
      const prev = prevTiers as Tiers;
      const newTiers = moveContestant(prev, contestantId, targetTierName);
      // If moveContestant returned the original object, assume no-op
      if (newTiers === prev) return prev;
      saveToHistory(newTiers);

      // Determine the moved contestant's id presence to infer source/target
      const moved = Object.values(newTiers).flat().find((c: Contestant) => c.id === contestantId) as Contestant | undefined;
      if (onAction && moved) onAction(`Moved ${moved.name || 'Contestant'} to ${targetTierName}`);
      if (targetTierName === 'unranked') {
        const wasInRanked = Object.values(prev).some((arr) => Array.isArray(arr) && (arr as Contestant[]).some((c) => c.id === contestantId));
        if (wasInRanked && moved && onReturnToUnranked) onReturnToUnranked([moved.id]);
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
    const newTiers = randomizeIntoTiers(currentContestants, tierNames);
    setTiers(deepClone(newTiers));
    saveToHistory(newTiers);
    if (onAction) onAction('Randomized tiers');
  }, [currentContestants, tierNames, saveToHistory, onAction]);

  const reorderWithin = useCallback((tierName: string, from: number, to: number) => {
    setTiers(prev => {
      const prevTiers = prev as Tiers;
      const next = reorderWithinTier(prevTiers, tierName, from, to);
      if (next === prevTiers) return prev;
      saveToHistory(next);
      return next;
    });
  }, [saveToHistory]);

  const handleQuickRank = useCallback((contestantId: string, tier: string) => {
    // Determine if unranked would be empty after this move based on current state
    const remainingUnranked = (tiers.unranked || []).filter((c: Contestant) => c.id !== contestantId).length;
    handleDrop(contestantId, tier);
    return remainingUnranked === 0; // Exit quick rank mode when no one remains unranked
  }, [handleDrop, tiers.unranked]);

  const clearTier = useCallback((tierName: string) => {
    setTiers(prev => {
      const prevTiers = prev as Tiers;
      const { tiers: newTiers, moved } = clearTierHelper(prevTiers, tierName);
      // if no change, return previous
      if (newTiers === prevTiers) return prev;
      saveToHistory(newTiers);
      if (onAction) onAction(`Cleared tier ${tierName} (${moved.length} moved to unranked)`);
      if (onReturnToUnranked && moved.length) onReturnToUnranked(moved.map((c: Contestant) => c.id));
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
  reorderWithin,
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
