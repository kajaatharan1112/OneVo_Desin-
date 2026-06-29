import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useLeaveConfigStore } from '../../../store/leaveConfigStore';
import { useOrganizationStore } from '../../../store/organizationStore';
import type { AccrualMethod, LeaveStatus, PolicyScope } from './leaveConfigTypes';
import { POLICY_ADVANCED_DEFAULTS } from './leaveConfigUtils';
import { LeaveScopeMultiSelect } from './LeaveScopeMultiSelect';

interface LeavePolicyFormPanelProps {
  onClose: () => void;
}

type FormAccrual = 'yearly' | 'monthly';

interface PolicyFormState {
  name: string;
  leaveTypeId: string;
  description: string;
  effectiveFrom: string;
  status: LeaveStatus;
  appliesTo: PolicyScope;
  departmentIds: string[];
  positionIds: string[];
  daysPerYear: number;
  accrualMethod: FormAccrual;
  proRataNewJoiners: boolean;
  carryForwardAllowed: boolean;
  maxCarryForwardDays: number;
  carryForwardExpiryMonths: number;
  minNoticeDays: number;
  maxConsecutiveDays: string;
  minDaysPerRequest: number;
  blackoutPeriods: string;
  requiresDocument: boolean;
  documentRequiredAfterDays: string;
}

const defaultPolicy = (): PolicyFormState => ({
  name: '',
  leaveTypeId: '',
  description: '',
  effectiveFrom: new Date().toISOString().slice(0, 10),
  status: 'active',
  appliesTo: 'company',
  departmentIds: [],
  positionIds: [],
  daysPerYear: 14,
  accrualMethod: 'yearly',
  ...POLICY_ADVANCED_DEFAULTS,
  maxConsecutiveDays: '',
  documentRequiredAfterDays: ''
});

function toFormAccrual(method: AccrualMethod): FormAccrual {
  return method === 'monthly' ? 'monthly' : 'yearly';
}

