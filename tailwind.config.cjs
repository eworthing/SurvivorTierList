module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {},
  },
  // JIT/purge can miss classes built at runtime (template strings).
  // Safelist the common color/gradient utility prefixes used by the app so
  // classes like `from-blue-900`, `via-purple-900`, `to-indigo-900`,
  // `bg-slate-900`, and `text-white` are always generated in dev.
  safelist: [
    // Explicit theme background colors
    'bg-slate-900',
    'bg-blue-900',
    'bg-gray-900',
    // Gradient stop utilities used in THEMES accent definitions
    'from-sky-400', 'to-blue-500',
    'from-cyan-300', 'to-teal-400',
    'from-amber-500', 'to-red-600',
    // Common global text colors and gradient base classes
    'text-white', 'bg-gradient-to-r', 'bg-clip-text', 'text-transparent'
  ],
  plugins: [],
};
