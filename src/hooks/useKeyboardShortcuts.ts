import { useEffect } from 'react';
import type { History, Contestant, ModalState } from '../types';
import * as HistoryManager from '../historyManager';

interface UseKeyboardShortcutsProps {
  history: History;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  setSelectedContestant: (c: Contestant | null) => void;
  setQuickRankMode: (mode: boolean | ((prev: boolean) => boolean)) => void;
  setModalState: (state: ModalState) => void;
}

export const useKeyboardShortcuts = ({
  history,
  undo,
  redo,
  reset,
  setSelectedContestant,
  setQuickRankMode,
  setModalState
}: UseKeyboardShortcutsProps) => {
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const isModifier = e.ctrlKey || e.metaKey || e.altKey;
      
      // Undo/Redo shortcuts
      if (isModifier && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (HistoryManager.canUndo(history)) undo();
      } else if ((isModifier && e.key === 'y') || (isModifier && e.shiftKey && e.key === 'Z')) {
        e.preventDefault();
        if (HistoryManager.canRedo(history)) redo();
      }
      
      // Quick actions
      if (!isModifier) {
        switch (e.key) {
          case 'r':
            e.preventDefault();
            reset();
            break;
          case 'q':
            e.preventDefault();
            setQuickRankMode(prev => !prev);
            break;
          case 'Escape':
            setSelectedContestant(null);
            setQuickRankMode(false);
            break;
          case '?':
            // Show help modal
            setModalState({
              isOpen: true,
              title: 'Keyboard Shortcuts Help',
              content: `
🎯 Quick Actions:
• Q - Toggle Quick Rank Mode
• R - Reset all rankings
• Escape - Cancel selection/quick rank

⌨️ Navigation:
• Tab - Navigate between elements
• Enter/Space - Select contestant
• 1-6 - Quick rank (in quick rank mode)

↩️ History:
• Ctrl/Cmd + Z - Undo
• Ctrl/Cmd + Y - Redo
• Ctrl/Cmd + Shift + Z - Redo

💡 Tip: Press ? to show this help anytime!
              `,
              size: 'default'
            });
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [history, undo, redo, reset, setSelectedContestant, setQuickRankMode, setModalState]);
};
