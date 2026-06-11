import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { NeedsActionItem } from '../../types/employee-requests.types';

interface NeedsActionBannerProps {
  item: NeedsActionItem;
  className?: string;
}

export const NeedsActionBanner: React.FC<NeedsActionBannerProps> = ({ item, className = '' }) => {
  return (
    <section
      className={`era-hero-banner era-needs-action ${className}`.trim()}
      aria-label="Needs your action"
    >
      <div className="era-hero-banner__content">
        <span className="era-hero-banner__icon" aria-hidden="true">
          <AlertTriangle size={16} />
        </span>
        <div className="era-hero-banner__copy">
          <span className="era-hero-banner__label">Needs Your Action</span>
          <p className="era-hero-banner__title">{item.requestTitle}</p>
          <p className="era-hero-banner__helper">{item.message}</p>
        </div>
      </div>
      <div className="era-hero-banner__actions">
        <button type="button" className="era-btn era-btn--primary era-btn--compact">
          {item.primaryCta}
        </button>
        <button type="button" className="era-btn era-btn--ghost era-btn--compact">
          {item.secondaryCta}
        </button>
      </div>
    </section>
  );
};
