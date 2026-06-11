import React from 'react';
import { FolderKanban, Users } from 'lucide-react';
import {
  projectDeliveryHealth,
  hiringRetention
} from '../../../data/tenant-today-productivity.data';
import type { HealthGaugeData } from '../../../data/tenant-today-productivity.data';
import { ExecutiveHealthChart } from './executive-health-chart';

interface HealthCardProps {
  title: string;
  icon: React.ReactNode;
  data: HealthGaugeData;
}

const HealthCard: React.FC<HealthCardProps> = ({ title, icon, data }) => (
  <article className="ceo-health-gauge" aria-label={title}>
    <ExecutiveHealthChart data={data} />
    <div className="ceo-health-gauge__info">
      <header className="ceo-health-gauge__head">
        <span className="ceo-health-gauge__head-icon" aria-hidden="true">
          {icon}
        </span>
        <h3 className="ceo-health-gauge__title">{title}</h3>
      </header>
      <ul className="ceo-health-gauge__legend">
        {data.segments.map((seg) => (
          <li key={seg.label} className="ceo-health-gauge__legend-row">
            <span className="ceo-health-gauge__dot" style={{ backgroundColor: seg.color }} />
            <span className="ceo-health-gauge__legend-label">{seg.label}</span>
            <span className="ceo-health-gauge__legend-value">{seg.value}</span>
            <span className="ceo-health-gauge__legend-pct">{seg.percent}%</span>
          </li>
        ))}
      </ul>
    </div>
  </article>
);

export const ExecutiveHealthPanel: React.FC = () => {
  return (
    <div className="ceo-health-row" aria-label="Executive health gauges">
      <HealthCard
        title="Project Delivery Health"
        icon={<FolderKanban size={14} strokeWidth={2} />}
        data={projectDeliveryHealth}
      />
      <HealthCard
        title="Hiring & Retention"
        icon={<Users size={14} strokeWidth={2} />}
        data={hiringRetention}
      />
    </div>
  );
};
