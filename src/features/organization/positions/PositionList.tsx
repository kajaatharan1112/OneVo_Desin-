import React, { useMemo, useState } from 'react';
import { Pencil, Search, UserPlus } from 'lucide-react';
import { useOrganizationStore } from '../../../store/organizationStore';
import {
  getDepartmentName,
  getPositionOccupancy,
  getPositionOccupants
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

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const p of filtered) {
      const key = p.departmentId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return map;
  }, [filtered]);

  const showGrouped = !deptFilter && !search;

  return (
    <div className="position-list">
      <div className="position-list__toolbar">
        <div className="position-list__search">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search positions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="position-list__filter"
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
        >
          <option value="">All departments</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <span className="position-list__count">{filtered.length} positions</span>
      </div>

      <div className="position-list__table-wrap">
        <table className="position-list__table">
          <thead>
            <tr>
              <th>Position</th>
              <th>Code</th>
              <th>Department</th>
              <th>Type</th>
              <th>Occupancy</th>
              <th>Reports to</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {showGrouped
              ? Array.from(grouped.entries()).flatMap(([deptId, deptPositions]) => [
                  <tr key={`group-${deptId}`} className="position-list__group-row">
                    <td colSpan={8}>{getDepartmentName(deptId, departments)}</td>
                  </tr>,
                  ...deptPositions.map(position => (
                    <PositionRow
                      key={position.id}
                      position={position}
                      positions={positions}
                      departments={departments}
                      assignments={assignments}
                      employees={employees}
                      onEdit={() => openEditPosition(position.id)}
                      onAssign={() => openAssignEmployee(position.id)}
                    />
                  ))
                ])
              : filtered.map(position => (
                  <PositionRow
                    key={position.id}
                    position={position}
                    positions={positions}
                    departments={departments}
                    assignments={assignments}
                    employees={employees}
                    onEdit={() => openEditPosition(position.id)}
                    onAssign={() => openAssignEmployee(position.id)}
                  />
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function PositionRow({
  position,
  positions,
  departments,
  assignments,
  employees,
  onEdit,
  onAssign
}: {
  position: ReturnType<typeof useOrganizationStore.getState>['positions'][0];
  positions: ReturnType<typeof useOrganizationStore.getState>['positions'];
  departments: ReturnType<typeof useOrganizationStore.getState>['departments'];
  assignments: ReturnType<typeof useOrganizationStore.getState>['assignments'];
  employees: ReturnType<typeof useOrganizationStore.getState>['employees'];
  onEdit: () => void;
  onAssign: () => void;
}) {
  const occupancy = getPositionOccupancy(position.id, position, assignments);
  const occupants = getPositionOccupants(position.id, assignments, employees);
  const reportsTo = position.reportsToPositionId
    ? positions.find(p => p.id === position.reportsToPositionId)
    : null;

  return (
    <tr className="position-list__row">
      <td className="position-list__name">{position.name}</td>
      <td><code>{position.code}</code></td>
      <td>{getDepartmentName(position.departmentId, departments)}</td>
      <td>
        <span className={`position-list__type position-list__type--${position.type}`}>
          {position.type}
        </span>
      </td>
      <td>
        {occupancy.count}/{occupancy.capacity}
        {occupants.length > 0 && (
          <span className="position-list__occupants">
            {' '}({occupants.map(e => e.firstName).join(', ')})
          </span>
        )}
      </td>
      <td className="position-list__rm">{reportsTo?.name ?? '— (root)'}</td>
      <td>
        <span className={`position-list__status position-list__status--${position.status}`}>
          {position.status}
        </span>
      </td>
      <td>
        <div className="position-list__actions">
          <button type="button" onClick={onEdit} title="Edit" aria-label="Edit">
            <Pencil size={14} />
          </button>
          <button type="button" onClick={onAssign} title="Assign employee" aria-label="Assign">
            <UserPlus size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
