import React from 'react';
import type { PeriodMode } from '../../../data/productivity-dashboard.data';

interface PeriodToggleProps {
  period: PeriodMode;
  onPeriodChange: (p: PeriodMode) => void;
}

export const PeriodToggle: React.FC<PeriodToggleProps> = ({ period, onPeriodChange }) => (
  <div className="pd-period-bar" role="group" aria-label="View period selector">
    <span className="pd-period-bar__label">View</span>
    <div className="pd-period-toggle" role="group" aria-label="Switch between week and month view">
      <button
        type="button"
        className={`pd-period-toggle__btn${period === 'week' ? ' pd-period-toggle__btn--active' : ''}`}
        aria-pressed={period === 'week'}
        onClick={() => onPeriodChange('week')}
      >
        Week
      </button>
      <button
        type="button"
        className={`pd-period-toggle__btn${period === 'month' ? ' pd-period-toggle__btn--active' : ''}`}
        aria-pressed={period === 'month'}
        onClick={() => onPeriodChange('month')}
      >
        Month
      </button>
      <span
        className="pd-period-toggle__slider"
        aria-hidden="true"
        style={{ transform: period === 'month' ? 'translateX(100%)' : 'translateX(0)' }}
      />
    </div>
  </div>
);
