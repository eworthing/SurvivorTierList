import { describe, it, expect } from 'vitest';
import {
  initHistory,
  saveSnapshot,
  undo,
  redo,
  getCurrent,
  canUndo,
  canRedo,
} from '../src/historyManager.ts';

describe('historyManager', () => {
  it('initializes and returns a clone of initial snapshot', () => {
    const initial = { a: 1, nested: { v: 2 } };
    const h = initHistory(initial, 5);
    const current = getCurrent(h);
    expect(current).toEqual(initial);
    // mutating current should not affect history
    current.nested.v = 999;
    const after = getCurrent(h);
    expect(after.nested.v).toBe(2);
  });

  it('saves snapshots and respects limit', () => {
    const h0 = initHistory({ x: 0 }, 3);
    const h1 = saveSnapshot(h0, { x: 1 });
    const h2 = saveSnapshot(h1, { x: 2 });
    const h3 = saveSnapshot(h2, { x: 3 });
    // limit is 3, so oldest should have been dropped; stack length == 3
    expect(h3.stack.length).toBe(3);
    expect(getCurrent(h3)).toEqual({ x: 3 });
  });

  it('undo and redo move index correctly and return clones', () => {
    let h = initHistory({ x: 0 }, 10);
    h = saveSnapshot(h, { x: 1 });
    h = saveSnapshot(h, { x: 2 });
    expect(canUndo(h)).toBe(true);
    h = undo(h);
    expect(getCurrent(h)).toEqual({ x: 1 });
    expect(canRedo(h)).toBe(true);
    h = redo(h);
    expect(getCurrent(h)).toEqual({ x: 2 });
  });

  it('does nothing when undo/redo not possible', () => {
    let h = initHistory({ x: 0 }, 5);
    const u = undo(h);
    expect(u.index).toBe(0);
    const r = redo(h);
    expect(r.index).toBe(0);
  });
});
