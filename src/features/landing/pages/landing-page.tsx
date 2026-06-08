import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LandingHero } from '../components';
import './landing-page.css';

interface LandingPageProps {
  onGoToApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToApp }) => {
  useEffect(() => {
    // Smooth scrolling and GSAP removed
  }, []);

  return (
    <div className="landing-page-root dark-theme">
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
