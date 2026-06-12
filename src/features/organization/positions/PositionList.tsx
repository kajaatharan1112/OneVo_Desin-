import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, MoreHorizontal, Pencil, Search, UserPlus, X } from 'lucide-react';
import { useOrganizationStore } from '../../../store/organizationStore';
import {
  formatAssignedEmployeeLabel,
  getDepartmentName,
  getPositionAssignBlockReason,
  getPositionOccupancy,
  getReportingManagerPreviewForPosition
} from '../../../utils/organizationUtils';

export const PositionList: React.FC = () => {
  const {
    positions,
    departments,
    assignments,
    employees,
    openEditPosition,
    openAssignEmployee
  } = useOrganizationStore();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [viewPositionId, setViewPositionId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return positions.filter(p => {
      if (deptFilter && p.departmentId !== deptFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        getDepartmentName(p.departmentId, departments).toLowerCase().includes(q)
      );
    });
  }, [positions, departments, search, deptFilter]);

  const viewPosition = viewPositionId
    ? positions.find(p => p.id === viewPositionId) ?? null
    : null;

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
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="dept-table__toolbar-right">
            <select
              className="dept-table__filter"
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              aria-label="Filter by department"
            >
              <option value="">All departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="dept-table__wrap">
          <table className="dept-table position-table">
            <thead>
              <tr>
                <th>Position</th>
                <th>Code</th>
                <th>Department</th>
                <th>Reports To</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Assigned Employee</th>
                <th>Status</th>
                <th className="dept-table__th-actions" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="dept-table__empty">
                    No positions match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map(position => (
                  <PositionRow
                    key={position.id}
                    position={position}
                    positions={positions}
                    departments={departments}
                    assignments={assignments}
                    employees={employees}
                    openMenuId={openMenuId}
                    onToggleMenu={setOpenMenuId}
                    onView={() => setViewPositionId(position.id)}
                    onEdit={() => openEditPosition(position.id)}
                    onAssign={() => openAssignEmployee(position.id)}
                  />
                ))
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
          positions={positions}
          departments={departments}
          assignments={assignments}
          employees={employees}
          onClose={() => setViewPositionId(null)}
          onEdit={() => {
            setViewPositionId(null);
            openEditPosition(viewPosition.id);
          }}
          onAssign={() => {
            setViewPositionId(null);
            openAssignEmployee(viewPosition.id);
          }}
        />
      )}
    </>
  );
};

