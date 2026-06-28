import React, { useEffect } from 'react';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { SettingsPageHeader } from '../../settings/components/SettingsPageHeader';
import { useClockInPolicyStore } from './clockInPolicyStore';
import { ExemptionFormModal } from './ExemptionFormModal';
import { OutageFallbackFormModal } from './OutageFallbackFormModal';
import { LateAttendancePolicyFormModal } from './LateAttendancePolicyFormModal';
import { useEmployeeContext } from '../../../features/employees/context/employee-context';
import { useLeaveConfigStore } from '../../../store/leaveConfigStore';
import {
  chipStateLabel,
  clockInRequirementSummary,
  exemptionPeriodSummary,
  exemptionScopeSummary,
  formatOutageRange,
  photoChipLabel,
  webChipOn
} from './clockInPolicyUtils';
import type { MethodState, PhotoRequired, WorkTypeRule } from './clockInPolicyTypes';

const ClockInPolicyToast: React.FC = () => {
  const { toast, clearToast } = useClockInPolicyStore();
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 3500);
    return () => clearTimeout(t);
  }, [toast, clearToast]);
  if (!toast) return null;
  return (
    <div className="schedules-cfg-toast" role="status">
      {toast}
      <button type="button" onClick={clearToast} aria-label="Dismiss">×</button>
    </div>
  );
};

function cycleWeb(current: MethodState): MethodState {
  if (current === 'disabled') return 'optional';
  if (current === 'optional') return 'enabled';
  return 'disabled';
}

function cyclePhoto(current: PhotoRequired): PhotoRequired {
  if (current === 'no') return 'yes';
  if (current === 'yes') return 'optional';
  return 'no';
}

interface MethodChipProps {
  label: string;
  state: string;
  active: boolean;
  onClick: () => void;
}

const MethodChip: React.FC<MethodChipProps> = ({ label, state, active, onClick }) => (
  <button
    type="button"
    className={`cip-chip${active ? ' cip-chip--on' : ' cip-chip--off'}`}
    onClick={onClick}
    aria-pressed={active}
  >
    <span className="cip-chip__label">{label}</span>
    <span className="cip-chip__state">{state}</span>
  </button>
);

const WorkTypeRuleRow: React.FC<{
  rule: WorkTypeRule;
  onUpdate: (patch: Partial<WorkTypeRule>) => void;
 }> = ({ rule, onUpdate }) => (
  <div className="cip-policy-row">
    <div className="cip-policy-row__main">
      <div className="cip-policy-row__title">{rule.workType}</div>
      <div className="cip-policy-row__desc">{rule.notes}</div>
    </div>
    <div className="cip-policy-row__chips">
      <MethodChip
        label="Biometric"
        state={chipStateLabel(rule.biometric)}
        active={rule.biometric}
        onClick={() => onUpdate({ biometric: !rule.biometric })}
      />
      <MethodChip
        label="Web"
        state={chipStateLabel(webChipOn(rule.web))}
        active={webChipOn(rule.web)}
        onClick={() => onUpdate({ web: cycleWeb(rule.web) })}
      />
      <MethodChip
        label="Tray App"
        state={chipStateLabel(rule.trayApp)}
        active={rule.trayApp}
        onClick={() => onUpdate({ trayApp: !rule.trayApp })}
      />
      <MethodChip
        label="Photo Required"
        state={photoChipLabel(rule.photoRequired)}
        active={rule.photoRequired !== 'no'}
        onClick={() => onUpdate({ photoRequired: cyclePhoto(rule.photoRequired) })}
      />
    </div>
  </div>
);

