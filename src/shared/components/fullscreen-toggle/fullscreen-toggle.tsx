import React, { useCallback, useEffect, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

export const FullscreenToggle: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen denied or unsupported in this context
    }
  }, []);

  return (
    <button
      type="button"
      className="fullscreen-toggle"
      onClick={toggleFullscreen}
      aria-label={isFullscreen ? 'Exit full screen view' : 'Enter full screen view'}
      title={isFullscreen ? 'Exit full view' : 'Full view'}
    >
      {isFullscreen ? (
        <Minimize2 size={18} strokeWidth={2.25} aria-hidden="true" />
      ) : (
        <Maximize2 size={18} strokeWidth={2.25} aria-hidden="true" />
      )}
    </button>
  );
};
