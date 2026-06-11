import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { TrendingUp } from 'lucide-react';
import { getChartTheme } from '../../../../../core/theme/chart-theme-config';
import { useTheme } from '../../../../../core/theme/theme-context';
import { createBaseChartOptions } from '../../task-overview/chart-theme';
import { usePanelChartHeight } from '../../task-overview/use-panel-chart-height';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

const TREND_TARGET = 85;

export const PerformanceTrendPanel: React.FC = () => {
  const { monthlyTrend, summary } = ceoDashboardData.companyPerformance;
  const { theme } = useTheme();
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(() => createBaseChartOptions(chartTokens), [chartTokens]);
  const { containerRef, height } = usePanelChartHeight(96);

  const firstPoint = monthlyTrend[0];
  const latestPoint = monthlyTrend[monthlyTrend.length - 1];
  const growthPoints = latestPoint.rate - firstPoint.rate;

  const options: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: {
        ...baseChartOptions.chart,
        type: 'bar',
        height,
        offsetY: 0,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '58%',
          borderRadius: 5,
          borderRadiusApplication: 'end'
        }
      },
      grid: {
        borderColor: chartTokens.gridColor,
        strokeDashArray: 3,
        padding: { top: 6, right: 4, left: 0, bottom: 0 },
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } }
      },
      xaxis: {
        categories: monthlyTrend.map((point) => point.month),
        labels: {
          style: {
            colors: chartTokens.textColor,
            fontSize: '10px',
            fontFamily: 'inherit',
            fontWeight: 600
          }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        min: Math.max(0, Math.min(...monthlyTrend.map((p) => p.rate)) - 8),
        max: 100,
        tickAmount: 4,
        labels: {
          style: {
            colors: chartTokens.textColor,
            fontSize: '9px',
            fontFamily: 'inherit'
          },
          formatter: (val: number) => `${Math.round(val)}%`
        }
      },
      colors: [chartTokens.primary],
      fill: {
        type: 'solid',
        opacity: chartTokens.primaryOpacity
      },
      legend: { show: false },
      tooltip: {
        ...baseChartOptions.tooltip,
        y: { formatter: (val: number) => `${val}% company performance` }
      }
    }),
    [baseChartOptions, chartTokens, height, monthlyTrend]
  );

  return (
    <article className="eto-widget eto-weekly cpg-cell--trend">
      <header className="eto-widget__head">
        <TrendingUp size={16} aria-hidden="true" />
        <h3 className="eto-widget__title">5-month trend</h3>
        <span className="eto-widget__tab">{summary.monthDeltaLabel}</span>
      </header>

      <div className="eto-weekly__stats">
        <div className="eto-weekly__stat">
          <span className="eto-weekly__stat-value">{firstPoint.rate}%</span>
          <span className="eto-weekly__stat-label">{firstPoint.month}</span>
        </div>
        <div className="eto-weekly__stat">
          <span className="eto-weekly__stat-value">
            {growthPoints >= 0 ? '+' : ''}
            {growthPoints}
          </span>
          <span className="eto-weekly__stat-label">Growth pts</span>
        </div>
        <div className="eto-weekly__stat eto-weekly__stat--accent">
          <span className="eto-weekly__stat-value">{latestPoint.rate}%</span>
          <span className="eto-weekly__stat-label">{latestPoint.month}</span>
        </div>
      </div>

      <div ref={containerRef} className="eto-weekly__chart-area">
        <Chart
          type="bar"
          height={height}
          width="100%"
          options={options}
          series={[{ name: 'Performance', data: monthlyTrend.map((point) => point.rate) }]}
        />
      </div>

      <div className="eto-weekly__legend" aria-hidden="true">
        <span className="eto-weekly__legend-item">
          <span className="eto-weekly__legend-dot eto-weekly__legend-dot--finished" />
          Target {TREND_TARGET}%
        </span>
        <span className="eto-weekly__legend-item">
          <span className="eto-weekly__legend-dot eto-weekly__legend-dot--pending" />
          Monthly score
        </span>
      </div>
    </article>
  );
};
