import React, { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  size?: 'default' | 'large' | 'full';
};

export default function Modal({ isOpen, onClose, title, children, size = 'default' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      modalRef.current?.focus();
      
      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      // Restore focus when modal closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    default: 'max-w-2xl',
    large: 'max-w-4xl',
    full: 'max-w-7xl',
  } as const;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div 
        ref={modalRef}
        className={`bg-slate-800 rounded-lg shadow-2xl p-6 w-full ${sizeClasses[size]} max-h-full overflow-y-auto focus:outline-none`} 
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
          {title && <h2 id="modal-title" className="text-2xl font-bold text-sky-400">{title}</h2>}
          <button 
            type="button" 
            onClick={onClose} 
            aria-label="Close modal" 
            className="text-slate-400 hover:text-white text-3xl focus:outline-none focus:ring-2 focus:ring-sky-400 rounded"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
