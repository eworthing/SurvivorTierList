// SurvivorTierListUnifiedApp root component
import React, { useState, useCallback, useMemo, useRef } from 'react';
import './styles/tailwind.css';
import './styles/fonts.css';
import { createRoot } from 'react-dom/client';
// Capacitor SplashScreen: hide when the web app is ready
import { SplashScreen } from '@capacitor/splash-screen';
import Modal from './components/Modal';
import ErrorBoundary from './components/ErrorBoundary';
import VideoModal from './components/VideoModal';
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
import { nativeShare } from './hooks/useNativeShare';
import { exportTierImageAndShare } from './hooks/useImageShare';
import { usePWA } from './hooks/usePWA';

// Configuration
import { THEMES } from './config/themes';
import { DEFAULT_TIER_CONFIG } from './config/tierDefaults';
import { createRng } from './utils'; // single import (deduplicated)
import APP_ANIMATIONS from './styles/animations';
import { setDragAccentColor } from './stores/uiStore';
import { MESSAGES } from './constants/messages';
import { DndContext, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import AppToolbar from './components/AppToolbar';
import ComparisonPanel from './components/ComparisonPanel';
import UnrankedPanel from './components/UnrankedPanel';
import TierGrid from './components/TierGrid';

const SurvivorTierListUnifiedApp: React.FC = () => {
  const { contestantGroups } = useDataProcessing();

  // Hide the native splash screen once the initial data has been processed
  React.useEffect(() => {
    try {
      if (contestantGroups && Object.keys(contestantGroups).length > 0) {
        // Best-effort hide; ignore rejections
  SplashScreen.hide?.().catch?.(() => {});
      }
    } catch {
      // ignore when not running under Capacitor or API missing
    }
  }, [contestantGroups]);

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

  

  const { exportRanking, buildExportText, analyzeTier, saveToLocal, loadFromLocal, exportJSON, importJSON } = useExportImport();
  
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

  const handleNativeShare = useCallback(async () => {
    try {
      const text = await buildExportText(selectedGroupName, tiers as Record<string, Contestant[]>, currentTheme, tierConfig);
      const ok = await nativeShare({ text, title: 'Survivor Tier List' });
      if (ok) pushToast('Shared successfully'); else pushToast('Share not supported');
    } catch { pushToast('Share failed'); }
  }, [buildExportText, selectedGroupName, tiers, currentTheme, tierConfig, pushToast]);

  const handleShareImage = useCallback(async () => {
    const ok = await exportTierImageAndShare('#root');
    pushToast(ok ? 'Image shared' : 'Image share failed');
  }, [pushToast]);

  // Handle tier analysis with correct parameters  
  const handleAnalyzeTier = useCallback((tierName: string, contestants: Contestant[]) => {
    analyzeTier(tierName, contestants, tierConfig, setModalState);
  }, [analyzeTier, tierConfig, setModalState]);

  const handleOpenContestantStats = useCallback((c: Contestant) => {
    const content = `${c.name} — Season ${c.season}\n${c.status || ''}\n${c.bio ? '\n' + c.bio : ''}`;
    try { showStatsModal(content); } catch {}
  }, [showStatsModal]);

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

  // Handler to finish head-to-head and apply ranking into tiers
  const finishHeadToHead = useCallback(() => {
    try {
      // Stop the H2H loop
      headToHead.stop();
    } catch {}
    try {
      // Compute ranking from h2h and distribute into tiers in round-robin by score
      const ranking = headToHead.ranking || [];
      if (ranking.length === 0) return;
      // Create buckets for tier names in order
      const orderedTierNames = tierNames.slice();
      // We'll build new tiers from existing ones and append ranked contestants to top tiers
      const newTiers = structuredClone(tiers);
      // ensure arrays exist
      orderedTierNames.forEach(n => { if (!Array.isArray(newTiers[n])) newTiers[n] = []; });
      newTiers.unranked = newTiers.unranked || [];
      // Distribute ranked contestants into tiers round-robin starting at top
      for (let i = 0; i < ranking.length; i++) {
        const target = orderedTierNames[i % orderedTierNames.length];
        // remove from unranked if present
        const idx = (newTiers.unranked || []).findIndex((c: Contestant) => c.id === ranking[i].contestant.id);
        if (idx >= 0) newTiers.unranked.splice(idx, 1);
        newTiers[target].push(ranking[i].contestant);
      }
      // set tiers and snapshot history via setTiersFromLoad helper
      setTiersFromLoad(newTiers, false);
      // open modal to view ranking analysis
      try { showComparisonModal(); } catch {}
      pushToast('Head-to-head complete — ranking applied');
    } catch {
      try { pushToast('Failed to finish head-to-head'); } catch {}
    }
  }, [headToHead, tierNames, tiers, setTiersFromLoad, showComparisonModal, pushToast]);

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
        <AppToolbar
          selectedGroupName={selectedGroupName}
          contestantGroups={contestantGroups}
          setSelectedGroupName={setSelectedGroupName}
          progressInfo={progressInfo}
          isInstallable={isInstallable}
          undo={undo}
          redo={redo}
          historyCanUndo={HistoryManager.canUndo(history)}
          historyCanRedo={HistoryManager.canRedo(history)}
          comparisonActive={comparisonState.isActive}
          toggleComparisonMode={toggleComparisonMode}
          reset={reset}
          randomizeTiers={randomizeTiers}
          quickRankMode={quickRankMode}
          setQuickRankMode={setQuickRankMode}
          headToHeadActive={headToHead.isActive}
          headToHeadToggle={() => headToHead.isActive ? headToHead.stop() : headToHead.start()}
          showCustomizationModal={showCustomizationModal}
          handleExport={handleExport}
          onNativeShare={handleNativeShare}
          onShareImage={handleShareImage}
          handleExportJSON={handleExportJSON}
          handleImportJSON={handleImportJSON}
          handleSave={handleSave}
          handleLoad={handleLoad}
          handleStatsModal={handleStatsModal}
          takeSnapshot={takeSnapshot}
          restoreSnapshot={restoreSnapshot}
          clearSnapshot={clearSnapshot}
          snapshotExists={!!snapshotRef.current}
          showStats={showStats}
          setShowStats={setShowStats}
          currentTheme={currentTheme}
          setCurrentTheme={setCurrentTheme}
          sideMenuSide={sideMenuSide}
          setSideMenuSide={setSideMenuSide}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          allTags={allTags}
          activeTagFilters={activeTagFilters}
          setActiveTagFilters={setActiveTagFilters}
  />

        {/* Comparison Mode UI */}
        {comparisonState.isActive && (
          <ComparisonPanel
            contestants={comparisonState.contestants}
            onViewAnalysis={generateComparisonAnalysis ? showComparisonModal : undefined}
            onClear={clearComparison}
          />
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
          <TierGrid
            tierNames={tierNames}
            tierConfig={tierConfig}
            tiers={tiers as Record<string, import('./types').Contestant[]>}
            setDraggedOverTier={setDraggedOverTier}
            draggedOverTier={draggedOverTier}
            onAnalyzeTier={handleAnalyzeTier}
            showStats={showStats}
            handleDragStart={handleDragStart}
            handleDragEndWithClear={handleDragEndWithClear}
            draggedContestant={draggedContestant}
            moveSelectedToTier={moveSelectedToTier}
            quickRankMode={quickRankMode}
            handleQuickRankWithMode={handleQuickRankWithMode}
            comparisonActive={comparisonState.isActive}
            selectContestantForComparison={selectContestantForComparison}
            setSelectedContestant={setSelectedContestant}
            handleStackForCompare={handleStackForCompare}
            selectedContestant={selectedContestant}
            clearTier={clearTier}
            lastMovedIds={lastMovedIds}
            celebrateSTier={celebrateSTier}
            onOpenStats={handleOpenContestantStats}
          />
  </DndContext>

        <UnrankedPanel
          filteredUnranked={filteredUnranked}
          unrankedCount={unrankedContestants.length}
          unrankedCollapsed={unrankedCollapsed}
          setUnrankedCollapsed={setUnrankedCollapsed}
          showStats={showStats}
          handleDragStart={handleDragStart}
          handleDragEndWithClear={handleDragEndWithClear}
          draggedContestant={draggedContestant}
          quickRankMode={quickRankMode}
          handleQuickRankWithMode={handleQuickRankWithMode}
          comparisonActive={comparisonState.isActive}
          selectContestantForComparison={selectContestantForComparison}
          setSelectedContestant={setSelectedContestant}
          handleStackForCompare={handleStackForCompare}
          selectedContestant={selectedContestant}
          consideredIds={consideredIds}
          onOpenStats={handleOpenContestantStats}
        />
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
  <HeadToHeadMode h2h={headToHead} onClose={headToHead.stop} onFinish={finishHeadToHead} />
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

  // splash hide is handled after initial data processing (see above)
}

export default SurvivorTierListUnifiedApp;
