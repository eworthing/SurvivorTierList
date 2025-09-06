import { describe, it, expect } from 'vitest';
import { setDragAccentColor, pushStackId, clearStack, setIsIdle, getUIState } from '../src/stores/uiStore';

describe('uiStore', () => {
  it('updates dragAccentColor and stack ids', () => {
    setDragAccentColor('#ff0000');
    expect(getUIState().dragAccentColor).toBe('#ff0000');
    pushStackId('a');
    pushStackId('b');
    expect(getUIState().stackSelectedIds).toEqual(['a','b']);
    pushStackId('a');
    expect(getUIState().stackSelectedIds).toEqual(['a','b']);
    clearStack();
    expect(getUIState().stackSelectedIds).toEqual([]);
    setIsIdle(true);
    expect(getUIState().isIdle).toBe(true);
  });
});
