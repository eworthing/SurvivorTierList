import { describe, it, expect } from 'vitest';
import { deepClone, calculateRankedCount } from '../src/utils.ts';

describe('deepClone', () => {
  it('clones plain objects', () => {
    const o = { a: 1, b: { c: 2 } };
    const c = deepClone(o);
    expect(c).not.toBe(o);
    expect(c.b).not.toBe(o.b);
    expect(c).toEqual(o);
  });

  it('clones arrays', () => {
    const a = [1, { x: 2 }];
    const c = deepClone(a);
    expect(c).not.toBe(a);
    expect(c[1]).not.toBe(a[1]);
    expect(c).toEqual(a);
  });
});

describe('calculateRankedCount', () => {
  it('counts non-unranked contestants', () => {
    const tiers = {
      S: [{ id: 'a' }, { id: 'b' }],
      A: [{ id: 'c' }],
      unranked: [{ id: 'd' }]
    };
    expect(calculateRankedCount(tiers)).toBe(3);
  });

  it('handles empty or missing tiers', () => {
    expect(calculateRankedCount({})).toBe(0);
    expect(calculateRankedCount(null)).toBe(0);
  });
});
