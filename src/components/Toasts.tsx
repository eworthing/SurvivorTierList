import React, { useEffect } from 'react';

export interface ToastData {
  id: number;
  message: string;
  ttl: number; // ms remaining
}

interface ToastsProps {
  toasts: ToastData[];
  remove: (id: number) => void;
}

const Toasts: React.FC<ToastsProps> = ({ toasts, remove }) => {
  useEffect(() => {
    const timers = toasts.map(t => setTimeout(() => remove(t.id), t.ttl));
    return () => { timers.forEach(clearTimeout); };
  }, [toasts, remove]);

  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[90%] max-w-md">
      {toasts.map(t => (
        <div
          key={t.id}
          className="bg-slate-800/90 border border-slate-600 text-slate-200 px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in"
          role="status"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
};

export default Toasts;
