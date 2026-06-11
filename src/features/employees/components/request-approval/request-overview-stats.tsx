import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Clock,
  XCircle
} from 'lucide-react';
import type { RequestStats } from '../../types/employee-requests.types';

interface RequestOverviewStatsProps {
  stats: RequestStats;
  className?: string;
}

const STAT_ITEMS = [
  { key: 'total', label: 'Total', icon: ClipboardList, tone: 'info', emphasis: false },
  { key: 'pending', label: 'Pending', icon: Clock, tone: 'warning', emphasis: true },
  { key: 'approved', label: 'Approved', icon: CheckCircle2, tone: 'success', emphasis: false },
  { key: 'rejected', label: 'Rejected', icon: XCircle, tone: 'danger', emphasis: false },
  { key: 'needsAction', label: 'Needs Action', icon: AlertCircle, tone: 'alert', emphasis: true }
] as const;

export const RequestOverviewStats: React.FC<RequestOverviewStatsProps> = ({
  stats,
  className = ''
}) => {
  return (
    <section
      className={`era-panel era-metrics-strip ${className}`.trim()}
      aria-label="Request status overview"
    >
      {STAT_ITEMS.map(({ key, label, icon: Icon, tone, emphasis }) => (
        <div
          key={key}
          className={`era-metric era-metric--${tone}${emphasis ? ' era-metric--emphasis' : ''}`}
        >
          <span className="era-metric__icon" aria-hidden="true">
            <Icon size={13} />
          </span>
          <div className="era-metric__copy">
            <span className="era-metric__value">{stats[key]}</span>
            <span className="era-metric__label">{label}</span>
          </div>
        </div>
      ))}
    </section>
  );
};
