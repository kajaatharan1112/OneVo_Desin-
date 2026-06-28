import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { MOCK_ROLES } from '../../admin/adminMockData';
import { POSITION_VISIBILITY_OPTIONS } from '../../access/visibilityModel';
import { useChecklistTemplateStore } from '../../../store/checklistTemplateStore';
import { SEED_WORK_SCHEDULES } from '../../time-attendance/configuration/schedulesConfigMockData';
import { useLeaveConfigStore } from '../../../store/leaveConfigStore';
import { useOrganizationStore } from '../../../store/organizationStore';
import type {
  LeaveOverrideFormValues,
  OffboardingFormValues,
  PromotionFormValues,
  RoleOverrideFormValues,
  ScheduleOverrideFormValues,
  TransferFormValues
} from './employeeProfileTypes';
import { previewPositionContext, previewTransferManager, useEmployeeProfileStore } from './employeeProfileStore';
import type { Employee } from '../../../types/organization';
import { getEmployeeActiveAssignment } from '../../../utils/organizationUtils';
import { useActorAccess } from '../../access/useActorAccess';
import { PositionAccessSection } from '../../access/PositionAccessSection';
import type { GeneratedAccessGrant } from '../../access/accessTypes';
import { getPositionAccessTemplate } from '../../access/positionAccessConfigStore';

interface Props {
  employee: Employee;
}

export const EmployeeProfileModals: React.FC<Props> = ({ employee }) => {
  const { activeModal, closeModal } = useEmployeeProfileStore();
  if (!activeModal) return null;

  switch (activeModal) {
    case 'edit-profile':
      return <EditProfileModal employee={employee} onClose={closeModal} />;
    case 'promotion':
      return <PromotionModal employee={employee} onClose={closeModal} />;
    case 'transfer':
      return <TransferModal employee={employee} onClose={closeModal} />;
    case 'offboarding':
      return <OffboardingModal employee={employee} onClose={closeModal} />;
    case 'role-override':
      return <RoleOverrideModal employee={employee} onClose={closeModal} />;
    case 'leave-override':
      return <LeaveOverrideModal employee={employee} onClose={closeModal} />;
    case 'schedule-override':
      return <ScheduleOverrideModal employee={employee} onClose={closeModal} />;
    default:
      return null;
  }
};

const ModalShell: React.FC<{
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}> = ({ title, onClose, children, footer }) => (
  <div className="schedules-cfg-modal-overlay" onClick={onClose}>
    <div className="schedules-cfg-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
      <header className="schedules-cfg-modal__header">
        <h2>{title}</h2>
        <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </header>
      <div className="schedules-cfg-modal__body">{children}</div>
      <footer className="schedules-cfg-modal__footer">{footer}</footer>
    </div>
  </div>
);

const EditProfileModal: React.FC<{ employee: Employee; onClose: () => void }> = ({ employee, onClose }) => {
  const { updateEmployeePersonal } = useOrganizationStore();
  const [values, setValues] = useState({
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phone: employee.phone ?? ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const result = updateEmployeePersonal(employee.id, values);
    if (result.ok) useEmployeeProfileStore.getState().closeModal();
    else setError(result.error ?? 'Unable to save.');
  };

  return (
    <ModalShell
      title="Edit Profile"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="org-btn org-btn--primary" onClick={handleSave}>Save Changes</button>
        </>
      }
    >
      {error && <p className="schedules-cfg-form-error">{error}</p>}
      <div className="org-form-field"><label>First Name</label><input value={values.firstName} onChange={e => setValues(v => ({ ...v, firstName: e.target.value }))} /></div>
      <div className="org-form-field"><label>Last Name</label><input value={values.lastName} onChange={e => setValues(v => ({ ...v, lastName: e.target.value }))} /></div>
      <div className="org-form-field"><label>Email</label><input type="email" value={values.email} onChange={e => setValues(v => ({ ...v, email: e.target.value }))} /></div>
      <div className="org-form-field"><label>Phone</label><input value={values.phone} onChange={e => setValues(v => ({ ...v, phone: e.target.value }))} /></div>
    </ModalShell>
  );
};

