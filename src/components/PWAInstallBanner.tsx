import React from 'react';

interface PWAInstallBannerProps {
  isVisible: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  isVisible,
  onInstall,
  onDismiss
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 shadow-2xl border border-blue-400/20">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-2xl">📱</div>
          <div className="flex-1 text-white">
            <h4 className="font-bold text-sm mb-1">Install Survivor Tiers</h4>
            <p className="text-blue-100 text-xs mb-3">
              Get faster access and work offline! Install our app for the best experience.
            </p>
            <div className="flex gap-2">
              <button
                onClick={onInstall}
                className="bg-white text-blue-600 px-3 py-1.5 rounded text-xs font-semibold hover:bg-blue-50 transition-colors duration-200 touch-manipulation"
              >
                Install App
              </button>
              <button
                onClick={onDismiss}
                className="text-blue-100 px-3 py-1.5 rounded text-xs hover:bg-white/10 transition-colors duration-200 touch-manipulation"
              >
                Not Now
              </button>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-blue-200 hover:text-white text-xl leading-none touch-manipulation"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallBanner;
