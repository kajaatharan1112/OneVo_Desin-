import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Target } from 'lucide-react';
import { useTheme } from '../../../../core/theme/theme-context';
import { getChartTheme } from '../../../../core/theme/chart-theme-config';
import type { WorkTaskCast } from '../../data/work-tab.mock';
import { DashboardCard } from './cards/dashboard-card';

interface TaskCastCardProps {
  data: WorkTaskCast;
  className?: string;
}

export const TaskCastCard: React.FC<TaskCastCardProps> = ({ data, className = '' }) => {
  const { theme } = useTheme();
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const remaining = data.planned - data.completed;

  const segments = useMemo(
    () => [
      { name: 'Done', value: data.completed },
      { name: 'Remaining', value: remaining }
    ],
    [data.completed, remaining]
  );

  return (
    <DashboardCard
      title="Task Cast"
      icon={<Target size={15} aria-hidden="true" />}
      className={`work-tab__cell work-tab__cell--static ${className}`.trim()}
      ariaLabel="Task cast summary"
    >
      <div className="work-task-cast">
        <div className="work-task-cast__chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={segments}
                dataKey="value"
                innerRadius="58%"
                outerRadius="78%"
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
          <div className="work-task-cast__center" aria-hidden="true">
            <span className="work-task-cast__ratio">
              {data.completed}/{data.planned}
            </span>
            <span className="work-task-cast__percent">{data.percent}%</span>
          </div>
        </div>
        <dl className="work-task-cast__stats">
          {data.stats.map((stat) => (
            <div key={stat.id}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </DashboardCard>
  );
};
