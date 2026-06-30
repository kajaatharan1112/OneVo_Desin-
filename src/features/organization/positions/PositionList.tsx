import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useOrganizationStore } from '../../../store/organizationStore';
import { useRoleStore } from '../../../store/roleStore';
import { getDepartmentName } from '../../../utils/organizationUtils';
import type { CoverageTarget } from '../../../types/organization';

export const PositionList: React.FC = () => {
  const { positions, departments, openEditPosition, deactivatePosition } = useOrganizationStore();
  const roles = useRoleStore(state => state.roles);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [viewPositionId, setViewPositionId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return positions.filter(position => {
      if (deptFilter && position.departmentId !== deptFilter) return false;
      if (!q) return true;
      return (
        position.name.toLowerCase().includes(q) ||
        position.code.toLowerCase().includes(q) ||
        getDepartmentName(position.departmentId, departments).toLowerCase().includes(q)
      );
    });
  }, [positions, departments, search, deptFilter]);

  const viewPosition = viewPositionId ? positions.find(position => position.id === viewPositionId) ?? null : null;

  const roleNameFor = (roleId: string) => roles.find(role => role.id === roleId)?.name ?? 'Employee Role';

  return (
    <>
      <div className="dept-table-panel position-table-panel">
        <div className="dept-table__toolbar">
          <div className="dept-table__toolbar-left">
            <div className="dept-table__search">
              <Search size={15} aria-hidden />
              <input
                type="search"
                placeholder="Search positions..."
                value={search}
                onChange={event => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="dept-table__toolbar-right">
            <select
              className="dept-table__filter"
              value={deptFilter}
              onChange={event => setDeptFilter(event.target.value)}
              aria-label="Filter by department"
            >
              <option value="">All departments</option>
              {departments.map(department => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="dept-table__wrap">
          <table className="dept-table position-table">
            <thead>
              <tr>
                <th>Position</th>
                <th>Department</th>
                <th>Reporting Manager</th>
                <th>Role</th>
                <th>Primary Coverage Area</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="dept-table__empty">
                    No positions match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map(position => {
                  const reportsTo = position.reportsToPositionId
                    ? positions.find(item => item.id === position.reportsToPositionId)?.name ?? '—'
                    : '—';
                  const primaryCoverage = resolveCoverageLabel(position.primaryCoverage, positions, departments);

                  return (
                    <tr
                      key={position.id}
                      className="position-table__row position-table__row--clickable"
                      onClick={() => setViewPositionId(position.id)}
                    >
                      <td className="dept-table__cell">
                        <div className="cfg-table__name">{position.name}</div>
                      </td>
                      <td className="dept-table__cell">{getDepartmentName(position.departmentId, departments)}</td>
                      <td className="dept-table__cell">{reportsTo}</td>
                      <td className="dept-table__cell">{roleNameFor(position.roleId || 'role-employee')}</td>
                      <td className="dept-table__cell">{primaryCoverage}</td>
                      <td className="dept-table__cell">
                        <span className={`dept-table__status dept-table__status--${position.status}`}>
                          {position.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <footer className="dept-table__footer">
          <div className="dept-table__stats">
            <span>{filtered.length} position{filtered.length === 1 ? '' : 's'}</span>
          </div>
        </footer>
      </div>

      {viewPosition && (
        <PositionViewPanel
          position={viewPosition}
          departments={departments}
          positions={positions}
          roleName={roleNameFor(viewPosition.roleId || 'role-employee')}
          onClose={() => setViewPositionId(null)}
          onEdit={() => {
            setViewPositionId(null);
            openEditPosition(viewPosition.id);
          }}
          onDeactivate={() => {
            const result = deactivatePosition(viewPosition.id);
            if (result.ok) {
              setViewPositionId(null);
            } else if (result.error) {
              window.alert(result.error);
            }
          }}
        />
      )}
    </>
  );
};

function PositionViewPanel({
  position,
  departments,
  positions,
  roleName,
  onClose,
  onEdit,
  onDeactivate,
}: {
  position: ReturnType<typeof useOrganizationStore.getState>['positions'][0];
  departments: ReturnType<typeof useOrganizationStore.getState>['departments'];
  positions: ReturnType<typeof useOrganizationStore.getState>['positions'];
  roleName: string;
  onClose: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
}) {
  const reportsTo = position.reportsToPositionId
    ? positions.find(item => item.id === position.reportsToPositionId)?.name ?? '—'
    : '—';
  const primaryCoverage = resolveCoverageLabel(position.primaryCoverage, positions, departments);
  const backupCoverage = position.secondaryCoverage
    .map(target => resolveCoverageLabel(target, positions, departments))
    .filter(value => value !== '—');

  return (
    <>
      <div className="org-slideover-backdrop" onClick={onClose} aria-hidden />
      <aside className="org-slideover org-slideover--narrow" role="dialog" aria-label="View position">
        <header className="org-slideover__header">
          <h2>{position.name}</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="org-slideover__body">
          <div className="admin-detail-grid">
            <div className="admin-detail-row">
              <span className="admin-detail-row__label">Position</span>
              <span className="admin-detail-row__value">{position.name}</span>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-row__label">Department</span>
              <span className="admin-detail-row__value">{getDepartmentName(position.departmentId, departments)}</span>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-row__label">Reporting Manager</span>
              <span className="admin-detail-row__value">{reportsTo}</span>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-row__label">Role</span>
              <span className="admin-detail-row__value">{roleName}</span>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-row__label">Primary Coverage Area</span>
              <span className="admin-detail-row__value">{primaryCoverage}</span>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-row__label">Backup Coverage Area</span>
              <span className="admin-detail-row__value">{backupCoverage.length ? backupCoverage.join(', ') : '—'}</span>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-row__label">Status</span>
              <span className="admin-detail-row__value">{position.status === 'active' ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>

        <footer className="org-slideover__footer">
          <button type="button" className="org-btn org-btn--ghost" onClick={onClose}>
            Close
          </button>
          <button type="button" className="org-btn org-btn--secondary" onClick={onEdit}>
            Edit
          </button>
          <button type="button" className="org-btn org-btn--primary" onClick={onDeactivate}>
            Deactivate
          </button>
        </footer>
      </aside>
    </>
  );
}

function resolveCoverageLabel(
  target: CoverageTarget | null | undefined,
  positions: ReturnType<typeof useOrganizationStore.getState>['positions'],
  departments: ReturnType<typeof useOrganizationStore.getState>['departments'],
): string {
  if (!target) return '—';
  if (target.type === 'department') {
    return departments.find(item => item.id === target.id)?.name ?? '—';
  }
  if (target.type === 'position') {
    return positions.find(item => item.id === target.id)?.name ?? '—';
  }
  return '—';
}
