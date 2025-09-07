import { describe, it, expect } from 'vitest';
import { moveContestant, clearTier, reorderList, reorderWithinTier, randomizeIntoTiers } from '../src/tiers/index.ts';

const sample = () => ({
  S: [{ id: 'a', name: 'A' }],
  A: [{ id: 'b', name: 'B' }],
  unranked: [{ id: 'c', name: 'C' }]
});

describe('tiers helpers', () => {
  it('moveContestant moves contestant between tiers', () => {
    const t = sample();
    const out = moveContestant(t, 'b', 'S');
    expect(out.S.find(c => c.id === 'b')).toBeTruthy();
    expect(out.A.find(c => c.id === 'b')).toBeFalsy();
  });

  it('clearTier moves items to unranked and returns moved list', () => {
    const t = sample();
    const { tiers: out, moved } = clearTier(t, 'A');
    expect(moved.length).toBe(1);
    expect(out.A.length).toBe(0);
    expect(out.unranked.find(c => c.id === 'b')).toBeTruthy();
  });

  it('reorderList moves element positions', () => {
    const arr = [1,2,3,4];
    const out = reorderList(arr, 1, 3);
    expect(out).toEqual([1,3,4,2]);
  });

  it('reorderWithinTier reorders contestants inside a tier', () => {
    const t = sample();
    const many = { ...t, S: [{ id: 'x' }, { id: 'y' }, { id: 'z' }] };
    const out = reorderWithinTier(many, 'S', 0, 2);
    expect(out.S.map(c => c.id)).toEqual(['y','z','x']);
  });

  it('randomizeIntoTiers distributes contestants across tiers', () => {
    const contestants = Array.from({ length: 10 }, (_, i) => ({ id: `c${i}`, name: `C${i}` }));
    // deterministic rng for test
    let seed = 1;
    const rng = () => {
      // simple LCG
      seed = (seed * 16807) % 2147483647;
      return (seed % 1000) / 1000;
    };
    const tiers = randomizeIntoTiers(contestants, ['S','A','B'], rng);
    const total = Object.values(tiers).flat().length;
    // all contestants should be placed (unranked stays empty)
    expect(total).toBe(10);
    expect(tiers.unranked.length).toBe(0);
  });
});