const PromotionModal: React.FC<{ employee: Employee; onClose: () => void }> = ({ employee, onClose }) => {
  const { positions, assignments } = useOrganizationStore();
  const { promoteEmployee } = useEmployeeProfileStore();
  const { actorOrgEmployeeId, canManageAccess } = useActorAccess();
  const activeAssignment = getEmployeeActiveAssignment(employee.id, assignments);
  const currentPosition = activeAssignment
    ? positions.find(p => p.id === activeAssignment.positionId)
    : null;

  const [values, setValues] = useState<PromotionFormValues>({
    positionId: '',
    effectiveDate: new Date().toISOString().slice(0, 10),
    reason: '',
    reportingManager: '',
    departmentName: '',
    accessGrants: []
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (values.positionId) {
      const ctx = previewPositionContext(values.positionId);
      setValues(v => ({
        ...v,
        reportingManager: ctx.reportingManager,
        departmentName: ctx.departmentName
      }));
    }
  }, [values.positionId]);

  const handleSave = () => {
    const result = promoteEmployee(employee.id, values, actorOrgEmployeeId);
    if (!result.ok) setError(result.error ?? 'Unable to complete promotion.');
  };

  const selectablePositions = positions.filter(
    p => p.status === 'active' && p.id !== currentPosition?.id
  );

  const setAccessGrants = (grants: GeneratedAccessGrant[]) => {
    setValues(v => ({ ...v, accessGrants: grants }));
  };

  return (
    <ModalShell
      title="Promote Employee"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="org-btn org-btn--primary" onClick={handleSave}>
            {canManageAccess ? 'Promote Employee' : 'Submit Promotion Request'}
          </button>
        </>
      }
    >
      {error && <p className="schedules-cfg-form-error">{error}</p>}
      <div className="org-form-field">
        <label>Current Position</label>
        <input readOnly className="settings-readonly" value={currentPosition?.name ?? '—'} />
      </div>
      <div className="org-form-field">
        <label>New Position</label>
        <select value={values.positionId} onChange={e => setValues(v => ({ ...v, positionId: e.target.value }))}>
          <option value="">Select position…</option>
          {selectablePositions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="org-form-field">
        <label>Effective Date</label>
        <input type="date" value={values.effectiveDate} onChange={e => setValues(v => ({ ...v, effectiveDate: e.target.value }))} />
      </div>
      <div className="org-form-field">
        <label>Reason / Notes</label>
        <textarea rows={3} value={values.reason} onChange={e => setValues(v => ({ ...v, reason: e.target.value }))} />
      </div>
      <div className="org-form-field">
        <label>Reporting Manager</label>
        <input readOnly className="settings-readonly" value={values.reportingManager || '—'} />
      </div>
      <div className="org-form-field">
        <label>Department</label>
        <input readOnly className="settings-readonly" value={values.departmentName || '—'} />
      </div>

      {values.positionId && (
        <PositionAccessSection
          targetPositionId={values.positionId}
          canEdit={canManageAccess}
          grants={values.accessGrants ?? getPositionAccessTemplate(values.positionId)}
          onChange={setAccessGrants}
        />
      )}
    </ModalShell>
  );
};

