import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useTheme } from '../../../../../core/theme/theme-context';
import type { HealthGaugeData } from '../../../data/tenant-today-productivity.data';

interface ExecutiveHealthChartProps {
  data: HealthGaugeData;
}

const CHART_SIZE = 156;

export const ExecutiveHealthChart: React.FC<ExecutiveHealthChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const sliceGapColor = theme === 'dark' ? '#1e293b' : '#ffffff';

  const series = useMemo(
    () => data.segments.map((s) => s.percent),
    [data.segments]
  );

  const colors = useMemo(
    () => data.segments.map((s) => s.color),
    [data.segments]
  );

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'donut',
        height: CHART_SIZE,
        width: CHART_SIZE,
        sparkline: { enabled: false },
        animations: { enabled: true, speed: 400 }
      },
      series,
      colors,
      labels: data.segments.map((s) => s.label),
      stroke: {
        width: 4,
        colors: [sliceGapColor, sliceGapColor, sliceGapColor],
        lineCap: 'round'
      },
      plotOptions: {
        pie: {
          startAngle: -90,
          endAngle: 90,
          offsetY: 6,
          expandOnClick: false,
          donut: {
            size: '70%',
            labels: { show: false }
          }
        }
      },
      legend: { show: false },
      dataLabels: { enabled: false },
      tooltip: { enabled: false }
    }),
    [series, colors, data.segments, sliceGapColor]
  );

  return (
    <div className="ceo-health-gauge__chart-wrap">
      <div className="ceo-health-gauge__chart-canvas">
        <Chart type="donut" height={CHART_SIZE} width={CHART_SIZE} options={options} series={series} />
      </div>
      <div className="ceo-health-gauge__center" aria-hidden="true">
        <span className="ceo-health-gauge__center-value">{data.centerValue}</span>
        <span className="ceo-health-gauge__center-label">{data.centerLabel}</span>
      </div>
    </div>
  );
};
