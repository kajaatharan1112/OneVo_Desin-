import React, { useState, useMemo } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  User,
  ChevronDown,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { useWork } from '../../context/work-context';
import {
  CURRENT_USER_ID,
  MOCK_EMPLOYEES,
  employeeName,
  formatWorkDate,
  formatWorkDateShort,
  priorityBadgeClass,
  type MilestoneStatus,
  type ProjectGoal,
  type PlannerMilestone,
  type WorkProject,
} from '../../workMockData';

interface Props {
  project: WorkProject;
}

export const ProjectGoalsPage: React.FC<Props> = ({ project }) => {
  const {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    milestones,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    tasks,
    openTaskDetail,
  } = useWork();

  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [expandedMilestoneIds, setExpandedMilestoneIds] = useState<Record<string, boolean>>({});

  // Creation states
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [isCreatingMilestone, setIsCreatingMilestone] = useState(false);

  // Milestone (formerly Goal) Form State
  const [goalForm, setGoalForm] = useState({
    name: '',
    description: '',
    durationHours: 120,
    ownerId: CURRENT_USER_ID,
    status: 'active' as 'active' | 'completed' | 'on_hold',
  });

  // Sub Milestone (formerly Milestone) Form State
  const [milestoneForm, setMilestoneForm] = useState({
    name: '',
    description: '',
    startDate: '',
    dueDate: '',
    ownerId: CURRENT_USER_ID,
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
    status: 'upcoming' as MilestoneStatus,
  });

  // Checklist text input state indexed by milestone (goal) ID
  const [newChecklistText, setNewChecklistText] = useState<Record<string, string>>({});

  const projectGoals = useMemo(
    () => goals.filter(g => g.projectId === project.id),
    [goals, project.id]
  );

  const toggleExpand = (id: string) => {
    setExpandedMilestoneIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Milestone (formerly Goal) handlers
  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.name.trim()) return;

    const newG: ProjectGoal = {
      id: `goal-${Date.now()}`,
      name: goalForm.name.trim(),
      description: goalForm.description.trim(),
      projectId: project.id,
      durationHours: Number(goalForm.durationHours),
      ownerId: goalForm.ownerId,
      status: goalForm.status,
      checklist: [],
    };

    addGoal(newG);
    setGoalForm({
      name: '',
      description: '',
      durationHours: 120,
      ownerId: CURRENT_USER_ID,
      status: 'active',
    });
    setIsCreatingGoal(false);
  };

  const handleDeleteGoal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this Milestone?')) {
      deleteGoal(id);
    }
  };

  // Sub Milestone (formerly Milestone) handlers
  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneForm.name.trim() || !milestoneForm.dueDate || !selectedGoalId) return;

    const newMs: PlannerMilestone = {
      id: `ms-${Date.now()}`,
      name: milestoneForm.name.trim(),
      description: milestoneForm.description.trim(),
      projectId: project.id,
      goalId: selectedGoalId,
      startDate: milestoneForm.startDate,
      dueDate: milestoneForm.dueDate,
      ownerId: milestoneForm.ownerId,
      priority: milestoneForm.priority,
      status: milestoneForm.status,
      linkedWorkItemIds: [],
      checklist: [],
    };

    addMilestone(newMs);
    setMilestoneForm({
      name: '',
      description: '',
      startDate: '',
      dueDate: '',
      ownerId: CURRENT_USER_ID,
      priority: 'Medium',
      status: 'upcoming',
    });
    setIsCreatingMilestone(false);
  };

  // Milestone (formerly Goal) Checklist Handlers
  const handleAddChecklist = (goalId: string) => {
    const text = newChecklistText[goalId] || '';
    if (!text.trim()) return;

    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newItem = {
      id: `gc-${Date.now()}`,
      text: text.trim(),
      done: false,
    };

    updateGoal(goalId, {
      checklist: [...goal.checklist, newItem],
    });
    setNewChecklistText(prev => ({ ...prev, [goalId]: '' }));
  };

  const toggleGoalChecklistItem = (goalId: string, itemId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedChecklist = goal.checklist.map(item =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );

    updateGoal(goalId, { checklist: updatedChecklist });
  };

  const deleteGoalChecklistItem = (goalId: string, itemId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    updateGoal(goalId, {
      checklist: goal.checklist.filter(item => item.id !== itemId),
    });
  };

  const getMilestoneTasks = (msId: string) => {
    return tasks.filter(t => t.projectId === project.id && milestones.find(m => m.id === msId)?.linkedWorkItemIds.includes(t.id));
  };

  return (
    <div className="work-goals-page" style={{ padding: '24px 20px', fontFamily: 'Outfit, Inter, sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .goal-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 16px;
        }
        .goal-card {
          background: var(--surface-card, #ffffff);
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
          transition: all 0.2s ease-in-out;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .goal-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .goal-card-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          flex: 1;
        }
        .goal-card-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-h, #0f172a);
          margin: 0;
        }
        .goal-badge {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 999px;
        }
        .goal-badge--active { background: #eff6ff; color: #1e40af; }
        .goal-badge--completed { background: #dcfce7; color: #15803d; }
        .goal-badge--on_hold { background: #fef3c7; color: #b45309; }
        
        .goal-card-desc {
          font-size: 13px;
          color: var(--text-m, #475569);
          line-height: 1.5;
          margin: 0;
        }
        
        /* Form drawer styles */
        .goals-drawer-backdrop {
          position: fixed;
          top: 0; right: 0; bottom: 0; left: 0;
          background: rgba(15, 23, 42, 0.3);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
        }
        .goals-drawer {
          width: 480px;
          background: #ffffff;
          height: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: -10px 0 25px -5px rgba(0,0,0,0.1);
          animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        /* Milestone detailed view styles */
        .goal-details-tabs {
          display: flex;
          gap: 4px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 20px;
        }
        
        .milestone-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        /* Milestone Card for Goals */
        .goal-ms-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .goal-checklist-wrap {
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          border: 1px dashed #cbd5e1;
        }
        .checklist-item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .checklist-item-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-m);
          cursor: pointer;
        }
        .checklist-item-text--done {
          text-decoration: line-through;
          opacity: 0.6;
        }
      ` }} />

      <div>
        {/* Page Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-h)' }}>Project Milestones</h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-m)' }}>
              Establish core project milestones and trace phase-wise progress.
            </p>
          </div>
          <button
            type="button"
            className="org-btn org-btn--primary org-btn--sm"
            onClick={() => setIsCreatingGoal(true)}
          >
            <Plus size={14} /> Create Milestone
          </button>
        </div>

        {projectGoals.length === 0 ? (
          <div className="cfg-empty" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '40px', textAlign: 'center' }}>
            <p className="cfg-empty__title" style={{ fontSize: '15px', fontWeight: 600, color: '#334155', margin: 0 }}>No milestones defined yet</p>
            <p className="cfg-empty__desc" style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Add high-level project milestones to align your sub milestones and checklists.</p>
            <button
              type="button"
              className="org-btn org-btn--secondary org-btn--sm"
              onClick={() => setIsCreatingGoal(true)}
              style={{ marginTop: '16px' }}
            >
              + Define First Milestone
            </button>
          </div>
        ) : (
          <div className="goal-grid">
            {projectGoals.map(goal => {
              const isExpanded = !!expandedMilestoneIds[goal.id];
              const goalMilestonesCount = milestones.filter(m => m.projectId === project.id && m.goalId === goal.id).length;
              const completedChecklist = goal.checklist.filter(item => item.done).length;
              const totalChecklist = goal.checklist.length;
              const progressPercent = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;
              const currentGoalMilestones = milestones.filter(m => m.projectId === project.id && m.goalId === goal.id);

              return (
                <div key={goal.id} className="goal-card">
                  {/* Card Header */}
                  <div className="goal-card-header">
                    <div className="goal-card-title-group" onClick={() => toggleExpand(goal.id)}>
                      {isExpanded ? <ChevronDown size={18} style={{ color: 'var(--text-s)' }} /> : <ChevronRight size={18} style={{ color: 'var(--text-s)' }} />}
                      <h3 className="goal-card-title">{goal.name}</h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select
                        value={goal.status}
                        onChange={e => updateGoal(goal.id, { status: e.target.value as any })}
                        className={`goal-badge goal-badge--${goal.status}`}
                        style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px' }}
                      >
                        <option value="active" style={{ color: '#1e40af', background: '#eff6ff' }}>Active</option>
                        <option value="completed" style={{ color: '#15803d', background: '#dcfce7' }}>Completed</option>
                        <option value="on_hold" style={{ color: '#b45309', background: '#fef3c7' }}>On Hold</option>
                      </select>
                      
                      <button
                        type="button"
                        onClick={(e) => handleDeleteGoal(goal.id, e)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                        title="Delete Milestone"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="goal-card-desc" style={{ paddingLeft: '26px' }}>{goal.description || 'No milestone description provided.'}</p>

                  {/* Progress Indicator */}
                  {totalChecklist > 0 && (
                    <div style={{ paddingLeft: '26px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--text-s)', marginBottom: '4px' }}>
                        <span>Milestone Checklist ({completedChecklist}/{totalChecklist})</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'var(--accent)', width: `${progressPercent}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Quick summary line when collapsed */}
                  {!isExpanded && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-s)', paddingLeft: '26px', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '6px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {goal.durationHours} Hours
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <User size={12} />
                        {employeeName(goal.ownerId)}
                      </span>
                      <span style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--accent)' }}>
                        {goalMilestonesCount} Sub Milestones
                      </span>
                    </div>
                  )}

                  {/* EXPANDED DETAILED INLINE VIEW */}
                  {isExpanded && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '12px' }}>
                      {/* Left: Sub Milestones */}
                      <div>
                        <div className="milestone-section-header">
                          <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>Sub Milestones under this Milestone</h4>
                          <button
                            type="button"
                            className="org-btn org-btn--primary org-btn--sm"
                            onClick={() => {
                              setSelectedGoalId(goal.id);
                              setIsCreatingMilestone(true);
                            }}
                            style={{ padding: '3px 8px', fontSize: '11px' }}
                          >
                            <Plus size={11} /> Add Sub Milestone
                          </button>
                        </div>

                        {currentGoalMilestones.length === 0 ? (
                          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>No sub milestones created yet.</p>
                          </div>
                        ) : (
                          currentGoalMilestones.map(ms => {
                            const msTasks = getMilestoneTasks(ms.id);
                            const doneTasks = msTasks.filter(t => t.status === 'done').length;

                            return (
                              <div key={ms.id} className="goal-ms-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div>
                                    <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{ms.name}</h5>
                                    <p style={{ margin: '3px 0 0', fontSize: '11.5px', color: '#64748b' }}>{ms.description}</p>
                                  </div>
                                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <span className={`cfg-badge cfg-badge--${priorityBadgeClass(ms.priority || 'Medium')}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                                      {ms.priority || 'Medium'}
                                    </span>
                                    <span className={`cfg-badge cfg-badge--open`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                                      Due {formatWorkDateShort(ms.dueDate)}
                                    </span>
                                    <button
                                      type="button"
                                      style={{ padding: '2px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                      onClick={() => {
                                        if (window.confirm('Delete this sub milestone?')) {
                                          deleteMilestone(ms.id);
                                        }
                                      }}
                                    >
                                      <Trash2 size={12} style={{ color: '#b91c1c' }} />
                                    </button>
                                  </div>
                                </div>

                                {/* Link to tasks */}
                                {msTasks.length > 0 && (
                                  <div style={{ background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '8px 10px', marginTop: '4px' }}>
                                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Linked Work Items ({doneTasks}/{msTasks.length}):</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                      {msTasks.map(task => (
                                        <div
                                          key={task.id}
                                          onClick={() => openTaskDetail(task.id)}
                                          style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}
                                        >
                                          <span>{task.key}: {task.title}</span>
                                          <span style={{ textDecoration: 'none', color: '#475569', fontSize: '10px' }}>{task.status.toUpperCase()}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Right: Milestone Checklist & Parameter settings */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 10px', fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>Milestone Checklist</h4>
                          <div className="goal-checklist-wrap" style={{ padding: '12px' }}>
                            {goal.checklist.length === 0 ? (
                              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', textAlign: 'center' }}>No checklist items.</p>
                            ) : (
                              goal.checklist.map(item => (
                                <div key={item.id} className="checklist-item-row" style={{ padding: '4px 0' }}>
                                  <label className="checklist-item-label" onClick={() => toggleGoalChecklistItem(goal.id, item.id)}>
                                    <input type="checkbox" checked={item.done} readOnly />
                                    <span className={item.done ? 'checklist-item-text--done' : ''} style={{ fontSize: '12px' }}>{item.text}</span>
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => deleteGoalChecklistItem(goal.id, item.id)}
                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              ))
                            )}

                            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                              <input
                                type="text"
                                placeholder="New checklist item..."
                                value={newChecklistText[goal.id] || ''}
                                onChange={e => {
                                  const textVal = e.target.value;
                                  setNewChecklistText(prev => ({ ...prev, [goal.id]: textVal }));
                                }}
                                onKeyDown={e => { if (e.key === 'Enter') handleAddChecklist(goal.id); }}
                                style={{ flex: 1, padding: '4px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                              />
                              <button
                                type="button"
                                onClick={() => handleAddChecklist(goal.id)}
                                className="org-btn org-btn--secondary org-btn--sm"
                                style={{ padding: '4px 8px', fontSize: '11px' }}
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Parameter edit box */}
                        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <h4 style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#475569' }}>Milestone Settings</h4>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ color: '#64748b' }}>Duration (Hours):</span>
                              <input 
                                type="number" 
                                value={goal.durationHours} 
                                onChange={e => updateGoal(goal.id, { durationHours: Number(e.target.value) })}
                                style={{ width: '70px', padding: '3px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'right' }}
                              />
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ color: '#64748b' }}>Owner:</span>
                              <select 
                                value={goal.ownerId}
                                onChange={e => updateGoal(goal.id, { ownerId: e.target.value })}
                                style={{ padding: '3px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                              >
                                {MOCK_EMPLOYEES.map(emp => (
                                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CREATE MILESTONE (formerly Goal) DRAWER ── */}
      {isCreatingGoal && (
        <div className="goals-drawer-backdrop" onClick={() => setIsCreatingGoal(false)}>
          <div className="goals-drawer" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Create Milestone</h3>
              <button
                type="button"
                onClick={() => setIsCreatingGoal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreateGoal} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
              <div className="org-form-field">
                <label htmlFor="goal-name">Milestone Name <span style={{ color: 'red' }}>*</span></label>
                <input
                  id="goal-name"
                  placeholder="e.g. Design System Implementation"
                  value={goalForm.name}
                  onChange={e => setGoalForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div className="org-form-field">
                <label htmlFor="goal-desc">Description</label>
                <textarea
                  id="goal-desc"
                  placeholder="What is the objective of this project milestone?"
                  rows={4}
                  value={goalForm.description}
                  onChange={e => setGoalForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="org-form-field">
                <label htmlFor="goal-duration">Duration (Hours)</label>
                <input
                  id="goal-duration"
                  type="number"
                  min={1}
                  value={goalForm.durationHours}
                  onChange={e => setGoalForm(f => ({ ...f, durationHours: Number(e.target.value) }))}
                  required
                />
              </div>

              <div className="org-form-field">
                <label htmlFor="goal-owner">Owner</label>
                <select
                  id="goal-owner"
                  value={goalForm.ownerId}
                  onChange={e => setGoalForm(f => ({ ...f, ownerId: e.target.value }))}
                >
                  {MOCK_EMPLOYEES.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div className="org-form-field">
                <label htmlFor="goal-status">Status</label>
                <select
                  id="goal-status"
                  value={goalForm.status}
                  onChange={e => setGoalForm(f => ({ ...f, status: e.target.value as any }))}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #cbd5e1' }}>
                <button type="button" className="org-btn org-btn--secondary" onClick={() => setIsCreatingGoal(false)}>Cancel</button>
                <button type="submit" className="org-btn org-btn--primary" disabled={!goalForm.name.trim()}>Create Milestone</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE SUB MILESTONE (formerly Milestone) DRAWER ── */}
      {isCreatingMilestone && (
        <div className="goals-drawer-backdrop" onClick={() => setIsCreatingMilestone(false)}>
          <div className="goals-drawer" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Add Sub Milestone</h3>
              <button
                type="button"
                onClick={() => setIsCreatingMilestone(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreateMilestone} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
              <div className="org-form-field">
                <label htmlFor="ms-name-form">Sub Milestone Name <span style={{ color: 'red' }}>*</span></label>
                <input
                  id="ms-name-form"
                  placeholder="e.g. Beta release"
                  value={milestoneForm.name}
                  onChange={e => setFormMs(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div className="org-form-field">
                <label htmlFor="ms-desc-form">Description</label>
                <textarea
                  id="ms-desc-form"
                  placeholder="Describe this sub milestone phase..."
                  rows={3}
                  value={milestoneForm.description}
                  onChange={e => setFormMs(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="org-form-field">
                <label htmlFor="ms-start-form">Start Date</label>
                <input
                  id="ms-start-form"
                  type="date"
                  value={milestoneForm.startDate}
                  onChange={e => setFormMs(f => ({ ...f, startDate: e.target.value }))}
                />
              </div>

              <div className="org-form-field">
                <label htmlFor="ms-due-form">Due Date <span style={{ color: 'red' }}>*</span></label>
                <input
                  id="ms-due-form"
                  type="date"
                  value={milestoneForm.dueDate}
                  onChange={e => setFormMs(f => ({ ...f, dueDate: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="org-form-field">
                  <label htmlFor="ms-owner-form">Owner</label>
                  <select
                    id="ms-owner-form"
                    value={milestoneForm.ownerId}
                    onChange={e => setFormMs(f => ({ ...f, ownerId: e.target.value }))}
                  >
                    {MOCK_EMPLOYEES.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div className="org-form-field">
                  <label htmlFor="ms-priority-form">Priority</label>
                  <select
                    id="ms-priority-form"
                    value={milestoneForm.priority}
                    onChange={e => setFormMs(f => ({ ...f, priority: e.target.value as any }))}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="org-form-field">
                <label htmlFor="ms-status-form">Status</label>
                <select
                  id="ms-status-form"
                  value={milestoneForm.status}
                  onChange={e => setFormMs(f => ({ ...f, status: e.target.value as any }))}
                >
                  <option value="upcoming">Not Started</option>
                  <option value="reached">In Progress</option>
                  <option value="missed">Missed</option>
                  <option value="Achieved">Achieved</option>
                </select>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #cbd5e1' }}>
                <button type="button" className="org-btn org-btn--secondary" onClick={() => setIsCreatingMilestone(false)}>Cancel</button>
                <button type="submit" className="org-btn org-btn--primary" disabled={!milestoneForm.name.trim() || !milestoneForm.dueDate}>Add Sub Milestone</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  function setFormMs(updater: (f: typeof milestoneForm) => typeof milestoneForm) {
    setMilestoneForm(updater);
  }
};
