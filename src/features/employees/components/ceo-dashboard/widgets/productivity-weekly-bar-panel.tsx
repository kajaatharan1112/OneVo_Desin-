import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { TrendingUp } from 'lucide-react';
import { getChartTheme } from '../../../../../core/theme/chart-theme-config';
import { useTheme } from '../../../../../core/theme/theme-context';
import { createBaseChartOptions } from '../../task-overview/chart-theme';
import { usePanelChartHeight } from '../../task-overview/use-panel-chart-height';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

export const ProductivityWeeklyBarPanel: React.FC = () => {
  const { weeklyTrend, weeklyTrendSummary } = ceoDashboardData.productivity;
  const { theme } = useTheme();
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(
    () => createBaseChartOptions(chartTokens),
    [chartTokens]
  );
  const { containerRef, height } = usePanelChartHeight(100);
  const chartHeight = Math.max(height, 88);

  const weekdayTrend = weeklyTrend.filter((point) => !['Sat', 'Sun'].includes(point.day));

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
          dataLabels: { position: 'top' }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val}%`,
        offsetY: -14,
        style: { fontSize: '8px', fontWeight: 700, colors: [chartTokens.textColor] }
      },
      colors: [chartTokens.primary],
      grid: {
        borderColor: chartTokens.gridColor,
        strokeDashArray: 3,
        padding: { top: 16, right: 4, left: 0, bottom: 0 },
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } }
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
      tooltip: {
        ...baseChartOptions.tooltip,
        y: { formatter: (val: number) => `${val}% productivity` }
      }
    }),
    [baseChartOptions, chartHeight, chartTokens, weekdayTrend]
  );

  return (
    <article className="eto-widget cpr-panel cpr-cell--weekly cpr-trend">
      <header className="cpr-panel__head">
        <div className="cpr-panel__title-block">
          <span className="cpr-panel__icon-wrap" aria-hidden="true">
            <TrendingUp size={16} />
          </span>
          <div className="cpr-panel__titles">
            <h3 className="cpr-panel__title">Weekly Productivity Trend</h3>
            <p className="cpr-panel__subtitle">Mon–Fri company output</p>
          </div>
        </div>
        <span className="cpr-pill cpr-pill--track">{weeklyTrendSummary.weekDeltaLabel}</span>
      </header>

      <div ref={containerRef} className="cpr-trend__chart">
        <Chart
          type="bar"
          height={chartHeight}
          width="100%"
          options={options}
          series={[
            {
              name: 'Productivity',
              data: weekdayTrend.map((point) => point.rate)
            }
          ]}
        />
      </div>

      <footer className="cpr-trend__footer">
        <span className="cpr-trend__stat">
          <strong>{weeklyTrendSummary.weekdayAvg}%</strong> weekday avg
        </span>
        <span className="cpr-trend__stat">
          Peak <strong>{weeklyTrendSummary.peakDay}</strong> ({weeklyTrendSummary.peakRate}%)
        </span>
      </footer>
    </article>
  );
};
