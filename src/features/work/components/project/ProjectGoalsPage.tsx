import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Clock,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import { useWork } from '../../context/work-context';
import {
  CURRENT_USER_ID,
  MOCK_EMPLOYEES,
  employeeName,
  formatWorkDate,
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
  const [activeTab, setActiveTab] = useState<'details' | 'settings'>('details');

  // Creation states
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [isCreatingMilestone, setIsCreatingMilestone] = useState(false);

  // Goal Form State
  const [goalForm, setGoalForm] = useState({
    name: '',
    description: '',
    durationMonths: 3,
    ownerId: CURRENT_USER_ID,
    status: 'active' as 'active' | 'completed' | 'on_hold',
  });

  // Milestone Form State
  const [milestoneForm, setMilestoneForm] = useState({
    name: '',
    description: '',
    startDate: '',
    dueDate: '',
    ownerId: CURRENT_USER_ID,
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
    status: 'upcoming' as MilestoneStatus,
  });

  // Checklist states
  const [newGoalChecklistItem, setNewGoalChecklistItem] = useState('');
  const [newMilestoneChecklistItems, setNewMilestoneChecklistItems] = useState<Record<string, string>>({});

  const projectGoals = useMemo(
    () => goals.filter(g => g.projectId === project.id),
    [goals, project.id]
  );

  const selectedGoal = useMemo(
    () => goals.find(g => g.id === selectedGoalId) || null,
    [goals, selectedGoalId]
  );

  const goalMilestones = useMemo(
    () => (selectedGoalId ? milestones.filter(m => m.projectId === project.id && m.goalId === selectedGoalId) : []),
    [milestones, project.id, selectedGoalId]
  );

  // Goal handlers
  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.name.trim()) return;

    const newG: ProjectGoal = {
      id: `goal-${Date.now()}`,
      name: goalForm.name.trim(),
      description: goalForm.description.trim(),
      projectId: project.id,
      durationMonths: Number(goalForm.durationMonths),
      ownerId: goalForm.ownerId,
      status: goalForm.status,
      checklist: [],
    };

    addGoal(newG);
    setGoalForm({
      name: '',
      description: '',
      durationMonths: 3,
      ownerId: CURRENT_USER_ID,
      status: 'active',
    });
    setIsCreatingGoal(false);
  };

  const handleUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    updateGoal(selectedGoal.id, selectedGoal);
    setActiveTab('details');
  };

  const handleDeleteGoal = (id: string) => {
    if (window.confirm('Are you sure you want to delete this Goal?')) {
      deleteGoal(id);
      setSelectedGoalId(null);
    }
  };

  // Milestone handlers
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

  // Goal Checklist Handlers
  const addGoalChecklistItem = (goalId: string) => {
    if (!newGoalChecklistItem.trim()) return;
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newItem = {
      id: `gc-${Date.now()}`,
      text: newGoalChecklistItem.trim(),
      done: false,
    };

    updateGoal(goalId, {
      checklist: [...goal.checklist, newItem],
    });
    setNewGoalChecklistItem('');
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

  // Milestone Checklist Handlers
  const addMilestoneChecklistItem = (milestoneId: string) => {
    const text = newMilestoneChecklistItems[milestoneId];
    if (!text || !text.trim()) return;
    const ms = milestones.find(m => m.id === milestoneId);
    if (!ms) return;

    const newItem = {
      id: `msc-${Date.now()}`,
      text: text.trim(),
      done: false,
    };

    const currentChecklist = ms.checklist || [];
    updateMilestone(milestoneId, {
      checklist: [...currentChecklist, newItem],
    });

    setNewMilestoneChecklistItems(prev => ({ ...prev, [milestoneId]: '' }));
  };

  const toggleMilestoneChecklistItem = (milestoneId: string, itemId: string) => {
    const ms = milestones.find(m => m.id === milestoneId);
    if (!ms || !ms.checklist) return;

    const updatedChecklist = ms.checklist.map(item =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );

    updateMilestone(milestoneId, { checklist: updatedChecklist });
  };

  const deleteMilestoneChecklistItem = (milestoneId: string, itemId: string) => {
    const ms = milestones.find(m => m.id === milestoneId);
    if (!ms || !ms.checklist) return;

    updateMilestone(milestoneId, {
      checklist: ms.checklist.filter(item => item.id !== itemId),
    });
  };

  const getMilestoneTasks = (msId: string) => {
    return tasks.filter(t => t.projectId === project.id && milestones.find(m => m.id === msId)?.linkedWorkItemIds.includes(t.id));
  };

  return (
    <div className="work-goals-page" style={{ padding: '24px 20px', fontFamily: 'Outfit, Inter, sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .goal-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
          margin-top: 16px;
        }
        .goal-card {
          background: var(--surface-card, #ffffff);
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
          transition: all 0.2s ease-in-out;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .goal-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
          border-color: var(--accent);
        }
        .goal-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
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
          flex: 1;
        }
        .goal-card-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: var(--text-s, #64748b);
          border-top: 1px solid var(--border, #cbd5e1);
          padding-top: 12px;
          margin-top: 4px;
        }
        .goal-card-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
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
        
        /* Goal detailed view styles */
        .goal-details-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .goal-details-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .goal-details-tabs {
          display: flex;
          gap: 4px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 20px;
        }
        .goal-details-tab-btn {
          background: none;
          border: none;
          padding: 8px 16px;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-m);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.15s;
        }
        .goal-details-tab-btn--active {
          color: var(--accent);
          border-bottom-color: var(--accent);
        }
        
        .milestone-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 24px 0 16px;
        }
        
        /* Milestone Card for Goals */
        .goal-ms-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
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

      {!selectedGoalId ? (
        /* ── LIST VIEW ── */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-h)' }}>Project Goals</h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-m)' }}>
                Establish core project objectives and trace phase-wise progress.
              </p>
            </div>
            <button
              type="button"
              className="org-btn org-btn--primary org-btn--sm"
              onClick={() => setIsCreatingGoal(true)}
            >
              <Plus size={14} /> Create Goal
            </button>
          </div>

          {projectGoals.length === 0 ? (
            <div className="cfg-empty" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '40px', textAlign: 'center' }}>
              <p className="cfg-empty__title" style={{ fontSize: '15px', fontWeight: 600, color: '#334155', margin: 0 }}>No goals defined yet</p>
              <p className="cfg-empty__desc" style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Add high-level project goals to align your milestones and checklists.</p>
              <button
                type="button"
                className="org-btn org-btn--secondary org-btn--sm"
                onClick={() => setIsCreatingGoal(true)}
                style={{ marginTop: '16px' }}
              >
                + Define First Goal
              </button>
            </div>
          ) : (
            <div className="goal-grid">
              {projectGoals.map(goal => {
                const goalMilestonesCount = milestones.filter(m => m.projectId === project.id && m.goalId === goal.id).length;
                const completedChecklist = goal.checklist.filter(item => item.done).length;
                const totalChecklist = goal.checklist.length;
                const progressPercent = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

                return (
                  <div
                    key={goal.id}
                    className="goal-card"
                    onClick={() => { setSelectedGoalId(goal.id); setActiveTab('details'); }}
                  >
                    <div className="goal-card-header">
                      <h3 className="goal-card-title">{goal.name}</h3>
                      <span className={`goal-badge goal-badge--${goal.status}`}>
                        {goal.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="goal-card-desc">{goal.description || 'No objective description provided.'}</p>

                    {totalChecklist > 0 && (
                      <div style={{ marginTop: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--text-s)', marginBottom: '4px' }}>
                          <span>Checklist ({completedChecklist}/{totalChecklist})</span>
                          <span>{progressPercent}%</span>
                        </div>
                        <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: 'var(--accent)', width: `${progressPercent}%` }} />
                        </div>
                      </div>
                    )}

                    <div className="goal-card-meta">
                      <div className="goal-card-meta-item">
                        <Clock size={12} />
                        <span>{goal.durationMonths} Months</span>
                      </div>
                      <div className="goal-card-meta-item">
                        <User size={12} />
                        <span>{employeeName(goal.ownerId)}</span>
                      </div>
                      <div className="goal-card-meta-item" style={{ marginLeft: 'auto' }}>
                        <span>{goalMilestonesCount} Milestones</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ── DETAILED GOAL VIEW ── */
        <div>
          <div className="goal-details-header">
            <button
              type="button"
              className="org-btn org-btn--secondary org-btn--sm"
              onClick={() => setSelectedGoalId(null)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={14} /> Back to Goals
            </button>
          </div>

          {selectedGoal && (
            <div>
              <div className="goal-details-title-row">
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>{selectedGoal.name}</h2>
                  <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#475569' }}>
                    {selectedGoal.description || 'No objective description.'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className={`goal-badge goal-badge--${selectedGoal.status}`}>
                    {selectedGoal.status.replace('_', ' ')}
                  </span>
                  <button
                    type="button"
                    className="org-btn org-btn--secondary org-btn--sm"
                    onClick={() => handleDeleteGoal(selectedGoal.id)}
                    style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}
                  >
                    <Trash2 size={13} /> Delete Goal
                  </button>
                </div>
              </div>

              <div className="goal-details-tabs" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className={`goal-details-tab-btn${activeTab === 'details' ? ' goal-details-tab-btn--active' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  Goal Details & Milestones
                </button>
                <button
                  type="button"
                  className={`goal-details-tab-btn${activeTab === 'settings' ? ' goal-details-tab-btn--active' : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  Goal Settings
                </button>
              </div>

              {activeTab === 'details' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '16px' }}>
                  {/* Left Column: Milestones */}
                  <div>
                    <div className="milestone-section-header">
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Milestones under this Goal</h3>
                      <button
                        type="button"
                        className="org-btn org-btn--primary org-btn--sm"
                        onClick={() => setIsCreatingMilestone(true)}
                      >
                        <Plus size={13} /> Add Milestone
                      </button>
                    </div>

                    {goalMilestones.length === 0 ? (
                      <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>No milestones created under this goal yet.</p>
                      </div>
                    ) : (
                      goalMilestones.map(ms => {
                        const msTasks = getMilestoneTasks(ms.id);
                        const doneTasks = msTasks.filter(t => t.status === 'done').length;
                        const msChecklist = ms.checklist || [];
                        const completedMsChecklist = msChecklist.filter(c => c.done).length;
                        const totalMsChecklist = msChecklist.length;

                        return (
                          <div key={ms.id} className="goal-ms-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>{ms.name}</h4>
                                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>{ms.description}</p>
                              </div>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <span className={`cfg-badge cfg-badge--${priorityBadgeClass(ms.priority || 'Medium')}`}>
                                  {ms.priority || 'Medium'}
                                </span>
                                <span className={`cfg-badge cfg-badge--open`}>
                                  Due {formatWorkDate(ms.dueDate)}
                                </span>
                                <button
                                  type="button"
                                  className="cfg-action-btn"
                                  style={{ padding: '2px 4px', background: 'transparent' }}
                                  onClick={() => {
                                    if (window.confirm('Delete this milestone?')) {
                                      deleteMilestone(ms.id);
                                    }
                                  }}
                                >
                                  <Trash2 size={13} style={{ color: '#b91c1c' }} />
                                </button>
                              </div>
                            </div>

                            {/* Milestone Tasks list */}
                            {msTasks.length > 0 && (
                              <div style={{ background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '10px 12px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Linked Work Items ({doneTasks}/{msTasks.length}):</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {msTasks.map(task => (
                                    <div
                                      key={task.id}
                                      onClick={() => openTaskDetail(task.id)}
                                      style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline', padding: '2px 0' }}
                                    >
                                      <span>{task.key}: {task.title}</span>
                                      <span style={{ textDecoration: 'none', color: '#475569', fontSize: '11px' }}>{task.status.toUpperCase()}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Milestone checklist: "Add the checklist" */}
                            <div style={{ marginTop: '6px', borderTop: '1px dashed #e2e8f0', paddingTop: '10px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Milestone Checklist ({completedMsChecklist}/{totalMsChecklist})</span>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                                {msChecklist.map(item => (
                                  <div key={item.id} className="checklist-item-row" style={{ padding: '3px 0', borderBottom: 'none' }}>
                                    <label className="checklist-item-label" onClick={() => toggleMilestoneChecklistItem(ms.id, item.id)}>
                                      <input type="checkbox" checked={item.done} readOnly />
                                      <span className={item.done ? 'checklist-item-text--done' : ''}>{item.text}</span>
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => deleteMilestoneChecklistItem(ms.id, item.id)}
                                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <input
                                  type="text"
                                  placeholder="Add milestone checklist item..."
                                  value={newMilestoneChecklistItems[ms.id] || ''}
                                  onChange={e => setNewMilestoneChecklistItems(prev => ({ ...prev, [ms.id]: e.target.value }))}
                                  onKeyDown={e => { if (e.key === 'Enter') addMilestoneChecklistItem(ms.id); }}
                                  style={{ flex: 1, padding: '4px 8px', fontSize: '12.5px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => addMilestoneChecklistItem(ms.id)}
                                  className="org-btn org-btn--secondary org-btn--sm"
                                  style={{ padding: '4px 8px' }}
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Right Column: Goal Checklist */}
                  <div>
                    <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Goal Checklist</h3>
                    
                    <div className="goal-checklist-wrap">
                      {selectedGoal.checklist.length === 0 ? (
                        <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', textAlign: 'center' }}>No checklist items added.</p>
                      ) : (
                        selectedGoal.checklist.map(item => (
                          <div key={item.id} className="checklist-item-row">
                            <label className="checklist-item-label" onClick={() => toggleGoalChecklistItem(selectedGoal.id, item.id)}>
                              <input type="checkbox" checked={item.done} readOnly />
                              <span className={item.done ? 'checklist-item-text--done' : ''}>{item.text}</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => deleteGoalChecklistItem(selectedGoal.id, item.id)}
                              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))
                      )}

                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <input
                          type="text"
                          placeholder="New checklist item..."
                          value={newGoalChecklistItem}
                          onChange={e => setNewGoalChecklistItem(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') addGoalChecklistItem(selectedGoal.id); }}
                          style={{ flex: 1, padding: '6px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                        <button
                          type="button"
                          onClick={() => addGoalChecklistItem(selectedGoal.id)}
                          className="org-btn org-btn--secondary org-btn--sm"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div style={{ marginTop: '20px', background: '#eff6ff', padding: '16px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                      <h4 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>Goal Parameters</h4>
                      <div style={{ fontSize: '12px', color: '#1e3a8a', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div>Duration: <strong>{selectedGoal.durationMonths} Months</strong></div>
                        <div>Owner: <strong>{employeeName(selectedGoal.ownerId)}</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── GOAL SETTINGS TAB ── */
                <form
                  onSubmit={handleUpdateGoal}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '24px',
                    maxWidth: '600px',
                    marginTop: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Goal Settings</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Update parameters for this project objective.</p>

                  <div className="org-form-field">
                    <label htmlFor="settings-name">Goal Name</label>
                    <input
                      id="settings-name"
                      value={selectedGoal.name}
                      onChange={e => {
                        const val = e.target.value;
                        updateGoal(selectedGoal.id, { name: val });
                      }}
                      required
                    />
                  </div>

                  <div className="org-form-field">
                    <label htmlFor="settings-desc">Description</label>
                    <textarea
                      id="settings-desc"
                      rows={3}
                      value={selectedGoal.description}
                      onChange={e => {
                        const val = e.target.value;
                        updateGoal(selectedGoal.id, { description: val });
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="org-form-field">
                      <label htmlFor="settings-duration">Duration (Months)</label>
                      <input
                        id="settings-duration"
                        type="number"
                        min={1}
                        value={selectedGoal.durationMonths}
                        onChange={e => {
                          const val = Number(e.target.value);
                          updateGoal(selectedGoal.id, { durationMonths: val });
                        }}
                        required
                      />
                    </div>
                    <div className="org-form-field">
                      <label htmlFor="settings-owner">Owner</label>
                      <select
                        id="settings-owner"
                        value={selectedGoal.ownerId}
                        onChange={e => {
                          const val = e.target.value;
                          updateGoal(selectedGoal.id, { ownerId: val });
                        }}
                      >
                        {MOCK_EMPLOYEES.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="org-form-field">
                    <label htmlFor="settings-status">Status</label>
                    <select
                      id="settings-status"
                      value={selectedGoal.status}
                      onChange={e => {
                        const val = e.target.value as any;
                        updateGoal(selectedGoal.id, { status: val });
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <button
                      type="submit"
                      className="org-btn org-btn--primary"
                    >
                      Save Settings
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── CREATE GOAL DRAWER ── */}
      {isCreatingGoal && (
        <div className="goals-drawer-backdrop" onClick={() => setIsCreatingGoal(false)}>
          <div className="goals-drawer" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Create Goal</h3>
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
                <label htmlFor="goal-name">Goal Name <span style={{ color: 'red' }}>*</span></label>
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
                  placeholder="What is the objective of this project goal?"
                  rows={4}
                  value={goalForm.description}
                  onChange={e => setGoalForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="org-form-field">
                <label htmlFor="goal-duration">Duration (Months)</label>
                <input
                  id="goal-duration"
                  type="number"
                  min={1}
                  value={goalForm.durationMonths}
                  onChange={e => setGoalForm(f => ({ ...f, durationMonths: Number(e.target.value) }))}
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
                <button type="submit" className="org-btn org-btn--primary" disabled={!goalForm.name.trim()}>Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE MILESTONE DRAWER ── */}
      {isCreatingMilestone && (
        <div className="goals-drawer-backdrop" onClick={() => setIsCreatingMilestone(false)}>
          <div className="goals-drawer" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Add Milestone under Goal</h3>
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
                <label htmlFor="ms-name-form">Milestone Name <span style={{ color: 'red' }}>*</span></label>
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
                  placeholder="Describe this milestone phase..."
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
                <button type="submit" className="org-btn org-btn--primary" disabled={!milestoneForm.name.trim() || !milestoneForm.dueDate}>Add Milestone</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Helper function to update milestone form state safely
  function setFormMs(updater: (f: typeof milestoneForm) => typeof milestoneForm) {
    setMilestoneForm(updater);
  }
};