export const ClockInPolicyPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const {
    defaultRequirement,
    workTypeRules,
    exemptions,
    exemptionForm,
    outageFallbackEnabled,
    outageForm,
    outageFallbacks,
    manualCorrection,
    lateAttendancePolicy,
    lateAttendanceForm,
    setDefaultRequirement,
    updateWorkTypeRule,
    setOutageFallbackEnabled,
    openOutageForm,
    resolveOutageFallback,
    setManualCorrection,
    openCreateExemption,
    openEditExemption,
    deleteExemption,
    openLateAttendanceForm,
    deleteLateAttendancePolicy,
    savePolicy
  } = useClockInPolicyStore();

  const { selectedEmployee } = useEmployeeContext();
  const isManagerOrCeo = selectedEmployee.role === 'Chief Executive Officer' || selectedEmployee.role === 'Manager';

  const leaveTypes = useLeaveConfigStore(s => s.leaveTypes);
  const deductFromLeaveType = leaveTypes.find(t => t.id === lateAttendancePolicy.deductFromLeaveTypeId);
  const leaveTypeName = deductFromLeaveType ? deductFromLeaveType.name : 'Annual Leave';

  const getCalculationRuleLabel = (method: string) => {
    if (method === 'actual_minutes') return 'Actual Minutes';
    if (method === 'double_minutes') return 'Double Late Minutes';
    if (method === 'triple_minutes') return 'Triple Late Minutes';
    return 'Actual Minutes';
  };

  return (
    <div className="cfg-page cip-page">
      <SettingsPageHeader
        title="Clock-in Policy"
        description="Configure attendance capture rules, clock-in methods, and exemptions."
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {onBack && (
              <button type="button" className="org-btn org-btn--secondary" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowLeft size={14} /> Back
              </button>
            )}
            <button type="button" className="org-btn org-btn--primary" onClick={savePolicy}>
              Save Changes
            </button>
          </div>
        }
      />

      <div className="cip-body">
        <section className="cip-section">
          <h2 className="cip-section__title">Default Rule</h2>
          <div className="cip-setting-block">
            <div className="cip-setting-block__label">Default clock-in requirement</div>
            <div className="leave-cfg-segmented cip-segmented">
              <button
                type="button"
                className={`leave-cfg-segmented__btn${defaultRequirement === 'required' ? ' leave-cfg-segmented__btn--active' : ''}`}
                onClick={() => setDefaultRequirement('required')}
              >
                Required
              </button>
              <button
                type="button"
                className={`leave-cfg-segmented__btn${defaultRequirement === 'not-required' ? ' leave-cfg-segmented__btn--active' : ''}`}
                onClick={() => setDefaultRequirement('not-required')}
              >
                Not required
              </button>
            </div>
            <p className="cip-hint">This applies unless a more specific exemption exists.</p>
          </div>
        </section>

        <section className="cip-section">
          <h2 className="cip-section__title">Work Type Rules</h2>
          <div className="cip-policy-list">
            {workTypeRules.map(rule => (
              <WorkTypeRuleRow
                key={rule.id}
                rule={rule}
                onUpdate={patch => updateWorkTypeRule(rule.id, patch)}
              />
            ))}
          </div>
        </section>

        <section className="cip-section">
          <div className="cip-section__header">
            <h2 className="cip-section__title">Clock-in Exemptions</h2>
            <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={openCreateExemption}>
              <Plus size={13} /> Add Exemption
            </button>
          </div>
          <p className="cip-hint cip-hint--inline">
            Exempt employees are not required to clock in and will not be marked absent for missing clock-in.
          </p>
          <div className="cip-exemption-list">
            {exemptions.map(exemption => (
              <div key={exemption.id} className="cip-exemption-row">
                <div className="cip-exemption-row__content">
                  <div className="cip-exemption-row__name">{exemption.name}</div>
                  <div className="cip-exemption-row__meta">{exemptionScopeSummary(exemption)}</div>
                  <div className="cip-exemption-row__meta">
                    {clockInRequirementSummary(exemption.clockInRequired)}
                  </div>
                  <div className="cip-exemption-row__meta">{exemptionPeriodSummary(exemption)}</div>
                </div>
                <div className="cip-exemption-row__aside">
                  <span className={`cfg-badge cfg-badge--${exemption.status}`}>{exemption.status}</span>
                  <div className="cip-exemption-row__actions">
                    <button
                      type="button"
                      className="cip-icon-btn"
                      onClick={() => openEditExemption(exemption.id)}
                      aria-label={`Edit ${exemption.name}`}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      type="button"
                      className="cip-icon-btn cip-icon-btn--danger"
                      onClick={() => {
                        if (window.confirm(`Remove "${exemption.name}"?`)) deleteExemption(exemption.id);
                      }}
                      aria-label={`Delete ${exemption.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="cip-section">
          <h2 className="cip-section__title">Biometric Outage Fallback</h2>
          <div className="cip-setting-block">
            <label className="cip-toggle-row">
              <input
                type="checkbox"
                checked={outageFallbackEnabled}
                onChange={e => setOutageFallbackEnabled(e.target.checked)}
              />
              <span>Allow temporary web/tray fallback during biometric outage</span>
            </label>
          </div>

          {outageFallbackEnabled && (
            <>
              <div className="cip-section__subaction">
                <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={openOutageForm}>
                  <Plus size={13} /> Add Outage Fallback
                </button>
              </div>
              <div className="cip-outage-list">
                {outageFallbacks.map(outage => (
                  <div key={outage.id} className="cip-outage-row">
                    <div className="cip-outage-row__content">
                      <div className="cip-outage-row__title">{outage.appliesToLabel}</div>
                      <div className="cip-outage-row__meta">{outage.reason}</div>
                      <div className="cip-outage-row__meta">
                        {formatOutageRange(outage.startsAt, outage.endsAt)}
                      </div>
                      <div className="cip-outage-row__meta">
                        <span className={`cfg-badge cfg-badge--${outage.status}`}>{outage.status}</span>
                        <span className="cip-outage-row__by">Enabled by {outage.enabledBy}</span>
                      </div>
                    </div>
                    {outage.status === 'active' && (
                      <button
                        type="button"
                        className="org-btn org-btn--secondary org-btn--sm"
                        onClick={() => resolveOutageFallback(outage.id)}
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
        <section className="cip-section">
          <h2 className="cip-section__title">Late Attendance Policy</h2>
          <p className="cip-hint cip-hint--inline">
            Define deduction rules for employees arriving late relative to their shift start times.
          </p>
          <div className="cip-exemption-list">
            {lateAttendancePolicy.active ? (
              <div className="cip-exemption-row">
                <div className="cip-exemption-row__content">
                  <div className="cip-exemption-row__name">Late Attendance Policy</div>
                  <div className="cip-exemption-row__meta">
                    Grace Period: {lateAttendancePolicy.gracePeriod} {lateAttendancePolicy.gracePeriodUnit}
                  </div>
                  <div className="cip-exemption-row__meta">
                    Deduct From: {leaveTypeName}
                  </div>
                  <div className="cip-exemption-row__meta">
                    Calculation Rule: {getCalculationRuleLabel(lateAttendancePolicy.deductionCalculationMethod)}
                  </div>
                </div>
                <div className="cip-exemption-row__aside">
                  <span className="cfg-badge cfg-badge--active">Active</span>
                  {isManagerOrCeo && (
                    <div className="cip-exemption-row__actions">
                      <button
                        type="button"
                        className="cip-icon-btn"
                        onClick={openLateAttendanceForm}
                        aria-label="Edit Late Attendance Policy"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        className="cip-icon-btn cip-icon-btn--danger"
                        onClick={() => {
                          if (window.confirm('Deactivate late attendance policy?')) {
                            deleteLateAttendancePolicy();
                          }
                        }}
                        aria-label="Delete Late Attendance Policy"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="cip-exemption-row">
                <div className="cip-exemption-row__content">
                  <div className="cip-exemption-row__name" style={{ color: 'var(--nexus-text-muted)' }}>
                    No active late attendance policy configured.
                  </div>
                </div>
                {isManagerOrCeo && (
                  <div className="cip-exemption-row__aside">
                    <button
                      type="button"
                      className="org-btn org-btn--secondary org-btn--sm"
                      onClick={openLateAttendanceForm}
                    >
                      Configure Policy
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="cip-section">
          <h2 className="cip-section__title">Manual Correction Policy</h2>
          <div className="cip-toggle-list">
            <label className="cip-toggle-row">
              <input
                type="checkbox"
                checked={manualCorrection.allowRequests}
                onChange={e => setManualCorrection({ allowRequests: e.target.checked })}
              />
              <span>Allow employees to request attendance correction</span>
            </label>
            <label className="cip-toggle-row">
              <input
                type="checkbox"
                checked={manualCorrection.requireManagerApproval}
                onChange={e => setManualCorrection({ requireManagerApproval: e.target.checked })}
              />
              <span>Require manager approval</span>
            </label>
            <label className="cip-toggle-row">
              <input
                type="checkbox"
                checked={manualCorrection.requireReason}
                onChange={e => setManualCorrection({ requireReason: e.target.checked })}
              />
              <span>Require reason</span>
            </label>
            <label className="cip-toggle-row">
              <input
                type="checkbox"
                checked={manualCorrection.allowAttachment}
                onChange={e => setManualCorrection({ allowAttachment: e.target.checked })}
              />
              <span>Allow attachment/evidence</span>
            </label>
          </div>
          <p className="cip-hint">
            Correction requests are submitted and reviewed from the Attendance screen.
          </p>
        </section>
      </div>

      {exemptionForm.open && <ExemptionFormModal />}
      {outageForm.open && <OutageFallbackFormModal />}
      {lateAttendanceForm.open && <LateAttendancePolicyFormModal />}
      <ClockInPolicyToast />
    </div>
  );
};
