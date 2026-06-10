import React from 'react';
import { ChevronDown, ChevronRight, Pencil, Plus } from 'lucide-react';
import type { DepartmentTreeNode } from '../../../types/organization';
import {
  getDepartmentHeadEmployee,
  getDepartmentPositionCount
} from '../../../utils/organizationUtils';
import { useOrganizationStore } from '../../../store/organizationStore';

interface DepartmentNodeProps {
  node: DepartmentTreeNode;
  depth?: number;
}

export const DepartmentNode: React.FC<DepartmentNodeProps> = ({ node, depth = 0 }) => {
  const {
    departments,
    positions,
    assignments,
    employees,
    collapsedDeptIds,
    toggleDeptCollapse,
    openCreateDepartment,
    openEditDepartment
  } = useOrganizationStore();

  const isCollapsed = collapsedDeptIds.has(node.id);
  const hasChildren = node.children.length > 0;
  const positionCount = getDepartmentPositionCount(node.id, positions);
  const { headPosition, headEmployee } = getDepartmentHeadEmployee(
    node.id,
    departments,
    positions,
    assignments,
    employees
  );

  const headPositionName = headPosition?.name ?? 'No head position';
  const headEmployeeName = headPosition
    ? headEmployee
      ? `${headEmployee.firstName} ${headEmployee.lastName}`
      : 'Head position vacant'
    : '—';

  return (
    <div className="dept-node" style={{ marginLeft: depth > 0 ? 24 : 0 }}>
      <div className="dept-node__card">
        <div className="dept-node__header">
          {hasChildren ? (
            <button
              type="button"
              className="dept-node__collapse"
              onClick={() => toggleDeptCollapse(node.id)}
              aria-label={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
            </button>
          ) : (
            <span className="dept-node__collapse-spacer" />
          )}

          <div className="dept-node__info">
            <div className="dept-node__title-row">
              <span className="dept-node__name">{node.name}</span>
              <code className="dept-node__code">{node.code}</code>
              <span className={`dept-node__badge dept-node__badge--${node.status}`}>
                {node.status}
              </span>
            </div>
            <div className="dept-node__meta">
              <span>{positionCount} position{positionCount !== 1 ? 's' : ''}</span>
              <span className="dept-node__divider">·</span>
              <span>Head: {headPositionName}</span>
              <span className="dept-node__divider">·</span>
              <span className={!headEmployee && headPosition ? 'dept-node__vacant' : ''}>
                {headEmployeeName}
              </span>
            </div>
          </div>

          <div className="dept-node__actions">
            <button
              type="button"
              className="dept-node__action"
              onClick={() => openCreateDepartment(node.id)}
              title="Add child department"
              aria-label={`Add child under ${node.name}`}
            >
              <Plus size={15} />
            </button>
            <button
              type="button"
              className="dept-node__action"
              onClick={() => openEditDepartment(node.id)}
              title="Edit department"
              aria-label={`Edit ${node.name}`}
            >
              <Pencil size={15} />
            </button>
          </div>
        </div>
      </div>

      {hasChildren && !isCollapsed && (
        <div className="dept-node__children">
          {node.children.map(child => (
            <DepartmentNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
