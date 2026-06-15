import React from 'react';
import { CalendarDays, TrendingUp } from 'lucide-react';
import type { PerfPeriodMode } from '../../../data/performance-dashboard.data';

interface PerfPeriodToggleProps {
  period: PerfPeriodMode;
  onPeriodChange: (p: PerfPeriodMode) => void;
}

export const PerfPeriodToggle: React.FC<PerfPeriodToggleProps> = ({ period, onPeriodChange }) => {
  return (
    <div className="perf-period-bar" role="group" aria-label="Switch view period">
      <span className="perf-period-bar__label" aria-hidden="true">View</span>
      <div className="perf-period-toggle" role="radiogroup" aria-label="Period selection">
        <div
          className="perf-period-toggle__slider"
          style={{ transform: period === 'year' ? 'translateX(100%)' : 'translateX(0)' }}
          aria-hidden="true"
        />
        <button
          type="button"
          role="radio"
          aria-checked={period === 'month'}
          className={`perf-period-toggle__btn${period === 'month' ? ' perf-period-toggle__btn--active' : ''}`}
          onClick={() => onPeriodChange('month')}
        >
          <CalendarDays size={12} aria-hidden="true" />
          Month
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={period === 'year'}
          className={`perf-period-toggle__btn${period === 'year' ? ' perf-period-toggle__btn--active' : ''}`}
          onClick={() => onPeriodChange('year')}
        >
          <TrendingUp size={12} aria-hidden="true" />
          Year
        </button>
      </div>
    </div>
  );
};
