/* @vitest-environment jsdom */

import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

// Mock ContestantCard to simplify assertions (renders contestant.name)
vi.mock('../src/components/ContestantCard', async () => {
  const React = await import('react');
  return {
    default: ({ contestant }: any) => React.createElement('div', null, contestant.name),
  };
});

import UnrankedPanel from '../src/components/UnrankedPanel';
import type { Contestant } from '../src/types';

const makeContestant = (id: string, name = 'Name'): Contestant => ({ id, name, imageUrl: `/${id}.png`, meta: {} });

describe('UnrankedPanel', () => {
  afterEach(() => cleanup());

  it('renders contestants when present', () => {
    const a = makeContestant('a', 'Alice');
    const b = makeContestant('b', 'Bob');
    const setCollapsed = vi.fn();
    render(
      <UnrankedPanel
        filteredUnranked={[a, b]}
        unrankedCount={2}
        unrankedCollapsed={false}
        setUnrankedCollapsed={setCollapsed}
        showStats={false}
        handleDragStart={() => {}}
        handleDragEndWithClear={() => {}}
        draggedContestant={null}
        quickRankMode={false}
        handleQuickRankWithMode={() => {}}
        comparisonActive={false}
        selectContestantForComparison={() => {}}
        setSelectedContestant={() => {}}
        handleStackForCompare={() => {}}
        selectedContestant={null}
        consideredIds={new Set()}
      />
    );
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
  });

  it('calls setUnrankedCollapsed when toggle clicked', () => {
    const setCollapsed = vi.fn();
    render(
      <UnrankedPanel
        filteredUnranked={[]}
        unrankedCount={1}
        unrankedCollapsed={false}
        setUnrankedCollapsed={setCollapsed}
        showStats={false}
        handleDragStart={() => {}}
        handleDragEndWithClear={() => {}}
        draggedContestant={null}
        quickRankMode={false}
        handleQuickRankWithMode={() => {}}
        comparisonActive={false}
        selectContestantForComparison={() => {}}
        setSelectedContestant={() => {}}
        handleStackForCompare={() => {}}
        selectedContestant={null}
        consideredIds={new Set()}
      />
    );
    const btn = screen.getByText(/Collapse|Expand/);
    fireEvent.click(btn);
    expect(setCollapsed).toHaveBeenCalled();
  });

  it('shows all-ranked message when no contestants and count 0', () => {
    render(
      <UnrankedPanel
        filteredUnranked={[]}
        unrankedCount={0}
        unrankedCollapsed={false}
        setUnrankedCollapsed={() => {}}
        showStats={false}
        handleDragStart={() => {}}
        handleDragEndWithClear={() => {}}
        draggedContestant={null}
        quickRankMode={false}
        handleQuickRankWithMode={() => {}}
        comparisonActive={false}
        selectContestantForComparison={() => {}}
        setSelectedContestant={() => {}}
        handleStackForCompare={() => {}}
        selectedContestant={null}
        consideredIds={new Set()}
      />
    );
    expect(screen.getByText(/All contestants have been ranked! Great job!/i)).toBeTruthy();
  });
});
