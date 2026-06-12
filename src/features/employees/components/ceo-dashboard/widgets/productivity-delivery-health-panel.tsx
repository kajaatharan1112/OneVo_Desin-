import React from 'react';
import { FolderKanban } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

const statusPills = [
  { key: 'onTrack' as const, label: 'On track', pillClass: 'cpr-pill--track' },
  { key: 'delayed' as const, label: 'Delayed', pillClass: 'cpr-pill--delayed' },
  { key: 'blocked' as const, label: 'Blocked', pillClass: 'cpr-pill--blocked' },
  { key: 'atRisk' as const, label: 'At risk', pillClass: 'cpr-pill--risk' }
];

export const ProductivityDeliveryHealthPanel: React.FC = () => {
  const { deliveryHealth } = ceoDashboardData.productivity;

  return (
    <article className="eto-widget cpr-panel cpr-cell--delivery cpr-delivery">
      <header className="cpr-panel__head">
        <div className="cpr-panel__title-block">
          <span className="cpr-panel__icon-wrap" aria-hidden="true">
            <FolderKanban size={16} />
          </span>
          <div className="cpr-panel__titles">
            <h3 className="cpr-panel__title">Delivery Health</h3>
            <p className="cpr-panel__subtitle">Project delivery status</p>
          </div>
        </div>
        <span className="cpr-pill cpr-pill--track">{deliveryHealth.onTimeRate}% on-time</span>
      </header>

      <div className="cpr-delivery__hero">
        <span className="cpr-delivery__hero-value">{deliveryHealth.activeProjects}</span>
        <span className="cpr-delivery__hero-label">Active projects</span>
      </div>

      <ul className="cpr-delivery__pills" aria-label="Delivery status breakdown">
        {statusPills.map((pill) => (
          <li key={pill.key} className={`cpr-delivery__pill ${pill.pillClass}`}>
            <span className="cpr-delivery__pill-value">{deliveryHealth[pill.key]}</span>
            <span className="cpr-delivery__pill-label">{pill.label}</span>
          </li>
        ))}
      </ul>
    </article>
  );
};
