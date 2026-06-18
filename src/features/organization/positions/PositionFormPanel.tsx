import React, { useEffect, useMemo, useState } from 'react';
import { Info, X } from 'lucide-react';
import { MOCK_ROLES, GRANTABLE_PERMISSIONS } from '../../admin/adminMockData';
import { useOrganizationStore } from '../../../store/organizationStore';
import { usePositionAccessConfigStore } from '../../access/positionAccessConfigStore';
import { POSITION_ACCESS_AREA_OPTIONS } from '../../access/visibilityModel';
import type { EmployeeAccessArea } from '../../access/visibilityModel';
import { scopeLabel } from '../../access/accessUtils';
import {
  getValidReportingTargets,
  isPositionCodeUnique,
  suggestDepartmentCode
} from '../../../utils/organizationUtils';
import type { EntityStatus, PositionType } from '../../../types/organization';

interface PositionFormPanelProps {
  onClose: () => void;
}

const reportsToHelp =
  'This controls where the position sits in the organization chart and who employees in this position report through. Approval routing follows this chain unless a Flow automation overrides it.';

const accessAreaHelp =
  'This controls which employee records the position holder can see or manage after the role is granted.';

const approvalHelp =
  'When enabled, access is not applied immediately. A position access approval request is created first.';

function rolePermissionCodes(roleId: string): string[] {
  const role = MOCK_ROLES.find(r => r.id === roleId);
  if (!role) return [];
  return role.permissionIds
    .map(pid => GRANTABLE_PERMISSIONS.find(p => p.id === pid)?.code)
    .filter((c): c is string => Boolean(c));
}

function toggleId(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter(item => item !== id) : [...list, id];
}

