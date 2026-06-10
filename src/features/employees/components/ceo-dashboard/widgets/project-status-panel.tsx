import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { PieChart } from 'lucide-react';
import { getChartTheme } from '../../../../../core/theme/chart-theme-config';
import { useTheme } from '../../../../../core/theme/theme-context';
import { createBaseChartOptions } from '../../task-overview/chart-theme';
import { usePanelChartHeight } from '../../task-overview/use-panel-chart-height';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

export const ProjectStatusPanel: React.FC = () => {
  const { statusBreakdown, summary } = ceoDashboardData.projects;
  const { theme } = useTheme();
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(
    () => createBaseChartOptions(chartTokens),
    [chartTokens]
  );
  const { containerRef, height } = usePanelChartHeight(100);
  const chartSize = Math.max(height, 88);

  const options: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: {
        ...baseChartOptions.chart,
        type: 'donut',
        height: chartSize,
        width: chartSize
      },
      labels: statusBreakdown.map((item) => item.label),
      colors: [
        chartTokens.primary,
        chartTokens.palette[2],
        chartTokens.palette[3],
        chartTokens.palette[4]
      ],
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: { size: '68%', labels: { show: false } }
        }
      },
      legend: { show: false },
      tooltip: {
        ...baseChartOptions.tooltip,
        y: { formatter: (val: number) => `${val} projects` }
      }
    }),
    [baseChartOptions, chartSize, chartTokens, statusBreakdown]
  );

  return (
    <article className="cwo-widget cwo-widget--pie cph-cell--status">
      <header className="cwo-widget__head">
        <PieChart size={16} aria-hidden="true" />
        <h4 className="cwo-widget__title">Project status</h4>
        <span className="cwo-widget__tab">{summary.onTrack} on track</span>
      </header>
      <div ref={containerRef} className="cwo-pie-wrap">
        <Chart
          type="donut"
          height={chartSize}
          width={chartSize}
          options={options}
          series={statusBreakdown.map((item) => item.count)}
        />
        <div className="cwo-pie-wrap__center" aria-hidden="true">
          <span className="cwo-pie-wrap__value">{summary.activeProjects}</span>
          <span className="cwo-pie-wrap__label">Projects</span>
        </div>
      </div>
      <ul className="cwo-mini-legend">
        {statusBreakdown.map((item, index) => (
          <li key={item.id} className="cwo-mini-legend__item">
            <span
              className={`cwo-mini-legend__dot cwo-mini-legend__dot--tone-${index + 1}`}
              aria-hidden="true"
            />
            <span className="cwo-mini-legend__label">{item.label}</span>
            <span className="cwo-mini-legend__value">{item.count}</span>
          </li>
        ))}
      </ul>
    </article>
  );
};
