import React, { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, Building2, Plus, Trash2, UserCircle2, X } from 'lucide-react';
import { useRoleStore } from '../../../store/roleStore';
import { useOrganizationStore } from '../../../store/organizationStore';
import {
  getDepartmentName,
  getValidReportingTargets,
  suggestDepartmentCode,
} from '../../../utils/organizationUtils';
import type { CoverageTarget, EntityStatus } from '../../../types/organization';

interface PositionFormPanelProps {
  onClose: () => void;
}

type CoverageModeOption = 'position' | 'department';

function serializeForm(values: {
  name: string;
  description: string;
  departmentId: string;
  reportsToId: string | null;
  roleId: string;
  status: EntityStatus;
  coverageMode: CoverageModeOption;
  primaryCoverageId: string;
  secondaryCoverageIds: string[];
}): string {
  return JSON.stringify({ ...values, secondaryCoverageIds: [...values.secondaryCoverageIds].sort() });
}

export const PositionFormPanel: React.FC<PositionFormPanelProps> = ({ onClose }) => {
  const { positionForm, positions, departments, savePosition } = useOrganizationStore();
  const roles = useRoleStore(state => state.roles);

  const existing = positionForm.positionId ? positions.find(position => position.id === positionForm.positionId) ?? null : null;
  const isEdit = positionForm.mode === 'edit';
  const activeRoles = useMemo(() => roles.filter(role => role.active), [roles]);
  const activeDepartments = useMemo(() => departments.filter(department => department.status === 'active'), [departments]);
  const reportingTargets = useMemo(
    () =>
      getValidReportingTargets(positionForm.positionId, positions).filter(
        position => position.status === 'active' && position.type === 'unique',
      ),
    [positionForm.positionId, positions],
  );

  const initialCoverageMode: CoverageModeOption =
    existing?.coverageMode === 'department' || existing?.primaryCoverage?.type === 'department' ? 'department' : 'position';

  const initialValues = useMemo(
    () => ({
      name: existing?.name ?? '',
      description: existing?.description ?? '',
      departmentId: existing?.departmentId ?? positionForm.departmentId ?? '',
      reportsToId: existing?.reportsToPositionId ?? positionForm.reportsToPositionId ?? null,
      roleId: existing?.roleId === 'role-employee' ? '' : existing?.roleId ?? '',
      status: existing?.status ?? 'active',
      primaryCoverageId:
        existing?.primaryCoverage && (existing.primaryCoverage.type === initialCoverageMode || !existing.coverageMode)
          ? existing.primaryCoverage.id
          : '',
      secondaryCoverageIds: existing?.secondaryCoverage
        .filter(target => target.type === initialCoverageMode)
        .map(target => target.id) ?? [],
    }),
    [existing, initialCoverageMode, positionForm.departmentId, positionForm.reportsToPositionId],
  );

  const [name, setName] = useState(initialValues.name);
  const [description, setDescription] = useState(initialValues.description);
  const [departmentId, setDepartmentId] = useState(initialValues.departmentId);
  const [reportsToId, setReportsToId] = useState<string | null>(initialValues.reportsToId);
  const [roleId, setRoleId] = useState(initialValues.roleId);
  const [status, setStatus] = useState<EntityStatus>(initialValues.status);
  const [coverageMode, setCoverageMode] = useState<CoverageModeOption>(initialCoverageMode);
  const [primaryCoverageId, setPrimaryCoverageId] = useState(initialValues.primaryCoverageId);
  const [secondaryCoverageIds, setSecondaryCoverageIds] = useState<string[]>(initialValues.secondaryCoverageIds);
  const [error, setError] = useState<string | null>(null);
  const [initialSnapshot] = useState(() =>
    serializeForm({
      name: initialValues.name,
      description: initialValues.description,
      departmentId: initialValues.departmentId,
      reportsToId: initialValues.reportsToId,
      roleId: initialValues.roleId,
      status: initialValues.status,
      coverageMode: initialCoverageMode,
      primaryCoverageId: initialValues.primaryCoverageId,
      secondaryCoverageIds: initialValues.secondaryCoverageIds,
    }),
  );

  const selectedDepartment = activeDepartments.find(department => department.id === departmentId) ?? null;
  const selectedRole = roleId ? activeRoles.find(role => role.id === roleId) ?? null : null;

  const coverageOptions = useMemo(() => {
    if (coverageMode === 'department') {
      return activeDepartments.map(department => ({
        id: department.id,
        label: department.name,
        meta: department.parentDepartmentId
          ? `Child of ${activeDepartments.find(item => item.id === department.parentDepartmentId)?.name ?? 'Department'}`
          : 'Department coverage',
      }));
    }

    const scopedPositions = reportingTargets.filter(position => !departmentId || position.departmentId === departmentId);
    return scopedPositions.map(position => ({
      id: position.id,
      label: position.name,
      meta: getDepartmentName(position.departmentId, departments),
    }));
  }, [activeDepartments, coverageMode, departments, departmentId, reportingTargets]);

  const validCoverageIds = useMemo(() => new Set(coverageOptions.map(option => option.id)), [coverageOptions]);
  const resolvedPrimaryCoverageId = primaryCoverageId && validCoverageIds.has(primaryCoverageId) ? primaryCoverageId : '';
  const resolvedSecondaryCoverageIds = secondaryCoverageIds.filter(
    id => validCoverageIds.has(id) && id !== resolvedPrimaryCoverageId,
  );

  const currentSnapshot = serializeForm({
    name,
    description,
    departmentId,
    reportsToId,
    roleId,
    status,
    coverageMode,
    primaryCoverageId: resolvedPrimaryCoverageId,
    secondaryCoverageIds: resolvedSecondaryCoverageIds,
  });
  const dirty = currentSnapshot !== initialSnapshot;

  useEffect(() => {
    if (!dirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  const attemptClose = () => {
    if (dirty && !window.confirm('You have unsaved changes. Do you want to leave without saving?')) {
      return;
    }
    onClose();
  };

  const buildUniquePositionCode = () => {
    const departmentPrefix = selectedDepartment?.code?.trim().toUpperCase();
    const positionPrefix = suggestDepartmentCode(name);
    const base = [departmentPrefix, positionPrefix].filter(Boolean).join('-').slice(0, 20) || positionPrefix || 'POSITION';
    let candidate = base;
    let index = 2;

    while (positions.some(position => position.id !== positionForm.positionId && position.code.trim().toUpperCase() === candidate)) {
      const suffix = `-${index}`;
      candidate = `${base.slice(0, Math.max(1, 20 - suffix.length))}${suffix}`;
      index += 1;
    }

    return candidate;
  };

  const addSecondaryCoverage = () => {
    const next = coverageOptions.find(
      option => option.id !== resolvedPrimaryCoverageId && !resolvedSecondaryCoverageIds.includes(option.id),
    );
    if (!next) return;
    setSecondaryCoverageIds([...resolvedSecondaryCoverageIds, next.id]);
  };

  const updateSecondaryCoverage = (index: number, value: string) => {
    setSecondaryCoverageIds(current => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };

  const removeSecondaryCoverage = (index: number) => {
    setSecondaryCoverageIds(current => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const primaryCoverageOption = coverageOptions.find(option => option.id === resolvedPrimaryCoverageId) ?? null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) return setError('Position name is required.');
    if (!departmentId) return setError('Department is required.');
    if (resolvedPrimaryCoverageId && resolvedSecondaryCoverageIds.includes(resolvedPrimaryCoverageId)) {
      return setError('Primary coverage area cannot also be selected as backup coverage.');
    }

    const selectedRoleId = roleId || 'role-employee';
    const resolvedRole = activeRoles.find(role => role.id === selectedRoleId);
    if (!resolvedRole) return setError('Select a valid role.');

    const targetType = coverageMode === 'department' ? 'department' : 'position';
    const secondaryCoverage: CoverageTarget[] = resolvedSecondaryCoverageIds.map(id => ({ type: targetType, id }));
    const finalCode = existing?.code || buildUniquePositionCode();

    const result = savePosition({
      id: positionForm.positionId ?? undefined,
      name,
      code: finalCode,
      description,
      departmentId,
      reportsToPositionId: reportsToId,
      type: existing?.type ?? 'unique',
      capacity: existing?.capacity ?? 1,
      status,
      roleId: selectedRoleId,
      coverageEnabled: Boolean(resolvedPrimaryCoverageId || resolvedSecondaryCoverageIds.length > 0),
      coverageMode,
      primaryCoverage: resolvedPrimaryCoverageId ? { type: targetType, id: resolvedPrimaryCoverageId } : null,
      secondaryCoverage,
    });

    if (!result.ok) {
      setError(result.error ?? 'Failed to save position.');
    }
  };

  return (
    <>
      <div className="org-slideover-backdrop" onClick={attemptClose} aria-hidden />
      <aside className="org-slideover org-slideover--position-form" role="dialog" aria-label={isEdit ? 'Edit position' : 'Create position'}>
        <header className="org-slideover__header">
          <div className="position-form-title">
            <h2>{isEdit ? 'Edit Position' : 'Create Position'}</h2>
            <p>Add a position and connect its department, role, reporting structure, and approval coverage.</p>
          </div>
          <button type="button" className="org-slideover__close" onClick={attemptClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <form className="org-slideover__body position-form-layout" onSubmit={handleSubmit}>
          {error && (
            <div className="org-form-error" role="alert">
              {error}
            </div>
          )}

          <div className="org-form-field position-form-field--name">
            <label htmlFor="position-name">Name *</label>
            <input
              id="position-name"
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder="Enter position name"
              maxLength={100}
            />
          </div>

          <div className="org-form-field position-form-field--description">
            <label htmlFor="position-description">Description</label>
            <textarea
              id="position-description"
              rows={4}
              value={description}
              onChange={event => setDescription(event.target.value)}
              placeholder="Enter position description"
              maxLength={500}
            />
            <p className="org-form-hint position-form-field__counter">{description.length}/500</p>
          </div>

          <div className="org-form-field position-form-field--status">
            <label>Status *</label>
            <div className="position-status-options" role="radiogroup" aria-label="Position status">
              <label>
                <input type="radio" checked={status === 'active'} onChange={() => setStatus('active')} />
                <span>Active</span>
              </label>
              <label>
                <input type="radio" checked={status === 'inactive'} onChange={() => setStatus('inactive')} />
                <span>Inactive</span>
              </label>
            </div>
          </div>

          <div className="org-form-field position-form-field--role">
            <label htmlFor="position-role">Role</label>
            <select id="position-role" value={roleId} onChange={event => setRoleId(event.target.value)}>
              <option value="">Employee Role (default)</option>
              {activeRoles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            <p className="org-form-hint">
              {selectedRole
                ? `This position will inherit the ${selectedRole.name} permissions.`
                : 'If you skip role selection, the default Employee role will be applied.'}
            </p>
          </div>

          <div className="org-form-field position-form-field--department">
            <label htmlFor="position-department">Department *</label>
            <select id="position-department" value={departmentId} onChange={event => setDepartmentId(event.target.value)}>
              <option value="">Select department</option>
              {activeDepartments.map(department => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <div className="org-form-field position-form-field--manager">
            <label htmlFor="position-reporting-manager">Reporting Manager</label>
            <select
              id="position-reporting-manager"
              value={reportsToId ?? ''}
              onChange={event => setReportsToId(event.target.value || null)}
            >
              <option value="">Select reporting manager</option>
              {reportingTargets.map(position => (
                <option key={position.id} value={position.id}>
                  {position.name} — {getDepartmentName(position.departmentId, departments)}
                </option>
              ))}
            </select>
            <p className="org-form-hint">This identifies where approvals and reporting requests should move in the hierarchy.</p>
          </div>

          <div className="position-coverage-toggle">
            <label>Coverage Area</label>
            <p className="org-form-hint">
              If the reporting manager does not have the right permission, requests can route to the selected coverage area.
            </p>
            <div className="position-coverage-editor__modes">
              <button
                type="button"
                className={coverageMode === 'position' ? 'is-active' : ''}
                onClick={() => setCoverageMode('position')}
              >
                <span className="position-coverage-mode__icon">
                  <BriefcaseBusiness size={16} />
                </span>
                <span>
                  <strong>Based on Position</strong>
                  <small>Use positions inside the selected department as approval backup.</small>
                </span>
              </button>
              <button
                type="button"
                className={coverageMode === 'department' ? 'is-active' : ''}
                onClick={() => setCoverageMode('department')}
              >
                <span className="position-coverage-mode__icon">
                  <Building2 size={16} />
                </span>
                <span>
                  <strong>Based on Department</strong>
                  <small>Route requests to coverage departments when permissions are missing.</small>
                </span>
              </button>
            </div>
          </div>

          <div className="position-coverage-editor">
            <div className="position-coverage-editor__columns">
              <div>
                <div className="org-form-field org-form-field--compact">
                  <label htmlFor="position-primary-coverage">
                    Primary Coverage Area {coverageMode === 'position' ? '(Position)' : '(Department)'}
                  </label>
                  <select
                    id="position-primary-coverage"
                    value={resolvedPrimaryCoverageId}
                    onChange={event => setPrimaryCoverageId(event.target.value)}
                  >
                    <option value="">Select primary coverage area</option>
                    {coverageOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {primaryCoverageOption ? (
                  <div className="position-coverage-row position-coverage-row--primary">
                    <div className="position-coverage-row__icon">
                      {coverageMode === 'position' ? <UserCircle2 size={15} /> : <Building2 size={15} />}
                    </div>
                    <div className="position-coverage-row__copy">
                      <strong>{primaryCoverageOption.label}</strong>
                      <small>{primaryCoverageOption.meta}</small>
                    </div>
                    <span className="position-coverage-row__badge position-coverage-row__badge--primary">Primary</span>
                  </div>
                ) : (
                  <p className="org-form-hint">
                    {coverageMode === 'position'
                      ? 'Choose the main backup position for approval routing.'
                      : 'Choose the main backup department for approval routing.'}
                  </p>
                )}
              </div>

              <div className="position-coverage-editor__secondary">
                <div className="position-coverage-editor__secondary-head">
                  <span>Secondary Coverage Areas</span>
                  <button
                    type="button"
                    onClick={addSecondaryCoverage}
                    disabled={
                      coverageOptions.filter(
                        option =>
                          option.id !== resolvedPrimaryCoverageId && !resolvedSecondaryCoverageIds.includes(option.id),
                      ).length === 0
                    }
                  >
                    <Plus size={13} /> Add Secondary
                  </button>
                </div>

                {resolvedSecondaryCoverageIds.length === 0 ? (
                  <p className="org-form-hint position-coverage-empty">
                    Add one or more backup coverage areas when approvals may need to move across teams.
                  </p>
                ) : (
                  resolvedSecondaryCoverageIds.map((coverageId, index) => {
                    const currentOption = coverageOptions.find(option => option.id === coverageId);
                    const availableOptions = coverageOptions.filter(
                      option =>
                        option.id !== resolvedPrimaryCoverageId &&
                        (option.id === coverageId || !resolvedSecondaryCoverageIds.includes(option.id)),
                    );

                    return (
                      <div key={`${coverageId}-${index}`} className="position-coverage-row">
                        <div className="position-coverage-row__icon">
                          {coverageMode === 'position' ? <UserCircle2 size={15} /> : <Building2 size={15} />}
                        </div>
                        <div className="position-coverage-row__copy">
                          <select
                            className="position-coverage-row__select"
                            value={coverageId}
                            onChange={event => updateSecondaryCoverage(index, event.target.value)}
                          >
                            {availableOptions.map(option => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <small>{currentOption?.meta ?? 'Coverage selection'}</small>
                        </div>
                        <span className="position-coverage-row__badge">Secondary</span>
                        <button type="button" className="is-danger" onClick={() => removeSecondaryCoverage(index)} aria-label="Remove secondary coverage">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <footer className="org-slideover__footer">
            <button type="button" className="org-btn org-btn--ghost" onClick={attemptClose}>
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
