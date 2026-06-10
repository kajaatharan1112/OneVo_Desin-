import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { TrendingUp } from 'lucide-react';
import { getChartTheme } from '../../../../../core/theme/chart-theme-config';
import { useTheme } from '../../../../../core/theme/theme-context';
import { createBaseChartOptions } from '../../task-overview/chart-theme';
import { usePanelChartHeight } from '../../task-overview/use-panel-chart-height';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

export const ProjectDeliveryTrendPanel: React.FC = () => {
  const { deliveryTrend, summary } = ceoDashboardData.projects;
  const { theme } = useTheme();
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(() => createBaseChartOptions(chartTokens), [chartTokens]);
  const { containerRef, height } = usePanelChartHeight(100);
  const chartHeight = Math.max(height, 88);

  const latestPoint = deliveryTrend[deliveryTrend.length - 1];

  const options: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: { ...baseChartOptions.chart, type: 'bar', height: chartHeight, offsetY: 0 },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '52%',
          borderRadius: 5,
          borderRadiusApplication: 'end',
          distributed: true,
          dataLabels: { position: 'top' }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val}%`,
        offsetY: -14,
        style: { fontSize: '8px', fontWeight: 700, colors: [chartTokens.textColor] }
      },
      colors: deliveryTrend.map((_point, index) =>
        index === deliveryTrend.length - 1 ? chartTokens.primary : chartTokens.lightBlue
      ),
      grid: {
        borderColor: chartTokens.gridColor,
        strokeDashArray: 3,
        padding: { top: 16, right: 4, left: 0, bottom: 0 },
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } }
      },
      xaxis: {
        categories: deliveryTrend.map((point) => point.month),
        labels: {
          style: {
            colors: chartTokens.textColor,
            fontSize: '9px',
            fontFamily: 'inherit',
            fontWeight: 600
          }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        min: Math.max(0, Math.min(...deliveryTrend.map((p) => p.rate)) - 8),
        max: 100,
        tickAmount: 3,
        labels: {
          style: { colors: chartTokens.textColor, fontSize: '8px', fontFamily: 'inherit' },
          formatter: (val: number) => `${Math.round(val)}%`
        }
      },
      legend: { show: false },
      tooltip: { ...baseChartOptions.tooltip, y: { formatter: (val: number) => `${val}% on-time` } }
    }),
    [baseChartOptions, chartHeight, chartTokens, deliveryTrend]
  );

  return (
    <article className="cwo-widget cwo-widget--trend cph-cell--trend">
      <header className="cwo-widget__head">
        <TrendingUp size={16} aria-hidden="true" />
        <h4 className="cwo-widget__title">On-time delivery rate</h4>
        <span className="cwo-widget__tab">
          {latestPoint.rate}% · {summary.onTimeDeltaLabel}
        </span>
      </header>
      <div ref={containerRef} className="cwo-trend__chart cwo-trend__chart--solo">
        <Chart
          type="bar"
          height={chartHeight}
          width="100%"
          options={options}
          series={[{ name: 'On-time', data: deliveryTrend.map((point) => point.rate) }]}
        />
      </div>
    </article>
  );
};
