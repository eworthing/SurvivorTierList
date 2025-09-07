// SurvivorTierListUnifiedApp root component
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import Modal from './components/Modal';
import ContestantCard from './components/ContestantCard';
import ErrorBoundary from './components/ErrorBoundary';
import VideoModal from './components/VideoModal';
import TierRow from './components/TierRow';
import ModalContentRenderer from './components/ModalContentRenderer';
import QuickRankMobile from './components/QuickRankMobile';
import PWAInstallBanner from './components/PWAInstallBanner';
import SideQuickDropMenu from './components/SideQuickDropMenu';
import HeadToHeadMode from './components/HeadToHeadMode';
import { useHeadToHead } from './hooks/useHeadToHead';
import Toasts, { ToastData } from './components/Toasts';
import type { Contestant, TierConfig, UserStats } from './types';
import * as HistoryManager from './historyManager';

// Hooks
import { useDataProcessing } from './hooks/useDataProcessing';
import { useAchievements } from './hooks/useAchievements';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useComparison } from './hooks/useComparison';
import { useTierOperations } from './hooks/useTierOperations';
import { useModalManagement } from './hooks/useModalManagement';
import { useExportImport } from './hooks/useExportImport';
import { usePWA } from './hooks/usePWA';

// Configuration
import { THEMES } from './config/themes';
import { DEFAULT_TIER_CONFIG } from './config/tierDefaults';
import { createRng } from './utils'; // single import (deduplicated)
import APP_ANIMATIONS from './styles/animations';
import { setDragAccentColor } from './stores/uiStore';
import { MESSAGES } from './constants/messages';
import { DndContext, DragStartEvent, DragEndEvent } from '@dnd-kit/core';

