import { describe, it, expect, beforeEach } from 'vitest';
import { getUIState, setDragAccentColor, pushStackId, clearStack, setIsIdle } from '../src/stores/uiStore';

describe('useContestantCardInteractions (sanity)', () => {
  beforeEach(() => {
    setDragAccentColor(null);
    clearStack();
    setIsIdle(false);
  });

  it('store helpers update state as expected', () => {
    setDragAccentColor('#00ff00');
    expect(getUIState().dragAccentColor).toBe('#00ff00');
    pushStackId('x');
    pushStackId('y');
    expect(getUIState().stackSelectedIds).toEqual(['x','y']);
    setIsIdle(true);
    expect(getUIState().isIdle).toBe(true);
  });
});
