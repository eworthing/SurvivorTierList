/* @vitest-environment jsdom */

import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';

import AppToolbar from '../src/components/AppToolbar';

const baseProps = {
  selectedGroupName: 'default',
  contestantGroups: { default: [], alt: [] },
  setSelectedGroupName: vi.fn(),
  progressInfo: { rankedCount: 0, totalCount: 2 },
  isInstallable: true,
  undo: vi.fn(),
  redo: vi.fn(),
  historyCanUndo: false,
  historyCanRedo: false,
  comparisonActive: false,
  toggleComparisonMode: vi.fn(),
  reset: vi.fn(),
  randomizeTiers: vi.fn(),
  quickRankMode: false,
  setQuickRankMode: vi.fn(),
  headToHeadActive: false,
  headToHeadToggle: vi.fn(),
  showCustomizationModal: vi.fn(),
  handleExport: vi.fn(),
  handleExportJSON: vi.fn(),
  handleImportJSON: vi.fn(),
  handleSave: vi.fn(),
  handleLoad: vi.fn(),
  handleStatsModal: vi.fn(),
  takeSnapshot: vi.fn(),
  restoreSnapshot: vi.fn(),
  clearSnapshot: vi.fn(),
  snapshotExists: false,
  showStats: false,
  setShowStats: vi.fn(),
  currentTheme: 'survivor',
  setCurrentTheme: vi.fn(),
  sideMenuSide: 'left' as const,
  setSideMenuSide: vi.fn(),
  searchQuery: '',
  setSearchQuery: vi.fn(),
  allTags: ['tag1'],
  activeTagFilters: [],
  setActiveTagFilters: vi.fn(),
};

describe('AppToolbar', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders title and progress', () => {
    render(<AppToolbar {...baseProps} />);
    expect(screen.getByText(/Survivor Tier Ranking Pro/i)).toBeTruthy();
    expect(screen.getByText(/0 \/ 2 Ranked/i)).toBeTruthy();
  });

  it('calls toggleComparisonMode when Compare clicked', () => {
    const toggle = vi.fn();
    render(<AppToolbar {...baseProps} toggleComparisonMode={toggle} />);
    const btn = screen.getByText(/Compare/i);
    fireEvent.click(btn);
    expect(toggle).toHaveBeenCalled();
  });

  it('toggles quick rank mode when Quick Rank clicked', () => {
    const setQuick = vi.fn();
    render(<AppToolbar {...baseProps} quickRankMode={false} setQuickRankMode={setQuick} />);
  const btn = screen.getByRole('button', { name: /Quick Rank/i });
    fireEvent.click(btn);
    expect(setQuick).toHaveBeenCalledWith(true);
  });

  it('renders tags and allows toggling them', () => {
    const setTags = vi.fn();
    render(<AppToolbar {...baseProps} setActiveTagFilters={setTags} activeTagFilters={[]} allTags={["one","two"]} />);
    const tagBtn = screen.getByText('one');
    fireEvent.click(tagBtn);
    expect(setTags).toHaveBeenCalled();
  });
});
