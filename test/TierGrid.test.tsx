/* @vitest-environment jsdom */

import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';

// Mock TierRow to render a simple marker so we can assert render count and tierNames
vi.mock('../src/components/TierRow', async () => {
  const React = await import('react');
  return {
    default: ({ tierName }: any) => React.createElement('div', null, `ROW:${tierName}`),
  };
});

import TierGrid from '../src/components/TierGrid';
import type { Contestant } from '../src/types';

const makeContestant = (id: string, name = 'Name'): Contestant => ({ id, name, imageUrl: `/${id}.png`, meta: {} });

describe('TierGrid', () => {
  afterEach(() => cleanup());

  it('renders a TierRow for each tier name', () => {
    const tierNames = ['S', 'A', 'B'];
    const tiers: Record<string, Contestant[]> = {
      S: [makeContestant('a', 'Alice')],
      A: [makeContestant('b', 'Bob')],
      B: [],
    };

    const commonProps = {
      tierNames,
      tierConfig: { S: {}, A: {}, B: {} } as any,
      tiers,
      setDraggedOverTier: () => {},
      draggedOverTier: null,
      onAnalyzeTier: () => {},
      showStats: false,
      handleDragStart: () => {},
      handleDragEndWithClear: () => {},
      draggedContestant: null,
      moveSelectedToTier: () => {},
      quickRankMode: false,
      handleQuickRankWithMode: () => {},
      comparisonActive: false,
      selectContestantForComparison: () => {},
      setSelectedContestant: () => {},
      handleStackForCompare: () => {},
      selectedContestant: null,
      clearTier: () => {},
      lastMovedIds: [] as string[],
      celebrateSTier: false,
    } as const;

    render(<TierGrid {...commonProps} />);

    expect(screen.getByText('ROW:S')).toBeTruthy();
    expect(screen.getByText('ROW:A')).toBeTruthy();
    expect(screen.getByText('ROW:B')).toBeTruthy();
  });
});
