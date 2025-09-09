/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  safelist: [
    'bg-slate-900','bg-blue-900','bg-gray-900',
    'from-sky-400','to-blue-500',
    'from-cyan-300','to-teal-400',
    'from-amber-500','to-red-600',
    'text-white','bg-gradient-to-r','bg-clip-text','text-transparent'
  ],
  theme: { extend: {} },
  plugins: []
};
