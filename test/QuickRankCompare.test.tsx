/* @vitest-environment jsdom */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import ContestantCard from '../src/components/ContestantCard';
const c = { id: 'z', name: 'Z', imageUrl: '/z.png', meta: {} } as any;

describe('QuickRank + Compare selection', () => {
  it('allows selecting for comparison while quickRankMode is active', () => {
    const selectForCompare = vi.fn();
    const { getByRole } = render(<ContestantCard contestant={c} quickRankMode={true} onSelect={selectForCompare} /> as any);
    const btn = getByRole('button');
    fireEvent.click(btn);
    expect(selectForCompare).toHaveBeenCalledWith(expect.objectContaining({ id: 'z' }));
  });
});
