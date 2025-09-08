/* @vitest-environment jsdom */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import ContestantCard from '../src/components/ContestantCard';
const c = { id: 'x', name: 'X', imageUrl: '/x.png', meta: {} } as any;

describe('ContestantCard long press', () => {
  it('calls onOpenStats after long touch start', () => {
    vi.useFakeTimers();
    const onOpen = vi.fn();
  const { getAllByLabelText } = render(<ContestantCard contestant={c} onOpenStats={onOpen} /> as any);
  const btn = getAllByLabelText(/X from Season/)[0];
    fireEvent.touchStart(btn);
    // advance past 500ms threshold
    vi.advanceTimersByTime(510);
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'x' }));
    vi.useRealTimers();
  });

  it('does not call onOpenStats if touch end happens sooner', () => {
    vi.useFakeTimers();
    const onOpen = vi.fn();
  const { getAllByLabelText } = render(<ContestantCard contestant={c} onOpenStats={onOpen} /> as any);
  const btn = getAllByLabelText(/X from Season/)[0];
    fireEvent.touchStart(btn);
    vi.advanceTimersByTime(200);
    fireEvent.touchEnd(btn);
    vi.advanceTimersByTime(400);
    expect(onOpen).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
