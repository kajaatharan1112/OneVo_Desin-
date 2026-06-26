import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Minimize2,
  Calendar,
  User,
  Flag,
  Tag,
  Paperclip,
  Bell,
  Sparkles,
  ChevronDown,
  FileCode,
  Layers,
  CheckSquare,
} from 'lucide-react';
import { useWork } from '../../context/work-context';
import {
  MOCK_EMPLOYEES,
  type TaskPriority,
  type TaskStatus,
  type WorkProject,
  employeeName,
} from '../../workMockData';

interface Props {
  open: boolean;
  onClose: () => void;
  project: WorkProject;
  defaultStatus: TaskStatus;
  defaultAssigneeId: string;
  defaultDueDate?: string | null;
  defaultMilestoneId?: string | null;
}

export const AddWorkItemDrawer: React.FC<Props> = ({
  open,
  onClose,
  project,
  defaultStatus,
  defaultAssigneeId,
  defaultDueDate,
  defaultMilestoneId,
}) => {
  const { addTask, workspaces, projects, milestones, updateMilestone } = useWork();
  const [activeTab, setActiveTab] = useState<'task'>('task');
  const [showTagsInput, setShowTagsInput] = useState(false);
  const [showFields, setShowFields] = useState(false);

  const [currentProjectId, setCurrentProjectId] = useState(project.id);
  const [itemType, setItemType] = useState<'Task' | 'Bug' | 'Feature' | 'Improvement'>('Task');
  const [isMinimized, setIsMinimized] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [showNewFieldInput, setShowNewFieldInput] = useState(false);
  const [customFields, setCustomFields] = useState<Array<{ name: string, value: string }>>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [notifyOnCreate, setNotifyOnCreate] = useState(false);
  const [showMoreSubmitOptions, setShowMoreSubmitOptions] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentProject = projects.find(p => p.id === currentProjectId) || project;

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: defaultStatus,
    priority: currentProject.defaultPriority as TaskPriority,
    assigneeId: defaultAssigneeId,
    dueDate: defaultDueDate ?? '',
    startDate: '',
    endDate: '',
    linkedWorkspaceId: currentProject.workspaceIds[0] ?? '',
    labels: '',
  });

  useEffect(() => {
    if (open) {
      setForm({
        title: '',
        description: '',
        status: defaultStatus,
        priority: project.defaultPriority as TaskPriority,
        assigneeId: defaultAssigneeId,
        dueDate: defaultDueDate ?? '',
        startDate: '',
        endDate: '',
        linkedWorkspaceId: project.workspaceIds[0] ?? '',
        labels: '',
      });
      setCurrentProjectId(project.id);
      setAttachments([]);
      setCustomFields([]);
      setIsMinimized(false);
      setShowNewFieldInput(false);
      setNewFieldName('');
      setShowMoreSubmitOptions(false);
    }
  }, [open, project, defaultStatus, defaultAssigneeId, defaultDueDate]);

  const handleProjectChange = (projId: string) => {
    setCurrentProjectId(projId);
    const selectedProj = projects.find(p => p.id === projId);
    if (selectedProj) {
      setForm(f => ({
        ...f,
        linkedWorkspaceId: selectedProj.workspaceIds[0] ?? '',
        priority: (selectedProj.defaultPriority || 'Medium') as TaskPriority,
      }));
    }
  };

  const handleGenerateAI = () => {
    if (!form.title.trim()) {
      setForm(f => ({
        ...f,
        description: "Please enter a task title first so AI can draft a description.",
      }));
      return;
    }
    const templates = [
      `Here is a draft description for "${form.title}":\n\n### Objective\nBrief summary of the goals and expected outcomes.\n\n### Requirements\n- [ ] Requirement 1\n- [ ] Requirement 2\n\n### Implementation Details\nKey tech stack, files to change, or notes.`,
      `### Details for ${form.title}\n\n- **Goal**: Implement high-fidelity design updates.\n- **Scope**: Align components with clean code standards and verify functionality.\n- **Testing**: Run local regression test suite.`,
      `### Task Outline: ${form.title}\n\n1. Review the initial design specs.\n2. Develop components and style according to brand guidelines.\n3. Integrate mock context state API.\n4. Complete unit test assertions.`
    ];
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    setForm(f => ({
      ...f,
      description: randomTemplate,
    }));
  };

  const handleApplyTemplate = () => {
    setForm(f => ({
      ...f,
      title: 'Feature Implementation: Add New Dashboard Analytics',
      description: '### Objective\nAdd beautiful, dynamic graphs and user metrics tracking.\n\n### Tasks\n- [ ] Design analytics widgets\n- [ ] Fetch data from context provider\n- [ ] Handle error states and loading skeletons\n- [ ] Verify responsiveness',
      priority: 'High',
      labels: 'frontend, analytics',
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const names = Array.from(e.target.files).map(file => file.name);
      setAttachments(prev => [...prev, ...names]);
    }
  };

  const handleAddCustomField = () => {
    if (!newFieldName.trim()) return;
    setCustomFields(prev => [...prev, { name: newFieldName.trim(), value: '' }]);
    setNewFieldName('');
    setShowNewFieldInput(false);
  };

  if (!open) return null;

  if (isMinimized) {
    return (
      <div 
        className="wi-minimized-bar" 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          padding: '12px 18px',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontFamily: 'Outfit, Inter, sans-serif',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {form.title ? `Draft: ${form.title}` : 'Draft: New Task'}
        </span>
        <button 
          type="button" 
          onClick={() => setIsMinimized(false)}
          style={{ background: '#1e4fbc', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
        >
          Restore
        </button>
        <button 
          type="button" 
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Close draft"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    const newTask = addTask({
      projectId: currentProject.id,
      title: form.title.trim(),
      description: form.description,
      status: form.status,
      priority: form.priority,
      assigneeId: form.assigneeId,
      dueDate: form.dueDate || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      linkedWorkspaceId: currentProject.workspaceIds.length > 1 ? form.linkedWorkspaceId : null,
      labels: form.labels.split(',').map(l => l.trim()).filter(Boolean),
    });
    if (defaultMilestoneId && newTask) {
      const ms = milestones.find(m => m.id === defaultMilestoneId);
      if (ms) {
        updateMilestone(defaultMilestoneId, {
          linkedWorkItemIds: [...ms.linkedWorkItemIds, newTask.id],
        });
      }
    }
    onClose();
  };

  const getStatusLabel = (s: TaskStatus) => {
    switch (s) {
      case 'backlog': return 'Backlog';
      case 'todo': return 'To Do';
      case 'in_progress': return 'In Progress';
      case 'review': return 'Review';
      case 'done': return 'Done';
      default: return 'Status';
    }
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'Critical': return '#ef4444';
      case 'High': return '#f97316';
      case 'Medium': return '#eab308';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="wi-dark-modal-backdrop" onClick={onClose}>
      <div className="wi-dark-modal" role="dialog" aria-modal="true" aria-label="Add work item" onClick={e => e.stopPropagation()}>
        {/* Top Header Navigation Tabs */}
        <header className="wi-dark-modal__header">
          <nav className="wi-dark-modal__tabs">
            {(['task'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                className={`wi-dark-modal__tab-btn${activeTab === tab ? ' wi-dark-modal__tab-btn--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
          <div className="wi-dark-modal__controls">
            <button type="button" className="wi-dark-modal__ctrl-btn" onClick={() => setIsMinimized(true)} aria-label="Minimize">
              <Minimize2 size={14} />
            </button>
            <button type="button" className="wi-dark-modal__ctrl-btn" onClick={onClose} aria-label="Close">
              <X size={16} />
            </button>
          </div>
        </header>

        {/* Sub-header Dropdowns (List & Task selector mockup) */}
        <div className="wi-dark-modal__subheader">
          <div className="wi-dark-modal__pill-selector" style={{ position: 'relative' }}>
            <Layers size={13} />
            <select
              value={currentProjectId}
              onChange={e => handleProjectChange(e.target.value)}
              aria-label="List / Project select"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'inherit',
                paddingRight: '16px',
                cursor: 'pointer',
                fontSize: 'inherit',
                fontWeight: 'inherit',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none',
              }}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id} style={{ color: '#000000' }}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown size={11} style={{ position: 'absolute', right: '4px', pointerEvents: 'none' }} />
          </div>
          <div className="wi-dark-modal__pill-selector" style={{ position: 'relative' }}>
            <CheckSquare size={13} />
            <select
              value={itemType}
              onChange={e => setItemType(e.target.value as any)}
              aria-label="Issue type select"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'inherit',
                paddingRight: '16px',
                cursor: 'pointer',
                fontSize: 'inherit',
                fontWeight: 'inherit',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none',
              }}
            >
              <option value="Task" style={{ color: '#000000' }}>Task</option>
              <option value="Bug" style={{ color: '#000000' }}>Bug</option>
              <option value="Feature" style={{ color: '#000000' }}>Feature</option>
              <option value="Improvement" style={{ color: '#000000' }}>Improvement</option>
            </select>
            <ChevronDown size={11} style={{ position: 'absolute', right: '4px', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Modal Inputs Body */}
        <div className="wi-dark-modal__body">
          {/* Borderless Title */}
          <div className="wi-dark-modal__input-group">
            <input
              type="text"
              className="wi-dark-modal__title-input"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Task Name or type '/' for commands"
              autoFocus
            />
          </div>

          {/* Description with AI prompt chip mockup */}
          <div className="wi-dark-modal__desc-container">
            <textarea
              className="wi-dark-modal__desc-input"
              rows={4}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Add description, or write with AI"
            />
            <button type="button" className="wi-dark-modal__ai-chip" onClick={handleGenerateAI}>
              <Sparkles size={11} />
              <span>AI</span>
            </button>
          </div>

          {/* Interactive Attribute Pills Row */}
          <div className="wi-dark-modal__pills-row">
            {/* Status Pill Select */}
            <div className="wi-attribute-pill wi-attribute-pill--status">
              <span className="wi-attribute-pill__status-dot" />
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as TaskStatus }))}
                aria-label="Status select"
              >
                <option value="backlog">BACKLOG</option>
                <option value="todo">TO DO</option>
                <option value="in_progress">IN PROGRESS</option>
                <option value="review">REVIEW</option>
                <option value="done">DONE</option>
              </select>
              <ChevronDown size={10} />
            </div>

            {/* Assignee Pill Select */}
            <div className="wi-attribute-pill">
              <User size={12} />
              <select
                value={form.assigneeId}
                onChange={e => setForm(f => ({ ...f, assigneeId: e.target.value }))}
                aria-label="Assignee select"
              >
                {MOCK_EMPLOYEES.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name === 'Alexander Pierce' ? 'Alexander Pierce' : emp.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={10} />
            </div>

            {/* Start Date Pill */}
            <div className="wi-attribute-pill wi-attribute-pill--date">
              <Calendar size={12} />
              <span>{form.startDate ? `Start: ${form.startDate}` : 'Start date'}</span>
              <input
                type="date"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                title="Choose start date"
              />
              <ChevronDown size={10} />
            </div>

            {/* End Date Pill */}
            <div className="wi-attribute-pill wi-attribute-pill--date">
              <Calendar size={12} />
              <span>{form.endDate ? `End: ${form.endDate}` : 'End date'}</span>
              <input
                type="date"
                value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                title="Choose end date"
              />
              <ChevronDown size={10} />
            </div>

            {/* Due Date Pill (Hidden Native Date Input Trick) */}
            <div className="wi-attribute-pill wi-attribute-pill--date">
              <Calendar size={12} />
              <span>{form.dueDate ? `Due: ${form.dueDate}` : 'Due date'}</span>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                title="Choose due date"
              />
              <ChevronDown size={10} />
            </div>

            {/* Priority Pill Select */}
            <div className="wi-attribute-pill">
              <Flag size={12} style={{ color: getPriorityColor(form.priority) }} />
              <select
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value as TaskPriority }))}
                aria-label="Priority select"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
              <ChevronDown size={10} />
            </div>

            {/* Tags Pill Toggle */}
            <button
              type="button"
              className={`wi-attribute-pill${showTagsInput || form.labels ? ' wi-attribute-pill--active' : ''}`}
              onClick={() => setShowTagsInput(!showTagsInput)}
            >
              <Tag size={12} />
              <span>{form.labels ? 'Tags' : 'Tags'}</span>
              <ChevronDown size={10} />
            </button>

            {/* Workspace Pill (if multiple exist) */}
            {currentProject.workspaceIds.length > 1 && (
              <div className="wi-attribute-pill">
                <select
                  value={form.linkedWorkspaceId}
                  onChange={e => setForm(f => ({ ...f, linkedWorkspaceId: e.target.value }))}
                  aria-label="Workspace context select"
                >
                  {currentProject.workspaceIds.map(wsId => (
                    <option key={wsId} value={wsId}>
                      {workspaces.find(w => w.id === wsId)?.name ?? wsId}
                    </option>
                  ))}
                </select>
                <ChevronDown size={10} />
              </div>
            )}
          </div>

          {/* Tags/Labels Comma-separated TextInput (Toggled via pill click or if filled) */}
          {(showTagsInput || form.labels) && (
            <div className="wi-dark-modal__tags-input-wrap">
              <input
                type="text"
                className="wi-dark-modal__tags-text-input"
                placeholder="Type tags (comma-separated, e.g. frontend, design)"
                value={form.labels}
                onChange={e => setForm(f => ({ ...f, labels: e.target.value }))}
              />
            </div>
          )}

          {/* Attachments Display */}
          {attachments.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
              {attachments.map((name, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#e2e8f0', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#334155' }}>
                  <span>{name}</span>
                  <button 
                    type="button" 
                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, color: '#64748b' }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Custom Fields Section */}
          <div className="wi-dark-modal__custom-fields">
            <h4 className="wi-dark-modal__custom-fields-title" onClick={() => setShowFields(!showFields)}>
              Fields <ChevronDown size={12} className={showFields ? 'rotate-180' : ''} />
            </h4>
            {showFields && (
              <div className="wi-dark-modal__custom-fields-buttons animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {customFields.map((field, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569', minWidth: '100px' }}>{field.name}</span>
                    <input
                      type="text"
                      className="wi-dark-modal__tags-text-input"
                      value={field.value}
                      onChange={e => {
                        const val = e.target.value;
                        setCustomFields(prev => prev.map((f, i) => i === idx ? { ...f, value: val } : f));
                      }}
                      style={{ flex: 1, padding: '6px 10px', fontSize: '13px' }}
                    />
                  </div>
                ))}
                
                {showNewFieldInput ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                    <input
                      type="text"
                      placeholder="Field name (e.g. Estimate)"
                      value={newFieldName}
                      className="wi-dark-modal__tags-text-input"
                      onChange={e => setNewFieldName(e.target.value)}
                      style={{ padding: '6px 10px', fontSize: '13px', flex: 1 }}
                    />
                    <button 
                      type="button" 
                      onClick={handleAddCustomField}
                      style={{ background: '#1e4fbc', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Add
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowNewFieldInput(false)}
                      style={{ background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      type="button" 
                      className="wi-dark-modal__fields-btn"
                      onClick={() => {
                        setCustomFields([
                          { name: 'Estimate (hrs)', value: '4' },
                          { name: 'Department', value: 'Engineering' }
                        ]);
                      }}
                    >
                      Show custom fields
                    </button>
                    <button 
                      type="button" 
                      className="wi-dark-modal__fields-btn"
                      onClick={() => setShowNewFieldInput(true)}
                    >
                      + Create new field
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions Footer */}
        <footer className="wi-dark-modal__footer" style={{ position: 'relative' }}>
          <div className="wi-dark-modal__footer-left">
            <button type="button" className="wi-dark-modal__templates-btn" onClick={handleApplyTemplate}>
              <FileCode size={14} />
              <span>Templates</span>
            </button>
            <div className="wi-dark-modal__footer-icons">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                multiple
              />
              <button 
                type="button" 
                className="wi-dark-modal__footer-icon-btn" 
                title="Attach files"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={14} />
              </button>
              <button 
                type="button" 
                className="wi-dark-modal__footer-icon-btn" 
                title="Task notifications"
                onClick={() => setNotifyOnCreate(!notifyOnCreate)}
                style={{ color: notifyOnCreate ? '#1e4fbc' : '#64748b', background: notifyOnCreate ? '#eff6ff' : 'transparent' }}
              >
                <Bell size={14} />
              </button>
            </div>
          </div>
          <div className="wi-dark-modal__footer-right">
            <button type="button" className="wi-dark-modal__btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <div className="wi-dark-modal__btn-submit-split" style={{ position: 'relative' }}>
              <button
                type="button"
                className="wi-dark-modal__btn-submit"
                disabled={!form.title.trim()}
                onClick={handleSubmit}
              >
                Create Task
              </button>
              <button 
                type="button" 
                className="wi-dark-modal__btn-submit-chevron" 
                aria-label="More options"
                onClick={() => setShowMoreSubmitOptions(!showMoreSubmitOptions)}
              >
                <ChevronDown size={14} />
              </button>
              {showMoreSubmitOptions && (
                <div 
                  className="animate-scale-in"
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    right: 0,
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                    zIndex: 10001,
                    minWidth: '180px',
                    padding: '6px 0',
                  }}
                >
                  <button
                    type="button"
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 16px',
                      background: 'transparent',
                      border: 'none',
                      fontSize: '13px',
                      fontFamily: 'Inter, sans-serif',
                      cursor: 'pointer',
                      color: '#0f172a',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => {
                      if (!form.title.trim()) return;
                      const newTask = addTask({
                        projectId: currentProject.id,
                        title: form.title.trim(),
                        description: form.description,
                        status: form.status,
                        priority: form.priority,
                        assigneeId: form.assigneeId,
                        dueDate: form.dueDate || null,
                        startDate: form.startDate || null,
                        endDate: form.endDate || null,
                        linkedWorkspaceId: currentProject.workspaceIds.length > 1 ? form.linkedWorkspaceId : null,
                        labels: form.labels.split(',').map(l => l.trim()).filter(Boolean),
                      });
                      if (defaultMilestoneId && newTask) {
                        const ms = milestones.find(m => m.id === defaultMilestoneId);
                        if (ms) {
                          updateMilestone(defaultMilestoneId, {
                            linkedWorkItemIds: [...ms.linkedWorkItemIds, newTask.id],
                          });
                        }
                      }
                      setForm(f => ({ ...f, title: '', description: '', labels: '' }));
                      setAttachments([]);
                      setCustomFields([]);
                      setShowMoreSubmitOptions(false);
                    }}
                  >
                    Create & add another
                  </button>
                </div>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
