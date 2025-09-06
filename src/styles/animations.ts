export const APP_ANIMATIONS = `
  @keyframes stlConfettiFall {0% {transform: translateY(-10vh) rotate(0deg); opacity:1;} 80% {opacity:1;} 100% {transform: translateY(70vh) rotate(720deg); opacity:0;}}
  @keyframes stlSettle {0% {transform: translateY(0) scale(1);} 50% {transform: translateY(-6px) scale(0.985);} 100% {transform: translateY(0) scale(1);} }
  .animate-stl-settle { animation: stlSettle 420ms cubic-bezier(.22,.9,.3,1); }
  @keyframes stlJostle { 0% { transform: translateY(0); } 30% { transform: translateY(-6px); } 60% { transform: translateY(2px); } 100% { transform: translateY(0); } }
  .tier-jostle > * { animation: stlJostle 420ms ease both; }
  @keyframes stlBreathe { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.006); opacity: 0.98; } 100% { transform: scale(1); opacity: 1; } }
  .stl-breathe { animation: stlBreathe 3000ms ease-in-out infinite; }
  .stl-drag-accent { transition: border-left-color 260ms ease, box-shadow 260ms ease; }
`;

export default APP_ANIMATIONS;
