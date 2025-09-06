import { deepClone } from './utils';
import type { History } from './types';

export function initHistory<T>(initialSnapshot: T, limit = 50): History<T> {
  const snapshot = deepClone(initialSnapshot);
  return {
    stack: [snapshot],
    index: 0,
    limit: Math.max(1, Math.floor(limit)),
  };
}

export function saveSnapshot<T>(history: History<T>, snapshot: T): History<T> {
  const s = deepClone(snapshot);
  const before = history.stack.slice(0, history.index + 1);
  before.push(s);
  const overflow = Math.max(0, before.length - history.limit);
  const newStack = overflow ? before.slice(overflow) : before;
  const newIndex = newStack.length - 1;
  return { stack: newStack, index: newIndex, limit: history.limit };
}

export function canUndo<T>(history: History<T>) {
  return history.index > 0;
}

export function canRedo<T>(history: History<T>) {
  return history.index < history.stack.length - 1;
}

export function undo<T>(history: History<T>): History<T> {
  if (!canUndo(history)) return history;
  return { stack: history.stack, index: history.index - 1, limit: history.limit };
}

export function redo<T>(history: History<T>): History<T> {
  if (!canRedo(history)) return history;
  return { stack: history.stack, index: history.index + 1, limit: history.limit };
}

export function getCurrent<T>(history: History<T>) {
  return deepClone(history.stack[history.index]) as T;
}

export default { initHistory, saveSnapshot, undo, redo, getCurrent, canUndo, canRedo };
