import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useLeaveConfigStore } from '../../../store/leaveConfigStore';
import { useOrganizationStore } from '../../../store/organizationStore';
import type { AccrualMethod, LeaveStatus, PolicyScope, LeaveLimitUnit, LeaveLimitPeriod } from './leaveConfigTypes';
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
  limitValue: number;
  limitUnit: LeaveLimitUnit;
  limitPeriod: LeaveLimitPeriod;
  accrualMethod: FormAccrual;
  proRataNewJoiners: boolean;
  carryForwardAllowed: boolean;
  maxCarryForwardValue: number;
  carryForwardExpiryMonths: number;
  minNoticeDays: number;
  maxConsecutiveDays: string;
  minRequestValue: number;
  blackoutPeriods: string;
  requiresDocument: boolean;
  documentRequiredAfterValue: string;
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
  limitValue: 112,
  limitUnit: 'hours',
  limitPeriod: 'yearly',
  accrualMethod: 'yearly',
  proRataNewJoiners: POLICY_ADVANCED_DEFAULTS.proRataNewJoiners,
  carryForwardAllowed: POLICY_ADVANCED_DEFAULTS.carryForwardAllowed,
  maxCarryForwardValue: POLICY_ADVANCED_DEFAULTS.maxCarryForwardValue,
  carryForwardExpiryMonths: POLICY_ADVANCED_DEFAULTS.carryForwardExpiryMonths,
  minNoticeDays: POLICY_ADVANCED_DEFAULTS.minNoticeDays,
  maxConsecutiveDays: '',
  minRequestValue: POLICY_ADVANCED_DEFAULTS.minRequestValue,
  blackoutPeriods: '',
  requiresDocument: POLICY_ADVANCED_DEFAULTS.requiresDocument,
  documentRequiredAfterValue: ''
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
        limitValue: existing.limitValue,
        limitUnit: existing.limitUnit,
        limitPeriod: existing.limitPeriod,
        accrualMethod: toFormAccrual(existing.accrualMethod),
        proRataNewJoiners: existing.proRataNewJoiners,
        carryForwardAllowed: existing.carryForwardAllowed,
        maxCarryForwardValue: existing.maxCarryForwardValue,
        carryForwardExpiryMonths: existing.carryForwardExpiryMonths,
        minNoticeDays: existing.minNoticeDays,
        maxConsecutiveDays: existing.maxConsecutiveDays?.toString() ?? '',
        minRequestValue: existing.minRequestValue,
        blackoutPeriods: existing.blackoutPeriods,
        requiresDocument: existing.requiresDocument,
        documentRequiredAfterValue: existing.documentRequiredAfterValue?.toString() ?? ''
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
        proRataNewJoiners: POLICY_ADVANCED_DEFAULTS.proRataNewJoiners,
        carryForwardAllowed: POLICY_ADVANCED_DEFAULTS.carryForwardAllowed,
        maxCarryForwardValue: POLICY_ADVANCED_DEFAULTS.maxCarryForwardValue,
        carryForwardExpiryMonths: POLICY_ADVANCED_DEFAULTS.carryForwardExpiryMonths,
        minNoticeDays: POLICY_ADVANCED_DEFAULTS.minNoticeDays,
        maxConsecutiveDays: null,
        minRequestValue: POLICY_ADVANCED_DEFAULTS.minRequestValue,
        blackoutPeriods: '',
        requiresDocument: POLICY_ADVANCED_DEFAULTS.requiresDocument,
        documentRequiredAfterValue: null
      };
    }

    return {
      proRataNewJoiners: form.proRataNewJoiners,
      carryForwardAllowed: form.carryForwardAllowed,
      maxCarryForwardValue: form.carryForwardAllowed ? form.maxCarryForwardValue : 0,
      carryForwardExpiryMonths: form.carryForwardAllowed ? form.carryForwardExpiryMonths : 0,
      minNoticeDays: form.minNoticeDays,
      maxConsecutiveDays: form.maxConsecutiveDays ? Number(form.maxConsecutiveDays) : null,
      minRequestValue: form.minRequestValue,
      blackoutPeriods: form.blackoutPeriods,
      requiresDocument: form.requiresDocument,
      documentRequiredAfterValue:
        form.requiresDocument && form.documentRequiredAfterValue
          ? Number(form.documentRequiredAfterValue)
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
      limitValue: Number(form.limitValue),
      limitUnit: form.limitUnit,
      limitPeriod: form.limitPeriod,
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
              <div className="org-form-field" style={{ flex: '2 1 0%' }}>
                <label>Limit Value</label>
                <input type="number" min={0} value={form.limitValue} onChange={e => set('limitValue', Number(e.target.value))} />
              </div>
              <div className="org-form-field">
                <label>Unit</label>
                <select value={form.limitUnit} onChange={e => set('limitUnit', e.target.value as any)}>
                  <option value="hours">Hours</option>
                  <option value="minutes">Minutes</option>
                </select>
              </div>
              <div className="org-form-field">
                <label>Period</label>
                <select value={form.limitPeriod} onChange={e => set('limitPeriod', e.target.value as any)}>
                  <option value="yearly">Per Year</option>
                  <option value="monthly">Per Month</option>
                </select>
              </div>
            </div>
            <div className="org-form-field">
              <label>Accrual Method</label>
              <select value={form.accrualMethod} onChange={e => set('accrualMethod', e.target.value as FormAccrual)}>
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
              </select>
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
                      <label>Max Carry Forward ({form.limitUnit})</label>
                      <input type="number" min={0} value={form.maxCarryForwardValue} onChange={e => set('maxCarryForwardValue', Number(e.target.value))} />
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
                    <label>Maximum Consecutive ({form.limitUnit})</label>
                    <input value={form.maxConsecutiveDays} onChange={e => set('maxConsecutiveDays', e.target.value)} placeholder="Unlimited" />
                  </div>
                </div>
                <div className="org-form-field">
                  <label>Minimum Per Request ({form.limitUnit})</label>
                  <input type="number" min={0} step={0.5} value={form.minRequestValue} onChange={e => set('minRequestValue', Number(e.target.value))} />
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
                    <label>Document Required After ({form.limitUnit})</label>
                    <input
                      type="number"
                      min={1}
                      value={form.documentRequiredAfterValue}
                      onChange={e => set('documentRequiredAfterValue', e.target.value)}
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
