import React from 'react';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  LoaderCircle,
  ShieldAlert
} from 'lucide-react';
import type { WorkKpiTile, WorkKpiTone } from '../../data/work-tab.mock';

interface WorkKpiTilesProps {
  tiles: WorkKpiTile[];
  className?: string;
}

const TONE_CLASS: Record<WorkKpiTone, string> = {
  default: 'work-metric--info',
  danger: 'work-metric--danger',
  warning: 'work-metric--warning',
  success: 'work-metric--success'
};

const ICONS: Record<WorkKpiTile['id'], React.ComponentType<{ size?: number }>> = {
  'due-today': CalendarClock,
  overdue: AlertTriangle,
  blocked: ShieldAlert,
  'in-progress': LoaderCircle,
  'done-today': CheckCircle2
};

export const WorkKpiTiles: React.FC<WorkKpiTilesProps> = ({ tiles, className = '' }) => {
  return (
    <section
      className={`work-metrics-strip ${className}`.trim()}
      aria-label="Work KPI summary"
    >
      {tiles.map((tile) => {
        const Icon = ICONS[tile.id];
        const toneClass = TONE_CLASS[tile.tone ?? 'default'];

        return (
          <div key={tile.id} className={`work-metric ${toneClass}`.trim()}>
            <span className="work-metric__icon" aria-hidden="true">
              <Icon size={13} />
            </span>
            <div className="work-metric__copy">
              <span className="work-metric__value">{tile.value}</span>
              <span className="work-metric__label">{tile.label}</span>
            </div>
          </div>
        );
      })}
    </section>
  );
};
