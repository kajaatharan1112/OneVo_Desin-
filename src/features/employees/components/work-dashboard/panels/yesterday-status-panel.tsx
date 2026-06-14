import React, { useState } from 'react';
import { User, Clock, CheckCircle2, MessageSquare } from 'lucide-react';
import type { WorkDashboardYesterdayItem } from '../../../data/work-dashboard.data';
import { WorkDashboardPanel } from '../work-dashboard-panel';

interface YesterdayStatusPanelProps {
  items: WorkDashboardYesterdayItem[];
  highlight: { label: string; detail: string };
}

export const YesterdayStatusPanel: React.FC<YesterdayStatusPanelProps> = ({ items, highlight }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const toggle = (id: string) =>
    setSelectedId((prev) => (prev === id ? null : id));

  return (
    <WorkDashboardPanel title="Yesterday status" className="work-dashboard__yesterday">
      <div className="wd-highlight wd-highlight--success">
        <span className="wd-highlight__label">{highlight.label}</span>
        <span className="wd-highlight__detail">{highlight.detail}</span>
      </div>

      <ul className="wd-row-list work-dashboard-scroll" aria-label="Yesterday's task status">
        {items.map((item) => {
          const isOpen = item.id === selectedId;

          return (
            <li key={item.id}>
              <button
                type="button"
                className={`wd-row${isOpen ? ' wd-row--active' : ''}`}
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen}
              >
                <span className={`wd-row__icon wd-row__icon--ys${isOpen ? ' wd-row__icon--active' : ''}`} aria-hidden="true" />
                <span className="wd-row__body">

                  {/* Title + status pill */}
                  <span className="wd-row__title-line">
                    <span className="wd-row__title">{item.title}</span>
                    <span className="wd-ys-status-pill">{item.statusLabel}</span>
                  </span>

                  {/* Always-visible detail chips */}
                  <span className="wd-ys-detail-chips">
                    <span className="wd-ys-chip">
                      <User size={9} aria-hidden="true" />
                      {item.reviewedBy}
                    </span>
                    <span className="wd-ys-chip">
                      <Clock size={9} aria-hidden="true" />
                      {item.duration}
                    </span>
                    <span className="wd-ys-chip">
                      <CheckCircle2 size={9} aria-hidden="true" />
                      {item.completedAt}
                    </span>
                  </span>

                  {/* Expand on click — description + comment */}
                  {isOpen && (
                    <span className="wd-row__expand">
                      <span className="wd-row__expand-desc">{item.description}</span>
                      <span className="wd-ys-comment">
                        <MessageSquare size={11} aria-hidden="true" />
                        {item.comments}
                      </span>
                    </span>
                  )}

                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </WorkDashboardPanel>
  );
};
