import React, { useState } from 'react';
import type { PerfPeriodMode } from '../../data/performance-dashboard.data';
import {
  monthApprovalStats,
  yearApprovalStats,
  monthAvailability,
  yearAvailability,
  monthSprints,
  yearSprints,
  achievementRecords
} from '../../data/performance-dashboard.data';
import { ApprovalPiePanel }   from './panels/approval-pie-panel';
import { PerfPeriodToggle }   from './panels/perf-period-toggle';
import { AvailabilityPanel }  from './panels/availability-panel';
import { SprintPanel }        from './panels/sprint-panel';
import { AchievementPanel }   from './panels/achievement-panel';
import './performance-dashboard.css';

export const PerformanceDashboard: React.FC = () => {
  const [period, setPeriod] = useState<PerfPeriodMode>('month');

  const approvalStats = period === 'month' ? monthApprovalStats : yearApprovalStats;

  return (
    <div className="perf-grid" aria-label="Performance dashboard">

      {/* ── Left column: Approval Pie (top) + Achievement (bottom) ── */}
      <div className="perf-col perf-col--left">
        <div className="perf-area perf-area--pie">
          <ApprovalPiePanel stats={approvalStats} />
        </div>
        <div className="perf-area perf-area--achieve">
          <AchievementPanel records={achievementRecords} />
        </div>
      </div>

      {/* ── Right column: Toggle + Availability + Sprint ── */}
      <div className="perf-col perf-col--right">
        <div className="perf-area perf-area--toggle">
          <PerfPeriodToggle period={period} onPeriodChange={setPeriod} />
        </div>
        <div className="perf-area perf-area--avail">
          <AvailabilityPanel
            monthData={monthAvailability}
            yearData={yearAvailability}
            period={period}
          />
        </div>
        <div className="perf-area perf-area--sprint">
          <SprintPanel
            monthSprints={monthSprints}
            yearSprints={yearSprints}
            period={period}
          />
        </div>
      </div>

    </div>
  );
};
