import { create } from 'zustand';

type UIState = {
  dragAccentColor: string | null;
  setDragAccentColor: (c: string | null) => void;
  stackSelectedIds: string[];
  pushStackId: (id: string) => void;
  clearStack: () => void;
  isIdle: boolean;
  setIsIdle: (v: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  dragAccentColor: null,
  setDragAccentColor: (c) => set({ dragAccentColor: c }),
  stackSelectedIds: [],
  pushStackId: (id) => set(state => {
    const next = state.stackSelectedIds.includes(id) ? state.stackSelectedIds : [...state.stackSelectedIds, id].slice(-2);
    return { stackSelectedIds: next };
  }),
  clearStack: () => set({ stackSelectedIds: [] }),
  isIdle: false,
  setIsIdle: (v) => set({ isIdle: v }),
}));

// Exported convenience helpers (non-reactive) for existing code/tests
export const setDragAccentColor = (c: string | null) => useUIStore.getState().setDragAccentColor(c);
export const pushStackId = (id: string) => useUIStore.getState().pushStackId(id);
export const clearStack = () => useUIStore.getState().clearStack();
export const setIsIdle = (v: boolean) => useUIStore.getState().setIsIdle(v);
export const getUIState = () => ({ ...useUIStore.getState() });

export default useUIStore;
