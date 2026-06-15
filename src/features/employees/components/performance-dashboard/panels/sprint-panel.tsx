import React from 'react';
import { CheckCircle2, AlertCircle, Clock, Minus } from 'lucide-react';
import type { SprintRecord, SprintStatus, PerfPeriodMode } from '../../../data/performance-dashboard.data';

interface SprintPanelProps {
  monthSprints: SprintRecord[];
  yearSprints: SprintRecord[];
  period: PerfPeriodMode;
}

const STATUS_CONFIG: Record<SprintStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  'before-deadline': {
    label: 'Before deadline', color: '#2563eb', bg: '#eff6ff',
    icon: <CheckCircle2 size={13} aria-hidden="true" />
  },
  'on-deadline': {
    label: 'On deadline', color: '#64748b', bg: '#f1f5f9',
    icon: <CheckCircle2 size={13} aria-hidden="true" />
  },
  'after-deadline': {
    label: 'After deadline', color: '#94a3b8', bg: '#f8fafc',
    icon: <AlertCircle size={13} aria-hidden="true" />
  },
  'incomplete': {
    label: 'Incomplete', color: '#cbd5e1', bg: '#f8fafc',
    icon: <Minus size={13} aria-hidden="true" />
  },
  'active': {
    label: 'In progress', color: '#2563eb', bg: '#eff6ff',
    icon: <Clock size={13} aria-hidden="true" />
  }
};

/* Month view — 4 cards like clock history */
const MonthSprintView: React.FC<{ sprints: SprintRecord[] }> = ({ sprints }) => (
  <div className="perf-sprint-week-cards">
    {sprints.map(sp => {
      const cfg = STATUS_CONFIG[sp.status];
      const completionPct = Math.round((sp.completedTasks / sp.plannedTasks) * 100);
      const isActive = sp.status === 'active';
      const isLate   = sp.status === 'after-deadline';
      return (
        <div
          key={sp.id}
          className={[
            'perf-sprint-card',
            isActive ? 'perf-sprint-card--active' : '',
            sp.status === 'incomplete' ? 'perf-sprint-card--empty' : ''
          ].filter(Boolean).join(' ')}
          aria-label={`${sp.fullLabel} — ${cfg.label}`}
        >
          {/* Header */}
          <div className="perf-sprint-card__head">
            <span className="perf-sprint-card__label">{sp.label}</span>
            {isActive && <span className="perf-sprint-card__today-dot" aria-hidden="true" />}
          </div>

          {/* Status badge */}
          <span className="perf-sprint-card__status"
            style={{ color: cfg.color, background: cfg.bg }}>
            {cfg.icon}{cfg.label}
          </span>

          {/* Task count micro-card */}
          <div className="perf-sprint-card__mc">
            <span className="perf-sprint-card__mc-lbl">Tasks done</span>
            <span className="perf-sprint-card__mc-val">
              {sp.completedTasks}/{sp.plannedTasks}
            </span>
          </div>

          {/* Completion bar */}
          <div className="perf-sprint-card__bar-wrap" aria-label={`${completionPct}% complete`}>
            <div
              className="perf-sprint-card__bar-fill"
              style={{ width: `${completionPct}%`, background: cfg.color }}
            />
          </div>
          <span className="perf-sprint-card__pct">{completionPct}%</span>

          {/* Deadline info */}
          <div className="perf-sprint-card__mc">
            <span className="perf-sprint-card__mc-lbl">Deadline</span>
            <span className="perf-sprint-card__mc-val perf-sprint-card__mc-val--sub">
              {sp.deadline}
            </span>
          </div>

          {sp.completedDate && (
            <div className="perf-sprint-card__mc">
              <span className="perf-sprint-card__mc-lbl">Completed</span>
              <span className="perf-sprint-card__mc-val perf-sprint-card__mc-val--sub">
                {sp.completedDate}
              </span>
            </div>
          )}

          {/* Early/late chip */}
          {sp.daysEarlyLate !== undefined && (
            <span className="perf-sprint-card__chip"
              style={{ color: isLate ? '#94a3b8' : '#2563eb', background: isLate ? '#f8fafc' : '#eff6ff' }}>
              {sp.daysEarlyLate >= 0
                ? `${sp.daysEarlyLate > 0 ? sp.daysEarlyLate + ' day early' : 'On time'}`
                : `${Math.abs(sp.daysEarlyLate)} day${Math.abs(sp.daysEarlyLate) > 1 ? 's' : ''} late`}
            </span>
          )}
        </div>
      );
    })}
  </div>
);

/* Year view — 4-week-row × 13-month matrix */
const GRID_STATUS_COLOR: Record<SprintStatus, string> = {
  'before-deadline': '#2563eb',
  'on-deadline':     '#64748b',
  'after-deadline':  '#94a3b8',
  'incomplete':      '#e2e8f0',
  'active':          '#93c5fd'
};

