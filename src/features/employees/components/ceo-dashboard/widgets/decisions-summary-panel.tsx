import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { ClipboardCheck } from 'lucide-react';
import { getChartTheme } from '../../../../../core/theme/chart-theme-config';
import { useTheme } from '../../../../../core/theme/theme-context';
import { createBaseChartOptions } from '../../task-overview/chart-theme';
import { usePanelChartHeight } from '../../task-overview/use-panel-chart-height';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

export const DecisionsSummaryPanel: React.FC = () => {
  const { summary } = ceoDashboardData.decisions;
  const { theme } = useTheme();
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(
    () => createBaseChartOptions(chartTokens),
    [chartTokens]
  );
  const { containerRef, height } = usePanelChartHeight(88);
  const chartSize = Math.max(height, 80);
  const within48 = summary.pendingApprovals - summary.waitingOver48Hours;
  const onTimePct = Math.round((within48 / summary.pendingApprovals) * 100);

  const options: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: {
        ...baseChartOptions.chart,
        type: 'radialBar',
        height: chartSize,
        width: chartSize
      },
      series: [onTimePct],
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
              formatter: () => `${summary.pendingApprovals}`
            }
          }
        }
      },
      labels: ['Pending']
    }),
    [baseChartOptions, chartSize, chartTokens, onTimePct, summary.pendingApprovals]
  );

  return (
    <article className="cwo-widget cwo-widget--pie cdo-cell--summary">
      <header className="cwo-widget__head">
        <ClipboardCheck size={16} aria-hidden="true" />
        <h4 className="cwo-widget__title">Decision summary</h4>
      </header>
      <div ref={containerRef} className="cwo-pie-wrap">
        <Chart
          type="radialBar"
          height={chartSize}
          width={chartSize}
          options={options}
          series={[onTimePct]}
        />
      </div>
      <div className="cwo-tile-grid cwo-tile-grid--two">
        <div className="cwo-tile cwo-tile--accent">
          <span className="cwo-tile__value">{summary.urgentDecisions}</span>
          <span className="cwo-tile__label">Urgent</span>
        </div>
        <div className="cwo-tile">
          <span className="cwo-tile__value cwo-tile__value--warn">
            {summary.waitingOver48Hours}
          </span>
          <span className="cwo-tile__label">Over 48h</span>
        </div>
      </div>
    </article>
  );
};
