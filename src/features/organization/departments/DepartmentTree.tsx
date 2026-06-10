import React, { useMemo } from 'react';
import { buildDepartmentTree } from '../../../utils/organizationUtils';
import { useOrganizationStore } from '../../../store/organizationStore';
import { DepartmentNode } from './DepartmentNode';

export const DepartmentTree: React.FC = () => {
  const departments = useOrganizationStore(s => s.departments);
  const tree = useMemo(() => buildDepartmentTree(departments), [departments]);

  if (tree.length === 0) {
    return (
      <div className="dept-tree-empty">
        <p>No departments yet. Create your first department to get started.</p>
      </div>
    );
  }

  return (
    <div className="dept-tree">
      {tree.map(node => (
        <DepartmentNode key={node.id} node={node} />
      ))}
    </div>
  );
};
