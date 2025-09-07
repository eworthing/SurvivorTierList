import { describe, it, expect } from 'vitest';
import { randomizeIntoTiers, reorderList } from '../src/tiers/index.ts';

describe('randomizeIntoTiers edge cases', () => {
  it('returns all contestants unranked when tierNames empty', () => {
    const contestants = [{ id: 'a' }, { id: 'b' }];
    const tiers = randomizeIntoTiers(contestants, []);
    expect(tiers).toEqual({ unranked: contestants });
  });
  it('handles no contestants gracefully', () => {
    const tiers = randomizeIntoTiers([], ['S','A']);
    expect(tiers.S).toEqual([]);
    expect(tiers.A).toEqual([]);
    expect(tiers.unranked).toEqual([]);
  });
});

describe('reorderList edge cases', () => {
  it('no-ops when indices out of range', () => {
    const list = ['a','b','c'];
    expect(reorderList(list, -1, 2)).toBe(list);
    expect(reorderList(list, 0, 5)).toBe(list);
  });
  it('no-ops when from === to', () => {
    const list = ['a','b','c'];
    expect(reorderList(list, 1, 1)).toBe(list);
  });
  it('reorders valid indices', () => {
    const list = ['a','b','c'];
    const res = reorderList(list, 0, 2);
    expect(res).toEqual(['b','c','a']);
  });
});
