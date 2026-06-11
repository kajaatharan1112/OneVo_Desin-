import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { ShieldAlert } from 'lucide-react';
import { getChartTheme } from '../../../../../core/theme/chart-theme-config';
import { useTheme } from '../../../../../core/theme/theme-context';
import { createBaseChartOptions } from '../../task-overview/chart-theme';
import { usePanelChartHeight } from '../../task-overview/use-panel-chart-height';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

export const ProjectRiskPanel: React.FC = () => {
  const { riskBreakdown } = ceoDashboardData.projects;
  const { theme } = useTheme();
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(
    () => createBaseChartOptions(chartTokens),
    [chartTokens]
  );
  const { containerRef, height } = usePanelChartHeight(100);
  const chartHeight = Math.max(height, 88);
  const total = riskBreakdown.reduce((sum, item) => sum + item.count, 0);

  const options: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: {
        ...baseChartOptions.chart,
        type: 'bar',
        height: chartHeight
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '58%',
          borderRadius: 4,
          borderRadiusApplication: 'end',
          distributed: true
        }
      },
      colors: chartTokens.palette.slice(0, riskBreakdown.length),
      grid: { show: false },
      xaxis: {
        categories: riskBreakdown.map((item) => item.label),
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: {
          style: {
            colors: chartTokens.textColor,
            fontSize: '8px',
            fontFamily: 'inherit',
            fontWeight: 600
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val}`,
        style: {
          fontSize: '9px',
          fontWeight: 700,
          colors: [chartTokens.textColor]
        }
      },
      legend: { show: false },
      tooltip: {
        ...baseChartOptions.tooltip,
        y: { formatter: (val: number) => `${val} risks` }
      }
    }),
    [baseChartOptions, chartHeight, chartTokens, riskBreakdown]
  );

  return (
    <article className="cwo-widget cph-cell--risk">
      <header className="cwo-widget__head">
        <ShieldAlert size={16} aria-hidden="true" />
        <h4 className="cwo-widget__title">Risk breakdown</h4>
        <span className="cwo-widget__tab">{total} risks</span>
      </header>
      <div ref={containerRef} className="cwo-trend__chart">
        <Chart
          type="bar"
          height={chartHeight}
          width="100%"
          options={options}
          series={[{ name: 'Risks', data: riskBreakdown.map((item) => item.count) }]}
        />
      </div>
    </article>
  );
};
