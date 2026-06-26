import React, { useMemo } from 'react';
import { Award, Compass, Play } from 'lucide-react';
import { useWork } from '../../context/work-context';
import { type ProjectStatus, type WorkProject } from '../../workMockData';

interface Props {
  project: WorkProject;
}

export const ProjectStatusPage: React.FC<Props> = ({ project }) => {
  const { updateProject } = useWork();

  const currentStep = useMemo(() => {
    switch (project.status) {
      case 'on_hold':
        return 0; // Planning / On hold
      case 'active':
        return 1; // Active
      case 'completed':
      case 'archived':
        return 2; // Completed
      default:
        return 0;
    }
  }, [project.status]);

  const handleStatusChange = (status: ProjectStatus) => {
    updateProject(project.id, { status });
  };

  const steps = [
    { label: 'Planning', statusKey: 'on_hold' as ProjectStatus, icon: <Compass size={18} />, desc: 'Project configuration, planning backlog items, and member setups.' },
    { label: 'Active', statusKey: 'active' as ProjectStatus, icon: <Play size={18} />, desc: 'Sprint execution, progress tracking, and regular deliverables.' },
    { label: 'Completed', statusKey: 'completed' as ProjectStatus, icon: <Award size={18} />, desc: 'Final deliverables review, completion reports, and archiving preparation.' }
  ];

  return (
    <div className="work-screen" style={{ padding: '0 20px 24px' }}>
      <div className="work-screen__head">
        <div>
          <h3 className="work-screen__title">Project Status Stage</h3>
          <p className="work-screen__desc">Track and transition the lifecycle stages of {project.name}.</p>
        </div>
      </div>

      <div className="work-panel" style={{ marginTop: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', marginBottom: '32px' }}>
          {/* Progress Connector Line */}
          <div style={{
            position: 'absolute',
            left: '40px',
            right: '40px',
            top: '24px',
            height: '4px',
            background: 'var(--border)',
            zIndex: 1
          }} />
          <div style={{
            position: 'absolute',
            left: '40px',
            width: `${currentStep * 50}%`,
            top: '24px',
            height: '4px',
            background: 'var(--accent)',
            zIndex: 1,
            transition: 'width 0.3s ease'
          }} />

          {steps.map((step, idx) => {
            const isActive = currentStep === idx;
            const isCompleted = currentStep > idx;
            
            return (
              <button
                key={step.label}
                type="button"
                onClick={() => handleStatusChange(step.statusKey)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  zIndex: 2,
                  width: '120px',
                  outline: 'none'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: isCompleted || isActive ? 'var(--accent-bg)' : 'var(--surface-panel)',
                  border: isCompleted || isActive ? '2px solid var(--accent)' : '2px solid var(--border)',
                  color: isCompleted || isActive ? 'var(--accent)' : 'var(--text-m)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.2s ease',
                  marginBottom: '8px'
                }}>
                  {step.icon}
                </div>
                <span style={{ 
                  fontSize: '13.5px', 
                  fontWeight: isActive ? 700 : 500, 
                  color: isActive ? 'var(--accent)' : 'var(--text-h)'
                }}>
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          {steps.map((step, idx) => {
            const isCurrent = currentStep === idx;
            return (
              <div 
                key={step.label} 
                style={{ 
                  padding: '16px', 
                  borderRadius: '8px', 
                  background: isCurrent ? 'rgba(99, 102, 241, 0.03)' : 'transparent',
                  border: isCurrent ? '1px solid var(--accent)' : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: isCurrent ? 'var(--accent)' : 'var(--text-m)' }}>
                    STAGE 0{idx + 1}
                  </span>
                  {isCurrent && (
                    <span className="cfg-badge cfg-badge--active" style={{ fontSize: '10px', padding: '2px 6px' }}>
                      Current
                    </span>
                  )}
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-h)' }}>
                  {step.label} Stage
                </h4>
                <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-m)', lineHeight: '1.4' }}>
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
