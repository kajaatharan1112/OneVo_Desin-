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

export const PerformanceSummaryPanel: React.FC = () => {
  const { summary } = ceoDashboardData.companyPerformance;
  const { theme } = useTheme();
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(() => createBaseChartOptions(chartTokens), [chartTokens]);
  const { containerRef, height } = usePanelChartHeight(88);
  const chartSize = Math.max(height, 80);

  const options: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: { ...baseChartOptions.chart, type: 'radialBar', height: chartSize, width: chartSize },
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
      labels: ['Overall score']
    }),
    [baseChartOptions, chartSize, chartTokens, summary.scorePercent]
  );

  return (
    <article className="cwo-widget cwo-widget--pie cpg-cell--summary">
      <header className="cwo-widget__head">
        <Gauge size={16} aria-hidden="true" />
        <h4 className="cwo-widget__title">Overall score</h4>
      </header>
      <WidgetLead
        value={`${summary.scorePercent}% — ${summary.healthLabel} health`}
        caption={`Company-wide performance score · ${summary.monthDeltaLabel}`}
        tone="good"
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
    </article>
  );
};
