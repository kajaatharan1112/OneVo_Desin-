import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { getChartTheme } from '../../../../../core/theme/chart-theme-config';
import { useTheme } from '../../../../../core/theme/theme-context';
import { createBaseChartOptions } from '../chart-theme';
import { usePanelChartHeight } from '../use-panel-chart-height';
import type { WeeklyTaskDay } from '../../../types/employee-task-overview.types';

interface WeeklyTaskTimelineChartProps {
  days: WeeklyTaskDay[];
}

export const WeeklyTaskTimelineChart: React.FC<WeeklyTaskTimelineChartProps> = ({ days }) => {
  const { theme } = useTheme();
  const { containerRef, height } = usePanelChartHeight(148);
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(
    () => createBaseChartOptions(chartTokens),
    [chartTokens]
  );

  const categories = days.map((day) => day.day);
  const finished = days.map((day) => day.finished);
  const pending = days.map((day) => day.pending);
  const peakValue = Math.max(...days.map((day) => day.finished + day.pending), 1);
  const chartHeight = Math.min(Math.max(height - 22, 110), 220);

  const options: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: {
        ...baseChartOptions.chart,
        type: 'bar',
        stacked: true,
        height: chartHeight,
        offsetY: 0
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '52%',
          borderRadius: 4,
          borderRadiusApplication: 'end',
          borderRadiusWhenStacked: 'all'
        }
      },
      grid: {
        borderColor: chartTokens.gridColor,
        strokeDashArray: 3,
        padding: { top: 4, right: 4, left: 0, bottom: 0 },
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } }
      },
      xaxis: {
        categories,
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
        min: 0,
        max: peakValue + 1,
        tickAmount: 4,
        labels: {
          style: {
            colors: chartTokens.textColor,
            fontSize: '9px',
            fontFamily: 'inherit'
          },
          formatter: (val: number) => `${Math.round(val)}`
        }
      },
      colors: [chartTokens.primary, chartTokens.lightBlue],
      fill: {
        type: 'solid',
        opacity: [chartTokens.primaryOpacity, chartTokens.lightBlueOpacity]
      },
      legend: { show: false },
      tooltip: {
        ...baseChartOptions.tooltip,
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => `${val} tasks`
        }
      }
    }),
    [baseChartOptions, categories, chartHeight, chartTokens, peakValue]
  );

  return (
    <div className="emp-dash-weekly-chart" ref={containerRef}>
      <div className="emp-dash-weekly-chart__area">
        <Chart
          type="bar"
          height={chartHeight}
          width="100%"
          options={options}
          series={[
            { name: 'Finished', data: finished },
            { name: 'Pending', data: pending }
          ]}
        />
      </div>
      <div className="emp-dash-weekly-chart__legend" aria-hidden="true">
        <span className="emp-dash-weekly-chart__legend-item">
          <span className="emp-dash-weekly-chart__legend-dot emp-dash-weekly-chart__legend-dot--finished" />
          Finished
        </span>
        <span className="emp-dash-weekly-chart__legend-item">
          <span className="emp-dash-weekly-chart__legend-dot emp-dash-weekly-chart__legend-dot--pending" />
          Pending
        </span>
      </div>
    </div>
  );
};
