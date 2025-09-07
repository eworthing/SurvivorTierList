import { describe, it, expect } from 'vitest';
import { moveContestant, validateTiersShape } from '../src/tiers/index.ts';

describe('moveContestant', () => {
  it('moves a contestant from unranked to S', () => {
    const tiers = { S: [], A: [], unranked: [{ id: 'a', name: 'A' }, { id: 'b' }] };
    const res = moveContestant(tiers, 'a', 'S');
    expect(res.S.length).toBe(1);
    expect(res.unranked.length).toBe(1);
    expect(res.S[0].id).toBe('a');
  });

  it('returns original if contestant not found', () => {
    const tiers = { S: [], unranked: [] };
    const res = moveContestant(tiers, 'x', 'A');
    expect(res).toBe(tiers);
  });

  it('no-op when moving within same tier', () => {
    const tiers = { S: [{ id: 'a' }], unranked: [] };
    const res = moveContestant(tiers, 'a', 'S');
    expect(res).toBe(tiers);
  });
});

describe('validateTiersShape', () => {
  it('validates good shape', () => {
    expect(validateTiersShape({ S: [], unranked: [] })).toBe(true);
  });
  it('rejects bad shape', () => {
    expect(validateTiersShape(null)).toBe(false);
    expect(validateTiersShape({ S: {}, unranked: [] })).toBe(false);
  });
});
