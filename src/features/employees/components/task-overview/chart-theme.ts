import type { ApexOptions } from 'apexcharts';
import type { ChartThemeTokens } from '../../../../core/theme/chart-theme-config';

/** Build Apex options from theme-aware chart tokens */
export function createBaseChartOptions(tokens: ChartThemeTokens): ApexOptions {
  return {
    chart: {
      fontFamily: 'Inter, Segoe UI, system-ui, sans-serif',
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: {
        enabled: true,
        speed: 500,
        animateGradually: { enabled: true, delay: 80 }
      }
    },
    colors: tokens.palette,
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 0, lineCap: 'round' },
    tooltip: {
      theme: tokens.tooltipTheme,
      style: { fontSize: '12px' }
    }
  };
}

export function createDonutPlotOptions(
  tokens: ChartThemeTokens
): ApexOptions['plotOptions'] {
  return {
    pie: {
      expandOnClick: false,
      donut: {
        size: '68%',
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '11px',
            fontWeight: 500,
            color: tokens.textColor,
            offsetY: -4
          },
          value: {
            show: true,
            fontSize: '15px',
            fontWeight: 700,
            color: tokens.primary,
            offsetY: 2
          },
          total: {
            show: true,
            showAlways: true,
            fontSize: '10px',
            fontWeight: 600,
            color: tokens.textColor,
            label: 'Target'
          }
        }
      }
    }
  };
}
