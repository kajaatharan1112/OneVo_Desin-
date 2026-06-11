import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Gauge } from 'lucide-react';
import { getChartTheme } from '../../../../../core/theme/chart-theme-config';
import { useTheme } from '../../../../../core/theme/theme-context';
import { createBaseChartOptions } from '../../task-overview/chart-theme';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

function useChartBoxSize(fallback = 88) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(fallback);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measure = () => {
      const { width, height } = element.getBoundingClientRect();
      const next = Math.floor(Math.min(width, height));
      setSize(next > 0 ? next : fallback);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [fallback]);

  return { ref, size };
}

export const ProductivityCompanyPanel: React.FC = () => {
  const { summary, scoreNote, delta, status } = ceoDashboardData.productivity;
  const { theme } = useTheme();
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(() => createBaseChartOptions(chartTokens), [chartTokens]);
  const { ref: gaugeRef, size: chartSize } = useChartBoxSize(88);

  const statusClass =
    status === 'green'
      ? 'cpr-score__badge--healthy'
      : status === 'amber'
        ? 'cpr-score__badge--warning'
        : 'cpr-score__badge--critical';

  const outputKpis = useMemo(
    () => [
      { id: 'completed', label: 'Completed today', value: summary.completedToday },
      { id: 'overdue', label: 'Overdue tasks', value: summary.overdueTasks, tone: 'warn' as const },
      { id: 'blocked', label: 'Blocked tasks', value: summary.blockedTasks, tone: 'danger' as const }
    ],
    [summary.blockedTasks, summary.completedToday, summary.overdueTasks]
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
      grid: { padding: { top: -4, right: -4, bottom: -4, left: -4 } },
      series: [summary.scorePercent],
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
          hollow: { margin: 0, size: '58%', background: 'transparent' },
          track: {
            show: true,
            background: chartTokens.ringTrack,
            strokeWidth: '100%',
            margin: 0
          },
          dataLabels: { show: false }
        }
      },
      labels: ['Productivity']
    }),
    [baseChartOptions, chartSize, chartTokens, summary.scorePercent]
  );

  return (
    <article className="eto-widget cpr-panel cpr-cell--company cpr-score">
      <header className="cpr-score__head">
        <div className="cpr-score__title-block">
          <span className="cpr-score__icon-wrap" aria-hidden="true">
            <Gauge size={16} />
          </span>
          <div className="cpr-score__titles">
            <h3 className="cpr-score__title">Company Work Output</h3>
            <p className="cpr-score__subtitle">Overall productivity score</p>
          </div>
        </div>
        <span className={`cpr-score__badge ${statusClass}`}>{delta}</span>
      </header>

      <div ref={gaugeRef} className="cpr-score__gauge-wrap">
        {chartSize > 0 ? (
          <Chart
            key={`cpr-gauge-${chartSize}`}
            type="radialBar"
            height={chartSize}
            width={chartSize}
            options={gaugeOptions}
            series={[summary.scorePercent]}
          />
        ) : null}
        <div className="cpr-score__gauge-center" aria-hidden="true">
          <span className="cpr-score__value">{summary.scorePercent}%</span>
          <span className="cpr-score__value-label">Productivity</span>
        </div>
      </div>

      <ul className="cpr-score__kpis" aria-label="Work output metrics">
        {outputKpis.map((kpi) => (
          <li
            key={kpi.id}
            className={`cpr-score__kpi${kpi.tone ? ` cpr-score__kpi--${kpi.tone}` : ''}`}
          >
            <span className="cpr-score__kpi-value">{kpi.value.toLocaleString()}</span>
            <span className="cpr-score__kpi-label">{kpi.label}</span>
          </li>
        ))}
      </ul>

      <p className="cpr-score-note">{scoreNote}</p>
    </article>
  );
};
