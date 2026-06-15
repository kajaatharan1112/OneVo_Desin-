import React from 'react';
import { LogIn, LogOut, Timer, Coffee, CheckSquare, TrendingUp, Users } from 'lucide-react';
import type { ClockDayRecord, MonthClockRecord, PeriodMode } from '../../../data/productivity-dashboard.data';

interface ClockHistoryPanelProps {
  days: ClockDayRecord[];
  monthDays: MonthClockRecord[];
  period: PeriodMode;
}

const STATUS_COLOR: Record<ClockDayRecord['status'], string> = {
  present:    '#2563eb',
  absent:     '#94a3b8',
  'half-day': '#64748b',
  holiday:    '#64748b'
};
const STATUS_LABEL: Record<ClockDayRecord['status'], string> = {
  present:    'Present',
  absent:     'No record',
  'half-day': 'Half day',
  holiday:    'Holiday'
};
const MONTH_STATUS_COLOR: Record<MonthClockRecord['status'], string> = {
  present: '#2563eb',
  absent:  '#9ca3af',
  weekend: '#cbd5e1',
  holiday: '#64748b'
};
function pctColor(pct: number): string {
  if (pct >= 80) return '#2563eb';
  if (pct >= 60) return '#64748b';
  return '#94a3b8';
}

export const ClockHistoryPanel: React.FC<ClockHistoryPanelProps> = ({ days, monthDays, period }) => {

  /* ═══ MONTH VIEW ═════════════════════════════════ */
  if (period === 'month') {
    const workdays = monthDays.filter(d => d.status !== 'weekend');
    return (
      <div className="pd-panel pd-panel--clock" role="region" aria-label="June 2026 clock-in history">
        <div className="pd-panel__head">
          <span className="pd-panel__title">Clock history</span>
          <span className="pd-clock-week">June 2026 · Monthly</span>
        </div>
        <div className="pd-month-list-wrap">
          <ul className="pd-month-list" aria-label="Monthly clock records">
            {workdays.map(day => {
              const isPresent = day.status === 'present' && day.clockIn;
              const taskCover = day.tasksDone !== null && day.tasksTotal !== null
                ? Math.round((day.tasksDone / day.tasksTotal!) * 100) : null;
              return (
                <li key={day.id} className={`pd-month-row pd-month-row--${day.status}`}>
                  <span className="pd-month-row__date">
                    <span className="pd-month-row__day">{day.dayLabel}</span>
                    <span className="pd-month-row__num">{day.date}</span>
                  </span>
                  <span className="pd-month-row__dot" aria-hidden="true"
                    style={{ background: MONTH_STATUS_COLOR[day.status] }} />
                  {isPresent ? (
                    <span className="pd-month-row__body">
                      <span className="pd-month-row__line">
                        <span className="pd-month-row__time pd-month-row__time--in">
                          <LogIn size={9} aria-hidden="true" />{day.clockIn}
                        </span>
                        <span className="pd-month-row__arrow" aria-hidden="true">→</span>
                        <span className="pd-month-row__time">
                          <LogOut size={9} aria-hidden="true" />{day.clockOut ?? 'Active'}
                        </span>
                        {day.sessionTime && (
                          <span className="pd-month-row__session">
                            <Timer size={9} aria-hidden="true" />{day.sessionTime}
                          </span>
                        )}
                      </span>
                      <span className="pd-month-row__line pd-month-row__line--meta">
                        {day.tasksDone !== null && (
                          <span className="pd-month-row__chip pd-month-row__chip--task">
                            <CheckSquare size={8} aria-hidden="true" />{day.tasksDone}/{day.tasksTotal} tasks
                          </span>
                        )}
                        {day.productivityPct !== null && (
                          <span className="pd-month-row__chip pd-month-row__chip--pct"
                            style={{ color: pctColor(day.productivityPct) }}>
                            <TrendingUp size={8} aria-hidden="true" />{day.productivityPct}% rate
                          </span>
                        )}
                        {day.meetingHours && (
                          <span className="pd-month-row__chip pd-month-row__chip--meet">
                            <Users size={8} aria-hidden="true" />
                            {day.meetingCount} meetings · {day.meetingHours}
                          </span>
                        )}
                        {taskCover !== null && (
                          <span className="pd-month-row__mini-bar" aria-hidden="true">
                            <span className="pd-month-row__mini-bar-fill"
                              style={{ width: `${taskCover}%`, background: pctColor(taskCover) }} />
                          </span>
                        )}
                      </span>
                    </span>
                  ) : (
                    <span className="pd-month-row__absent">
                      {day.status === 'holiday' ? 'Holiday' : 'Absent'}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }

  /* ═══ WEEK VIEW — 5 micro-card day panels ════════ */
  return (
    <div className="pd-panel pd-panel--clock" role="region" aria-label="This week clock-in history">
      <div className="pd-panel__head">
        <span className="pd-panel__title">Clock history</span>
        <span className="pd-clock-week">Jun 9 – Jun 13</span>
      </div>

      <div className="pd-week-cards">
        {days.map(day => {
          const isEmpty      = !day.clockIn;
          const isInProgress = !!day.clockIn && !day.clockOut;
          const hasTasks     = day.tasksDone !== null && day.tasksTotal !== null;

          return (
            <div
              key={day.id}
              className={[
                'pd-day-card',
                day.isToday  ? 'pd-day-card--today'  : '',
                isEmpty      ? 'pd-day-card--empty'  : '',
                isInProgress ? 'pd-day-card--active' : ''
              ].filter(Boolean).join(' ')}
              aria-label={`${day.dayLabel} ${day.date}${day.isToday ? ', today' : ''}${isEmpty ? ', no record' : ''}`}
            >
              {/* ── Header ── */}
              <div className="pd-day-card__head">
                <span className="pd-day-card__day">{day.dayLabel}</span>
                <span className="pd-day-card__date">{day.date.replace('Jun ', '')}</span>
                {day.isToday && <span className="pd-day-card__today-dot" aria-hidden="true" />}
              </div>

              {/* Status */}
              <span className="pd-day-card__status" style={{
                color: STATUS_COLOR[day.status],
                background: `color-mix(in srgb, ${STATUS_COLOR[day.status]} 12%, transparent)`
              }}>
                {STATUS_LABEL[day.status]}
              </span>

              {/* ── Micro cards — fills all remaining height ── */}
              <div className="pd-day-card__micro-rows">

                <div className="pd-day-card__mc">
                  <span className="pd-day-card__mc-lbl">
                    <LogIn size={7} aria-hidden="true" />Clock In
                  </span>
                  <span className="pd-day-card__mc-val pd-day-card__mc-val--in">
                    {day.clockIn ?? '—'}
                  </span>
                </div>

                <div className="pd-day-card__mc">
                  <span className="pd-day-card__mc-lbl">
                    <LogOut size={7} aria-hidden="true" />Clock Out
                  </span>
                  <span className="pd-day-card__mc-val">
                    {day.clockOut ?? (day.clockIn ? 'Active' : '—')}
                  </span>
                </div>

                <div className="pd-day-card__mc">
                  <span className="pd-day-card__mc-lbl">
                    <Timer size={7} aria-hidden="true" />Session
                  </span>
                  <span className="pd-day-card__mc-val">{day.sessionTime ?? '—'}</span>
                </div>

                <div className="pd-day-card__mc">
                  <span className="pd-day-card__mc-lbl">
                    <Coffee size={7} aria-hidden="true" />Break
                  </span>
                  <span className="pd-day-card__mc-val">{day.breakTime ?? '—'}</span>
                </div>

              </div>

              {/* ── Labeled productivity chips ── */}
              {!isEmpty && (
                <div className="pd-day-card__chips">
                  {hasTasks && (
                    <span className="pd-day-card__chip">
                      <CheckSquare size={8} aria-hidden="true" />
                      {day.tasksDone}/{day.tasksTotal} Tasks
                    </span>
                  )}
                  {day.productivityPct !== null && (
                    <span className="pd-day-card__chip"
                      style={{ color: pctColor(day.productivityPct) }}>
                      <TrendingUp size={8} aria-hidden="true" />
                      {day.productivityPct}% Rate
                    </span>
                  )}
                  {day.meetingCount !== null && day.meetingCount > 0 && (
                    <span className="pd-day-card__chip pd-day-card__chip--meet">
                      <Users size={8} aria-hidden="true" />
                      {day.meetingCount} Meetings · {day.meetingHours}
                    </span>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};
