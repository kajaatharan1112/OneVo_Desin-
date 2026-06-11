import React from 'react';
import {
  Users,
  Building2,
  FolderKanban,
  CircleDollarSign,
  ClipboardList
} from 'lucide-react';
import { tenantKpiCards } from '../../../../../core/summary/summary-cards';
import type { TenantKpiCardId } from '../../../../../shared/types/summary-card.types';

const KPI_ICONS: Record<TenantKpiCardId, React.ReactNode> = {
  'total-employees': <Users size={20} strokeWidth={2} />,
  departments: <Building2 size={20} strokeWidth={2} />,
  'active-projects': <FolderKanban size={20} strokeWidth={2} />,
  'monthly-revenue': <CircleDollarSign size={20} strokeWidth={2} />,
  'pending-approvals': <ClipboardList size={20} strokeWidth={2} />
};

const ACCENT_COLORS: Record<string, { bg: string; color: string }> = {
  blue: { bg: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' },
  indigo: { bg: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5' },
  green: { bg: 'rgba(16, 185, 129, 0.1)', color: '#059669' },
  orange: { bg: 'rgba(245, 158, 11, 0.1)', color: '#ea580c' }
};

export const TenantKpiRow: React.FC = () => {
  return (
    <section className="ceo-kpi-row" aria-label="Key performance indicators">
      {tenantKpiCards.map((card) => {
        const accent = ACCENT_COLORS[card.accent];
        const ariaLabel = card.trend
          ? `${card.title}: ${card.value}. ${card.subtitle}. ${card.trend}`
          : `${card.title}: ${card.value}. ${card.desc ?? card.subtitle ?? ''}`;

        return (
          <article key={card.id} className="ceo-kpi-card" aria-label={ariaLabel}>
            <div
              className="ceo-kpi-card__icon"
              style={{ backgroundColor: accent.bg, color: accent.color }}
              aria-hidden="true"
            >
              {KPI_ICONS[card.id]}
            </div>
            <div className="ceo-kpi-card__body">
              <span className="ceo-kpi-card__title">{card.title}</span>
              <span className="ceo-kpi-card__value">{card.value}</span>
              {card.subtitle ? (
                <span className="ceo-kpi-card__subtitle">{card.subtitle}</span>
              ) : null}
              {card.trend ? (
                <span className="ceo-kpi-card__trend">{card.trend}</span>
              ) : card.desc ? (
                <span className="ceo-kpi-card__desc">{card.desc}</span>
              ) : null}
            </div>
          </article>
        );
      })}
    </section>
  );
};
