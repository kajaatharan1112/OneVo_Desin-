import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../../../../core/theme/theme-context';
import type { ProductivityStats } from '../../../data/productivity-dashboard.data';

interface ProductivityPiePanelProps {
  stats: ProductivityStats;
}

export const ProductivityPiePanel: React.FC<ProductivityPiePanelProps> = ({ stats }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { clockInHours, taskHours, meetingHours, weeklyTarget } = stats.hours;
  const remainingTarget = Math.max(weeklyTarget - clockInHours, 0);

  const COLORS = isDark
    ? { task: '#5b8df6', meeting: '#93c5fd', remaining: 'rgba(255,255,255,0.08)' }
    : { task: '#2563eb', meeting: '#93c5fd', remaining: '#eaecf0' };

  const segments = [
    { name: 'Task hours',    value: taskHours,      color: COLORS.task },
    { name: 'Meeting hours', value: meetingHours,   color: COLORS.meeting },
    { name: 'Remaining',     value: remainingTarget, color: COLORS.remaining }
  ];

  const taskPct = Math.round((taskHours / clockInHours) * 100);

  return (
    <div className="pd-panel pd-panel--pie" role="region" aria-label="Productivity overview">
      <div className="pd-panel__head">
        <span className="pd-panel__title">Productivity</span>
        <span className="pd-panel__badge pd-panel__badge--blue">This week</span>
      </div>

      <div className="pd-pie-wrap" role="img" aria-label={`Productivity ${stats.productivityPct}% — task hours ${taskHours}h of ${clockInHours}h clock-in`}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <PieChart margin={{ top: 6, right: 6, bottom: 6, left: 6 }}>
            <Pie
              data={segments}
              dataKey="value"
              innerRadius="68%"
              outerRadius="88%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
              stroke="none"
              strokeWidth={0}
              cornerRadius={5}
              isAnimationActive={false}
            >
              {segments.map((seg) => (
                <Cell key={seg.name} fill={seg.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pd-pie__center" aria-hidden="true">
          <span className="pd-pie__pct">{stats.productivityPct}%</span>
          <span className="pd-pie__label">Productivity</span>
          <span className="pd-pie__sub">Target {taskPct}%</span>
        </div>
      </div>

      <ul className="pd-pie-legend" aria-label="Chart legend">
        <li className="pd-pie-legend__item">
          <span className="pd-pie-legend__dot" style={{ background: COLORS.task }} />
          <span className="pd-pie-legend__name">Task hours</span>
          <span className="pd-pie-legend__val">{taskHours}h</span>
        </li>
        <li className="pd-pie-legend__item">
          <span className="pd-pie-legend__dot" style={{ background: COLORS.meeting }} />
          <span className="pd-pie-legend__name">Meeting hours</span>
          <span className="pd-pie-legend__val">{meetingHours}h</span>
        </li>        <li className="pd-pie-legend__item">
          <span className="pd-pie-legend__dot" style={{ background: isDark ? 'rgba(255,255,255,0.2)' : '#d1d5db' }} />
          <span className="pd-pie-legend__name">Clock in</span>
          <span className="pd-pie-legend__val">{clockInHours}h</span>
        </li>
      </ul>

      <div className="pd-pie-stats">
        <div className="pd-pie-stat">
          <span className="pd-pie-stat__num">{clockInHours}h</span>
          <span className="pd-pie-stat__lbl">Clock in</span>
        </div>
        <div className="pd-pie-stat__divider" aria-hidden="true" />
        <div className="pd-pie-stat">
          <span className="pd-pie-stat__num">{taskHours}h</span>
          <span className="pd-pie-stat__lbl">Task hours</span>
        </div>
        <div className="pd-pie-stat__divider" aria-hidden="true" />
        <div className="pd-pie-stat">
          <span className="pd-pie-stat__num">{weeklyTarget}h</span>
          <span className="pd-pie-stat__lbl">Target</span>
        </div>
      </div>
    </div>
  );
};
