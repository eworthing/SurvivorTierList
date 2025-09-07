import { describe, it, expect } from 'vitest';
import { initHistory, saveSnapshot, undo, redo, getCurrent } from '../src/historyManager.ts';
import { reorderWithinTier } from '../src/tiers/index.ts';

describe('useTierOperations simulated reorderWithin integration', () => {
  it('applies reorderWithin and integrates with history undo/redo', () => {
    const initial = { S: [{ id: 'a' }, { id: 'b' }, { id: 'c' }], A: [], unranked: [] };
    let h = initHistory(initial);
    // apply reorder within S: move index 0 to 2
    const after = reorderWithinTier(getCurrent(h), 'S', 0, 2);
    h = saveSnapshot(h, after);
    expect(getCurrent(h).S.map(x => x.id)).toEqual(['b','c','a']);

    // undo should restore initial order
    h = undo(h);
    expect(getCurrent(h).S.map(x => x.id)).toEqual(['a','b','c']);

    // redo should reapply
    h = redo(h);
    expect(getCurrent(h).S.map(x => x.id)).toEqual(['b','c','a']);
  });
});
