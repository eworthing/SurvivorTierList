import { describe, it, expect } from 'vitest';
import { initHistory, saveSnapshot, undo, redo, getCurrent } from '../src/historyManager.ts';
import { moveContestant } from '../src/tierUtils.ts';

describe('history + move integration', () => {
  it('saves snapshots, moves contestant, and allows undo/redo', () => {
    const initial = { S: [], A: [], unranked: [{ id: 'c1', name: 'Alice' }, { id: 'c2', name: 'Bob' }] };
    let h = initHistory(initial, 10);
    // move Alice to S
    const afterMove = moveContestant(getCurrent(h), 'c1', 'S');
    h = saveSnapshot(h, afterMove);
    expect(getCurrent(h).S.length).toBe(1);
    // undo
    h = undo(h);
    expect(getCurrent(h).S.length).toBe(0);
    // redo
    h = redo(h);
    expect(getCurrent(h).S.length).toBe(1);
  });
});
