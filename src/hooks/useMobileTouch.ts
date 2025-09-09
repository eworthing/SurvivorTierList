import { useCallback, useState, useRef, useEffect } from 'react';
import type { Contestant } from '../types';

interface UseMobileTouchProps {
  onDrop: (contestantId: string, targetTierName: string) => void;
  onQuickRank?: (contestantId: string, tier: string) => void;
  quickRankMode: boolean;
}

interface TouchState {
  isDragging: boolean;
  draggedContestant: Contestant | null;
  touchStartPos: { x: number; y: number } | null;
  longPressTimer: ReturnType<typeof setTimeout> | null;
  dragPreview: { x: number; y: number } | null;
}

export const useMobileTouch = ({ onDrop, onQuickRank, quickRankMode }: UseMobileTouchProps) => {
  const [touchState, setTouchState] = useState<TouchState>({
    isDragging: false,
    draggedContestant: null,
    touchStartPos: null,
    longPressTimer: null,
    dragPreview: null
  });

  const dragPreviewRef = useRef<HTMLDivElement>(null);

  // Long press threshold (500ms)
  const LONG_PRESS_THRESHOLD = 500;
  const DRAG_THRESHOLD = 10; // pixels to start drag

  const handleTouchStart = useCallback((e: TouchEvent, contestant: Contestant) => {
    e.preventDefault();
    const touch = e.touches[0];
    
    // If in quick rank mode, handle tap for quick ranking
    if (quickRankMode && onQuickRank) {
      // Show quick rank menu or handle directly
      return;
    }

    const touchStartPos = { x: touch.clientX, y: touch.clientY };
    
    // Start long press timer
    const timer = setTimeout(() => {
      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      setTouchState(prev => ({
        ...prev,
        isDragging: true,
        draggedContestant: contestant,
        dragPreview: touchStartPos
      }));
    }, LONG_PRESS_THRESHOLD);

    setTouchState(prev => ({
      ...prev,
      touchStartPos,
      longPressTimer: timer
    }));
  }, [quickRankMode, onQuickRank]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchState.touchStartPos) return;

    const touch = e.touches[0];
    const currentPos = { x: touch.clientX, y: touch.clientY };
    
    // Check if moved enough to cancel long press
    const distance = Math.sqrt(
      Math.pow(currentPos.x - touchState.touchStartPos.x, 2) +
      Math.pow(currentPos.y - touchState.touchStartPos.y, 2)
    );

    if (distance > DRAG_THRESHOLD && touchState.longPressTimer) {
      clearTimeout(touchState.longPressTimer);
      setTouchState(prev => ({
        ...prev,
        longPressTimer: null
      }));
    }

    // Update drag preview position if dragging
    if (touchState.isDragging) {
      e.preventDefault();
      setTouchState(prev => ({
        ...prev,
        dragPreview: currentPos
      }));
    }
  }, [touchState.touchStartPos, touchState.longPressTimer, touchState.isDragging]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    // Clear long press timer
    if (touchState.longPressTimer) {
      clearTimeout(touchState.longPressTimer);
    }

    if (touchState.isDragging && touchState.draggedContestant) {
      // Find drop target
      const touch = e.changedTouches[0];
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const dropZone = elementBelow?.closest('[data-tier-name]') as HTMLElement;
      
      if (dropZone && dropZone.dataset.tierName) {
        onDrop(touchState.draggedContestant.id, dropZone.dataset.tierName);
        
        // Haptic feedback for successful drop
        if ('vibrate' in navigator) {
          navigator.vibrate([50, 50, 50]);
        }
      }
    }

    // Reset touch state
    setTouchState({
      isDragging: false,
      draggedContestant: null,
      touchStartPos: null,
      longPressTimer: null,
      dragPreview: null
    });
  }, [touchState.isDragging, touchState.draggedContestant, touchState.longPressTimer, onDrop]);

  // Swipe gesture detection
  const handleSwipeGesture = useCallback((startPos: { x: number; y: number }, endPos: { x: number; y: number }) => {
    const deltaX = endPos.x - startPos.x;
    const deltaY = endPos.y - startPos.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Horizontal swipe (minimum 100px, more horizontal than vertical)
    if (absDeltaX > 100 && absDeltaX > absDeltaY * 2) {
      if (deltaX > 0) {
        return 'swipe-right';
      } else {
        return 'swipe-left';
      }
    }

    // Vertical swipe
    if (absDeltaY > 100 && absDeltaY > absDeltaX * 2) {
      if (deltaY > 0) {
        return 'swipe-down';
      } else {
        return 'swipe-up';
      }
    }

    return null;
  }, []);

  // Quick rank touch handler
  const handleQuickRankTouch = useCallback((contestant: Contestant, tierName: string) => {
    if (onQuickRank) {
      onQuickRank(contestant.id, tierName);
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
    }
  }, [onQuickRank]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (touchState.longPressTimer) {
        clearTimeout(touchState.longPressTimer);
      }
    };
  }, [touchState.longPressTimer]);

  return {
    touchState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleSwipeGesture,
    handleQuickRankTouch,
    dragPreviewRef
  };
};
