import React from 'react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  contestantName?: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoUrl, contestantName }) => {
  if (!isOpen || !videoUrl) return null;
  
  const embedUrl = videoUrl.includes('youtube.com/watch?v=') 
    ? `https://www.youtube.com/embed/${videoUrl.split('v=')[1]}` 
    : videoUrl.includes('youtube.com/shorts/') 
    ? `https://www.youtube.com/embed/${videoUrl.split('shorts/')[1]}` 
    : null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-4xl max-h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
          <h2 className="text-2xl font-bold text-sky-400">Best of {contestantName}</h2>
          <button 
            type="button" 
            onClick={onClose} 
            aria-label="Close video modal" 
            className="text-slate-400 hover:text-white text-3xl transition-colors"
          >
            &times;
          </button>
        </div>
        
        {embedUrl ? (
          <div className="w-full" style={{ aspectRatio: '16 / 9' }}>
            <iframe 
              src={embedUrl} 
              title={`YouTube video player for ${contestantName}`} 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen 
              className="w-full h-full rounded"
            />
          </div>
        ) : (
          <p className="text-white">
            Could not embed video.{' '}
            <a 
              href={videoUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sky-400 hover:underline"
            >
              Watch on YouTube
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default VideoModal;
