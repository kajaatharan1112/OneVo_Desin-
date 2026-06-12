import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { TrendingUp } from 'lucide-react';
import { getChartTheme } from '../../../../../core/theme/chart-theme-config';
import { useTheme } from '../../../../../core/theme/theme-context';
import { createBaseChartOptions } from '../../task-overview/chart-theme';
import { usePanelChartHeight } from '../../task-overview/use-panel-chart-height';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

export const WorkforceWeeklyTrendChart: React.FC = () => {
  const { theme } = useTheme();
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(
    () => createBaseChartOptions(chartTokens),
    [chartTokens]
  );
  const { containerRef, height } = usePanelChartHeight(96);
  const chartHeight = Math.max(height, 88);
  const { weeklyAttendanceTrend, weeklyTrendSummary } = ceoDashboardData.workforce;

  const weekdayTrend = weeklyAttendanceTrend.filter(
    (point) => !['Sat', 'Sun'].includes(point.day)
  );

  const barColors = weekdayTrend.map((point) =>
    point.rate >= weeklyTrendSummary.target
      ? (chartTokens.palette[2] ?? '#10b981')
      : '#f59e0b'
  );

  const options: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: { ...baseChartOptions.chart, type: 'bar', height: chartHeight, offsetY: 0, toolbar: { show: false } },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '54%',
          borderRadius: 5,
          borderRadiusApplication: 'end',
          distributed: true,
          dataLabels: { position: 'top' }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val}%`,
        offsetY: -6,
        style: {
          fontSize: '9px',
          fontWeight: 600,
          colors: [chartTokens.textColor],
          fontFamily: 'inherit'
        },
        background: { enabled: false }
      },
      colors: barColors,
      grid: {
        borderColor: chartTokens.gridColor,
        strokeDashArray: 3,
        padding: { top: 8, right: 4, left: 0, bottom: 0 },
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } }
      },
      annotations: {
        yaxis: [
          {
            y: weeklyTrendSummary.target,
            borderColor: chartTokens.primary,
            strokeDashArray: 4,
            borderWidth: 1.5,
            label: {
              text: `${weeklyTrendSummary.target}%`,
              position: 'left',
              offsetX: 4,
              style: {
                color: chartTokens.primary,
                fontSize: '8px',
                fontWeight: 600,
                background: 'transparent',
                padding: { left: 0, right: 0, top: 0, bottom: 0 }
              }
            }
          }
        ]
      },
      xaxis: {
        categories: weekdayTrend.map((point) => point.day),
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
        min: 60,
        max: 100,
        tickAmount: 4,
        labels: {
          style: {
            colors: chartTokens.textColor,
            fontSize: '8px',
            fontFamily: 'inherit'
          },
          formatter: (val: number) => `${Math.round(val)}%`
        }
      },
      legend: { show: false },
      tooltip: {
        ...baseChartOptions.tooltip,
        y: { formatter: (val: number) => `${val}% attendance` }
      }
    }),
    [barColors, baseChartOptions, chartHeight, chartTokens, weekdayTrend, weeklyTrendSummary.target]
  );

  return (
    <article className="eto-widget cwo-cell--trend cwf-panel cwf-panel--trend">
      <header className="eto-widget__head cwf-trend__head">
        <TrendingUp size={16} aria-hidden="true" />
        <h3 className="eto-widget__title">Weekly Attendance Trend</h3>
      </header>
      <div ref={containerRef} className="cwf-trend__chart">
        <Chart
          type="bar"
          height={chartHeight}
          width="100%"
          options={options}
          series={[
            {
              name: 'Attendance',
              data: weekdayTrend.map((point) => point.rate)
            }
          ]}
        />
      </div>
    </article>
  );
};