const MONTHS_13 = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','+'];
const WEEK_ROWS  = ['1st','2nd','3rd','4th'];

const YearSprintView: React.FC<{ sprints: SprintRecord[] }> = ({ sprints }) => {
  const [hovered, setHovered] = React.useState<string | null>(null);

  /* Map sprint index to matrix: index = col*4 + row */
  const getCell = (row: number, col: number): SprintRecord | null => {
    const idx = col * 4 + row;
    return idx < sprints.length ? sprints[idx] : null;
  };

  return (
    <div className="perf-sprint-year-wrap">

      {/* Month header row */}
      <div className="perf-sprint-yr-head">
        <span className="perf-sprint-yr-corner" />
        {MONTHS_13.map(m => (
          <span key={m} className="perf-sprint-yr-month">{m}</span>
        ))}
      </div>

      {/* 4 week rows */}
      {WEEK_ROWS.map((rowLabel, rowIdx) => (
        <div key={rowIdx} className="perf-sprint-yr-row">
          <span className="perf-sprint-yr-row-lbl">{rowLabel}</span>
          {MONTHS_13.map((_, colIdx) => {
            const sp = getCell(rowIdx, colIdx);
            if (!sp) return (
              <div key={colIdx} className="perf-sprint-cell perf-sprint-cell--null" aria-hidden="true" />
            );
            const cfg = STATUS_CONFIG[sp.status];
            const pct = Math.round((sp.completedTasks / sp.plannedTasks) * 100);
            return (
              <div
                key={colIdx}
                className="perf-sprint-cell"
                style={{ background: GRID_STATUS_COLOR[sp.status] }}
                onMouseEnter={() => setHovered(sp.id)}
                onMouseLeave={() => setHovered(null)}
                aria-label={`${MONTHS_13[colIdx]} ${rowLabel} week — ${cfg.label}`}
                role="img"
              >
                {hovered === sp.id && (
                  <div className="perf-sprint-cell__tooltip">
                    <strong>{MONTHS_13[colIdx]} · {rowLabel} week</strong>
                    <span>{cfg.label}</span>
                    <span>{sp.completedTasks}/{sp.plannedTasks} tasks · {pct}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Legend */}
      <div className="perf-sprint-year-legend" aria-label="Sprint status legend">
        {(Object.entries(STATUS_CONFIG) as [SprintStatus, typeof STATUS_CONFIG[SprintStatus]][])
          .filter(([key]) => key !== 'active')
          .map(([key, cfg]) => (
            <span key={key} className="perf-sprint-year-legend__item">
              <span className="perf-sprint-year-legend__dot"
                style={{ background: GRID_STATUS_COLOR[key] }} aria-hidden="true" />
              {cfg.label}
            </span>
          ))}
      </div>
    </div>
  );
};

export const SprintPanel: React.FC<SprintPanelProps> = ({ monthSprints, yearSprints, period }) => {
  const data = period === 'month' ? monthSprints : yearSprints;

  const beforeCount = data.filter(s => s.status === 'before-deadline' || s.status === 'on-deadline').length;
  const afterCount  = data.filter(s => s.status === 'after-deadline').length;
  const incomplete  = data.filter(s => s.status === 'incomplete').length;
  const total       = data.filter(s => s.status !== 'active').length;
  const onTimePct   = total > 0 ? Math.round((beforeCount / total) * 100) : 0;

  return (
    <div className="perf-panel perf-panel--sprint" role="region" aria-label="Sprint deadline management">
      <div className="perf-panel__head">
        <span className="perf-panel__title">Sprint Deadlines</span>
        <span className="perf-panel__badge perf-panel__badge--blue">
          {period === 'month' ? '4 Weeks' : '52 Weeks'}
        </span>
      </div>

      {/* Summary chips */}
      <div className="perf-sprint-summary">
        <span className="perf-sprint-summary__chip perf-sprint-summary__chip--blue">
          <CheckCircle2 size={10} aria-hidden="true" />
          {beforeCount} on time
        </span>
        <span className="perf-sprint-summary__chip perf-sprint-summary__chip--gray">
          <AlertCircle size={10} aria-hidden="true" />
          {afterCount} late
        </span>
        {incomplete > 0 && (
          <span className="perf-sprint-summary__chip perf-sprint-summary__chip--muted">
            <Minus size={10} aria-hidden="true" />
            {incomplete} incomplete
          </span>
        )}
        <span className="perf-sprint-summary__chip perf-sprint-summary__chip--rate">
          {onTimePct}% on-time rate
        </span>
      </div>

      {/* Cards or grid */}
      <div className="perf-sprint-body">
        {period === 'month'
          ? <MonthSprintView sprints={monthSprints} />
          : <YearSprintView sprints={yearSprints} />
        }
      </div>
    </div>
  );
};
