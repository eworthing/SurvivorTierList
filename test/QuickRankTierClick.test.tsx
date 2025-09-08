/* @vitest-environment jsdom */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import TierRow from '../src/components/TierRow';
import type { Contestant } from '../src/types';

const makeContestant = (id: string): Contestant => ({ id, name: id, imageUrl: `/${id}.png`, meta: {} });

describe('QuickRank + tier click', () => {
  it('moves selected contestant when a tier zone is clicked while quickRankMode is active', () => {
    const mover = vi.fn();
    const setSelected = vi.fn();
    const c = makeContestant('a');
    // TierRow will call onSelect on the card mock; we simulate selection then zone click
  const { getByRole, getByLabelText } = render(
      <TierRow
        tierName="A"
        tierConfig={{ name: 'A', color: '', hexColor: '#000', description: '' } as any}
        contestants={[c]}
        onDragOver={() => {}}
        isDraggedOver={false}
        onAnalyzeTier={() => {}}
        showStats={false}
        onDragStart={() => {}}
        onDragEnd={() => {}}
        draggedContestant={null}
        onZoneClick={mover}
        quickRankMode={true}
        onQuickRank={() => {}}
        onSelect={(ct) => setSelected(ct)}
      />
    );

  // simulate selecting the contestant by clicking the card
  const card = getByLabelText(/a from Season/);
  fireEvent.click(card);
  expect(setSelected).toHaveBeenCalled();

  // simulate zone click (onZoneClick) — TierRow's zone click handler calls onZoneClick(tierName)
  const region = getByRole('region');
  fireEvent.click(region);
  expect(mover).toHaveBeenCalledWith('A');
  });
});
