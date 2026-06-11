import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Clock } from 'lucide-react';
import { getChartTheme } from '../../../../../core/theme/chart-theme-config';
import { useTheme } from '../../../../../core/theme/theme-context';
import { createBaseChartOptions } from '../../task-overview/chart-theme';
import { usePanelChartHeight } from '../../task-overview/use-panel-chart-height';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

interface ScheduleTimeBreakdownPanelProps {
  variant?: 'default' | 'compact';
}

export const ScheduleTimeBreakdownPanel: React.FC<ScheduleTimeBreakdownPanelProps> = ({
  variant = 'default'
}) => {
  const { timeBreakdown, dateLabel, nextMeeting } = ceoDashboardData.schedule;
  const isCompact = variant === 'compact';
  const { theme } = useTheme();
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(() => createBaseChartOptions(chartTokens), [chartTokens]);
  const { containerRef, height } = usePanelChartHeight(isCompact ? 72 : 80);
  const chartSize = Math.min(Math.max(height, isCompact ? 64 : 72), isCompact ? 96 : 110);

  const options: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: { ...baseChartOptions.chart, type: 'donut', height: chartSize, width: chartSize },
      labels: timeBreakdown.map((item) => item.label),
      colors: timeBreakdown.map((item) => item.colorVar),
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: { size: '65%', labels: { show: false } }
        }
      },
      legend: { show: false },
      dataLabels: { enabled: false },
      tooltip: {
        ...baseChartOptions.tooltip,
        y: { formatter: (val: number) => `${val} hrs` }
      }
    }),
    [baseChartOptions, chartSize, timeBreakdown]
  );

  return (
    <article
      className={`cwo-widget ceo-sched-cell--breakdown${isCompact ? ' ceo-sched-cell--breakdown-compact' : ''}`}
    >
      <header className="cwo-widget__head">
        <Clock size={16} aria-hidden="true" />
        <h4 className="cwo-widget__title">Time Breakdown</h4>
      </header>

      {!isCompact && (
        <>
          <p className="ceo-sched-breakdown__date">{dateLabel}</p>
          <p className="ceo-sched-breakdown__next">{nextMeeting}</p>
        </>
      )}

      <div ref={containerRef} className="ceo-sched-breakdown__chart-wrap">
        <Chart
          type="donut"
          height={chartSize}
          width={chartSize}
          options={options}
          series={timeBreakdown.map((item) => item.hours)}
        />
      </div>

      <ul className="ceo-sched-breakdown__legend" aria-label="Time breakdown legend">
        {timeBreakdown.map((item) => (
          <li key={item.label} className="ceo-sched-breakdown__legend-item">
            <span
              className="ceo-sched-breakdown__legend-dot"
              style={{ background: item.colorVar }}
              aria-hidden="true"
            />
            <span className="ceo-sched-breakdown__legend-label">{item.label}</span>
            <span className="ceo-sched-breakdown__legend-value">{item.hours}h</span>
          </li>
        ))}
      </ul>
    </article>
  );
};
