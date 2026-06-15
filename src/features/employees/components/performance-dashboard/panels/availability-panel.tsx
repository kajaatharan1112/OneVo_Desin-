import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, Cell, ResponsiveContainer
} from 'recharts';
import type { AvailabilityRecord, PerfPeriodMode } from '../../../data/performance-dashboard.data';

interface AvailabilityPanelProps {
  monthData: AvailabilityRecord[];
  yearData:  AvailabilityRecord[];
  period:    PerfPeriodMode;
}

const LEVEL_COLOR: Record<string, string> = {
  high:    '#2563eb',
  medium:  '#64748b',
  low:     '#94a3b8',
  weekend: '#e2e8f0'
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* ── Year bar chart tooltip ── */
interface YearTooltipProps {
  active?:  boolean;
  payload?: Array<{ value: number; payload: AvailabilityRecord }>;
}
const YearTooltip: React.FC<YearTooltipProps> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="perf-avail-tooltip">
      <div className="perf-avail-tooltip__title">{d.label}</div>
      <div className="perf-avail-tooltip__row">
        <span>Availability</span>
        <strong style={{ color: LEVEL_COLOR[d.level] }}>{d.availabilityPct}%</strong>
      </div>
      <div className="perf-avail-tooltip__row">
        <span>Available</span>
        <strong>{d.availableHours}h / {d.targetHours}h</strong>
      </div>
      {d.leaveHours > 0 && (
        <div className="perf-avail-tooltip__row perf-avail-tooltip__row--sub">
          <span>Leave</span><span>−{d.leaveHours}h</span>
        </div>
      )}
    </div>
  );
};

/* ── Calendar cell tooltip ── */
interface CellTooltipProps {
  record: AvailabilityRecord;
  x: number;
  y: number;
}
const CalTooltip: React.FC<CellTooltipProps> = ({ record, x, y }) => (
  <div
    className="avail-cal-tooltip"
    style={{ left: x, top: y }}
    role="tooltip"
    aria-label={`${record.label} availability details`}
  >
    <div className="avail-cal-tooltip__title">{record.label}</div>
    {record.isWeekend ? (
      <span className="avail-cal-tooltip__weekend">Weekend</span>
    ) : (
      <>
        <div className="avail-cal-tooltip__row">
          <span>Availability</span>
          <strong style={{ color: LEVEL_COLOR[record.level] }}>{record.availabilityPct}%</strong>
        </div>
        <div className="avail-cal-tooltip__row">
          <span>Available hrs</span>
          <strong>{record.availableHours}h / {record.targetHours}h</strong>
        </div>
        {record.leaveHours > 0 && (
          <div className="avail-cal-tooltip__row avail-cal-tooltip__row--sub">
            <span>Leave</span><span>−{record.leaveHours}h</span>
          </div>
        )}
        {record.excessBreakHours > 0 && (
          <div className="avail-cal-tooltip__row avail-cal-tooltip__row--sub">
            <span>Excess breaks</span><span>−{record.excessBreakHours}h</span>
          </div>
        )}
        {record.meetingHours > 0 && (
          <div className="avail-cal-tooltip__row avail-cal-tooltip__row--sub">
            <span>Meetings</span><span>{record.meetingHours}h</span>
          </div>
        )}
      </>
    )}
  </div>
);