const TransferModal: React.FC<{ employee: Employee; onClose: () => void }> = ({ employee, onClose }) => {
  const { departments, positions, assignments } = useOrganizationStore();
  const { transferEmployee } = useEmployeeProfileStore();
  const { actorOrgEmployeeId, canManageAccess } = useActorAccess();
  const activeAssignment = getEmployeeActiveAssignment(employee.id, assignments);
  const [values, setValues] = useState<TransferFormValues>({
    departmentId: '',
    positionId: activeAssignment?.positionId ?? '',
    effectiveDate: new Date().toISOString().slice(0, 10),
    reportingManager: '',
    reason: '',
    accessGrants: []
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (values.positionId) {
      const pos = positions.find(p => p.id === values.positionId);
      setValues(v => ({
        ...v,
        reportingManager: previewTransferManager(values.positionId),
        departmentId: pos?.departmentId ?? v.departmentId
      }));
    }
  }, [values.positionId, positions]);

  const handleSave = () => {
    const result = transferEmployee(employee.id, values, actorOrgEmployeeId);
    if (!result.ok) setError(result.error ?? 'Unable to transfer.');
  };

  const filteredPositions = values.departmentId
    ? positions.filter(p => p.status === 'active' && p.departmentId === values.departmentId)
    : positions.filter(p => p.status === 'active');

  const setAccessGrants = (grants: GeneratedAccessGrant[]) => {
    setValues(v => ({ ...v, accessGrants: grants }));
  };

  return (
    <ModalShell
      title="Transfer Employee"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="org-btn org-btn--primary" onClick={handleSave}>
            {canManageAccess ? 'Transfer Employee' : 'Submit Transfer Request'}
          </button>
        </>
      }
    >
      {error && <p className="schedules-cfg-form-error">{error}</p>}
      <div className="org-form-field">
        <label>New Department</label>
        <select value={values.departmentId} onChange={e => setValues(v => ({ ...v, departmentId: e.target.value, positionId: '' }))}>
          <option value="">Select department…</option>
          {departments.filter(d => d.status === 'active').map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>
      <div className="org-form-field">
        <label>New Position</label>
        <select value={values.positionId} onChange={e => setValues(v => ({ ...v, positionId: e.target.value }))}>
          <option value="">Select position…</option>
          {filteredPositions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="org-form-field">
        <label>Effective Date</label>
        <input type="date" value={values.effectiveDate} onChange={e => setValues(v => ({ ...v, effectiveDate: e.target.value }))} />
      </div>
      <div className="org-form-field">
        <label>New Reporting Manager</label>
        <input readOnly className="settings-readonly" value={values.reportingManager || '—'} />
      </div>
      <div className="org-form-field">
        <label>Reason</label>
        <textarea rows={3} value={values.reason} onChange={e => setValues(v => ({ ...v, reason: e.target.value }))} />
      </div>

      {values.positionId && (
        <PositionAccessSection
          targetPositionId={values.positionId}
          canEdit={canManageAccess}
          grants={values.accessGrants ?? getPositionAccessTemplate(values.positionId)}
          onChange={setAccessGrants}
        />
      )}
    </ModalShell>
  );
};

const OffboardingModal: React.FC<{ employee: Employee; onClose: () => void }> = ({ employee, onClose }) => {
  const { startOffboarding } = useEmployeeProfileStore();
  const templates = useChecklistTemplateStore(state => state.templates)
    .filter(template => template.type === 'offboarding' && template.status === 'active');
  const [values, setValues] = useState<OffboardingFormValues>({
    lastWorkingDay: '',
    templateId: templates[0]?.id ?? '',
    reason: '',
    notifyManager: true,
    disableAccessOnLastDay: true
  });
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const result = startOffboarding(employee.id, values);
    if (!result.ok) setError(result.error ?? 'Unable to start offboarding.');
  };

  return (
    <ModalShell
      title="Start Offboarding"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="org-btn org-btn--primary" onClick={handleSave}>Start Offboarding</button>
        </>
      }
    >
      {error && <p className="schedules-cfg-form-error">{error}</p>}
      <div className="org-form-field">
        <label>Last Working Day</label>
        <input type="date" value={values.lastWorkingDay} onChange={e => setValues(v => ({ ...v, lastWorkingDay: e.target.value }))} />
      </div>
      <div className="org-form-field">
        <label>Offboarding Template</label>
        <select value={values.templateId} onChange={e => setValues(v => ({ ...v, templateId: e.target.value }))}>
          {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div className="org-form-field">
        <label>Reason</label>
        <textarea rows={3} value={values.reason} onChange={e => setValues(v => ({ ...v, reason: e.target.value }))} />
      </div>
      <label className="cip-toggle-row">
        <input type="checkbox" checked={values.notifyManager} onChange={e => setValues(v => ({ ...v, notifyManager: e.target.checked }))} />
        Notify Reporting Manager
      </label>
      <label className="cip-toggle-row">
        <input type="checkbox" checked={values.disableAccessOnLastDay} onChange={e => setValues(v => ({ ...v, disableAccessOnLastDay: e.target.checked }))} />
        Disable access on last working day
      </label>
    </ModalShell>
  );
};

