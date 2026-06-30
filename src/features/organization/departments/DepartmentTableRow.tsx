import React, { useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Building2,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Pencil,
  Plus
} from 'lucide-react';
import type { DepartmentTreeNode } from '../../../types/organization';
import {
  getDepartmentHeadEmployee,
  getDepartmentPositionCount
} from '../../../utils/organizationUtils';
import { useOrganizationStore } from '../../../store/organizationStore';

interface DepartmentTableRowProps {
  node: DepartmentTreeNode;
  depth: number;
  isLast: boolean;
  hasChildren: boolean;
  isCollapsed: boolean;
  isParent: boolean;
  openMenuId: string | null;
  onToggleMenu: (id: string | null) => void;
}

function getDepartmentIssue(
  headPosition: ReturnType<typeof getDepartmentHeadEmployee>['headPosition'],
  headEmployee: ReturnType<typeof getDepartmentHeadEmployee>['headEmployee']
): string | null {
  if (headPosition && !headEmployee) return 'Head vacant';
  if (!headPosition) return 'No head position';
  return null;
}

export const DepartmentTableRow: React.FC<DepartmentTableRowProps> = ({
  node,
  depth,
  isLast,
  hasChildren,
  isCollapsed,
  isParent,
  openMenuId,
  onToggleMenu
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    departments,
    positions,
    assignments,
    employees,
    toggleDeptCollapse,
    openCreateDepartment,
    openEditDepartment
  } = useOrganizationStore();

  const positionCount = getDepartmentPositionCount(node.id, positions);
  const { headPosition, headEmployee } = getDepartmentHeadEmployee(
    node.id,
    departments,
    positions,
    assignments,
    employees
  );
  const issue = getDepartmentIssue(headPosition, headEmployee);
  const menuOpen = openMenuId === node.id;

  const headRole = headPosition?.name ?? '—';
  const headPerson = headEmployee
    ? `${headEmployee.firstName} ${headEmployee.lastName}`
    : '—';

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

  return (
    <tr className={`dept-table__row${isParent ? ' dept-table__row--parent' : ''}`}>
      <td className="dept-table__cell dept-table__cell--name">
        <div className="dept-table__name-wrap">
          {depth > 0 &&
            Array.from({ length: depth }).map((_, level) => (
              <span
                key={level}
                className={`dept-table__indent${
                  level === depth - 1 ? ` dept-table__indent--branch${isLast ? '-last' : ''}` : ''
                }`}
                aria-hidden
              />
            ))}

          {hasChildren ? (
            <button
              type="button"
              className="dept-table__expand"
              onClick={() => toggleDeptCollapse(node.id)}
              aria-label={isCollapsed ? `Expand ${node.name}` : `Collapse ${node.name}`}
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
          ) : (
            <span className="dept-table__expand-spacer" />
          )}

          <Building2 size={14} className="dept-table__building-icon" aria-hidden />
          <span className="dept-table__name">{node.name}</span>
        </div>
      </td>
      <td className="dept-table__cell">
        <code className="dept-table__code">{node.code}</code>
      </td>
      <td className="dept-table__cell dept-table__cell--num">{positionCount}</td>
      <td className="dept-table__cell">{headRole}</td>
      <td className="dept-table__cell dept-table__cell--person">{headPerson}</td>
      <td className="dept-table__cell">
        {issue ? (
          <span className="dept-table__issue">
            <AlertTriangle size={13} aria-hidden />
            {issue}
          </span>
        ) : (
          <span className="dept-table__issue-empty">—</span>
        )}
      </td>
      <td className="dept-table__cell">
        <span className={`dept-table__status dept-table__status--${node.status}`}>
          {node.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="dept-table__cell dept-table__cell--actions">
        <div className="dept-table__menu-wrap" ref={menuRef}>
          <button
            type="button"
            className="dept-table__menu-trigger"
            onClick={() => onToggleMenu(menuOpen ? null : node.id)}
            aria-label={`Actions for ${node.name}`}
            aria-expanded={menuOpen}
          >
            <MoreVertical size={15} />
          </button>
          {menuOpen && (
            <div className="dept-table__menu" role="menu">
              <button
                type="button"
                role="menuitem"
                className="dept-table__menu-item"
                onClick={() => {
                  onToggleMenu(null);
                  openEditDepartment(node.id);
                }}
              >
                <Pencil size={14} />
                Edit department
              </button>
              <button
                type="button"
                role="menuitem"
                className="dept-table__menu-item"
                onClick={() => {
                  onToggleMenu(null);
                  openCreateDepartment(node.id);
                }}
              >
                <Plus size={14} />
                Add child department
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};
