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
  const { containerRef, height } = usePanelChartHeight(88);
  const chartHeight = Math.max(height, 72);
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
          columnWidth: '48%',
          borderRadius: 6,
          borderRadiusApplication: 'end',
          distributed: true,
          dataLabels: { position: 'top' }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val}%`,
        offsetY: -10,
        style: { fontSize: '8px', fontWeight: 700, colors: [chartTokens.textColor] }
      },
      colors: barColors,
      grid: {
        borderColor: chartTokens.gridColor,
        strokeDashArray: 4,
        padding: { top: 12, right: 8, left: 4, bottom: 0 },
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } }
      },
      annotations: {
        yaxis: [
          {
            y: weeklyTrendSummary.target,
            borderColor: chartTokens.primary,
            strokeDashArray: 5,
            borderWidth: 2,
            label: {
              text: `Target ${weeklyTrendSummary.target}%`,
              position: 'right',
              offsetX: 0,
              style: {
                color: chartTokens.primary,
                fontSize: '8px',
                fontWeight: 700,
                background: 'transparent'
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
      <header className="eto-widget__head">
        <TrendingUp size={16} aria-hidden="true" />
        <h3 className="eto-widget__title">Weekly Attendance Trend</h3>
        <span className="eto-widget__tab">
          {weeklyTrendSummary.weekdayAvg}% avg · peak {weeklyTrendSummary.peakDay}
        </span>
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
      <div className="cwf-kpi-pills">
        <span className="cwf-kpi-pill">
          <span className="cwf-kpi-pill__label">Average</span>
          <span className="cwf-kpi-pill__value">{weeklyTrendSummary.weekdayAvg}%</span>
        </span>
        <span className="cwf-kpi-pill">
          <span className="cwf-kpi-pill__label">Peak</span>
          <span className="cwf-kpi-pill__value">
            {weeklyTrendSummary.peakDay} {weeklyTrendSummary.peakRate}%
          </span>
        </span>
        <span className="cwf-kpi-pill cwf-kpi-pill--warn">
          <span className="cwf-kpi-pill__label">Gap</span>
          <span className="cwf-kpi-pill__value">{weeklyTrendSummary.gapFromTarget}%</span>
        </span>
      </div>
    </article>
  );
};