const RoleOverrideModal: React.FC<{ employee: Employee; onClose: () => void }> = ({ employee, onClose }) => {
  const { addRoleOverride } = useEmployeeProfileStore();
  const [values, setValues] = useState<RoleOverrideFormValues>({
    roleId: '',
    scope: 'own',
    effectiveFrom: new Date().toISOString().slice(0, 10),
    effectiveTo: '',
    noEndDate: true,
    reason: ''
  });
  const [error, setError] = useState<string | null>(null);

  return (
    <ModalShell
      title="Add Role Override"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="org-btn org-btn--primary" onClick={() => {
            const r = addRoleOverride(employee.id, values);
            if (!r.ok) setError(r.error ?? 'Unable to add override.');
          }}>Add Override</button>
        </>
      }
    >
      {error && <p className="schedules-cfg-form-error">{error}</p>}
      <div className="org-form-field">
        <label>Role</label>
        <select value={values.roleId} onChange={e => setValues(v => ({ ...v, roleId: e.target.value }))}>
          <option value="">Select role…</option>
          {MOCK_ROLES.filter(r => r.active).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>
      <div className="org-form-field">
        <label>Visibility</label>
        <select value={values.scope} onChange={e => setValues(v => ({ ...v, scope: e.target.value as RoleOverrideFormValues['scope'] }))}>
          {POSITION_VISIBILITY_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="org-form-field">
        <label>Effective From</label>
        <input type="date" value={values.effectiveFrom} onChange={e => setValues(v => ({ ...v, effectiveFrom: e.target.value }))} />
      </div>
      <label className="cip-toggle-row">
        <input type="checkbox" checked={values.noEndDate} onChange={e => setValues(v => ({ ...v, noEndDate: e.target.checked }))} />
        No end date
      </label>
      {!values.noEndDate && (
        <div className="org-form-field">
          <label>Effective To</label>
          <input type="date" value={values.effectiveTo} onChange={e => setValues(v => ({ ...v, effectiveTo: e.target.value }))} />
        </div>
      )}
      <div className="org-form-field">
        <label>Reason</label>
        <textarea rows={2} value={values.reason} onChange={e => setValues(v => ({ ...v, reason: e.target.value }))} />
      </div>
    </ModalShell>
  );
};

const LeaveOverrideModal: React.FC<{ employee: Employee; onClose: () => void }> = ({ employee, onClose }) => {
  const { policies } = useLeaveConfigStore();
  const { addLeaveOverride } = useEmployeeProfileStore();
  const [values, setValues] = useState<LeaveOverrideFormValues>({
    policyId: '',
    effectiveFrom: new Date().toISOString().slice(0, 10),
    effectiveTo: '',
    noEndDate: true,
    reason: ''
  });
  const [error, setError] = useState<string | null>(null);

  return (
    <ModalShell
      title="Add Leave Policy Override"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="org-btn org-btn--primary" onClick={() => {
            const r = addLeaveOverride(employee.id, values);
            if (!r.ok) setError(r.error ?? 'Unable to add override.');
          }}>Add Override</button>
        </>
      }
    >
      {error && <p className="schedules-cfg-form-error">{error}</p>}
      <div className="org-form-field">
        <label>Leave Policy</label>
        <select value={values.policyId} onChange={e => setValues(v => ({ ...v, policyId: e.target.value }))}>
          <option value="">Select policy…</option>
          {policies.filter(p => p.status === 'active').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="org-form-field">
        <label>Effective From</label>
        <input type="date" value={values.effectiveFrom} onChange={e => setValues(v => ({ ...v, effectiveFrom: e.target.value }))} />
      </div>
      <label className="cip-toggle-row">
        <input type="checkbox" checked={values.noEndDate} onChange={e => setValues(v => ({ ...v, noEndDate: e.target.checked }))} />
        No end date
      </label>
      {!values.noEndDate && (
        <div className="org-form-field">
          <label>Effective To</label>
          <input type="date" value={values.effectiveTo} onChange={e => setValues(v => ({ ...v, effectiveTo: e.target.value }))} />
        </div>
      )}
      <div className="org-form-field">
        <label>Reason</label>
        <textarea rows={2} value={values.reason} onChange={e => setValues(v => ({ ...v, reason: e.target.value }))} />
      </div>
    </ModalShell>
  );
};

const ScheduleOverrideModal: React.FC<{ employee: Employee; onClose: () => void }> = ({ employee, onClose }) => {
  const { addScheduleOverride } = useEmployeeProfileStore();
  const [values, setValues] = useState<ScheduleOverrideFormValues>({
    scheduleId: '',
    effectiveFrom: new Date().toISOString().slice(0, 10),
    effectiveTo: '',
    noEndDate: true,
    reason: ''
  });
  const [error, setError] = useState<string | null>(null);

  return (
    <ModalShell
      title="Add Schedule Override"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="org-btn org-btn--primary" onClick={() => {
            const r = addScheduleOverride(employee.id, values);
            if (!r.ok) setError(r.error ?? 'Unable to add override.');
          }}>Add Override</button>
        </>
      }
    >
      {error && <p className="schedules-cfg-form-error">{error}</p>}
      <div className="org-form-field">
        <label>Work Schedule</label>
        <select value={values.scheduleId} onChange={e => setValues(v => ({ ...v, scheduleId: e.target.value }))}>
          <option value="">Select schedule…</option>
          {SEED_WORK_SCHEDULES.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
      </div>
      <div className="org-form-field">
        <label>Effective From</label>
        <input type="date" value={values.effectiveFrom} onChange={e => setValues(v => ({ ...v, effectiveFrom: e.target.value }))} />
      </div>
      <label className="cip-toggle-row">
        <input type="checkbox" checked={values.noEndDate} onChange={e => setValues(v => ({ ...v, noEndDate: e.target.checked }))} />
        No end date
      </label>
      {!values.noEndDate && (
        <div className="org-form-field">
          <label>Effective To</label>
          <input type="date" value={values.effectiveTo} onChange={e => setValues(v => ({ ...v, effectiveTo: e.target.value }))} />
        </div>
      )}
      <div className="org-form-field">
        <label>Reason</label>
        <textarea rows={2} value={values.reason} onChange={e => setValues(v => ({ ...v, reason: e.target.value }))} />
      </div>
    </ModalShell>
  );
};
