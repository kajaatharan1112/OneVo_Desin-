import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { GanttChart } from 'lucide-react';
import { getChartTheme } from '../../../../../core/theme/chart-theme-config';
import { useTheme } from '../../../../../core/theme/theme-context';
import { useEmployeeData } from '../../../hooks/use-employee-data';
import { createBaseChartOptions } from '../chart-theme';
import { usePanelChartHeight } from '../use-panel-chart-height';

export const WeeklyTimelinePanel: React.FC = () => {
  const { weeklyPlan, sprintCompletedPercent } = useEmployeeData();
  const { theme } = useTheme();
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(
    () => createBaseChartOptions(chartTokens),
    [chartTokens]
  );
  const { containerRef, height } = usePanelChartHeight(96);

  const categories = weeklyPlan.map((d) => d.day);
  const finished = weeklyPlan.map((d) => d.finished);
  const pending = weeklyPlan.map((d) => d.pending);

  const totalFinished = finished.reduce((a, b) => a + b, 0);
  const totalPending = pending.reduce((a, b) => a + b, 0);
  const totalPlanned = weeklyPlan.reduce((a, d) => a + d.planned, 0);
  const completionPct = totalPlanned > 0 ? Math.round((totalFinished / totalPlanned) * 100) : 0;
  const sprintPct = sprintCompletedPercent;
  const peakValue = Math.max(...weeklyPlan.map((d) => d.finished + d.pending), 1);

  const options: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: {
        ...baseChartOptions.chart,
        type: 'bar',
        stacked: true,
        height,
        offsetY: 0
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '58%',
          borderRadius: 5,
          borderRadiusApplication: 'end',
          borderRadiusWhenStacked: 'all'
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
    [baseChartOptions, categories, chartTokens, height, peakValue]
  );

  return (
    <article className="eto-widget eto-weekly eto-cell--timeline">
      <header className="eto-widget__head">
        <GanttChart size={16} aria-hidden="true" />
        <h3 className="eto-widget__title">Weekly timeline</h3>
        <span className="eto-widget__tab">{sprintPct}% sprint completed</span>
      </header>

      <div className="eto-weekly__stats">
        <div className="eto-weekly__stat">
          <span className="eto-weekly__stat-value">{totalFinished}</span>
          <span className="eto-weekly__stat-label">Finished</span>
        </div>
        <div className="eto-weekly__stat">
          <span className="eto-weekly__stat-value">{totalPending}</span>
          <span className="eto-weekly__stat-label">Pending</span>
        </div>
        <div className="eto-weekly__stat eto-weekly__stat--accent">
          <span className="eto-weekly__stat-value">{completionPct}%</span>
          <span className="eto-weekly__stat-label">Complete</span>
        </div>
      </div>

      <div ref={containerRef} className="eto-weekly__chart-area">
        <Chart
          type="bar"
          height={height}
          width="100%"
          options={options}
          series={[
            { name: 'Finished', data: finished },
            { name: 'Pending', data: pending }
          ]}
        />
      </div>

      <div className="eto-weekly__legend" aria-hidden="true">
        <span className="eto-weekly__legend-item">
          <span className="eto-weekly__legend-dot eto-weekly__legend-dot--finished" />
          Finished
        </span>
        <span className="eto-weekly__legend-item">
          <span className="eto-weekly__legend-dot eto-weekly__legend-dot--pending" />
          Pending
        </span>
      </div>
    </article>
  );
};
