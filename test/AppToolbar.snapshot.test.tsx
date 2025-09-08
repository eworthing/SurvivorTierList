/* @vitest-environment jsdom */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AppToolbar from '../src/components/AppToolbar';

const baseProps = {
  selectedGroupName: 'default',
  contestantGroups: { default: [], alt: [] },
  setSelectedGroupName: () => {},
  progressInfo: { rankedCount: 1, totalCount: 2 },
  isInstallable: false,
  undo: () => {},
  redo: () => {},
  historyCanUndo: false,
  historyCanRedo: false,
  comparisonActive: false,
  toggleComparisonMode: () => {},
  reset: () => {},
  randomizeTiers: () => {},
  quickRankMode: false,
  setQuickRankMode: () => {},
  headToHeadActive: false,
  headToHeadToggle: () => {},
  showCustomizationModal: () => {},
  handleExport: () => {},
  handleExportJSON: () => {},
  handleImportJSON: () => {},
  handleSave: () => {},
  handleLoad: () => {},
  handleStatsModal: () => {},
  takeSnapshot: () => {},
  restoreSnapshot: () => {},
  clearSnapshot: () => {},
  snapshotExists: false,
  showStats: false,
  setShowStats: () => {},
  currentTheme: 'survivor',
  setCurrentTheme: () => {},
  sideMenuSide: 'left' as const,
  setSideMenuSide: () => {},
  searchQuery: '',
  setSearchQuery: () => {},
  allTags: [],
  activeTagFilters: [],
  setActiveTagFilters: () => {},
};

describe('AppToolbar snapshot', () => {
  it('matches snapshot', () => {
    const { container } = render(<AppToolbar {...baseProps} />);
    expect(container).toMatchSnapshot();
  });
});
