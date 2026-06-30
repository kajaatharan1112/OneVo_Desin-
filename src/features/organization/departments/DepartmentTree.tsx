import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  ListFilter,
  Search
} from 'lucide-react';
import { buildDepartmentTree, getDepartmentHeadEmployee } from '../../../utils/organizationUtils';
import { useOrganizationStore } from '../../../store/organizationStore';
import type { DepartmentTreeNode } from '../../../types/organization';
import { DepartmentTableRow } from './DepartmentTableRow';

interface FlatRow {
  node: DepartmentTreeNode;
  depth: number;
  isLast: boolean;
  hasChildren: boolean;
}

function flattenVisibleTree(
  nodes: DepartmentTreeNode[],
  collapsedIds: Set<string>,
  depth = 0
): FlatRow[] {
  const rows: FlatRow[] = [];

  nodes.forEach((node, index) => {
    const hasChildren = node.children.length > 0;
    const isLast = index === nodes.length - 1;
    rows.push({ node, depth, isLast, hasChildren });

    if (hasChildren && !collapsedIds.has(node.id)) {
      rows.push(...flattenVisibleTree(node.children, collapsedIds, depth + 1));
    }
  });

  return rows;
}

function collectExpandableIds(nodes: DepartmentTreeNode[]): string[] {
  const ids: string[] = [];
  const walk = (items: DepartmentTreeNode[]) => {
    for (const item of items) {
      if (item.children.length > 0) {
        ids.push(item.id);
        walk(item.children);
      }
    }
  };
  walk(nodes);
  return ids;
}

function nodeHasIssue(
  node: DepartmentTreeNode,
  departments: ReturnType<typeof useOrganizationStore.getState>['departments'],
  positions: ReturnType<typeof useOrganizationStore.getState>['positions'],
  assignments: ReturnType<typeof useOrganizationStore.getState>['assignments'],
  employees: ReturnType<typeof useOrganizationStore.getState>['employees']
): boolean {
  const { headPosition, headEmployee } = getDepartmentHeadEmployee(
    node.id,
    departments,
    positions,
    assignments,
    employees
  );
  return Boolean(headPosition && !headEmployee) || !headPosition;
}

function nodeMatchesSearch(node: DepartmentTreeNode, query: string): boolean {
  const q = query.toLowerCase();
  return node.name.toLowerCase().includes(q) || node.code.toLowerCase().includes(q);
}

export const DepartmentTree: React.FC = () => {
  const {
    departments,
    positions,
    assignments,
    employees,
    collapsedDeptIds
  } = useOrganizationStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [issuesOnly, setIssuesOnly] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const tree = useMemo(() => buildDepartmentTree(departments), [departments]);

  const visibleRows = useMemo(() => {
    const rows = flattenVisibleTree(tree, collapsedDeptIds);
    const q = search.trim();

    return rows.filter(({ node }) => {
      if (statusFilter !== 'all' && node.status !== statusFilter) return false;
      if (issuesOnly && !nodeHasIssue(node, departments, positions, assignments, employees)) {
        return false;
      }
      if (q && !nodeMatchesSearch(node, q)) return false;
      return true;
    });
  }, [
    tree,
    collapsedDeptIds,
    search,
    statusFilter,
    issuesOnly,
    departments,
    positions,
    assignments,
    employees
  ]);

  const totalDepartments = departments.length;
  const totalPositions = positions.length;
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(visibleRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = visibleRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const expandAll = () => {
    useOrganizationStore.setState({ collapsedDeptIds: new Set() });
  };

  const collapseAll = () => {
    useOrganizationStore.setState({
      collapsedDeptIds: new Set(collectExpandableIds(tree))
    });
  };

  if (tree.length === 0) {
    return (
      <div className="dept-tree-empty">
        <p>No departments yet. Create your first department to get started.</p>
      </div>
    );
  }

  return (
    <div className="dept-table-panel">
      <div className="dept-table__toolbar">
        <div className="dept-table__toolbar-left">
          <div className="dept-table__search">
            <Search size={15} aria-hidden />
            <input
              type="search"
              placeholder="Search departments..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            className="dept-table__filter"
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <label className="dept-table__checkbox">
            <input
              type="checkbox"
              checked={issuesOnly}
              onChange={e => {
                setIssuesOnly(e.target.checked);
                setPage(1);
              }}
            />
            Show issues only
          </label>
        </div>

        <div className="dept-table__toolbar-right">
          <button type="button" className="dept-table__toolbar-btn" onClick={expandAll}>
            <ChevronsDownUp size={14} aria-hidden />
            Expand All
          </button>
          <button type="button" className="dept-table__toolbar-btn" onClick={collapseAll}>
            <ChevronsUpDown size={14} aria-hidden />
            Collapse All
          </button>
          <button
            type="button"
            className="dept-table__toolbar-btn dept-table__toolbar-btn--icon"
            aria-label="Table settings"
          >
            <ListFilter size={15} />
          </button>
        </div>
      </div>

      <div className="dept-table__wrap">
        <table className="dept-table">
          <thead>
            <tr>
              <th>
                Department
                <ArrowUpDown size={12} className="dept-table__sort-icon" aria-hidden />
              </th>
              <th>
                Code
                <ArrowUpDown size={12} className="dept-table__sort-icon" aria-hidden />
              </th>
              <th>
                Positions
                <ArrowUpDown size={12} className="dept-table__sort-icon" aria-hidden />
              </th>
              <th>
                Head Role
                <ArrowUpDown size={12} className="dept-table__sort-icon" aria-hidden />
              </th>
              <th>
                Head Person
                <ArrowUpDown size={12} className="dept-table__sort-icon" aria-hidden />
              </th>
              <th>Issues</th>
              <th>
                Status
                <ArrowUpDown size={12} className="dept-table__sort-icon" aria-hidden />
              </th>
              <th className="dept-table__th-actions" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {pagedRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="dept-table__empty">
                  No departments match the current filters.
                </td>
              </tr>
            ) : (
              pagedRows.map(({ node, depth, isLast, hasChildren }) => (
                <DepartmentTableRow
                  key={node.id}
                  node={node}
                  depth={depth}
                  isLast={isLast}
                  hasChildren={hasChildren}
                  isCollapsed={collapsedDeptIds.has(node.id)}
                  isParent={hasChildren}
                  openMenuId={openMenuId}
                  onToggleMenu={setOpenMenuId}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <footer className="dept-table__footer">
        <div className="dept-table__stats">
          <span>Total Departments: {totalDepartments}</span>
          <span className="dept-table__stats-sep">·</span>
          <span>Total Positions: {totalPositions}</span>
        </div>

        <div className="dept-table__pagination">
          <button
            type="button"
            className="dept-table__page-btn"
            disabled={currentPage <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="dept-table__page-current">{currentPage}</span>
          <button
            type="button"
            className="dept-table__page-btn"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </footer>
    </div>
  );
};
