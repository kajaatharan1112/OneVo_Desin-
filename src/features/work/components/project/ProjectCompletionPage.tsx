import React, { useMemo, useState } from 'react';
import { Archive, Award, CheckCircle, FileText, AlertTriangle } from 'lucide-react';
import { useWork } from '../../context/work-context';
import { projectTasks, type WorkProject } from '../../workMockData';

interface Props {
  project: WorkProject;
}

export const ProjectCompletionPage: React.FC<Props> = ({ project }) => {
  const { tasks, milestones, updateProject } = useWork();
  const [checklist, setChecklist] = useState({
    reviewDone: true,
    handoverComplete: false,
    docsLocked: false
  });

  const projectTaskList = useMemo(
    () => projectTasks(project.id, tasks),
    [project.id, tasks]
  );

  const doneTasksCount = useMemo(() => projectTaskList.filter(t => t.status === 'done').length, [projectTaskList]);
  const totalTasksCount = useMemo(() => projectTaskList.length, [projectTaskList]);
  const allTasksDone = totalTasksCount > 0 && doneTasksCount === totalTasksCount;

  const projectMilestones = useMemo(
    () => milestones.filter(m => m.projectId === project.id),
    [milestones, project.id]
  );
  
  const allMilestonesReached = useMemo(
    () => projectMilestones.length > 0 && projectMilestones.every(m => m.status === 'reached'),
    [projectMilestones]
  );

  const handleArchive = () => {
    updateProject(project.id, { status: 'archived' });

    // Generate and Download Final Report
    const header = `ONEVO PLATFORM - FINAL CLOSURE REPORT\n`;
    const details = `Project: ${project.name} (${project.key})\nClosure Date: ${new Date().toLocaleDateString()}\nStatus: CLOSED & ARCHIVED\n`;
    const stats = `Total Completed Tasks: ${doneTasksCount}/${totalTasksCount}\nTotal Milestones Reached: ${projectMilestones.length}\n`;
    const checkSummary = `Checklist Log:\n- Review Meeting: Checked\n- Code Handover: Checked\n- Documentation Locked: Checked\n`;
    
    const content = header + '\n' + details + stats + checkSummary + `\nSignoff Authority: Alex Rivera (Project Lead)`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.key}_Final_Closure_Report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isClosed = project.status === 'archived' || project.status === 'completed';

  return (
    <div className="work-screen" style={{ padding: '0 20px 24px' }}>
      <div className="work-screen__head">
        <div>
          <h3 className="work-screen__title">Project Completion & Closure</h3>
          <p className="work-screen__desc">Wrap up final tasks, confirm milestones, and archive {project.name}.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginTop: '16px' }}>
        {/* Left Side: Closure Check and Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="work-panel" style={{ padding: '24px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-h)' }}>
              Closure Checklist
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Dynamic Task Check */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <input 
                  type="checkbox" 
                  checked={allTasksDone} 
                  disabled 
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-h)', display: 'block' }}>
                    All Tasks Completed
                  </span>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-m)' }}>
                    {doneTasksCount} of {totalTasksCount} tasks completed.
                  </span>
                </div>
              </div>

              {/* Dynamic Milestones Check */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <input 
                  type="checkbox" 
                  checked={allMilestonesReached || projectMilestones.length === 0} 
                  disabled 
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-h)', display: 'block' }}>
                    All Milestones Reached
                  </span>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-m)' }}>
                    {projectMilestones.length === 0 ? 'No milestones defined (Skipped)' : `${projectMilestones.filter(m => m.status === 'reached').length} of ${projectMilestones.length} reached.`}
                  </span>
                </div>
              </div>

              {/* Manual Checks */}
              <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={checklist.reviewDone} 
                  onChange={e => setChecklist(c => ({ ...c, reviewDone: e.target.checked }))}
                  disabled={isClosed}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-h)', display: 'block' }}>
                    Perform Project Retrospective Review
                  </span>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-m)' }}>
                    Collect team feedbacks and performance evaluations.
                  </span>
                </div>
              </label>

              <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={checklist.handoverComplete || isClosed} 
                  onChange={e => setChecklist(c => ({ ...c, handoverComplete: e.target.checked }))}
                  disabled={isClosed}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-h)', display: 'block' }}>
                    Code Handover & Deployment Signoff
                  </span>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-m)' }}>
                    Verify final releases and repository handovers.
                  </span>
                </div>
              </label>

              <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={checklist.docsLocked || isClosed} 
                  onChange={e => setChecklist(c => ({ ...c, docsLocked: e.target.checked }))}
                  disabled={isClosed}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-h)', display: 'block' }}>
                    Lock Project Documentation & Files
                  </span>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-m)' }}>
                    Set all project documents to locked to prevent edits.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Closure Action Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="work-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '100%' }}>
            {isClosed ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '50%', 
                  background: 'rgba(34, 197, 94, 0.1)', 
                  color: '#22c55e',
                  marginBottom: '16px'
                }}>
                  <CheckCircle size={28} />
                </span>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-h)' }}>
                  Project Closed
                </h4>
                <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--text-m)', maxWidth: '280px' }}>
                  This project has been successfully completed and archived. You can inspect its logs or download final reports.
                </p>
                <button 
                  type="button" 
                  className="org-btn org-btn--secondary" 
                  onClick={handleArchive}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <FileText size={14} /> Download Final Report
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '50%', 
                  background: 'rgba(245, 158, 11, 0.1)', 
                  color: '#f59e0b',
                  marginBottom: '16px'
                }}>
                  <Award size={28} />
                </span>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-h)' }}>
                  Ready to Complete?
                </h4>
                <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--text-m)' }}>
                  Confirming project closure will set the status to archived and generate the final signoff document automatically.
                </p>

                {!allTasksDone && (
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    alignItems: 'center', 
                    padding: '10px 12px', 
                    background: 'rgba(239, 68, 68, 0.05)', 
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    color: '#ef4444',
                    fontSize: '12px',
                    textAlign: 'left',
                    marginBottom: '20px',
                    width: '100%'
                  }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                    <span>Warning: There are still pending work items in this project.</span>
                  </div>
                )}

                <button 
                  type="button" 
                  className="org-btn org-btn--primary" 
                  onClick={handleArchive}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px' }}
                >
                  <Archive size={16} /> Complete & Archive Project
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
