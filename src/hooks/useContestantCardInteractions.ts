import React from 'react';
import { getDominantColorFromImage } from '../utils';
import { setDragAccentColor, pushStackId } from '../stores/uiStore';
import type { Contestant } from '../types';

type Args = {
  contestant: Contestant;
  quickRankMode?: boolean;
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
  onQuickRank?: (id: string, tier: string) => void;
  onSelect?: (c: Contestant) => void;
  isDragging?: boolean;
  onDominantColor?: (hex: string | null) => void;
  onWiggleUndo?: (id: string) => void;
  onStackForCompare?: (id: string) => void;
};

export default function useContestantCardInteractions({
  contestant,
  quickRankMode,
  onDragStart,
  onDragEnd,
  onQuickRank,
  onSelect,
  isDragging,
  onDominantColor,
  onWiggleUndo,
  onStackForCompare
}: Args) {
  const [showTiers, setShowTiers] = React.useState(false);
  const [imgSrc, setImgSrc] = React.useState(contestant.imageUrl || 'https://placehold.co/100x133?text=No+Image');
  const [longPressTimer, setLongPressTimer] = React.useState<number | null>(null);
  const [isDraggingMobile, setIsDraggingMobile] = React.useState(false);
  const [isPeeking, setIsPeeking] = React.useState(false);
  const [holdTimer, setHoldTimer] = React.useState<number | null>(null);
  const [isSettling, setIsSettling] = React.useState(false);
  const stackTimerRef = React.useRef<number | null>(null);

  // use store actions directly (small local store exports functions)

  const handleQuickRankClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    setShowTiers(!showTiers);
  };

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (quickRankMode) return handleQuickRankClick(e);
    if (onSelect) onSelect(contestant);
  };

  const handleTouchStart = () => {
    if (quickRankMode) return;
    const timer = window.setTimeout(() => {
      if ('vibrate' in navigator) navigator.vibrate(50);
      setShowTiers(true);
    }, 500);
    setLongPressTimer(timer);
    setIsDraggingMobile(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setIsDraggingMobile(false);
    if (!showTiers && !quickRankMode) handleClick(e);
  };

  const handleTouchMove = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (quickRankMode) return handleQuickRankClick(e);
      if (onSelect) onSelect(contestant);
    }
    if (quickRankMode && onQuickRank) {
      const tierMap: Record<string, string> = {
        '1': 'S', '2': 'A', '3': 'B', '4': 'C', '5': 'D', '6': 'F'
      };
      if (tierMap[e.key]) {
        e.preventDefault();
        onQuickRank(contestant.id, tierMap[e.key]);
      }
    }
  };

  const handleImageError = () => setImgSrc('https://placehold.co/100x133?text=No+Image');

  const handleMouseEnter = () => {
    const t = window.setTimeout(() => setIsPeeking(true), 220);
    setHoldTimer(t);
  };
  const handleMouseLeave = () => {
    if (holdTimer) { clearTimeout(holdTimer); setHoldTimer(null); }
    setIsPeeking(false);
  };

  React.useEffect(() => {
    if (!isDragging && !isDraggingMobile) return;
    let lastX: number | null = null;
    let movements = 0;
    const onMove = (ev: MouseEvent) => {
      if (lastX === null) { lastX = ev.clientX; return; }
      const dx = ev.clientX - lastX;
      lastX = ev.clientX;
      if (Math.abs(dx) > 6) movements++;
      if (movements >= 6) {
        try { onWiggleUndo?.(contestant.id); } catch {}
        movements = 0;
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [isDragging, isDraggingMobile, contestant.id, onWiggleUndo]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (stackTimerRef.current) window.clearTimeout(stackTimerRef.current);
    stackTimerRef.current = window.setTimeout(() => {
      try { onStackForCompare?.(contestant.id); } catch {}
    }, 900);
  };

  const handleDragLeaveCard = () => {
    if (stackTimerRef.current) { clearTimeout(stackTimerRef.current); stackTimerRef.current = null; }
  };

  // dnd-kit provides drag lifecycle via context; for native fallback we keep a simple no-op
  const handleDragStart = () => {
    if (onDragStart) onDragStart(contestant.id);
    if (onDominantColor && imgSrc) {
      getDominantColorFromImage(imgSrc).then(hex => {
        try { setDragAccentColor(hex); } catch {}
        try { onDominantColor?.(hex); } catch {}
      });
    }
  };

  const handleDragEnd = () => {
  if (onDragEnd) onDragEnd();
    setIsSettling(true);
    setTimeout(() => setIsSettling(false), 420);
  try { pushStackId(contestant.id); } catch {}
    try { onStackForCompare?.(contestant.id); } catch {}
  };

  return {
    // state
    showTiers,
    imgSrc,
    isPeeking,
    isSettling,
    isDraggingMobile,
    // handlers
    handleQuickRankClick,
    handleClick,
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove,
    handleKeyDown,
    handleImageError,
    handleMouseEnter,
    handleMouseLeave,
    handleDragEnter,
    handleDragLeaveCard,
    handleDragStart,
    handleDragEnd,
    setShowTiers,
  } as const;
}
