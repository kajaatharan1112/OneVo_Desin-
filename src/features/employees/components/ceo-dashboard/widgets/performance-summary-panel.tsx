import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Activity } from 'lucide-react';
import { getChartTheme } from '../../../../../core/theme/chart-theme-config';
import { useTheme } from '../../../../../core/theme/theme-context';
import { createBaseChartOptions } from '../../task-overview/chart-theme';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

const PERFORMANCE_TARGET = 85;

function useChartBoxSize(fallback = 168) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(fallback);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measure = () => {
      const { width, height } = element.getBoundingClientRect();
      const next = Math.floor(Math.min(width, height, 200));
      setSize(next > 0 ? next : fallback);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [fallback]);

  return { ref, size };
}

export const PerformanceSummaryPanel: React.FC = () => {
  const { summary } = ceoDashboardData.companyPerformance;
  const { theme } = useTheme();
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(() => createBaseChartOptions(chartTokens), [chartTokens]);
  const { ref: gaugeRef, size: chartSize } = useChartBoxSize(168);
  const aboveTarget = summary.scorePercent - PERFORMANCE_TARGET;
  const targetDeltaLabel =
    aboveTarget >= 0 ? `+${aboveTarget}%` : `${aboveTarget}%`;

  const gaugeOptions: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: {
        ...baseChartOptions.chart,
        type: 'radialBar',
        height: chartSize,
        width: chartSize,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 1200,
          animateGradually: { enabled: true, delay: 100 }
        }
      },
      series: [summary.scorePercent],
      colors: ['#2563eb'],
      stroke: { lineCap: 'round' },
      fill: {
        type: 'gradient',
        gradient: {
          type: 'horizontal',
          shadeIntensity: 0.35,
          gradientToColors: ['#10b981'],
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
      labels: ['Score']
    }),
    [baseChartOptions, chartSize, chartTokens, summary.scorePercent]
  );

  return (
    <article className="cpg-card cpg-card--score cpg-cell--score">
      <header className="cpg-card__head cpg-score__head">
        <div className="cpg-card__title-block">
          <span className="cpg-card__icon cpg-score__icon" aria-hidden="true">
            <Activity size={16} />
          </span>
          <div>
            <h3 className="cpg-card__title">Company Score</h3>
            <p className="cpg-card__subtitle">Executive performance summary</p>
          </div>
        </div>
        <span className="cpg-badge cpg-badge--good">{summary.healthLabel}</span>
      </header>

      <div className="cpg-score__body">
        <div ref={gaugeRef} className="cpg-score__gauge">
          {chartSize > 0 ? (
            <Chart
              key={`cpg-score-${chartSize}`}
              type="radialBar"
              height={chartSize}
              width={chartSize}
              options={gaugeOptions}
              series={[summary.scorePercent]}
            />
          ) : null}
          <div className="cpg-score__center" aria-hidden="true">
            <span className="cpg-score__value">{summary.scorePercent}%</span>
            <span className="cpg-score__delta">{targetDeltaLabel}</span>
            <span className="cpg-score__target">Target {PERFORMANCE_TARGET}%</span>
          </div>
        </div>

        <div className="cpg-score__side" aria-label="Score insights">
          <div className="cpg-score__side-box">
            <span className="cpg-score__side-label">Month change</span>
            <span className="cpg-score__side-value">{summary.monthDeltaLabel}</span>
          </div>
          <div className="cpg-score__side-box cpg-score__side-box--good">
            <span className="cpg-score__side-label">Status</span>
            <span className="cpg-score__side-value">{summary.healthLabel}</span>
          </div>
        </div>
      </div>
    </article>
  );
};
