import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CalendarClock,
  TrendingDown,
  FileWarning,
  ChevronRight
} from 'lucide-react';
import { attentionItems } from '../../../data/tenant-today-productivity.data';
import type { AttentionItem } from '../../../data/tenant-today-productivity.data';

const ATTENTION_ICONS: Record<AttentionItem['severity'], React.ReactNode> = {
  critical: <AlertTriangle size={18} strokeWidth={2} />,
  warning: <CalendarClock size={18} strokeWidth={2} />,
  neutral: <TrendingDown size={18} strokeWidth={2} />,
  info: <FileWarning size={18} strokeWidth={2} />
};

const SEVERITY_ACCENT: Record<AttentionItem['severity'], string> = {
  critical: '#ef4444',
  warning: '#f59e0b',
  neutral: '#2563eb',
  info: '#3b82f6'
};

const SEVERITY_ICON_BG: Record<AttentionItem['severity'], string> = {
  critical: 'rgba(239, 68, 68, 0.1)',
  warning: 'rgba(245, 158, 11, 0.1)',
  neutral: 'rgba(37, 99, 235, 0.1)',
  info: 'rgba(59, 130, 246, 0.1)'
};

export const ManagementAttentionPanel: React.FC = () => {
  return (
    <section className="ceo-attention" aria-label="What needs attention now">
      <header className="ceo-attention__header">
        <span className="ceo-attention__header-icon" aria-hidden="true">
          <AlertCircle size={16} strokeWidth={2} />
        </span>
        <h2 className="ceo-attention__title">What needs attention now?</h2>
      </header>

      <div className="ceo-attention__grid">
        {attentionItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`ceo-attention-card ceo-attention-card--${item.severity}`}
            style={{ '--accent-line': SEVERITY_ACCENT[item.severity] } as React.CSSProperties}
            aria-label={`${item.title}: ${item.value}. ${item.hint}`}
          >
            <div
              className="ceo-attention-card__icon"
              style={{
                backgroundColor: SEVERITY_ICON_BG[item.severity],
                color: SEVERITY_ACCENT[item.severity]
              }}
              aria-hidden="true"
            >
              {ATTENTION_ICONS[item.severity]}
            </div>
            <div className="ceo-attention-card__body">
              <span className="ceo-attention-card__value">{item.value}</span>
              <span className="ceo-attention-card__label">{item.title}</span>
              <span className="ceo-attention-card__hint">{item.hint}</span>
            </div>
            <ChevronRight className="ceo-attention-card__chevron" size={16} aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
};
