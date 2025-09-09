// Minimal shim to satisfy Vite resolver during web development
// Exports a Keyboard object with addListener that returns a no-op remover.
export const Keyboard = {
  addListener: (_eventName: string, _cb: (..._args: unknown[]) => void) => {
    // No-op in web dev; return a disposable
    return {
      remove: () => {},
    };
  },
};

export default Keyboard;
