import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export const CursorSpotlight: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Create motion values for x and y
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Add a slight spring physics effect for smooth lagging
  const springConfig = { damping: 25, stiffness: 200, mass: 1 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', moveCursor);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY, isVisible]);

  return (
    <>
      <motion.div
        className="cursor-dot"
        style={{
          x: smoothX,
          y: smoothY,
          opacity: isVisible ? 1 : 0
        }}
      />
      <motion.div
        className="cursor-glow"
        style={{
          x: cursorX,
          y: cursorY,
          opacity: isVisible ? 0.6 : 0
        }}
      />
    </>
  );
};
