import React, { useMemo } from 'react';
import { Activity, Clock, Plus, ArrowRight, UserPlus, Flag } from 'lucide-react';
import { MOCK_ACTIVITY, type WorkProject } from '../../workMockData';

interface Props {
  project: WorkProject;
}

export const ProjectActivityLogPage: React.FC<Props> = ({ project }) => {
  // Get activity list and filter by project ID
  const projectActivities = useMemo(() => {
    const list = MOCK_ACTIVITY.filter(a => a.projectId === project.id);
    
    // Add some simulated activities to populate the log nicely
    const generated = [
      { id: 'gen-1', projectId: project.id, text: `Project "${project.name}" was initialized in the workspace`, time: '10d ago' },
      { id: 'gen-2', projectId: project.id, text: 'Alex Rivera created the initial project specification guidelines', time: '9d ago' },
      { id: 'gen-3', projectId: project.id, text: 'Alex Rivera linked Engineering Workspace', time: '8d ago' },
      ...list
    ];
    
    return generated.reverse(); // Newest first
  }, [project.id, project.name]);

  const getActivityIcon = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes('create') || t.includes('add')) return <Plus size={12} />;
    if (t.includes('move') || t.includes('update') || t.includes('status')) return <ArrowRight size={12} />;
    if (t.includes('invite') || t.includes('link') || t.includes('member')) return <UserPlus size={12} />;
    if (t.includes('milestone') || t.includes('phase')) return <Flag size={12} />;
    return <Activity size={12} />;
  };

  const getActorInitials = (text: string) => {
    const words = text.split(' ');
    if (words.length >= 2) {
      const first = words[0];
      const second = words[1];
      if (first[0] === first[0].toUpperCase() && second[0] === second[0].toUpperCase()) {
        return first[0] + second[0];
      }
    }
    return 'AR'; // Fallback actor
  };

  return (
    <div className="work-screen" style={{ padding: '0 20px 24px' }}>
      <div className="work-screen__head">
        <div>
          <h3 className="work-screen__title">Activity Log</h3>
          <p className="work-screen__desc">Timeline of changes, updates, and interactions on {project.name}.</p>
        </div>
      </div>

      <div className="work-panel" style={{ marginTop: '16px', padding: '24px' }}>
        <div style={{ position: 'relative', paddingLeft: '32px' }}>
          {/* Vertical Timeline Line */}
          <div style={{
            position: 'absolute',
            top: '8px',
            bottom: '8px',
            left: '15px',
            width: '2px',
            background: 'var(--border)'
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {projectActivities.map(activity => {
              const initials = getActorInitials(activity.text);
              return (
                <div key={activity.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', position: 'relative' }}>
                  {/* Timeline Node Avatar */}
                  <span 
                    className="work-avatar-chip__circle" 
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      fontSize: '12px', 
                      zIndex: 2, 
                      position: 'absolute',
                      left: '-48px',
                      top: '0',
                      background: 'var(--surface-panel)',
                      border: '2px solid var(--border)',
                      fontWeight: 600
                    }}
                  >
                    {initials}
                  </span>

                  {/* Micro Activity Icon Indicator */}
                  <span style={{
                    position: 'absolute',
                    left: '-22px',
                    top: '20px',
                    zIndex: 3,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'var(--surface-panel)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    color: 'var(--text-m)'
                  }}>
                    {getActivityIcon(activity.text)}
                  </span>

                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-h)', fontWeight: 500, lineHeight: '1.4' }}>
                      {activity.text}
                    </p>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-m)', marginTop: '4px' }}>
                      <Clock size={11} />
                      {activity.time}
                    </span>
                  </div>
                </div>
              );
            })}

            {projectActivities.length === 0 && (
              <p className="admin-hint" style={{ textAlign: 'center', padding: '20px 0' }}>No activity tracked yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
