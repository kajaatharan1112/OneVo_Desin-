import React, { useState } from 'react';
import { Trophy, Target, Star, ChevronDown, ChevronUp, User, Calendar, FolderOpen } from 'lucide-react';
import type { AchievementRecord, AchievementCategory } from '../../../data/performance-dashboard.data';

interface AchievementPanelProps {
  records: AchievementRecord[];
}

const CATEGORY_CONFIG: Record<AchievementCategory, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  goal: {
    label: 'Goal', color: '#2563eb', bg: '#eff6ff',
    icon: <Target size={13} aria-hidden="true" />
  },
  milestone: {
    label: 'Milestone', color: '#64748b', bg: '#f1f5f9',
    icon: <Star size={13} aria-hidden="true" />
  },
  award: {
    label: 'Award', color: '#1d4ed8', bg: '#dbeafe',
    icon: <Trophy size={13} aria-hidden="true" />
  }
};

export const AchievementPanel: React.FC<AchievementPanelProps> = ({ records }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id);

  const goalCount   = records.filter(r => r.category === 'goal').length;
  const awardCount  = records.filter(r => r.category === 'award').length;
  const milestoneCount = records.filter(r => r.category === 'milestone').length;

  return (
    <div className="perf-panel perf-panel--achieve" role="region" aria-label="Achievements and goals">
      <div className="perf-panel__head">
        <span className="perf-panel__title">Achievements</span>
        <span className="perf-panel__badge perf-panel__badge--blue">
          {records.length} total
        </span>
      </div>

      {/* Lifetime summary chips */}
      <div className="perf-achieve-summary">
        <span className="perf-achieve-summary__chip" style={{ color: '#2563eb', background: '#eff6ff' }}>
          <Target size={10} aria-hidden="true" />{goalCount} Goals
        </span>
        <span className="perf-achieve-summary__chip" style={{ color: '#64748b', background: '#f1f5f9' }}>
          <Star size={10} aria-hidden="true" />{milestoneCount} Milestones
        </span>
        <span className="perf-achieve-summary__chip" style={{ color: '#1d4ed8', background: '#dbeafe' }}>
          <Trophy size={10} aria-hidden="true" />{awardCount} Awards
        </span>
      </div>

      {/* Achievement list */}
      <ul className="perf-achieve-list perf-list" aria-label="Achievement list">
        {records.map(rec => {
          const cfg = CATEGORY_CONFIG[rec.category];
          const isOpen = expandedId === rec.id;
          return (
            <li key={rec.id} className={`perf-achieve-item${isOpen ? ' perf-achieve-item--open' : ''}`}>
              <button
                type="button"
                className="perf-achieve-row"
                onClick={() => toggle(rec.id)}
                aria-expanded={isOpen}
                aria-controls={`achieve-detail-${rec.id}`}
              >
                {/* Category icon */}
                <div className="perf-achieve-icon" style={{ color: cfg.color, background: cfg.bg }}
                  aria-hidden="true">
                  {cfg.icon}
                </div>

                <div className="perf-achieve-info">
                  <span className="perf-achieve-title">{rec.title}</span>
                  <span className="perf-achieve-meta">
                    <FolderOpen size={10} aria-hidden="true" />{rec.project}
                    <span className="perf-achieve-sep" aria-hidden="true">·</span>
                    <Calendar size={10} aria-hidden="true" />{rec.achievedDate}
                  </span>
                </div>

                <span className="perf-achieve-badge"
                  style={{ color: cfg.color, background: cfg.bg }}>
                  {cfg.label}
                </span>

                <span className="perf-achieve-chevron" aria-hidden="true">
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div
                  id={`achieve-detail-${rec.id}`}
                  className="perf-achieve-detail"
                  role="region"
                  aria-label={`${rec.title} details`}
                >
                  {/* Meta chips */}
                  <div className="perf-achieve-detail-meta">
                    <span className="perf-achieve-detail-chip">
                      <User size={9} aria-hidden="true" />
                      <span className="perf-achieve-detail-chip__label">Team lead</span>
                      <strong>{rec.teamLead}</strong>
                    </span>
                    <span className="perf-achieve-detail-chip">
                      <FolderOpen size={9} aria-hidden="true" />
                      <span className="perf-achieve-detail-chip__label">Project</span>
                      <strong>{rec.project}</strong>
                    </span>
                    <span className="perf-achieve-detail-chip">
                      <Calendar size={9} aria-hidden="true" />
                      <span className="perf-achieve-detail-chip__label">Achieved</span>
                      <strong>{rec.achievedDate}</strong>
                    </span>
                  </div>

                  <div className="perf-achieve-detail-desc">
                    <span className="perf-achieve-detail-desc__label">Description</span>
                    <p>{rec.description}</p>
                  </div>

                  {rec.impact && (
                    <div className="perf-achieve-detail-impact">
                      <Star size={10} color="#2563eb" aria-hidden="true" />
                      <span>{rec.impact}</span>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
