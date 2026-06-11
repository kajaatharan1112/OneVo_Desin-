import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { getChartTheme } from '../../../../../core/theme/chart-theme-config';
import { useTheme } from '../../../../../core/theme/theme-context';
import { createBaseChartOptions } from '../chart-theme';
import { usePanelChartHeight } from '../use-panel-chart-height';
import type { WorkHoursBreakdown } from '../../../types/employee-task-overview.types';

interface WorkHoursDonutChartProps {
  breakdown: WorkHoursBreakdown;
  percent: number;
}

export const WorkHoursDonutChart: React.FC<WorkHoursDonutChartProps> = ({
  breakdown,
  percent
}) => {
  const { theme } = useTheme();
  const { containerRef, height } = usePanelChartHeight(148);
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(
    () => createBaseChartOptions(chartTokens),
    [chartTokens]
  );

  const series = [breakdown.focus, breakdown.meeting, breakdown.break];
  const labels = ['Focus', 'Meeting', 'Break'];
  const chartSize = Math.min(Math.max(height - 56, 110), 200);

  const options: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: {
        ...baseChartOptions.chart,
        type: 'donut',
        height: chartSize
      },
      labels,
      colors: [chartTokens.primary, chartTokens.lightBlue, chartTokens.palette[3]],
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: '72%',
            labels: {
              show: false
            }
          }
        }
      },
      stroke: { width: 0 },
      legend: { show: false },
      tooltip: {
        ...baseChartOptions.tooltip,
        y: {
          formatter: (value: number) => `${value}h`
        }
      }
    }),
    [baseChartOptions, chartSize, chartTokens]
  );

  return (
    <div className="emp-dash-donut" ref={containerRef}>
      <div className="emp-dash-donut__chart">
        <Chart type="donut" height={chartSize} width="100%" options={options} series={series} />
        <div className="emp-dash-donut__center" aria-hidden="true">
          <span className="emp-dash-donut__center-value">{breakdown.completed}h</span>
          <span className="emp-dash-donut__center-label">of {breakdown.expected}h</span>
        </div>
      </div>
      <ul className="emp-dash-donut__legend">
        {labels.map((label, index) => (
          <li key={label} className="emp-dash-donut__legend-item">
            <span className={`emp-dash-donut__legend-dot emp-dash-donut__legend-dot--${index}`} />
            <span>{label}</span>
            <strong>{series[index]}h</strong>
          </li>
        ))}
      </ul>
      <p className="emp-dash-donut__caption">{percent}% of weekly target logged</p>
    </div>
  );
};
