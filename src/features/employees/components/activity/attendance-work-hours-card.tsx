import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Timer } from 'lucide-react';
import { useTheme } from '../../../../core/theme/theme-context';
import { getChartTheme } from '../../../../core/theme/chart-theme-config';
import type { AttendanceWorkHoursSummary } from '../../data/attendance-tab.mock';
import { DashboardCard } from '../task-overview/cards/dashboard-card';

interface AttendanceWorkHoursCardProps {
  summary: AttendanceWorkHoursSummary;
  className?: string;
}

export const AttendanceWorkHoursCard: React.FC<AttendanceWorkHoursCardProps> = ({
  summary,
  className = ''
}) => {
  const { theme } = useTheme();
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);

  const segments = useMemo(
    () => [
      { name: 'Logged', value: summary.completedPercent },
      { name: 'Remaining', value: 100 - summary.completedPercent }
    ],
    [summary.completedPercent]
  );

  const sideLabels = [
    { id: 'break', label: 'Break', value: summary.breakDuration },
    { id: 'remaining', label: 'Remaining', value: summary.remaining }
  ] as const;

  return (
    <DashboardCard
      title="Work Hours Summary"
      icon={<Timer size={15} aria-hidden="true" />}
      className={`attendance-tab__cell attendance-tab__cell--static attendance-tab__cell--work-hours ${className}`.trim()}
      ariaLabel="Work hours summary"
    >
      <div className="attendance-work-hours">
        <div className="attendance-work-hours__main">
          <div
            className="attendance-work-hours__chart-wrap"
            role="img"
            aria-label={`${summary.completedPercent}% logged, ${summary.completed} of ${summary.expected}`}
          >
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={segments}
                  dataKey="value"
                  innerRadius="58%"
                  outerRadius="92%"
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={0}
                  stroke={chartTokens.gridColor}
                  strokeWidth={1}
                  isAnimationActive={false}
                >
                  <Cell fill={chartTokens.primary} fillOpacity={chartTokens.primaryOpacity} />
                  <Cell fill={chartTokens.ringTrack} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="attendance-work-hours__center" aria-hidden="true">
              <span className="attendance-work-hours__percent">{summary.completedPercent}%</span>
              <span className="attendance-work-hours__ratio">
                {summary.completed} of {summary.expected}
              </span>
            </div>
          </div>

          <div className="attendance-work-hours__side-labels" aria-label="Break and remaining hours">
            {sideLabels.map((item) => (
              <div key={item.id} className={`attendance-work-hours__side-label attendance-work-hours__side-label--${item.id}`}>
                <span className="attendance-work-hours__side-label-key">{item.label}</span>
                <span className="attendance-work-hours__side-label-val">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};
