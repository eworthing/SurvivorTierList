/* @vitest-environment jsdom */

import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

// Mock ContestantCard to expose hooks for interaction
vi.mock('../src/components/ContestantCard', async () => {
  const React = await import('react');
  return {
    default: ({ contestant, isDragging, onDragStart, onDragEnd, onSelect, onQuickRank }: any) => (
      React.createElement('div', null,
        React.createElement('span', { 'data-testid': `name-${contestant.id}` }, contestant.name),
        React.createElement('button', { 'data-testid': `select-${contestant.id}`, onClick: () => onSelect && onSelect(contestant) }, 'select'),
        React.createElement('button', { 'data-testid': `dragstart-${contestant.id}`, onClick: () => onDragStart && onDragStart(contestant.id) }, 'dragstart'),
        React.createElement('button', { 'data-testid': `dragend-${contestant.id}`, onClick: () => onDragEnd && onDragEnd(contestant.id) }, 'dragend'),
        React.createElement('button', { 'data-testid': `quickrank-${contestant.id}`, onClick: () => onQuickRank && onQuickRank(contestant.id, 'X') }, 'quickrank'),
        isDragging ? React.createElement('span', { 'data-testid': `dragging-${contestant.id}` }, 'DRAGGING') : null
      )
    ),
  };
});

import TierRow from '../src/components/TierRow';
import type { Contestant } from '../src/types';

const makeContestant = (id: string, name = 'Name'): Contestant => ({ id, name, imageUrl: `/${id}.png`, meta: {} });

const baseTierConfig = { name: 'B', description: 'Below Average', color: 'from-slate-700 to-slate-900', hexColor: '#6b7280' } as any;

describe('TierRow interactions', () => {
  afterEach(() => cleanup());

  it('calls onAnalyzeTier when Analyze clicked', () => {
    const onAnalyze = vi.fn();
    render(
      <TierRow
        tierName="B"
        tierConfig={baseTierConfig}
        contestants={[makeContestant('a','Alice')]}
        onDragOver={() => {}}
        isDraggedOver={false}
        onAnalyzeTier={onAnalyze}
        showStats={false}
        onDragStart={() => {}}
        onDragEnd={() => {}}
        draggedContestant={null}
        onZoneClick={() => {}}
      />
    );

    const analyzeBtn = screen.getByTitle(/Analyze/i);
    fireEvent.click(analyzeBtn);
    expect(onAnalyze).toHaveBeenCalledWith('B', expect.any(Array));
  });

  it('calls onClearTier when Clear button clicked', () => {
    const onClear = vi.fn();
    render(
      <TierRow
        tierName="B"
        tierConfig={baseTierConfig}
        contestants={[makeContestant('a','Alice')]}
        onDragOver={() => {}}
        isDraggedOver={false}
        onAnalyzeTier={() => {}}
        showStats={false}
        onDragStart={() => {}}
        onDragEnd={() => {}}
        draggedContestant={null}
        onZoneClick={() => {}}
        onClearTier={onClear}
      />
    );

    const clearBtn = screen.getByLabelText(/Clear B tier/i);
    fireEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalledWith('B');
  });

  it('calls onZoneClick when main region clicked', () => {
    const onZone = vi.fn();
    render(
      <TierRow
        tierName="A"
        tierConfig={{ ...baseTierConfig, name: 'A' }}
        contestants={[]}
        onDragOver={() => {}}
        isDraggedOver={false}
        onAnalyzeTier={() => {}}
        showStats={false}
        onDragStart={() => {}}
        onDragEnd={() => {}}
        draggedContestant={null}
        onZoneClick={onZone}
      />
    );

    const region = screen.getByRole('region');
    fireEvent.click(region);
    expect(onZone).toHaveBeenCalledWith('A');
  });

  it('shows placeholder when no contestants for non-S tier', () => {
    render(
      <TierRow
        tierName="C"
        tierConfig={{ ...baseTierConfig, name: 'C' }}
        contestants={[]}
        onDragOver={() => {}}
        isDraggedOver={false}
        onAnalyzeTier={() => {}}
        showStats={false}
        onDragStart={() => {}}
        onDragEnd={() => {}}
        draggedContestant={null}
      />
    );

    expect(screen.getByText(/Drop C picks here.../i)).toBeTruthy();
  });

  it('shows S tier special text when S tier empty', () => {
    render(
      <TierRow
        tierName="S"
        tierConfig={{ ...baseTierConfig, name: 'S' }}
        contestants={[]}
        onDragOver={() => {}}
        isDraggedOver={false}
        onAnalyzeTier={() => {}}
        showStats={false}
        onDragStart={() => {}}
        onDragEnd={() => {}}
        draggedContestant={null}
      />
    );

    expect(screen.getByText(/Who is god-tier\?/i)).toBeTruthy();
  });

  it('passes select call through to onSelect from ContestantCard mock', () => {
    const onSelect = vi.fn();
    const c = makeContestant('x','Xeno');
    render(
      <TierRow
        tierName="B"
        tierConfig={baseTierConfig}
        contestants={[c]}
        onDragOver={() => {}}
        isDraggedOver={false}
        onAnalyzeTier={() => {}}
        showStats={false}
        onDragStart={() => {}}
        onDragEnd={() => {}}
        draggedContestant={null}
        onSelect={onSelect}
      />
    );

    const sel = screen.getByTestId(`select-${c.id}`);
    fireEvent.click(sel);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: c.id }));
  });
});
