import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CinematicOpeningIntroProps {
  onComplete: () => void;
  forcePlay?: boolean;
}

export const CinematicOpeningIntro: React.FC<CinematicOpeningIntroProps> = ({
  onComplete,
}) => {
  const [isFinishing, setIsFinishing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Video Autoplay handling with fast-forward to 10 seconds total
  useEffect(() => {
    if (videoRef.current) {
      const vid = videoRef.current;
      vid.muted = true;
      vid.currentTime = 0;
      vid.playbackRate = 3.0; // Fast-forward 30s video into exactly ~10s
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Autoplay prevented by browser:', err);
        });
      }
    }
  }, []);

  const handleFinish = () => {
    if (isFinishing) return;
    setIsFinishing(true);
    try {
      sessionStorage.setItem('neuroscan_intro_viewed', 'true');
    } catch {
      // Ignore storage errors
    }
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  return (
    <AnimatePresence>
      {!isFinishing && (
        <motion.div
          key="cinematic-intro"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          onClick={handleFinish}
          className="fixed inset-0 z-[99999] bg-[#030914] flex items-center justify-center overflow-hidden select-none cursor-pointer"
          title="Click anywhere to enter dashboard"
        >
          {/* Pure Fullscreen Starting Video — Fast-Forwarded to ~10s */}
          <video
            ref={videoRef}
            src="/videos/start_video.mp4"
            preload="auto"
            playsInline
            autoPlay
            muted
            disablePictureInPicture={true}
            controlsList="nodownload noplaybackrate nofullscreen noremoteplayback"
            onLoadedMetadata={(e) => {
              e.currentTarget.playbackRate = 3.0;
            }}
            onPlay={(e) => {
              e.currentTarget.playbackRate = 3.0;
            }}
            onEnded={handleFinish}
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
