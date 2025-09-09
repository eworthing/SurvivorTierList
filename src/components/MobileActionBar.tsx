import React from 'react';

type Props = {
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onExport: () => void;
};

export default function MobileActionBar({ onUndo, onRedo, onReset, onExport }: Props) {
  return (
    <nav className="fixed bottom-0 inset-x-0 h-14 border-t bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4 h-full">
        <button className="hit" aria-label="Undo" onClick={onUndo}>↶</button>
        <button className="hit" aria-label="Redo" onClick={onRedo}>↷</button>
        <button className="hit" aria-label="Reset" onClick={onReset}>⟲</button>
        <button className="hit" aria-label="Export" onClick={onExport}>⇩</button>
      </div>
    </nav>
  );
}
