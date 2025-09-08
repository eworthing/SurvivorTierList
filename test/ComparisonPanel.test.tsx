/* @vitest-environment jsdom */

import React from 'react';
import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ComparisonPanel from '../src/components/ComparisonPanel';
import type { Contestant } from '../src/types';

const makeContestant = (id: string, name = 'Name'): Contestant => ({
  id,
  name,
  imageUrl: `/${id}.png`,
  meta: {},
});

describe('ComparisonPanel', () => {
  afterEach(() => cleanup());
  it('renders empty state and clear button works', () => {
    const onClear = vi.fn();
    render(<ComparisonPanel contestants={[null, null]} onClear={onClear} />);
  expect(screen.getByText(/Comparison Mode Active/i)).toBeTruthy();
    const clearBtn = screen.getByText(/Clear/i);
    fireEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalled();
  });

  it('renders single contestant and shows select placeholder for the other', () => {
    const a = makeContestant('a', 'Alice');
    render(<ComparisonPanel contestants={[a, null]} onClear={() => {}} />);
  expect(screen.getByText('Alice')).toBeTruthy();
  expect(screen.getByText(/Select 2nd/i)).toBeTruthy();
  });

  it('renders both contestants and calls analysis callback when present', () => {
    const a = makeContestant('a', 'Alice');
    const b = makeContestant('b', 'Bob');
    const onView = vi.fn();
    render(<ComparisonPanel contestants={[a, b]} onViewAnalysis={onView} onClear={() => {}} />);
  expect(screen.getByText('Alice')).toBeTruthy();
  expect(screen.getByText('Bob')).toBeTruthy();
    const viewBtn = screen.getByText(/View Analysis/i);
    fireEvent.click(viewBtn);
    expect(onView).toHaveBeenCalled();
  });
});
