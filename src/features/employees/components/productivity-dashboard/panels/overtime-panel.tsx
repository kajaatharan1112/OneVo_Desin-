import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock3, CheckCircle2, FileText } from 'lucide-react';
import type { OvertimeRecord, PeriodMode } from '../../../data/productivity-dashboard.data';

interface OvertimePanelProps {
  records: OvertimeRecord[];
  monthRecords: OvertimeRecord[];
  period: PeriodMode;
}

export const OvertimePanel: React.FC<OvertimePanelProps> = ({ records, monthRecords, period }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const activeRecords = period === 'week' ? records : monthRecords;

  const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id);

  return (
    <div className="pd-panel pd-panel--overtime" role="region" aria-label="Overtime records">
      <div className="pd-panel__head">
        <span className="pd-panel__title">Overtime</span>
        <span className="pd-panel__badge pd-panel__badge--blue">{activeRecords.length} entries</span>
      </div>

      <ul className="pd-list pd-ot-list" aria-label="Overtime history">
        {activeRecords.length === 0 && (
          <li className="pd-leave-empty">No overtime this {period}</li>
        )}
        {activeRecords.map(rec => {
          const isOpen = expandedId === rec.id;
          return (
            <li key={rec.id} className={`pd-ot-item${isOpen ? ' pd-ot-item--open' : ''}`}>
              <button
                type="button"
                className="pd-ot-row"
                aria-expanded={isOpen}
                aria-controls={`ot-detail-${rec.id}`}
                onClick={() => toggle(rec.id)}
              >
                <span className="pd-ot-icon" aria-hidden="true">
                  <Clock3 size={14} />
                </span>
                <span className="pd-ot-info">
                  <span className="pd-ot-date">{rec.date}</span>
                  <span className="pd-ot-duration">{rec.duration}</span>
                </span>
                <span className="pd-ot-approved">
                  <CheckCircle2 size={11} aria-hidden="true" />
                  {rec.approvedBy}
                </span>
                <span className="pd-ot-chevron" aria-hidden="true">
                  {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </span>
              </button>

              {isOpen && (
                <div
                  id={`ot-detail-${rec.id}`}
                  className="pd-ot-detail"
                  role="region"
                  aria-label={`Overtime details for ${rec.date}`}
                >
                  <p className="pd-ot-reason">{rec.reason}</p>
                  <div className="pd-ot-tasks">
                    <span className="pd-ot-tasks__label">
                      <FileText size={11} aria-hidden="true" />
                      Tasks done during overtime
                    </span>
                    <ul className="pd-ot-tasks__list">
                      {rec.tasks.map(t => (
                        <li key={t.id} className="pd-ot-task">
                          <span className="pd-ot-task__dot" aria-hidden="true" />
                          <span className="pd-ot-task__title">{t.title}</span>
                          <span className="pd-ot-task__hrs">{t.hours}h</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    className="pd-btn pd-btn--outline pd-btn--sm"
                    aria-label={`Appeal overtime on ${rec.date}`}
                  >
                    Appeal overtime
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
