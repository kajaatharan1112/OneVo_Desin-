import type { CSSProperties } from 'react';
import type { ActivityWorkHoursSummary } from '../types/employee-activity.types';

export interface WorkHoursStackSegment {
  id: 'worked' | 'break' | 'remaining';
  label: string;
  displayValue: string;
  percent: number;
}

export function getWorkHoursStackSegments(
  summary: ActivityWorkHoursSummary
): WorkHoursStackSegment[] {
  const { segments } = summary;
  const total = segments.expectedHours > 0 ? segments.expectedHours : 1;

  return [
    {
      id: 'worked',
      label: 'Worked',
      displayValue: summary.completed,
      percent: Math.round((segments.workedHours / total) * 100)
    },
    {
      id: 'break',
      label: 'Break',
      displayValue: summary.breakDuration,
      percent: Math.round((segments.breakHours / total) * 100)
    },
    {
      id: 'remaining',
      label: 'Remaining',
      displayValue: summary.remaining,
      percent: Math.round((segments.remainingHours / total) * 100)
    }
  ];
}

export function getWorkHoursRingStyle(percent: number): CSSProperties {
  const clamped = Math.min(100, Math.max(0, percent));

  return {
    '--eac-ring-pct': `${clamped}`
  } as CSSProperties;
}

export function getWorkHoursStatItems(summary: ActivityWorkHoursSummary) {
  return [
    { id: 'expected', label: 'Expected', value: summary.expected },
    { id: 'remaining', label: 'Remaining', value: summary.remaining }
  ] as const;
}
