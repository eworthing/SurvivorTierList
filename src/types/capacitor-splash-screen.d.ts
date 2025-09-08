// Minimal ambient declarations for a few platform-only modules that
// are present in native packaging (Capacitor / Electron). These keep
// editors and TypeScript from reporting "cannot find module" when the
// native SDKs aren't installed in the web-only dev environment.

declare module '@capacitor/splash-screen' {
  export const SplashScreen: {
    hide?: () => Promise<void>;
  };
}

// A permissive catch-all for other `@capacitor/*` submodules. This is
// intentionally loose: these modules are runtime-guarded in the app and
// we only need to silence missing-type diagnostics in the editor.
declare module '@capacitor/*' {
  const CapacitorModule: any;
  export default CapacitorModule;
  export const Capacitor: any;
}

// Minimal electron ambient so imports like `import { app } from 'electron'`
// don't cause editor errors when working on the web build.
declare module 'electron' {
  const electron: any;
  export = electron;
}
