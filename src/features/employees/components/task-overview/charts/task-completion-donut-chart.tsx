import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { getChartTheme } from '../../../../../core/theme/chart-theme-config';
import { useTheme } from '../../../../../core/theme/theme-context';
import { createBaseChartOptions } from '../chart-theme';
import { usePanelChartHeight } from '../use-panel-chart-height';
import type { TaskCompletionMetrics } from '../../../types/employee-task-overview.types';

interface TaskCompletionDonutChartProps {
  metrics: TaskCompletionMetrics;
  percent: number;
}

export const TaskCompletionDonutChart: React.FC<TaskCompletionDonutChartProps> = ({
  metrics,
  percent
}) => {
  const { theme } = useTheme();
  const { containerRef, height } = usePanelChartHeight(148);
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(
    () => createBaseChartOptions(chartTokens),
    [chartTokens]
  );
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const chartSize = Math.min(Math.max(height - 28, 110), 200);

  const options: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: {
        ...baseChartOptions.chart,
        type: 'radialBar',
        height: chartSize,
        width: chartSize
      },
      series: [clampedPercent],
      colors: [chartTokens.primary],
      stroke: { lineCap: 'round' },
      fill: {
        type: 'solid',
        opacity: chartTokens.primaryOpacity
      },
      plotOptions: {
        radialBar: {
          startAngle: 0,
          endAngle: 360,
          hollow: {
            margin: 0,
            size: '62%',
            background: 'transparent'
          },
          track: {
            show: true,
            background: chartTokens.ringTrack,
            strokeWidth: '100%',
            margin: 0
          },
          dataLabels: {
            show: true,
            name: {
              show: true,
              fontSize: chartSize > 140 ? '11px' : '10px',
              fontWeight: 500,
              color: chartTokens.textColor,
              offsetY: 24,
              formatter: () => 'completed'
            },
            value: {
              show: true,
              fontSize: chartSize > 140 ? '22px' : '20px',
              fontWeight: 700,
              color: chartTokens.primary,
              offsetY: -8,
              formatter: () => `${metrics.completed}/${metrics.planned}`
            }
          }
        }
      }
    }),
    [baseChartOptions, chartSize, chartTokens, clampedPercent, metrics.completed, metrics.planned]
  );

  return (
    <div className="emp-dash-radial" ref={containerRef}>
      <div className="emp-dash-radial__chart">
        <Chart
          type="radialBar"
          height={chartSize}
          width={chartSize}
          options={options}
          series={[clampedPercent]}
        />
      </div>
      <p className="emp-dash-radial__caption">
        {metrics.completed} of {metrics.planned} planned tasks done · {clampedPercent}%
      </p>
    </div>
  );
};
