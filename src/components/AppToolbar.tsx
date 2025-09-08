import React from 'react';
import type { Contestant } from '../types';
import { THEMES } from '../config/themes';

type Props = {
  selectedGroupName: string;
  contestantGroups: Record<string, Contestant[]>;
  setSelectedGroupName: (s: string) => void;
  progressInfo: { rankedCount: number; totalCount: number };
  isInstallable: boolean;
  undo: () => void;
  redo: () => void;
  historyCanUndo: boolean;
  historyCanRedo: boolean;
  comparisonActive: boolean;
  toggleComparisonMode: () => void;
  reset: () => void;
  randomizeTiers: () => void;
  quickRankMode: boolean;
  setQuickRankMode: (v: boolean) => void;
  headToHeadActive: boolean;
  headToHeadToggle: () => void;
  showCustomizationModal: () => void;
  handleExport: () => void;
  handleExportJSON: () => void;
  handleImportJSON: () => void;
  handleSave: () => void;
  handleLoad: () => void;
  handleStatsModal: () => void;
  takeSnapshot: () => void;
  restoreSnapshot: () => void;
  clearSnapshot: () => void;
  snapshotExists: boolean;
  showStats: boolean;
  setShowStats: (v: boolean) => void;
  currentTheme: string;
  setCurrentTheme: (t: string) => void;
  sideMenuSide: 'left' | 'right';
  setSideMenuSide: (s: 'left' | 'right') => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  allTags: string[];
  activeTagFilters: string[];
  setActiveTagFilters: (f: string[] | ((prev: string[]) => string[])) => void;
};

export default function AppToolbar(props: Props) {
  const p = props;
  return (
    <header className="text-center mb-6 sm:mb-8">
      <h1 className={`text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${THEMES[p.currentTheme].accent} mb-4`}>🏝️ Survivor Tier Ranking Pro</h1>
      <p className="text-slate-400 mb-4">The ultimate family-friendly tier ranking experience!</p>
      <div className="flex justify-center items-center gap-4 mb-4 flex-wrap">
        <select value={p.selectedGroupName} onChange={(e) => p.setSelectedGroupName(e.target.value)} className="bg-slate-800 border border-slate-700 text-white text-base rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none">
          {Object.keys(p.contestantGroups).map(groupName => (
            <option key={groupName} value={groupName}>{groupName}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-center items-center gap-2 mb-4 flex-wrap">
        <div className="bg-slate-800 px-3 py-1 rounded-lg text-sm">Progress: {p.progressInfo.rankedCount} / {p.progressInfo.totalCount} Ranked</div>
        <div className="w-40 h-2 bg-slate-700 rounded overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${p.progressInfo.totalCount === 0 ? 0 : (p.progressInfo.rankedCount / p.progressInfo.totalCount) * 100}%` }}
            aria-label="Ranking progress"
          />
        </div>
        <div className="block md:hidden bg-blue-800/60 px-3 py-1 rounded-lg text-sm">💡 Tap & hold contestants to drag, or tap for quick rank</div>
        {p.isInstallable && (<div className="hidden md:block bg-green-800/60 px-3 py-1 rounded-lg text-sm">📱 App can be installed</div>)}
      </div>
      <div className="flex justify-center flex-wrap gap-2 sm:gap-3 mb-4">
        <button onClick={p.undo} disabled={!p.historyCanUndo} className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">↶ Undo</button>
        <button onClick={p.redo} disabled={!p.historyCanRedo} className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">Redo ↷</button>
        <button onClick={p.toggleComparisonMode} className={`${p.comparisonActive ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-600 hover:bg-slate-700'} text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation`}>⚖️ Compare</button>
        <button onClick={p.reset} className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">Reset</button>
        <button onClick={p.randomizeTiers} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">Randomize</button>
        <button onClick={() => p.setQuickRankMode(!p.quickRankMode)} className={`bg-gray-600 hover:bg-gray-700 text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation ${p.quickRankMode ? 'ring-2 ring-sky-400' : ''}`}>⚡ Quick Rank</button>
        <button onClick={p.headToHeadToggle} className={`bg-gray-600 hover:bg-gray-700 text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation ${p.headToHeadActive ? 'ring-2 ring-green-400' : ''}`}>🆚 H2H</button>
      </div>
      <div className="flex justify-center flex-wrap gap-2 sm:gap-3 mb-4">
        <button onClick={p.showCustomizationModal} className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">🎨 Customize</button>
        <button onClick={p.handleExport} className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">📤 Export</button>
        <button onClick={p.handleExportJSON} className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">🗂 Export JSON</button>
        <button onClick={p.handleImportJSON} className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">📥 Import JSON</button>
        <button onClick={p.handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">💾 Save</button>
        <button onClick={p.handleLoad} className="bg-slate-600 hover:bg-slate-700 text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">📂 Load</button>
        <button onClick={p.handleStatsModal} className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">📊 Stats</button>
        <button onClick={p.takeSnapshot} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">📸 Snapshot</button>
        <button onClick={p.restoreSnapshot} disabled={!p.snapshotExists} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900/50 disabled:cursor-not-allowed text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">↩️ Restore</button>
        <button onClick={p.clearSnapshot} disabled={!p.snapshotExists} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900/50 disabled:cursor-not-allowed text-white font-bold px-3 py-3 sm:px-3 sm:py-2 text-sm rounded-lg transition-all shadow-lg min-h-[44px] touch-manipulation">🗑 Clear Snap</button>
      </div>
      <div className="flex justify-center flex-wrap gap-2 sm:gap-3">
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={p.showStats} onChange={() => p.setShowStats(!p.showStats)} className="form-checkbox h-5 w-5 text-sky-600 bg-gray-800 border-gray-600 rounded focus:ring-sky-500" />Show Stats</label>
        <select value={p.currentTheme} onChange={(e) => p.setCurrentTheme(e.target.value)} className="bg-slate-800 border border-slate-700 text-white text-sm rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none">{Object.entries(THEMES).map(([id, theme]) => (<option key={id} value={id}>{theme.name}</option>))}</select>
        <select aria-label="Quick drop menu side" value={p.sideMenuSide} onChange={(e) => p.setSideMenuSide(e.target.value as 'left' | 'right')} className="bg-slate-800 border border-slate-700 text-white text-sm rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none">
          <option value="left">Menu: Left</option>
          <option value="right">Menu: Right</option>
        </select>
        <input type="text" placeholder="Search unranked..." value={p.searchQuery} onChange={(e) => p.setSearchQuery(e.target.value)} className="bg-slate-800 border border-slate-700 text-white text-sm rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none" style={{ minWidth: '160px' }} />
      </div>
      {p.allTags.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {p.allTags.map(tag => {
            const active = p.activeTagFilters.includes(tag);
            return (
              <button key={tag} onClick={() => p.setActiveTagFilters(prev => active ? prev.filter(t => t !== tag) : [...prev, tag])} className={`text-xs px-2 py-1 rounded-full border transition-colors ${active ? 'bg-sky-600 border-sky-400 text-white' : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'}`}>{tag}</button>
            );
          })}
          {p.activeTagFilters.length > 0 && (
            <button onClick={() => p.setActiveTagFilters([])} className="text-xs px-2 py-1 rounded-full border bg-red-600 text-white">Clear tags</button>
          )}
        </div>
      )}
    </header>
  );
}
