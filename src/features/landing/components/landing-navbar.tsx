import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { AppBrand } from '../../../shared/components/app-brand/app-brand';
import './landing-navbar.css';

interface LandingNavbarProps {
  onGoToApp: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ onGoToApp }) => {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (latest > 50) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  });

  return (
    <motion.header 
      className={`landing-navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="landing-navbar-container">
        <div className="landing-brand-wrapper">
          <AppBrand />
        </div>
        
        <nav className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#modules">Modules</a>
          <a href="#pricing">Pricing</a>
        </nav>
        
        <div className="landing-nav-actions">
          <button className="landing-btn-secondary">Contact Sales</button>
          <button className="landing-btn-primary" onClick={onGoToApp}>
            Go to App
          </button>
        </div>
      </div>
    </motion.header>
  );
};