function PositionRow({
  position,
  positions,
  departments,
  assignments,
  employees,
  openMenuId,
  onToggleMenu,
  onView,
  onEdit,
  onAssign
}: {
  position: ReturnType<typeof useOrganizationStore.getState>['positions'][0];
  positions: ReturnType<typeof useOrganizationStore.getState>['positions'];
  departments: ReturnType<typeof useOrganizationStore.getState>['departments'];
  assignments: ReturnType<typeof useOrganizationStore.getState>['assignments'];
  employees: ReturnType<typeof useOrganizationStore.getState>['employees'];
  openMenuId: string | null;
  onToggleMenu: (id: string | null) => void;
  onView: () => void;
  onEdit: () => void;
  onAssign: () => void;
}) {
  const occupancy = getPositionOccupancy(position.id, position, assignments);
  const assignedLabel = formatAssignedEmployeeLabel(position, assignments, employees);
  const reportsTo = position.reportsToPositionId
    ? positions.find(p => p.id === position.reportsToPositionId)
    : null;
  const assignBlockReason = getPositionAssignBlockReason(position, assignments);
  const isVacant = position.type === 'unique' && assignedLabel === 'Vacant';
  const menuOpen = openMenuId === position.id;
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onToggleMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, onToggleMenu]);

  const handleAssign = (event: React.MouseEvent) => {
    event.stopPropagation();
    onToggleMenu(null);
    onAssign();
  };

  return (
    <tr className={`dept-table__row position-table__row${menuOpen ? ' position-table__row--menu-open' : ''}`}>
      <td className="dept-table__cell position-table__cell--name">{position.name}</td>
      <td className="dept-table__cell">
        <span className="position-table__code-pill">{position.code}</span>
      </td>
      <td className="dept-table__cell">{getDepartmentName(position.departmentId, departments)}</td>
      <td className="dept-table__cell dept-table__cell--person">
        {reportsTo?.name ?? '—'}
      </td>
      <td className="dept-table__cell">
        <span className={`position-list__type position-list__type--${position.type}`}>
          {position.type === 'unique' ? 'Unique' : 'Pooled'}
        </span>
      </td>
      <td className="dept-table__cell dept-table__cell--num">
        {occupancy.count} / {occupancy.capacity}
      </td>
      <td
        className={[
          'dept-table__cell',
          'position-table__cell--assigned',
          isVacant && 'position-table__cell--vacant'
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {assignedLabel}
      </td>
      <td className="dept-table__cell">
        <span className={`dept-table__status dept-table__status--${position.status}`}>
          {position.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="dept-table__cell dept-table__cell--actions">
        <div className="position-table__actions">
          <button
            type="button"
            className={`position-table__action-btn${assignBlockReason ? ' position-table__action-btn--blocked' : ''}`}
            onClick={handleAssign}
            title={assignBlockReason ?? 'Assign employee'}
            aria-label="Assign"
          >
            <UserPlus size={14} />
          </button>
          <button
            type="button"
            className="position-table__action-btn"
            onClick={e => {
              e.stopPropagation();
              onView();
            }}
            title="View position"
            aria-label="View"
          >
            <Eye size={14} />
          </button>
          <button
            type="button"
            className="position-table__action-btn"
            onClick={e => {
              e.stopPropagation();
              onEdit();
            }}
            title="Edit position"
            aria-label="Edit"
          >
            <Pencil size={14} />
          </button>
          <div className="dept-table__menu-wrap position-table__menu-wrap" ref={menuRef}>
            <button
              type="button"
              className="dept-table__menu-trigger"
              onClick={e => {
                e.stopPropagation();
                onToggleMenu(menuOpen ? null : position.id);
              }}
              aria-expanded={menuOpen}
              aria-label="More actions"
            >
              <MoreHorizontal size={15} />
            </button>
            {menuOpen && (
              <div className="dept-table__menu" role="menu">
                <button
                  type="button"
                  className="dept-table__menu-item"
                  role="menuitem"
                  onClick={handleAssign}
                  title={assignBlockReason ?? undefined}
                >
                  <UserPlus size={14} />
                  Assign
                </button>
                <button
                  type="button"
                  className="dept-table__menu-item"
                  role="menuitem"
                  onClick={e => {
                    e.stopPropagation();
                    onToggleMenu(null);
                    onView();
                  }}
                >
                  <Eye size={14} />
                  View
                </button>
                <button
                  type="button"
                  className="dept-table__menu-item"
                  role="menuitem"
                  onClick={e => {
                    e.stopPropagation();
                    onToggleMenu(null);
                    onEdit();
                  }}
                >
                  <Pencil size={14} />
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

function PositionViewPanel({
  position,
  positions,
  departments,
  assignments,
  employees,
  onClose,
  onEdit,
  onAssign
}: {
  position: ReturnType<typeof useOrganizationStore.getState>['positions'][0];
  positions: ReturnType<typeof useOrganizationStore.getState>['positions'];
  departments: ReturnType<typeof useOrganizationStore.getState>['departments'];
  assignments: ReturnType<typeof useOrganizationStore.getState>['assignments'];
  employees: ReturnType<typeof useOrganizationStore.getState>['employees'];
  onClose: () => void;
  onEdit: () => void;
  onAssign: () => void;
}) {
  const reportsTo = position.reportsToPositionId
    ? positions.find(p => p.id === position.reportsToPositionId)
    : null;
  const occupancy = getPositionOccupancy(position.id, position, assignments);
  const assignedLabel = formatAssignedEmployeeLabel(position, assignments, employees);
  const rmPreview = getReportingManagerPreviewForPosition(position, positions, assignments, employees);
  const assignBlockReason = getPositionAssignBlockReason(position, assignments);

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
          <div className="org-form-field">
            <label>Code</label>
            <span className="org-form-readonly">{position.code}</span>
          </div>
          <div className="org-form-field">
            <label>Department</label>
            <span className="org-form-readonly">
              {getDepartmentName(position.departmentId, departments)}
            </span>
          </div>
          <div className="org-form-field">
            <label>Reports To</label>
            <span className="org-form-readonly">{reportsTo?.name ?? '—'}</span>
          </div>
          <div className="org-form-field">
            <label>Type</label>
            <span className="org-form-readonly">
              {position.type === 'unique' ? 'Unique' : 'Pooled'}
            </span>
          </div>
          <div className="org-form-field">
            <label>Capacity</label>
            <span className="org-form-readonly">
              {occupancy.count} / {occupancy.capacity}
            </span>
          </div>
          <div className="org-form-field">
            <label>Assigned Employee</label>
            <span className="org-form-readonly">{assignedLabel}</span>
          </div>
          <div className="org-form-field">
            <label>Reporting Manager</label>
            <span className="org-form-readonly">{rmPreview.label}</span>
            {rmPreview.warning && (
              <p className="org-form-hint org-form-hint--warning">{rmPreview.warning}</p>
            )}
          </div>
          <div className="org-form-field">
            <label>Status</label>
            <span className="org-form-readonly">
              {position.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>

          <footer className="org-slideover__footer">
            <button type="button" className="org-btn org-btn--ghost" onClick={onClose}>
              Close
            </button>
            <button type="button" className="org-btn org-btn--secondary" onClick={onEdit}>
              Edit
            </button>
            <button
              type="button"
              className="org-btn org-btn--primary"
              onClick={onAssign}
              title={assignBlockReason ?? undefined}
            >
              Assign
            </button>
          </footer>
        </div>
      </aside>
    </>
  );
}
