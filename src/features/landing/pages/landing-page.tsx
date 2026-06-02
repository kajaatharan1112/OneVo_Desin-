import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LandingHero } from '../components';
import { CursorSpotlight } from '../components/interactions/cursor-spotlight';
import './landing-page.css';

// GSAP & Smooth Scroll
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  onGoToApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToApp }) => {
  // Initialize Smooth Scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync GSAP with Lenis
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0, 0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return (
    <div className="landing-page-root dark-theme">
      <CursorSpotlight />
      
      {/* Top Navigation / Go To App */}
      <motion.div 
        className="top-nav-container"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <button className="top-nav-btn" onClick={onGoToApp}>
          Go to App
        </button>
      </motion.div>

      <main className="landing-main">
        <LandingHero onGoToApp={onGoToApp} />
      </main>
    </div>
  );
};
