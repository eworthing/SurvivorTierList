
// Minimal ambient declarations for a few platform-only modules that
// are present in native packaging (Capacitor / Electron). These keep
// editors and TypeScript from reporting "cannot find module" when the
// native SDKs aren't installed in the web-only dev environment.

declare module '@capacitor/splash-screen' {
  export const SplashScreen: {
    hide?: () => Promise<void>;
  };
}

// Small shape for Capacitor runtime helper used in a few places here.
declare module '@capacitor/core' {
  export interface CapacitorPlugin { [k: string]: unknown }
  export const Capacitor: {
    isNative?: boolean;
    getPlatform?: () => string;
    Plugins?: Record<string, CapacitorPlugin>;
  };
}

// Fallback for other @capacitor/* modules the editor may not have installed.
declare module '@capacitor/*' {
  const plugin: { [k: string]: unknown };
  export default plugin;
}

// Minimal electron ambient for a small subset used in packaging/dev scripts.
declare module 'electron' {
  export const app: { getVersion?: () => string; whenReady?: () => Promise<void> };
  export const ipcRenderer: { send?: (channel: string, ...args: unknown[]) => void; on?: (channel: string, listener: (...args: unknown[]) => void) => void };
}
