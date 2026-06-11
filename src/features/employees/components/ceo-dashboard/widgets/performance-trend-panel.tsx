import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { TrendingUp } from 'lucide-react';
import { getChartTheme } from '../../../../../core/theme/chart-theme-config';
import { useTheme } from '../../../../../core/theme/theme-context';
import { createBaseChartOptions } from '../../task-overview/chart-theme';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

const TREND_TARGET = 85;
const CHART_HEIGHT = 168;
const Y_AXIS_TICKS = [70, 78, 85, 93, 100];
const BAR_COLORS = ['#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'];

export const PerformanceTrendPanel: React.FC = () => {
  const { monthlyTrend, summary } = ceoDashboardData.companyPerformance;
  const { theme } = useTheme();
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(() => createBaseChartOptions(chartTokens), [chartTokens]);
  const latestIndex = monthlyTrend.length - 1;

  const options: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: {
        ...baseChartOptions.chart,
        type: 'bar',
        height: CHART_HEIGHT,
        offsetY: 0,
        toolbar: { show: false },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 900,
          animateGradually: { enabled: true, delay: 80 }
        }
      },
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
        offsetY: -18,
        style: {
          fontSize: '11px',
          fontWeight: 700,
          colors: monthlyTrend.map((_, index) =>
            index === latestIndex ? '#1e3a8a' : '#334155'
          )
        }
      },
      grid: {
        borderColor: '#eef2f7',
        strokeDashArray: 0,
        padding: { top: 22, right: 8, left: 0, bottom: 0 },
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } }
      },
      annotations: {
        yaxis: [
          {
            y: TREND_TARGET,
            borderColor: '#94a3b8',
            strokeDashArray: 6,
            opacity: 0.9,
            label: {
              text: `Target ${TREND_TARGET}%`,
              borderWidth: 0,
              offsetX: 0,
              offsetY: -12,
              position: 'right',
              style: {
                color: '#64748b',
                background: 'transparent',
                fontSize: '10px',
                fontWeight: 600
              }
            }
          }
        ]
      },
      xaxis: {
        categories: monthlyTrend.map((point) => point.month),
        labels: {
          style: {
            colors: monthlyTrend.map((_, index) =>
              index === latestIndex ? '#1d4ed8' : '#64748b'
            ),
            fontSize: '11px',
            fontFamily: 'inherit',
            fontWeight: 600
          }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        min: 70,
        max: 100,
        tickAmount: Y_AXIS_TICKS.length - 1,
        forceNiceScale: false,
        labels: {
          style: {
            colors: '#94a3b8',
            fontSize: '10px',
            fontFamily: 'inherit'
          },
          formatter: (val: number) => {
            const rounded = Math.round(val);
            const match = Y_AXIS_TICKS.find((tick) => Math.abs(tick - rounded) <= 1);
            return match !== undefined ? `${match}%` : '';
          }
        }
      },
      colors: BAR_COLORS,
      legend: { show: false },
      tooltip: {
        ...baseChartOptions.tooltip,
        theme,
        y: { formatter: (val: number) => `${val}% company performance` }
      },
      states: {
        hover: { filter: { type: 'lighten', value: 0.08 } }
      }
    }),
    [baseChartOptions, chartTokens, latestIndex, monthlyTrend, theme]
  );

  return (
    <article className="cpg-card cpg-card--trend cpg-cell--trend">
      <header className="cpg-card__head">
        <div className="cpg-card__title-block">
          <span className="cpg-card__icon cpg-trend__icon" aria-hidden="true">
            <TrendingUp size={16} />
          </span>
          <div>
            <h3 className="cpg-card__title">5-month Trend</h3>
            <p className="cpg-card__subtitle">Monthly performance trajectory</p>
          </div>
        </div>
        <span className="cpg-badge cpg-badge--track">{summary.monthDeltaLabel}</span>
      </header>

      <div className="cpg-trend__body">
        <div className="cpg-trend__chart">
          <Chart
            type="bar"
            height={CHART_HEIGHT}
            width="100%"
            options={options}
            series={[{ name: 'Performance', data: monthlyTrend.map((point) => point.rate) }]}
          />
        </div>

        <footer className="cpg-trend__foot">
          <span className="cpg-trend__foot-legend" aria-hidden="true">
            <span className="cpg-trend__foot-line" />
            Target {TREND_TARGET}%
          </span>
          <span className="cpg-trend__foot-note">Jul – Nov company score</span>
        </footer>
      </div>
    </article>
  );
};
