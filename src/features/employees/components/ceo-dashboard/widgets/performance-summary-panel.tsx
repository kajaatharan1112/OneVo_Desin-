import React from 'react';
import { Activity } from 'lucide-react';
import { ActivityRingChart } from '../../task-overview/widgets/activity-ring-chart';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

const PERFORMANCE_TARGET = 85;

export const PerformanceSummaryPanel: React.FC = () => {
  const { summary } = ceoDashboardData.companyPerformance;

  return (
    <article className="eto-widget eto-pie cpg-cell--score">
      <header className="eto-widget__head">
        <Activity size={16} aria-hidden="true" />
        <h3 className="eto-widget__title">Company score</h3>
        <span className="eto-widget__tab">{summary.healthLabel}</span>
      </header>
      <div className="eto-pie__chart">
        <ActivityRingChart
          variant="attendance"
          percent={summary.scorePercent}
          centerValue={`${summary.scorePercent}%`}
          centerLabel={`target ${PERFORMANCE_TARGET}%`}
          caption={`${summary.monthDeltaLabel} · ${summary.healthLabel}`}
        />
      </div>
    </article>
  );
};
