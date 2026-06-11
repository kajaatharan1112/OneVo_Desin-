import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Users } from 'lucide-react';
import { getChartTheme } from '../../../../../core/theme/chart-theme-config';
import { useTheme } from '../../../../../core/theme/theme-context';
import { createBaseChartOptions } from '../../task-overview/chart-theme';
import { ceoDashboardData } from '../data/ceo-dashboard.data';
import type { WorkforceHealthStatus } from '../data/ceo-dashboard.data';

const statusTabClass: Record<WorkforceHealthStatus, string> = {
  healthy: 'cwf-pulse__badge--healthy',
  warning: 'cwf-pulse__badge--warning',
  critical: 'cwf-pulse__badge--critical'
};

const PULSE_CAPTION_RESERVE = 16;
const PULSE_LEGEND_RESERVE = 22;

function useMatchedPulseChartSize(fallback = 100) {
  const mainRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLUListElement>(null);
  const [size, setSize] = useState(fallback);

  useLayoutEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const measure = () => {
      const { width, height } = main.getBoundingClientRect();
      const styles = getComputedStyle(main);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
      const colWidth = (width - gap) / 2;
      const legendHeight = legendRef.current?.offsetHeight ?? PULSE_LEGEND_RESERVE;
      const leftChartHeight = height - PULSE_CAPTION_RESERVE;
      const rightChartHeight = height - PULSE_CAPTION_RESERVE - legendHeight - 4;
      const chartHeight = Math.min(leftChartHeight, rightChartHeight);
      const next = Math.floor(Math.min(colWidth, chartHeight));
      setSize(next > 0 ? next : fallback);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(main);
    if (legendRef.current) observer.observe(legendRef.current);
    return () => observer.disconnect();
  }, [fallback]);

  return { mainRef, legendRef, size };
}

export const WorkforceAttendanceHealthPanel: React.FC = () => {
  const { attendanceHealth, workModeSplit } = ceoDashboardData.workforce;
  const { theme } = useTheme();
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(() => createBaseChartOptions(chartTokens), [chartTokens]);
  const { mainRef, legendRef, size: chartSize } = useMatchedPulseChartSize(100);

  const chartSquareStyle = useMemo(
    () => ({
      width: chartSize,
      height: chartSize,
      minWidth: chartSize,
      minHeight: chartSize,
      maxWidth: chartSize,
      maxHeight: chartSize
    }),
    [chartSize]
  );

  const workModeChartColors = useMemo(
    () => [
      chartTokens.primary,
      chartTokens.lightBlue,
      '#f59e0b'
    ],
    [chartTokens]
  );

  const workModeSeries = useMemo(
    () => workModeSplit.segments.map(() => 100 / workModeSplit.segments.length),
    [workModeSplit.segments]
  );

  const gaugeOptions: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: {
        ...baseChartOptions.chart,
        type: 'radialBar',
        height: chartSize,
        width: chartSize,
        offsetX: 0,
        offsetY: 0
      },
      grid: {
        padding: { top: -6, right: -6, bottom: -6, left: -6 }
      },
      series: [attendanceHealth.rate],
      colors: [chartTokens.primary],
      stroke: { lineCap: 'round' },
      fill: {
        type: 'gradient',
        gradient: {
          type: 'horizontal',
          shadeIntensity: 0.35,
          gradientToColors: [chartTokens.palette[2] ?? '#10b981'],
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100]
        }
      },
      plotOptions: {
        radialBar: {
          startAngle: 0,
          endAngle: 360,
          hollow: {
            margin: 0,
            size: '54%',
            background: 'transparent'
          },
          track: {
            show: true,
            background: chartTokens.ringTrack,
            strokeWidth: '100%',
            margin: 0
          },
          dataLabels: {
            show: false
          }
        }
      },
      labels: ['Attendance Score']
    }),
    [attendanceHealth.rate, baseChartOptions, chartTokens, chartSize]
  );

  const donutOptions: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: {
        ...baseChartOptions.chart,
        type: 'donut',
        height: chartSize,
        width: chartSize,
        offsetX: 0,
        offsetY: 0
      },
      grid: {
        padding: { top: 0, right: 0, bottom: 0, left: 0 }
      },
      labels: workModeSplit.segments.map((seg) => seg.label),
      colors: workModeChartColors,
      plotOptions: {
        pie: {
          expandOnClick: false,
          offsetX: 0,
          offsetY: 0,
          customScale: 0.92,
          donut: {
            size: '54%',
            labels: { show: false }
          }
        }
      },
      legend: { show: false },
      dataLabels: { enabled: false },
      tooltip: {
        ...baseChartOptions.tooltip,
        y: {
          formatter: (_val: number, opts) => {
            const segment = workModeSplit.segments[opts.seriesIndex];
            return segment ? `${segment.label}: ${segment.percent}%` : '';
          }
        }
      }
    }),
    [baseChartOptions, chartSize, workModeChartColors, workModeSplit.segments]
  );

  return (
    <article className="eto-widget cwo-cell--health cwf-panel cwf-panel--health cwf-pulse">
      <header className="cwf-pulse__head">
        <div className="cwf-pulse__title-block">
          <span className="cwf-pulse__icon-wrap" aria-hidden="true">
            <Users size={16} />
          </span>
          <div className="cwf-pulse__titles">
            <h3 className="cwf-pulse__title">Attendance Pulse</h3>
            <p className="cwf-pulse__subtitle">{attendanceHealth.subtitle}</p>
          </div>
        </div>
        <span className={`cwf-pulse__badge ${statusTabClass[attendanceHealth.status]}`}>
          {attendanceHealth.statusLabel}
        </span>
      </header>

      <div ref={mainRef} className="cwf-pulse__main">
        <section className="cwf-pulse__col" aria-label="Attendance score">
          <span className="cwf-pulse__chart-caption">Attendance Score</span>
          <div className="cwf-pulse__chart-square cwf-pulse__gauge" style={chartSquareStyle}>
            {chartSize > 0 ? (
              <Chart
                key={`gauge-${chartSize}`}
                type="radialBar"
                height={chartSize}
                width={chartSize}
                options={gaugeOptions}
                series={[attendanceHealth.rate]}
              />
            ) : null}
            <div className="cwf-pulse__gauge-center" aria-hidden="true">
              <span className="cwf-pulse__score">{attendanceHealth.rate}%</span>
              <span className="cwf-pulse__score-label">Attendance Score</span>
            </div>
          </div>
        </section>

        <section className="cwf-pulse__col cwf-pulse__col--workmode" aria-label="Work mode distribution">
          <span className="cwf-pulse__chart-caption">Work Mode Split</span>
          <div className="cwf-pulse__chart-square cwf-pulse__donut" style={chartSquareStyle}>
            {chartSize > 0 ? (
              <Chart
                key={`donut-${chartSize}`}
                type="donut"
                height={chartSize}
                width={chartSize}
                options={donutOptions}
                series={workModeSeries}
              />
            ) : null}
          </div>
          <ul
            ref={legendRef}
            className="cwf-pulse__legend cwf-pulse__legend--inline"
            aria-label="Work mode breakdown"
          >
            {workModeSplit.segments.map((seg, index) => (
              <li key={seg.id} className="cwf-pulse__legend-item">
                <span
                  className="cwf-pulse__legend-dot"
                  style={{ background: workModeChartColors[index] }}
                  aria-hidden="true"
                />
                <span className="cwf-pulse__legend-label">{seg.label}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
};
