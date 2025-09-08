/* @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { applyH2HRanking } from '../src/utils/h2h';

const makeC = (id: string) => ({ id, name: `N${id}`, imageUrl: `/${id}.png`, meta: {} });

describe('h2h helper', () => {
  it('distributes ranking into tiers round-robin and removes from unranked', () => {
    const tiers = { unranked: [makeC('a'), makeC('b'), makeC('c')], S: [], A: [] } as any;
    const ranking = [{ contestant: makeC('a') }, { contestant: makeC('b') }, { contestant: makeC('c') }];
    const out = applyH2HRanking(tiers, ['S', 'A'], ranking);
    expect(out.S.length + out.A.length).toBe(3);
    expect(out.unranked.length).toBe(0);
    // round robin: indices 0->S,1->A,2->S
    expect(out.S.map((c: any) => c.id)).toEqual(['a', 'c']);
    expect(out.A.map((c: any) => c.id)).toEqual(['b']);
  });
});
