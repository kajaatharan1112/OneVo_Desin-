import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, BriefcaseBusiness, Building2, Info, Plus, Trash2, X } from 'lucide-react';
import { GRANTABLE_PERMISSIONS } from '../../admin/adminMockData';
import { useRoleStore } from '../../../store/roleStore';
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

function rolePermissionCodes(roleId: string, roles: ReturnType<typeof useRoleStore.getState>['roles']): string[] {
  const role = roles.find(r => r.id === roleId);
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
  const roles = useRoleStore(s => s.roles);

  const existing = positionForm.positionId
    ? positions.find(p => p.id === positionForm.positionId)
    : null;

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [codeTouched, setCodeTouched] = useState(false);
  const [departmentId, setDepartmentId] = useState('');
  const [reportsToId, setReportsToId] = useState<string | null>(null);
  const [type, setType] = useState<PositionType>('unique');
  const [capacity, setCapacity] = useState(1);
  const [status, setStatus] = useState<EntityStatus>('active');
  const [coverageType, setCoverageType] = useState<'position' | 'department'>('department');
  const [primaryCoverageId, setPrimaryCoverageId] = useState('');
  const [secondaryCoverageIds, setSecondaryCoverageIds] = useState<string[]>([]);
  const [secondaryPickerOpen, setSecondaryPickerOpen] = useState(false);
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
      setDescription(existing.description ?? '');
      setCodeTouched(true);
      setDepartmentId(existing.departmentId);
      setReportsToId(existing.reportsToPositionId);
      setType(existing.type);
      setCapacity(existing.capacity);
      setStatus(existing.status);
      setCoverageType(existing.coverageType ?? 'department');
      setPrimaryCoverageId(existing.primaryCoverageId ?? existing.departmentId);
      setSecondaryCoverageIds(existing.secondaryCoverageIds ?? []);
      setSecondaryPickerOpen(false);
      setGrantSystemAccess(true);
      setAccessRoleId(cfg?.roleId ?? 'role-employee');
      setAccessArea(cfg?.accessArea ?? 'none');
      setSelectedDepartmentIds(cfg?.departmentIds ?? []);
      setSelectedPositionIds(cfg?.positionIds ?? []);
      setRequiresApproval(cfg?.requiresApproval ?? false);
    } else {
      setName('');
      setCode('');
      setDescription('');
      setCodeTouched(false);
      setDepartmentId(positionForm.departmentId ?? '');
      setReportsToId(positionForm.reportsToPositionId);
      setType('unique');
      setCapacity(1);
      setStatus('active');
      setCoverageType(positionForm.reportsToPositionId ? 'position' : 'department');
      setPrimaryCoverageId(positionForm.reportsToPositionId ?? positionForm.departmentId ?? '');
      setSecondaryCoverageIds([]);
      setSecondaryPickerOpen(false);
      setGrantSystemAccess(true);
      setAccessRoleId('role-employee');
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

  useEffect(() => {
    if (!isEdit && reportsToId && coverageType === 'position') {
      setPrimaryCoverageId(reportsToId);
    }
  }, [reportsToId, coverageType, isEdit]);

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
  const selectedRole = accessRoleId ? roles.find(r => r.id === accessRoleId) : null;
  const selectedRolePermissions = useMemo(() => {
    if (!selectedRole) return [];
    return selectedRole.permissionIds
      .map(id => GRANTABLE_PERMISSIONS.find(permission => permission.id === id))
      .filter((permission): permission is (typeof GRANTABLE_PERMISSIONS)[number] => Boolean(permission));
  }, [selectedRole]);
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

    if (!accessRoleId) {
      setError('Select a role for this position.');
      return;
    }

    if (!primaryCoverageId) {
      setError('Select a primary coverage area.');
      return;
    }

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
      description,
      departmentId,
      reportsToPositionId: reportsToId,
      type,
      capacity,
      status
      ,coverageType
      ,primaryCoverageId
      ,secondaryCoverageIds
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

    const role = roles.find(r => r.id === accessRoleId);
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
      permissionCodes: rolePermissionCodes(role.id, roles)
    });
  };

  return (
    <>
      <div className="org-slideover-backdrop" onClick={onClose} aria-hidden />
      <aside className="org-slideover org-slideover--position-form" role="dialog" aria-label={isEdit ? 'Edit position' : 'Add position'}>
        <header className="org-slideover__header">
          <div className="position-form-title">
            <h2>{isEdit ? 'Edit Position' : 'Create Position'}</h2>
            <p>{isEdit ? 'Update position details, reporting structure and coverage.' : 'Add a new position and define its details, reporting structure and coverage.'}</p>
          </div>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <form className="org-slideover__body position-form-layout" onSubmit={handleSubmit}>
          {error && <div className="org-form-error" role="alert">{error}</div>}

          <div className="org-form-field position-form-field--name">
            <label htmlFor="pos-name">Position Name *</label>
            <input id="pos-name" type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div className="org-form-field position-form-field--code">
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

          <div className="org-form-field position-form-field--description">
            <label htmlFor="pos-description">Description</label>
            <textarea
              id="pos-description"
              value={description}
              onChange={e => setDescription(e.target.value.slice(0, 500))}
              placeholder="Describe this position"
              rows={3}
            />
            <p className="org-form-hint">{description.length}/500</p>
          </div>

          <div className="org-form-field position-form-field--role">
            <label htmlFor="pos-role">Role *</label>
            <select
              id="pos-role"
              value={accessRoleId}
              onChange={event => {
                setAccessRoleId(event.target.value);
                setGrantSystemAccess(Boolean(event.target.value));
              }}
              required
            >
              <option value="">Select role</option>
              {roles.filter(role => role.active).map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            {selectedRole && (
              <div className="position-role-preview">
                <div className="position-role-preview__head">
                  <div><strong>{selectedRole.name}</strong><span>{selectedRole.description}</span></div>
                  <span>{selectedRolePermissions.length} permissions</span>
                </div>
                <div className="position-role-preview__cards">
                  {selectedRolePermissions.map(permission => (
                    <article className="position-role-permission-card" key={permission.id}>
                      <span>{permission.module}</span>
                      <strong>{permission.description}</strong>
                    </article>
                  ))}
                </div>
                {selectedRolePermissions.length === 0 && <p className="org-form-hint">This role has no elevated permissions.</p>}
              </div>
            )}
          </div>

          <div className="org-form-field position-form-field--department">
            <label htmlFor="pos-dept">Department *</label>
            <select id="pos-dept" value={departmentId} onChange={e => setDepartmentId(e.target.value)} required>
              <option value="">Select department</option>
              {activeDepartments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="org-form-field position-form-field--manager">
            <label htmlFor="pos-reports" className="org-label-with-info">
              Reporting Manager *
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

          <div className="org-form-field position-form-field--type">
            <label htmlFor="pos-type">Type</label>
            <select id="pos-type" value={type} onChange={e => setType(e.target.value as PositionType)}>
              <option value="unique">Unique (capacity 1)</option>
              <option value="pooled">Pooled</option>
            </select>
          </div>

          {type === 'pooled' && (
            <div className="org-form-field position-form-field--capacity">
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

          <div className="org-form-field position-form-field--status">
            <label>Status *</label>
            <div className="position-status-options">
              <label><input type="radio" name="position-status" checked={status === 'active'} onChange={() => setStatus('active')} /> Active</label>
              <label><input type="radio" name="position-status" checked={status === 'inactive'} onChange={() => setStatus('inactive')} /> Inactive</label>
            </div>
          </div>

          <section className="position-coverage-editor" aria-labelledby="position-coverage-title">
            <div className="position-coverage-editor__head">
              <div>
                <h3 id="position-coverage-title">Coverage Area *</h3>
                <p>Define the primary and secondary coverage for this position.</p>
              </div>
            </div>

            <div className="position-coverage-editor__modes">
              <button
                type="button"
                className={coverageType === 'position' ? 'is-active' : ''}
                onClick={() => {
                  setCoverageType('position');
                  setPrimaryCoverageId('');
                  setSecondaryCoverageIds([]);
                }}
              >
                <span className="position-coverage-mode__icon"><BriefcaseBusiness size={18} /></span>
                <span><strong>Based on Position</strong><small>Set coverage area for this position</small></span>
              </button>
              <button
                type="button"
                className={coverageType === 'department' ? 'is-active' : ''}
                onClick={() => {
                  setCoverageType('department');
                  setPrimaryCoverageId(departmentId);
                  setSecondaryCoverageIds([]);
                }}
              >
                <span className="position-coverage-mode__icon"><Building2 size={18} /></span>
                <span><strong>Based on Department</strong><small>Set coverage area for departments</small></span>
              </button>
            </div>

            <div className="position-coverage-editor__columns">
              <div className="org-form-field">
                <label htmlFor="primary-coverage">Primary Coverage Area</label>
                <select
                  id="primary-coverage"
                  value={primaryCoverageId}
                  onChange={event => {
                    const id = event.target.value;
                    setPrimaryCoverageId(id);
                    setSecondaryCoverageIds(ids => ids.filter(value => value !== id));
                  }}
                  required
                >
                  <option value="">Select primary coverage</option>
                  {(coverageType === 'department' ? activeDepartments : activePositions).map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
                {primaryCoverageId && (() => {
                  const primaryItem = (coverageType === 'department' ? activeDepartments : activePositions)
                    .find(item => item.id === primaryCoverageId);
                  return primaryItem ? (
                    <div className="position-coverage-row position-coverage-row--primary">
                      <span className="position-coverage-row__icon">
                        {coverageType === 'department' ? <Building2 size={14} /> : <BriefcaseBusiness size={14} />}
                      </span>
                      <span className="position-coverage-row__copy">
                        <strong>{primaryItem.name}</strong>
                        <small>{coverageType === 'department' ? 'Department' : 'Position'}</small>
                      </span>
                      <span className="position-coverage-row__badge position-coverage-row__badge--primary">Primary</span>
                    </div>
                  ) : null;
                })()}
                <p className="org-form-hint">Main coverage area for this position.</p>
              </div>

              <div className="position-coverage-editor__secondary">
                <div className="position-coverage-editor__secondary-head">
                  <span>Secondary Coverage Areas</span>
                  <button type="button" onClick={() => setSecondaryPickerOpen(open => !open)}>
                    <Plus size={13} /> Add Secondary
                  </button>
                </div>
                {secondaryPickerOpen && (
                  <select
                    value=""
                    onChange={event => {
                      if (event.target.value) {
                        setSecondaryCoverageIds(ids => [...new Set([...ids, event.target.value])]);
                        setSecondaryPickerOpen(false);
                      }
                    }}
                  >
                    <option value="">Select secondary coverage</option>
                    {(coverageType === 'department' ? activeDepartments : activePositions)
                      .filter(item => item.id !== primaryCoverageId && !secondaryCoverageIds.includes(item.id))
                      .map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                )}
                {secondaryCoverageIds.map(id => {
                  const item = (coverageType === 'department' ? activeDepartments : activePositions).find(entry => entry.id === id);
                  if (!item) return null;
                  return (
                    <div className="position-coverage-row" key={item.id}>
                      <span className="position-coverage-row__icon">
                        {coverageType === 'department' ? <Building2 size={14} /> : <BriefcaseBusiness size={14} />}
                      </span>
                      <span className="position-coverage-row__copy"><strong>{item.name}</strong><small>{coverageType === 'department' ? 'Department' : 'Position'}</small></span>
                      <span className="position-coverage-row__badge">Secondary</span>
                      <button type="button" title="Make primary" onClick={() => {
                        setSecondaryCoverageIds(ids => [primaryCoverageId, ...ids.filter(value => value !== item.id)].filter(Boolean));
                        setPrimaryCoverageId(item.id);
                      }}><ArrowLeftRight size={13} /></button>
                      <button type="button" className="is-danger" title="Remove" onClick={() => setSecondaryCoverageIds(ids => ids.filter(value => value !== item.id))}><Trash2 size={13} /></button>
                    </div>
                  );
                })}
                {secondaryCoverageIds.length === 0 && !secondaryPickerOpen && <p className="org-form-hint">You can add multiple secondary coverage areas.</p>}
              </div>
            </div>
          </section>

          <label className="position-access-toggle position-access-toggle--legacy">
            <input
              type="checkbox"
              checked={grantSystemAccess}
              onChange={e => setGrantSystemAccess(e.target.checked)}
            />
            Grant system access from this position
          </label>

          {grantSystemAccess && (
            <div className="schedules-cfg-form-section position-access-config position-access-config--legacy">
              <label className="schedules-cfg-form-section__label">Access from this position</label>
              <p className="org-form-hint">
                People assigned to this position can receive a role and employee access from this template.
              </p>

              <div className="org-form-field">
                <label htmlFor="pos-access-role">Role granted</label>
                <select id="pos-access-role" value={accessRoleId} onChange={e => setAccessRoleId(e.target.value)}>
                  <option value="">Select role</option>
                  {roles.filter(r => r.active).map(r => (
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
