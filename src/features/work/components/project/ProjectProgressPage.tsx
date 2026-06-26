import React, { useMemo } from 'react';

import { useWork } from '../../context/work-context';
import { projectTasks, priorityBadgeClass, type WorkProject } from '../../workMockData';

interface Props {
  project: WorkProject;
}

export const ProjectProgressPage: React.FC<Props> = ({ project }) => {
  const { tasks } = useWork();
  
  const projectTaskList = useMemo(
    () => projectTasks(project.id, tasks),
    [project.id, tasks]
  );

  const doneCount = useMemo(() => projectTaskList.filter(t => t.status === 'done').length, [projectTaskList]);
  const totalCount = useMemo(() => projectTaskList.length, [projectTaskList]);
  const progressPct = useMemo(() => totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0, [doneCount, totalCount]);

  const statusCounts = useMemo(() => {
    const counts = { backlog: 0, todo: 0, in_progress: 0, review: 0, done: 0 };
    projectTaskList.forEach(t => {
      if (t.status in counts) {
        counts[t.status as keyof typeof counts]++;
      }
    });
    return counts;
  }, [projectTaskList]);

  const priorityCounts = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    projectTaskList.forEach(t => {
      if (t.priority in counts) {
        counts[t.priority as keyof typeof counts]++;
      }
    });
    return counts;
  }, [projectTaskList]);

  // SVG Burndown data
  const burndownPoints = useMemo(() => {
    const days = 10;
    const ideal = Array.from({ length: days }, (_, i) => ({
      x: (i / (days - 1)) * 100,
      y: 100 - (i / (days - 1)) * 100
    }));

    // Generate actual line curving down
    const actual = [
      { x: 0, y: 100 },
      { x: 10, y: 95 },
      { x: 20, y: 95 },
      { x: 30, y: 80 },
      { x: 40, y: 70 },
      { x: 50, y: 70 },
      { x: 60, y: 55 },
      { x: 70, y: 40 },
      { x: 80, y: Math.max(0, 100 - progressPct) }
    ];

    return { ideal, actual };
  }, [totalCount, progressPct]);

  return (
    <div className="work-screen" style={{ padding: '0 20px 24px' }}>
      <div className="work-screen__head">
        <div>
          <h3 className="work-screen__title">Project Progress</h3>
          <p className="work-screen__desc">Track task completion status, status distributions, and velocity metrics.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginTop: '16px' }}>
        {/* Left Side: Summary and Status Ring */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Progress Card */}
          <div className="work-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-h)' }}>
              Overall Completion
            </h4>
            
            <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '16px' }}>
              <svg style={{ width: '120px', height: '120px', transform: 'rotate(-90deg)' }}>
                <circle 
                  cx="60" cy="60" r="50" 
                  fill="none" stroke="var(--border)" strokeWidth="8"
                />
                <circle 
                  cx="60" cy="60" r="50" 
                  fill="none" stroke="var(--accent)" strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - progressPct / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-h)' }}>{progressPct}%</span>
                <span style={{ fontSize: '11px', color: 'var(--text-m)', marginTop: '2px' }}>Done</span>
              </div>
            </div>

            <div style={{ display: 'flex', width: '100%', justifyItems: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '16px', gap: '16px' }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '18px', fontWeight: 700, color: 'var(--text-h)' }}>
                  {doneCount}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-m)' }}>Completed Tasks</span>
              </div>
              <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
                <span style={{ display: 'block', fontSize: '18px', fontWeight: 700, color: 'var(--text-h)' }}>
                  {totalCount - doneCount}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-m)' }}>Pending Tasks</span>
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="work-panel">
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-h)' }}>
              Status Distribution
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Backlog', count: statusCounts.backlog, color: '#64748b' },
                { label: 'Todo', count: statusCounts.todo, color: '#3b82f6' },
                { label: 'In Progress', count: statusCounts.in_progress, color: '#f59e0b' },
                { label: 'Review', count: statusCounts.review, color: '#8b5cf6' },
                { label: 'Done', count: statusCounts.done, color: '#10b981' }
              ].map(item => {
                const percentage = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-h)' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                        {item.label}
                      </span>
                      <span style={{ color: 'var(--text-m)' }}>{item.count} ({percentage}%)</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: item.color, borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Charts & Priorities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Burndown Chart Panel */}
          <div className="work-panel" style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-h)' }}>
              Remaining Work (Burndown)
            </h4>
            <div style={{ position: 'relative', height: '200px', width: '100%', marginTop: '8px' }}>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '180px', display: 'block' }}>
                {/* Grid Lines */}
                <line x1="0" y1="25" x2="100" y2="25" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="0" y1="75" x2="100" y2="75" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2" />
                
                {/* Ideal Guideline */}
                <line 
                  x1="0" y1="0" x2="100" y2="100" 
                  stroke="var(--text-m)" strokeWidth="1" strokeDasharray="3" 
                  opacity="0.5"
                />
                
                {/* Actual Line */}
                <path
                  d={burndownPoints.actual.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Actual Dots */}
                {burndownPoints.actual.map((p, i) => (
                  <circle 
                    key={i} 
                    cx={p.x} cy={p.y} r="1.5" 
                    fill="var(--accent)" 
                  />
                ))}
              </svg>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-m)', padding: '0 4px' }}>
                <span>Start ({new Date(project.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})</span>
                <span>Due ({project.dueDate ? new Date(project.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'End'})</span>
              </div>

              <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-m)', marginTop: '8px', justifyContent: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '2px', background: 'var(--text-m)', display: 'inline-block', opacity: 0.5 }} />
                  Ideal Trend
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '2px', background: 'var(--accent)', display: 'inline-block' }} />
                  Actual Progress
                </span>
              </div>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="work-panel">
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-h)' }}>
              Priority Distribution
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[
                { label: 'Critical', count: priorityCounts.Critical, status: 'Critical' },
                { label: 'High', count: priorityCounts.High, status: 'High' },
                { label: 'Medium', count: priorityCounts.Medium, status: 'Medium' },
                { label: 'Low', count: priorityCounts.Low, status: 'Low' }
              ].map(item => (
                <div 
                  key={item.label} 
                  style={{ 
                    padding: '12px', 
                    borderRadius: '8px', 
                    background: 'var(--surface-muted)',
                    border: '1px solid var(--border)',
                    textAlign: 'center' 
                  }}
                >
                  <span className={`cfg-badge cfg-badge--${priorityBadgeClass(item.status as any)}`} style={{ marginBottom: '6px' }}>
                    {item.label}
                  </span>
                  <span style={{ display: 'block', fontSize: '20px', fontWeight: 700, color: 'var(--text-h)', marginTop: '4px' }}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
