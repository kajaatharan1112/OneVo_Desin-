import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../../../core/theme/theme-context';

interface WorkDashboardDonutProps {
  actual: number;
  target: number;
  centerPrimary: string;
  centerSecondary: string;
  centerTertiary?: string;
  ariaLabel: string;
}

export const WorkDashboardDonut: React.FC<WorkDashboardDonutProps> = ({
  actual,
  target,
  centerPrimary,
  centerSecondary,
  centerTertiary,
  ariaLabel
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const remaining = Math.max(target - actual, 0);

  const fillColor  = isDark ? '#5b8df6' : '#2563eb';
  const trackColor = isDark ? 'rgba(255,255,255,0.08)' : '#eaecf0';

  const segments = [
    { name: 'Actual',    value: actual    },
    { name: 'Remaining', value: remaining }
  ];

  return (
    <div className="wd-donut-wrap" role="img" aria-label={ariaLabel}>
      <div className="wd-donut">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={segments}
              dataKey="value"
              innerRadius="63%"
              outerRadius="88%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              stroke="none"
              strokeWidth={0}
              cornerRadius={10}
              isAnimationActive={false}
            >
              <Cell fill={fillColor} />
              <Cell fill={trackColor} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="wd-donut__center" aria-hidden="true">
          <span className="wd-donut__primary">{centerPrimary}</span>
          <span className="wd-donut__secondary">{centerSecondary}</span>
          {centerTertiary && (
            <span className="wd-donut__tertiary">{centerTertiary}</span>
          )}
        </div>
      </div>
    </div>
  );
};
