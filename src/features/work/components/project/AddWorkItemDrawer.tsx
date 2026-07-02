import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Minimize2,
  Calendar,
  User,
  Flag,
  Paperclip,
  Bell,
  ChevronDown,
  Layers,
  CheckSquare,
  Clock,
  Link2,
  GitFork,
  Plus,
} from 'lucide-react';
import { useWork } from '../../context/work-context';
import {
  MOCK_EMPLOYEES,
  type TaskPriority,
  type TaskStatus,
  type WorkProject,
} from '../../workMockData';

interface Props {
  open: boolean;
  onClose: () => void;
  project: WorkProject;
  defaultStatus: TaskStatus;
  defaultAssigneeId: string;
  defaultDueDate?: string | null;
  defaultMilestoneId?: string | null;
  defaultParentTaskId?: string | null;
}

export const AddWorkItemDrawer: React.FC<Props> = ({
  open,
  onClose,
  project,
  defaultStatus,
  defaultAssigneeId,
  defaultDueDate,
  defaultMilestoneId,
  defaultParentTaskId,
}) => {
  const { addTask, projects, milestones, updateMilestone, tasks } = useWork();
  const [activeTab, setActiveTab] = useState<'task'>('task');
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

  // Custom Options & Fields
  const [showAddFieldsMenu, setShowAddFieldsMenu] = useState(false);
  const [enabledSections, setEnabledSections] = useState({
    timeEstimate: true,
    dependencies: false,
    subtasks: false,
    checklist: true,
  });
  const [dependencies, setDependencies] = useState<{
    blocks: string[];
    blockedBy: string[];
    relatesTo: string[];
  }>({
    blocks: [],
    blockedBy: [],
    relatesTo: [],
  });
  const [parentTaskId, setParentTaskId] = useState('');
  const [tempBlock, setTempBlock] = useState('');
  const [tempBlockedBy, setTempBlockedBy] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  
  const currentProject = projects.find(p => p.id === currentProjectId) || project;
  const projectTasks = tasks.filter(t => t.projectId === currentProjectId);

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
    allocatedHours: '',
    milestoneId: defaultMilestoneId ?? '',
  });

  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');

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
        allocatedHours: '',
        milestoneId: defaultMilestoneId ?? '',
      });
      setChecklistItems([]);
      setNewChecklistItem('');
      setCurrentProjectId(project.id);
      setAttachments([]);
      setCustomFields([]);
      setIsMinimized(false);
      setShowNewFieldInput(false);
      setNewFieldName('');
      setShowMoreSubmitOptions(false);

      // Reset toggles & custom fields
      setShowAddFieldsMenu(false);
      setEnabledSections({
        timeEstimate: true,
        dependencies: false,
        subtasks: false,
        checklist: true,
      });
      setDependencies({
        blocks: [],
        blockedBy: [],
        relatesTo: [],
      });
      setParentTaskId(defaultParentTaskId ?? '');
      setTempBlock('');
      setTempBlockedBy('');
    }
  }, [open, project, defaultStatus, defaultAssigneeId, defaultDueDate, defaultMilestoneId, defaultParentTaskId]);

  useEffect(() => {
    if (!showAddFieldsMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(e.target as Node)) {
        setShowAddFieldsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddFieldsMenu]);

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

  // Removed AI and templates handlers as requested

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
      allocatedHours: enabledSections.timeEstimate && form.allocatedHours ? Number(form.allocatedHours) : undefined,
      checklist: enabledSections.checklist && checklistItems.length > 0 ? [{ id: 'cl-1', name: 'Checklist', items: checklistItems.map((text, i) => ({ id: `cli-${Date.now()}-${i}`, text, done: false })) }] : [],
      parentTaskId: enabledSections.subtasks ? (parentTaskId || null) : (defaultParentTaskId ?? null),
      blocks: enabledSections.dependencies ? dependencies.blocks : [],
      blockedBy: enabledSections.dependencies ? dependencies.blockedBy : [],
      relatesTo: enabledSections.dependencies ? dependencies.relatesTo : [],
    });
    const targetMsId = form.milestoneId || defaultMilestoneId;
    if (targetMsId && newTask) {
      const ms = milestones.find(m => m.id === targetMsId);
      if (ms) {
        updateMilestone(targetMsId, {
          linkedWorkItemIds: [...ms.linkedWorkItemIds, newTask.id],
        });
      }
    }
    onClose();
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'Critical': return '#ef4444';
      case 'High': return '#f97316';
      case 'Medium': return '#eab308';
      default: return '#3b82f6';
    }
  };

  const handleDatePillClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const input = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement | null;
    if (input) {
      try {
        input.showPicker();
      } catch (err) {
        input.focus();
        input.click();
      }
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

          {/* Add Options Fields Selector */}
          <div 
            ref={optionsMenuRef}
            className="wi-dark-modal__pill-selector" 
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={() => setShowAddFieldsMenu(prev => !prev)}
          >
            <Plus size={13} />
            <span>Options</span>
            <ChevronDown size={11} />
            {showAddFieldsMenu && (
              <div 
                className="animate-scale-in"
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                  zIndex: 10001,
                  minWidth: '180px',
                  padding: '4px 0',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {[
                  { id: 'timeEstimate', label: 'Time Estimate', icon: <Clock size={14} /> },
                  { id: 'dependencies', label: 'Dependencies', icon: <Link2 size={14} /> },
                  { id: 'subtasks', label: 'Subtasks', icon: <GitFork size={14} /> },
                  { id: 'checklist', label: 'Checklist', icon: <CheckSquare size={14} /> },
                ].map(item => {
                  const isActive = enabledSections[item.id as keyof typeof enabledSections];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setEnabledSections(prev => ({
                          ...prev,
                          [item.id]: !prev[item.id as keyof typeof enabledSections]
                        }));
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        background: isActive ? '#f1f5f9' : 'transparent',
                        border: 'none',
                        fontSize: '13px',
                        fontFamily: 'Inter, sans-serif',
                        cursor: 'pointer',
                        color: '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={e => {
                        if (!isActive) e.currentTarget.style.background = '#f8fafc';
                      }}
                      onMouseLeave={e => {
                        if (!isActive) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: isActive ? '#1e4fbc' : '#64748b', display: 'inline-flex' }}>{item.icon}</span>
                        <span style={{ fontWeight: isActive ? 600 : 400, color: isActive ? '#0f172a' : '#334155' }}>{item.label}</span>
                      </span>
                      {isActive && <span style={{ fontSize: '11px', color: '#1e4fbc', fontWeight: 'bold' }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
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
            {/* AI button removed */}
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
            <div className="wi-attribute-pill wi-attribute-pill--date" onClick={handleDatePillClick}>
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

            {/* Due Date Pill (Hidden Native Date Input Trick) */}
            <div className="wi-attribute-pill wi-attribute-pill--date" onClick={handleDatePillClick}>
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

            {/* Allocated Hours Pill */}
            {enabledSections.timeEstimate && (
              <div className="wi-attribute-pill">
                <Clock size={12} />
                <input
                  type="number"
                  min={0}
                  placeholder="Hours"
                  value={form.allocatedHours}
                  onChange={e => setForm(f => ({ ...f, allocatedHours: e.target.value }))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'inherit',
                    width: '60px',
                    fontSize: 'inherit',
                  }}
                />
              </div>
            )}

            {/* Milestone Pill Select */}
            <div className="wi-attribute-pill">
              <Flag size={12} />
              <select
                value={form.milestoneId}
                onChange={e => setForm(f => ({ ...f, milestoneId: e.target.value }))}
                aria-label="Milestone select"
              >
                <option value="">No Milestone</option>
                {milestones.filter(m => m.projectId === currentProject.id).map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={10} />
            </div>
          </div>

          {/* Tags input removed */}

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

          {/* Checklist Creation Section */}
          {enabledSections.checklist && (
            <div className="wi-dark-modal__custom-fields" style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '12px', marginBottom: '12px' }}>
              <h4 className="wi-dark-modal__custom-fields-title" style={{ cursor: 'default' }}>
                Checklist ({checklistItems.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                {checklistItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', color: '#0f172a' }}>
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => setChecklistItems(prev => prev.filter((_, i) => i !== idx))}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', fontSize: '14px' }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <input
                    type="text"
                    placeholder="Add checklist item..."
                    value={newChecklistItem}
                    onChange={e => setNewChecklistItem(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newChecklistItem.trim()) {
                          setChecklistItems(prev => [...prev, newChecklistItem.trim()]);
                          setNewChecklistItem('');
                        }
                      }
                    }}
                    style={{ flex: 1, padding: '6px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newChecklistItem.trim()) {
                        setChecklistItems(prev => [...prev, newChecklistItem.trim()]);
                        setNewChecklistItem('');
                      }
                    }}
                    className="org-btn org-btn--secondary org-btn--sm"
                    style={{ padding: '6px 12px' }}
                  >
                    Add
                  </button>
                </div>
              </div>
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

          {/* Subtasks Section */}
          {enabledSections.subtasks && (
            <div className="wi-dark-modal__custom-fields" style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '12px', marginBottom: '12px' }}>
              <h4 className="wi-dark-modal__custom-fields-title" style={{ cursor: 'default' }}>
                Subtask Setting
              </h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '13px', color: '#475569', minWidth: '100px' }}>Parent Task:</span>
                <select
                  value={parentTaskId}
                  onChange={e => setParentTaskId(e.target.value)}
                  style={{ flex: 1, padding: '6px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff' }}
                >
                  <option value="">None (Create as independent task)</option>
                  {projectTasks.filter(t => !t.parentTaskId).map(t => (
                    <option key={t.id} value={t.id}>{t.key} — {t.title}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Dependencies Section */}
          {enabledSections.dependencies && (
            <div className="wi-dark-modal__custom-fields" style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '12px', marginBottom: '12px' }}>
              <h4 className="wi-dark-modal__custom-fields-title" style={{ cursor: 'default' }}>
                Dependencies
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                
                {/* Blocks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Blocks (This task blocks...)</span>
                  {dependencies.blocks.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                      {dependencies.blocks.map(k => (
                        <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                          {k}
                          <button type="button" onClick={() => setDependencies(prev => ({ ...prev, blocks: prev.blocks.filter(x => x !== k) }))} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold', padding: 0, marginLeft: '4px' }}>&times;</button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={tempBlock}
                      onChange={e => setTempBlock(e.target.value)}
                      style={{ flex: 1, padding: '6px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff' }}
                    >
                      <option value="">Select task...</option>
                      {projectTasks.filter(t => !dependencies.blocks.includes(t.key)).map(t => (
                        <option key={t.id} value={t.key}>{t.key} — {t.title}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (tempBlock) {
                          setDependencies(prev => ({ ...prev, blocks: [...prev.blocks, tempBlock] }));
                          setTempBlock('');
                        }
                      }}
                      className="org-btn org-btn--secondary org-btn--sm"
                      style={{ padding: '6px 12px' }}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Blocked By */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Blocked By (This task is blocked by...)</span>
                  {dependencies.blockedBy.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                      {dependencies.blockedBy.map(k => (
                        <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                          {k}
                          <button type="button" onClick={() => setDependencies(prev => ({ ...prev, blockedBy: prev.blockedBy.filter(x => x !== k) }))} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold', padding: 0, marginLeft: '4px' }}>&times;</button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={tempBlockedBy}
                      onChange={e => setTempBlockedBy(e.target.value)}
                      style={{ flex: 1, padding: '6px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff' }}
                    >
                      <option value="">Select task...</option>
                      {projectTasks.filter(t => !dependencies.blockedBy.includes(t.key)).map(t => (
                        <option key={t.id} value={t.key}>{t.key} — {t.title}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (tempBlockedBy) {
                          setDependencies(prev => ({ ...prev, blockedBy: [...prev.blockedBy, tempBlockedBy] }));
                          setTempBlockedBy('');
                        }
                      }}
                      className="org-btn org-btn--secondary org-btn--sm"
                      style={{ padding: '6px 12px' }}
                    >
                      Add
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <footer className="wi-dark-modal__footer" style={{ position: 'relative' }}>
          <div className="wi-dark-modal__footer-left">
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
                        allocatedHours: enabledSections.timeEstimate && form.allocatedHours ? Number(form.allocatedHours) : undefined,
                        checklist: enabledSections.checklist && checklistItems.length > 0 ? [{ id: 'cl-1', name: 'Checklist', items: checklistItems.map((text, i) => ({ id: `cli-${Date.now()}-${i}`, text, done: false })) }] : [],
                        parentTaskId: enabledSections.subtasks ? (parentTaskId || null) : (defaultParentTaskId ?? null),
                        blocks: enabledSections.dependencies ? dependencies.blocks : [],
                        blockedBy: enabledSections.dependencies ? dependencies.blockedBy : [],
                        relatesTo: enabledSections.dependencies ? dependencies.relatesTo : [],
                      });
                      if (defaultMilestoneId && newTask) {
                        const ms = milestones.find(m => m.id === defaultMilestoneId);
                        if (ms) {
                          updateMilestone(defaultMilestoneId, {
                            linkedWorkItemIds: [...ms.linkedWorkItemIds, newTask.id],
                          });
                        }
                      }
                      setForm(f => ({ ...f, title: '', description: '', labels: '', allocatedHours: '' }));
                      setChecklistItems([]);
                      setNewChecklistItem('');
                      setDependencies({ blocks: [], blockedBy: [], relatesTo: [] });
                      setParentTaskId(defaultParentTaskId ?? '');
                      setTempBlock('');
                      setTempBlockedBy('');
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
