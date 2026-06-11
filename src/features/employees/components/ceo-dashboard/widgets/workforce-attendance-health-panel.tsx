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

const PULSE_CHART_FILL = 0.94;
const PULSE_CHART_MIN = 56;

function useMatchedPulseChartSize(fallback = 120) {
  const panelRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLUListElement>(null);
  const [size, setSize] = useState(fallback);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const main = mainRef.current;
    if (!panel || !main) return;

    const measure = () => {
      const panelStyle = getComputedStyle(panel);
      const padY =
        Number.parseFloat(panelStyle.paddingTop) + Number.parseFloat(panelStyle.paddingBottom);
      const panelGap = Number.parseFloat(panelStyle.gap || '0') || 0;
      const headH = headRef.current?.offsetHeight ?? 0;
      const bodyH = panel.clientHeight - headH - padY - panelGap;
      if (bodyH <= 0 || main.clientWidth <= 0) return;

      const mainStyle = getComputedStyle(main);
      const colGap = Number.parseFloat(mainStyle.columnGap || mainStyle.gap || '0') || 0;
      const colW = (main.clientWidth - colGap) / 2;
      const legendH = legendRef.current?.offsetHeight || 20;
      const captionH = 14;
      const colStackGap = 4;

      const gaugeLimit = Math.min(colW, bodyH - captionH - colStackGap);
      const workmodeLimit = Math.min(colW, bodyH - captionH - legendH - colStackGap);
      const maxSize = Math.floor(Math.min(gaugeLimit, workmodeLimit) * PULSE_CHART_FILL);
      const clamped = Math.min(maxSize, gaugeLimit, workmodeLimit);

      setSize(clamped >= PULSE_CHART_MIN ? clamped : Math.min(PULSE_CHART_MIN, workmodeLimit));
    };

    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    observer.observe(main);

    const observeLegend = () => {
      const legend = legendRef.current;
      if (legend) observer.observe(legend);
    };

    measure();
    observeLegend();
    const raf = requestAnimationFrame(() => {
      measure();
      observeLegend();
    });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [fallback]);

  return { panelRef, headRef, mainRef, legendRef, size };
}

export const WorkforceAttendanceHealthPanel: React.FC = () => {
  const { attendanceHealth, workModeSplit } = ceoDashboardData.workforce;
  const { theme } = useTheme();
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(() => createBaseChartOptions(chartTokens), [chartTokens]);
  const { panelRef, headRef, mainRef, legendRef, size: chartSize } =
    useMatchedPulseChartSize(120);

  const chartSquareStyle = useMemo(
    () =>
      ({
        '--pulse-chart-size': `${chartSize}px`,
        width: chartSize,
        height: chartSize,
        minWidth: 0,
        minHeight: 0,
        maxWidth: '100%',
        maxHeight: '100%'
      }) as React.CSSProperties,
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
    () => workModeSplit.segments.map((seg) => seg.percent),
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
          customScale: 1,
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
            const segment = workModeSplit.segments[opts?.seriesIndex ?? 0];
            return segment ? `${segment.label}: ${segment.percent}%` : '';
          }
        }
      }
    }),
    [baseChartOptions, chartSize, workModeChartColors, workModeSplit.segments]
  );

  return (
    <article
      ref={panelRef}
      className="eto-widget cwo-cell--health cwf-panel cwf-panel--health cwf-pulse"
    >
      <header ref={headRef} className="cwf-pulse__head">
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
