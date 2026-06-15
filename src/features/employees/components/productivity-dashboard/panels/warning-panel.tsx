import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldAlert, Clock, User2 } from 'lucide-react';
import type { WarningRecord, WarningType } from '../../../data/productivity-dashboard.data';

interface WarningPanelProps {
  records: WarningRecord[];
}

const TYPE_LABEL: Record<WarningType, string> = {
  'late-clock-in':      'Late Clock-In',
  'unauthorized-app':   'Unauthorized App',
  'offline-too-long':   'Extended Offline',
  'multiple-warnings':  'Multiple Violations',
  'policy-breach':      'Policy Breach'
};

/* Blue/gray only — no amber, orange, or red */
const SEVERITY_STYLE: Record<WarningRecord['severity'], { color: string; bg: string; label: string }> = {
  low:    { color: '#64748b', bg: '#f1f5f9', label: 'Low' },
  medium: { color: '#475569', bg: '#e2e8f0', label: 'Medium' },
  high:   { color: '#2563eb', bg: '#eff6ff', label: 'High' }
};

export const WarningPanel: React.FC<WarningPanelProps> = ({ records }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id);

  return (
    <div className="pd-panel pd-panel--warning" role="region" aria-label="Warning history">
      <div className="pd-panel__head">
        <span className="pd-panel__title">Warnings</span>
        <span className="pd-panel__badge pd-panel__badge--gray">{records.length}</span>
      </div>

      <ul className="pd-list pd-warn-list" aria-label="Warning records">
        {records.map(rec => {
          const isOpen = expandedId === rec.id;
          const sev = SEVERITY_STYLE[rec.severity];

          return (
            <li key={rec.id} className={`pd-warn-item${isOpen ? ' pd-warn-item--open' : ''}`}>
              <button
                type="button"
                className="pd-warn-row"
                aria-expanded={isOpen}
                aria-controls={`warn-detail-${rec.id}`}
                onClick={() => toggle(rec.id)}
              >
                <span
                  className="pd-warn-icon"
                  aria-hidden="true"
                  style={{ color: sev.color, background: sev.bg }}
                >
                  <ShieldAlert size={13} />
                </span>
                <span className="pd-warn-info">
                  <span className="pd-warn-title">{TYPE_LABEL[rec.type]}</span>
                  <span className="pd-warn-meta">
                    <Clock size={10} aria-hidden="true" />
                    {rec.date} · {rec.time}
                  </span>
                </span>
                <span
                  className="pd-warn-severity"
                  style={{ color: sev.color }}
                  aria-label={`Severity: ${rec.severity}`}
                >
                  {sev.label}
                </span>
                <span className="pd-warn-chevron" aria-hidden="true">
                  {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </span>
              </button>

              {isOpen && (
                <div
                  id={`warn-detail-${rec.id}`}
                  className="pd-warn-detail"
                  role="region"
                  aria-label={`Warning detail: ${rec.title}`}
                >
                  <p className="pd-warn-desc">{rec.description}</p>

                  <div className="pd-warn-manager">
                    <User2 size={11} aria-hidden="true" />
                    <span>Alert received by</span>
                    <strong>{rec.reportingManager}</strong>
                  </div>

                  <div className="pd-warn-footer">
                    <span className="pd-warn-timestamp">
                      <Clock size={11} aria-hidden="true" />
                      {rec.date}, {rec.time}
                    </span>
                    <button
                      type="button"
                      className="pd-btn pd-btn--outline pd-btn--sm"
                      aria-label={`Appeal warning issued on ${rec.date}`}
                    >
                      Appeal warning
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