/* ── Calendar grid (month daily view) ── */
const CalendarGrid: React.FC<{ data: AvailabilityRecord[] }> = ({ data }) => {
  const [hovered, setHovered] = useState<{ rec: AvailabilityRecord; x: number; y: number } | null>(null);

  /* Jun 2026: day 1 = Monday (index 0) */
  const startOffset = 0;

  return (
    <div className="avail-cal-wrap">
      {/* Day-of-week header */}
      <div className="avail-cal-header">
        {DAY_LABELS.map(d => (
          <span key={d} className="avail-cal-header__day">{d}</span>
        ))}
      </div>

      {/* Grid */}
      <div
        className="avail-cal-grid"
        onMouseLeave={() => setHovered(null)}
      >
        {/* Leading empty cells */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="avail-cal-cell avail-cal-cell--empty" aria-hidden="true" />
        ))}

        {data.map((rec) => {
          const isWeekend = rec.isWeekend;
          const bg = isWeekend ? 'transparent'
            : rec.availabilityPct === 0 ? 'transparent'
            : rec.level === 'high'   ? '#1d4ed8'
            : rec.level === 'medium' ? '#64748b'
            : '#94a3b8';
          const textColor = isWeekend ? 'transparent'
            : rec.level === 'high'   ? '#fff'
            : rec.level === 'medium' ? '#fff'
            : '#fff';

          return (
            <div
              key={rec.id}
              className={`avail-cal-cell${isWeekend ? ' avail-cal-cell--weekend' : ''}${hovered?.rec.id === rec.id ? ' avail-cal-cell--hovered' : ''}`}
              style={{ background: bg, color: textColor }}
              onMouseEnter={(e) => {
                const cell   = e.currentTarget as HTMLElement;
                const wrap   = cell.closest('.avail-cal-wrap');
                if (!wrap) return;
                const rect   = cell.getBoundingClientRect();
                const parent = wrap.getBoundingClientRect();
                setHovered({
                  rec,
                  x: rect.left - parent.left + rect.width / 2,
                  y: rect.bottom - parent.top + 6
                });
              }}
              aria-label={`${rec.label}${isWeekend ? ', weekend' : `, ${rec.availabilityPct}% availability`}`}
            >
              <span className="avail-cal-cell__num">{rec.shortLabel}</span>
              {!isWeekend && (
                <span className="avail-cal-cell__pct">{rec.availabilityPct}%</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {hovered && (
        <CalTooltip record={hovered.rec} x={hovered.x} y={hovered.y} />
      )}

      {/* Legend */}
      <div className="avail-cal-legend">
        <span className="avail-cal-legend__item">
          <span className="avail-cal-legend__dot" style={{ background: '#2563eb' }} />High ≥85%
        </span>
        <span className="avail-cal-legend__item">
          <span className="avail-cal-legend__dot" style={{ background: '#64748b' }} />Medium 70–84%
        </span>
        <span className="avail-cal-legend__item">
          <span className="avail-cal-legend__dot" style={{ background: '#94a3b8' }} />Low &lt;70%
        </span>
        <span className="avail-cal-legend__item">
          <span className="avail-cal-legend__dot" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }} />Weekend
        </span>
      </div>
    </div>
  );
};

/* ── Main component ── */
export const AvailabilityPanel: React.FC<AvailabilityPanelProps> = ({ monthData, yearData, period }) => {
  const isMonth  = period === 'month';
  const workDays = isMonth ? monthData.filter(d => !d.isWeekend) : yearData;
  const avgPct   = Math.round(workDays.reduce((s, d) => s + d.availabilityPct, 0) / workDays.length);
  const highCount = workDays.filter(d => d.level === 'high').length;
  const medCount  = workDays.filter(d => d.level === 'medium').length;
  const lowCount  = workDays.filter(d => d.level === 'low').length;

  return (
    <div className="perf-panel perf-panel--avail" role="region" aria-label="Employee availability chart">
      <div className="perf-panel__head">
        <span className="perf-panel__title">
          Availability — {isMonth ? 'June 2026 · Daily' : '2026 · Monthly'}
        </span>
        <div className="perf-avail-kpi-row">
          <span className="perf-avail-kpi"
            style={{ color: LEVEL_COLOR[avgPct >= 85 ? 'high' : avgPct >= 70 ? 'medium' : 'low'] }}>
            {avgPct}% avg
          </span>
          <span className="perf-avail-kpi" style={{ color: LEVEL_COLOR.high }}>
            {highCount} high
          </span>
          <span className="perf-avail-kpi" style={{ color: LEVEL_COLOR.medium }}>
            {medCount} medium
          </span>
          {lowCount > 0 && (
            <span className="perf-avail-kpi" style={{ color: LEVEL_COLOR.low }}>
              {lowCount} low
            </span>
          )}
        </div>
      </div>

      {/* Month = calendar grid · Year = bar chart */}
      {isMonth ? (
        <div className="perf-avail-cal-body">
          <CalendarGrid data={monthData} />
        </div>
      ) : (
        <div className="perf-avail-chart-wrap" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearData} margin={{ top: 4, right: 6, bottom: 0, left: -18 }} barCategoryGap="28%">
              <CartesianGrid vertical={false} stroke="#eaecf0" strokeDasharray="3 3" />
              <XAxis
                dataKey="shortLabel"
                tick={{ fontSize: 9, fill: '#667085', fontFamily: 'inherit' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={v => `${v}%`}
                tick={{ fontSize: 9, fill: '#667085', fontFamily: 'inherit' }}
                axisLine={false}
                tickLine={false}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip content={<YearTooltip />} cursor={{ fill: 'rgba(37,99,235,0.05)' }} />
              <ReferenceLine
                y={85}
                stroke="#2563eb"
                strokeDasharray="5 3"
                strokeWidth={1.5}
                label={{ value: 'Target', position: 'right', fontSize: 9, fill: '#2563eb', fontFamily: 'inherit' }}
              />
              <Bar dataKey="availabilityPct" radius={[4, 4, 0, 0]} maxBarSize={36}>
                {yearData.map((entry, i) => (
                  <Cell key={i} fill={LEVEL_COLOR[entry.level]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
