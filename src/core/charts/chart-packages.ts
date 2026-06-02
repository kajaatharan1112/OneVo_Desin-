/**
 * Central chart package registry.
 * Lazy-import in feature pages — do not import all packages in one bundle.
 */

export const chartPackageImports = {
  apexcharts: () => import('react-apexcharts'),
  echarts: () => import('echarts-for-react'),
  d3: () => import('d3'),
  nivoBar: () => import('@nivo/bar'),
  nivoLine: () => import('@nivo/line'),
  nivoPie: () => import('@nivo/pie'),
  lightweightCharts: () => import('lightweight-charts'),
  visxAxis: () => import('@visx/axis'),
  visxGrid: () => import('@visx/grid'),
  visxGroup: () => import('@visx/group'),
  visxShape: () => import('@visx/shape'),
  visxScale: () => import('@visx/scale'),
  visxResponsive: () => import('@visx/responsive'),
  visxTooltip: () => import('@visx/tooltip'),
  visxLegend: () => import('@visx/legend')
} as const;

export type ChartPackageKey = keyof typeof chartPackageImports;

export const chartPackageMeta: Record<
  ChartPackageKey,
  { package: string; reactWrapper?: string }
> = {
  apexcharts: { package: 'apexcharts', reactWrapper: 'react-apexcharts' },
  echarts: { package: 'echarts', reactWrapper: 'echarts-for-react' },
  d3: { package: 'd3' },
  nivoBar: { package: '@nivo/bar', reactWrapper: '@nivo/core' },
  nivoLine: { package: '@nivo/line', reactWrapper: '@nivo/core' },
  nivoPie: { package: '@nivo/pie', reactWrapper: '@nivo/core' },
  lightweightCharts: { package: 'lightweight-charts' },
  visxAxis: { package: '@visx/axis' },
  visxGrid: { package: '@visx/grid' },
  visxGroup: { package: '@visx/group' },
  visxShape: { package: '@visx/shape' },
  visxScale: { package: '@visx/scale' },
  visxResponsive: { package: '@visx/responsive' },
  visxTooltip: { package: '@visx/tooltip' },
  visxLegend: { package: '@visx/legend' }
};
