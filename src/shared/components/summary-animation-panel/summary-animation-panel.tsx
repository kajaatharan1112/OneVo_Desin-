import React from 'react';
import { X } from 'lucide-react';
import { getSummaryAnimation } from '../../../core/animations/summary-animation-registry';
import { LottiePlayer } from '../lottie-player/lottie-player';

interface SummaryAnimationPanelProps {
  cardTitle: string;
  cardValue: string;
  cardDesc: string;
  onClose: () => void;
}

export const SummaryAnimationPanel: React.FC<SummaryAnimationPanelProps> = ({
  cardTitle,
  cardValue,
  cardDesc,
  onClose
}) => {
  const animationData = getSummaryAnimation(cardTitle);

  return (
    <section
      className="summary-animation-panel"
      aria-label={`${cardTitle} animation`}
      key={cardTitle}
    >
      <div className="summary-animation-panel__inner">
        <button
          type="button"
          className="summary-animation-panel__close"
          onClick={onClose}
          aria-label="Close animation"
        >
          <X size={16} />
        </button>

        <div className="summary-animation-panel__content">
          <div className="summary-animation-panel__copy">
            <h3 className="summary-animation-panel__title">{cardTitle}</h3>
            <p className="summary-animation-panel__value">{cardValue}</p>
            <p className="summary-animation-panel__desc">{cardDesc}</p>
          </div>

          <div className="summary-animation-panel__stage">
            {animationData ? (
              <LottiePlayer
                key={cardTitle}
                animationData={animationData}
                className="summary-animation-panel__lottie"
                loop
                autoplay
              />
            ) : (
              <p className="summary-animation-panel__missing">Animation loading…</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