export const LeavePolicyFormPanel: React.FC<LeavePolicyFormPanelProps> = ({ onClose }) => {
  const { policyForm, policies, leaveTypes, savePolicy } = useLeaveConfigStore();
  const { departments, positions } = useOrganizationStore();
  const existing = policyForm.policyId ? policies.find(p => p.id === policyForm.policyId) : null;
  const isEdit = policyForm.mode === 'edit';

  const [form, setForm] = useState<PolicyFormState>(defaultPolicy);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && existing) {
      setForm({
        name: existing.name,
        leaveTypeId: existing.leaveTypeId,
        description: existing.description,
        effectiveFrom: existing.effectiveFrom,
        status: existing.status,
        appliesTo: existing.appliesTo,
        departmentIds: [...existing.departmentIds],
        positionIds: [...existing.positionIds],
        daysPerYear: existing.daysPerYear,
        accrualMethod: toFormAccrual(existing.accrualMethod),
        proRataNewJoiners: existing.proRataNewJoiners,
        carryForwardAllowed: existing.carryForwardAllowed,
        maxCarryForwardDays: existing.maxCarryForwardDays,
        carryForwardExpiryMonths: existing.carryForwardExpiryMonths,
        minNoticeDays: existing.minNoticeDays,
        maxConsecutiveDays: existing.maxConsecutiveDays?.toString() ?? '',
        minDaysPerRequest: existing.minDaysPerRequest,
        blackoutPeriods: existing.blackoutPeriods,
        requiresDocument: existing.requiresDocument,
        documentRequiredAfterDays: existing.documentRequiredAfterDays?.toString() ?? ''
      });
    } else {
      setForm(defaultPolicy());
    }
    setAdvancedOpen(false);
    setError(null);
  }, [isEdit, existing, policyForm]);

  const set = <K extends keyof PolicyFormState>(key: K, val: PolicyFormState[K]) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setError(null);
  };

  const handleScopeChange = (scope: PolicyScope) => {
    setForm(prev => ({
      ...prev,
      appliesTo: scope,
      departmentIds: scope === 'department' ? prev.departmentIds : [],
      positionIds: scope === 'position' ? prev.positionIds : []
    }));
    setError(null);
  };

  const resolveAdvancedFields = () => {
    if (!advancedOpen && !isEdit) {
      return {
        ...POLICY_ADVANCED_DEFAULTS,
        maxConsecutiveDays: POLICY_ADVANCED_DEFAULTS.maxConsecutiveDays,
        documentRequiredAfterDays: POLICY_ADVANCED_DEFAULTS.documentRequiredAfterDays
      };
    }

    return {
      proRataNewJoiners: form.proRataNewJoiners,
      carryForwardAllowed: form.carryForwardAllowed,
      maxCarryForwardDays: form.carryForwardAllowed ? form.maxCarryForwardDays : 0,
      carryForwardExpiryMonths: form.carryForwardAllowed ? form.carryForwardExpiryMonths : 0,
      minNoticeDays: form.minNoticeDays,
      maxConsecutiveDays: form.maxConsecutiveDays ? Number(form.maxConsecutiveDays) : null,
      minDaysPerRequest: form.minDaysPerRequest,
      blackoutPeriods: form.blackoutPeriods,
      requiresDocument: form.requiresDocument,
      documentRequiredAfterDays:
        form.requiresDocument && form.documentRequiredAfterDays
          ? Number(form.documentRequiredAfterDays)
          : null
    };
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.leaveTypeId) return;
    if (form.appliesTo === 'department' && form.departmentIds.length === 0) {
      setError('Select at least one department.');
      return;
    }
    if (form.appliesTo === 'position' && form.positionIds.length === 0) {
      setError('Select at least one position.');
      return;
    }

    const advanced = resolveAdvancedFields();
    const result = savePolicy({
      id: existing?.id,
      name: form.name.trim(),
      leaveTypeId: form.leaveTypeId,
      description: form.description,
      effectiveFrom: form.effectiveFrom,
      status: form.status,
      appliesTo: form.appliesTo,
      departmentIds: form.appliesTo === 'department' ? form.departmentIds : [],
      positionIds: form.appliesTo === 'position' ? form.positionIds : [],
      daysPerYear: Number(form.daysPerYear),
      accrualMethod: form.accrualMethod,
      ...advanced
    });

    if (!result.ok) {
      setError(result.error ?? 'Unable to save policy.');
      return;
    }
    onClose();
  };

  return (
    <div className="org-slideover-backdrop" onClick={onClose}>
      <div
        className="org-slideover leave-policy-slideover"
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit leave policy' : 'Create leave policy'}
        onClick={e => e.stopPropagation()}
      >
        <header className="org-slideover__header">
          <h2>{isEdit ? 'Edit Leave Policy' : 'Create Leave Policy'}</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="org-slideover__body">
          <section className="leave-cfg-section">
            <h3>Basic Info</h3>
            <div className="org-form-field">
              <label>Policy Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="org-form-field">
              <label>Leave Type</label>
              <select value={form.leaveTypeId} onChange={e => set('leaveTypeId', e.target.value)}>
                <option value="">— Select —</option>
                {leaveTypes.filter(t => t.status === 'active').map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="org-form-field">
              <label>Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} />
            </div>
            <div className="leave-cfg-form-row">
              <div className="org-form-field">
                <label>Effective From</label>
                <input type="date" value={form.effectiveFrom} onChange={e => set('effectiveFrom', e.target.value)} />
              </div>
              <div className="org-form-field">
                <label>Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value as LeaveStatus)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </section>

          <section className="leave-cfg-section">
            <h3>Applies To</h3>
            <p className="leave-cfg-hint">
              Position policy overrides Department policy. Department policy overrides Full Company.
            </p>
            <div className="leave-cfg-segmented">
              {(['company', 'department', 'position'] as PolicyScope[]).map(scope => (
                <button
                  key={scope}
                  type="button"
                  className={`leave-cfg-segmented__btn${form.appliesTo === scope ? ' leave-cfg-segmented__btn--active' : ''}`}
                  onClick={() => handleScopeChange(scope)}
                >
                  {scope === 'company' ? 'Full Company' : scope === 'department' ? 'Departments' : 'Positions'}
                </button>
              ))}
            </div>
            {(form.appliesTo === 'department' || form.appliesTo === 'position') && (
              <p className="leave-cfg-hint leave-cfg-hint--info">
                This policy overrides the Full Company policy for the selected scope.
              </p>
            )}
            {form.appliesTo === 'department' && (
              <LeaveScopeMultiSelect
                label="Departments"
                options={departments.map(d => ({ id: d.id, name: d.name }))}
                selectedIds={form.departmentIds}
                onChange={ids => set('departmentIds', ids)}
                placeholder="Search departments…"
              />
            )}
            {form.appliesTo === 'position' && (
              <LeaveScopeMultiSelect
                label="Positions"
                options={positions.map(p => ({ id: p.id, name: p.name }))}
                selectedIds={form.positionIds}
                onChange={ids => set('positionIds', ids)}
                placeholder="Search positions…"
              />
            )}
          </section>

          <section className="leave-cfg-section">
            <h3>Entitlement</h3>
            <div className="leave-cfg-form-row">
              <div className="org-form-field">
                <label>Days Per Year</label>
                <input type="number" min={0} value={form.daysPerYear} onChange={e => set('daysPerYear', Number(e.target.value))} />
              </div>
              <div className="org-form-field">
                <label>Accrual Method</label>
                <select value={form.accrualMethod} onChange={e => set('accrualMethod', e.target.value as FormAccrual)}>
                  <option value="yearly">Yearly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </section>

          <section className="leave-cfg-section leave-cfg-section--flush">
            <button
              type="button"
              className="leave-cfg-advanced-toggle"
              onClick={() => setAdvancedOpen(prev => !prev)}
              aria-expanded={advancedOpen}
            >
              <span>Advanced Settings</span>
              {advancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {!advancedOpen && (
              <p className="leave-cfg-hint">Optional carry-forward, request, and documentation rules.</p>
            )}
            {advancedOpen && (
              <div className="leave-cfg-advanced-panel">
                <label className="leave-cfg-toggle">
                  <input type="checkbox" checked={form.proRataNewJoiners} onChange={e => set('proRataNewJoiners', e.target.checked)} />
                  Pro-rata for New Joiners
                </label>
                <label className="leave-cfg-toggle">
                  <input type="checkbox" checked={form.carryForwardAllowed} onChange={e => set('carryForwardAllowed', e.target.checked)} />
                  Carry Forward Allowed
                </label>
                {form.carryForwardAllowed && (
                  <div className="leave-cfg-form-row">
                    <div className="org-form-field">
                      <label>Max Carry Forward Days</label>
                      <input type="number" min={0} value={form.maxCarryForwardDays} onChange={e => set('maxCarryForwardDays', Number(e.target.value))} />
                    </div>
                    <div className="org-form-field">
                      <label>Carry Forward Expiry Months</label>
                      <input type="number" min={0} value={form.carryForwardExpiryMonths} onChange={e => set('carryForwardExpiryMonths', Number(e.target.value))} />
                    </div>
                  </div>
                )}
                <div className="leave-cfg-form-row">
                  <div className="org-form-field">
                    <label>Minimum Notice Period (days)</label>
                    <input type="number" min={0} value={form.minNoticeDays} onChange={e => set('minNoticeDays', Number(e.target.value))} />
                  </div>
                  <div className="org-form-field">
                    <label>Maximum Consecutive Days</label>
                    <input value={form.maxConsecutiveDays} onChange={e => set('maxConsecutiveDays', e.target.value)} placeholder="Unlimited" />
                  </div>
                </div>
                <div className="org-form-field">
                  <label>Minimum Days Per Request</label>
                  <input type="number" min={0} step={0.5} value={form.minDaysPerRequest} onChange={e => set('minDaysPerRequest', Number(e.target.value))} />
                </div>
                <div className="org-form-field">
                  <label>Blackout Periods</label>
                  <input value={form.blackoutPeriods} onChange={e => set('blackoutPeriods', e.target.value)} placeholder="e.g. Dec 20 – Jan 5" />
                </div>
                <label className="leave-cfg-toggle">
                  <input type="checkbox" checked={form.requiresDocument} onChange={e => set('requiresDocument', e.target.checked)} />
                  Requires Supporting Document
                </label>
                {form.requiresDocument && (
                  <div className="org-form-field">
                    <label>Document Required After Days</label>
                    <input
                      type="number"
                      min={1}
                      value={form.documentRequiredAfterDays}
                      onChange={e => set('documentRequiredAfterDays', e.target.value)}
                    />
                    <p className="leave-cfg-hint">
                      Employee must attach a document when the request is longer than this.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {error && <p className="leave-cfg-form-error" role="alert">{error}</p>}
        </div>

        <footer className="org-slideover__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="org-btn org-btn--primary" onClick={handleSave}>Save Policy</button>
        </footer>
      </div>
    </div>
  );
};
