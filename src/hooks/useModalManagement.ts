import { useState, useCallback } from 'react';
import type { ModalState, VideoModalState } from '../types';

export const useModalManagement = () => {
  const [modalState, setModalState] = useState<ModalState>({ 
    isOpen: false, 
    title: '', 
    content: '', 
    size: 'default' 
  });
  
  const [videoModalState, setVideoModalState] = useState<VideoModalState>({ 
    isOpen: false, 
    videoUrl: '', 
    contestantName: '' 
  });

  const showCustomizationModal = useCallback(() => 
    setModalState({ 
      isOpen: true, 
      title: 'Customization Options', 
      content: 'customization', 
      size: 'large' 
    }), []
  );
  
  const showStatsModal = useCallback((statsContent: string) => 
    setModalState({ 
      isOpen: true, 
      title: 'Statistics', 
      content: statsContent, 
      size: 'default' 
    }), []
  );

  const showComparisonModal = useCallback(() => 
    setModalState({ 
      isOpen: true, 
      title: 'Comparison Analysis', 
      content: 'comparison',
      size: 'large' 
    }), []
  );

  const closeModal = useCallback(() => 
    setModalState(prev => ({ ...prev, isOpen: false })), []
  );

  const showVideoModal = useCallback((videoUrl: string, contestantName: string) => 
    setVideoModalState({ 
      isOpen: true, 
      videoUrl, 
      contestantName 
    }), []
  );

  const closeVideoModal = useCallback(() => 
    setVideoModalState(prev => ({ ...prev, isOpen: false })), []
  );

  return {
    modalState,
    videoModalState,
    setModalState,
    setVideoModalState,
    showCustomizationModal,
    showStatsModal,
    showComparisonModal,
    closeModal,
    showVideoModal,
    closeVideoModal,
    confirm: (opts: { message: string; title?: string; confirmLabel?: string; cancelLabel?: string; tone?: 'default' | 'danger'; }) => new Promise<boolean>(resolve => {
      setModalState({
        isOpen: true,
        title: opts.title || 'Confirm',
        content: {
          type: 'confirm',
          message: opts.message,
          confirmLabel: opts.confirmLabel,
          cancelLabel: opts.cancelLabel,
          tone: opts.tone,
          onResult: (ok: boolean) => resolve(ok)
        },
        size: 'default'
      });
    })
  };
};
