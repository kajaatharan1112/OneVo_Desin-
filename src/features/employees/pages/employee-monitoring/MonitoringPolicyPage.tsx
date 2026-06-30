import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldAlert, Plus, Edit, Trash2, X } from 'lucide-react';
import { SettingsPageHeader } from '../../../settings/components/SettingsPageHeader';
import { useMonitoringStore } from './monitoringStore';
import { useEmployeeContext } from '../../context/employee-context';
import { useOrganizationStore } from '../../../../store/organizationStore';
import { LeaveScopeMultiSelect } from '../../../leave/configuration/LeaveScopeMultiSelect';
import './employee-monitoring.css';

interface MonitoringPolicyPageProps {
  onBack?: () => void;
}

interface MonitoringExemption {
  id: string;
  name: string;
  scope: string; // e.g. "Chief Executive Officer", "Design Department"
  exemptFrom: string[]; // e.g. ["Screen Capture", "Webcam photo capture", "Activity tracking"]
  requirementType: 'required' | 'not_required';
  timingType: 'permanent' | 'custom';
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  period: string; // e.g. "Permanent", "Temporary (Until 2026-12-31)"
  status: 'active' | 'inactive';
}

export const MonitoringPolicyPage: React.FC<MonitoringPolicyPageProps> = ({ onBack }) => {
  const store = useMonitoringStore();
  const { selectedEmployee } = useEmployeeContext();
  const isManagerOrCeo = selectedEmployee.role === 'Chief Executive Officer' || selectedEmployee.role === 'Manager';

  // Modal / Editing states
  const [editingPolicy, setEditingPolicy] = useState<'activity' | 'idle' | 'screenshot' | 'webcam' | null>(null);
  const [editingExemption, setEditingExemption] = useState<MonitoringExemption | null>(null);
  const [isAddExemptionOpen, setIsAddExemptionOpen] = useState(false);

  // Form states for modals
  const [activityForm, setActivityForm] = useState({ ...store.activityPolicy });
  const [idleForm, setIdleForm] = useState({ ...store.idlePolicy });
  const [screenshotForm, setScreenshotForm] = useState({ ...store.screenshotPolicy });
  const [webcamForm, setWebcamForm] = useState({ ...store.webcamPolicy });

  // Exemptions state (simulated since it's a new request)
  const [exemptions, setExemptions] = useState<MonitoringExemption[]>([
    {
      id: 'ex-1',
      name: 'CEO Privacy Exemption',
      scope: 'Chief Executive Officer',
      exemptFrom: ['Screen Capture', 'Webcam Verification', 'Activity Tracking'],
      requirementType: 'not_required',
      timingType: 'permanent',
      period: 'Permanent Exemption',
      status: 'active',
    },
    {
      id: 'ex-2',
      name: 'Design Team Creative Work',
      scope: 'Design Team',
      exemptFrom: ['Webcam Verification'],
      requirementType: 'not_required',
      timingType: 'custom',
      startDate: '2026-06-28',
      startTime: '09:00',
      endDate: '2026-12-31',
      endTime: '18:00',
      period: 'Exempt: 2026-06-28 09:00 - 2026-12-31 18:00',
      status: 'active',
    }
  ]);

  // Exemption Form State
  const [exemptionForm, setExemptionForm] = useState<Omit<MonitoringExemption, 'id'>>({
    name: '',
    scope: 'Chief Executive Officer',
    exemptFrom: [],
    requirementType: 'not_required',
    timingType: 'permanent',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    period: 'Permanent Exemption',
    status: 'active'
  });

  // Toast state
  const [toast, setToast] = useState<string | null>(null);
  
  // Validation error state
  const [error, setError] = useState<string | null>(null);

  // Clear error state on modal changes
  useEffect(() => {
    setError(null);
  }, [editingPolicy, isAddExemptionOpen, editingExemption]);

  const { employees, departments, positions } = useOrganizationStore();
  const [currentScope, setCurrentScope] = useState<'employee' | 'department' | 'position'>('department');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([]);
  const [selectedPositionIds, setSelectedPositionIds] = useState<string[]>([]);

  const initializeScope = (applyToStr: string) => {
    if (!applyToStr || applyToStr === 'All Employees') {
      setCurrentScope('department');
      setSelectedEmployeeIds([]);
      setSelectedDepartmentIds([]);
      setSelectedPositionIds([]);
      return;
    }

    // Check if it matches department names
    const deptMatches = departments.filter(d => applyToStr.includes(d.name)).map(d => d.id);
    if (deptMatches.length > 0) {
      setCurrentScope('department');
      setSelectedDepartmentIds(deptMatches);
      setSelectedEmployeeIds([]);
      setSelectedPositionIds([]);
      return;
    }

    // Check if it matches position names
    const posMatches = positions.filter(p => applyToStr.includes(p.name)).map(p => p.id);
    if (posMatches.length > 0) {
      setCurrentScope('position');
      setSelectedPositionIds(posMatches);
      setSelectedEmployeeIds([]);
      setSelectedDepartmentIds([]);
      return;
    }

    // Check if it matches employee names
    const empMatches = employees
      .filter(e => applyToStr.includes(`${e.firstName} ${e.lastName}`))
      .map(e => e.id);
    if (empMatches.length > 0) {
      setCurrentScope('employee');
      setSelectedEmployeeIds(empMatches);
      setSelectedDepartmentIds([]);
      setSelectedPositionIds([]);
      return;
    }

    // Default
    setCurrentScope('department');
    setSelectedEmployeeIds([]);
    setSelectedDepartmentIds([]);
    setSelectedPositionIds([]);
  };

  const getCompiledScopeString = () => {
    if (currentScope === 'employee') {
      if (selectedEmployeeIds.length === 0) return 'All Employees';
      return selectedEmployeeIds
        .map(id => {
          const emp = employees.find(e => e.id === id);
          return emp ? `${emp.firstName} ${emp.lastName}` : '';
        })
        .filter(Boolean)
        .join(', ');
    }
    if (currentScope === 'department') {
      if (selectedDepartmentIds.length === 0) return 'All Employees';
      return selectedDepartmentIds
        .map(id => departments.find(d => d.id === id)?.name)
        .filter(Boolean)
        .join(', ');
    }
    if (currentScope === 'position') {
      if (selectedPositionIds.length === 0) return 'All Employees';
      return selectedPositionIds
        .map(id => positions.find(p => p.id === id)?.name)
        .filter(Boolean)
        .join(', ');
    }
    return 'All Employees';
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const validateScopeSelection = (): boolean => {
    if (currentScope === 'employee' && selectedEmployeeIds.length === 0) {
      setError('Please select at least one employee.');
      return false;
    }
    if (currentScope === 'department' && selectedDepartmentIds.length === 0) {
      setError('Please select at least one department.');
      return false;
    }
    if (currentScope === 'position' && selectedPositionIds.length === 0) {
      setError('Please select at least one position.');
      return false;
    }
    return true;
  };

  // Save Handlers for Policies
  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateScopeSelection()) return;
    if (!activityForm.trackingInterval || activityForm.trackingInterval <= 0) {
      setError('Tracking Interval must be a positive number.');
      return;
    }
    if (!activityForm.effectiveDate) {
      setError('Effective Date is required.');
      return;
    }
    setError(null);
    store.updateActivityPolicy({
      ...activityForm,
      applyTo: getCompiledScopeString()
    });
    setEditingPolicy(null);
    setToast('Activity Tracking Policy updated successfully.');
  };

  const handleSaveIdle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateScopeSelection()) return;
    if (!idleForm.idleThreshold || idleForm.idleThreshold <= 0) {
      setError('Normal Idle Duration must be a positive number.');
      return;
    }
    if (!idleForm.criticalThreshold || idleForm.criticalThreshold <= 0) {
      setError('Critical Idle Duration must be a positive number.');
      return;
    }
    if (idleForm.criticalThreshold <= idleForm.idleThreshold) {
      setError('Critical Idle Duration must be greater than Normal Idle Duration.');
      return;
    }
    setError(null);
    store.updateIdlePolicy({
      ...idleForm,
      applyTo: getCompiledScopeString()
    });
    setEditingPolicy(null);
    setToast('Idle Time Policy updated successfully.');
  };

  const handleSaveScreenshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateScopeSelection()) return;
    if (!screenshotForm.retention || !screenshotForm.retention.trim()) {
      setError('Storage Retention Window is required.');
      return;
    }
    setError(null);
    store.updateScreenshotPolicy({
      ...screenshotForm,
      applyTo: getCompiledScopeString()
    });
    setEditingPolicy(null);
    setToast('Screenshot Policy updated successfully.');
  };

  const handleSaveWebcam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateScopeSelection()) return;
    if (webcamForm.enabled) {
      if (!webcamForm.idleThreshold || webcamForm.idleThreshold <= 0) {
        setError('Idle Threshold Trigger must be a positive number.');
        return;
      }
      if (!webcamForm.notificationDuration || webcamForm.notificationDuration <= 0) {
        setError('Notification Consent Duration must be a positive number.');
        return;
      }
      if (!webcamForm.retention || !webcamForm.retention.trim()) {
        setError('Webcam Photo Retention Window is required.');
        return;
      }
    }
    setError(null);
    store.updateWebcamPolicy({
      ...webcamForm,
      applyTo: getCompiledScopeString()
    });
    setEditingPolicy(null);
    setToast('Webcam Policy updated successfully.');
  };

  // Exemption Handlers
  const computeExemptionPeriod = (ex: any) => {
    if (ex.timingType === 'permanent') {
      return ex.requirementType === 'required' ? 'Permanent Enforced' : 'Permanent Exemption';
    }
    const startStr = `${ex.startDate || ''} ${ex.startTime || ''}`.trim() || 'N/A';
    const endStr = `${ex.endDate || ''} ${ex.endTime || ''}`.trim() || 'N/A';
    return `${ex.requirementType === 'required' ? 'Enforced' : 'Exempt'}: ${startStr} to ${endStr}`;
  };

  const handleAddExemption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateScopeSelection()) return;
    if (!exemptionForm.name.trim()) {
      setError('Rule Name is required.');
      return;
    }
    if (exemptionForm.exemptFrom.length === 0) {
      setError('Please select at least one feature.');
      return;
    }
    if (exemptionForm.timingType === 'custom') {
      if (!exemptionForm.startDate || !exemptionForm.endDate) {
        setError('Start date and End date are required for custom period.');
        return;
      }
    }
    setError(null);
    const calculatedPeriod = computeExemptionPeriod(exemptionForm);
    const newEx = {
      ...exemptionForm,
      period: calculatedPeriod,
      scope: getCompiledScopeString(),
      id: `ex-${Date.now()}`
    };
    setExemptions([...exemptions, newEx]);
    setIsAddExemptionOpen(false);
    resetExemptionForm();
    setToast('Monitoring rule added successfully.');
  };

  const handleSaveExemptionEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExemption) return;
    if (!validateScopeSelection()) return;
    if (!editingExemption.name.trim()) {
      setError('Rule Name is required.');
      return;
    }
    if (editingExemption.exemptFrom.length === 0) {
      setError('Please select at least one feature.');
      return;
    }
    if (editingExemption.timingType === 'custom') {
      if (!editingExemption.startDate || !editingExemption.endDate) {
        setError('Start date and End date are required for custom period.');
        return;
      }
    }
    setError(null);
    const calculatedPeriod = computeExemptionPeriod(editingExemption);
    const updatedEx = {
      ...editingExemption,
      period: calculatedPeriod,
      scope: getCompiledScopeString()
    };
    setExemptions(exemptions.map(ex => ex.id === editingExemption.id ? updatedEx : ex));
    setEditingExemption(null);
    setToast('Monitoring rule updated successfully.');
  };

  const handleDeleteExemption = (id: string) => {
    setExemptions(exemptions.filter(ex => ex.id !== id));
    setToast('Monitoring rule removed successfully.');
  };

  const resetExemptionForm = () => {
    setExemptionForm({
      name: '',
      scope: 'Chief Executive Officer',
      exemptFrom: [],
      requirementType: 'not_required',
      timingType: 'permanent',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      period: 'Permanent Exemption',
      status: 'active'
    });
  };

  const handleCheckboxChange = (feature: string, isChecked: boolean, isEdit: boolean) => {
    if (isEdit && editingExemption) {
      const current = editingExemption.exemptFrom;
      const updated = isChecked ? [...current, feature] : current.filter(f => f !== feature);
      setEditingExemption({ ...editingExemption, exemptFrom: updated });
    } else {
      const current = exemptionForm.exemptFrom;
      const updated = isChecked ? [...current, feature] : current.filter(f => f !== feature);
      setExemptionForm({ ...exemptionForm, exemptFrom: updated });
    }
  };

  return (
    <div className="cfg-page cip-page">
      {toast && (
        <div className="schedules-cfg-toast" role="status">
          {toast}
          <button type="button" onClick={() => setToast(null)} aria-label="Dismiss">×</button>
        </div>
      )}

      <SettingsPageHeader
        title="Monitoring Policy"
        description="Configure automated workspace tracking, application restrictions, and presence compliance."
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {onBack && (
              <button 
                type="button" 
                className="org-btn org-btn--secondary" 
                onClick={onBack} 
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}
          </div>
        }
      />

      <div className="cip-body">
        {/* Core Monitoring Policies List */}
        <section className="cip-section">
          <h2 className="cip-section__title">Workplace Monitoring Policies</h2>
          <div className="cip-policy-list">
            
            {/* 1. Activity Tracking Policy Row */}
            <div className="cip-policy-row">
              <div className="cip-policy-row__main">
                <div className="cip-policy-row__title">
                  {store.activityPolicy.name}
                </div>
                <div className="cip-policy-row__desc">{store.activityPolicy.description}</div>
                <div style={{ marginTop: '6px', fontSize: '0.7rem', color: 'var(--nexus-text-muted)' }}>
                  Applies to: {store.activityPolicy.applyTo} | Effective: {store.activityPolicy.effectiveDate}
                </div>
              </div>
              <div className="cip-policy-row__chips">
                <span className="cip-chip cip-chip--on">
                  <span className="cip-chip__label">Keyboard:</span>
                  <span className="cip-chip__state">{store.activityPolicy.trackKeyboard ? 'enabled' : 'disabled'}</span>
                </span>
                <span className="cip-chip cip-chip--on">
                  <span className="cip-chip__label">Mouse:</span>
                  <span className="cip-chip__state">{store.activityPolicy.trackMouse ? 'enabled' : 'disabled'}</span>
                </span>
                <span className="cip-chip cip-chip--on">
                  <span className="cip-chip__label">Interval:</span>
                  <span className="cip-chip__state">{store.activityPolicy.trackingInterval}m</span>
                </span>
                {isManagerOrCeo && (
                  <button
                    type="button"
                    className="cip-icon-btn"
                    onClick={() => {
                      setActivityForm(store.activityPolicy);
                      initializeScope(store.activityPolicy.applyTo);
                      setEditingPolicy('activity');
                    }}
                    style={{ marginLeft: '8px' }}
                  >
                    <Edit size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* 2. Idle Time Policy Row */}
            <div className="cip-policy-row">
              <div className="cip-policy-row__main">
                <div className="cip-policy-row__title">
                  {store.idlePolicy.name}
                </div>
                <div className="cip-policy-row__desc">{store.idlePolicy.description}</div>
                <div style={{ marginTop: '6px', fontSize: '0.7rem', color: 'var(--nexus-text-muted)' }}>
                  Applies to: {store.idlePolicy.applyTo}
                </div>
              </div>
              <div className="cip-policy-row__chips">
                <span className="cip-chip cip-chip--on">
                  <span className="cip-chip__label">Normal:</span>
                  <span className="cip-chip__state">{store.idlePolicy.idleThreshold}m</span>
                </span>
                <span className="cip-chip cip-chip--on">
                  <span className="cip-chip__label">Critical:</span>
                  <span className="cip-chip__state">{store.idlePolicy.criticalThreshold}m</span>
                </span>
                <span className="cip-chip cip-chip--on">
                  <span className="cip-chip__label">Reminder:</span>
                  <span className="cip-chip__state">{store.idlePolicy.reminderNotification ? 'active' : 'disabled'}</span>
                </span>

                {isManagerOrCeo && (
                  <button
                    type="button"
                    className="cip-icon-btn"
                    onClick={() => {
                      setIdleForm(store.idlePolicy);
                      initializeScope(store.idlePolicy.applyTo);
                      setEditingPolicy('idle');
                    }}
                    style={{ marginLeft: '8px' }}
                  >
                    <Edit size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* 3. Screenshot Policy Row */}
            <div className="cip-policy-row">
              <div className="cip-policy-row__main">
                <div className="cip-policy-row__title">
                  {store.screenshotPolicy.name}
                </div>
                <div className="cip-policy-row__desc">{store.screenshotPolicy.description}</div>
                <div style={{ marginTop: '6px', fontSize: '0.7rem', color: 'var(--nexus-text-muted)' }}>
                  Applies to: {store.screenshotPolicy.applyTo} | Retention: {store.screenshotPolicy.retention}
                </div>
              </div>
              <div className="cip-policy-row__chips">
                <span className={`cip-chip ${store.screenshotPolicy.enabled ? 'cip-chip--on' : 'cip-chip--off'}`}>
                  <span className="cip-chip__label">Logging:</span>
                  <span className="cip-chip__state">{store.screenshotPolicy.enabled ? 'enabled' : 'disabled'}</span>
                </span>
                <span className="cip-chip cip-chip--on">
                  <span className="cip-chip__label">Quality:</span>
                  <span className="cip-chip__state">{store.screenshotPolicy.quality}</span>
                </span>
                <span className="cip-chip cip-chip--on">
                  <span className="cip-chip__label">Screen Alert:</span>
                  <span className="cip-chip__state">{store.screenshotPolicy.notification ? 'enabled' : 'disabled'}</span>
                </span>

                {isManagerOrCeo && (
                  <button
                    type="button"
                    className="cip-icon-btn"
                    onClick={() => {
                      setScreenshotForm(store.screenshotPolicy);
                      initializeScope(store.screenshotPolicy.applyTo);
                      setEditingPolicy('screenshot');
                    }}
                    style={{ marginLeft: '8px' }}
                  >
                    <Edit size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* 4. Webcam Policy Row */}
            <div className="cip-policy-row">
              <div className="cip-policy-row__main">
                <div className="cip-policy-row__title">
                  {store.webcamPolicy.name}
                </div>
                <div className="cip-policy-row__desc">{store.webcamPolicy.description}</div>
                <div style={{ marginTop: '6px', fontSize: '0.7rem', color: 'var(--nexus-text-muted)' }}>
                  Applies to: {store.webcamPolicy.applyTo} | Retention: {store.webcamPolicy.retention}
                </div>
              </div>
              <div className="cip-policy-row__chips">
                <span className={`cip-chip ${store.webcamPolicy.enabled ? 'cip-chip--on' : 'cip-chip--off'}`}>
                  <span className="cip-chip__label">Verification:</span>
                  <span className="cip-chip__state">{store.webcamPolicy.enabled ? 'enabled' : 'disabled'}</span>
                </span>
                <span className="cip-chip cip-chip--on">
                  <span className="cip-chip__label">Trigger:</span>
                  <span className="cip-chip__state">{store.webcamPolicy.idleThreshold}m idle</span>
                </span>

                {isManagerOrCeo && (
                  <button
                    type="button"
                    className="cip-icon-btn"
                    onClick={() => {
                      setWebcamForm(store.webcamPolicy);
                      initializeScope(store.webcamPolicy.applyTo);
                      setEditingPolicy('webcam');
                    }}
                    style={{ marginLeft: '8px' }}
                  >
                    <Edit size={14} />
                  </button>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* Monitoring Exemptions Section */}
        <section className="cip-section">
          <div className="cip-section__header">
            <h2 className="cip-section__title">Monitoring Exemptions</h2>
            {isManagerOrCeo && (
              <button 
                type="button" 
                className="org-btn org-btn--secondary org-btn--sm" 
                onClick={() => { resetExemptionForm(); initializeScope(''); setIsAddExemptionOpen(true); }}
              >
                <Plus size={13} /> Add Exemption
              </button>
            )}
          </div>
          <p className="cip-hint cip-hint--inline">
            Exempt roles or teams from specific compliance features to protect local privacy.
          </p>

          <div className="cip-exemption-list">
            {exemptions.map(ex => (
              <div key={ex.id} className="cip-exemption-row">
                <div className="cip-exemption-row__content" style={{ flex: 1 }}>
                  <div className="cip-exemption-row__name">{ex.name}</div>
                  <div className="cip-exemption-row__meta"><strong>Scope:</strong> {ex.scope}</div>
                  <div className="cip-exemption-row__meta">
                    <strong>Monitoring Status:</strong>{' '}
                    <span style={{ fontWeight: 600, color: ex.requirementType === 'required' ? '#10b981' : '#f59e0b' }}>
                      {ex.requirementType === 'required' ? 'Required (Monitored)' : 'Not Required (Exempt)'}
                    </span>
                  </div>
                  <div className="cip-exemption-row__meta">
                    <strong>{ex.requirementType === 'required' ? 'Enforced Features:' : 'Exempt From Features:'}</strong>{' '}
                    {ex.exemptFrom.join(', ') || 'None'}
                  </div>
                  <div className="cip-exemption-row__meta"><strong>Period:</strong> {ex.period}</div>
                </div>
                <div className="cip-exemption-row__aside">
                  <span className={`cfg-badge cfg-badge--${ex.status}`}>{ex.status}</span>
                  {isManagerOrCeo && (
                    <div className="cip-exemption-row__actions">
                      <button
                        type="button"
                        className="cip-icon-btn"
                        onClick={() => {
                          setEditingExemption(ex);
                          initializeScope(ex.scope);
                        }}
                        aria-label={`Edit ${ex.name}`}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        className="cip-icon-btn cip-icon-btn--danger"
                        onClick={() => {
                          if (window.confirm(`Remove "${ex.name}"?`)) handleDeleteExemption(ex.id);
                        }}
                        aria-label={`Delete ${ex.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {exemptions.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--nexus-text-muted)', fontSize: '0.78rem' }}>
                No monitoring exemptions defined.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* -------------------- POLICY EDIT MODALS -------------------- */}

      {/* 1. Activity Tracking Modal */}
      {editingPolicy === 'activity' && (
        <div className="schedules-cfg-modal-overlay" onClick={() => setEditingPolicy(null)}>
          <form className="schedules-cfg-modal" onSubmit={handleSaveActivity} onClick={e => e.stopPropagation()}>
            <header className="schedules-cfg-modal__header">
              <h2>Configure Activity Tracking</h2>
              <button type="button" className="org-slideover__close" onClick={() => setEditingPolicy(null)} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            
            <div className="schedules-cfg-modal__body">
              <div className="org-form-field">
                <label>Tracking Interval (Minutes)</label>
                <input 
                  type="number" 
                  min={1} 
                  value={activityForm.trackingInterval}
                  onChange={e => setActivityForm({...activityForm, trackingInterval: Number(e.target.value)})}
                  required
                />
              </div>

              <div className="org-form-field" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Track Keyboard Activity</label>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="modal-track-kb" 
                    checked={activityForm.trackKeyboard} 
                    onChange={e => setActivityForm({...activityForm, trackKeyboard: e.target.checked})}
                  />
                  <label className="toggle-slider" htmlFor="modal-track-kb"></label>
                </div>
              </div>

              <div className="org-form-field" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Track Mouse Activity</label>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="modal-track-ms" 
                    checked={activityForm.trackMouse} 
                    onChange={e => setActivityForm({...activityForm, trackMouse: e.target.checked})}
                  />
                  <label className="toggle-slider" htmlFor="modal-track-ms"></label>
                </div>
              </div>

              <div className="schedules-cfg-form-section">
                <label className="schedules-cfg-form-section__label">Applies To</label>
                <div className="leave-cfg-segmented">
                  {['employee', 'department', 'position'].map(sc => (
                    <button
                      key={sc}
                      type="button"
                      className={`leave-cfg-segmented__btn${currentScope === sc ? ' leave-cfg-segmented__btn--active' : ''}`}
                      onClick={() => setCurrentScope(sc as any)}
                    >
                      {sc === 'employee' ? 'Employee' : sc === 'department' ? 'Department' : 'Position'}
                    </button>
                  ))}
                </div>

                {currentScope === 'employee' && (
                  <LeaveScopeMultiSelect
                    label="Employees"
                    options={employees
                      .filter(e => e.status === 'active')
                      .map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}` }))}
                    selectedIds={selectedEmployeeIds}
                    onChange={setSelectedEmployeeIds}
                    placeholder="Search employees…"
                  />
                )}

                {currentScope === 'department' && (
                  <LeaveScopeMultiSelect
                    label="Departments"
                    options={departments
                      .filter(d => d.status === 'active')
                      .map(d => ({ id: d.id, name: d.name }))}
                    selectedIds={selectedDepartmentIds}
                    onChange={setSelectedDepartmentIds}
                    placeholder="Search departments…"
                  />
                )}

                {currentScope === 'position' && (
                  <LeaveScopeMultiSelect
                    label="Positions"
                    options={positions
                      .filter(p => p.status === 'active')
                      .map(p => ({ id: p.id, name: p.name }))}
                    selectedIds={selectedPositionIds}
                    onChange={setSelectedPositionIds}
                    placeholder="Search positions…"
                  />
                )}
              </div>

              <div className="org-form-field">
                <label>Effective Date</label>
                <input 
                  type="date" 
                  className="cip-modal-date" 
                  value={activityForm.effectiveDate}
                  onChange={e => setActivityForm({...activityForm, effectiveDate: e.target.value})}
                  required
                />
              </div>
            </div>

            {error && <p className="schedules-cfg-form-error" style={{ margin: '0 24px 16px 24px' }}>{error}</p>}

            <footer className="schedules-cfg-modal__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={() => setEditingPolicy(null)}>Cancel</button>
              <button type="submit" className="org-btn org-btn--primary">Apply Settings</button>
            </footer>
          </form>
        </div>
      )}

      {/* 2. Idle Time Modal */}
      {editingPolicy === 'idle' && (
        <div className="schedules-cfg-modal-overlay" onClick={() => setEditingPolicy(null)}>
          <form className="schedules-cfg-modal" onSubmit={handleSaveIdle} onClick={e => e.stopPropagation()}>
            <header className="schedules-cfg-modal__header">
              <h2>Configure Idle Time</h2>
              <button type="button" className="org-slideover__close" onClick={() => setEditingPolicy(null)} aria-label="Close">
                <X size={18} />
              </button>
            </header>

            <div className="schedules-cfg-modal__body">
              <div className="org-form-field">
                <label>Normal Idle Duration (Minutes)</label>
                <input 
                  type="number" 
                  min={1} 
                  value={idleForm.idleThreshold}
                  onChange={e => setIdleForm({...idleForm, idleThreshold: Number(e.target.value)})}
                  required
                />
              </div>

              <div className="org-form-field">
                <label>Critical Idle Duration (Minutes)</label>
                <input 
                  type="number" 
                  min={1} 
                  value={idleForm.criticalThreshold}
                  onChange={e => setIdleForm({...idleForm, criticalThreshold: Number(e.target.value)})}
                  required
                />
              </div>

              <div className="org-form-field" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Send Reminder Notification on Inactivity</label>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="modal-idle-rem" 
                    checked={idleForm.reminderNotification} 
                    onChange={e => setIdleForm({...idleForm, reminderNotification: e.target.checked})}
                  />
                  <label className="toggle-slider" htmlFor="modal-idle-rem"></label>
                </div>
              </div>

              <div className="schedules-cfg-form-section">
                <label className="schedules-cfg-form-section__label">Applies To</label>
                <div className="leave-cfg-segmented">
                  {['employee', 'department', 'position'].map(sc => (
                    <button
                      key={sc}
                      type="button"
                      className={`leave-cfg-segmented__btn${currentScope === sc ? ' leave-cfg-segmented__btn--active' : ''}`}
                      onClick={() => setCurrentScope(sc as any)}
                    >
                      {sc === 'employee' ? 'Employee' : sc === 'department' ? 'Department' : 'Position'}
                    </button>
                  ))}
                </div>

                {currentScope === 'employee' && (
                  <LeaveScopeMultiSelect
                    label="Employees"
                    options={employees
                      .filter(e => e.status === 'active')
                      .map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}` }))}
                    selectedIds={selectedEmployeeIds}
                    onChange={setSelectedEmployeeIds}
                    placeholder="Search employees…"
                  />
                )}

                {currentScope === 'department' && (
                  <LeaveScopeMultiSelect
                    label="Departments"
                    options={departments
                      .filter(d => d.status === 'active')
                      .map(d => ({ id: d.id, name: d.name }))}
                    selectedIds={selectedDepartmentIds}
                    onChange={setSelectedDepartmentIds}
                    placeholder="Search departments…"
                  />
                )}

                {currentScope === 'position' && (
                  <LeaveScopeMultiSelect
                    label="Positions"
                    options={positions
                      .filter(p => p.status === 'active')
                      .map(p => ({ id: p.id, name: p.name }))}
                    selectedIds={selectedPositionIds}
                    onChange={setSelectedPositionIds}
                    placeholder="Search positions…"
                  />
                )}
              </div>
            </div>

            {error && <p className="schedules-cfg-form-error" style={{ margin: '0 24px 16px 24px' }}>{error}</p>}

            <footer className="schedules-cfg-modal__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={() => setEditingPolicy(null)}>Cancel</button>
              <button type="submit" className="org-btn org-btn--primary">Apply Settings</button>
            </footer>
          </form>
        </div>
      )}

      {/* 3. Screenshot Policy Modal */}
      {editingPolicy === 'screenshot' && (
        <div className="schedules-cfg-modal-overlay" onClick={() => setEditingPolicy(null)}>
          <form className="schedules-cfg-modal" onSubmit={handleSaveScreenshot} onClick={e => e.stopPropagation()}>
            <header className="schedules-cfg-modal__header">
              <h2>Configure Screen Tracking</h2>
              <button type="button" className="org-slideover__close" onClick={() => setEditingPolicy(null)} aria-label="Close">
                <X size={18} />
              </button>
            </header>

            <div className="schedules-cfg-modal__body">
              <div className="org-form-field" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Enable Screenshot Logging</label>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="modal-ss-enable" 
                    checked={screenshotForm.enabled} 
                    onChange={e => setScreenshotForm({...screenshotForm, enabled: e.target.checked})}
                  />
                  <label className="toggle-slider" htmlFor="modal-ss-enable"></label>
                </div>
              </div>

              <div className="org-form-field">
                <label>Screenshot Quality</label>
                <select 
                  value={screenshotForm.quality}
                  onChange={e => setScreenshotForm({...screenshotForm, quality: e.target.value as any})}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="org-form-field" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Send Alert Notification to Employee</label>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="modal-ss-notif" 
                    checked={screenshotForm.notification} 
                    onChange={e => setScreenshotForm({...screenshotForm, notification: e.target.checked})}
                  />
                  <label className="toggle-slider" htmlFor="modal-ss-notif"></label>
                </div>
              </div>

              <div className="org-form-field">
                <label>Storage Retention Window</label>
                <input 
                  type="text" 
                  value={screenshotForm.retention}
                  onChange={e => setScreenshotForm({...screenshotForm, retention: e.target.value})}
                  required
                />
              </div>

              <div className="org-form-field" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Capture Multiple Extended Displays</label>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="modal-ss-mult" 
                    checked={screenshotForm.captureMultiple} 
                    onChange={e => setScreenshotForm({...screenshotForm, captureMultiple: e.target.checked})}
                  />
                  <label className="toggle-slider" htmlFor="modal-ss-mult"></label>
                </div>
              </div>

              <div className="schedules-cfg-form-section">
                <label className="schedules-cfg-form-section__label">Applies To</label>
                <div className="leave-cfg-segmented">
                  {['employee', 'department', 'position'].map(sc => (
                    <button
                      key={sc}
                      type="button"
                      className={`leave-cfg-segmented__btn${currentScope === sc ? ' leave-cfg-segmented__btn--active' : ''}`}
                      onClick={() => setCurrentScope(sc as any)}
                    >
                      {sc === 'employee' ? 'Employee' : sc === 'department' ? 'Department' : 'Position'}
                    </button>
                  ))}
                </div>

                {currentScope === 'employee' && (
                  <LeaveScopeMultiSelect
                    label="Employees"
                    options={employees
                      .filter(e => e.status === 'active')
                      .map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}` }))}
                    selectedIds={selectedEmployeeIds}
                    onChange={setSelectedEmployeeIds}
                    placeholder="Search employees…"
                  />
                )}

                {currentScope === 'department' && (
                  <LeaveScopeMultiSelect
                    label="Departments"
                    options={departments
                      .filter(d => d.status === 'active')
                      .map(d => ({ id: d.id, name: d.name }))}
                    selectedIds={selectedDepartmentIds}
                    onChange={setSelectedDepartmentIds}
                    placeholder="Search departments…"
                  />
                )}

                {currentScope === 'position' && (
                  <LeaveScopeMultiSelect
                    label="Positions"
                    options={positions
                      .filter(p => p.status === 'active')
                      .map(p => ({ id: p.id, name: p.name }))}
                    selectedIds={selectedPositionIds}
                    onChange={setSelectedPositionIds}
                    placeholder="Search positions…"
                  />
                )}
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                <h4 style={{ color: '#ef4444', margin: '0 0 6px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <ShieldAlert size={14} /> Privacy Alert
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '11px', margin: 0, lineHeight: 1.4 }}>
                  If employee alerts are disabled, ensure local compliance laws are observed before enabling screen capture.
                </p>
              </div>
            </div>

            {error && <p className="schedules-cfg-form-error" style={{ margin: '0 24px 16px 24px' }}>{error}</p>}

            <footer className="schedules-cfg-modal__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={() => setEditingPolicy(null)}>Cancel</button>
              <button type="submit" className="org-btn org-btn--primary">Apply Settings</button>
            </footer>
          </form>
        </div>
      )}

      {/* 4. Webcam Verification Modal */}
      {editingPolicy === 'webcam' && (
        <div className="schedules-cfg-modal-overlay" onClick={() => setEditingPolicy(null)}>
          <form className="schedules-cfg-modal" onSubmit={handleSaveWebcam} onClick={e => e.stopPropagation()}>
            <header className="schedules-cfg-modal__header">
              <h2>Configure Webcam Policy</h2>
              <button type="button" className="org-slideover__close" onClick={() => setEditingPolicy(null)} aria-label="Close">
                <X size={18} />
              </button>
            </header>

            <div className="schedules-cfg-modal__body">
              <div className="org-form-field" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Enable Webcam Verification</label>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="modal-web-enable" 
                    checked={webcamForm.enabled} 
                    onChange={e => setWebcamForm({...webcamForm, enabled: e.target.checked})}
                  />
                  <label className="toggle-slider" htmlFor="modal-web-enable"></label>
                </div>
              </div>

              <div className="org-form-field">
                <label>Idle Threshold Trigger (Minutes)</label>
                <input 
                  type="number" 
                  min={1} 
                  value={webcamForm.idleThreshold}
                  onChange={e => setWebcamForm({...webcamForm, idleThreshold: Number(e.target.value)})}
                  required
                />
              </div>

              <div className="org-form-field">
                <label>Notification/Consent Duration (Seconds)</label>
                <input 
                  type="number" 
                  min={1} 
                  value={webcamForm.notificationDuration}
                  onChange={e => setWebcamForm({...webcamForm, notificationDuration: Number(e.target.value)})}
                  required
                />
              </div>

              <div className="org-form-field">
                <label>Webcam Photo Retention Window</label>
                <input 
                  type="text" 
                  value={webcamForm.retention}
                  onChange={e => setWebcamForm({...webcamForm, retention: e.target.value})}
                  required
                />
              </div>

              <div className="schedules-cfg-form-section">
                <label className="schedules-cfg-form-section__label">Applies To</label>
                <div className="leave-cfg-segmented">
                  {['employee', 'department', 'position'].map(sc => (
                    <button
                      key={sc}
                      type="button"
                      className={`leave-cfg-segmented__btn${currentScope === sc ? ' leave-cfg-segmented__btn--active' : ''}`}
                      onClick={() => setCurrentScope(sc as any)}
                    >
                      {sc === 'employee' ? 'Employee' : sc === 'department' ? 'Department' : 'Position'}
                    </button>
                  ))}
                </div>

                {currentScope === 'employee' && (
                  <LeaveScopeMultiSelect
                    label="Employees"
                    options={employees
                      .filter(e => e.status === 'active')
                      .map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}` }))}
                    selectedIds={selectedEmployeeIds}
                    onChange={setSelectedEmployeeIds}
                    placeholder="Search employees…"
                  />
                )}

                {currentScope === 'department' && (
                  <LeaveScopeMultiSelect
                    label="Departments"
                    options={departments
                      .filter(d => d.status === 'active')
                      .map(d => ({ id: d.id, name: d.name }))}
                    selectedIds={selectedDepartmentIds}
                    onChange={setSelectedDepartmentIds}
                    placeholder="Search departments…"
                  />
                )}

                {currentScope === 'position' && (
                  <LeaveScopeMultiSelect
                    label="Positions"
                    options={positions
                      .filter(p => p.status === 'active')
                      .map(p => ({ id: p.id, name: p.name }))}
                    selectedIds={selectedPositionIds}
                    onChange={setSelectedPositionIds}
                    placeholder="Search positions…"
                  />
                )}
              </div>
            </div>

            {error && <p className="schedules-cfg-form-error" style={{ margin: '0 24px 16px 24px' }}>{error}</p>}

            <footer className="schedules-cfg-modal__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={() => setEditingPolicy(null)}>Cancel</button>
              <button type="submit" className="org-btn org-btn--primary">Apply Settings</button>
            </footer>
          </form>
        </div>
      )}

      {/* 5. Add Exemption Modal */}
      {isAddExemptionOpen && (
        <div className="schedules-cfg-modal-overlay" onClick={() => setIsAddExemptionOpen(false)}>
          <form className="schedules-cfg-modal" onSubmit={handleAddExemption} onClick={e => e.stopPropagation()}>
            <header className="schedules-cfg-modal__header">
              <h2>Add Monitoring Rule / Exemption</h2>
              <button type="button" className="org-slideover__close" onClick={() => setIsAddExemptionOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </header>

            <div className="schedules-cfg-modal__body">
              <div className="org-form-field">
                <label>Rule/Exemption Name</label>
                <input 
                  type="text" 
                  value={exemptionForm.name}
                  placeholder="e.g. Legal Compliance Waiver"
                  onChange={e => setExemptionForm({ ...exemptionForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="org-form-field">
                <label>Monitoring Status</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="add-requirementType" 
                      value="not_required"
                      checked={exemptionForm.requirementType === 'not_required'}
                      onChange={() => setExemptionForm({ ...exemptionForm, requirementType: 'not_required' })}
                    />
                    Not Required (Exempt)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="add-requirementType" 
                      value="required"
                      checked={exemptionForm.requirementType === 'required'}
                      onChange={() => setExemptionForm({ ...exemptionForm, requirementType: 'required' })}
                    />
                    Required (Monitored)
                  </label>
                </div>
              </div>

              <div className="schedules-cfg-form-section">
                <label className="schedules-cfg-form-section__label">Applies To</label>
                <div className="leave-cfg-segmented">
                  {['employee', 'department', 'position'].map(sc => (
                    <button
                      key={sc}
                      type="button"
                      className={`leave-cfg-segmented__btn${currentScope === sc ? ' leave-cfg-segmented__btn--active' : ''}`}
                      onClick={() => setCurrentScope(sc as any)}
                    >
                      {sc === 'employee' ? 'Employee' : sc === 'department' ? 'Department' : 'Position'}
                    </button>
                  ))}
                </div>

                {currentScope === 'employee' && (
                  <LeaveScopeMultiSelect
                    label="Employees"
                    options={employees
                      .filter(e => e.status === 'active')
                      .map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}` }))}
                    selectedIds={selectedEmployeeIds}
                    onChange={setSelectedEmployeeIds}
                    placeholder="Search employees…"
                  />
                )}

                {currentScope === 'department' && (
                  <LeaveScopeMultiSelect
                    label="Departments"
                    options={departments
                      .filter(d => d.status === 'active')
                      .map(d => ({ id: d.id, name: d.name }))}
                    selectedIds={selectedDepartmentIds}
                    onChange={setSelectedDepartmentIds}
                    placeholder="Search departments…"
                  />
                )}

                {currentScope === 'position' && (
                  <LeaveScopeMultiSelect
                    label="Positions"
                    options={positions
                      .filter(p => p.status === 'active')
                      .map(p => ({ id: p.id, name: p.name }))}
                    selectedIds={selectedPositionIds}
                    onChange={setSelectedPositionIds}
                    placeholder="Search positions…"
                  />
                )}
              </div>

              <div className="org-form-field">
                <label>{exemptionForm.requirementType === 'required' ? 'Enforced Features' : 'Exempt From Features'}</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                  {['Activity Tracking', 'Screen Capture', 'Webcam Verification'].map(feat => (
                    <label key={feat} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.78rem' }}>
                      <input 
                        type="checkbox"
                        checked={exemptionForm.exemptFrom.includes(feat)}
                        onChange={e => handleCheckboxChange(feat, e.target.checked, false)}
                      />
                      {feat}
                    </label>
                  ))}
                </div>
              </div>

              <div className="org-form-field">
                <label>Active Period Type</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="add-timingType" 
                      value="permanent"
                      checked={exemptionForm.timingType === 'permanent'}
                      onChange={() => setExemptionForm({ ...exemptionForm, timingType: 'permanent' })}
                    />
                    Permanent
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="add-timingType" 
                      value="custom"
                      checked={exemptionForm.timingType === 'custom'}
                      onChange={() => setExemptionForm({ ...exemptionForm, timingType: 'custom' })}
                    />
                    Custom Date/Time Range
                  </label>
                </div>
              </div>

              {exemptionForm.timingType === 'custom' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '6px', marginTop: '6px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="org-form-field" style={{ flex: 1, margin: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>Start Date</label>
                      <input 
                        type="date" 
                        value={exemptionForm.startDate || ''} 
                        onChange={e => setExemptionForm({ ...exemptionForm, startDate: e.target.value })} 
                        required
                      />
                    </div>
                    <div className="org-form-field" style={{ flex: 1, margin: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>Start Time</label>
                      <input 
                        type="time" 
                        value={exemptionForm.startTime || ''} 
                        onChange={e => setExemptionForm({ ...exemptionForm, startTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="org-form-field" style={{ flex: 1, margin: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>End Date</label>
                      <input 
                        type="date" 
                        value={exemptionForm.endDate || ''} 
                        onChange={e => setExemptionForm({ ...exemptionForm, endDate: e.target.value })} 
                        required
                      />
                    </div>
                    <div className="org-form-field" style={{ flex: 1, margin: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>End Time</label>
                      <input 
                        type="time" 
                        value={exemptionForm.endTime || ''} 
                        onChange={e => setExemptionForm({ ...exemptionForm, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && <p className="schedules-cfg-form-error" style={{ margin: '0 24px 16px 24px' }}>{error}</p>}

            <footer className="schedules-cfg-modal__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={() => setIsAddExemptionOpen(false)}>Cancel</button>
              <button type="submit" className="org-btn org-btn--primary">Add Exemption</button>
            </footer>
          </form>
        </div>
      )}

      {/* 6. Edit Exemption Modal */}
      {editingExemption && (
        <div className="schedules-cfg-modal-overlay" onClick={() => setEditingExemption(null)}>
          <form className="schedules-cfg-modal" onSubmit={handleSaveExemptionEdit} onClick={e => e.stopPropagation()}>
            <header className="schedules-cfg-modal__header">
              <h2>Edit Exemption: {editingExemption.name}</h2>
              <button type="button" className="org-slideover__close" onClick={() => setEditingExemption(null)} aria-label="Close">
                <X size={18} />
              </button>
            </header>

            <div className="schedules-cfg-modal__body">
              <div className="org-form-field">
                <label>Exemption Name</label>
                <input 
                  type="text" 
                  value={editingExemption.name}
                  onChange={e => setEditingExemption({ ...editingExemption, name: e.target.value })}
                  required
                />
              </div>

              <div className="org-form-field">
                <label>Monitoring Status</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="edit-requirementType" 
                      value="not_required"
                      checked={editingExemption.requirementType === 'not_required'}
                      onChange={() => setEditingExemption({ ...editingExemption, requirementType: 'not_required' })}
                    />
                    Not Required (Exempt)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="edit-requirementType" 
                      value="required"
                      checked={editingExemption.requirementType === 'required'}
                      onChange={() => setEditingExemption({ ...editingExemption, requirementType: 'required' })}
                    />
                    Required (Monitored)
                  </label>
                </div>
              </div>

              <div className="schedules-cfg-form-section">
                <label className="schedules-cfg-form-section__label">Applies To</label>
                <div className="leave-cfg-segmented">
                  {['employee', 'department', 'position'].map(sc => (
                    <button
                      key={sc}
                      type="button"
                      className={`leave-cfg-segmented__btn${currentScope === sc ? ' leave-cfg-segmented__btn--active' : ''}`}
                      onClick={() => setCurrentScope(sc as any)}
                    >
                      {sc === 'employee' ? 'Employee' : sc === 'department' ? 'Department' : 'Position'}
                    </button>
                  ))}
                </div>

                {currentScope === 'employee' && (
                  <LeaveScopeMultiSelect
                    label="Employees"
                    options={employees
                      .filter(e => e.status === 'active')
                      .map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}` }))}
                    selectedIds={selectedEmployeeIds}
                    onChange={setSelectedEmployeeIds}
                    placeholder="Search employees…"
                  />
                )}

                {currentScope === 'department' && (
                  <LeaveScopeMultiSelect
                    label="Departments"
                    options={departments
                      .filter(d => d.status === 'active')
                      .map(d => ({ id: d.id, name: d.name }))}
                    selectedIds={selectedDepartmentIds}
                    onChange={setSelectedDepartmentIds}
                    placeholder="Search departments…"
                  />
                )}

                {currentScope === 'position' && (
                  <LeaveScopeMultiSelect
                    label="Positions"
                    options={positions
                      .filter(p => p.status === 'active')
                      .map(p => ({ id: p.id, name: p.name }))}
                    selectedIds={selectedPositionIds}
                    onChange={setSelectedPositionIds}
                    placeholder="Search positions…"
                  />
                )}
              </div>

              <div className="org-form-field">
                <label>{editingExemption.requirementType === 'required' ? 'Enforced Features' : 'Exempt From Features'}</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                  {['Activity Tracking', 'Screen Capture', 'Webcam Verification'].map(feat => (
                    <label key={feat} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.78rem' }}>
                      <input 
                        type="checkbox"
                        checked={editingExemption.exemptFrom.includes(feat)}
                        onChange={e => handleCheckboxChange(feat, e.target.checked, true)}
                      />
                      {feat}
                    </label>
                  ))}
                </div>
              </div>

              <div className="org-form-field">
                <label>Active Period Type</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="edit-timingType" 
                      value="permanent"
                      checked={editingExemption.timingType === 'permanent'}
                      onChange={() => setEditingExemption({ ...editingExemption, timingType: 'permanent' })}
                    />
                    Permanent
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="edit-timingType" 
                      value="custom"
                      checked={editingExemption.timingType === 'custom'}
                      onChange={() => setEditingExemption({ ...editingExemption, timingType: 'custom' })}
                    />
                    Custom Date/Time Range
                  </label>
                </div>
              </div>

              {editingExemption.timingType === 'custom' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '6px', marginTop: '6px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="org-form-field" style={{ flex: 1, margin: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>Start Date</label>
                      <input 
                        type="date" 
                        value={editingExemption.startDate || ''} 
                        onChange={e => setEditingExemption({ ...editingExemption, startDate: e.target.value })} 
                        required
                      />
                    </div>
                    <div className="org-form-field" style={{ flex: 1, margin: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>Start Time</label>
                      <input 
                        type="time" 
                        value={editingExemption.startTime || ''} 
                        onChange={e => setEditingExemption({ ...editingExemption, startTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="org-form-field" style={{ flex: 1, margin: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>End Date</label>
                      <input 
                        type="date" 
                        value={editingExemption.endDate || ''} 
                        onChange={e => setEditingExemption({ ...editingExemption, endDate: e.target.value })} 
                        required
                      />
                    </div>
                    <div className="org-form-field" style={{ flex: 1, margin: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>End Time</label>
                      <input 
                        type="time" 
                        value={editingExemption.endTime || ''} 
                        onChange={e => setEditingExemption({ ...editingExemption, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="org-form-field">
                <label>Status</label>
                <select 
                  value={editingExemption.status}
                  onChange={e => setEditingExemption({ ...editingExemption, status: e.target.value as any })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {error && <p className="schedules-cfg-form-error" style={{ margin: '0 24px 16px 24px' }}>{error}</p>}

            <footer className="schedules-cfg-modal__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={() => setEditingExemption(null)}>Cancel</button>
              <button type="submit" className="org-btn org-btn--primary">Save Changes</button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
};