export const PositionFormPanel: React.FC<PositionFormPanelProps> = ({ onClose }) => {
  const { positionForm, positions, departments, savePosition } = useOrganizationStore();
  const { getConfig, setConfig, clearConfig } = usePositionAccessConfigStore();

  const existing = positionForm.positionId
    ? positions.find(p => p.id === positionForm.positionId)
    : null;

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [codeTouched, setCodeTouched] = useState(false);
  const [departmentId, setDepartmentId] = useState('');
  const [reportsToId, setReportsToId] = useState<string | null>(null);
  const [type, setType] = useState<PositionType>('unique');
  const [capacity, setCapacity] = useState(1);
  const [status, setStatus] = useState<EntityStatus>('active');
  const [grantSystemAccess, setGrantSystemAccess] = useState(false);
  const [accessRoleId, setAccessRoleId] = useState('');
  const [accessArea, setAccessArea] = useState<EmployeeAccessArea>('none');
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([]);
  const [selectedPositionIds, setSelectedPositionIds] = useState<string[]>([]);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = positionForm.mode === 'edit';

  useEffect(() => {
    if (isEdit && existing) {
      const cfg = getConfig(existing.id);
      setName(existing.name);
      setCode(existing.code);
      setCodeTouched(true);
      setDepartmentId(existing.departmentId);
      setReportsToId(existing.reportsToPositionId);
      setType(existing.type);
      setCapacity(existing.capacity);
      setStatus(existing.status);
      setGrantSystemAccess(Boolean(cfg?.enabled && cfg.roleId));
      setAccessRoleId(cfg?.roleId ?? '');
      setAccessArea(cfg?.accessArea ?? 'none');
      setSelectedDepartmentIds(cfg?.departmentIds ?? []);
      setSelectedPositionIds(cfg?.positionIds ?? []);
      setRequiresApproval(cfg?.requiresApproval ?? false);
    } else {
      setName('');
      setCode('');
      setCodeTouched(false);
      setDepartmentId(positionForm.departmentId ?? '');
      setReportsToId(positionForm.reportsToPositionId);
      setType('unique');
      setCapacity(1);
      setStatus('active');
      setGrantSystemAccess(false);
      setAccessRoleId('');
      setAccessArea('none');
      setSelectedDepartmentIds([]);
      setSelectedPositionIds([]);
      setRequiresApproval(false);
    }
    setError(null);
  }, [positionForm, existing, isEdit, getConfig]);

  useEffect(() => {
    if (!codeTouched && name) {
      setCode(suggestDepartmentCode(name));
    }
  }, [name, codeTouched]);

  useEffect(() => {
    if (type === 'unique') setCapacity(1);
  }, [type]);

  const activeDepartments = useMemo(
    () => departments.filter(d => d.status === 'active'),
    [departments]
  );

  const activePositions = useMemo(
    () => positions.filter(p => p.status === 'active'),
    [positions]
  );

  const reportingTargets = useMemo(
    () => getValidReportingTargets(positionForm.positionId, positions),
    [positionForm.positionId, positions]
  );

  const parentPosition = reportsToId ? positions.find(p => p.id === reportsToId) : null;
  const selectedRole = accessRoleId ? MOCK_ROLES.find(r => r.id === accessRoleId) : null;
  const selectedDepartmentNames = selectedDepartmentIds
    .map(id => departments.find(d => d.id === id)?.name)
    .filter((value): value is string => Boolean(value));
  const selectedPositionNames = selectedPositionIds
    .map(id => positions.find(p => p.id === id)?.name)
    .filter((value): value is string => Boolean(value));

  const resultSentence = useMemo(() => {
    if (!selectedRole) return '';
    const approvalSuffix = requiresApproval ? ' after approval' : '';
    if (accessArea === 'organization') {
      return `People assigned to this position will receive ${selectedRole.name} access across the company${approvalSuffix}.`;
    }
    if (accessArea === 'selected_departments') {
      return `People assigned to this position will receive ${selectedRole.name} access over employees in ${selectedDepartmentNames.join(' and ')}${approvalSuffix}.`;
    }
    if (accessArea === 'selected_positions') {
      return `People assigned to this position will receive ${selectedRole.name} access over employees assigned to ${selectedPositionNames.join(' and ')}${approvalSuffix}.`;
    }
    return `People assigned to this position receive the ${selectedRole.name} role, but no employee visibility is added by this template.`;
  }, [accessArea, requiresApproval, selectedDepartmentNames, selectedPositionNames, selectedRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (grantSystemAccess) {
      if (!accessRoleId) {
        setError('Select a role to grant.');
        return;
      }
      if (accessArea === 'selected_departments' && selectedDepartmentIds.length === 0) {
        setError('Select at least one department.');
        return;
      }
      if (accessArea === 'selected_positions' && selectedPositionIds.length === 0) {
        setError('Select at least one position.');
        return;
      }
    }

    const result = savePosition({
      id: positionForm.positionId ?? undefined,
      name,
      code,
      departmentId,
      reportsToPositionId: reportsToId,
      type,
      capacity,
      status
    });

    if (!result.ok) {
      setError(result.error ?? 'Failed to save position.');
      return;
    }

    const posId =
      positionForm.positionId ??
      useOrganizationStore.getState().positions.find(p => p.code === code.trim().toUpperCase())?.id;

    if (!posId) return;

    if (!grantSystemAccess) {
      clearConfig(posId);
      return;
    }

    const role = MOCK_ROLES.find(r => r.id === accessRoleId);
    if (!role) return;

    setConfig(posId, {
      enabled: true,
      roleId: role.id,
      roleName: role.name,
      accessArea,
      departmentIds: accessArea === 'selected_departments' ? selectedDepartmentIds : undefined,
      departmentNames: accessArea === 'selected_departments' ? selectedDepartmentNames : undefined,
      positionIds: accessArea === 'selected_positions' ? selectedPositionIds : undefined,
      positionNames: accessArea === 'selected_positions' ? selectedPositionNames : undefined,
      requiresApproval,
      permissionCodes: rolePermissionCodes(role.id)
    });
  };

  return (
    <>
      <div className="org-slideover-backdrop" onClick={onClose} aria-hidden />
      <aside className="org-slideover" role="dialog" aria-label={isEdit ? 'Edit position' : 'Add position'}>
        <header className="org-slideover__header">
          <h2>{isEdit ? 'Edit Position' : 'Add Position'}</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <form className="org-slideover__body" onSubmit={handleSubmit}>
          {error && <div className="org-form-error" role="alert">{error}</div>}

          <div className="org-form-field">
            <label htmlFor="pos-name">Position Name *</label>
            <input id="pos-name" type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div className="org-form-field">
            <label htmlFor="pos-code">Position Code *</label>
            <input
              id="pos-code"
              type="text"
              value={code}
              onChange={e => {
                setCodeTouched(true);
                setCode(e.target.value.toUpperCase());
              }}
              required
            />
            {!isPositionCodeUnique(code, positions, positionForm.positionId ?? undefined) && code && (
              <p className="org-form-hint org-form-hint--error">Code must be unique.</p>
            )}
          </div>

          <div className="org-form-field">
            <label htmlFor="pos-dept">Department *</label>
            <select id="pos-dept" value={departmentId} onChange={e => setDepartmentId(e.target.value)} required>
              <option value="">Select department</option>
              {activeDepartments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="org-form-field">
            <label htmlFor="pos-reports" className="org-label-with-info">
              Reports To
              <span className="org-info-icon" aria-label={reportsToHelp} title={reportsToHelp}>
                <Info size={13} />
              </span>
            </label>
            <select
              id="pos-reports"
              value={reportsToId ?? ''}
              onChange={e => setReportsToId(e.target.value || null)}
            >
              <option value="">None (root position)</option>
              {reportingTargets.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>
            {parentPosition && (
              <p className="org-form-hint">
                Will report to {parentPosition.name} in {activeDepartments.find(d => d.id === parentPosition.departmentId)?.name}
              </p>
            )}
          </div>

          <div className="org-form-field">
            <label htmlFor="pos-type">Type</label>
            <select id="pos-type" value={type} onChange={e => setType(e.target.value as PositionType)}>
              <option value="unique">Unique (capacity 1)</option>
              <option value="pooled">Pooled</option>
            </select>
          </div>

          {type === 'pooled' && (
            <div className="org-form-field">
              <label htmlFor="pos-capacity">Capacity</label>
              <input
                id="pos-capacity"
                type="number"
                min={1}
                value={capacity}
                onChange={e => setCapacity(Math.max(1, Number(e.target.value)))}
              />
            </div>
          )}

          <div className="org-form-field">
            <label htmlFor="pos-status">Status</label>
            <select id="pos-status" value={status} onChange={e => setStatus(e.target.value as EntityStatus)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <label className="position-access-toggle">
            <input
              type="checkbox"
              checked={grantSystemAccess}
              onChange={e => setGrantSystemAccess(e.target.checked)}
            />
            Grant system access from this position
          </label>

          {grantSystemAccess && (
            <div className="schedules-cfg-form-section position-access-config">
              <label className="schedules-cfg-form-section__label">Access from this position</label>
              <p className="org-form-hint">
                People assigned to this position can receive a role and employee access from this template.
              </p>

              <div className="org-form-field">
                <label htmlFor="pos-access-role">Role granted</label>
                <select id="pos-access-role" value={accessRoleId} onChange={e => setAccessRoleId(e.target.value)}>
                  <option value="">Select role</option>
                  {MOCK_ROLES.filter(r => r.active).map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="org-form-field">
                <label htmlFor="pos-access-area" className="org-label-with-info">
                  Can access employees in
                  <span className="org-info-icon" aria-label={accessAreaHelp} title={accessAreaHelp}>
                    <Info size={13} />
                  </span>
                </label>
                <select
                  id="pos-access-area"
                  value={accessArea}
                  onChange={e => {
                    setAccessArea(e.target.value as EmployeeAccessArea);
                    setSelectedDepartmentIds([]);
                    setSelectedPositionIds([]);
                  }}
                >
                  {POSITION_ACCESS_AREA_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {accessArea === 'selected_departments' && (
                <div className="position-access-multi" role="group" aria-label="Selected departments">
                  {activeDepartments.map(d => (
                    <label key={d.id} className="position-access-multi__item">
                      <input
                        type="checkbox"
                        checked={selectedDepartmentIds.includes(d.id)}
                        onChange={() => setSelectedDepartmentIds(ids => toggleId(ids, d.id))}
                      />
                      {d.name}
                    </label>
                  ))}
                </div>
              )}

              {accessArea === 'selected_positions' && (
                <div className="position-access-multi" role="group" aria-label="Selected positions">
                  {activePositions.map(p => (
                    <label key={p.id} className="position-access-multi__item">
                      <input
                        type="checkbox"
                        checked={selectedPositionIds.includes(p.id)}
                        onChange={() => setSelectedPositionIds(ids => toggleId(ids, p.id))}
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              )}

              <label className="position-access-toggle">
                <input
                  type="checkbox"
                  checked={requiresApproval}
                  onChange={e => setRequiresApproval(e.target.checked)}
                />
                Requires approval before access is applied
                <span className="org-info-icon" aria-label={approvalHelp} title={approvalHelp}>
                  <Info size={13} />
                </span>
              </label>

              {selectedRole && (
                <div className="org-form-preview position-access-preview">
                  <span className="org-form-preview__label">Access preview</span>
                  <dl>
                    <div><dt>Role granted</dt><dd>{selectedRole.name}</dd></div>
                    <div><dt>Can access employees in</dt><dd>{scopeLabel(accessArea)}</dd></div>
                    {accessArea === 'selected_departments' && (
                      <div><dt>Departments</dt><dd>{selectedDepartmentNames.join(', ') || 'None selected'}</dd></div>
                    )}
                    {accessArea === 'selected_positions' && (
                      <div><dt>Positions</dt><dd>{selectedPositionNames.join(', ') || 'None selected'}</dd></div>
                    )}
                    <div><dt>Approval</dt><dd>{requiresApproval ? 'Required' : 'Not required'}</dd></div>
                  </dl>
                  <p>{resultSentence}</p>
                </div>
              )}
            </div>
          )}

          <footer className="org-slideover__footer">
            <button type="button" className="org-btn org-btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="org-btn org-btn--primary">
              {isEdit ? 'Save Changes' : 'Create Position'}
            </button>
          </footer>
        </form>
      </aside>
    </>
  );
};
