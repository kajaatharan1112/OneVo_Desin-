import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Gauge } from 'lucide-react';
import { getChartTheme } from '../../../../../core/theme/chart-theme-config';
import { useTheme } from '../../../../../core/theme/theme-context';
import { createBaseChartOptions } from '../../task-overview/chart-theme';
import { usePanelChartHeight } from '../../task-overview/use-panel-chart-height';
import { ceoDashboardData } from '../data/ceo-dashboard.data';
import { WidgetLead } from './widget-lead';

export const ProductivitySummaryPanel: React.FC = () => {
  const { summary } = ceoDashboardData.productivity;
  const { theme } = useTheme();
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(
    () => createBaseChartOptions(chartTokens),
    [chartTokens]
  );
  const { containerRef, height } = usePanelChartHeight(88);
  const chartSize = Math.max(height, 80);

  const options: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: {
        ...baseChartOptions.chart,
        type: 'radialBar',
        height: chartSize,
        width: chartSize
      },
      series: [summary.scorePercent],
      colors: [chartTokens.primary],
      stroke: { lineCap: 'round' },
      plotOptions: {
        radialBar: {
          hollow: { size: '58%' },
          track: { background: chartTokens.ringTrack },
          dataLabels: {
            show: true,
            name: {
              show: true,
              fontSize: '9px',
              fontWeight: 500,
              color: chartTokens.textColor,
              offsetY: 18
            },
            value: {
              show: true,
              fontSize: '16px',
              fontWeight: 700,
              color: chartTokens.primary,
              offsetY: -6,
              formatter: () => `${summary.scorePercent}%`
            }
          }
        }
      },
      labels: ['Productivity']
    }),
    [baseChartOptions, chartSize, chartTokens, summary.scorePercent]
  );

  return (
    <article className="cwo-widget cwo-widget--pie cpr-cell--summary">
      <header className="cwo-widget__head">
        <Gauge size={16} aria-hidden="true" />
        <h4 className="cwo-widget__title">Company productivity</h4>
      </header>
      <WidgetLead
        value={`${summary.scorePercent}% task completion rate`}
        caption={summary.weekDeltaLabel}
        tone={summary.overdueTasks + summary.blockedTasks > 0 ? 'warn' : 'good'}
      />
      <div ref={containerRef} className="cwo-pie-wrap">
        <Chart
          type="radialBar"
          height={chartSize}
          width={chartSize}
          options={options}
          series={[summary.scorePercent]}
        />
      </div>
      <div className="cwo-tile-grid cwo-tile-grid--three">
        <div className="cwo-tile cwo-tile--accent">
          <span className="cwo-tile__value">{summary.completedToday}</span>
          <span className="cwo-tile__label">Completed today</span>
        </div>
        <div className="cwo-tile">
          <span className="cwo-tile__value cwo-tile__value--warn">{summary.overdueTasks}</span>
          <span className="cwo-tile__label">Overdue</span>
        </div>
        <div className="cwo-tile">
          <span className="cwo-tile__value cwo-tile__value--warn">{summary.blockedTasks}</span>
          <span className="cwo-tile__label">Blocked</span>
        </div>
      </div>
    </article>
  );
};
