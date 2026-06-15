import React, { useState } from 'react';
import type { PeriodMode } from '../../data/productivity-dashboard.data';
import {
  productivityStats,
  clockHistory,
  monthClockHistory,
  overtimeRecords,
  leaveSummary,
  leaveRecords,
  warningRecords
} from '../../data/productivity-dashboard.data';
import { ProductivityPiePanel } from './panels/productivity-pie-panel';
import { ClockHistoryPanel } from './panels/clock-history-panel';
import { OvertimePanel } from './panels/overtime-panel';
import { LeavePanel } from './panels/leave-panel';
import { WarningPanel } from './panels/warning-panel';
import { PeriodToggle } from './panels/period-toggle';
import './productivity-dashboard.css';

const monthOvertimeRecords = [
  ...overtimeRecords,
  {
    id: 'ot-m-1',
    date: 'Jun 3, 2026',
    duration: '1h 00m',
    approvedBy: 'Ravi Kumar',
    reason: 'Post-release bug triage and documentation',
    tasks: [
      { id: 'tm1', title: 'Bug triage report', hours: 0.5 },
      { id: 'tm2', title: 'Update release notes', hours: 0.5 }
    ]
  },
  {
    id: 'ot-m-2',
    date: 'May 28, 2026',
    duration: '2h 15m',
    approvedBy: 'Priya S.',
    reason: 'Sprint retrospective preparation and slides',
    tasks: [
      { id: 'tm3', title: 'Retrospective slides', hours: 1.5 },
      { id: 'tm4', title: 'Metrics dashboard update', hours: 0.75 }
    ]
  },
  {
    id: 'ot-m-3',
    date: 'May 22, 2026',
    duration: '1h 30m',
    approvedBy: 'Ravi Kumar',
    reason: 'Client demo environment setup and final testing',
    tasks: [
      { id: 'tm5', title: 'Demo environment config', hours: 1 },
      { id: 'tm6', title: 'Smoke test walkthrough', hours: 0.5 }
    ]
  },
  {
    id: 'ot-m-4',
    date: 'May 15, 2026',
    duration: '2h 00m',
    approvedBy: 'Priya S.',
    reason: 'Database schema migration and rollback plan documentation',
    tasks: [
      { id: 'tm7', title: 'Schema migration script', hours: 1.25 },
      { id: 'tm8', title: 'Rollback plan documentation', hours: 0.75 }
    ]
  }
];

export const ProductivityDashboard: React.FC = () => {
  const [period, setPeriod] = useState<PeriodMode>('week');

  return (
    <div className="pd-grid" aria-label="Productivity dashboard">

      {/* ── Left column: Productivity Pie (full height) ── */}
      <div className="pd-col pd-col--left">
        <div className="pd-area pd-area--pie">
          <ProductivityPiePanel stats={productivityStats} />
        </div>
      </div>

      {/* ── Center column: Clock History + Leave ── */}
      <div className="pd-col pd-col--center">
        <div className="pd-area pd-area--clock">
          <ClockHistoryPanel
            days={clockHistory}
            monthDays={monthClockHistory}
            period={period}
          />
        </div>
        <div className="pd-area pd-area--leave">
          <LeavePanel summary={leaveSummary} records={leaveRecords} />
        </div>
      </div>

      {/* ── Right column: Toggle (13) + Overtime + Warning ── */}
      <div className="pd-col pd-col--right">
        <div className="pd-area pd-area--toggle">
          <PeriodToggle period={period} onPeriodChange={setPeriod} />
        </div>
        <div className="pd-area pd-area--overtime">
          <OvertimePanel
            records={overtimeRecords}
            monthRecords={monthOvertimeRecords}
            period={period}
          />
        </div>
        <div className="pd-area pd-area--warning">
          <WarningPanel records={warningRecords} />
        </div>
      </div>

    </div>
  );
};
