// Sentinel React component to force Tailwind to include dynamic theme classes.
// Tailwind's Vite plugin appears to only reliably pick up class names that
// occur in className attributes (or similar patterns) during transform.
// Keeping them inside a plain exported string was insufficient, so we mount
// an invisible div containing every required theme / gradient utility.
// If you later move to a data-theme approach with CSS variables, this file
// can be removed.
import React from 'react';

export const ThemeClassSentinel: React.FC = () => (
  <div
    aria-hidden="true"
    // Intentionally verbose: every class we need to guarantee in the build.
    className="hidden bg-slate-900 bg-blue-900 bg-gray-900 from-sky-400 to-blue-500 from-cyan-300 to-teal-400 from-amber-500 to-red-600 text-white bg-gradient-to-r bg-clip-text text-transparent"
  />
);

// (No default export to make tree-shaking less likely to elide this file when imported by side-effect.)
