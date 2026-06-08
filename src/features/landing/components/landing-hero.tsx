import React from 'react';
import { ApplyDemoForm } from './apply-demo-form';
import './landing-hero.css';

interface LandingHeroProps {
  onGoToApp: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onGoToApp }) => {
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  return (
    <section className="landing-hero">
      <div className="hero-content">
        <h1 className="hero-title">
          The Operating System<br/>
          <span className="text-gradient">For Modern Enterprises</span>
        </h1>

        <p className="hero-subtitle">
          Transform your workforce with an intelligent, unified platform designed for scale, speed, and seamless collaboration.
        </p>

        <div className="hero-actions">
          <button className="hero-btn-primary" onClick={() => setIsFormOpen(true)}>
            Apply Demo
          </button>
          <button className="hero-btn-secondary">
            Watch Product Tour
          </button>
        </div>
      </div>

      <ApplyDemoForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmitSuccess={onGoToApp} 
      />
    </section>
  );
};