const SurvivorTierListUnifiedApp: React.FC = () => {
  const { contestantGroups } = useDataProcessing();

  // --- State management ---
  const [selectedGroupName, setSelectedGroupName] = useState<string>(Object.keys(contestantGroups)[0] || 'All Contestants');
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null);
  const currentContestants = useMemo(() => contestantGroups[selectedGroupName] || [], [selectedGroupName, contestantGroups]);
  const [tierConfig, setTierConfig] = useState<TierConfig>(DEFAULT_TIER_CONFIG);
  const tierNames = useMemo(() => Object.keys(tierConfig), [tierConfig]);
  const [currentTheme, setCurrentTheme] = useState('survivor');
  const [showStats, setShowStats] = useState(false);
  const [quickRankMode, setQuickRankMode] = useState(false);
  const [stats, setStats] = useState<UserStats>({ totalRankings: 0, totalTime: 0, undoCount: 0, shareCount: 0, rankings: [] });
  const [startTime, setStartTime] = useState(() => Date.now());
  const [showQuickRankMobile, setShowQuickRankMobile] = useState(false);
  const [selectedForMobileRank, setSelectedForMobileRank] = useState<Contestant | null>(null);
  const [sideMenuSide, setSideMenuSide] = useState<'left' | 'right'>('right');
  const [unrankedCollapsed, setUnrankedCollapsed] = useState(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);
  const [lastMovedIds, setLastMovedIds] = useState<string[]>([]);
  const [celebrateSTier, setCelebrateSTier] = useState(false);
  const [sTierCelebrated, setSTierCelebrated] = useState(false);
  const [consideredIds, setConsideredIds] = useState<Set<string>>(new Set());
  const [confettiPieces, setConfettiPieces] = useState<{ id: number; left: number; delay: number; duration: number; color: string; size: number; }[]>([]);
  const confettiStyleInjectedRef = useRef(false);
  const rngRef = useRef<() => number>(createRng());
  const [stackSelectedIds, setStackSelectedIds] = useState<string[]>([]);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<number | null>(null);
  // Session-only snapshot (not persisted)
  const snapshotRef = useRef<{ tiers: Record<string, Contestant[]> } | null>(null);
  // derive snapshot presence instead of storing redundant state

  const pushToast = useCallback((message: string) => {
    const id = Date.now() + Math.floor(rngRef.current() * 1000);
    setToasts(prev => [...prev, { id, message, ttl: 3500 }]);
  }, []);
  const removeToast = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  // Listen for broadcast notification events (decoupled modules can trigger toasts)
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { message?: string } | undefined;
      if (detail?.message) pushToast(detail.message);
    };
    window.addEventListener('tierlist:notify', handler as EventListener);
    return () => window.removeEventListener('tierlist:notify', handler as EventListener);
  }, [pushToast]);

  // Custom hooks for complex functionality
  const {
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
    setTiersFromLoad
  } = useTierOperations({
    currentContestants,
  tierNames,
  setStats,
  setStartTime,
  onAction: pushToast,
  onReturnToUnranked: (ids) => setConsideredIds(prev => new Set([...Array.from(prev), ...ids]))
  , rng: rngRef.current });

  const headToHead = useHeadToHead({ contestants: tiers.unranked || [], rng: rngRef.current });

  const { statsContent } = useAchievements(tiers, currentContestants, stats, startTime);
  
  const {
    comparisonState,
    selectContestantForComparison,
    clearComparison,
    toggleComparisonMode,
    generateComparisonAnalysis
  } = useComparison();

  const {
    modalState,
    videoModalState,
    setModalState,
    showCustomizationModal,
    showStatsModal,
    showComparisonModal,
    closeModal,
    closeVideoModal,
    confirm
  } = useModalManagement();

  

  const handleStackForCompare = useCallback((id: string) => {
    // accumulate up to two stacked ids; when two are present open comparison
    setStackSelectedIds(prev => {
      const already = prev.includes(id);
      const next = already ? prev : [...prev, id].slice(-2);
      if (next.length === 2) {
        // find contestant objects and select both for comparison, then open modal
        const all = Object.values(tiers).flat();
        const a = all.find((c: Contestant) => c.id === next[0]);
        const b = all.find((c: Contestant) => c.id === next[1]);
        if (a && b) {
          selectContestantForComparison(a);
          selectContestantForComparison(b);
          // use modal function from hook to open comparison UI
    if (typeof window.requestAnimationFrame === 'function') {
            // schedule to avoid state timing issues
            window.requestAnimationFrame(() => {
              try { showComparisonModal(); } catch { /* ignore */ }
            });
          } else {
            try { showComparisonModal(); } catch { /* ignore */ }
          }
        }
      }
      return next;
    });
  }, [tiers, selectContestantForComparison, showComparisonModal]);

  // Keep a short-lived watch on stack selections so the state is considered used and auto-clears
  React.useEffect(() => {
    if (!stackSelectedIds || stackSelectedIds.length === 0) return;
    const t = window.setTimeout(() => setStackSelectedIds([]), 4000);
    return () => clearTimeout(t);
  }, [stackSelectedIds]);

  

  const { exportRanking, analyzeTier, saveToLocal, loadFromLocal, exportJSON, importJSON } = useExportImport();
  
  // PWA functionality
  const { isInstallable, installPWA, dismissInstallPrompt } = usePWA();

  // Use keyboard shortcuts hook
  useKeyboardShortcuts({
    undo,
    redo,
    reset,
    history,
    setQuickRankMode,
    setSelectedContestant,
    setModalState
  });

  // Handle export with correct parameters
  const handleExport = useCallback(() => {
    exportRanking(selectedGroupName, tiers, currentTheme, tierConfig);
  }, [exportRanking, selectedGroupName, tiers, currentTheme, tierConfig]);

  // Handle tier analysis with correct parameters  
  const handleAnalyzeTier = useCallback((tierName: string, contestants: Contestant[]) => {
    analyzeTier(tierName, contestants, tierConfig, setModalState);
  }, [analyzeTier, tierConfig, setModalState]);

  // Persistence: autosave on changes
  React.useEffect(() => {
    saveToLocal(selectedGroupName, tiers as Record<string, Contestant[]>, currentTheme, tierConfig);
  }, [saveToLocal, selectedGroupName, tiers, currentTheme, tierConfig]);

  // Offer restore from local on mount
  React.useEffect(() => {
    const saved = loadFromLocal();
    if (!saved) return;
    if (saved.group === selectedGroupName) {
      setTierConfig(saved.tierConfig);
      setTiersFromLoad(saved.tiers, true);
      if (saved.theme && THEMES[saved.theme]) setCurrentTheme(saved.theme);
    } else {
      // Defer confirm to next tick so initial paint happens first
      setTimeout(() => {
        confirm({
          message: `Restore saved ranking for group "${saved.group}"?`,
          title: 'Restore Ranking',
          confirmLabel: 'Restore',
          cancelLabel: 'Ignore'
        }).then(ok => {
          if (!ok) return;
          if (contestantGroups[saved.group]) setSelectedGroupName(saved.group);
          setTierConfig(saved.tierConfig);
          setTiersFromLoad(saved.tiers, true);
          if (saved.theme && THEMES[saved.theme]) setCurrentTheme(saved.theme);
        });
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Manual save/load/export/import handlers
  const handleSave = useCallback(() => {
    const ok = saveToLocal(selectedGroupName, tiers as Record<string, Contestant[]>, currentTheme, tierConfig);
  if (ok) pushToast(MESSAGES.RANKING_SAVED);
  }, [saveToLocal, selectedGroupName, tiers, currentTheme, tierConfig, pushToast]);

  const handleLoad = useCallback(() => {
    const saved = loadFromLocal();
  if (!saved) { pushToast(MESSAGES.NO_SAVED_FOUND); return; }
    if (contestantGroups[saved.group]) setSelectedGroupName(saved.group);
    setTierConfig(saved.tierConfig);
    setTiersFromLoad(saved.tiers, true);
    if (saved.theme && THEMES[saved.theme]) setCurrentTheme(saved.theme);
  pushToast(MESSAGES.RANKING_LOADED);
  }, [loadFromLocal, contestantGroups, setTierConfig, setTiersFromLoad, pushToast]);

  const handleExportJSON = useCallback(() => {
    exportJSON({ group: selectedGroupName, theme: currentTheme, tierConfig, tiers });
  }, [exportJSON, selectedGroupName, currentTheme, tierConfig, tiers]);

  const handleImportJSON = useCallback(async () => {
    const result = await importJSON();
    if (!result) return;
    if (contestantGroups[result.group]) setSelectedGroupName(result.group);
    setTierConfig(result.tierConfig);
    setTiersFromLoad(result.tiers, true);
    if (result.theme && THEMES[result.theme]) setCurrentTheme(result.theme);
  }, [importJSON, contestantGroups, setTierConfig, setTiersFromLoad]);

  // Handle stats modal
  const handleStatsModal = useCallback(() => {
    showStatsModal(statsContent);
  }, [showStatsModal, statsContent]);

  // (Video modal handler removed; no longer used)

  // Handle quick rank with proper return handling
  const handleQuickRankWithMode = useCallback((contestantId: string, tier: string) => {
    const shouldExitQuickRank = handleQuickRank(contestantId, tier);
    if (shouldExitQuickRank) {
      setQuickRankMode(false);
    }
  }, [handleQuickRank, setQuickRankMode]);

  const handleMobileQuickRankSelect = useCallback((tierName: string) => {
    if (selectedForMobileRank) {
      handleQuickRankWithMode(selectedForMobileRank.id, tierName);
    }
    setShowQuickRankMobile(false);
    setSelectedForMobileRank(null);
  }, [selectedForMobileRank, handleQuickRankWithMode]);

  const handleMobileQuickRankCancel = useCallback(() => {
    setShowQuickRankMobile(false);
    setSelectedForMobileRank(null);
  }, []);

  // Session snapshot (lightweight alternative to full save)
  const takeSnapshot = useCallback(() => {
    snapshotRef.current = { tiers: structuredClone(tiers) as Record<string, Contestant[]> };
    pushToast('Snapshot captured');
  }, [tiers, pushToast]);

  const restoreSnapshot = useCallback(() => {
    if (!snapshotRef.current) return;
    setTiersFromLoad(snapshotRef.current.tiers, false); // add to history stack for undo
    pushToast('Snapshot restored');
  }, [setTiersFromLoad, pushToast]);

  const clearSnapshot = useCallback(() => {
    snapshotRef.current = null;
    pushToast('Snapshot cleared');
  }, [pushToast]);

  const moveSelectedToTier = useCallback((tierName: string) => {
    if (!selectedContestant) return;
    handleDrop(selectedContestant.id, tierName);
    setSelectedContestant(null);
  }, [selectedContestant, handleDrop]);

  // Memoize unranked contestants to avoid recalculation
  const unrankedContestants = useMemo(() => tiers.unranked || [], [tiers.unranked]);
  const allTags = useMemo(() => {
    const set = new Set<string>();
    unrankedContestants.forEach(c => {
      const tags = (c as unknown as { tags?: string[] }).tags;
      if (Array.isArray(tags)) tags.forEach(t => set.add(t));
    });
    return Array.from(set).sort();
  }, [unrankedContestants]);

  const filteredUnranked = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return unrankedContestants.filter(c => {
      const nameMatch = !q || (c.name || '').toLowerCase().includes(q);
      const tags: string[] = Array.isArray((c as unknown as { tags?: string[] }).tags) ? (c as unknown as { tags?: string[] }).tags! : [];
      const tagMatch = activeTagFilters.length === 0 || activeTagFilters.every(t => tags.includes(t));
      return nameMatch && tagMatch; 
    });
  }, [unrankedContestants, searchQuery, activeTagFilters]);

  // Persist search and tag filters across sessions (lightweight)
  React.useEffect(() => {
    const saved = localStorage.getItem('stl_filters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.q === 'string') setSearchQuery(parsed.q);
        if (Array.isArray(parsed.tags)) setActiveTagFilters(parsed.tags.filter((t: unknown) => typeof t === 'string'));
      } catch {}
    }
  }, []);
  React.useEffect(() => {
    localStorage.setItem('stl_filters', JSON.stringify({ q: searchQuery, tags: activeTagFilters }));
  }, [searchQuery, activeTagFilters]);
  
  // Memoize progress calculation
  const progressInfo = useMemo(() => {
    const rankedCount = currentContestants.length - unrankedContestants.length;
    return { rankedCount, totalCount: currentContestants.length };
  }, [currentContestants.length, unrankedContestants.length]);

  // DnD onDragEnd will capture destination and invoke handleDrop + highlight

  const handleDragEndWithClear = useCallback(() => {
  // clear transient UI store state (stack) then forward drag end
  setStackSelectedIds([]);
  handleDragEnd();
  }, [handleDragEnd]);

  // Auto clear highlight after fade duration
  React.useEffect(() => {
    if (lastMovedIds.length === 0) return;
    const t = setTimeout(() => setLastMovedIds([]), 1200);
    return () => clearTimeout(t);
  }, [lastMovedIds]);

  // One-time S tier celebration when first card added
  React.useEffect(() => {
    const sTier = (tiers && typeof tiers === 'object' && 'S' in tiers) ? (tiers as Record<string, Contestant[]>).S : undefined;
    if (!sTierCelebrated && sTier && sTier.length === 1) {
      setCelebrateSTier(true);
      setSTierCelebrated(true);
      // Generate confetti pieces
      const colors = ['#f87171', '#fb923c', '#fbbf24', '#34d399', '#38bdf8', '#a78bfa', '#f472b6'];
      const r = rngRef.current;
      const pieces = Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        left: Math.round((r() * 100) * 100) / 100, // percentage with 2 decimals
        delay: Math.round((r() * 0.3) * 1000) / 1000,
        duration: Math.round((1.2 + r() * 0.8) * 1000) / 1000,
        color: colors[Math.floor(r() * colors.length)],
        size: Math.round((6 + r() * 10) * 100) / 100
      }));
      setConfettiPieces(pieces);
      const t = setTimeout(() => setCelebrateSTier(false), 1800);
      return () => clearTimeout(t);
    }
  }, [tiers, sTierCelebrated]);

  // Inject keyframes once
  React.useEffect(() => {
    if (confettiStyleInjectedRef.current) return;
    const style = document.createElement('style');
    style.textContent = APP_ANIMATIONS;
    document.head.appendChild(style);
    confettiStyleInjectedRef.current = true;
  }, []);

  // Idle breathing detection (no drag/drop/interaction for 6s)
  React.useEffect(() => {
    const resetIdle = () => {
      if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
      setIsIdle(false);
      idleTimerRef.current = window.setTimeout(() => setIsIdle(true), 6000);
    };
    const events = ['mousemove', 'keydown', 'touchstart', 'pointerdown', 'dragstart', 'dragend'];
    events.forEach(ev => window.addEventListener(ev, resetIdle));
    resetIdle();
    return () => events.forEach(ev => window.removeEventListener(ev, resetIdle));
  }, []);
  
  return (
  <div className={`min-h-screen ${THEMES[currentTheme].bg} text-white p-4 sm:p-6 ${isIdle ? 'stl-breathe' : ''}`}>
      <Modal isOpen={modalState.isOpen} onClose={closeModal} title={modalState.title} size={modalState.size}>
        <ModalContentRenderer
          modalState={modalState}
          tierConfig={tierConfig}
          setTierConfig={setTierConfig}
          onClose={closeModal}
          generateComparisonAnalysis={generateComparisonAnalysis}
        />
      </Modal>
      <VideoModal isOpen={videoModalState.isOpen} onClose={closeVideoModal} videoUrl={videoModalState.videoUrl} contestantName={videoModalState.contestantName} />
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-6 sm:mb-8">
          <h1 className={`text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${THEMES[currentTheme].accent} mb-4`}>🏝️ Survivor Tier Ranking Pro</h1>
          <p className="text-slate-400 mb-4">The ultimate family-friendly tier ranking experience!</p>
          <div className="flex justify-center items-center gap-4 mb-4 flex-wrap">
            <select value={selectedGroupName} onChange={(e) => setSelectedGroupName(e.target.value)} className="bg-slate-800 border border-slate-700 text-white text-base rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none">
              {Object.keys(contestantGroups).map(groupName => (
                <option key={groupName} value={groupName}>{groupName}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-center items-center gap-2 mb-4 flex-wrap">
            <div className="bg-slate-800 px-3 py-1 rounded-lg text-sm">Progress: {progressInfo.rankedCount} / {progressInfo.totalCount} Ranked</div>
            {/* Thin progress bar */}
            <div className="w-40 h-2 bg-slate-700 rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${progressInfo.totalCount === 0 ? 0 : (progressInfo.rankedCount / progressInfo.totalCount) * 100}%` }}
                aria-label="Ranking progress"
              />
            </div>
            {/* Mobile usage tip */}
            <div className="block md:hidden bg-blue-800/60 px-3 py-1 rounded-lg text-sm">
              💡 Tap & hold contestants to drag, or tap for quick rank
            </div>
            {/* PWA status indicator */}
            {isInstallable && (
              <div className="hidden md:block bg-green-800/60 px-3 py-1 rounded-lg text-sm">
                📱 App can be installed
              </div>
            )}
          </div>
          <div className="flex justify-center flex-wrap gap-2 sm:gap-3 mb-4">
            <button onClick={undo} disabled={!HistoryManager.canUndo(history)} className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">↶ Undo</button>
            <button onClick={redo} disabled={!HistoryManager.canRedo(history)} className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">Redo ↷</button>
            <button onClick={toggleComparisonMode} className={`${comparisonState.isActive ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-600 hover:bg-slate-700'} text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation`}>⚖️ Compare</button>
            <button onClick={reset} className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">Reset</button>
            <button onClick={randomizeTiers} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">Randomize</button>
            <button onClick={() => setQuickRankMode(!quickRankMode)} className={`bg-gray-600 hover:bg-gray-700 text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation ${quickRankMode ? 'ring-2 ring-sky-400' : ''}`}>⚡ Quick Rank</button>
            <button onClick={() => headToHead.isActive ? headToHead.stop() : headToHead.start()} className={`bg-gray-600 hover:bg-gray-700 text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation ${headToHead.isActive ? 'ring-2 ring-green-400' : ''}`}>🆚 H2H</button>
          </div>
          <div className="flex justify-center flex-wrap gap-2 sm:gap-3 mb-4">
            <button onClick={showCustomizationModal} className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">🎨 Customize</button>
            <button onClick={handleExport} className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">📤 Export</button>
            <button onClick={handleExportJSON} className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">🗂 Export JSON</button>
            <button onClick={handleImportJSON} className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">📥 Import JSON</button>
            <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">💾 Save</button>
            <button onClick={handleLoad} className="bg-slate-600 hover:bg-slate-700 text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">📂 Load</button>
            <button onClick={handleStatsModal} className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">📊 Stats</button>
            <button onClick={takeSnapshot} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">📸 Snapshot</button>
            <button onClick={restoreSnapshot} disabled={!snapshotRef.current} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900/50 disabled:cursor-not-allowed text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">↩️ Restore</button>
            <button onClick={clearSnapshot} disabled={!snapshotRef.current} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900/50 disabled:cursor-not-allowed text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">🗑 Clear Snap</button>
          </div>
          <div className="flex justify-center flex-wrap gap-2 sm:gap-3">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={showStats} onChange={() => setShowStats(!showStats)} className="form-checkbox h-5 w-5 text-sky-600 bg-gray-800 border-gray-600 rounded focus:ring-sky-500" />Show Stats</label>
            <select value={currentTheme} onChange={(e) => setCurrentTheme(e.target.value)} className="bg-slate-800 border border-slate-700 text-white text-sm rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none">{Object.entries(THEMES).map(([id, theme]) => (<option key={id} value={id}>{theme.name}</option>))}</select>
            <select
              aria-label="Quick drop menu side"
              value={sideMenuSide}
              onChange={(e) => setSideMenuSide(e.target.value as 'left' | 'right')}
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="left">Menu: Left</option>
              <option value="right">Menu: Right</option>
            </select>
            <input
              type="text"
              placeholder="Search unranked..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              style={{ minWidth: '160px' }}
            />
          </div>
          {allTags.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {allTags.map(tag => {
                const active = activeTagFilters.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => setActiveTagFilters(prev => active ? prev.filter(t => t !== tag) : [...prev, tag])}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${active ? 'bg-sky-600 border-sky-400 text-white' : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'}`}
                  >{tag}</button>
                );
              })}
              {activeTagFilters.length > 0 && (
                <button
                  onClick={() => setActiveTagFilters([])}
                  className="text-xs px-2 py-1 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-500"
                >Clear Tags</button>
              )}
            </div>
          )}
        </header>

        {/* Comparison Mode UI */}
        {comparisonState.isActive && (
          <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-purple-500">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-purple-400">Comparison Mode Active</h3>
              <p className="text-slate-400">Click contestants to compare them side by side</p>
            </div>
            
            {comparisonState.contestants[0] || comparisonState.contestants[1] ? (
              <div className="flex justify-center gap-4 mb-4">
                <div className="text-center">
                  {comparisonState.contestants[0] ? (
                    <div className="bg-slate-700 p-3 rounded-lg">
                      <img src={comparisonState.contestants[0].imageUrl} alt={comparisonState.contestants[0].name} className="w-16 h-16 rounded-full mx-auto mb-2" />
                      <div className="text-white font-semibold">{comparisonState.contestants[0].name}</div>
                    </div>
                  ) : (
                    <div className="bg-slate-700/50 border-2 border-dashed border-slate-500 p-3 rounded-lg w-24 h-24 flex items-center justify-center text-slate-500">
                      Select 1st
                    </div>
                  )}
                </div>
                
                <div className="flex items-center text-2xl text-purple-400">VS</div>
                
                <div className="text-center">
                  {comparisonState.contestants[1] ? (
                    <div className="bg-slate-700 p-3 rounded-lg">
                      <img src={comparisonState.contestants[1].imageUrl} alt={comparisonState.contestants[1].name} className="w-16 h-16 rounded-full mx-auto mb-2" />
                      <div className="text-white font-semibold">{comparisonState.contestants[1].name}</div>
                    </div>
                  ) : (
                    <div className="bg-slate-700/50 border-2 border-dashed border-slate-500 p-3 rounded-lg w-24 h-24 flex items-center justify-center text-slate-500">
                      Select 2nd
                    </div>
                  )}
                </div>
              </div>
            ) : null}
            
            <div className="flex justify-center gap-2">
              {generateComparisonAnalysis && (
                <button 
                  onClick={showComparisonModal}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all"
                >
                  📊 View Analysis
                </button>
              )}
              <button onClick={clearComparison} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all">
                Clear
              </button>
            </div>
          </div>
        )}

        <DndContext
          onDragStart={(e: DragStartEvent) => {
            // forward to existing handler when starting drag (id is active.id)
            try {
              const id = String(e.active.id);
              if (id) handleDragStart(id as string);
            } catch {}
          }}
          onDragEnd={(e: DragEndEvent) => {
            try {
              const activeId = String(e.active?.id || '');
              const overId = e.over?.id;
              type UnknownObj = { [k: string]: unknown };
              const activeDataRaw: unknown = e.active?.data as unknown;
              let activeData: UnknownObj | null = null;
              if (activeDataRaw && typeof activeDataRaw === 'object' && 'current' in (activeDataRaw as UnknownObj)) {
                const tmp = activeDataRaw as UnknownObj;
                if (tmp.current && typeof tmp.current === 'object') activeData = tmp.current as UnknownObj;
              }

              // If the active carries sortable data with tierName/index and over is another item id => intra-tier reorder
              if (activeData && typeof activeData === 'object' && 'tierName' in activeData && typeof activeData.index === 'number' && overId && !String(overId).startsWith('tier-')) {
                const sourceTier = String(activeData['tierName']);
                const from = Number(activeData['index']);
                const toId = String(overId);
                const to = (tiers[sourceTier] || []).findIndex((c: Contestant) => c.id === toId);
                if (to >= 0 && typeof reorderWithin === 'function') {
                  reorderWithin(sourceTier, from, to);
                  setLastMovedIds([activeId]);
                  try { setDragAccentColor(null); } catch {}
                  try { handleDragEndWithClear(); } catch {}
                  return;
                }
              }

              // fallback: drop onto tier zone id like `tier-<name>`
              if (overId && String(overId).startsWith('tier-')) {
                const tierName = String(overId).replace(/^tier-/, '');
                if (activeId) {
                  setLastMovedIds([activeId]);
                  handleDrop(activeId, tierName);
                  try { setDragAccentColor(null); } catch {}
                }
              }
            } catch {}
            // keep existing cleanup behavior
            try { handleDragEndWithClear(); } catch {}
          }}
        >
          <main className="space-y-2 sm:space-y-3">
          {tierNames.map(tierName => (
              <TierRow 
              key={tierName} 
              tierName={tierName} 
              tierConfig={tierConfig[tierName]} 
              contestants={tiers[tierName] || []} 
              onDragOver={setDraggedOverTier} 
              isDraggedOver={draggedOverTier === tierName} 
              dragAccentColor={null}
              onAnalyzeTier={handleAnalyzeTier} 
              showStats={showStats} 
              onDragStart={handleDragStart} 
              onDragEnd={handleDragEndWithClear} 
              draggedContestant={draggedContestant} 
              onZoneClick={moveSelectedToTier}
              quickRankMode={quickRankMode}
              onQuickRank={handleQuickRankWithMode}
              onSelect={comparisonState.isActive ? selectContestantForComparison : (c: Contestant) => setSelectedContestant(c)}
              onStackForCompare={handleStackForCompare}
              selectedContestant={selectedContestant}
              onClearTier={clearTier}
              highlightIds={lastMovedIds}
              celebrateSTier={tierName === 'S' && celebrateSTier}
            />
          ))}
  </main>
  </DndContext>

        <footer className="text-center mt-8">
          <div className="mb-4 bg-slate-800 rounded-lg p-2">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold text-slate-300 flex items-center gap-2">📍 Unranked Contestants
                <span className="text-xs font-normal text-slate-400">({unrankedContestants.length} remaining)</span>
              </h2>
              <button
                onClick={() => setUnrankedCollapsed(c => !c)}
                className="text-slate-300 text-xs bg-slate-700/60 hover:bg-slate-600 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
                aria-expanded={!unrankedCollapsed}
              >{unrankedCollapsed ? 'Expand' : 'Collapse'}</button>
            </div>
            {!unrankedCollapsed && (
              <div className="mt-2 flex flex-wrap justify-center gap-3 min-h-[120px]">
                {filteredUnranked.length > 0 ? filteredUnranked.map(contestant => (
                  <ContestantCard
                    key={contestant.id}
                    contestant={contestant}
                    showStats={showStats}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEndWithClear}
                    isDragging={draggedContestant === contestant.id}
                    quickRankMode={quickRankMode}
                    onQuickRank={handleQuickRankWithMode}
                    onSelect={comparisonState.isActive ? selectContestantForComparison : (c: Contestant) => setSelectedContestant(c)}
                    onStackForCompare={handleStackForCompare}
                    isSelected={selectedContestant?.id === contestant.id}
                    wasConsidered={consideredIds.has(contestant.id)}
                    
                  />
                )) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    {unrankedContestants.length === 0 ? 'All contestants have been ranked! Great job!' : 'No matches for current search / filters'}
                  </div>
                )}
              </div>
            )}
          </div>
        </footer>
      </div>
      
  {/* Mobile Components */}
      <QuickRankMobile 
        isVisible={showQuickRankMobile}
        tierConfig={tierConfig}
        onTierSelect={handleMobileQuickRankSelect}
        onCancel={handleMobileQuickRankCancel}
        selectedContestantName={selectedForMobileRank?.name}
      />
      
      {/* PWA Install Banner */}
      <PWAInstallBanner 
        isVisible={isInstallable}
        onInstall={installPWA}
        onDismiss={dismissInstallPrompt}
      />

      {/* Side quick drop menu (desktop/tablet) */}
      <SideQuickDropMenu
        side={sideMenuSide}
        tierNames={tierNames}
        tierConfig={tierConfig}
      />

  {/* Head-to-Head Voting Overlay */}
  <HeadToHeadMode h2h={headToHead} onClose={headToHead.stop} />
  <Toasts toasts={toasts} remove={removeToast} />
      {celebrateSTier && confettiPieces.length > 0 && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          {confettiPieces.map(p => (
            <span
              key={p.id}
              style={{
                position: 'absolute',
                top: '-10px',
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size * 0.6}px`,
                background: p.color,
                borderRadius: '2px',
                animation: `stlConfettiFall ${p.duration}s cubic-bezier(.25,.61,.45,.94) ${p.delay}s forwards`,
                boxShadow: '0 0 4px rgba(0,0,0,0.2)'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

//  Mount the app using React 18 createRoot
const rootEl = document.getElementById('root');
if (rootEl) {
  const root = createRoot(rootEl);
  root.render(
    <ErrorBoundary>
      <SurvivorTierListUnifiedApp />
    </ErrorBoundary>
  );
}

export default SurvivorTierListUnifiedApp;
